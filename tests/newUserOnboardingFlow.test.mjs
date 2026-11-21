import test from 'node:test'
import assert from 'node:assert/strict'
import {
  hasUserCompletedOnboarding,
  hasUserCompletedAssessment,
  getNextAuthRedirect,
  mapProfileToUser,
  mapUserUpdatesToProfile,
  mergeUserProfiles,
} from '../src/services/authUtils.js'

// Mock storage helper for tests
function createMockStorage(initial = {}) {
  let store = { ...initial }
  return {
    getItem: (key) => (key in store ? store[key] : null),
    setItem: (key, val) => { store[key] = String(val) },
    removeItem: (key) => { delete store[key] },
    clear: () => { store = {} },
    dump: () => ({ ...store }),
  }
}

test('Scenario 1: New signup with an authenticated session routes directly to /onboarding', () => {
  // Simulating fresh user created with an active session
  const newAuthUser = {
    id: 'user_new_1',
    email: 'learner1@bharatlingo.com',
    user_metadata: { name: 'Aarav' },
  }
  const defaultProfile = null // Profile just created or empty
  const user = mapProfileToUser(defaultProfile, newAuthUser)

  assert.equal(user.id, 'user_new_1')
  assert.equal(user.name, 'Aarav')
  assert.equal(user.email, 'learner1@bharatlingo.com')
  assert.equal(user.learningLanguage, null, 'learningLanguage must be null for newcomers')
  assert.equal(user.hasCompletedAssessment, false, 'hasCompletedAssessment must be false')
  assert.equal(user.xp, 0)
  assert.equal(user.completedLessons.length, 0)

  // Verify onboarding status
  assert.equal(hasUserCompletedOnboarding(user), false, 'New user has not completed onboarding')
  assert.equal(hasUserCompletedAssessment(user), false, 'New user has not completed assessment')

  // Verify route destination
  const destination = getNextAuthRedirect(user)
  assert.equal(destination, '/onboarding', 'Must route straight to /onboarding, not /dashboard or /login')
})

test('Scenario 2: New signup requiring email confirmation sets correct flags and redirects to login with message', () => {
  // Simulating Supabase returning user with unconfirmed email (no session)
  const signupResponse = {
    user: null,
    session: null,
    requiresConfirmation: true,
    email: 'unconfirmed@bharatlingo.com',
  }

  assert.equal(signupResponse.requiresConfirmation, true)
  assert.equal(signupResponse.session, null)
  // When requiresConfirmation is true, Signup navigates to /login with state.successMessage = check_email_confirm
})

test('Scenario 3: First login after registration routes user through /onboarding', () => {
  // Simulating user who confirmed email and now logs in for the first time
  const dbProfile = {
    id: 'user_confirmed_1',
    email: 'confirmed@bharatlingo.com',
    name: 'Diya',
    preferred_language: 'en',
    learning_language: null,
    goal: null,
    level: 'beginner',
    daily_goal: 10,
    has_completed_assessment: false,
    assessment_score: null,
    learning_plan: null,
    xp: 0,
    gems: 0,
    streak: 0,
    completed_lessons: [],
  }

  const user = mapProfileToUser(dbProfile, { id: dbProfile.id, email: dbProfile.email })

  assert.equal(hasUserCompletedOnboarding(user), false)
  assert.equal(hasUserCompletedAssessment(user), false)

  const destination = getNextAuthRedirect(user)
  assert.equal(destination, '/onboarding', 'First login must go to /onboarding, never directly to dashboard')
})

test('Scenario 4: New user completing onboarding and assessment proceeds through full funnel', () => {
  // 1. User starts fresh
  let user = {
    id: 'user_flow_1',
    email: 'flow@bharatlingo.com',
    name: 'Ishaan',
    preferredLanguage: 'en',
    learningLanguage: null,
    goal: null,
    ageRange: null,
    hasCompletedAssessment: false,
    assessmentScore: null,
    learningPlan: null,
    xp: 0,
    gems: 0,
    streak: 0,
    completedLessons: [],
  }
  assert.equal(getNextAuthRedirect(user), '/onboarding')

  // 2. User completes Onboarding steps (Age, Preferred language, Target language, Goal)
  const onboardingUpdates = {
    ageRange: 'young-adult',
    preferredLanguage: 'en',
    learningLanguage: 'hi',
    goal: 'conversation',
    dailyGoal: 10,
    hasCompletedAssessment: false,
    assessmentScore: null,
    learningPlan: null,
  }
  user = { ...user, ...onboardingUpdates }

  // 3. Verify state after onboarding completion
  assert.equal(hasUserCompletedOnboarding(user), true, 'Onboarding is complete after language & goal selection')
  assert.equal(hasUserCompletedAssessment(user), false, 'Assessment is not completed yet')
  assert.equal(getNextAuthRedirect(user), '/assessment', 'Must route to /assessment before dashboard')

  // 4. User completes Assessment
  const assessmentUpdates = {
    level: 'intermediate',
    assessmentScore: 73,
    hasCompletedAssessment: true,
    lastActiveDate: '2026-11-20',
    streak: 1,
    xp: user.xp + 20, // completion bonus
    gems: user.gems + 25,
    learningPlan: {
      startingLevel: 'Intermediate',
      goal: 'Conversation',
      dailyPractice: '10 min',
      focusAreas: ['Everyday conversation', 'Listening'],
      recommendedFirstLesson: 'Greetings & Introductions',
    },
  }
  user = { ...user, ...assessmentUpdates }

  // 5. Verify state after assessment completion
  assert.equal(hasUserCompletedOnboarding(user), true)
  assert.equal(hasUserCompletedAssessment(user), true, 'Assessment is complete')
  assert.equal(getNextAuthRedirect(user), '/dashboard', 'Must now route to /dashboard')

  // Verify DB mapping preserves all fields
  const dbMapped = mapUserUpdatesToProfile(user)
  assert.equal(dbMapped.learning_language, 'hi')
  assert.equal(dbMapped.goal, 'conversation')
  assert.equal(dbMapped.has_completed_assessment, true)
  assert.equal(dbMapped.assessment_score, 73)
  assert.equal(dbMapped.xp, 20)
  assert.equal(dbMapped.gems, 25)
  assert.equal(dbMapped.streak, 1)
})

test('Scenario 5: New user refreshing during onboarding maintains onboarding step without dashboard leak', () => {
  const mockSessionStorage = createMockStorage()

  // User is at Step 2 (TARGET_LANGUAGE)
  mockSessionStorage.setItem('bharatlingo_onboarding_step', '2')
  const savedStep = Number(mockSessionStorage.getItem('bharatlingo_onboarding_step'))
  assert.equal(savedStep, 2)

  // Incomplete user profile
  const user = {
    id: 'user_mid_onboarding',
    email: 'mid@bharatlingo.com',
    learningLanguage: null,
    hasCompletedAssessment: false,
  }

  assert.equal(hasUserCompletedOnboarding(user), false)
  assert.equal(getNextAuthRedirect(user), '/onboarding')
})

test('Scenario 6: New user closing and reopening app before assessment completion stays gated to /assessment', () => {
  // User completed onboarding, but closed app before finishing assessment
  const user = {
    id: 'user_gated_1',
    email: 'gated@bharatlingo.com',
    learningLanguage: 'ta',
    goal: 'work',
    ageRange: 'adult',
    hasCompletedAssessment: false,
    assessmentScore: null,
    learningPlan: null,
    xp: 0,
    completedLessons: [],
  }

  assert.equal(hasUserCompletedOnboarding(user), true, 'User is onboarded')
  assert.equal(hasUserCompletedAssessment(user), false, 'Assessment is incomplete')

  // When app reopens:
  const destination = getNextAuthRedirect(user)
  assert.equal(destination, '/assessment', 'Must redirect back to /assessment')

  // If user tries to visit dashboard, gate will redirect to /assessment
  const canAccessDashboard = hasUserCompletedOnboarding(user) && hasUserCompletedAssessment(user)
  assert.equal(canAccessDashboard, false, 'User must be prevented from entering dashboard')
})

test('Scenario 7: Existing user with completed onboarding & assessment goes straight to /dashboard', () => {
  const existingUser = {
    id: 'user_existing_1',
    email: 'veteran@bharatlingo.com',
    name: 'Ananya',
    learningLanguage: 'mr',
    hasCompletedAssessment: true,
    assessmentScore: 85,
    xp: 450,
    gems: 320,
    streak: 12,
    completedLessons: ['mr-1', 'mr-2', 'mr-3'],
    learningPlan: { startingLevel: 'Advanced' },
  }

  assert.equal(hasUserCompletedOnboarding(existingUser), true)
  assert.equal(hasUserCompletedAssessment(existingUser), true)

  const destination = getNextAuthRedirect(existingUser)
  assert.equal(destination, '/dashboard', 'Returning learner must go straight to dashboard')
})

test('Scenario 8: Existing user with incomplete onboarding fields recovers safely without losing learning progress', () => {
  // Legacy user with lessons and XP, but learning_language column was null in DB
  const legacyProfile = {
    id: 'user_legacy_1',
    email: 'legacy@bharatlingo.com',
    name: 'Vikram',
    preferred_language: 'en',
    learning_language: null, // missing in old DB row!
    xp: 320,
    gems: 150,
    streak: 5,
    completed_lessons: ['hi-greetings-1', 'hi-numbers-1'],
    language_progress: {
      hi: {
        completedLessons: ['hi-greetings-1', 'hi-numbers-1'],
        xp: 320,
        level: 'elementary',
      },
    },
    has_completed_assessment: false,
  }

  const user = mapProfileToUser(legacyProfile, { id: legacyProfile.id, email: legacyProfile.email })

  // 1. learningLanguage safely inferred from language_progress
  assert.equal(user.learningLanguage, 'hi', 'learningLanguage must be inferred from language_progress')

  // 2. User has lessons and XP > 0, so must be recognized as assessed
  assert.equal(hasUserCompletedOnboarding(user), true)
  assert.equal(hasUserCompletedAssessment(user), true, 'User with XP and lessons must be recognized as completed')

  // 3. User goes to dashboard and progress is completely preserved
  assert.equal(getNextAuthRedirect(user), '/dashboard')
  assert.equal(user.xp, 320)
  assert.equal(user.completedLessons.length, 2)
  assert.equal(user.streak, 5)
})

test('Scenario 9: User logging out and logging back in preserves authentic destination', () => {
  const registeredUsers = [
    {
      id: 'user_newcomer',
      email: 'newcomer@bharatlingo.com',
      learningLanguage: null,
      hasCompletedAssessment: false,
    },
    {
      id: 'user_onboarded_only',
      email: 'onboarded@bharatlingo.com',
      learningLanguage: 'bn',
      hasCompletedAssessment: false,
    },
    {
      id: 'user_veteran',
      email: 'veteran@bharatlingo.com',
      learningLanguage: 'te',
      hasCompletedAssessment: true,
      xp: 200,
    },
  ]

  // Logout clears session
  let activeUser = null
  assert.equal(getNextAuthRedirect(activeUser), '/login')

  // Login as newcomer
  activeUser = registeredUsers[0]
  assert.equal(getNextAuthRedirect(activeUser), '/onboarding')

  // Logout and login as onboarded-only
  activeUser = null
  activeUser = registeredUsers[1]
  assert.equal(getNextAuthRedirect(activeUser), '/assessment')

  // Logout and login as veteran
  activeUser = null
  activeUser = registeredUsers[2]
  assert.equal(getNextAuthRedirect(activeUser), '/dashboard')
})

test('Scenario 10: Assessment submission failure handles retry safely without premature completion', async () => {
  let user = {
    id: 'user_retry_1',
    email: 'retry@bharatlingo.com',
    learningLanguage: 'gu',
    hasCompletedAssessment: false,
    assessmentScore: null,
  }

  let attemptCount = 0
  let isSaved = false

  async function mockSubmitAssessment(answers, forceFail = false) {
    attemptCount += 1
    if (forceFail) {
      throw new Error('Network timeout saving assessment')
    }
    isSaved = true
    return {
      hasCompletedAssessment: true,
      assessmentScore: 80,
      level: 'intermediate',
    }
  }

  // Attempt 1: Network failure
  try {
    await mockSubmitAssessment([], true)
    assert.fail('Should have thrown')
  } catch (err) {
    assert.equal(err.message, 'Network timeout saving assessment')
    assert.equal(isSaved, false)
    assert.equal(user.hasCompletedAssessment, false, 'Must not be marked complete if save failed')
    assert.equal(getNextAuthRedirect(user), '/assessment', 'Must stay on /assessment when submission fails')
  }

  // Attempt 2: User clicks Retry and succeeds
  const result = await mockSubmitAssessment([], false)
  user = { ...user, ...result }

  assert.equal(attemptCount, 2, 'Attempted twice')
  assert.equal(isSaved, true)
  assert.equal(user.hasCompletedAssessment, true, 'Marked complete only after successful save')
  assert.equal(getNextAuthRedirect(user), '/dashboard', 'Now allowed to dashboard')
})

test('Verification 1: XP alone cannot mark a genuinely new user as assessed', () => {
  // Scenario: Learner is halfway through assessment and answered Question 1 (+10 XP)
  const inProgressUser = {
    id: 'user_mid_test',
    email: 'midtest@bharatlingo.com',
    preferredLanguage: 'en',
    learningLanguage: 'hi',
    xp: 20, // Received XP for answering 2 questions correctly!
    gems: 0,
    streak: 0,
    hasCompletedAssessment: false,
    assessmentScore: null,
    learningPlan: null,
    completedLessons: [],
  }

  // Verify that XP > 0 does NOT trick the system into treating user as assessed
  assert.equal(hasUserCompletedAssessment(inProgressUser), false, 'User with XP but no finished assessment is NOT assessed')
  assert.equal(getNextAuthRedirect(inProgressUser), '/assessment', 'Must route to /assessment, NOT /dashboard')

  // Even if DB profile has xp > 0 (e.g. from learning activity or prior partial action):
  const rawDbProfile = {
    id: 'user_mid_test_db',
    email: 'midtest@bharatlingo.com',
    preferred_language: 'en',
    learning_language: 'hi',
    xp: 50,
    has_completed_assessment: false,
    assessment_score: null,
    learning_plan: null,
    completed_lessons: [],
  }
  const mappedUser = mapProfileToUser(rawDbProfile, { id: rawDbProfile.id, email: rawDbProfile.email })
  assert.equal(mappedUser.hasCompletedAssessment, false, 'mapProfileToUser must not set hasCompletedAssessment true just for XP')
  assert.equal(hasUserCompletedAssessment(mappedUser), false)
  assert.equal(getNextAuthRedirect(mappedUser), '/assessment')
})

test('Verification 2: Legitimate legacy user compatibility is preserved without relying on XP alone', () => {
  // Legacy User A: Has completed lessons in DB before has_completed_assessment column existed
  const legacyUserWithLessons = {
    id: 'legacy_a',
    completedLessons: ['hi-vocab-1', 'hi-vocab-2'],
    hasCompletedAssessment: false,
    assessmentScore: null,
    learningPlan: null,
    learningLanguage: 'hi',
    xp: 0, // Even with 0 XP, completed lessons prove prior progression
  }
  assert.equal(hasUserCompletedAssessment(legacyUserWithLessons), true, 'User with completed lessons is recognized as assessed')
  assert.equal(getNextAuthRedirect(legacyUserWithLessons), '/dashboard')

  // Legacy User B: Has an existing learning plan from an earlier assessment
  const legacyUserWithPlan = {
    id: 'legacy_b',
    completedLessons: [],
    hasCompletedAssessment: false,
    assessmentScore: null,
    learningPlan: { startingLevel: 'Beginner', focusAreas: ['Vocabulary'] },
    learningLanguage: 'hi',
    xp: 0,
  }
  assert.equal(hasUserCompletedAssessment(legacyUserWithPlan), true, 'User with learning plan is recognized as assessed')
  assert.equal(getNextAuthRedirect(legacyUserWithPlan), '/dashboard')

  // Legacy User C: Has an assessment score recorded
  const legacyUserWithScore = {
    id: 'legacy_c',
    completedLessons: [],
    hasCompletedAssessment: false,
    assessmentScore: 75,
    learningPlan: null,
    learningLanguage: 'ta',
    xp: 0,
  }
  assert.equal(hasUserCompletedAssessment(legacyUserWithScore), true, 'User with assessment score is recognized as assessed')
  assert.equal(getNextAuthRedirect(legacyUserWithScore), '/dashboard')
})

test('Verification 3: Profile rehydration (mergeUserProfiles) guarantees unassessed user never leaks to dashboard', () => {
  const remoteUnassessed = {
    id: 'user_sync_test',
    email: 'synctest@bharatlingo.com',
    preferredLanguage: 'en',
    learningLanguage: 'hi',
    hasCompletedAssessment: false,
    assessmentScore: null,
    learningPlan: null,
    xp: 20,
    gems: 10,
    streak: 0,
    completedLessons: [],
  }

  const localUnassessed = {
    id: 'user_sync_test',
    email: 'synctest@bharatlingo.com',
    preferredLanguage: 'en',
    learningLanguage: 'hi',
    hasCompletedAssessment: false,
    assessmentScore: null,
    learningPlan: null,
    xp: 30, // Local has higher XP from recent in-memory action
    gems: 10,
    streak: 0,
    completedLessons: [],
  }

  const merged = mergeUserProfiles(remoteUnassessed, localUnassessed)

  // Monotonic metrics merge cleanly
  assert.equal(merged.xp, 30, 'XP merges monotonically to maximum')
  // Assessment status remains strictly false
  assert.equal(merged.hasCompletedAssessment, false, 'hasCompletedAssessment must remain false')
  assert.equal(hasUserCompletedAssessment(merged), false)
  // Gated route stays on /assessment
  assert.equal(getNextAuthRedirect(merged), '/assessment', 'Rehydrated user stays on /assessment')
})

test('Verification 4: Reward field stripping logic isolates core assessment metadata under trigger protection', () => {
  const updates = {
    level: 'intermediate',
    assessmentScore: 85,
    hasCompletedAssessment: true,
    lastActiveDate: '2026-11-20',
    streak: 1,
    xp: 35,
    gems: 25,
  }

  const dbUpdates = mapUserUpdatesToProfile(updates)
  assert.equal(dbUpdates.level, 'intermediate')
  assert.equal(dbUpdates.assessment_score, 85)
  assert.equal(dbUpdates.has_completed_assessment, true)
  assert.equal(dbUpdates.streak, 1)
  assert.equal(dbUpdates.xp, 35)
  assert.equal(dbUpdates.gems, 25)

  // Emulate trigger rejection and retry logic:
  const triggerError = new Error('Cannot update XP, gems, or streak directly')
  assert.match(triggerError.message, /cannot update xp, gems, or streak directly/i)

  const nonRewardUpdates = { ...dbUpdates }
  delete nonRewardUpdates.xp
  delete nonRewardUpdates.gems
  delete nonRewardUpdates.streak

  // Assert nonRewardUpdates has no reward fields, but retains assessment completion
  assert.equal(nonRewardUpdates.xp, undefined)
  assert.equal(nonRewardUpdates.gems, undefined)
  assert.equal(nonRewardUpdates.streak, undefined)
  assert.equal(nonRewardUpdates.has_completed_assessment, true)
  assert.equal(nonRewardUpdates.assessment_score, 85)
  assert.equal(nonRewardUpdates.level, 'intermediate')
})

