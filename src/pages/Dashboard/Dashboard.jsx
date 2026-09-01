import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../services/auth'
import { useProgress } from '../../services/progress'
import { getLessonsForLanguage } from '../../data/lessons'
import { getLanguageById } from '../../data/languages'
import LessonNode from '../../components/LessonNode'
import Button from '../../components/Button'
import ProgressBar from '../../components/ProgressBar'
import AppSidebar from '../../components/Navigation/AppSidebar'
import RightSidebar from '../../components/RightSidebar/RightSidebar'
import AlphabetModal from '../../components/AlphabetModal/AlphabetModal'
import { audioFX } from '../../utils/audioFX'
import { triggerConfetti } from '../../utils/confetti'
import { BookA, Gift, Lock, CheckCircle2, Sparkles, Flame } from 'lucide-react'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addXP } = useProgress()
  const [lessons, setLessons] = useState([])
  const [currentLesson, setCurrentLesson] = useState(null)
  const [showAlphabetModal, setShowAlphabetModal] = useState(false)
  const [openedChests, setOpenedChests] = useState(() => {
    try {
      const stored = localStorage.getItem('bharatlingo_opened_chests')
      return stored ? JSON.parse(stored) : []
    } catch (e) {
      return []
    }
  })

  useEffect(() => {
    if (!user?.learningLanguage) {
      navigate('/onboarding')
      return
    }

    const preferredLang = user.preferredLanguage || 'en'
    const languageLessons = getLessonsForLanguage(user.learningLanguage, preferredLang)
    setLessons(languageLessons)

    // Find current lesson (first incomplete lesson in sequence)
    const completedIds = Array.isArray(user.completedLessons) ? user.completedLessons : []
    const nextIncomplete = languageLessons.find((lesson) => !completedIds.includes(lesson.id))
    setCurrentLesson(nextIncomplete || languageLessons[languageLessons.length - 1])
  }, [user, navigate])

  const getLessonStatus = (lesson) => {
    const completedIds = Array.isArray(user?.completedLessons) ? user.completedLessons : []
    if (completedIds.includes(lesson.id)) return 'completed'
    if (currentLesson?.id === lesson.id) return 'current'

    // Determine if previous lesson in sequence was completed
    const lessonIndex = lessons.findIndex((l) => l.id === lesson.id)
    if (lessonIndex === 0) return 'current' // First lesson always unlocked
    const previousLesson = lessons[lessonIndex - 1]
    if (previousLesson && completedIds.includes(previousLesson.id)) {
      return 'current'
    }

    return 'locked'
  }

  const handleLessonClick = (lesson) => {
    const status = getLessonStatus(lesson)
    if (status !== 'locked') {
      navigate(`/lesson/${lesson.id}`)
    }
  }

  const handleOpenChest = (unitId, xpReward = 50) => {
    if (openedChests.includes(unitId)) return
    audioFX.playChestOpen()
    triggerConfetti()
    addXP(xpReward)

    const updated = [...openedChests, unitId]
    setOpenedChests(updated)
    localStorage.setItem('bharatlingo_opened_chests', JSON.stringify(updated))
  }

  const learningLang = getLanguageById(user?.learningLanguage)
  const preferredLang = getLanguageById(user?.preferredLanguage || 'en')

  if (!user || !learningLang) {
    return (
      <div className="min-h-screen bg-[#F7F5EF] flex items-center justify-center">
        <p className="text-[#77736B]">Loading learning path...</p>
      </div>
    )
  }

  const completedCount = (user.completedLessons || []).length
  const totalLessons = Math.max(1, lessons.length)
  const progressPercent = Math.min(Math.round((completedCount / totalLessons) * 100), 100)

  // Group by the unit field so adding lessons to the data automatically expands the path.
  const unitColors = ['#0B8F62', '#F39A45', '#3B82F6', '#8B5CF6', '#D84B42']
  const units = [...new Map(
    lessons.map((lesson) => [lesson.unit || 'Unit 1: Fundamentals', lesson.unit || 'Unit 1: Fundamentals'])
  )].map(([unit, title], index) => ({
    id: `unit-${index + 1}`,
    number: index + 1,
    title,
    titleNative: title,
    description: `Build confidence with ${title.replace(/^Unit \d+:\s*/, '').toLowerCase()}`,
    color: unitColors[index % unitColors.length],
    lessons: lessons.filter((lesson) => (lesson.unit || 'Unit 1: Fundamentals') === unit),
  }))

  return (
    <div className="min-h-screen bg-[#F7F5EF] dark:bg-slate-950 flex justify-center pb-20 md:pb-0">
      {/* 1. LEFT SIDEBAR (Width 256px) */}
      <AppSidebar />

      {/* 2. CENTER CONTENT & LEARNING PATH (Width max-w-[620px]) */}
      <main className="flex-1 max-w-[620px] md:ml-64 px-4 py-6 md:py-8 space-y-6">
        {/* Course Progress Banner Header */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border-2 border-[#E8E6E0] dark:border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{learningLang.flag}</span>
              <div>
                <h1 className="text-2xl font-black text-[#25231F] dark:text-white leading-tight">
                  {learningLang.name} Course
                </h1>
                <p className="text-xs text-[#77736B] dark:text-slate-400">
                  {learningLang.nativeName} • Learning from <span className="font-bold text-[#0B8F62]">{preferredLang?.name || 'English'}</span>
                </p>
              </div>
            </div>
            <span className="px-3 py-1 bg-[#0B8F62]/10 text-[#0B8F62] dark:text-[#34D399] text-xs font-black rounded-full">
              {progressPercent}%
            </span>
          </div>

          <ProgressBar progress={progressPercent} showLabel={false} />

          <div className="grid grid-cols-2 gap-3 mt-4">
            <Button
              size="large"
              className="w-full justify-center font-black"
              onClick={() => currentLesson && handleLessonClick(currentLesson)}
            >
              {completedCount === 0 ? 'Start Lesson 1 →' : 'Continue Lesson →'}
            </Button>
            <button
              onClick={() => setShowAlphabetModal(true)}
              className="w-full py-3 px-4 bg-[#F7F5EF] dark:bg-slate-800 hover:bg-[#E8E6E0] dark:hover:bg-slate-700 border-2 border-[#E8E6E0] dark:border-slate-700 rounded-2xl font-black text-sm text-[#25231F] dark:text-white flex items-center justify-center gap-2 transition-colors"
            >
              <BookA size={18} className="text-[#0B8F62]" />
              <span>Alphabet</span>
            </button>
          </div>
        </div>

        {/* Units & Duolingo Learning Roadmap */}
        <div className="space-y-8">
          {units.map((unit) => {
            const completedInUnit = unit.lessons.filter((l) => (user.completedLessons || []).includes(l.id)).length
            const isUnitComplete = completedInUnit === unit.lessons.length
            const isChestClaimed = openedChests.includes(unit.id)

            return (
              <motion.div
                key={unit.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border-2 border-[#E8E6E0] dark:border-slate-800 overflow-hidden"
              >
                {/* Unit Header Banner */}
                <div
                  className="p-6 text-white flex items-center justify-between"
                  style={{ backgroundColor: unit.color }}
                >
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-widest bg-black/25 px-2.5 py-1 rounded-md">
                      Unit {unit.number}
                    </span>
                    <h3 className="text-xl font-black mt-1.5">{unit.title}</h3>
                    <p className="text-xs text-white/90">{unit.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold bg-white/20 px-3 py-1.5 rounded-xl backdrop-blur-sm">
                      {completedInUnit}/{unit.lessons.length}
                    </span>
                  </div>
                </div>

                {/* Vertical Winding Node Roadmap */}
                <div className="p-8 md:p-10 flex flex-col items-center space-y-6 max-w-sm mx-auto relative">
                  {unit.lessons.map((lesson, idx) => {
                    const status = getLessonStatus(lesson)
                    const offsetClass = idx % 2 === 0 ? '-translate-x-6' : 'translate-x-6'

                    return (
                      <div key={lesson.id} className={`flex flex-col items-center relative ${offsetClass}`}>
                        <LessonNode
                          lesson={lesson}
                          status={status}
                          current={currentLesson?.id === lesson.id}
                          onClick={() => handleLessonClick(lesson)}
                        />

                        {/* Connecting Line */}
                        {idx < unit.lessons.length - 1 && (
                          <div className="w-1.5 h-8 bg-[#E8E6E0] dark:bg-slate-800 my-2 rounded-full overflow-hidden">
                            <div
                              className={`w-full h-full transition-all duration-500 ${
                                status === 'completed' ? 'bg-[#2F9E69]' : 'bg-[#E8E6E0] dark:bg-slate-800'
                              }`}
                            />
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {/* Milestone Reward Chest */}
                  <div className="pt-4 flex flex-col items-center">
                    <div className="w-1.5 h-6 bg-[#E8E6E0] dark:bg-slate-800 mb-2 rounded-full" />
                    <motion.button
                      onClick={() => isUnitComplete && handleOpenChest(unit.id)}
                      disabled={!isUnitComplete || isChestClaimed}
                      whileHover={isUnitComplete && !isChestClaimed ? { scale: 1.1 } : {}}
                      whileTap={isUnitComplete && !isChestClaimed ? { scale: 0.95 } : {}}
                      className={`
                        w-16 h-16 rounded-3xl flex items-center justify-center border-4 shadow-lg transition-all
                        ${isChestClaimed
                          ? 'bg-[#2F9E69] text-white border-[#2F9E69]'
                          : isUnitComplete
                          ? 'bg-[#F39A45] text-white border-[#F39A45] animate-bounce shadow-[#F39A45]/40 cursor-pointer'
                          : 'bg-[#E8E6E0] dark:bg-slate-800 text-[#77736B] border-[#E8E6E0] dark:border-slate-700 cursor-not-allowed opacity-70'
                        }
                      `}
                    >
                      {isChestClaimed ? <CheckCircle2 size={24} /> : isUnitComplete ? <Gift size={26} /> : <Lock size={20} />}
                    </motion.button>
                    <p className="text-xs font-bold text-[#25231F] dark:text-slate-300 mt-2">
                      {isChestClaimed ? 'Reward Claimed ✓' : isUnitComplete ? 'Open Reward (+50 XP)!' : 'Unit Milestone'}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </main>

      {/* 3. RIGHT SIDEBAR (Width 320px on Desktop) */}
      <RightSidebar />

      {/* Alphabet Modal */}
      <AlphabetModal
        languageId={user.learningLanguage}
        languageName={learningLang.name}
        isOpen={showAlphabetModal}
        onClose={() => setShowAlphabetModal(false)}
      />
    </div>
  )
}
