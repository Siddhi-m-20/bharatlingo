import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../services/auth'
import { languages } from '../../data/languages'
import LanguageCard from '../../components/LanguageCard'
import Button from '../../components/Button'

const STEPS = {
  PREFERRED_LANGUAGE: 0,
  TARGET_LANGUAGE: 1,
  GOAL: 2,
  DAILY_GOAL: 3,
}

const GOALS = [
  { id: 'travel', name: 'Travel', icon: '✈️' },
  { id: 'conversation', name: 'Conversation', icon: '💬' },
  { id: 'work', name: 'Work', icon: '💼' },
  { id: 'study', name: 'Study', icon: '📚' },
  { id: 'family', name: 'Family', icon: '👨‍👩‍👧‍👦' },
  { id: 'culture', name: 'Culture', icon: '🎭' },
  { id: 'fun', name: 'Just for fun', icon: '🎮' },
]

const DAILY_GOALS = [
  { id: 5, name: '5 minutes', description: 'Casual' },
  { id: 10, name: '10 minutes', description: 'Regular' },
  { id: 15, name: '15 minutes', description: 'Serious' },
  { id: 20, name: '20 minutes', description: 'Intense' },
  { id: 30, name: '30 minutes', description: 'Hardcore' },
]

export default function Onboarding() {
  const navigate = useNavigate()
  const { user, updateUser } = useAuth()
  const [currentStep, setCurrentStep] = useState(STEPS.PREFERRED_LANGUAGE)
  const [selectedPreferredLang, setSelectedPreferredLang] = useState('en')
  const [selectedTargetLang, setSelectedTargetLang] = useState('')
  const [selectedGoal, setSelectedGoal] = useState('')
  const [selectedDailyGoal, setSelectedDailyGoal] = useState(10)

  const handleNext = () => {
    if (currentStep < STEPS.DAILY_GOAL) {
      setCurrentStep(currentStep + 1)
    } else {
      completeOnboarding()
    }
  }

  const handleBack = () => {
    if (currentStep > STEPS.PREFERRED_LANGUAGE) {
      setCurrentStep(currentStep - 1)
    }
  }

  const completeOnboarding = () => {
    updateUser({
      preferredLanguage: selectedPreferredLang,
      learningLanguage: selectedTargetLang,
      goal: selectedGoal,
      dailyGoal: selectedDailyGoal,
    })
    navigate('/assessment')
  }

  const isStepValid = () => {
    switch (currentStep) {
      case STEPS.PREFERRED_LANGUAGE:
        return !!selectedPreferredLang
      case STEPS.TARGET_LANGUAGE:
        return !!selectedTargetLang && selectedTargetLang !== selectedPreferredLang
      case STEPS.GOAL:
        return !!selectedGoal
      case STEPS.DAILY_GOAL:
        return !!selectedDailyGoal
      default:
        return false
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case STEPS.PREFERRED_LANGUAGE:
        return (
          <motion.div
            key="preferred-language"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <h2 className="text-2xl font-bold text-[#25231F] mb-2">What's your preferred language?</h2>
            <p className="text-[#77736B] mb-6">We'll use this to personalize your learning journey.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {languages.map((lang) => (
                <LanguageCard
                  key={lang.id}
                  language={lang}
                  selected={selectedPreferredLang === lang.id}
                  onClick={() => setSelectedPreferredLang(lang.id)}
                />
              ))}
            </div>
          </motion.div>
        )

      case STEPS.TARGET_LANGUAGE:
        return (
          <motion.div
            key="target-language"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <h2 className="text-2xl font-bold text-[#25231F] mb-2">What do you want to learn?</h2>
            <p className="text-[#77736B] mb-6">Pick one language to start. You can add more later.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {languages
                .filter((lang) => lang.id !== selectedPreferredLang)
                .map((lang) => (
                  <LanguageCard
                    key={lang.id}
                    language={lang}
                    selected={selectedTargetLang === lang.id}
                    onClick={() => setSelectedTargetLang(lang.id)}
                  />
                ))}
            </div>
          </motion.div>
        )

      case STEPS.GOAL:
        return (
          <motion.div
            key="goal"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <h2 className="text-2xl font-bold text-[#25231F] mb-2">What's your goal?</h2>
            <p className="text-[#77736B] mb-6">This helps us customize your learning path.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {GOALS.map((goal) => (
                <motion.button
                  key={goal.id}
                  type="button"
                  className={`
                    p-6 rounded-2xl border-2 text-left transition-all
                    ${selectedGoal === goal.id
                      ? 'border-[#0B8F62] bg-[#0B8F62]/10'
                      : 'border-[#E8E6E0] bg-white hover:border-[#0B8F62]/50'
                    }
                  `}
                  onClick={() => setSelectedGoal(goal.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="text-3xl mb-2">{goal.icon}</div>
                  <p className="font-semibold text-[#25231F]">{goal.name}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )

      case STEPS.DAILY_GOAL:
        return (
          <motion.div
            key="daily-goal"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <h2 className="text-2xl font-bold text-[#25231F] mb-2">How much time do you want to practice?</h2>
            <p className="text-[#77736B] mb-6">Set a daily goal that works for you.</p>
            <div className="space-y-3">
              {DAILY_GOALS.map((goal) => (
                <motion.button
                  key={goal.id}
                  type="button"
                  className={`
                    w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between
                    ${selectedDailyGoal === goal.id
                      ? 'border-[#0B8F62] bg-[#0B8F62]/10'
                      : 'border-[#E8E6E0] bg-white hover:border-[#0B8F62]/50'
                    }
                  `}
                  onClick={() => setSelectedDailyGoal(goal.id)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div>
                    <p className="font-semibold text-[#25231F]">{goal.name}</p>
                    <p className="text-sm text-[#77736B]">{goal.description}</p>
                  </div>
                  {selectedDailyGoal === goal.id && (
                    <div className="w-6 h-6 bg-[#0B8F62] rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F5EF] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-[#0B8F62] flex items-center justify-center text-white font-bold text-xl">
              भा
            </div>
            <div className="text-sm text-[#77736B]">
              Step {currentStep + 1} of {Object.keys(STEPS).length}
            </div>
          </div>
          <div className="w-full bg-[#E8E6E0] rounded-full h-2">
            <motion.div
              className="bg-[#0B8F62] h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / Object.keys(STEPS).length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>

          <div className="flex justify-between mt-8">
            {currentStep > STEPS.PREFERRED_LANGUAGE ? (
              <Button variant="ghost" onClick={handleBack}>
                Back
              </Button>
            ) : (
              <div />
            )}
            <Button onClick={handleNext} disabled={!isStepValid()}>
              {currentStep === STEPS.DAILY_GOAL ? 'Start assessment' : 'Continue'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
