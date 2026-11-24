/**
 * BharatLingo Authentication & User Profile Routing Utilities
 * Pure JavaScript helpers for user journey validation, profile mapping, and ACID state merging.
 */

// Helper: Synchronize site language across storage and events
export function syncSiteLanguage(langId) {
  if (!langId) return
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('bharatlingo_site_lang', langId)
    }
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(
        new CustomEvent('bharatlingo_site_lang_changed', {
          detail: { langId },
        })
      )
    }
  } catch (e) {
    console.error(e)
  }
}

// Helper: Check if user has completed onboarding
export function hasUserCompletedOnboarding(user) {
  if (!user) return false
  if (user.learningLanguage) return true
  // Safe recovery for existing learners with progress but missing explicit learningLanguage
  if (user.languageProgress && Object.keys(user.languageProgress).length > 0) return true
  if (Array.isArray(user.completedLessons) && user.completedLessons.length > 0) return true
  return false
}

// Helper: Check if user has completed initial assessment
export function hasUserCompletedAssessment(user) {
  if (!user) return false
  return Boolean(
    user.hasCompletedAssessment ||
    (user.assessmentScore !== null && user.assessmentScore !== undefined) ||
    user.learningPlan ||
    (Array.isArray(user.completedLessons) && user.completedLessons.length > 0)
  )
}

// Helper: Determine next route for authenticated user
export function getNextAuthRedirect(user, requestedPath = null) {
  if (!user) return '/login'
  // 1. If onboarding is incomplete, must go to onboarding
  if (!hasUserCompletedOnboarding(user)) {
    return '/onboarding'
  }
  // 2. If assessment has not been completed, must go to assessment
  if (!hasUserCompletedAssessment(user)) {
    return '/assessment'
  }
  // 3. Both completed -> return the route that triggered login, never overwrite it with dashboard
  if (typeof requestedPath === 'string' && requestedPath.startsWith('/')) {
    const publicAndJourneyPaths = ['/', '/login', '/signup', '/onboarding', '/assessment']
    if (!publicAndJourneyPaths.includes(requestedPath)) {
      return requestedPath
    }
  }
  // 4. No valid requested route -> dashboard
  return '/dashboard'
}

// Helper: map DB snake_case profile to App user format
export function mapProfileToUser(profile, authUser) {
  if (!profile && !authUser) return null

  let learningLang = profile?.learning_language || null
  const existingCompleted = Array.isArray(profile?.completed_lessons) ? profile.completed_lessons : []
  const initialLangProgress = profile?.language_progress || {}

  // If learningLanguage was not explicitly set but user has recorded progress, safely infer it
  if (!learningLang && Object.keys(initialLangProgress).length > 0) {
    learningLang = Object.keys(initialLangProgress)[0]
  }

  // Initialize or ensure active learning language progress exists
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

  const hasAssessment = Boolean(
    profile?.has_completed_assessment ||
    (profile?.assessment_score !== null && profile?.assessment_score !== undefined) ||
    existingCompleted.length > 0 ||
    profile?.learning_plan
  )

  return {
    id: profile?.id || authUser?.id,
    name: profile?.name || authUser?.user_metadata?.name || authUser?.email?.split('@')[0] || 'Learner',
    email: profile?.email || authUser?.email,
    avatar: profile?.avatar_url || profile?.avatar || null,
    bio: profile?.bio || '',
    preferredLanguage: profile?.preferred_language || 'en',
    learningLanguage: learningLang,
    goal: profile?.goal || null,
    level: profile?.level || 'beginner',
    dailyGoal: profile?.daily_goal || 10,
    ageRange: profile?.age_range || 'adult',
    assessmentScore: profile?.assessment_score ?? null,
    hasCompletedAssessment: hasAssessment,
    learningPlan: profile?.learning_plan || null,
    xp: Number(profile?.xp) || 0,
    gems: profile?.gems !== undefined ? Number(profile.gems) : 0,
    streak: Number(profile?.streak) || 0,
    lastActiveDate: profile?.last_active_date || null,
    completedLessons: existingCompleted,
    languageProgress: initialLangProgress,
    legendaryCompleted: profile?.legendary_completed || [],
    vocabulary: profile?.vocabulary || {},
    achievements: profile?.achievements || [],
    completedStories: profile?.completed_stories || [],
    learnerStats: profile?.learner_stats || {},
    settings: profile?.settings || { audio: true, soundFx: true, speaking: true },
    activeQuests: profile?.active_quests || null,
    createdAt: profile?.created_at || new Date().toISOString(),
  }
}

// Helper: map App user updates to DB snake_case columns (strictly maps supported DB columns)
export function mapUserUpdatesToProfile(updates) {
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
  if (updates.hasCompletedAssessment !== undefined) mapped.has_completed_assessment = updates.hasCompletedAssessment
  if (updates.learningPlan !== undefined) mapped.learning_plan = updates.learningPlan
  if (updates.xp !== undefined) mapped.xp = Number(updates.xp)
  if (updates.streak !== undefined) mapped.streak = Number(updates.streak)
  if (updates.lastActiveDate !== undefined) mapped.last_active_date = updates.lastActiveDate
  if (updates.completedLessons !== undefined) mapped.completed_lessons = updates.completedLessons
  if (updates.vocabulary !== undefined) mapped.vocabulary = updates.vocabulary
  if (updates.achievements !== undefined) mapped.achievements = updates.achievements
  if (updates.bio !== undefined) mapped.bio = updates.bio
  if (updates.gems !== undefined) mapped.gems = Number(updates.gems)
  if (updates.languageProgress !== undefined) mapped.language_progress = updates.languageProgress
  if (updates.legendaryCompleted !== undefined) mapped.legendary_completed = updates.legendaryCompleted
  if (updates.activeQuests !== undefined) mapped.active_quests = updates.activeQuests
  if (updates.completedStories !== undefined) mapped.completed_stories = updates.completedStories
  if (updates.learnerStats !== undefined) mapped.learner_stats = updates.learnerStats
  if (updates.settings !== undefined) mapped.settings = updates.settings
  return mapped
}

/**
 * Robust Profile Merger:
 * Combines remote database profile with locally cached user state.
 * Guaranteed to NEVER decrease XP, gems, streak or lose completed lessons upon refresh.
 */
export function mergeUserProfiles(remoteProfile, localProfile) {
  if (!remoteProfile && !localProfile) return null
  if (!remoteProfile) return localProfile
  if (!localProfile) return remoteProfile

  // CRITICAL USER ISOLATION GUARD:
  const isSameUser =
    (remoteProfile.id && localProfile.id && String(remoteProfile.id) === String(localProfile.id)) ||
    (remoteProfile.email && localProfile.email && remoteProfile.email.toLowerCase() === localProfile.email.toLowerCase())

  if (!isSameUser) {
    return remoteProfile
  }

  // Merge completed lessons (union)
  const mergedCompleted = Array.from(
    new Set([
      ...(Array.isArray(remoteProfile.completedLessons) ? remoteProfile.completedLessons : []),
      ...(Array.isArray(localProfile.completedLessons) ? localProfile.completedLessons : []),
    ])
  )

  // Merge legendary completed (union)
  const mergedLegendary = Array.from(
    new Set([
      ...(Array.isArray(remoteProfile.legendaryCompleted) ? remoteProfile.legendaryCompleted : []),
      ...(Array.isArray(localProfile.legendaryCompleted) ? localProfile.legendaryCompleted : []),
    ])
  )

  // Merge achievements (union)
  const mergedAchievements = Array.from(
    new Set([
      ...(Array.isArray(remoteProfile.achievements) ? remoteProfile.achievements : []),
      ...(Array.isArray(localProfile.achievements) ? localProfile.achievements : []),
    ])
  )

  // Merge language progress dictionaries
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

  // Monotonic metrics (never decrease on sync/reload)
  const remoteXP = Number(remoteProfile.xp) || 0
  const localXP = Number(localProfile.xp) || 0
  const mergedXP = Math.max(remoteXP, localXP)

  const remoteGems = remoteProfile.gems !== undefined ? Number(remoteProfile.gems) : 0
  const localGems = localProfile.gems !== undefined ? Number(localProfile.gems) : 0
  const mergedGems = Math.max(remoteGems, localGems)

  const remoteStreak = Number(remoteProfile.streak) || 0
  const localStreak = Number(localProfile.streak) || 0
  const mergedStreak = Math.max(remoteStreak, localStreak)

  // Active quests
  const mergedQuests = localProfile.activeQuests || remoteProfile.activeQuests || null
  const mergedLearnerStats = {
    ...(remoteProfile.learnerStats || {}),
    ...(localProfile.learnerStats || {}),
  }

  return {
    ...remoteProfile,
    ...localProfile,
    id: remoteProfile.id || localProfile.id,
    name: localProfile.name || remoteProfile.name || 'Learner',
    email: remoteProfile.email || localProfile.email,
    preferredLanguage: localProfile.preferredLanguage || remoteProfile.preferredLanguage || 'en',
    learningLanguage: localProfile.learningLanguage || remoteProfile.learningLanguage || null,
    goal: localProfile.goal || remoteProfile.goal || null,
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
    learnerStats: mergedLearnerStats,
    settings: { ...(remoteProfile.settings || {}), ...(localProfile.settings || {}) },
  }
}
