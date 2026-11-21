/**
 * Unit tests for authentication routing utility functions.
 * These gate the entire user journey. A bug here traps users in
 * infinite redirect loops or bypasses required onboarding/assessment.
 *
 * Run with: node --test tests/authUtils.test.mjs
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  hasUserCompletedOnboarding,
  hasUserCompletedAssessment,
  getNextAuthRedirect,
} from '../src/services/authUtils.js'

// ── hasUserCompletedOnboarding ────────────────────────────────────────────────

test('null user has not completed onboarding', () => {
  assert.equal(hasUserCompletedOnboarding(null), false)
})

test('user without learningLanguage has not completed onboarding', () => {
  assert.equal(hasUserCompletedOnboarding({ learningLanguage: null }), false)
})

test('user with learningLanguage has completed onboarding', () => {
  assert.equal(hasUserCompletedOnboarding({ learningLanguage: 'hi' }), true)
})

test('user with languageProgress has completed onboarding (recovery path)', () => {
  assert.equal(hasUserCompletedOnboarding({
    learningLanguage: null,
    languageProgress: { hi: { xp: 50 } },
  }), true)
})

test('user with completedLessons has completed onboarding (recovery path)', () => {
  assert.equal(hasUserCompletedOnboarding({
    learningLanguage: null,
    completedLessons: ['hi-greetings'],
  }), true)
})

test('user with empty languageProgress has NOT completed onboarding', () => {
  assert.equal(hasUserCompletedOnboarding({
    learningLanguage: null,
    languageProgress: {},
  }), false)
})

// ── hasUserCompletedAssessment ────────────────────────────────────────────────

test('null user has not completed assessment', () => {
  assert.equal(hasUserCompletedAssessment(null), false)
})

test('user with hasCompletedAssessment=true has completed assessment', () => {
  assert.equal(hasUserCompletedAssessment({ hasCompletedAssessment: true }), true)
})

test('user with assessmentScore=0 has completed assessment (zero is a valid score)', () => {
  assert.equal(hasUserCompletedAssessment({ assessmentScore: 0 }), true)
})

test('user with assessmentScore=100 has completed assessment', () => {
  assert.equal(hasUserCompletedAssessment({ assessmentScore: 100 }), true)
})

test('user with learningPlan has completed assessment', () => {
  assert.equal(hasUserCompletedAssessment({ learningPlan: { startingLevel: 'Beginner' } }), true)
})

test('user with completedLessons has completed assessment (recovery path)', () => {
  assert.equal(hasUserCompletedAssessment({ completedLessons: ['hi-greetings'] }), true)
})

test('user with no assessment indicators has NOT completed assessment', () => {
  assert.equal(hasUserCompletedAssessment({
    hasCompletedAssessment: false,
    assessmentScore: null,
    learningPlan: null,
    completedLessons: [],
  }), false)
})

test('user with assessmentScore=null and no lessons has NOT completed assessment', () => {
  assert.equal(hasUserCompletedAssessment({
    assessmentScore: null,
    completedLessons: [],
  }), false)
})

// ── getNextAuthRedirect ───────────────────────────────────────────────────────

test('null user is redirected to /login', () => {
  assert.equal(getNextAuthRedirect(null), '/login')
})

test('user without onboarding is redirected to /onboarding', () => {
  const user = { learningLanguage: null, hasCompletedAssessment: false, assessmentScore: null, completedLessons: [], learningPlan: null }
  assert.equal(getNextAuthRedirect(user), '/onboarding')
})

test('onboarded user without assessment is redirected to /assessment', () => {
  const user = {
    learningLanguage: 'hi',
    hasCompletedAssessment: false,
    assessmentScore: null,
    completedLessons: [],
    learningPlan: null,
  }
  assert.equal(getNextAuthRedirect(user), '/assessment')
})

test('fully set up user is redirected to /dashboard', () => {
  const user = {
    learningLanguage: 'hi',
    hasCompletedAssessment: true,
    assessmentScore: 75,
    completedLessons: ['hi-greetings'],
    learningPlan: { startingLevel: 'Intermediate' },
  }
  assert.equal(getNextAuthRedirect(user), '/dashboard')
})

test('user with learningPlan but no hasCompletedAssessment flag still goes to /dashboard', () => {
  // learningPlan existing = assessment was completed; hasCompletedAssessment might not be set in older profiles
  const user = {
    learningLanguage: 'mr',
    hasCompletedAssessment: false,
    assessmentScore: null,
    completedLessons: [],
    learningPlan: { startingLevel: 'Beginner' },
  }
  assert.equal(getNextAuthRedirect(user), '/dashboard')
})
