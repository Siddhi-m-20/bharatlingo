import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './auth'
import { recordLessonCompletion, syncStreakToDatabase, recordAchievementUnlock } from './dbService'

const ProgressContext = createContext(null)

// Helper: Get local date in YYYY-MM-DD
function getLocalDateString(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function ProgressProvider({ children }) {
  const [hearts, setHearts] = useState(5)
  const [currentLesson, setCurrentLesson] = useState(null)
  const [lessonProgress, setLessonProgress] = useState(0)
  const { user, updateUser } = useAuth()

  // Initialize hearts from user profile
  useEffect(() => {
    if (user?.hearts !== undefined) {
      setHearts(user.hearts)
    }
  }, [user?.hearts])

  const loseHeart = () => {
    setHearts((prev) => {
      const next = Math.max(0, prev - 1)
      if (user && updateUser) {
        updateUser({ hearts: next })
      }
      return next
    })
  }

  const restoreHearts = () => {
    setHearts(5)
    if (user && updateUser) {
      updateUser({ hearts: 5 })
    }
  }

  const addXP = (amount) => {
    if (user && updateUser && amount > 0) {
      const newXP = (user.xp || 0) + amount
      updateUser({ xp: newXP })

      // Check XP Achievements
      if (newXP >= 100 && !user.achievements?.includes('xp_100')) {
        unlockAchievement('xp_100')
      }
      if (newXP >= 500 && !user.achievements?.includes('xp_500')) {
        unlockAchievement('xp_500')
      }
    }
  }

  // Dynamic consecutive day streak calculation
  const updateStreak = () => {
    if (!user || !updateUser) return { increased: false, newStreak: user?.streak || 1 }

    const todayStr = getLocalDateString(new Date())
    const lastActive = user.lastActiveDate

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = getLocalDateString(yesterday)

    let newStreak = user.streak || 0
    let increased = false

    if (!lastActive) {
      // First day learning!
      newStreak = 1
      increased = true
    } else if (lastActive === todayStr) {
      // Already practiced today, keep streak
      newStreak = Math.max(1, user.streak || 1)
      increased = false
    } else if (lastActive === yesterdayStr) {
      // Practiced yesterday, consecutive day streak increase!
      newStreak = (user.streak || 0) + 1
      increased = true
    } else {
      // Missed more than one day, reset streak to 1
      newStreak = 1
      increased = true
    }

    updateUser({
      streak: newStreak,
      lastActiveDate: todayStr,
    })

    // Sync streak to database table
    if (user.id) {
      syncStreakToDatabase(user.id, newStreak, todayStr)
    }

    // Check streak achievements
    if (newStreak >= 3 && !user.achievements?.includes('streak_3')) {
      unlockAchievement('streak_3')
    }
    if (newStreak >= 7 && !user.achievements?.includes('streak_7')) {
      unlockAchievement('streak_7')
    }
    if (newStreak >= 30 && !user.achievements?.includes('streak_30')) {
      unlockAchievement('streak_30')
    }

    return { increased, newStreak }
  }

  // Sequential lesson completion and unlocking
  const completeLesson = async (lessonId, attemptData = {}) => {
    if (!user || !updateUser) return

    let isFirstTime = false
    let existingCompleted = []
    let updatedCompleted = []

    // Resolve completion against the latest profile so rapid updates cannot overwrite it.
    await updateUser((currentUser) => {
      existingCompleted = Array.isArray(currentUser.completedLessons) ? currentUser.completedLessons : []
      isFirstTime = !existingCompleted.includes(lessonId)
      updatedCompleted = isFirstTime ? [...existingCompleted, lessonId] : existingCompleted
      return { completedLessons: updatedCompleted }
    })

    // Record in Supabase database tables (lesson_attempts, user_progress, xp_transactions)
    if (user.id) {
      await recordLessonCompletion({
        userId: user.id,
        lessonId: lessonId,
        xpEarned: attemptData.xpEarned || 25,
        accuracy: attemptData.accuracy || 100,
        isPerfect: attemptData.isPerfect || false,
        heartsLost: attemptData.heartsLost || 0,
      })
    }

    // First lesson achievement
    if (existingCompleted.length === 0 && !user.achievements?.includes('first_step')) {
      unlockAchievement('first_step')
    }

    return { updatedCompleted, isFirstTime }
  }

  const unlockAchievement = (achievementId) => {
    if (!user || !updateUser) return
    const currentAchievements = Array.isArray(user.achievements) ? user.achievements : []
    if (!currentAchievements.includes(achievementId)) {
      const nextAchievements = [...currentAchievements, achievementId]
      updateUser({ achievements: nextAchievements })

      if (user.id) {
        recordAchievementUnlock(user.id, achievementId)
      }
    }
  }

  return (
    <ProgressContext.Provider
      value={{
        hearts,
        setHearts,
        loseHeart,
        restoreHearts,
        currentLesson,
        setCurrentLesson,
        lessonProgress,
        setLessonProgress,
        addXP,
        updateStreak,
        completeLesson,
        unlockAchievement,
      }}
    >
      {children}
    </ProgressContext.Provider>
  )
}

export function useProgress() {
  const context = useContext(ProgressContext)
  if (!context) {
    throw new Error('useProgress must be used within ProgressProvider')
  }
  return context
}
