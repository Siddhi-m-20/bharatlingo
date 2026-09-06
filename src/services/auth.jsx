import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { supabase, isSupabaseConfigured } from './supabase'

const AuthContext = createContext(null)

// Helper: map DB snake_case profile to App user format
function mapProfileToUser(profile, authUser) {
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
    avatar: profile?.avatar || null,
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
    xp: profile?.xp || 0,
    gems: profile?.gems !== undefined ? profile.gems : 100,
    hearts: profile?.hearts !== undefined ? profile.hearts : 5,
    streak: profile?.streak || 0,
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

// Helper: map App user updates to DB snake_case columns
function mapUserUpdatesToProfile(updates) {
  const mapped = {}
  if (updates.name !== undefined) mapped.name = updates.name
  if (updates.avatar !== undefined) mapped.avatar = updates.avatar
  if (updates.bio !== undefined) mapped.bio = updates.bio
  if (updates.preferredLanguage !== undefined) mapped.preferred_language = updates.preferredLanguage
  if (updates.learningLanguage !== undefined) mapped.learning_language = updates.learningLanguage
  if (updates.goal !== undefined) mapped.goal = updates.goal
  if (updates.level !== undefined) mapped.level = updates.level
  if (updates.dailyGoal !== undefined) mapped.daily_goal = updates.dailyGoal
  if (updates.ageRange !== undefined) mapped.age_range = updates.ageRange
  if (updates.assessmentScore !== undefined) mapped.assessment_score = updates.assessmentScore
  if (updates.hasCompletedAssessment !== undefined) mapped.has_completed_assessment = updates.hasCompletedAssessment
  if (updates.learningPlan !== undefined) mapped.learning_plan = updates.learningPlan
  if (updates.xp !== undefined) mapped.xp = updates.xp
  if (updates.gems !== undefined) mapped.gems = updates.gems
  if (updates.hearts !== undefined) mapped.hearts = updates.hearts
  if (updates.streak !== undefined) mapped.streak = updates.streak
  if (updates.lastActiveDate !== undefined) mapped.last_active_date = updates.lastActiveDate
  if (updates.completedLessons !== undefined) mapped.completed_lessons = updates.completedLessons
  if (updates.languageProgress !== undefined) mapped.language_progress = updates.languageProgress
  if (updates.legendaryCompleted !== undefined) mapped.legendary_completed = updates.legendaryCompleted
  if (updates.vocabulary !== undefined) mapped.vocabulary = updates.vocabulary
  if (updates.achievements !== undefined) mapped.achievements = updates.achievements
  if (updates.settings !== undefined) mapped.settings = updates.settings
  if (updates.activeQuests !== undefined) mapped.active_quests = updates.activeQuests
  return mapped
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
            const userProfile = await fetchSupabaseProfile(session.user)
            if (isMounted && userProfile) {
              // Merge local completions if present
              const mergedCompleted = Array.from(new Set([
                ...(userProfile.completedLessons || []),
                ...(localUser?.completedLessons || [])
              ]))
              const finalProfile = { ...userProfile, completedLessons: mergedCompleted }
              setUser(finalProfile)
              userRef.current = finalProfile
              localStorage.setItem('bharatlingo_user', JSON.stringify(finalProfile))
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
          const userProfile = await fetchSupabaseProfile(session.user)
          if (isMounted) {
            // Don't overwrite an in-memory user that already has onboarding data
            // with a stale DB read (race between updateUser and the auth event).
            const current = userRef.current
            if (
              current &&
              current.learningLanguage &&
              current.goal &&
              !userProfile?.learningLanguage
            ) {
              return
            }
            setUser(userProfile)
            localStorage.setItem('bharatlingo_user', JSON.stringify(userProfile))
          }
        } else if (event === 'SIGNED_OUT') {
          if (isMounted) {
            setUser(null)
            localStorage.removeItem('bharatlingo_user')
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

    const newUser = {
      id: Date.now().toString(),
      name: name.trim(),
      email: normalizedEmail,
      password: password,
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
        throw new Error(error.message)
      }

      if (data.user) {
        const userProfile = await fetchSupabaseProfile(data.user)
        setUser(userProfile)
        localStorage.setItem('bharatlingo_user', JSON.stringify(userProfile))
        return userProfile
      }
    }

    // Local fallback
    const users = getLocalRegisteredUsers()
    const found = users.find((u) => u.email.toLowerCase() === normalizedEmail)

    if (found) {
      if (found.password && found.password !== password) {
        throw new Error('Incorrect password. Please try again.')
      }
      const { password: _, ...userData } = found
      setUser(userData)
      localStorage.setItem('bharatlingo_user', JSON.stringify(userData))
      return userData
    }

    // If account was not pre-registered locally, create demo profile
    const mockUser = {
      id: Date.now().toString(),
      name: normalizedEmail.split('@')[0],
      email: normalizedEmail,
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
    users.push({ ...mockUser, password })
    saveLocalRegisteredUsers(users)

    setUser(mockUser)
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

    // Local / Offline fallback Google profile
    const googleUser = {
      id: 'google_' + Date.now().toString(),
      name: 'Google Learner',
      email: 'learner@gmail.com',
      preferredLanguage: 'en',
      learningLanguage: 'hi',
      goal: 'conversation',
      level: 'beginner',
      dailyGoal: 10,
      ageRange: 'adult',
      assessmentScore: 85,
      hasCompletedAssessment: true,
      xp: 40,
      gems: 100,
      hearts: 5,
      streak: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      completedLessons: [],
      languageProgress: {
        hi: {
          completedLessons: [],
          xp: 40,
          level: 'beginner',
        },
      },
      legendaryCompleted: [],
      vocabulary: {},
      achievements: [],
      createdAt: new Date().toISOString(),
    }
    userRef.current = googleUser
    setUser(googleUser)
    localStorage.setItem('bharatlingo_user', JSON.stringify(googleUser))
    return googleUser
  }

  // Logout
  const logout = async () => {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.auth.signOut()
      } catch (err) {
        console.warn('Supabase signout error:', err)
      }
    }
    setUser(null)
    localStorage.removeItem('bharatlingo_user')
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

    // Update in Supabase if active
    if (isSupabaseConfigured() && supabase && currentUser.id) {
      try {
        const dbUpdates = mapUserUpdatesToProfile(resolvedUpdates)
        const { error } = await supabase
          .from('profiles')
          .update(dbUpdates)
          .eq('id', currentUser.id)

        if (error) {
          console.warn('Failed to update profile in Supabase:', error.message)
        }
      } catch (err) {
        console.warn('Error saving to Supabase:', err)
      }
    }

    // Also update in local storage users list
    const users = getLocalRegisteredUsers()
    const index = users.findIndex(
      (u) => u.id === currentUser.id || u.email.toLowerCase() === currentUser.email.toLowerCase()
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
