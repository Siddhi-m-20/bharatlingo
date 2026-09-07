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
  const { user, updateUser } = useAuth()
  const [gems, setGems] = useState(() => (user?.gems !== undefined ? Number(user.gems) : 0))
  const [currentLesson, setCurrentLesson] = useState(null)
  const [lessonProgress, setLessonProgress] = useState(0)
  const [quests, setQuests] = useState(() => (user?.activeQuests && Array.isArray(user.activeQuests) && user.activeQuests.length > 0 ? user.activeQuests : DEFAULT_QUESTS))

  // Synchronize local state whenever the authoritative user object updates
  useEffect(() => {
    if (user?.gems !== undefined) {
      setGems(Number(user.gems))
    }
    if (user?.activeQuests && Array.isArray(user.activeQuests) && user.activeQuests.length > 0) {
      setQuests(user.activeQuests)
    }
  }, [user?.gems, user?.activeQuests])

  const addGems = (amount) => {
    if (!amount || amount <= 0 || !updateUser) return
    updateUser((currentUser) => {
      const currentGems = currentUser.gems !== undefined ? Number(currentUser.gems) : 0
      const newGems = currentGems + amount
      setGems(newGems)
      return { gems: newGems }
    })
  }

  const spendGems = (amount, reason = '') => {
    if (!updateUser || amount <= 0) return false
    let success = false
    updateUser((currentUser) => {
      const currentGems = currentUser.gems !== undefined ? Number(currentUser.gems) : 0
      if (currentGems < amount) {
        success = false
        return {}
      }
      success = true
      const newGems = currentGems - amount
      setGems(newGems)
      return { gems: newGems }
    })
    return success
  }

  const addXP = (amount) => {
    if (!amount || amount <= 0 || !updateUser) return

    updateUser((currentUser) => {
      const targetLang = currentUser.learningLanguage || 'hi'
      const newTotalXP = (Number(currentUser.xp) || 0) + amount
      const langProgress = currentUser.languageProgress || {}
      const currentLangData = langProgress[targetLang] || {
        completedLessons: currentUser.completedLessons || [],
        xp: 0,
        level: currentUser.level || 'beginner',
      }
      const updatedLangXP = (Number(currentLangData.xp) || 0) + amount

      const updatedAchievements = [...(currentUser.achievements || [])]
      let achievementsChanged = false

      if (newTotalXP >= 100 && !updatedAchievements.includes('xp_100')) {
        updatedAchievements.push('xp_100')
        achievementsChanged = true
        if (currentUser.id) recordAchievementUnlock(currentUser.id, 'xp_100')
      }
      if (newTotalXP >= 500 && !updatedAchievements.includes('xp_500')) {
        updatedAchievements.push('xp_500')
        achievementsChanged = true
        if (currentUser.id) recordAchievementUnlock(currentUser.id, 'xp_500')
      }
      if (newTotalXP >= 1000 && !updatedAchievements.includes('xp_1000')) {
        updatedAchievements.push('xp_1000')
        achievementsChanged = true
        if (currentUser.id) recordAchievementUnlock(currentUser.id, 'xp_1000')
      }

      return {
        xp: newTotalXP,
        achievements: achievementsChanged ? updatedAchievements : currentUser.achievements,
        languageProgress: {
          ...langProgress,
          [targetLang]: {
            ...currentLangData,
            xp: updatedLangXP,
          },
        },
      }
    })

    // Progress quests
    trackQuestProgress('xp', amount)
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
      if (updateUser) {
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
      if (updateUser) {
        updateUser({ activeQuests: updated })
      }
      return updated
    })
  }

  // Dynamic consecutive day streak calculation with freeze support
  const updateStreak = () => {
    if (!updateUser) return { increased: false, newStreak: 1 }

    const todayStr = getLocalDateString(new Date())
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = getLocalDateString(yesterday)

    let finalResult = { increased: false, newStreak: 1 }

    updateUser((currentUser) => {
      const lastActive = currentUser.lastActiveDate
      let newStreak = Number(currentUser.streak) || 0
      let increased = false

      if (!lastActive) {
        newStreak = 1
        increased = true
      } else if (lastActive === todayStr) {
        newStreak = Math.max(1, Number(currentUser.streak) || 1)
        increased = false
      } else if (lastActive === yesterdayStr) {
        newStreak = (Number(currentUser.streak) || 0) + 1
        increased = true
      } else {
        newStreak = 1
        increased = true
      }

      finalResult = { increased, newStreak }

      const updatedAchievements = [...(currentUser.achievements || [])]
      let achievementsChanged = false

      if (newStreak >= 3 && !updatedAchievements.includes('streak_3')) {
        updatedAchievements.push('streak_3')
        achievementsChanged = true
        if (currentUser.id) recordAchievementUnlock(currentUser.id, 'streak_3')
      }
      if (newStreak >= 7 && !updatedAchievements.includes('streak_7')) {
        updatedAchievements.push('streak_7')
        achievementsChanged = true
        if (currentUser.id) recordAchievementUnlock(currentUser.id, 'streak_7')
      }
      if (newStreak >= 30 && !updatedAchievements.includes('streak_30')) {
        updatedAchievements.push('streak_30')
        achievementsChanged = true
        if (currentUser.id) recordAchievementUnlock(currentUser.id, 'streak_30')
      }

      if (currentUser.id) {
        syncStreakToDatabase(currentUser.id, newStreak, todayStr)
      }

      return {
        streak: newStreak,
        lastActiveDate: todayStr,
        achievements: achievementsChanged ? updatedAchievements : currentUser.achievements,
      }
    })

    return finalResult
  }

  // Sequential lesson completion and unlocking per target language
  const completeLesson = async (lessonId, attemptData = {}) => {
    if (!updateUser) return { updatedCompleted: [], isFirstTime: false }

    let isFirstTime = false
    let updatedCompleted = []

    await updateUser((currentUser) => {
      const targetLang = currentUser.learningLanguage || 'hi'
      const langProgress = currentUser.languageProgress || {}
      const currentLangData = langProgress[targetLang] || {
        completedLessons: currentUser.completedLessons || [],
        xp: 0,
        level: currentUser.level || 'beginner',
      }
      const existingCompleted = Array.isArray(currentLangData.completedLessons) ? currentLangData.completedLessons : []
      isFirstTime = !existingCompleted.includes(lessonId)
      updatedCompleted = isFirstTime ? [...existingCompleted, lessonId] : existingCompleted

      const allCompleted = Array.from(new Set([
        ...(Array.isArray(currentUser.completedLessons) ? currentUser.completedLessons : []),
        ...updatedCompleted,
      ]))

      const updatedAchievements = [...(currentUser.achievements || [])]
      let achievementsChanged = false

      if (existingCompleted.length === 0 && !updatedAchievements.includes('first_step')) {
        updatedAchievements.push('first_step')
        achievementsChanged = true
        if (currentUser.id) recordAchievementUnlock(currentUser.id, 'first_step')
      }

      // Calculate gems bonus
      const gemBonus = (isFirstTime ? 5 : 2) + (attemptData.isPerfect ? 5 : 0)
      const currentGems = currentUser.gems !== undefined ? Number(currentUser.gems) : 0
      const nextGems = currentGems + gemBonus
      setGems(nextGems)

      return {
        completedLessons: allCompleted,
        gems: nextGems,
        achievements: achievementsChanged ? updatedAchievements : currentUser.achievements,
        languageProgress: {
          ...langProgress,
          [targetLang]: {
            ...currentLangData,
            completedLessons: updatedCompleted,
          },
        },
      }
    })

    // Quest tracking
    trackQuestProgress('lesson', 1)

    // Record in Supabase database tables if connected
    if (user?.id) {
      await recordLessonCompletion({
        userId: user.id,
        lessonId: lessonId,
        xpEarned: attemptData.xpEarned || 25,
        accuracy: attemptData.accuracy || 100,
        isPerfect: attemptData.isPerfect || false,
      })
    }

    return { updatedCompleted, isFirstTime }
  }

  // Legendary mode completion for a lesson
  const completeLegendaryLesson = async (lessonId) => {
    if (!updateUser) return
    let updated = []

    await updateUser((currentUser) => {
      const targetLang = currentUser.learningLanguage || 'hi'
      const langProgress = currentUser.languageProgress || {}
      const currentLangData = langProgress[targetLang] || { legendaryCompleted: [] }
      const existing = currentLangData.legendaryCompleted || []
      updated = existing.includes(lessonId) ? existing : [...existing, lessonId]

      const allLegendary = Array.from(new Set([
        ...(Array.isArray(currentUser.legendaryCompleted) ? currentUser.legendaryCompleted : []),
        ...updated,
      ]))

      const updatedAchievements = [...(currentUser.achievements || [])]
      let achievementsChanged = false
      if (!updatedAchievements.includes('legendary_master')) {
        updatedAchievements.push('legendary_master')
        achievementsChanged = true
        if (currentUser.id) recordAchievementUnlock(currentUser.id, 'legendary_master')
      }

      const currentGems = currentUser.gems !== undefined ? Number(currentUser.gems) : 0
      const nextGems = currentGems + 20
      setGems(nextGems)

      const currentXP = Number(currentUser.xp) || 0
      const nextXP = currentXP + 40

      return {
        xp: nextXP,
        gems: nextGems,
        legendaryCompleted: allLegendary,
        achievements: achievementsChanged ? updatedAchievements : currentUser.achievements,
        languageProgress: {
          ...langProgress,
          [targetLang]: {
            ...currentLangData,
            legendaryCompleted: updated,
            xp: (Number(currentLangData.xp) || 0) + 40,
          },
        },
      }
    })

    trackQuestProgress('xp', 40)
  }

  const unlockAchievement = (achievementId) => {
    if (!updateUser) return
    updateUser((currentUser) => {
      const currentAchievements = Array.isArray(currentUser.achievements) ? currentUser.achievements : []
      if (!currentAchievements.includes(achievementId)) {
        const nextAchievements = [...currentAchievements, achievementId]
        const currentGems = currentUser.gems !== undefined ? Number(currentUser.gems) : 0
        const nextGems = currentGems + 15
        setGems(nextGems)

        if (currentUser.id) {
          recordAchievementUnlock(currentUser.id, achievementId)
        }

        return {
          achievements: nextAchievements,
          gems: nextGems,
        }
      }
      return {}
    })
  }

  return (
    <ProgressContext.Provider
      value={{
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
        streak: Number(user?.streak) || 0,
        xp: Number(user?.xp) || 0,
        user,
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
