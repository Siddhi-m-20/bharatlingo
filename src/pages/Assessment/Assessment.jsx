import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../services/auth'
import { useProgress } from '../../services/progress'
import { getAssessmentQuestions } from '../../data/questions'
import { getLanguageById } from '../../data/languages'
import QuestionCard from '../../components/QuestionCard'
import Button from '../../components/Button'
import ProgressBar from '../../components/ProgressBar'
import AudioButton from '../../components/AudioButton'

export default function Assessment() {
  const navigate = useNavigate()
  const { user, updateUser } = useAuth()
  const { addXP } = useProgress()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState([])
  const [showResult, setShowResult] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [loading, setLoading] = useState(false)

  const questions = getAssessmentQuestions(user.learningLanguage)
  const language = getLanguageById(user.learningLanguage)

  useEffect(() => {
    if (!user.learningLanguage) {
      navigate('/onboarding')
    }
  }, [user, navigate])

  const handleAnswer = (answer) => {
    if (showResult) return
    
    setSelectedAnswer(answer)
    const isCorrect = answer === questions[currentQuestion].correctAnswer
    
    setAnswers([...answers, { question: currentQuestion, answer, isCorrect }])
    setShowResult(true)
    
    if (isCorrect) {
      addXP(questions[currentQuestion].xp)
    }
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setShowResult(false)
      setSelectedAnswer('')
    } else {
      completeAssessment()
    }
  }

  const completeAssessment = () => {
    const correctAnswers = answers.filter(a => a.isCorrect).length
    const percentage = (correctAnswers / questions.length) * 100
    
    let level
    if (percentage <= 30) {
      level = 'beginner'
    } else if (percentage <= 60) {
      level = 'elementary'
    } else if (percentage <= 80) {
      level = 'intermediate'
    } else {
      level = 'advanced'
    }

    updateUser({ level })
    navigate('/dashboard')
  }

  const renderQuestion = () => {
    const question = questions[currentQuestion]
    
    switch (question.type) {
      case 'multiple-choice':
        return (
          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-semibold text-[#25231F] mb-6">
              {question.prompt}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {question.options.map((option, index) => (
                <motion.button
                  key={index}
                  type="button"
                  className={`
                    p-4 rounded-xl border-2 text-left transition-all
                    ${selectedAnswer === option
                      ? showResult
                        ? option === question.correctAnswer
                          ? 'border-[#2F9E69] bg-[#2F9E69]/10'
                          : 'border-[#D84B42] bg-[#D84B42]/10'
                        : 'border-[#0B8F62] bg-[#0B8F62]/10'
                      : 'border-[#E8E6E0] bg-white hover:border-[#0B8F62]/50'
                    }
                    ${showResult ? 'cursor-not-allowed' : 'cursor-pointer'}
                  `}
                  onClick={() => !showResult && handleAnswer(option)}
                  disabled={showResult}
                  whileHover={!showResult ? { scale: 1.02 } : {}}
                  whileTap={!showResult ? { scale: 0.98 } : {}}
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
              {question.prompt}
            </h3>
            <input
              type="text"
              value={selectedAnswer}
              onChange={(e) => setSelectedAnswer(e.target.value)}
              className="w-full px-4 py-3 border-2 border-[#E8E6E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B8F62] focus:border-[#0B8F62]"
              placeholder="Type your answer..."
              disabled={showResult}
            />
            <Button onClick={() => handleAnswer(selectedAnswer)} disabled={!selectedAnswer || showResult}>
              Check answer
            </Button>
          </div>
        )

      case 'listening':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <h3 className="text-xl md:text-2xl font-semibold text-[#25231F]">
                {question.prompt}
              </h3>
              <AudioButton 
                text={question.prompt.replace('Select the word you hear: ', '')} 
                language={language.voiceCode}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {question.options.map((option, index) => (
                <motion.button
                  key={index}
                  type="button"
                  className={`
                    p-4 rounded-xl border-2 text-left transition-all
                    ${selectedAnswer === option
                      ? showResult
                        ? option === question.correctAnswer
                          ? 'border-[#2F9E69] bg-[#2F9E69]/10'
                          : 'border-[#D84B42] bg-[#D84B42]/10'
                        : 'border-[#0B8F62] bg-[#0B8F62]/10'
                      : 'border-[#E8E6E0] bg-white hover:border-[#0B8F62]/50'
                    }
                    ${showResult ? 'cursor-not-allowed' : 'cursor-pointer'}
                  `}
                  onClick={() => !showResult && handleAnswer(option)}
                  disabled={showResult}
                  whileHover={!showResult ? { scale: 1.02 } : {}}
                  whileTap={!showResult ? { scale: 0.98 } : {}}
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
              {question.prompt}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {question.options.map((option, index) => (
                <motion.button
                  key={index}
                  type="button"
                  className={`
                    p-4 rounded-xl border-2 text-left transition-all
                    ${selectedAnswer === option
                      ? showResult
                        ? option === question.correctAnswer
                          ? 'border-[#2F9E69] bg-[#2F9E69]/10'
                          : 'border-[#D84B42] bg-[#D84B42]/10'
                        : 'border-[#0B8F62] bg-[#0B8F62]/10'
                      : 'border-[#E8E6E0] bg-white hover:border-[#0B8F62]/50'
                    }
                    ${showResult ? 'cursor-not-allowed' : 'cursor-pointer'}
                  `}
                  onClick={() => !showResult && handleAnswer(option)}
                  disabled={showResult}
                  whileHover={!showResult ? { scale: 1.02 } : {}}
                  whileTap={!showResult ? { scale: 0.98 } : {}}
                >
                  <span className="font-medium text-[#25231F]">{option}</span>
                </motion.button>
              ))}
            </div>
          </div>
        )

      default:
        return null
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
            The correct answer is: {questions[currentQuestion].correctAnswer}
          </p>
        )}
      </div>
    )
  }

  if (!questions.length) {
    return (
      <div className="min-h-screen bg-[#F7F5EF] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#77736B]">Loading assessment...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F5EF] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-[#25231F]">Placement Assessment</h1>
            <div className="text-sm text-[#77736B]">
              Question {currentQuestion + 1} of {questions.length}
            </div>
          </div>
          <ProgressBar progress={((currentQuestion + 1) / questions.length) * 100} />
        </div>

        <QuestionCard showResult={showResult} isCorrect={answers[answers.length - 1]?.isCorrect}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              {renderQuestion()}
              {showResult && renderResult()}
            </motion.div>
          </AnimatePresence>
        </QuestionCard>

        <div className="flex justify-between mt-6">
          <div />
          <Button onClick={handleNext} disabled={!showResult}>
            {currentQuestion === questions.length - 1 ? 'See results' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  )
}
