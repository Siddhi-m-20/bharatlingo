import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../services/auth'
import { useProgress } from '../../services/progress'
import { getLessonsForLanguage, getLessonById } from '../../data/lessons'
import { getLanguageById } from '../../data/languages'
import XPBadge from '../../components/XPBadge'
import StreakBadge from '../../components/StreakBadge'
import LessonNode from '../../components/LessonNode'
import Button from '../../components/Button'
import ProgressBar from '../../components/ProgressBar'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { hearts, restoreHearts } = useProgress()
  const [lessons, setLessons] = useState([])
  const [currentLesson, setCurrentLesson] = useState(null)

  useEffect(() => {
    if (!user?.learningLanguage) {
      navigate('/onboarding')
      return
    }

    const languageLessons = getLessonsForLanguage(user.learningLanguage)
    setLessons(languageLessons)

    // Find current lesson (first incomplete lesson)
    const completedIds = user.completedLessons || []
    const nextLesson = languageLessons.find(lesson => !completedIds.includes(lesson.id))
    setCurrentLesson(nextLesson || languageLessons[0])
  }, [user, navigate])

  const getLessonStatus = (lesson) => {
    const completedIds = user.completedLessons || []
    if (completedIds.includes(lesson.id)) return 'completed'
    if (currentLesson?.id === lesson.id) return 'current'
    return 'locked'
  }

  const handleLessonClick = (lesson) => {
    const status = getLessonStatus(lesson)
    if (status !== 'locked') {
      navigate(`/lesson/${lesson.id}`)
    }
  }

  const language = getLanguageById(user.learningLanguage)

  if (!user || !language) {
    return (
      <div className="min-h-screen bg-[#F7F5EF] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#77736B]">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F5EF]">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#0B8F62] flex items-center justify-center text-white font-bold">
                भा
              </div>
              <div>
                <p className="text-sm text-[#77736B]">Namaste, {user.name}!</p>
                <p className="text-xs text-[#77736B]">Ready for a little practice?</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <XPBadge xp={user.xp || 0} />
              <StreakBadge streak={user.streak || 0} />
              <div className="flex items-center gap-1" title={`${hearts} hearts`}>
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={`text-2xl ${i < hearts ? '❤️' : '🖤'}`} />
                ))}
                {hearts === 0 && (
                  <button 
                    onClick={restoreHearts}
                    className="text-xs text-[#0B8F62] hover:underline ml-2"
                  >
                    Restore
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-3 gap-6 mb-8"
        >
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-[#25231F]">{language.name}</h2>
                  <p className="text-lg text-[#77736B]">{language.nativeName}</p>
                </div>
                <div className="text-4xl">{language.flag}</div>
              </div>

              {currentLesson && (
                <div className="bg-[#0B8F62]/10 rounded-xl p-4 mb-4">
                  <p className="text-sm text-[#77736B] mb-1">Current Lesson</p>
                  <p className="font-semibold text-[#25231F]">{currentLesson.name}</p>
                  <p className="text-sm text-[#77736B]">{currentLesson.nameNative}</p>
                </div>
              )}

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-[#77736B]">Unit 1: Everyday Essentials</span>
                  <span className="text-sm font-semibold text-[#25231F]">
                    {user.completedLessons?.length || 0} / {lessons.length} lessons
                  </span>
                </div>
                <ProgressBar 
                  progress={((user.completedLessons?.length || 0) / lessons.length) * 100} 
                  showLabel={false}
                />
              </div>

              <Button 
                size="large" 
                className="w-full"
                onClick={() => currentLesson && handleLessonClick(currentLesson)}
              >
                Continue lesson →
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-semibold text-[#25231F] mb-4">Daily Goal</h3>
              <div className="mb-4">
                <ProgressBar 
                  progress={Math.min((user.xp || 0) / user.dailyGoal * 100, 100)} 
                  showLabel={false}
                />
              </div>
              <p className="text-sm text-[#77736B]">
                {user.xp || 0} / {user.dailyGoal} XP
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-semibold text-[#25231F] mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" size="small" className="w-full" onClick={() => navigate('/practice')}>
                  Practice Review
                </Button>
                <Button variant="outline" size="small" className="w-full" onClick={() => navigate('/leaderboard')}>
                  Leaderboard
                </Button>
                <Button variant="outline" size="small" className="w-full" onClick={() => navigate('/profile')}>
                  Profile
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-[#25231F] mb-6">Learning Path</h2>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex flex-col items-center space-y-8">
              {lessons.map((lesson, index) => (
                <div key={lesson.id} className="flex items-center w-full">
                  <div className="flex-1">
                    <LessonNode
                      lesson={lesson}
                      status={getLessonStatus(lesson)}
                      current={currentLesson?.id === lesson.id}
                      onClick={() => handleLessonClick(lesson)}
                    />
                  </div>
                  {index < lessons.length - 1 && (
                    <div className="w-12 h-1 bg-[#E8E6E0] mx-4">
                      <div 
                        className={`h-full transition-all ${
                          getLessonStatus(lesson) === 'completed' ? 'bg-[#2F9E69]' : 'bg-[#E8E6E0]'
                        }`}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
