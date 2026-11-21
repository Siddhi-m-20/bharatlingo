/**
 * Unit tests for mergeUserProfiles — the most critical data integrity function
 * in BharatLingo. A bug here loses user progress silently.
 *
 * Run with: node --test tests/mergeUserProfiles.test.mjs
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { mergeUserProfiles } from '../src/services/authUtils.js'

// Minimal valid user skeleton
function user(overrides = {}) {
  return {
    id: 'u1',
    email: 'a@a.com',
    xp: 0,
    gems: 0,
    streak: 0,
    completedLessons: [],
    achievements: [],
    legendaryCompleted: [],
    languageProgress: {},
    ...overrides,
  }
}

// ── Null / missing inputs ──────────────────────────────────────────────────

test('returns null when both profiles are null', () => {
  assert.equal(mergeUserProfiles(null, null), null)
})

test('returns remote when local is null', () => {
  const remote = user({ xp: 100 })
  assert.deepEqual(mergeUserProfiles(remote, null), remote)
})

test('returns local when remote is null', () => {
  const local = user({ xp: 200 })
  assert.deepEqual(mergeUserProfiles(null, local), local)
})

// ── Monotonic reward fields ─────────────────────────────────────────────────

test('merged XP is always the maximum of remote and local', () => {
  const remote = user({ xp: 100 })
  const local = user({ xp: 150 })
  assert.equal(mergeUserProfiles(remote, local).xp, 150)
})

test('merged XP takes remote when it is higher', () => {
  const remote = user({ xp: 300 })
  const local = user({ xp: 50 })
  assert.equal(mergeUserProfiles(remote, local).xp, 300)
})

test('merged gems is always the maximum', () => {
  const remote = user({ gems: 80 })
  const local = user({ gems: 40 })
  assert.equal(mergeUserProfiles(remote, local).gems, 80)
})

test('merged streak is always the maximum', () => {
  const remote = user({ streak: 5 })
  const local = user({ streak: 12 })
  assert.equal(mergeUserProfiles(remote, local).streak, 12)
})

// ── Completed lessons union ─────────────────────────────────────────────────

test('completed lessons from both profiles are unioned', () => {
  const remote = user({ completedLessons: ['lesson-a'] })
  const local = user({ completedLessons: ['lesson-b'] })
  const merged = mergeUserProfiles(remote, local)
  assert.ok(merged.completedLessons.includes('lesson-a'))
  assert.ok(merged.completedLessons.includes('lesson-b'))
})

test('completed lessons are deduplicated on merge', () => {
  const remote = user({ completedLessons: ['lesson-a', 'lesson-b'] })
  const local = user({ completedLessons: ['lesson-b', 'lesson-c'] })
  const merged = mergeUserProfiles(remote, local)
  const count = merged.completedLessons.filter((l) => l === 'lesson-b').length
  assert.equal(count, 1)
})

test('achievements are unioned and deduplicated', () => {
  const remote = user({ achievements: ['first_step', 'xp_100'] })
  const local = user({ achievements: ['xp_100', 'streak_7'] })
  const merged = mergeUserProfiles(remote, local)
  assert.ok(merged.achievements.includes('first_step'))
  assert.ok(merged.achievements.includes('xp_100'))
  assert.ok(merged.achievements.includes('streak_7'))
  assert.equal(merged.achievements.filter((a) => a === 'xp_100').length, 1)
})

// ── Cross-user isolation ─────────────────────────────────────────────────────

test('cross-user merge by ID returns remote only without local XP bleeding through', () => {
  const remote = user({ id: 'user-a', email: 'a@a.com', xp: 500 })
  const local = user({ id: 'user-b', email: 'b@b.com', xp: 1000 })
  const merged = mergeUserProfiles(remote, local)
  assert.equal(merged.id, 'user-a')
  assert.equal(merged.xp, 500)
})

test('cross-user merge by email returns remote only', () => {
  const remote = user({ id: 'user-a', email: 'a@a.com', xp: 400 })
  const local = user({ id: 'user-c', email: 'c@c.com', xp: 999 })
  const merged = mergeUserProfiles(remote, local)
  assert.equal(merged.email, 'a@a.com')
  assert.equal(merged.xp, 400)
})

test('same user recognized by matching email even with different IDs', () => {
  const remote = user({ id: 'remote-id', email: 'same@same.com', xp: 100 })
  const local = user({ id: 'local-id', email: 'SAME@SAME.COM', xp: 200 })
  const merged = mergeUserProfiles(remote, local)
  // Same user (email match) — XP should be max
  assert.equal(merged.xp, 200)
})

// ── Language progress merge ──────────────────────────────────────────────────

test('per-language XP uses maximum on merge', () => {
  const remote = user({
    languageProgress: { hi: { xp: 100, completedLessons: ['a'], legendaryCompleted: [] } },
  })
  const local = user({
    languageProgress: { hi: { xp: 200, completedLessons: ['b'], legendaryCompleted: [] } },
  })
  const merged = mergeUserProfiles(remote, local)
  assert.equal(merged.languageProgress.hi.xp, 200)
})

test('per-language completed lessons are unioned across remote and local', () => {
  const remote = user({
    languageProgress: { hi: { xp: 0, completedLessons: ['lesson-x'], legendaryCompleted: [] } },
  })
  const local = user({
    languageProgress: { hi: { xp: 0, completedLessons: ['lesson-y'], legendaryCompleted: [] } },
  })
  const merged = mergeUserProfiles(remote, local)
  assert.ok(merged.languageProgress.hi.completedLessons.includes('lesson-x'))
  assert.ok(merged.languageProgress.hi.completedLessons.includes('lesson-y'))
})
