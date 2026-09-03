import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../services/auth'
import { useProgress } from '../../services/progress'
import { getLessonById, getLessonsForLanguage } from '../../data/lessons'
import { fetchLessonById, fetchDynamicLessons } from '../../services/dynamicLessonService'
import { getLanguageById } from '../../data/languages'
import QuestionCard from '../../components/QuestionCard'
import Button from '../../components/Button'
import ProgressBar from '../../components/ProgressBar'
import AudioButton from '../../components/AudioButton'
import WordBank from '../../components/WordBank/WordBank'
import SpeakingExercise from '../../components/SpeakingExercise/SpeakingExercise'
import MatchingExercise from '../../components/MatchingExercise/MatchingExercise'
import ListeningExercise from '../../components/ListeningExercise/ListeningExercise'
import CelebrationModal from '../../components/CelebrationModal/CelebrationModal'
import { audioFX } from '../../utils/audioFX'
import { triggerConfetti } from '../../utils/confetti'
import { recordMistake } from '../../services/mistakeService'
import { ttsService } from '../../services/audio/AudioService'

export default function Lesson() {
  const { lessonId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { hearts, loseHeart, addXP, updateStreak, completeLesson, unlockAchievement } = useProgress()

  const [lesson, setLesson] = useState(null)
  const [allLessons, setAllLessons] = useState([])
  const [nextLesson, setNextLesson] = useState(null)
  const [currentExercise, setCurrentExercise] = useState(0)
  const [answers, setAnswers] = useState([])
  const [showResult, setShowResult] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [lessonComplete, setLessonComplete] = useState(false)
  const [perfectLesson, setPerfectLesson] = useState(true)
  const [streakResult, setStreakResult] = useState({ increased: false, newStreak: 1 })
  const [totalXPEarned, setTotalXPEarned] = useState(0)

  // Stop audio when leaving lesson
  useEffect(() => {
    return () => {
      ttsService.stop()
    }
  }, [])

  useEffect(() => {
    if (!user?.learningLanguage) {
      navigate('/onboarding')
      return
    }

    let cancelled = false
    const preferredLang = user.preferredLanguage || 'en'

    async function loadLesson() {
      // Fetch lesson — supports both static and dynamic lesson IDs
      let loadedLesson = await fetchLessonById({
        languageId: user.learningLanguage,
        lessonId,
        goal: user.goal,
        ageRange: user.ageRange || 'adult',
        level: user.level || 'beginner',
        preferredLangId: preferredLang,
      })

      if (!loadedLesson) {
        // Final fallback to static
        loadedLesson = getLessonById(user.learningLanguage, lessonId, preferredLang)
      }

      if (!loadedLesson) {
        navigate('/dashboard')
        return
      }

      if (cancelled) return

      // Get the list of all lessons for next-lesson navigation
      let lessonsList = []
      try {
        lessonsList = await fetchDynamicLessons({
          languageId: user.learningLanguage,
          goal: user.goal,
          ageRange: user.ageRange || 'adult',
          level: user.level || 'beginner',
          count: 15,
        })
      } catch {
        lessonsList = getLessonsForLanguage(user.learningLanguage, preferredLang)
      }
      if (!lessonsList || lessonsList.length === 0) {
        lessonsList = getLessonsForLanguage(user.learningLanguage, preferredLang)
      }

      setAllLessons(lessonsList)

      const currentIndex = lessonsList.findIndex((l) => l.id === lessonId)
      if (currentIndex !== -1 && currentIndex < lessonsList.length - 1) {
        setNextLesson(lessonsList[currentIndex + 1])
      } else {
        setNextLesson(null)
      }

      setLesson(loadedLesson)
      setCurrentExercise(0)
      setAnswers([])
      setShowResult(false)
      setSelectedAnswer('')
      setLessonComplete(false)
      setPerfectLesson(true)
      ttsService.stop()
    }

    loadLesson()
    return () => { cancelled = true }
  }, [lessonId, user?.learningLanguage, user?.preferredLanguage, user?.goal, user?.ageRange, navigate])

  const handleAnswer = (answer) => {
    if (showResult || hearts === 0 || !lesson) return

    setSelectedAnswer(answer)
    const currentExerciseData = lesson.exercises[currentExercise]
    
    // Check answer correctness
    let isCorrect = false
    if (currentExerciseData.type === 'matching' || answer === 'matched_all') {
      isCorrect = true
    } else if (currentExerciseData.type === 'speaking') {
      isCorrect = answer === currentExerciseData.correctAnswer || answer === currentExerciseData.targetWord
    } else {
      isCorrect = String(answer).trim().toLowerCase() === String(currentExerciseData.correctAnswer).trim().toLowerCase()
    }

    if (!isCorrect) {
      audioFX.playWrong()
      loseHeart()
      setPerfectLesson(false)
      recordMistake(currentExerciseData, user.learningLanguage)
    } else {
      audioFX.playCorrect()
    }

    const xpEarned = isCorrect ? (currentExerciseData.xp || 10) : 0
    setAnswers((prev) => [...prev, { exercise: currentExercise, answer, isCorrect, xp: xpEarned }])
    setShowResult(true)

    if (isCorrect) {
      addXP(xpEarned)
      setTotalXPEarned((prev) => prev + xpEarned)
    }
  }

  const handleNext = () => {
    if (!lesson) return
    if (currentExercise < lesson.exercises.length - 1) {
      setCurrentExercise(currentExercise + 1)
      setShowResult(false)
      setSelectedAnswer('')
    } else {
      completeLessonFlow()
    }
  }

  const completeLessonFlow = async () => {
    audioFX.playVictory()
    triggerConfetti()

    const finalStreak = updateStreak()
    setStreakResult(finalStreak)

    const correctCount = answers.filter((a) => a.isCorrect).length
    const accuracy = Math.round((correctCount / Math.max(1, lesson.exercises.length)) * 100)
    const earnedXP = totalXPEarned + 15 // Completion bonus

    addXP(15) // Bonus XP for completion
    setTotalXPEarned((prev) => prev + 15)

    await completeLesson(lessonId, {
      xpEarned: earnedXP,
      accuracy,
      isPerfect: perfectLesson,
      heartsLost: 5 - hearts,
    })

    if (perfectLesson) {
      unlockAchievement('perfect_lesson')
    }

    setLessonComplete(true)
  }

  const handleContinueNextLesson = () => {
    if (nextLesson) {
      navigate(`/lesson/${nextLesson.id}`)
    } else {
      navigate('/dashboard')
    }
  }

  const renderExercise = () => {
    if (!lesson || !lesson.exercises[currentExercise]) return null
    const exercise = lesson.exercises[currentExercise]
    const targetLanguage = getLanguageById(user?.learningLanguage) || { voiceCode: 'hi-IN' }

    switch (exercise.type) {
      case 'multiple-choice':
        return (
          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-semibold text-[#25231F] mb-6">
              {exercise.prompt}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {exercise.options.map((option, index) => (
                <motion.button
                  key={index}
                  type="button"
                  className={`
                    p-4 rounded-xl border-2 text-left transition-all
                    ${selectedAnswer === option
                      ? showResult
                        ? option === exercise.correctAnswer
                          ? 'border-[#2F9E69] bg-[#2F9E69]/10 text-[#2F9E69] font-bold'
                          : 'border-[#D84B42] bg-[#D84B42]/10 text-[#D84B42]'
                        : 'border-[#0B8F62] bg-[#0B8F62]/10 text-[#0B8F62]'
                      : 'border-[#E8E6E0] bg-white hover:border-[#0B8F62]/50 text-[#25231F]'
                    }
                    ${showResult || hearts === 0 ? 'cursor-not-allowed' : 'cursor-pointer'}
                  `}
                  onClick={() => !showResult && hearts > 0 && handleAnswer(option)}
                  disabled={showResult || hearts === 0}
                  whileHover={!showResult && hearts > 0 ? { scale: 1.02 } : {}}
                  whileTap={!showResult && hearts > 0 ? { scale: 0.98 } : {}}
                >
                  <span className="font-medium">{option}</span>
                </motion.button>
              ))}
            </div>
          </div>
        )

      case 'translation':
        if (exercise.wordBank && exercise.wordBank.length > 0) {
          return (
            <WordBank
              prompt={exercise.prompt}
              wordBank={exercise.wordBank}
              correctAnswer={exercise.correctAnswer}
              onSubmit={handleAnswer}
              disabled={showResult || hearts === 0}
              showResult={showResult}
              isCorrect={answers[answers.length - 1]?.isCorrect}
            />
          )
        }
        return (
          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-semibold text-[#25231F] mb-6">
              {exercise.prompt}
            </h3>
            <input
              type="text"
              value={selectedAnswer}
              onChange={(e) => setSelectedAnswer(e.target.value)}
              className="w-full px-4 py-3 border-2 border-[#E8E6E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B8F62] focus:border-[#0B8F62]"
              placeholder="Type your answer..."
              disabled={showResult || hearts === 0}
            />
            {!showResult && (
              <div className="flex justify-end pt-2">
                <Button
                  onClick={() => handleAnswer(selectedAnswer)}
                  disabled={!selectedAnswer.trim() || showResult || hearts === 0}
                >
                  Check Answer
                </Button>
              </div>
            )}
          </div>
        )

      case 'listening':
        return (
          <ListeningExercise
            prompt={exercise.prompt}
            audioText={exercise.audioText || exercise.audioTarget || exercise.correctAnswer}
            options={exercise.options || [exercise.correctAnswer]}
            correctAnswer={exercise.correctAnswer}
            languageId={user?.learningLanguage || 'hi'}
            selectedAnswer={selectedAnswer}
            onSelectAnswer={handleAnswer}
            showResult={showResult}
            disabled={hearts === 0}
          />
        )

      case 'speaking':
        return (
          <SpeakingExercise
            prompt={exercise.prompt}
            targetWord={exercise.targetWord || exercise.correctAnswer}
            pronunciation={exercise.pronunciation}
            languageId={user?.learningLanguage || 'hi'}
            onSubmit={handleAnswer}
            disabled={showResult || hearts === 0}
            showResult={showResult}
          />
        )

      case 'matching':
        return (
          <MatchingExercise
            prompt={exercise.prompt}
            pairs={exercise.pairs}
            onSubmit={handleAnswer}
            disabled={showResult || hearts === 0}
            showResult={showResult}
          />
        )

      case 'fill-blank':
        return (
          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-semibold text-[#25231F] mb-6">
              {exercise.prompt}
            </h3>
            {exercise.options && exercise.options.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {exercise.options.map((option, index) => (
                  <motion.button
                    key={index}
                    type="button"
                    className={`
                      p-4 rounded-xl border-2 text-left transition-all
                      ${selectedAnswer === option
                        ? showResult
                          ? option === exercise.correctAnswer
                            ? 'border-[#2F9E69] bg-[#2F9E69]/10 text-[#2F9E69] font-bold'
                            : 'border-[#D84B42] bg-[#D84B42]/10 text-[#D84B42]'
                          : 'border-[#0B8F62] bg-[#0B8F62]/10 text-[#0B8F62]'
                        : 'border-[#E8E6E0] bg-white hover:border-[#0B8F62]/50 text-[#25231F]'
                      }
                      ${showResult || hearts === 0 ? 'cursor-not-allowed' : 'cursor-pointer'}
                    `}
                    onClick={() => !showResult && hearts > 0 && handleAnswer(option)}
                    disabled={showResult || hearts === 0}
                    whileHover={!showResult && hearts > 0 ? { scale: 1.02 } : {}}
                    whileTap={!showResult && hearts > 0 ? { scale: 0.98 } : {}}
                  >
                    <span className="font-medium">{option}</span>
                  </motion.button>
                ))}
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  value={selectedAnswer}
                  onChange={(e) => setSelectedAnswer(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-[#E8E6E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B8F62] focus:border-[#0B8F62]"
                  placeholder="Type your answer..."
                  disabled={showResult || hearts === 0}
                />
                {!showResult && (
                  <div className="flex justify-end pt-2">
                    <Button
                      onClick={() => handleAnswer(selectedAnswer)}
                      disabled={!selectedAnswer.trim() || showResult || hearts === 0}
                    >
                      Check Answer
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )

      default: {
        // Developer diagnostic for unknown exercise types
        if (import.meta.env.DEV) {
          console.error('[Lesson] Unknown exercise type:', exercise.type, exercise)
        }
        return (
          <div className="text-center py-8 space-y-3">
            <p className="text-[#D84B42] font-semibold">Unknown exercise type: {exercise.type || 'undefined'}</p>
            <p className="text-sm text-[#77736B]">This exercise cannot be rendered.</p>
            <Button onClick={() => handleAnswer(exercise.correctAnswer || 'skip')}>
              Skip
            </Button>
          </div>
        )
      }
    }
  }

  const renderResult = () => {
    const lastAnswer = answers[answers.length - 1]
    const isCorrect = lastAnswer?.isCorrect || false
    const exercise = lesson.exercises[currentExercise]

    return (
      <div className="text-center py-4 border-t border-[#E8E6E0] mt-6">
        <div className="flex items-center justify-center gap-2 mb-1">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`text-2xl font-bold ${isCorrect ? 'text-[#2F9E69]' : 'text-[#D84B42]'}`}
          >
            {isCorrect ? '✓ Excellent!' : '✗ Not quite right'}
          </motion.div>
        </div>

        {!isCorrect && (
          <p className="text-sm font-medium text-[#77736B] mt-1">
            Correct answer: <span className="font-bold text-[#25231F]">{exercise.correctAnswer}</span>
          </p>
        )}

        {isCorrect && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[#F39A45] font-bold text-sm mt-1"
          >
            +{exercise.xp || 10} XP
          </motion.div>
        )}
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-[#F7F5EF] flex items-center justify-center">
        <p className="text-[#77736B] font-medium">Loading lesson...</p>
      </div>
    )
  }

  if (hearts === 0 && !lessonComplete) {
    return (
      <div className="min-h-screen bg-[#F7F5EF] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <QuestionCard>
            <div className="text-center py-8">
              <div className="text-6xl mb-4">💔</div>
              <h2 className="text-3xl font-bold text-[#25231F] mb-2">You're out of hearts!</h2>
              <p className="text-[#77736B] mb-6">Practice review to restore your hearts and continue learning.</p>
              <div className="space-y-3">
                <Button size="large" className="w-full" onClick={() => navigate('/practice')}>
                  Practice Review
                </Button>
                <Button variant="outline" size="large" className="w-full" onClick={() => navigate('/dashboard')}>
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </QuestionCard>
        </div>
      </div>
    )
  }

  if (lessonComplete) {
    const correctCount = answers.filter((a) => a.isCorrect).length
    const accuracy = Math.round((correctCount / Math.max(1, lesson.exercises.length)) * 100)

    return (
      <div className="min-h-screen bg-[#F7F5EF] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <QuestionCard>
            <CelebrationModal
              totalXP={totalXPEarned}
              streak={streakResult.newStreak}
              streakIncreased={streakResult.increased}
              isPerfect={perfectLesson}
              accuracy={accuracy}
              nextLesson={nextLesson}
              onContinueNext={handleContinueNextLesson}
              onGoDashboard={() => navigate('/dashboard')}
            />
          </QuestionCard>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F5EF] flex flex-col justify-between p-4 md:p-8">
      {/* Top Navigation */}
      <div className="w-full max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm font-semibold text-[#77736B] hover:text-[#25231F] transition-colors"
          >
            ✕ Exit
          </button>
          <div className="flex items-center gap-1" title={`${hearts} hearts remaining`}>
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-lg">
                {i < hearts ? '❤️' : '🖤'}
              </span>
            ))}
          </div>
        </div>

        <ProgressBar
          progress={((currentExercise + 1) / lesson.exercises.length) * 100}
          showLabel={false}
        />
      </div>

      {/* Main Question Card */}
      <div className="w-full max-w-2xl mx-auto my-6">
        <QuestionCard showResult={showResult} isCorrect={answers[answers.length - 1]?.isCorrect}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentExercise}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.25 }}
            >
              {renderExercise()}
              {showResult && renderResult()}
            </motion.div>
          </AnimatePresence>
        </QuestionCard>
      </div>

      {/* Bottom Footer Controls */}
      <div className="w-full max-w-2xl mx-auto flex justify-between items-center pt-2">
        <div className="text-xs text-[#77736B]">
          Exercise {currentExercise + 1} of {lesson.exercises.length}
        </div>
        {showResult && (
          <Button onClick={handleNext} size="large">
            {currentExercise === lesson.exercises.length - 1 ? 'Complete Lesson' : 'Continue'}
          </Button>
        )}
      </div>
    </div>
  )
}
