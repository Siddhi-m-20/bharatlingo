# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\onboarding-e2e.spec.mjs >> BharatLingo Onboarding & Assessment Flow >> Get Started Free opens signup
- Location: tests\onboarding-e2e.spec.mjs:132:3

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5173/
Call log:
  - navigating to "http://localhost:5173/", waiting until "load"

```

# Test source

```ts
  23  |       xp: 0,
  24  |       gems: 0,
  25  |       streak: 0,
  26  |       lastActiveDate: null,
  27  |       completedLessons: [],
  28  |       languageProgress: {},
  29  |       legendaryCompleted: [],
  30  |       vocabulary: {},
  31  |       achievements: [],
  32  |       createdAt: new Date().toISOString(),
  33  |     };
  34  |     localStorage.setItem('bharatlingo_user', JSON.stringify(mockUser));
  35  |     localStorage.setItem('bharatlingo_site_lang', 'en');
  36  |   });
  37  |   
  38  |   // Reload to pick up the user
  39  |   await page.reload();
  40  |   await page.waitForLoadState('networkidle');
  41  | }
  42  | 
  43  | async function completeOnboarding(page) {
  44  |   // Navigate to onboarding
  45  |   await page.goto('http://localhost:5173/onboarding');
  46  |   await page.waitForLoadState('networkidle');
  47  |   
  48  |   // Step 1: Age - "How old are you?"
  49  |   await expect(page.locator('text=How old are you?')).toBeVisible({ timeout: 10000 });
  50  |   await page.click('button:has-text("18 – 25")'); // age_18_25 renders as "18 – 25"
  51  |   await page.click('text=Continue');
  52  |   
  53  |   // Step 2: Preferred Language - "What's your preferred language?"
  54  |   await expect(page.locator("text=What's your preferred language?")).toBeVisible({ timeout: 10000 });
  55  |   
  56  |   // Debug: check what buttons are available
  57  |   const buttons = await page.locator('button').allTextContents();
  58  |   console.log('Step 2 Available buttons:', buttons);
  59  |   
  60  |   await page.click('button:has-text("English")');
  61  |   await page.click('text=Continue');
  62  |   
  63  |   // Step 3: Target Language - "What do you want to learn?"
  64  |   await expect(page.locator("text=What do you want to learn?")).toBeVisible({ timeout: 10000 });
  65  |   
  66  |   // Debug: check what buttons are available
  67  |   const buttons3 = await page.locator('button').allTextContents();
  68  |   console.log('Step 3 Available buttons:', buttons3);
  69  |   
  70  |   await page.click('button:has-text("Hindi")');
  71  |   await page.click('text=Continue');
  72  |   
  73  |   // Step 4: Goal - "What's your goal?"
  74  |   await expect(page.locator("text=What's your goal?")).toBeVisible({ timeout: 10000 });
  75  |   
  76  |   // Debug: check what buttons are available
  77  |   const buttons4 = await page.locator('button').allTextContents();
  78  |   console.log('Step 4 Available buttons:', buttons4);
  79  |   
  80  |   await page.click('button:has-text("Conversation")');
  81  |   await page.click('text=Find My Level');
  82  |   
  83  |   // Should redirect to assessment
  84  |   await page.waitForURL(/.*assessment/, { timeout: 15000 });
  85  | }
  86  | 
  87  | async function completeAssessment(page) {
  88  |   // Wait for first question
  89  |   await expect(page.locator('text=Question 1')).toBeVisible({ timeout: 15000 });
  90  |   
  91  |   // Answer all questions (15 questions)
  92  |   for (let i = 1; i <= 15; i++) {
  93  |     await expect(page.locator(`text=Question ${i}`)).toBeVisible({ timeout: 10000 });
  94  |     
  95  |     // Try to click first answer option
  96  |     const options = page.locator('button[class*="border"]');
  97  |     if (await options.count() > 0) {
  98  |       await options.first().click();
  99  |     }
  100 |     
  101 |     // Click Next/Continue
  102 |     if (i < 15) {
  103 |       await page.click('button:has-text("Next")');
  104 |     } else {
  105 |       await page.click('button:has-text("See My Learning Plan")');
  106 |     }
  107 |     
  108 |     await page.waitForTimeout(300);
  109 |   }
  110 |   
  111 |   // Should show personalized plan
  112 |   await expect(page.locator('text=Your Personalized Path')).toBeVisible({ timeout: 15000 });
  113 | }
  114 | 
  115 | async function continueToDashboard(page) {
  116 |   await page.click('button:has-text("Start Learning")');
  117 |   await page.waitForURL(/.*dashboard/, { timeout: 15000 });
  118 |   await expect(page.locator('text=Continue Learning')).toBeVisible({ timeout: 10000 });
  119 | }
  120 | 
  121 | test.describe('BharatLingo Onboarding & Assessment Flow', () => {
  122 |   test.beforeEach(async ({ page }) => {
> 123 |     await page.goto('http://localhost:5173');
      |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5173/
  124 |     await page.waitForLoadState('networkidle');
  125 |   });
  126 | 
  127 |   test('Welcome page loads', async ({ page }) => {
  128 |     await expect(page.locator('h1')).toContainText('Indian Languages');
  129 |     await expect(page.locator('text=Get Started Free')).toBeVisible();
  130 |   });
  131 | 
  132 |   test('Get Started Free opens signup', async ({ page }) => {
  133 |     await page.click('text=Get Started Free');
  134 |     await expect(page).toHaveURL(/.*signup/);
  135 |     await expect(page.locator('h1')).toContainText('Create account');
  136 |   });
  137 | 
  138 |   test('Onboarding page loads with mock user', async ({ page }) => {
  139 |     await createMockUser(page);
  140 |     await page.goto('http://localhost:5173/onboarding');
  141 |     await page.waitForLoadState('networkidle');
  142 |     
  143 |     await expect(page.locator('text=How old are you?')).toBeVisible({ timeout: 10000 });
  144 |   });
  145 | 
  146 |   test('Onboarding steps work and preserve selections', async ({ page }) => {
  147 |     await createMockUser(page);
  148 |     await completeOnboarding(page);
  149 |     // Should be on assessment page now
  150 |     await expect(page).toHaveURL(/.*assessment/);
  151 |   });
  152 | 
  153 |   test('Assessment questions load correctly', async ({ page }) => {
  154 |     await createMockUser(page);
  155 |     await completeOnboarding(page);
  156 |     
  157 |     // Wait for assessment to load
  158 |     await expect(page.locator('text=Find Your Starting Level')).toBeVisible({ timeout: 15000 });
  159 |     await expect(page.locator('text=Question')).toBeVisible({ timeout: 10000 });
  160 |   });
  161 | 
  162 |   test('Assessment can be completed and submitted', async ({ page }) => {
  163 |     await createMockUser(page);
  164 |     await completeOnboarding(page);
  165 |     await completeAssessment(page);
  166 |     // Should show personalized plan
  167 |     await expect(page.locator('text=Your Personalized Path')).toBeVisible({ timeout: 15000 });
  168 |   });
  169 | 
  170 |   test('Personalized learning plan appears', async ({ page }) => {
  171 |     await createMockUser(page);
  172 |     await completeOnboarding(page);
  173 |     await completeAssessment(page);
  174 |     
  175 |     await expect(page.locator('text=Your Personalized Path')).toBeVisible({ timeout: 15000 });
  176 |     await expect(page.locator('text=Starting Level')).toBeVisible();
  177 |     await expect(page.locator('text=Goal')).toBeVisible();
  178 |     await expect(page.locator('text=Daily Practice')).toBeVisible();
  179 |   });
  180 | 
  181 |   test('Start Learning opens the dashboard', async ({ page }) => {
  182 |     await createMockUser(page);
  183 |     await completeOnboarding(page);
  184 |     await completeAssessment(page);
  185 |     await continueToDashboard(page);
  186 |     await expect(page.locator('text=Continue Learning')).toBeVisible({ timeout: 10000 });
  187 |   });
  188 | 
  189 |   test('Refreshing browser does not incorrectly restart onboarding', async ({ page }) => {
  190 |     await createMockUser(page);
  191 |     await completeOnboarding(page);
  192 |     
  193 |     // Now refresh
  194 |     await page.reload();
  195 |     await page.waitForLoadState('networkidle');
  196 |     
  197 |     // Should still be on assessment, not onboarding
  198 |     await expect(page).toHaveURL(/.*assessment/);
  199 |   });
  200 | 
  201 |   test('Existing completed users can still access their dashboard', async ({ page }) => {
  202 |     await createMockUser(page);
  203 |     await completeOnboarding(page);
  204 |     await completeAssessment(page);
  205 |     await continueToDashboard(page);
  206 |     
  207 |     // Now navigate directly to dashboard
  208 |     await page.goto('http://localhost:5173/dashboard');
  209 |     await page.waitForLoadState('networkidle');
  210 |     
  211 |     // Should be on dashboard
  212 |     await expect(page).toHaveURL(/.*dashboard/);
  213 |     await expect(page.locator('text=Continue Learning')).toBeVisible({ timeout: 10000 });
  214 |   });
  215 | });
```