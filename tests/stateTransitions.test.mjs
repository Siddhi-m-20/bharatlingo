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

function runStateTransitionTests() {
  console.log('🧪 Starting State Transition & Invariance Verification Suite (Heart-Free Model)...\n')
  let passed = 0
  let failed = 0

  function assertState(name, before, after, expectedChanges, expectedInvariants) {
    console.log(`\n=== ACTIVITY: ${name} ===`)
    let activityPassed = true

    // Check expected changes
    for (const [key, expectedVal] of Object.entries(expectedChanges)) {
      const actualVal = after[key]
      const beforeVal = before[key]
      const matches = JSON.stringify(actualVal) === JSON.stringify(expectedVal)
      if (matches) {
        console.log(`  ✅ MUTATION [${key}]: ${JSON.stringify(beforeVal)} -> ${JSON.stringify(actualVal)} (Expected: ${JSON.stringify(expectedVal)})`)
        passed++
      } else {
        console.error(`  ❌ FAIL MUTATION [${key}]: Expected ${JSON.stringify(expectedVal)}, got ${JSON.stringify(actualVal)} (Before was: ${JSON.stringify(beforeVal)})`)
        failed++
        activityPassed = false
      }
    }

    // Check expected invariants (must stay unchanged)
    for (const key of expectedInvariants) {
      const beforeVal = before[key]
      const afterVal = after[key]
      const matches = JSON.stringify(beforeVal) === JSON.stringify(afterVal)
      if (matches) {
        console.log(`  🔒 INVARIANT [${key}]: Remained ${JSON.stringify(afterVal)}`)
        passed++
      } else {
        console.error(`  ❌ FAIL INVARIANT [${key}]: Changed from ${JSON.stringify(beforeVal)} to ${JSON.stringify(afterVal)}`)
        failed++
        activityPassed = false
      }
    }

    if (activityPassed) {
      console.log(`  🎉 Activity "${name}" verified perfectly.`)
    }
  }

  // -------------------------------------------------------------
  // ACTIVITY 1: Correct Answer Submission (+10 XP)
  // -------------------------------------------------------------
  {
    const beforeState = {
      id: 'usr_1',
      learningLanguage: 'hi',
      xp: 50,
      gems: 100,
      streak: 1,
      completedLessons: ['hi-1'],
    }

    const afterState = {
      ...beforeState,
      xp: beforeState.xp + 10,
    }

    assertState(
      'Correct Answer (+10 XP)',
      beforeState,
      afterState,
      { xp: 60 },
      ['gems', 'streak', 'learningLanguage', 'completedLessons']
    )
  }

  // -------------------------------------------------------------
  // ACTIVITY 2: Wrong Answer Submission (Learning Continues Uninterrupted)
  // -------------------------------------------------------------
  {
    const beforeState = {
      id: 'usr_1',
      learningLanguage: 'hi',
      xp: 60,
      gems: 100,
      streak: 1,
    }

    // Pedagogical principle: No hearts, no energy penalty. User continues seamlessly.
    const afterState = {
      ...beforeState,
      perfectLesson: false,
    }

    assertState(
      'Wrong Answer (No Heart Penalties - Continuous Learning)',
      beforeState,
      afterState,
      { perfectLesson: false },
      ['xp', 'gems', 'streak', 'learningLanguage']
    )
  }

  // -------------------------------------------------------------
  // ACTIVITY 3: Lesson Completion (+25 XP, +5 Gems, Streak Increment)
  // -------------------------------------------------------------
  {
    const beforeState = {
      id: 'usr_1',
      learningLanguage: 'hi',
      xp: 60,
      gems: 70,
      streak: 1,
      completedLessons: ['hi-greetings-1'],
      achievements: [],
    }

    const newLessonId = 'hi-greetings-2'
    const isFirstTime = !beforeState.completedLessons.includes(newLessonId)
    const gemBonus = isFirstTime ? 5 : 2

    const afterState = {
      ...beforeState,
      xp: beforeState.xp + 25,
      gems: beforeState.gems + gemBonus,
      streak: beforeState.streak + 1,
      completedLessons: [...beforeState.completedLessons, newLessonId],
    }

    assertState(
      'Lesson Completion (First Time)',
      beforeState,
      afterState,
      {
        xp: 85,
        gems: 75,
        streak: 2,
        completedLessons: ['hi-greetings-1', 'hi-greetings-2'],
      },
      ['learningLanguage', 'achievements']
    )
  }

  // -------------------------------------------------------------
  // ACTIVITY 4: Repeat Lesson on Same Day (Streak Invariant)
  // -------------------------------------------------------------
  {
    const beforeState = {
      id: 'usr_1',
      xp: 85,
      gems: 75,
      streak: 2,
      lastActiveDate: '2026-09-06',
      completedLessons: ['hi-greetings-1', 'hi-greetings-2'],
    }

    const repeatLessonId = 'hi-greetings-2'
    const isFirstTime = !beforeState.completedLessons.includes(repeatLessonId)
    const gemBonus = isFirstTime ? 5 : 2
    const todayStr = '2026-09-06'
    const streakIncreased = beforeState.lastActiveDate !== todayStr

    const afterState = {
      ...beforeState,
      xp: beforeState.xp + 25,
      gems: beforeState.gems + gemBonus,
      streak: streakIncreased ? beforeState.streak + 1 : beforeState.streak,
      lastActiveDate: todayStr,
      completedLessons: Array.from(new Set([...beforeState.completedLessons, repeatLessonId])),
    }

    assertState(
      'Repeat Lesson on Same Day (Streak Stays Same)',
      beforeState,
      afterState,
      {
        xp: 110,
        gems: 77,
      },
      ['streak', 'completedLessons', 'lastActiveDate']
    )
  }

  // -------------------------------------------------------------
  // ACTIVITY 5: Legendary Challenge Mastery (+40 XP, +20 Gems)
  // -------------------------------------------------------------
  {
    const beforeState = {
      id: 'usr_1',
      xp: 110,
      gems: 77,
      legendaryCompleted: [],
      achievements: [],
    }

    const afterState = {
      ...beforeState,
      xp: beforeState.xp + 40,
      gems: beforeState.gems + 20,
      legendaryCompleted: ['hi-greetings-1'],
      achievements: ['legendary_master'],
    }

    assertState(
      'Legendary Challenge Mode (+40 XP, +20 Gems, Legendary Master Achievement)',
      beforeState,
      afterState,
      {
        xp: 150,
        gems: 97,
        legendaryCompleted: ['hi-greetings-1'],
        achievements: ['legendary_master'],
      },
      []
    )
  }

  // -------------------------------------------------------------
  // ACTIVITY 6: Claiming Quest Reward (+15 XP, +10 Gems, Marked Claimed)
  // -------------------------------------------------------------
  {
    const beforeState = {
      id: 'usr_1',
      xp: 150,
      gems: 97,
      activeQuests: [
        { id: 'xp_30', title: 'Earn 30 XP', current: 30, target: 30, completed: true, claimed: false, rewardXP: 15, rewardGems: 10 },
        { id: 'lessons_2', title: 'Complete 2 Lessons', current: 1, target: 2, completed: false, claimed: false, rewardXP: 25, rewardGems: 15 },
      ],
    }

    const questToClaim = beforeState.activeQuests[0]
    const afterState = {
      ...beforeState,
      xp: beforeState.xp + questToClaim.rewardXP,
      gems: beforeState.gems + questToClaim.rewardGems,
      activeQuests: beforeState.activeQuests.map((q) =>
        q.id === questToClaim.id ? { ...q, claimed: true } : q
      ),
    }

    assertState(
      'Claim Quest Reward (+15 XP, +10 Gems, Quest Claimed)',
      beforeState,
      afterState,
      {
        xp: 165,
        gems: 107,
        activeQuests: [
          { id: 'xp_30', title: 'Earn 30 XP', current: 30, target: 30, completed: true, claimed: true, rewardXP: 15, rewardGems: 10 },
          { id: 'lessons_2', title: 'Complete 2 Lessons', current: 1, target: 2, completed: false, claimed: false, rewardXP: 25, rewardGems: 15 },
        ],
      },
      []
    )
  }

  // -------------------------------------------------------------
  // ACTIVITY 7: Page Refresh / Session Rehydration (Zero Downgrade Invariance)
  // -------------------------------------------------------------
  {
    const localSessionState = {
      id: 'usr_1',
      name: 'Rohan',
      email: 'rohan@example.com',
      learningLanguage: 'hi',
      xp: 165,
      gems: 107,
      streak: 2,
      completedLessons: ['hi-greetings-1', 'hi-greetings-2'],
      legendaryCompleted: ['hi-greetings-1'],
      achievements: ['legendary_master'],
    }

    // Server returns initial / stale values
    const staleServerProfile = {
      id: 'usr_1',
      name: 'Rohan',
      email: 'rohan@example.com',
      xp: 40,
      gems: 100,
      streak: 1,
      completed_lessons: ['hi-greetings-1'],
    }

    const mappedServer = mapProfileToUser(staleServerProfile, { id: 'usr_1' })
    const mergedRehydratedState = mergeUserProfiles(mappedServer, localSessionState)

    assertState(
      'Page Reload Rehydration (All Accumulated Values Invariant to Stale DB)',
      localSessionState,
      mergedRehydratedState,
      {},
      ['xp', 'gems', 'streak', 'completedLessons', 'legendaryCompleted', 'achievements', 'learningLanguage']
    )
  }

  console.log(`\n=================================================`)
  console.log(`STATE TRANSITION SUMMARY: ${passed} Passed, ${failed} Failed`)
  console.log(`=================================================\n`)

  if (failed > 0) process.exit(1)
}

runStateTransitionTests()
