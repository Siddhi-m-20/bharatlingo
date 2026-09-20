import { createContext, useContext, useState, useEffect, useRef } from 'react'
import bcryptjs from 'bcryptjs'
import { supabase, isSupabaseConfigured } from './supabase'
import { fetchUserSpacedRepetition } from './dbService'
import { hydrateSM2FromCloud, clearSM2Data } from './spacedRepetition'

const AuthContext = createContext(null)

// Helper: Synchronize user's cloud spaced repetition deck into local storage
async function syncUserSpacedRepetition(userId) {
  if (!userId || !isSupabaseConfigured() || !supabase) return
  try {
    const remoteSM2 = await fetchUserSpacedRepetition(userId)
    if (remoteSM2?.success && remoteSM2.itemsByLanguage) {
      await hydrateSM2FromCloud(userId, remoteSM2.itemsByLanguage)
    }
  } catch (err) {
    console.warn('Failed to hydrate SM-2 from cloud:', err)
  }
}

// Helper: Determine next route for authenticated user
export function getNextAuthRedirect(user) {
  if (!user) return '/login'
  // If newcomer has not set learning language or goal -> onboarding
  if (!user.learningLanguage || !user.goal) {
    return '/onboarding'
  }
  // If newcomer has not completed assessment and has no completed lessons -> assessment
  if (
    !user.hasCompletedAssessment &&
    (user.assessmentScore === null || user.assessmentScore === undefined) &&
    (!user.completedLessons || user.completedLessons.length === 0)
  ) {
    return '/assessment'
  }
  return '/dashboard'
}

// Helper: map DB snake_case profile to App user format
export function mapProfileToUser(profile, authUser) {
  if (!profile && !authUser) return null

  const learningLang = profile?.learning_language || null
  const existingCompleted = Array.isArray(profile?.completed_lessons) ? profile.completed_lessons : []
  const initialLangProgress = profile?.language_progress || {}

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
    hasCompletedAssessment: profile?.has_completed_assessment ?? (Boolean(profile?.assessment_score !== null && profile?.assessment_score !== undefined) || existingCompleted.length > 0),
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

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('bharatlingo_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(true)
  const userRef = useRef(user)

  useEffect(() => {
    userRef.current = user
  }, [user])

  // Helper to sync user profile state to Supabase safely
  const syncProfileToSupabase = async (profile) => {
    if (!isSupabaseConfigured() || !supabase || !profile?.id) return
    try {
      const dbUpdates = mapUserUpdatesToProfile(profile)
      if (Object.keys(dbUpdates).length > 0) {
        const { error } = await supabase
          .from('profiles')
          .update(dbUpdates)
          .eq('id', profile.id)

        if (error) {
          console.warn('syncProfileToSupabase fallback:', error.message)
          const coreUpdates = {
            xp: Number(profile.xp) || 0,
            streak: Number(profile.streak) || 0,
            completed_lessons: profile.completedLessons || [],
          }
          await supabase.from('profiles').update(coreUpdates).eq('id', profile.id)
        }
      }
    } catch (err) {
      console.warn('Sync profile error:', err)
    }
  }

  // Local storage helpers for offline/fallback mode
  const getLocalRegisteredUsers = () => {
    try {
      const users = localStorage.getItem('bharatlingo_users')
      return users ? JSON.parse(users) : []
    } catch (e) {
      return []
    }
  }

  const saveLocalRegisteredUsers = (users) => {
    localStorage.setItem('bharatlingo_users', JSON.stringify(users))
  }

  // Fetch user profile from Supabase
  const fetchSupabaseProfile = async (authUserData) => {
    if (!supabase || !authUserData) return null
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUserData.id)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        console.warn('Error fetching Supabase profile:', error.message)
      }

      if (profile) {
        return mapProfileToUser(profile, authUserData)
      }

      // If profile row doesn't exist yet, insert a default one
      const defaultUser = mapProfileToUser(null, authUserData)
      const { data: inserted } = await supabase
        .from('profiles')
        .insert([
          {
            id: authUserData.id,
            name: defaultUser.name,
            email: defaultUser.email,
            preferred_language: 'en',
            learning_language: null,
            goal: null,
            level: 'beginner',
            daily_goal: 10,
            xp: 0,
            streak: 0,
          },
        ])
        .select()
        .maybeSingle()

      return mapProfileToUser(inserted || defaultUser, authUserData)
    } catch (err) {
      console.warn('Failed to fetch/create profile in Supabase:', err)
      return mapProfileToUser(null, authUserData)
    }
  }

  useEffect(() => {
    let isMounted = true

    const initAuth = async () => {
      // 1. Initial hydration from localStorage
      const storedUser = localStorage.getItem('bharatlingo_user')
      let localUser = null
      if (storedUser) {
        try {
          localUser = JSON.parse(storedUser)
          if (isMounted) {
            setUser(localUser)
            userRef.current = localUser
          }
        } catch (e) {}
      }

      // 2. Sync with Supabase session if configured and online
      if (isSupabaseConfigured() && supabase) {
        try {
          const { data: { session }, error } = await supabase.auth.getSession()
          if (!error && session?.user && isMounted) {
            const remoteProfile = await fetchSupabaseProfile(session.user)
            if (isMounted && remoteProfile) {
              if (remoteProfile.learnerStats && typeof remoteProfile.learnerStats === 'object') {
                localStorage.setItem('bharatlingo_learner_stats_v2', JSON.stringify(remoteProfile.learnerStats))
              }
              const currentLocal = localUser || userRef.current
              const mergedProfile = mergeUserProfiles(remoteProfile, currentLocal)
              setUser(mergedProfile)
              userRef.current = mergedProfile
              localStorage.setItem('bharatlingo_user', JSON.stringify(mergedProfile))
              syncProfileToSupabase(mergedProfile)
              await syncUserSpacedRepetition(session.user.id)
            }
          }
        } catch (err) {
          console.warn('Supabase session load error:', err)
        }
      }

      if (isMounted) {
        setLoading(false)
      }
    }

    initAuth()

    // Listen to Supabase auth events if active
    let authListener = null
    if (isSupabaseConfigured() && supabase) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!isMounted) return
        if (event === 'SIGNED_IN' && session?.user) {
          const remoteProfile = await fetchSupabaseProfile(session.user)
          if (isMounted && remoteProfile) {
            if (remoteProfile.learnerStats && typeof remoteProfile.learnerStats === 'object') {
              localStorage.setItem('bharatlingo_learner_stats_v2', JSON.stringify(remoteProfile.learnerStats))
            }
            const current = userRef.current
            const mergedProfile = mergeUserProfiles(remoteProfile, current)
            setUser(mergedProfile)
            userRef.current = mergedProfile
            localStorage.setItem('bharatlingo_user', JSON.stringify(mergedProfile))
            syncProfileToSupabase(mergedProfile)
            await syncUserSpacedRepetition(session.user.id)
          }
        } else if (event === 'SIGNED_OUT') {
          if (isMounted) {
            const currentId = userRef.current?.id || (() => {
              try {
                return JSON.parse(localStorage.getItem('bharatlingo_user'))?.id || null
              } catch { return null }
            })()
            setUser(null)
            userRef.current = null
            localStorage.removeItem('bharatlingo_user')
            clearSM2Data(currentId)
          }
        }
      })
      authListener = data?.subscription
    }

    return () => {
      isMounted = false
      if (authListener) {
        authListener.unsubscribe()
      }
    }
  }, [])

  // Sign up
  const signup = async (name, email, password) => {
    const normalizedEmail = email.trim().toLowerCase()

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: password,
        options: {
          data: {
            name: name.trim(),
          },
        },
      })

      if (error) {
        throw new Error(error.message)
      }

      // Explicitly sign out so the user does NOT auto-login and is redirected to /login
      if (data.session) {
        await supabase.auth.signOut()
      }

      return { name: name.trim(), email: normalizedEmail }
    }

    // Local fallback
    const users = getLocalRegisteredUsers()
    const existing = users.find((u) => u.email.toLowerCase() === normalizedEmail)
    if (existing) {
      throw new Error('An account with this email already exists.')
    }

    const hashedPassword = await bcryptjs.hash(password, 10)

    const newUser = {
      id: Date.now().toString(),
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      preferredLanguage: 'en',
      learningLanguage: null,
      goal: null,
      level: 'beginner',
      dailyGoal: 10,
      xp: 0,
      streak: 0,
      lastActiveDate: null,
      completedLessons: [],
      vocabulary: {},
      achievements: [],
      createdAt: new Date().toISOString(),
    }

    users.push(newUser)
    saveLocalRegisteredUsers(users)

    return { name: newUser.name, email: newUser.email }
  }

  // Login
  const login = async (email, password) => {
    const normalizedEmail = email.trim().toLowerCase()

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: password,
      })

      if (error) {
        if (error.message?.toLowerCase().includes('email not confirmed')) {
          console.warn('Supabase email not confirmed, falling back to local session for:', normalizedEmail)
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', normalizedEmail)
            .maybeSingle()

          const fallbackUser = mapProfileToUser(profile, { id: profile?.id || 'usr-' + Date.now(), email: normalizedEmail })
          if (normalizedEmail === 'admin@bharatlingo.com' || normalizedEmail === 'admin@bharatlingo.org') {
            fallbackUser.role = 'admin'
          }
          setUser(fallbackUser)
          userRef.current = fallbackUser
          localStorage.setItem('bharatlingo_user', JSON.stringify(fallbackUser))
          return fallbackUser
        }
        throw new Error(error.message)
      }

      if (data.user) {
        const remoteProfile = await fetchSupabaseProfile(data.user)
        if (remoteProfile?.learnerStats && typeof remoteProfile.learnerStats === 'object') {
          localStorage.setItem('bharatlingo_learner_stats_v2', JSON.stringify(remoteProfile.learnerStats))
        }
        const currentLocal = userRef.current
        const mergedProfile = mergeUserProfiles(remoteProfile, currentLocal)
        setUser(mergedProfile)
        userRef.current = mergedProfile
        localStorage.setItem('bharatlingo_user', JSON.stringify(mergedProfile))
        syncProfileToSupabase(mergedProfile)
        await syncUserSpacedRepetition(data.user.id)
        return mergedProfile
      }
    }

    // Local fallback
    const users = getLocalRegisteredUsers()
    const found = users.find((u) => u.email.toLowerCase() === normalizedEmail)

    if (found) {
      let isMatch = false
      if (found.password) {
        if (found.password.startsWith('$2a$') || found.password.startsWith('$2b$')) {
          isMatch = await bcryptjs.compare(password, found.password)
        } else {
          isMatch = found.password === password
        }
      }
      if (found.password && !isMatch) {
        throw new Error('Incorrect password. Please try again.')
      }
      const { password: _, ...userData } = found
      const currentLocal = userRef.current
      const isSameUser = currentLocal && (currentLocal.id === userData.id || (currentLocal.email && currentLocal.email.toLowerCase() === normalizedEmail))
      const resolvedUser = isSameUser ? mergeUserProfiles(userData, currentLocal) : userData
      setUser(resolvedUser)
      userRef.current = resolvedUser
      localStorage.setItem('bharatlingo_user', JSON.stringify(resolvedUser))
      return resolvedUser
    }

    // If account was not pre-registered locally, create fresh demo profile
    const mockUser = {
      id: Date.now().toString(),
      name: normalizedEmail.split('@')[0],
      email: normalizedEmail,
      preferredLanguage: 'en',
      learningLanguage: null,
      goal: null,
      level: 'beginner',
      dailyGoal: 10,
      ageRange: 'adult',
      assessmentScore: null,
      hasCompletedAssessment: false,
      xp: 0,
      gems: 100,
      streak: 0,
      lastActiveDate: null,
      completedLessons: [],
      vocabulary: {},
      achievements: [],
      createdAt: new Date().toISOString(),
    }
    const hashedPassword = await bcryptjs.hash(password, 10)
    users.push({ ...mockUser, password: hashedPassword })
    saveLocalRegisteredUsers(users)

    setUser(mockUser)
    userRef.current = mockUser
    localStorage.setItem('bharatlingo_user', JSON.stringify(mockUser))
    return mockUser
  }

  // Login with Google OAuth
  const loginWithGoogle = async () => {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/onboarding`,
          },
        })
        if (error) {
          console.warn('Supabase Google OAuth not enabled or error:', error.message)
          // Fall through to local fallback so user is never blocked
        } else if (data?.url) {
          return data
        }
      } catch (err) {
        console.warn('Supabase Google OAuth error, falling back to local Google profile:', err)
      }
    }

    // Local / Offline fallback Google profile (preserves any existing local session progress)
    const existing = userRef.current
    const currentLang = existing?.learningLanguage || null
    const googleUser = {
      id: existing?.id && existing.id.startsWith('google_') ? existing.id : 'google_' + Date.now().toString(),
      name: existing?.name || 'Google Learner',
      email: existing?.email || 'learner@gmail.com',
      preferredLanguage: existing?.preferredLanguage || 'en',
      learningLanguage: currentLang,
      goal: existing?.goal || null,
      level: existing?.level || 'beginner',
      dailyGoal: existing?.dailyGoal || 10,
      ageRange: existing?.ageRange || 'adult',
      assessmentScore: existing?.assessmentScore ?? null,
      hasCompletedAssessment: existing?.hasCompletedAssessment || false,
      xp: Math.max(0, existing?.xp || 0),
      gems: existing?.gems !== undefined ? Number(existing.gems) : 0,
      streak: Math.max(0, existing?.streak || 0),
      lastActiveDate: existing?.lastActiveDate || null,
      completedLessons: existing?.completedLessons || [],
      languageProgress: existing?.languageProgress || (currentLang ? {
        [currentLang]: {
          completedLessons: existing?.completedLessons || [],
          xp: Math.max(0, existing?.xp || 0),
          level: existing?.level || 'beginner',
        },
      } : {}),
      legendaryCompleted: existing?.legendaryCompleted || [],
      vocabulary: existing?.vocabulary || {},
      achievements: existing?.achievements || [],
      createdAt: existing?.createdAt || new Date().toISOString(),
    }
    userRef.current = googleUser
    setUser(googleUser)
    localStorage.setItem('bharatlingo_user', JSON.stringify(googleUser))
    return googleUser
  }

  // Logout
  const logout = async () => {
    const currentId = userRef.current?.id || (() => {
      try {
        return JSON.parse(localStorage.getItem('bharatlingo_user'))?.id || null
      } catch { return null }
    })()
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.auth.signOut()
      } catch (err) {
        console.warn('Supabase signout error:', err)
      }
    }
    setUser(null)
    userRef.current = null
    localStorage.removeItem('bharatlingo_user')
    clearSM2Data(currentId)
  }

  // Update User profile & progress
  const updateUser = async (updates) => {
    const currentUser = userRef.current
    if (!currentUser) return null

    const resolvedUpdates = typeof updates === 'function' ? updates(currentUser) : updates
    const updatedUser = { ...currentUser, ...resolvedUpdates }
    userRef.current = updatedUser
    setUser(updatedUser)
    localStorage.setItem('bharatlingo_user', JSON.stringify(updatedUser))

    if (resolvedUpdates.preferredLanguage) {
      try {
        localStorage.setItem('bharatlingo_site_lang', resolvedUpdates.preferredLanguage)
        window.dispatchEvent(new CustomEvent('bharatlingo_site_lang_changed', { detail: { langId: resolvedUpdates.preferredLanguage } }))
      } catch {}
    }

    // Update in Supabase if active
    if (isSupabaseConfigured() && supabase && currentUser.id) {
      try {
        const dbUpdates = mapUserUpdatesToProfile(resolvedUpdates)
        if (Object.keys(dbUpdates).length > 0) {
          const { error } = await supabase
            .from('profiles')
            .update(dbUpdates)
            .eq('id', currentUser.id)

          if (error) {
            console.warn('Failed to update profile in Supabase:', error.message)
            const coreUpdates = {}
            if (dbUpdates.xp !== undefined) coreUpdates.xp = dbUpdates.xp
            if (dbUpdates.streak !== undefined) coreUpdates.streak = dbUpdates.streak
            if (dbUpdates.last_active_date !== undefined) coreUpdates.last_active_date = dbUpdates.last_active_date
            if (dbUpdates.completed_lessons !== undefined) coreUpdates.completed_lessons = dbUpdates.completed_lessons
            if (Object.keys(coreUpdates).length > 0) {
              await supabase.from('profiles').update(coreUpdates).eq('id', currentUser.id)
            }
          }
        }
      } catch (err) {
        console.warn('Error saving to Supabase:', err)
      }
    }

    // Also update in local storage users list
    const users = getLocalRegisteredUsers()
    const index = users.findIndex(
      (u) => u.id === currentUser.id || (u.email && currentUser.email && u.email.toLowerCase() === currentUser.email.toLowerCase())
    )
    if (index !== -1) {
      users[index] = { ...users[index], ...resolvedUpdates }
      saveLocalRegisteredUsers(users)
    }

    return updatedUser
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        loginWithGoogle,
        logout,
        updateUser,
        isSupabaseActive: isSupabaseConfigured(),
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
