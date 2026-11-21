import { test, expect } from '@playwright/test';

// Create a mock user in localStorage to bypass signup
async function createMockUser(page) {
  await page.goto('http://localhost:5173');
  await page.waitForLoadState('networkidle');
  
  // Set up a mock user in localStorage
  await page.evaluate(() => {
    const mockUser = {
      id: 'test-user-' + Date.now(),
      name: 'E2E Test User',
      email: 'e2e-test@bharatlingo.test',
      preferredLanguage: 'en',
      learningLanguage: null,
      goal: null,
      level: 'beginner',
      dailyGoal: 10,
      ageRange: 'adult',
      assessmentScore: null,
      hasCompletedAssessment: false,
      learningPlan: null,
      xp: 0,
      gems: 0,
      streak: 0,
      lastActiveDate: null,
      completedLessons: [],
      languageProgress: {},
      legendaryCompleted: [],
      vocabulary: {},
      achievements: [],
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem('bharatlingo_user', JSON.stringify(mockUser));
    localStorage.setItem('bharatlingo_site_lang', 'en');
  });
  
  // Reload to pick up the user
  await page.reload();
  await page.waitForLoadState('networkidle');
}

async function completeOnboarding(page) {
  // Navigate to onboarding
  await page.goto('http://localhost:5173/onboarding');
  await page.waitForLoadState('networkidle');
  
  // Step 1: Age - "How old are you?"
  await expect(page.locator('text=How old are you?')).toBeVisible({ timeout: 10000 });
  await page.click('button:has-text("18 – 25")'); // age_18_25 renders as "18 – 25"
  await page.click('text=Continue');
  
  // Step 2: Preferred Language - "What's your preferred language?"
  await expect(page.locator("text=What's your preferred language?")).toBeVisible({ timeout: 10000 });
  
  // Debug: check what buttons are available
  const buttons = await page.locator('button').allTextContents();
  console.log('Step 2 Available buttons:', buttons);
  
  await page.click('button:has-text("English")');
  await page.click('text=Continue');
  
  // Step 3: Target Language - "What do you want to learn?"
  await expect(page.locator("text=What do you want to learn?")).toBeVisible({ timeout: 10000 });
  
  // Debug: check what buttons are available
  const buttons3 = await page.locator('button').allTextContents();
  console.log('Step 3 Available buttons:', buttons3);
  
  await page.click('button:has-text("Hindi")');
  await page.click('text=Continue');
  
  // Step 4: Goal - "What's your goal?"
  await expect(page.locator("text=What's your goal?")).toBeVisible({ timeout: 10000 });
  
  // Debug: check what buttons are available
  const buttons4 = await page.locator('button').allTextContents();
  console.log('Step 4 Available buttons:', buttons4);
  
  await page.click('button:has-text("Conversation")');
  await page.click('text=Find My Level');
  
  // Should redirect to assessment
  await page.waitForURL(/.*assessment/, { timeout: 15000 });
}

async function completeAssessment(page) {
  // Wait for first question
  await expect(page.locator('text=Question 1')).toBeVisible({ timeout: 15000 });
  
  // Answer all questions (15 questions)
  for (let i = 1; i <= 15; i++) {
    await expect(page.locator(`text=Question ${i}`)).toBeVisible({ timeout: 10000 });
    
    // Try to click first answer option
    const options = page.locator('button[class*="border"]');
    if (await options.count() > 0) {
      await options.first().click();
    }
    
    // Click Next/Continue
    if (i < 15) {
      await page.click('button:has-text("Next")');
    } else {
      await page.click('button:has-text("See My Learning Plan")');
    }
    
    await page.waitForTimeout(300);
  }
  
  // Should show personalized plan
  await expect(page.locator('text=Your Personalized Path')).toBeVisible({ timeout: 15000 });
}

async function continueToDashboard(page) {
  await page.click('button:has-text("Start Learning")');
  await page.waitForURL(/.*dashboard/, { timeout: 15000 });
  await expect(page.locator('text=Continue Learning')).toBeVisible({ timeout: 10000 });
}

test.describe('BharatLingo Onboarding & Assessment Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
  });

  test('Welcome page loads', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Indian Languages');
    await expect(page.locator('text=Get Started Free')).toBeVisible();
  });

  test('Get Started Free opens signup', async ({ page }) => {
    await page.click('text=Get Started Free');
    await expect(page).toHaveURL(/.*signup/);
    await expect(page.locator('h1')).toContainText('Create account');
  });

  test('Onboarding page loads with mock user', async ({ page }) => {
    await createMockUser(page);
    await page.goto('http://localhost:5173/onboarding');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('text=How old are you?')).toBeVisible({ timeout: 10000 });
  });

  test('Onboarding steps work and preserve selections', async ({ page }) => {
    await createMockUser(page);
    await completeOnboarding(page);
    // Should be on assessment page now
    await expect(page).toHaveURL(/.*assessment/);
  });

  test('Assessment questions load correctly', async ({ page }) => {
    await createMockUser(page);
    await completeOnboarding(page);
    
    // Wait for assessment to load
    await expect(page.locator('text=Find Your Starting Level')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Question')).toBeVisible({ timeout: 10000 });
  });

  test('Assessment can be completed and submitted', async ({ page }) => {
    await createMockUser(page);
    await completeOnboarding(page);
    await completeAssessment(page);
    // Should show personalized plan
    await expect(page.locator('text=Your Personalized Path')).toBeVisible({ timeout: 15000 });
  });

  test('Personalized learning plan appears', async ({ page }) => {
    await createMockUser(page);
    await completeOnboarding(page);
    await completeAssessment(page);
    
    await expect(page.locator('text=Your Personalized Path')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Starting Level')).toBeVisible();
    await expect(page.locator('text=Goal')).toBeVisible();
    await expect(page.locator('text=Daily Practice')).toBeVisible();
  });

  test('Start Learning opens the dashboard', async ({ page }) => {
    await createMockUser(page);
    await completeOnboarding(page);
    await completeAssessment(page);
    await continueToDashboard(page);
    await expect(page.locator('text=Continue Learning')).toBeVisible({ timeout: 10000 });
  });

  test('Refreshing browser does not incorrectly restart onboarding', async ({ page }) => {
    await createMockUser(page);
    await completeOnboarding(page);
    
    // Now refresh
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Should still be on assessment, not onboarding
    await expect(page).toHaveURL(/.*assessment/);
  });

  test('Existing completed users can still access their dashboard', async ({ page }) => {
    await createMockUser(page);
    await completeOnboarding(page);
    await completeAssessment(page);
    await continueToDashboard(page);
    
    // Now navigate directly to dashboard
    await page.goto('http://localhost:5173/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Should be on dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('text=Continue Learning')).toBeVisible({ timeout: 10000 });
  });
});