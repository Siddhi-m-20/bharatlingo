# BharatLingo — Testing Guide

> **For the learner-developer:** This document describes the existing tests, explains what they cover, identifies the gaps, and provides a roadmap for building more reliable test coverage.

---

## Test infrastructure

BharatLingo uses two testing tools:

| Tool | Type of test | Config |
|---|---|---|
| **Node's built-in `node:test`** | Unit tests (no browser) | No config file needed |
| **Playwright** | End-to-end browser tests | `@playwright/test` package |

There is **no unit test runner like Jest or Vitest** configured for the frontend code. This is a gap.

---

## Existing tests

### 1. Push auth unit tests (`tests/pushAuth.test.mjs`)

**Run with:**
```bash
node --test tests/pushAuth.test.mjs
```

**What it tests:**
- Rejects missing bearer tokens with HTTP 401
- Rejects invalid/expired tokens with HTTP 401
- Accepts verified user identity
- Rejects malformed push subscriptions
- Prevents one user's subscription from being used by another
- Rate-limits push sends per verified user (10 per minute)
- Correctly parses Bearer tokens (rejects Basic auth, multi-word tokens)

**Coverage:** 7 tests covering the push authentication logic in `server/services/pushAuth.js`. These are well-written unit tests with no external dependencies.

**Status:** ✅ Runnable without a live server.

---

### 2. Onboarding E2E test (`tests/onboarding-e2e.spec.mjs`)

**Run with:**
```bash
npx playwright test tests/onboarding-e2e.spec.mjs
```
*(Requires the dev server running: `npm run dev`)*

**What it tests:**
- Creates a mock user in localStorage (bypasses real signup)
- Navigates through all 4 onboarding steps
- Navigates through 15 assessment questions
- Verifies the personalized plan screen appears
- Verifies redirect to dashboard on completion

**Status:** ⚠️ Requires running app. Has debug `console.log` statements. Not confirmed to pass on the current codebase without verification.

---

### 3. New user onboarding flow test (`tests/newUserOnboardingFlow.test.mjs`)

**Status:** ⚠️ Similar to above — Playwright test requiring running app. Not confirmed to pass.

---

## How to run tests

```bash
# Unit tests (no server needed):
node --test tests/pushAuth.test.mjs

# E2E tests (requires running dev server):
npm run dev        # in one terminal
npx playwright test tests/onboarding-e2e.spec.mjs  # in another
```

**Playwright setup (first time):**
```bash
npx playwright install chromium
```

---

## Coverage gaps (critical)

The following have zero automated test coverage:

### High risk — no tests

| What needs testing | Why it matters | File |
|---|---|---|
| `mergeUserProfiles()` | The most critical data integrity function — wrong merge loses user progress | `src/services/authUtils.js` |
| `calculateSM2()` | Mathematical core of spaced repetition — a bug silently corrupts review schedules | `src/services/spacedRepetition.js` |
| `hasUserCompletedOnboarding()` | Gates the entire user journey — edge case bug traps users | `src/services/authUtils.js` |
| `hasUserCompletedAssessment()` | Same as above | `src/services/authUtils.js` |
| `getNextAuthRedirect()` | Determines where users go after login | `src/services/authUtils.js` |
| `generateAdaptiveLesson()` | Core lesson generation — produces wrong content if broken | `src/services/lessonEngine.js` |
| `uiTranslations.js` completeness | Missing translation keys fall back silently to English | `src/services/uiTranslations.js` |
| Streak calculation in `updateStreak()` | Streak loss due to timezone edge cases | `src/services/progress.jsx` |

---

## Writing your first unit test

Here is an example unit test for `mergeUserProfiles()` using Node's built-in test runner:

```js
// tests/mergeUserProfiles.test.mjs
import test from 'node:test'
import assert from 'node:assert/strict'
import { mergeUserProfiles } from '../src/services/authUtils.js'

test('merged XP is always the maximum of remote and local', () => {
  const remote = { id: 'u1', email: 'a@b.com', xp: 100, gems: 50, streak: 3,
                   completedLessons: [], achievements: [], legendaryCompleted: [],
                   languageProgress: {} }
  const local  = { id: 'u1', email: 'a@b.com', xp: 150, gems: 30, streak: 5,
                   completedLessons: [], achievements: [], legendaryCompleted: [],
                   languageProgress: {} }

  const merged = mergeUserProfiles(remote, local)

  assert.equal(merged.xp, 150)   // max(100, 150)
  assert.equal(merged.gems, 50)  // max(50, 30)
  assert.equal(merged.streak, 5) // max(3, 5)
})

test('completed lessons are unioned, not replaced', () => {
  const remote = { id: 'u1', email: 'a@b.com', xp: 0, gems: 0, streak: 0,
                   completedLessons: ['lesson-a'], achievements: [],
                   legendaryCompleted: [], languageProgress: {} }
  const local  = { id: 'u1', email: 'a@b.com', xp: 0, gems: 0, streak: 0,
                   completedLessons: ['lesson-b'], achievements: [],
                   legendaryCompleted: [], languageProgress: {} }

  const merged = mergeUserProfiles(remote, local)

  assert.ok(merged.completedLessons.includes('lesson-a'))
  assert.ok(merged.completedLessons.includes('lesson-b'))
})

test('cross-user merge is blocked — returns remote profile only', () => {
  const remote = { id: 'user-a', email: 'a@a.com', xp: 500, gems: 0, streak: 0,
                   completedLessons: [], achievements: [], legendaryCompleted: [],
                   languageProgress: {} }
  const local  = { id: 'user-b', email: 'b@b.com', xp: 1000, gems: 0, streak: 0,
                   completedLessons: [], achievements: [], legendaryCompleted: [],
                   languageProgress: {} }

  const merged = mergeUserProfiles(remote, local)

  // Should return remote only since IDs don't match
  assert.equal(merged.id, 'user-a')
  assert.equal(merged.xp, 500)  // local's 1000 must NOT bleed through
})
```

Save this file and run: `node --test tests/mergeUserProfiles.test.mjs`

---

## Writing your first translation coverage test

```js
// tests/translationCoverage.test.mjs
import test from 'node:test'
import assert from 'node:assert/strict'
import { uiTranslations } from '../src/services/uiTranslations.js'

const REQUIRED_LANGS = ['en', 'hi', 'mr', 'ta', 'te', 'bn', 'pa', 'gu']

test('every translation key has a value for all 8 languages', () => {
  const missing = []

  for (const [key, translations] of Object.entries(uiTranslations)) {
    for (const lang of REQUIRED_LANGS) {
      if (!translations[lang] || translations[lang].trim() === '') {
        missing.push(`${key}.${lang}`)
      }
    }
  }

  assert.deepEqual(missing, [],
    `Missing translations:\n${missing.join('\n')}`)
})
```

---

## SM-2 algorithm unit test

```js
// tests/spacedRepetition.test.mjs
import test from 'node:test'
import assert from 'node:assert/strict'
import { calculateSM2 } from '../src/services/spacedRepetition.js'

test('a perfect answer on a new item schedules review in 1 day', () => {
  const item = { repetition: 0, interval: 0, easeFactor: 2.5 }
  const result = calculateSM2(item, 5)
  assert.equal(result.repetition, 1)
  assert.equal(result.interval, 1)
})

test('failed recall resets repetition to 0 and schedules review tomorrow', () => {
  const item = { repetition: 3, interval: 20, easeFactor: 2.5 }
  const result = calculateSM2(item, 1)
  assert.equal(result.repetition, 0)
  assert.equal(result.interval, 1)
})

test('ease factor never drops below 1.3', () => {
  let item = { repetition: 0, interval: 0, easeFactor: 1.4 }
  // Keep failing
  for (let i = 0; i < 10; i++) {
    item = calculateSM2(item, 0)
  }
  assert.ok(item.easeFactor >= 1.3)
})
```

---

## Playwright E2E test best practices

For the E2E tests to be reliable:

1. **Use data-testid attributes** on key elements rather than text selectors. Text can change with localization; `data-testid` does not:
   ```jsx
   <button data-testid="onboarding-continue">
     {t('continue')}
   </button>
   ```

2. **Mock Supabase** for E2E tests. Currently the tests use `localStorage` injection which is good — keep this approach.

3. **Run against a known state**. Clear localStorage before each test to ensure consistent starting conditions.

4. **Add E2E tests for**: login/signup, completing a full lesson, the dashboard loading correctly.

---

## Recommended test priority order

1. `mergeUserProfiles()` — highest business risk
2. `calculateSM2()` — mathematical correctness
3. `hasUserCompletedOnboarding()` + `hasUserCompletedAssessment()` — journey gates
4. `uiTranslations.js` coverage — silent failure prevention
5. `updateStreak()` — timezone edge cases
6. Full lesson E2E — most user-visible flow
7. `generateAdaptiveLesson()` — content correctness
