import { supabase, isSupabaseConfigured } from './supabase.js'
import { languages } from '../data/languages.js'
import { rawLessonsByLanguage } from '../data/lessons/index.js'
import { alphabetDataByLanguage } from '../data/alphabets.js'
import { STROKE_DATA_BY_LANGUAGE } from '../data/strokeData.js'

/**
 * Check if the provided user has verified administrator privileges.
 * Rules:
 * 1. Checks explicit verified role in JWT / user metadata / profile (`role === 'admin'` or `is_admin === true`)
 * 2. Optionally checks explicit VITE_ADMIN_EMAIL environment configuration for designated owner
 * Never relies on hardcoded email strings or unauthenticated localStorage tokens.
 */
export function checkIsAdmin(user) {
  if (!user || !user.email) return false

  // 1. Check explicit admin role in verified user claims or profile
  if (
    user.role === 'admin' ||
    user.is_admin === true ||
    user.app_metadata?.role === 'admin' ||
    user.user_metadata?.role === 'admin'
  ) {
    return true
  }

  // 2. Check designated environment variable owner if configured
  const normalizedEmail = user.email.trim().toLowerCase()
  const envAdminEmail =
    typeof process !== 'undefined' && process.env?.VITE_ADMIN_EMAIL
      ? process.env.VITE_ADMIN_EMAIL.trim().toLowerCase()
      : null

  if (envAdminEmail && normalizedEmail === envAdminEmail) {
    return true
  }

  return false
}

/**
 * Fetch all user profiles from Supabase or fallback to local storage
 */
export async function fetchAllUserProfiles() {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && Array.isArray(data)) {
        return data
      }
      if (error) {
        console.warn('Admin fetch profiles Supabase error:', error.message)
      }
    } catch (err) {
      console.warn('Failed to query profiles in adminService:', err)
    }
  }

  // Local storage fallback for offline/development mode
  if (typeof localStorage !== 'undefined') {
    try {
      const localUsers = JSON.parse(localStorage.getItem('bharatlingo_users') || '[]')
      const currentUser = JSON.parse(localStorage.getItem('bharatlingo_user') || 'null')

      const combined = [...localUsers]
      if (currentUser && !combined.some((u) => u.id === currentUser.id || u.email === currentUser.email)) {
        combined.unshift(currentUser)
      }
      return combined
    } catch {
      return []
    }
  }

  return []
}

/**
 * Aggregate real admin overview metrics from user profiles
 */
export function aggregateAdminMetrics(profiles = []) {
  if (!Array.isArray(profiles) || profiles.length === 0) {
    return {
      totalUsers: 0,
      activeLearners: 0,
      newUsers: 0,
      supportedLanguages: languages.length,
      totalXP: 0,
      totalLessonsCompleted: 0,
      totalExercisesCompleted: 0,
      avgStreak: 0,
      targetLanguageDistribution: {},
      interfaceLanguageDistribution: {},
      users: [],
    }
  }

  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  let totalXP = 0
  let totalLessonsCompleted = 0
  let totalExercisesCompleted = 0
  let totalStreak = 0
  let activeLearners = 0
  let newUsers = 0

  const targetLangCounts = {}
  const interfaceLangCounts = {}

  const normalizedUsers = profiles.map((p) => {
    const xp = Number(p.xp) || 0
    const streak = Number(p.streak) || 0
    totalXP += xp
    totalStreak += streak

    // Target and interface languages
    const learningLang = p.learning_language || p.learningLanguage || 'unselected'
    const preferredLang = p.preferred_language || p.preferredLanguage || 'en'

    targetLangCounts[learningLang] = (targetLangCounts[learningLang] || 0) + 1
    interfaceLangCounts[preferredLang] = (interfaceLangCounts[preferredLang] || 0) + 1

    // Completed lessons count
    let completedCount = 0
    if (Array.isArray(p.completed_lessons)) {
      completedCount = p.completed_lessons.length
    } else if (Array.isArray(p.completedLessons)) {
      completedCount = p.completedLessons.length
    }
    totalLessonsCompleted += completedCount

    // Exercises completed from learner stats
    let userExercises = 0
    const statsObj = p.learner_stats || p.learnerStats || {}
    if (typeof statsObj === 'object') {
      Object.values(statsObj).forEach((langStat) => {
        if (langStat && typeof langStat === 'object') {
          userExercises += Number(langStat.totalExercises) || 0
        }
      })
    }
    totalExercisesCompleted += userExercises

    // Activity check
    const createdAt = p.created_at || p.createdAt ? new Date(p.created_at || p.createdAt) : null
    const lastActive = p.last_active_date || p.lastActiveDate ? new Date(p.last_active_date || p.lastActiveDate) : null

    if (createdAt && createdAt >= thirtyDaysAgo) {
      newUsers++
    }

    const isActive = streak > 0 || (lastActive && lastActive >= sevenDaysAgo) || xp > 0
    if (isActive) {
      activeLearners++
    }

    return {
      id: p.id,
      name: p.name || 'Anonymous Learner',
      email: p.email || 'No email',
      preferredLanguage: preferredLang,
      learningLanguage: learningLang,
      level: p.level || 'beginner',
      xp,
      streak,
      completedLessonsCount: completedCount,
      exercisesCompleted: userExercises,
      createdAt: p.created_at || p.createdAt || null,
      lastActiveDate: p.last_active_date || p.lastActiveDate || null,
      assessmentScore: p.assessment_score ?? p.assessmentScore ?? null,
      role: p.role || (checkIsAdmin(p) ? 'admin' : 'learner'),
    }
  })

  return {
    totalUsers: profiles.length,
    activeLearners,
    newUsers,
    supportedLanguages: languages.length,
    totalXP,
    totalLessonsCompleted,
    totalExercisesCompleted,
    avgStreak: profiles.length > 0 ? Math.round((totalStreak / profiles.length) * 10) / 10 : 0,
    targetLanguageDistribution: targetLangCounts,
    interfaceLanguageDistribution: interfaceLangCounts,
    users: normalizedUsers,
  }
}

/**
 * Audit content health across all 8 Indian languages
 * Checks curriculum lessons, alphabet character coverage, authentic stroke status, and content gaps
 */
export function auditContentHealth() {
  const reports = []

  languages.forEach((lang) => {
    const langId = lang.id
    const rawLessons = rawLessonsByLanguage[langId] || []
    const alphabetData = alphabetDataByLanguage[langId] || {}
    const authenticStrokes = STROKE_DATA_BY_LANGUAGE[langId] || null

    // Count alphabets
    const vowelsCount = Array.isArray(alphabetData.vowels) ? alphabetData.vowels.length : 0
    const consonantsCount = Array.isArray(alphabetData.consonants) ? alphabetData.consonants.length : 0
    const totalChars = vowelsCount + consonantsCount

    // Count total exercises in curriculum
    let exerciseCount = 0
    let vocabCount = 0
    rawLessons.forEach((les) => {
      if (Array.isArray(les.exercises)) exerciseCount += les.exercises.length
      if (Array.isArray(les.vocabulary)) vocabCount += les.vocabulary.length
    })

    // Stroke data status
    const strokeCount = authenticStrokes ? Object.keys(authenticStrokes).length : 0
    const hasAuthenticStrokes = Boolean(authenticStrokes && strokeCount > 0)

    // Detected content gaps
    const gaps = []
    if (rawLessons.length === 0) gaps.push('Missing curriculum lessons')
    if (totalChars === 0) gaps.push('Missing alphabet catalogue')
    if (!hasAuthenticStrokes) gaps.push('Pending authentic stroke tracing data')

    reports.push({
      languageId: langId,
      name: lang.name,
      nativeName: lang.nativeName,
      flag: lang.flag,
      lessonCount: rawLessons.length,
      exerciseCount,
      vocabCount,
      totalChars,
      strokeCount,
      hasAuthenticStrokes,
      strokeStatus: hasAuthenticStrokes ? 'Authentic' : 'Pending Verification',
      gaps,
      isFullyReady: gaps.length === 0,
    })
  })

  return reports
}
