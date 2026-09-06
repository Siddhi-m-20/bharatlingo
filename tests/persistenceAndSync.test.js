/**
 * Automated Verification Suite for BharatLingo Persistence and Sync Engine
 * Tests monotonic XP, hearts, gems, streak, and lesson completion synchronization
 */

import { mergeUserProfiles, mapUserUpdatesToProfile, mapProfileToUser } from '../src/services/auth.jsx'

function runTests() {
  console.log('🧪 Starting BharatLingo Persistence & Sync Verification Suite...\n')
  let passed = 0
  let failed = 0

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`)
      passed++
    } else {
      console.error(`  ❌ FAIL: ${message}`)
      failed++
    }
  }

  // TEST 1: Monotonic XP Merge (Never downgrade XP on refresh)
  console.log('--- TEST SUITE 1: Monotonic XP & Progress Merge on Refresh ---')
  {
    const staleRemoteDBProfile = {
      id: 'usr_123',
      name: 'Test Learner',
      email: 'learner@example.com',
      xp: 40, // Stale DB value
      gems: 100,
      hearts: 5,
      streak: 1,
      completed_lessons: ['hi-greetings-1'],
      language_progress: {
        hi: { xp: 40, completedLessons: ['hi-greetings-1'] }
      }
    }

    const currentLocalSessionProfile = {
      id: 'usr_123',
      name: 'Test Learner',
      email: 'learner@example.com',
      xp: 150, // Accumulated in session
      gems: 125,
      hearts: 3, // Lost 2 hearts during lesson
      streak: 2,
      completedLessons: ['hi-greetings-1', 'hi-greetings-2'],
      languageProgress: {
        hi: { xp: 150, completedLessons: ['hi-greetings-1', 'hi-greetings-2'] }
      }
    }

    const mappedRemote = mapProfileToUser(staleRemoteDBProfile, { id: 'usr_123', email: 'learner@example.com' })
    const merged = mergeUserProfiles(mappedRemote, currentLocalSessionProfile)

    assert(merged.xp === 150, `XP must be 150 (not reset to 40), got: ${merged.xp}`)
    assert(merged.gems === 125, `Gems must be 125 (not reset to 100), got: ${merged.gems}`)
    assert(merged.hearts === 3, `Hearts must be 3 (recent session hearts preserved), got: ${merged.hearts}`)
    assert(merged.streak === 2, `Streak must be 2 (not reset to 1), got: ${merged.streak}`)
    assert(merged.completedLessons.length === 2, `Completed lessons must contain 2 items, got: ${merged.completedLessons.length}`)
    assert(merged.languageProgress.hi.xp === 150, `Language progress Hindi XP must be 150, got: ${merged.languageProgress.hi.xp}`)
  }

  // TEST 2: Remote Profile with Higher Value Merge
  console.log('\n--- TEST SUITE 2: Remote Profile Higher Progress Priority ---')
  {
    const freshRemoteProfile = {
      id: 'usr_123',
      name: 'Sync Learner',
      email: 'sync@example.com',
      xp: 300,
      gems: 200,
      hearts: 5,
      streak: 5,
      completed_lessons: ['hi-greetings-1', 'hi-greetings-2', 'hi-basics-1'],
    }

    const oldLocalProfile = {
      id: 'usr_123',
      name: 'Sync Learner',
      email: 'sync@example.com',
      xp: 100,
      gems: 100,
      hearts: 4,
      streak: 2,
      completedLessons: ['hi-greetings-1'],
    }

    const mappedRemote = mapProfileToUser(freshRemoteProfile, { id: 'usr_123' })
    const merged = mergeUserProfiles(mappedRemote, oldLocalProfile)

    assert(merged.xp === 300, `XP must take higher remote value 300, got: ${merged.xp}`)
    assert(merged.gems === 200, `Gems must take higher remote value 200, got: ${merged.gems}`)
    assert(merged.streak === 5, `Streak must take higher remote value 5, got: ${merged.streak}`)
    assert(merged.completedLessons.length === 3, `Completed lessons must have 3 items, got: ${merged.completedLessons.length}`)
  }

  // TEST 3: DB Column Mapping Safety
  console.log('\n--- TEST SUITE 3: Database Column Mapping Safety ---')
  {
    const appUpdates = {
      name: 'Ananya',
      xp: 220,
      hearts: 4,
      streak: 3,
      avatar: 'https://example.com/avatar.png',
      learningLanguage: 'mr',
      goal: 'travel',
      completedLessons: ['mr-1', 'mr-2'],
      // Extra fields that should NOT break DB update
      someExtraUIField: 'ignore',
    }

    const dbMapped = mapUserUpdatesToProfile(appUpdates)

    assert(dbMapped.name === 'Ananya', `Name mapped correctly: ${dbMapped.name}`)
    assert(dbMapped.xp === 220, `XP mapped to number: ${dbMapped.xp}`)
    assert(dbMapped.hearts === 4, `Hearts mapped to number: ${dbMapped.hearts}`)
    assert(dbMapped.streak === 3, `Streak mapped to number: ${dbMapped.streak}`)
    assert(dbMapped.avatar_url === 'https://example.com/avatar.png', `Avatar mapped to avatar_url: ${dbMapped.avatar_url}`)
    assert(dbMapped.learning_language === 'mr', `learningLanguage mapped: ${dbMapped.learning_language}`)
    assert(dbMapped.someExtraUIField === undefined, `Unknown column was omitted: ${dbMapped.someExtraUIField}`)
  }

  // TEST 4: Null and Edge Case Merging
  console.log('\n--- TEST SUITE 4: Edge Cases & Null Safety ---')
  {
    const localOnly = {
      id: 'guest_1',
      name: 'Guest',
      xp: 40,
      hearts: 5,
      gems: 100,
      streak: 1,
    }

    const mergedNullRemote = mergeUserProfiles(null, localOnly)
    assert(mergedNullRemote.xp === 40, `Local-only user preserved: XP ${mergedNullRemote.xp}`)

    const remoteOnly = {
      id: 'db_1',
      name: 'DB User',
      xp: 75,
      hearts: 4,
      gems: 110,
      streak: 2,
    }
    const mergedNullLocal = mergeUserProfiles(remoteOnly, null)
    assert(mergedNullLocal.xp === 75, `Remote-only user preserved: XP ${mergedNullLocal.xp}`)
  }

  console.log(`\n========================================`)
  console.log(`VERIFICATION SUMMARY: ${passed} Passed, ${failed} Failed`)
  console.log(`========================================\n`)

  if (failed > 0) {
    process.exit(1)
  }
}

runTests()
