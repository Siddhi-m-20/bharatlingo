import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../services/auth'
import { useProgress } from '../../services/progress'
import { getLessonById } from '../../data/lessons'
import { getLanguageById } from '../../data/languages'
import QuestionCard from '../../components/QuestionCard'
import Button from '../../components/Button'
import ProgressBar from '../../components/ProgressBar'
import AudioButton from '../../components/AudioButton'

export default function Lesson() {
  const { lessonId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { hearts, loseHeart, addXP, updateStreak, completeLesson, unlockAchievement } = useProgress()
  
  const [lesson, setLesson] = useState(null)
  const [currentExercise, setCurrentExercise] = useState(0)
  const [answers, setAnswers] = useState([])
  const [showResult, setShowResult] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [lessonComplete, setLessonComplete] = useState(false)
  const [perfectLesson, setPerfectLesson] = useState(true)

  useEffect(() => {
    if (!user?.learningLanguage) {
      navigate('/onboarding')
      return
    }

    const loadedLesson = getLessonById(user.learningLanguage, lessonId)
    if (!loadedLesson) {
      navigate('/dashboard')
      return
    }

    setLesson(loadedLesson)
  }, [lessonId, user, navigate])

  const handleAnswer = (answer) => {
    if (showResult || hearts === 0) return
    
    setSelectedAnswer(answer)
    const currentExerciseData = lesson.exercises[currentExercise]
    const isCorrect = answer === currentExerciseData.correctAnswer
    
    if (!isCorrect) {
      loseHeart()
      setPerfectLesson(false)
    }
    
    setAnswers([...answers, { exercise: currentExercise, answer, isCorrect }])
    setShowResult(true)
    
    if (isCorrect) {
      addXP(currentExerciseData.xp)
    }
  }

  const handleNext = () => {
    if (currentExercise < lesson.exercises.length - 1) {
      setCurrentExercise(currentExercise + 1)
      setShowResult(false)
      setSelectedAnswer('')
    } else {
      completeLessonFlow()
    }
  }

  const completeLessonFlow = () => {
    updateStreak()
    completeLesson(lessonId)
    
    if (perfectLesson) {
      unlockAchievement('perfect_lesson')
    }
    
    if (user.completedLessons?.length === 0) {
      unlockAchievement('first_step')
    }
    
    setLessonComplete(true)
  }

  const renderExercise = () => {
    const exercise = lesson.exercises[currentExercise]
    const language = getLanguageById(user.learningLanguage)
    
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
                          ? 'border-[#2F9E69] bg-[#2F9E69]/10'
                          : 'border-[#D84B42] bg-[#D84B42]/10'
                        : 'border-[#0B8F62] bg-[#0B8F62]/10'
                      : 'border-[#E8E6E0] bg-white hover:border-[#0B8F62]/50'
                    }
                    ${showResult || hearts === 0 ? 'cursor-not-allowed' : 'cursor-pointer'}
                  `}
                  onClick={() => !showResult && hearts > 0 && handleAnswer(option)}
                  disabled={showResult || hearts === 0}
                  whileHover={!showResult && hearts > 0 ? { scale: 1.02 } : {}}
                  whileTap={!showResult && hearts > 0 ? { scale: 0.98 } : {}}
                >
                  <span className="font-medium text-[#25231F]">{option}</span>
                </motion.button>
              ))}
            </div>
          </div>
        )

      case 'translation':
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
            <Button 
              onClick={() => handleAnswer(selectedAnswer)} 
              disabled={!selectedAnswer || showResult || hearts === 0}
            >
              Check answer
            </Button>
          </div>
        )

      case 'listening':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <h3 className="text-xl md:text-2xl font-semibold text-[#25231F]">
                {exercise.prompt}
              </h3>
              <AudioButton 
                text={exercise.prompt.replace('Select the word you hear: ', '')} 
                language={language.voiceCode}
              />
            </div>
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
                          ? 'border-[#2F9E69] bg-[#2F9E69]/10'
                          : 'border-[#D84B42] bg-[#D84B42]/10'
                        : 'border-[#0B8F62] bg-[#0B8F62]/10'
                      : 'border-[#E8E6E0] bg-white hover:border-[#0B8F62]/50'
                    }
                    ${showResult || hearts === 0 ? 'cursor-not-allowed' : 'cursor-pointer'}
                  `}
                  onClick={() => !showResult && hearts > 0 && handleAnswer(option)}
                  disabled={showResult || hearts === 0}
                  whileHover={!showResult && hearts > 0 ? { scale: 1.02 } : {}}
                  whileTap={!showResult && hearts > 0 ? { scale: 0.98 } : {}}
                >
                  <span className="font-medium text-[#25231F]">{option}</span>
                </motion.button>
              ))}
            </div>
          </div>
        )

      case 'fill-blank':
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
                          ? 'border-[#2F9E69] bg-[#2F9E69]/10'
                          : 'border-[#D84B42] bg-[#D84B42]/10'
                        : 'border-[#0B8F62] bg-[#0B8F62]/10'
                      : 'border-[#E8E6E0] bg-white hover:border-[#0B8F62]/50'
                    }
                    ${showResult || hearts === 0 ? 'cursor-not-allowed' : 'cursor-pointer'}
                  `}
                  onClick={() => !showResult && hearts > 0 && handleAnswer(option)}
                  disabled={showResult || hearts === 0}
                  whileHover={!showResult && hearts > 0 ? { scale: 1.02 } : {}}
                  whileTap={!showResult && hearts > 0 ? { scale: 0.98 } : {}}
                >
                  <span className="font-medium text-[#25231F]">{option}</span>
                </motion.button>
              ))}
            </div>
          </div>
        )

      case 'matching':
        return (
          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-semibold text-[#25231F] mb-6">
              {exercise.prompt}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {exercise.pairs.map((pair, index) => (
                <div key={index} className="space-y-2">
                  <div className="p-3 bg-[#0B8F62]/10 rounded-lg font-medium text-[#25231F]">
                    {pair.word}
                  </div>
                  <div className="p-3 bg-[#E8E6E0] rounded-lg text-[#77736B]">
                    {pair.meaning}
                  </div>
                </div>
              ))}
            </div>
            <Button onClick={() => handleAnswer('matched')} disabled={showResult || hearts === 0}>
              I've learned these
            </Button>
          </div>
        )

      default:
        return (
          <div className="text-center py-8">
            <p className="text-[#77736B]">Exercise type not yet implemented</p>
          </div>
        )
    }
  }

  const renderResult = () => {
    const lastAnswer = answers[answers.length - 1]
    const isCorrect = lastAnswer?.isCorrect || false
    
    return (
      <div className="text-center py-4">
        {isCorrect ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-[#2F9E69] text-6xl mb-2"
          >
            ✓
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-[#D84B42] text-6xl mb-2"
          >
            ✗
          </motion.div>
        )}
        <p className={`text-lg font-semibold ${isCorrect ? 'text-[#2F9E69]' : 'text-[#D84B42]'}`}>
          {isCorrect ? 'Correct!' : 'Not quite'}
        </p>
        {!isCorrect && (
          <p className="text-[#77736B] mt-1">
            The correct answer is: {lesson.exercises[currentExercise].correctAnswer}
          </p>
        )}
        {isCorrect && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[#F39A45] font-semibold mt-2"
          >
            +{lesson.exercises[currentExercise].xp} XP
          </motion.div>
        )}
      </div>
    )
  }

  const renderLessonComplete = () => {
    const correctAnswers = answers.filter(a => a.isCorrect).length
    const totalXP = answers.reduce((sum, a) => sum + (a.isCorrect ? lesson.exercises[a.exercise].xp : 0), 0)
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-3xl font-bold text-[#25231F] mb-2">Lesson Complete!</h2>
        <p className="text-[#77736B] mb-6">
          {correctAnswers} / {lesson.exercises.length} correct
        </p>
        <div className="bg-[#F39A45]/10 rounded-xl p-4 mb-6">
          <p className="text-2xl font-bold text-[#F39A45]">+{totalXP} XP</p>
        </div>
        {perfectLesson && (
          <div className="bg-[#2F9E69]/10 rounded-xl p-4 mb-6">
            <p className="text-lg font-semibold text-[#2F9E69]">Perfect Lesson! ⭐</p>
          </div>
        )}
        <Button size="large" onClick={() => navigate('/dashboard')}>
          Continue
        </Button>
      </motion.div>
    )
  }

  const renderOutOfHearts = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-8"
    >
      <div className="text-6xl mb-4">💔</div>
      <h2 className="text-3xl font-bold text-[#25231F] mb-2">You're out of hearts!</h2>
      <p className="text-[#77736B] mb-6">
        Practice review to restore your hearts.
      </p>
      <div className="space-y-3">
        <Button size="large" onClick={() => navigate('/practice')}>
          Practice Review
        </Button>
        <Button variant="outline" size="large" onClick={() => navigate('/dashboard')}>
          Take a break
        </Button>
      </div>
    </motion.div>
  )

  if (!lesson) {
    return (
      <div className="min-h-screen bg-[#F7F5EF] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#77736B]">Loading lesson...</p>
        </div>
      </div>
    )
  }

  if (hearts === 0 && !lessonComplete) {
    return (
      <div className="min-h-screen bg-[#F7F5EF] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <QuestionCard>{renderOutOfHearts()}</QuestionCard>
        </div>
      </div>
    )
  }

  if (lessonComplete) {
    return (
      <div className="min-h-screen bg-[#F7F5EF] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <QuestionCard>{renderLessonComplete()}</QuestionCard>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F5EF] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-[#25231F]">{lesson.name}</h1>
              <p className="text-sm text-[#77736B]">{lesson.nameNative}</p>
            </div>
            <div className="text-sm text-[#77736B]">
              Exercise {currentExercise + 1} of {lesson.exercises.length}
            </div>
          </div>
          <ProgressBar progress={((currentExercise + 1) / lesson.exercises.length) * 100} showLabel={false} />
        </div>

        <QuestionCard showResult={showResult} isCorrect={answers[answers.length - 1]?.isCorrect}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentExercise}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              {renderExercise()}
              {showResult && renderResult()}
            </motion.div>
          </AnimatePresence>
        </QuestionCard>

        <div className="flex justify-between mt-6">
          <div />
          <Button onClick={handleNext} disabled={!showResult}>
            {currentExercise === lesson.exercises.length - 1 ? 'Complete' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  )
}
