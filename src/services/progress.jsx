import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './auth'

const ProgressContext = createContext(null)

export function ProgressProvider({ children }) {
  const [hearts, setHearts] = useState(5)
  const [currentLesson, setCurrentLesson] = useState(null)
  const [lessonProgress, setLessonProgress] = useState(0)
  const { user, updateUser } = useAuth()

  const loseHeart = () => {
    setHearts(prev => Math.max(0, prev - 1))
  }

  const restoreHearts = () => {
    setHearts(5)
  }

  const addXP = (amount) => {
    if (user && updateUser) {
      updateUser(prev => ({ xp: prev.xp + amount }))
    }
  }

  const updateStreak = () => {
    if (user && updateUser) {
      updateUser(prev => {
        const today = new Date().toDateString()
        const lastActive = prev.lastActiveDate

        if (lastActive === today) {
          return {}
        }

        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)

        if (lastActive === yesterday.toDateString()) {
          return { streak: prev.streak + 1, lastActiveDate: today }
        }
        return { streak: 1, lastActiveDate: today }
      })
    }
  }

  const completeLesson = (lessonId) => {
    if (user && updateUser) {
      updateUser(prev => (
        prev.completedLessons.includes(lessonId)
          ? {}
          : { completedLessons: [...prev.completedLessons, lessonId] }
      ))
    }
  }

  const unlockAchievement = (achievementId) => {
    if (user && updateUser) {
      updateUser(prev => (
        prev.achievements.includes(achievementId)
          ? {}
          : { achievements: [...prev.achievements, achievementId] }
      ))
    }
  }

  return (
    <ProgressContext.Provider value={{
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
    }}>
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
