# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\onboarding-e2e.spec.mjs >> BharatLingo Onboarding & Assessment Flow >> Existing completed users can still access their dashboard
- Location: tests\onboarding-e2e.spec.mjs:201:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button:has-text("English")')

```

# Page snapshot

```yaml
- generic [ref=f3e4]:
  - generic [ref=f3e6]:
    - generic [ref=f3e7]: भा
    - generic [ref=f3e8]: Step 2 of 4
  - generic [ref=f3e16]:
    - generic [ref=f3e17]:
      - heading "What's your preferred language?" [level=2] [ref=f3e18]
      - paragraph [ref=f3e19]: Questions and instructions will be shown in this language
      - generic [ref=f3e20]:
        - generic [ref=f3e21] [cursor=pointer]:
          - generic [ref=f3e22]: 🇮🇳
          - heading "Hindi" [level=3] [ref=f3e23]
          - paragraph [ref=f3e24]: हिन्दी
        - generic [ref=f3e25] [cursor=pointer]:
          - generic [ref=f3e29]: 🇬🇧
          - heading "English" [level=3] [ref=f3e30]
          - paragraph [ref=f3e31]: English
        - generic [ref=f3e32] [cursor=pointer]:
          - generic [ref=f3e33]: 🇮🇳
          - heading "Marathi" [level=3] [ref=f3e34]
          - paragraph [ref=f3e35]: मराठी
        - generic [ref=f3e36] [cursor=pointer]:
          - generic [ref=f3e37]: 🇮🇳
          - heading "Tamil" [level=3] [ref=f3e38]
          - paragraph [ref=f3e39]: தமிழ்
        - generic [ref=f3e40] [cursor=pointer]:
          - generic [ref=f3e41]: 🇮🇳
          - heading "Telugu" [level=3] [ref=f3e42]
          - paragraph [ref=f3e43]: తెలుగు
        - generic [ref=f3e44] [cursor=pointer]:
          - generic [ref=f3e45]: 🇮🇳
          - heading "Bengali" [level=3] [ref=f3e46]
          - paragraph [ref=f3e47]: বাংলা
        - generic [ref=f3e48] [cursor=pointer]:
          - generic [ref=f3e49]: 🇮🇳
          - heading "Punjabi" [level=3] [ref=f3e50]
          - paragraph [ref=f3e51]: ਪੰਜਾਬੀ
        - generic [ref=f3e52] [cursor=pointer]:
          - generic [ref=f3e53]: 🇮🇳
          - heading "Gujarati" [level=3] [ref=f3e54]
          - paragraph [ref=f3e55]: ગુજરાતી
    - generic [ref=f3e56]:
      - button "back" [ref=f3e57] [cursor=pointer]
      - button "Continue" [active] [ref=f3e58] [cursor=pointer]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | // Create a mock user in localStorage to bypass signup
  4   | async function createMockUser(page) {
  5   |   await page.goto('http://localhost:5173');
  6   |   await page.waitForLoadState('networkidle');
  7   |   
  8   |   // Set up a mock user in localStorage
  9   |   await page.evaluate(() => {
  10  |     const mockUser = {
  11  |       id: 'test-user-' + Date.now(),
  12  |       name: 'E2E Test User',
  13  |       email: 'e2e-test@bharatlingo.test',
  14  |       preferredLanguage: 'en',
  15  |       learningLanguage: null,
  16  |       goal: null,
  17  |       level: 'beginner',
  18  |       dailyGoal: 10,
  19  |       ageRange: 'adult',
  20  |       assessmentScore: null,
  21  |       hasCompletedAssessment: false,
  22  |       learningPlan: null,
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
> 60  |   await page.click('button:has-text("English")');
      |              ^ Error: page.click: Test timeout of 30000ms exceeded.
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
  123 |     await page.goto('http://localhost:5173');
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
```