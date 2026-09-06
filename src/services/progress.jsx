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

const DEFAULT_QUESTS = [
  { id: 'xp_30', title: 'Earn 30 XP', target: 30, current: 0, rewardXP: 15, rewardGems: 10, completed: false, claimed: false },
  { id: 'lessons_2', title: 'Complete 2 Lessons', target: 2, current: 0, rewardXP: 25, rewardGems: 15, completed: false, claimed: false },
  { id: 'practice_5', title: 'Review 5 Words in Practice', target: 5, current: 0, rewardXP: 10, rewardGems: 10, completed: false, claimed: false },
]

export function ProgressProvider({ children }) {
  const [hearts, setHearts] = useState(5)
  const [gems, setGems] = useState(100)
  const [currentLesson, setCurrentLesson] = useState(null)
  const [lessonProgress, setLessonProgress] = useState(0)
  const [quests, setQuests] = useState(DEFAULT_QUESTS)
  const { user, updateUser } = useAuth()

  // Initialize hearts and gems from user profile
  useEffect(() => {
    if (user?.hearts !== undefined) {
      setHearts(user.hearts)
    }
    if (user?.gems !== undefined) {
      setGems(user.gems)
    }
    if (user?.activeQuests && Array.isArray(user.activeQuests) && user.activeQuests.length > 0) {
      setQuests(user.activeQuests)
    }
  }, [user?.hearts, user?.gems, user?.activeQuests])

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

  const addGems = (amount) => {
    if (user && updateUser && amount > 0) {
      const newGems = (user.gems || 0) + amount
      setGems(newGems)
      updateUser({ gems: newGems })
    }
  }

  const spendGems = (amount, reason = '') => {
    const currentGems = user?.gems !== undefined ? user.gems : gems
    if (currentGems < amount) {
      return false
    }
    const newGems = currentGems - amount
    setGems(newGems)
    if (user && updateUser) {
      updateUser({ gems: newGems })
    }
    return true
  }

  const addXP = (amount) => {
    if (user && updateUser && amount > 0) {
      const currentLearningLang = user.learningLanguage || 'hi'
      const newTotalXP = (user.xp || 0) + amount

      updateUser((currentUser) => {
        const langProgress = currentUser.languageProgress || {}
        const currentLangData = langProgress[currentLearningLang] || {
          completedLessons: currentUser.completedLessons || [],
          xp: 0,
          level: currentUser.level || 'beginner',
        }
        const updatedLangXP = (currentLangData.xp || 0) + amount

        return {
          xp: newTotalXP,
          languageProgress: {
            ...langProgress,
            [currentLearningLang]: {
              ...currentLangData,
              xp: updatedLangXP,
            },
          },
        }
      })

      // Progress quests
      trackQuestProgress('xp', amount)

      // Check XP Achievements
      if (newTotalXP >= 100 && !user.achievements?.includes('xp_100')) {
        unlockAchievement('xp_100')
      }
      if (newTotalXP >= 500 && !user.achievements?.includes('xp_500')) {
        unlockAchievement('xp_500')
      }
      if (newTotalXP >= 1000 && !user.achievements?.includes('xp_1000')) {
        unlockAchievement('xp_1000')
      }
    }
  }

  const trackQuestProgress = (type, amount = 1) => {
    setQuests((prevQuests) => {
      const updated = prevQuests.map((q) => {
        if (q.claimed) return q
        let newCurrent = q.current
        if (type === 'xp' && q.id.startsWith('xp_')) {
          newCurrent = Math.min(q.target, q.current + amount)
        } else if (type === 'lesson' && q.id.startsWith('lessons_')) {
          newCurrent = Math.min(q.target, q.current + amount)
        } else if (type === 'practice' && q.id.startsWith('practice_')) {
          newCurrent = Math.min(q.target, q.current + amount)
        }
        return {
          ...q,
          current: newCurrent,
          completed: newCurrent >= q.target,
        }
      })
      if (user && updateUser) {
        updateUser({ activeQuests: updated })
      }
      return updated
    })
  }

  const claimQuestReward = (questId) => {
    const q = quests.find((item) => item.id === questId)
    if (!q || !q.completed || q.claimed) return

    if (q.rewardXP) addXP(q.rewardXP)
    if (q.rewardGems) addGems(q.rewardGems)

    setQuests((prev) => {
      const updated = prev.map((item) => (item.id === questId ? { ...item, claimed: true } : item))
      if (user && updateUser) {
        updateUser({ activeQuests: updated })
      }
      return updated
    })
  }

  // Dynamic consecutive day streak calculation with freeze support
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
      newStreak = 1
      increased = true
    } else if (lastActive === todayStr) {
      newStreak = Math.max(1, user.streak || 1)
      increased = false
    } else if (lastActive === yesterdayStr) {
      newStreak = (user.streak || 0) + 1
      increased = true
    } else {
      newStreak = 1
      increased = true
    }

    updateUser({
      streak: newStreak,
      lastActiveDate: todayStr,
    })

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

  // Sequential lesson completion and unlocking per target language
  const completeLesson = async (lessonId, attemptData = {}) => {
    if (!user || !updateUser) return

    const learningLang = user.learningLanguage || 'hi'
    let isFirstTime = false
    let existingCompleted = []
    let updatedCompleted = []

    await updateUser((currentUser) => {
      const langProgress = currentUser.languageProgress || {}
      const currentLangData = langProgress[learningLang] || {
        completedLessons: currentUser.completedLessons || [],
        xp: 0,
        level: currentUser.level || 'beginner',
      }
      existingCompleted = Array.isArray(currentLangData.completedLessons) ? currentLangData.completedLessons : []
      isFirstTime = !existingCompleted.includes(lessonId)
      updatedCompleted = isFirstTime ? [...existingCompleted, lessonId] : existingCompleted

      return {
        completedLessons: updatedCompleted,
        languageProgress: {
          ...langProgress,
          [learningLang]: {
            ...currentLangData,
            completedLessons: updatedCompleted,
          },
        },
      }
    })

    // Award Gems for completion
    addGems(isFirstTime ? 5 : 2)
    if (attemptData.isPerfect) {
      addGems(5)
    }

    // Quest tracking
    trackQuestProgress('lesson', 1)

    // Record in Supabase database tables if connected
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

  // Legendary mode completion for a lesson
  const completeLegendaryLesson = async (lessonId) => {
    if (!user || !updateUser) return
    const learningLang = user.learningLanguage || 'hi'

    await updateUser((currentUser) => {
      const langProgress = currentUser.languageProgress || {}
      const currentLangData = langProgress[learningLang] || { legendaryCompleted: [] }
      const existing = currentLangData.legendaryCompleted || []
      const updated = existing.includes(lessonId) ? existing : [...existing, lessonId]

      return {
        legendaryCompleted: updated,
        languageProgress: {
          ...langProgress,
          [learningLang]: {
            ...currentLangData,
            legendaryCompleted: updated,
          },
        },
      }
    })

    addXP(40)
    addGems(20)
    unlockAchievement('legendary_master')
  }

  const unlockAchievement = (achievementId) => {
    if (!user || !updateUser) return
    const currentAchievements = Array.isArray(user.achievements) ? user.achievements : []
    if (!currentAchievements.includes(achievementId)) {
      const nextAchievements = [...currentAchievements, achievementId]
      updateUser({ achievements: nextAchievements })
      addGems(15) // Gems bonus for unlocking achievement!

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
        gems,
        setGems,
        addGems,
        spendGems,
        quests,
        claimQuestReward,
        trackQuestProgress,
        currentLesson,
        setCurrentLesson,
        lessonProgress,
        setLessonProgress,
        addXP,
        updateStreak,
        completeLesson,
        completeLegendaryLesson,
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
