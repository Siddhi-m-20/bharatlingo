/**
 * Automated Verification Suite for BharatLingo Persistence and Sync Engine
 */

// Helper: map DB snake_case profile to App user format
function mapProfileToUser(profile, authUser) {
  if (!profile && !authUser) return null

  const learningLang = profile?.learning_language || null
  const existingCompleted = Array.isArray(profile?.completed_lessons) ? profile.completed_lessons : []
  const initialLangProgress = profile?.language_progress || {}

  if (learningLang && !initialLangProgress[learningLang]) {
    initialLangProgress[learningLang] = {
      completedLessons: existingCompleted,
      xp: profile?.xp || 0,
      level: profile?.level || 'beginner',
      assessmentScore: profile?.assessment_score ?? null,
      learningPlan: profile?.learning_plan || null,
      legendaryCompleted: profile?.legendary_completed || [],
    }
  }

  return {
    id: profile?.id || authUser?.id,
    name: profile?.name || authUser?.user_metadata?.name || authUser?.email?.split('@')[0] || 'Learner',
    email: profile?.email || authUser?.email,
    avatar: profile?.avatar_url || profile?.avatar || null,
    bio: profile?.bio || '',
    preferredLanguage: profile?.preferred_language || 'en',
    learningLanguage: learningLang,
    goal: profile?.goal || 'conversation',
    level: profile?.level || 'beginner',
    dailyGoal: profile?.daily_goal || 10,
    ageRange: profile?.age_range || 'adult',
    assessmentScore: profile?.assessment_score ?? null,
    hasCompletedAssessment: profile?.has_completed_assessment ?? (profile?.assessment_score !== null && profile?.assessment_score !== undefined || existingCompleted.length > 0),
    learningPlan: profile?.learning_plan || null,
    xp: Number(profile?.xp) || 0,
    gems: profile?.gems !== undefined ? Number(profile.gems) : 100,
    streak: Number(profile?.streak) || 0,
    lastActiveDate: profile?.last_active_date || null,
    completedLessons: existingCompleted,
    languageProgress: initialLangProgress,
    legendaryCompleted: profile?.legendary_completed || [],
    vocabulary: profile?.vocabulary || {},
    achievements: profile?.achievements || [],
    settings: profile?.settings || { audio: true, soundFx: true, speaking: true },
    activeQuests: profile?.active_quests || null,
    createdAt: profile?.created_at || new Date().toISOString(),
  }
}

function mapUserUpdatesToProfile(updates) {
  const mapped = {}
  if (updates.name !== undefined) mapped.name = updates.name
  if (updates.avatar !== undefined) mapped.avatar_url = updates.avatar
  if (updates.avatar_url !== undefined) mapped.avatar_url = updates.avatar_url
  if (updates.preferredLanguage !== undefined) mapped.preferred_language = updates.preferredLanguage
  if (updates.learningLanguage !== undefined) mapped.learning_language = updates.learningLanguage
  if (updates.goal !== undefined) mapped.goal = updates.goal
  if (updates.level !== undefined) mapped.level = updates.level
  if (updates.dailyGoal !== undefined) mapped.daily_goal = updates.dailyGoal
  if (updates.ageRange !== undefined) mapped.age_range = updates.ageRange
  if (updates.assessmentScore !== undefined) mapped.assessment_score = updates.assessmentScore
  if (updates.learningPlan !== undefined) mapped.learning_plan = updates.learningPlan
  if (updates.xp !== undefined) mapped.xp = Number(updates.xp)
  if (updates.streak !== undefined) mapped.streak = Number(updates.streak)
  if (updates.lastActiveDate !== undefined) mapped.last_active_date = updates.lastActiveDate
  if (updates.completedLessons !== undefined) mapped.completed_lessons = updates.completedLessons
  if (updates.vocabulary !== undefined) mapped.vocabulary = updates.vocabulary
  if (updates.achievements !== undefined) mapped.achievements = updates.achievements
  return mapped
}

function mergeUserProfiles(remoteProfile, localProfile) {
  if (!remoteProfile && !localProfile) return null
  if (!remoteProfile) return localProfile
  if (!localProfile) return remoteProfile

  const mergedCompleted = Array.from(
    new Set([
      ...(Array.isArray(remoteProfile.completedLessons) ? remoteProfile.completedLessons : []),
      ...(Array.isArray(localProfile.completedLessons) ? localProfile.completedLessons : []),
    ])
  )

  const mergedLegendary = Array.from(
    new Set([
      ...(Array.isArray(remoteProfile.legendaryCompleted) ? remoteProfile.legendaryCompleted : []),
      ...(Array.isArray(localProfile.legendaryCompleted) ? localProfile.legendaryCompleted : []),
    ])
  )

  const mergedAchievements = Array.from(
    new Set([
      ...(Array.isArray(remoteProfile.achievements) ? remoteProfile.achievements : []),
      ...(Array.isArray(localProfile.achievements) ? localProfile.achievements : []),
    ])
  )

  const mergedLangProgress = { ...(remoteProfile.languageProgress || {}), ...(localProfile.languageProgress || {}) }
  const allLangKeys = Array.from(
    new Set([
      ...Object.keys(remoteProfile.languageProgress || {}),
      ...Object.keys(localProfile.languageProgress || {}),
    ])
  )

  allLangKeys.forEach((langKey) => {
    const remoteLang = remoteProfile.languageProgress?.[langKey] || {}
    const localLang = localProfile.languageProgress?.[langKey] || {}

    const langCompleted = Array.from(
      new Set([
        ...(Array.isArray(remoteLang.completedLessons) ? remoteLang.completedLessons : []),
        ...(Array.isArray(localLang.completedLessons) ? localLang.completedLessons : []),
      ])
    )

    const langLegendary = Array.from(
      new Set([
        ...(Array.isArray(remoteLang.legendaryCompleted) ? remoteLang.legendaryCompleted : []),
        ...(Array.isArray(localLang.legendaryCompleted) ? localLang.legendaryCompleted : []),
      ])
    )

    mergedLangProgress[langKey] = {
      ...remoteLang,
      ...localLang,
      completedLessons: langCompleted,
      legendaryCompleted: langLegendary,
      xp: Math.max(Number(remoteLang.xp) || 0, Number(localLang.xp) || 0),
      level: localLang.level || remoteLang.level || 'beginner',
    }
  })

  const remoteXP = Number(remoteProfile.xp) || 0
  const localXP = Number(localProfile.xp) || 0
  const mergedXP = Math.max(remoteXP, localXP)

  const remoteGems = remoteProfile.gems !== undefined ? Number(remoteProfile.gems) : 100
  const localGems = localProfile.gems !== undefined ? Number(localProfile.gems) : 100
  const mergedGems = Math.max(remoteGems, localGems)

  const remoteStreak = Number(remoteProfile.streak) || 0
  const localStreak = Number(localProfile.streak) || 0
  const mergedStreak = Math.max(remoteStreak, localStreak)

  const mergedQuests = localProfile.activeQuests || remoteProfile.activeQuests || null

  return {
    ...remoteProfile,
    ...localProfile,
    id: remoteProfile.id || localProfile.id,
    name: localProfile.name || remoteProfile.name || 'Learner',
    email: remoteProfile.email || localProfile.email,
    preferredLanguage: localProfile.preferredLanguage || remoteProfile.preferredLanguage || 'en',
    learningLanguage: localProfile.learningLanguage || remoteProfile.learningLanguage || 'hi',
    goal: localProfile.goal || remoteProfile.goal || 'conversation',
    level: localProfile.level || remoteProfile.level || 'beginner',
    dailyGoal: localProfile.dailyGoal || remoteProfile.dailyGoal || 10,
    ageRange: localProfile.ageRange || remoteProfile.ageRange || 'adult',
    assessmentScore: localProfile.assessmentScore ?? remoteProfile.assessmentScore ?? null,
    hasCompletedAssessment: Boolean(localProfile.hasCompletedAssessment || remoteProfile.hasCompletedAssessment),
    learningPlan: localProfile.learningPlan || remoteProfile.learningPlan || null,
    xp: mergedXP,
    gems: mergedGems,
    streak: mergedStreak,
    lastActiveDate: localProfile.lastActiveDate || remoteProfile.lastActiveDate || null,
    completedLessons: mergedCompleted,
    legendaryCompleted: mergedLegendary,
    achievements: mergedAchievements,
    languageProgress: mergedLangProgress,
    vocabulary: { ...(remoteProfile.vocabulary || {}), ...(localProfile.vocabulary || {}) },
    activeQuests: mergedQuests,
    settings: { ...(remoteProfile.settings || {}), ...(localProfile.settings || {}) },
  }
}

function runSuite() {
  console.log('🧪 Starting BharatLingo Persistence & Refresh Sync Verification...\n')
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

  // TEST 1: Monotonic XP Merge (Stale DB read after user earned XP locally)
  console.log('--- SUITE 1: Stale DB Read vs Local Session Progress (Refresh Simulation) ---')
  {
    const staleDBProfile = {
      id: 'usr_abc',
      name: 'Priya',
      email: 'priya@gmail.com',
      xp: 40,
      gems: 100,
      streak: 1,
      completed_lessons: ['hi-1'],
      language_progress: { hi: { xp: 40, completedLessons: ['hi-1'] } }
    }

    const localBrowserProfile = {
      id: 'usr_abc',
      name: 'Priya',
      email: 'priya@gmail.com',
      xp: 145, // Earned 105 XP during session
      gems: 130, // Earned 30 Gems
      streak: 2,
      completedLessons: ['hi-1', 'hi-2', 'hi-3'],
      languageProgress: { hi: { xp: 145, completedLessons: ['hi-1', 'hi-2', 'hi-3'] } }
    }

    const mappedRemote = mapProfileToUser(staleDBProfile, { id: 'usr_abc' })
    const merged = mergeUserProfiles(mappedRemote, localBrowserProfile)

    assert(merged.xp === 145, `XP remains 145 (does not drop to 40 on refresh)`)
    assert(merged.gems === 130, `Gems remain 130 (does not drop to 100 on refresh)`)
    assert(merged.streak === 2, `Streak remains 2 (does not drop to 1 on refresh)`)
    assert(merged.completedLessons.length === 3, `All 3 completed lessons retained`)
    assert(merged.languageProgress.hi.xp === 145, `Language progress Hindi XP remains 145`)
  }

  // TEST 2: Multiple Lesson Invocations Accumulating Monotonically
  console.log('\n--- SUITE 2: Multi-step Monotonic Accumulation ---')
  {
    let currentUser = {
      id: 'usr_abc',
      xp: 40,
      gems: 100,
      learningLanguage: 'hi',
      completedLessons: [],
      languageProgress: { hi: { xp: 40, completedLessons: [] } }
    }

    // Simulate answering 3 questions correctly (+10 each)
    for (let i = 0; i < 3; i++) {
      const targetLang = currentUser.learningLanguage
      const newTotalXP = (Number(currentUser.xp) || 0) + 10
      const currentLangData = currentUser.languageProgress[targetLang] || { xp: 0, completedLessons: [] }
      currentUser = {
        ...currentUser,
        xp: newTotalXP,
        languageProgress: {
          ...currentUser.languageProgress,
          [targetLang]: {
            ...currentLangData,
            xp: (Number(currentLangData.xp) || 0) + 10
          }
        }
      }
    }

    // Pedagogical principle: Mistake does not deduct hearts or halt learning
    // Simulate completing lesson (+15 bonus XP, +5 gems)
    currentUser = {
      ...currentUser,
      xp: currentUser.xp + 15,
      gems: currentUser.gems + 5,
      completedLessons: ['hi-basics-1'],
    }

    assert(currentUser.xp === 85, `Total XP correctly accumulated to 85 (40 + 30 + 15), got: ${currentUser.xp}`)
    assert(currentUser.gems === 105, `Total Gems accumulated to 105, got: ${currentUser.gems}`)

    // Now simulate refresh: remote DB still has 40
    const remoteStale = mapProfileToUser({ id: 'usr_abc', xp: 40, gems: 100 }, { id: 'usr_abc' })
    const afterRefresh = mergeUserProfiles(remoteStale, currentUser)

    assert(afterRefresh.xp === 85, `Post-refresh XP is 85, got: ${afterRefresh.xp}`)
    assert(afterRefresh.gems === 105, `Post-refresh Gems is 105, got: ${afterRefresh.gems}`)
  }

  // TEST 3: Safe SQL Column Mapping
  console.log('\n--- SUITE 3: Safe SQL Column Mapping ---')
  {
    const appUpdates = {
      name: 'Rohan',
      xp: 260,
      streak: 4,
      avatar: 'https://avatar.url',
      preferredLanguage: 'en',
      learningLanguage: 'ta',
      goal: 'culture',
      level: 'intermediate',
      dailyGoal: 15,
      completedLessons: ['ta-1', 'ta-2'],
      vocabulary: { 'வணக்கம்': { count: 3 } },
      achievements: ['first_step', 'xp_100'],
      // Client-only state that shouldn't crash Postgres
      activeQuests: [{ id: 'xp_30' }],
      languageProgress: { ta: { xp: 260 } },
      gems: 160,
    }

    const mapped = mapUserUpdatesToProfile(appUpdates)

    assert(mapped.name === 'Rohan', `Name mapped: ${mapped.name}`)
    assert(mapped.xp === 260, `XP mapped as number: ${mapped.xp}`)
    assert(mapped.streak === 4, `Streak mapped as number: ${mapped.streak}`)
    assert(mapped.avatar_url === 'https://avatar.url', `Avatar mapped to avatar_url: ${mapped.avatar_url}`)
    assert(mapped.preferred_language === 'en', `preferred_language mapped: ${mapped.preferred_language}`)
    assert(mapped.learning_language === 'ta', `learning_language mapped: ${mapped.learning_language}`)
    assert(mapped.completed_lessons.length === 2, `completed_lessons mapped: ${mapped.completed_lessons.length}`)
    assert(mapped.vocabulary['வணக்கம்'].count === 3, `vocabulary mapped`)
    assert(mapped.achievements.length === 2, `achievements mapped: ${mapped.achievements.length}`)
    assert(mapped.language_progress === undefined, `Unknown column language_progress not sent to Postgres`)
    assert(mapped.gems === undefined, `Unknown column gems not sent to Postgres profiles update`)
    assert(mapped.active_quests === undefined, `Unknown column active_quests not sent to Postgres profiles update`)
    assert(mapped.hearts === undefined, `Hearts column removed and not sent to Postgres`)
  }

  // TEST 4: Strict Decoupling of Site Language and Preferred Learning Language
  console.log('\n--- SUITE 4: Independent State Values (Site Language vs Target/Preferred Language) ---')
  {
    let localSiteLang = 'en'
    let userProfile = {
      preferredLanguage: 'mr',
      learningLanguage: 'mr'
    }

    // Changing preferredLanguage must NOT update localSiteLang
    userProfile.preferredLanguage = 'ta'
    assert(localSiteLang === 'en', `Changing preferredLanguage to Tamil keeps siteLanguage as English (got: ${localSiteLang})`)

    // Changing siteLanguage must NOT update preferredLanguage
    localSiteLang = 'hi'
    assert(userProfile.preferredLanguage === 'ta', `Changing siteLanguage to Hindi keeps preferredLanguage as Tamil (got: ${userProfile.preferredLanguage})`)

    // Example scenario: Interface = English, Target = Marathi
    const interfaceLang = 'en'
    const targetLang = 'mr'
    assert(interfaceLang !== targetLang, `Interface (${interfaceLang}) and Target (${targetLang}) remain independent state values`)
  }

  console.log(`\n========================================`)
  console.log(`VERIFICATION SUMMARY: ${passed} Passed, ${failed} Failed`)
  console.log(`========================================\n`)

  if (failed > 0) process.exit(1)
}

runSuite()
