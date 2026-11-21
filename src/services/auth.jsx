import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { supabase, isSupabaseConfigured } from './supabase'
import { fetchUserSpacedRepetition } from './dbService'
import { hydrateSM2FromCloud, clearSM2Data } from './spacedRepetition'

const AuthContext = createContext(null)

export {
  syncSiteLanguage,
  hasUserCompletedOnboarding,
  hasUserCompletedAssessment,
  getNextAuthRedirect,
  mapProfileToUser,
  mapUserUpdatesToProfile,
  mergeUserProfiles,
} from './authUtils.js'

import {
  syncSiteLanguage,
  hasUserCompletedOnboarding,
  hasUserCompletedAssessment,
  getNextAuthRedirect,
  mapProfileToUser,
  mapUserUpdatesToProfile,
  mergeUserProfiles,
} from './authUtils.js'

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
        let { error } = await supabase
          .from('profiles')
          .update(dbUpdates)
          .eq('id', profile.id)

        if (error) {
          console.warn('syncProfileToSupabase fallback:', error.message)
          const nonRewardUpdates = { ...dbUpdates }
          delete nonRewardUpdates.xp
          delete nonRewardUpdates.gems
          delete nonRewardUpdates.streak
          if (Object.keys(nonRewardUpdates).length > 0) {
            await supabase.from('profiles').update(nonRewardUpdates).eq('id', profile.id)
          }
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
            if (localUser.preferredLanguage) {
              syncSiteLanguage(localUser.preferredLanguage)
            }
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
              if (mergedProfile.preferredLanguage) {
                syncSiteLanguage(mergedProfile.preferredLanguage)
              }
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
            if (mergedProfile.preferredLanguage) {
              syncSiteLanguage(mergedProfile.preferredLanguage)
            }
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
            localStorage.removeItem('bharatlingo_learner_stats_v2')
            sessionStorage.removeItem('bharatlingo_assessment_required')
            sessionStorage.removeItem('bharatlingo_just_assessed')
            clearSM2Data(currentId)
            syncSiteLanguage('en')
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
        if (error.message?.toLowerCase().includes('database error saving new user')) {
          console.error(
            'Supabase auth.users trigger error: "Database error saving new user". ' +
            'This means the PostgreSQL trigger `handle_new_user()` failed in your Supabase project. ' +
            'Execute `supabase/fix_database_error_saving_new_user.sql` in your Supabase SQL Editor to fix it.'
          )
          throw new Error('Database error saving new user. Please run `supabase/fix_database_error_saving_new_user.sql` in your Supabase SQL Editor to fix the database trigger.')
        }
        throw new Error(error.message)
      }

      // If an authenticated session is active (e.g. email confirmation disabled in Supabase):
      if (data?.session && data?.user) {
        const remoteProfile = await fetchSupabaseProfile(data.user)
        const currentLocal = userRef.current
        const mergedProfile = mergeUserProfiles(remoteProfile, currentLocal)
        setUser(mergedProfile)
        userRef.current = mergedProfile
        localStorage.setItem('bharatlingo_user', JSON.stringify(mergedProfile))
        if (mergedProfile?.preferredLanguage) {
          syncSiteLanguage(mergedProfile.preferredLanguage)
        }
        syncProfileToSupabase(mergedProfile)
        return {
          user: mergedProfile,
          session: data.session,
          requiresConfirmation: false,
          name: name.trim(),
          email: normalizedEmail,
        }
      }

      // If email confirmation is required and no session exists:
      return {
        user: null,
        session: null,
        requiresConfirmation: true,
        name: name.trim(),
        email: normalizedEmail,
      }
    }

    // Local fallback
    const users = getLocalRegisteredUsers()
    const existing = users.find((u) => u.email.toLowerCase() === normalizedEmail)
    if (existing) {
      throw new Error('An account with this email already exists.')
    }

    const hashedPassword = await bcryptjs.hash(password, 10)

    const newUser = {
      id: 'local_' + Date.now().toString(),
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      preferredLanguage: 'en',
      learningLanguage: null,
      goal: null,
      level: 'beginner',
      dailyGoal: 10,
      ageRange: 'adult',
      hasCompletedAssessment: false,
      assessmentScore: null,
      learningPlan: null,
      xp: 0,
      gems: 0,
      streak: 0,
      lastActiveDate: null,
      completedLessons: [],
      languageProgress: {},
      legendaryCompleted: [],
      vocabulary: {},
      achievements: [],
      createdAt: new Date().toISOString(),
    }

    users.push(newUser)
    saveLocalRegisteredUsers(users)

    const { password: _, ...userData } = newUser
    setUser(userData)
    userRef.current = userData
    localStorage.setItem('bharatlingo_user', JSON.stringify(userData))
    syncSiteLanguage('en')

    return {
      user: userData,
      session: { local: true },
      requiresConfirmation: false,
      name: newUser.name,
      email: newUser.email,
    }
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
          // Admin role is determined by profiles.role in the database only — never hardcoded here
          setUser(fallbackUser)
          userRef.current = fallbackUser
          localStorage.setItem('bharatlingo_user', JSON.stringify(fallbackUser))
          if (fallbackUser.preferredLanguage) {
            syncSiteLanguage(fallbackUser.preferredLanguage)
          }
          return fallbackUser
        }
        throw new Error(error.message)
      }

      if (data.user) {
        const remoteProfile = await fetchSupabaseProfile(data.user)
        if (remoteProfile?.learnerStats && typeof remoteProfile.learnerStats === 'object') {
          localStorage.setItem('bharatlingo_learner_stats_v2', JSON.stringify(remoteProfile.learnerStats))
        } else {
          localStorage.removeItem('bharatlingo_learner_stats_v2')
        }
        const currentLocal = userRef.current
        const mergedProfile = mergeUserProfiles(remoteProfile, currentLocal)
        setUser(mergedProfile)
        userRef.current = mergedProfile
        localStorage.setItem('bharatlingo_user', JSON.stringify(mergedProfile))
        sessionStorage.removeItem('bharatlingo_assessment_required')
        sessionStorage.removeItem('bharatlingo_just_assessed')
        if (mergedProfile.preferredLanguage) {
          syncSiteLanguage(mergedProfile.preferredLanguage)
        }
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
      sessionStorage.removeItem('bharatlingo_assessment_required')
      sessionStorage.removeItem('bharatlingo_just_assessed')
      if (resolvedUser.preferredLanguage) {
        syncSiteLanguage(resolvedUser.preferredLanguage)
      }
      return resolvedUser
    }

    // No matching local account found — do NOT silently create one
    throw new Error('No account found with this email. Please sign up first.')
  }

  // Login with Google OAuth
  const loginWithGoogle = async () => {
    if (isSupabaseConfigured() && supabase) {
      try {
        const redirectOrigin =
          typeof window !== 'undefined' && window.location?.origin
            ? window.location.origin.replace(/\/$/, '')
            : 'https://bharatlingo.vercel.app'
        const redirectToUrl = `${redirectOrigin}/onboarding`

        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectToUrl,
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

    // Local / Offline fallback Google profile (strictly isolated per user identity)
    const existing = userRef.current
    const isSameGoogle = existing?.id && existing.id.startsWith('google_')
    const currentLang = isSameGoogle ? (existing?.learningLanguage || null) : null
    const googleUser = {
      id: isSameGoogle ? existing.id : 'google_' + Date.now().toString(),
      name: isSameGoogle ? (existing?.name || 'Google Learner') : 'Google Learner',
      email: isSameGoogle ? (existing?.email || 'learner@gmail.com') : 'learner@gmail.com',
      preferredLanguage: isSameGoogle ? (existing?.preferredLanguage || 'en') : 'en',
      learningLanguage: currentLang,
      goal: isSameGoogle ? (existing?.goal || 'conversation') : 'conversation',
      level: isSameGoogle ? (existing?.level || 'beginner') : 'beginner',
      dailyGoal: isSameGoogle ? (existing?.dailyGoal || 10) : 10,
      ageRange: isSameGoogle ? (existing?.ageRange || 'adult') : 'adult',
      assessmentScore: isSameGoogle ? (existing?.assessmentScore ?? null) : null,
      hasCompletedAssessment: isSameGoogle ? Boolean(existing?.hasCompletedAssessment) : false,
      xp: isSameGoogle ? (Number(existing?.xp) || 0) : 0,
      gems: isSameGoogle ? (Number(existing?.gems) || 0) : 100,
      streak: isSameGoogle ? (Number(existing?.streak) || 0) : 0,
      lastActiveDate: isSameGoogle ? (existing?.lastActiveDate || null) : null,
      completedLessons: isSameGoogle ? (existing?.completedLessons || []) : [],
      languageProgress: isSameGoogle ? (existing?.languageProgress || {}) : {},
      legendaryCompleted: isSameGoogle ? (existing?.legendaryCompleted || []) : [],
      vocabulary: isSameGoogle ? (existing?.vocabulary || {}) : {},
      achievements: isSameGoogle ? (existing?.achievements || []) : [],
      createdAt: isSameGoogle ? (existing?.createdAt || new Date().toISOString()) : new Date().toISOString(),
    }
    userRef.current = googleUser
    setUser(googleUser)
    localStorage.setItem('bharatlingo_user', JSON.stringify(googleUser))
    sessionStorage.removeItem('bharatlingo_assessment_required')
    sessionStorage.removeItem('bharatlingo_just_assessed')
    if (googleUser.preferredLanguage) {
      syncSiteLanguage(googleUser.preferredLanguage)
    }
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
    localStorage.removeItem('bharatlingo_learner_stats_v2')
    sessionStorage.removeItem('bharatlingo_assessment_required')
    sessionStorage.removeItem('bharatlingo_just_assessed')
    clearSM2Data(currentId)
    syncSiteLanguage('en')
  }

  // Update User profile & progress
  const updateUser = async (updates) => {
    const currentUser = userRef.current
    if (!currentUser) return null

    const resolvedUpdates = typeof updates === 'function' ? updates(currentUser) : updates
    const updatedUser = { ...currentUser, ...resolvedUpdates }

    // Update in Supabase if active
    if (isSupabaseConfigured() && supabase && currentUser.id) {
      const dbUpdates = mapUserUpdatesToProfile(resolvedUpdates)
      if (Object.keys(dbUpdates).length > 0) {
        let { error } = await supabase
          .from('profiles')
          .update(dbUpdates)
          .eq('id', currentUser.id)

        // If error was caused by reward field protection trigger, strip reward fields and retry core profile fields
        if (error && error.message?.toLowerCase().includes('cannot update xp, gems, or streak directly')) {
          console.warn('Supabase reward field protection active; updating non-reward profile fields...')
          const nonRewardUpdates = { ...dbUpdates }
          delete nonRewardUpdates.xp
          delete nonRewardUpdates.gems
          delete nonRewardUpdates.streak
          if (Object.keys(nonRewardUpdates).length > 0) {
            const retryRes = await supabase
              .from('profiles')
              .update(nonRewardUpdates)
              .eq('id', currentUser.id)
            error = retryRes.error
          } else {
            error = null
          }
        }

        if (error) {
          console.error('Failed to commit profile updates to Supabase:', error.message)
          // For critical onboarding/assessment state transitions: do NOT commit locally if DB rejected it!
          if (resolvedUpdates.hasCompletedAssessment !== undefined || resolvedUpdates.learningLanguage !== undefined) {
            throw new Error(error.message || 'Database update failed')
          }
        }
      }
    }

    // Only commit locally when DB update has succeeded or in offline fallback
    userRef.current = updatedUser
    setUser(updatedUser)
    localStorage.setItem('bharatlingo_user', JSON.stringify(updatedUser))

    // Permanent Synchronization between preferredLanguage and siteLanguage
    if (resolvedUpdates.preferredLanguage) {
      syncSiteLanguage(resolvedUpdates.preferredLanguage)
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
