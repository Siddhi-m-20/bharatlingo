import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../services/auth'
import { languages } from '../../data/languages'
import LanguageCard from '../../components/LanguageCard'
import Button from '../../components/Button'
import { useTheme } from '../../services/themeContext'

const STEPS = {
  AGE:                0,
  PREFERRED_LANGUAGE: 1,
  TARGET_LANGUAGE:    2,
  GOAL:               3,
}

const AGE_RANGES = [
  { id: 'child',       labelKey: 'age_under_13',  icon: '🌱', descKey: 'age_under_13_desc' },
  { id: 'teen',        labelKey: 'age_13_17',      icon: '🎮', descKey: 'age_13_17_desc' },
  { id: 'young-adult', labelKey: 'age_18_25',      icon: '💬', descKey: 'age_18_25_desc' },
  { id: 'adult',       labelKey: 'age_26_49',      icon: '💼', descKey: 'age_26_49_desc' },
  { id: 'senior',      labelKey: 'age_50_plus',    icon: '🌸', descKey: 'age_50_plus_desc' },
]

const GOALS = [
  { id: 'travel',       key: 'goal_travel',       icon: '✈️' },
  { id: 'conversation', key: 'goal_conversation', icon: '💬' },
  { id: 'work',         key: 'goal_work',         icon: '💼' },
  { id: 'study',        key: 'goal_study',        icon: '📚' },
  { id: 'family',       key: 'goal_family',       icon: '👨‍👩‍👧‍👦' },
  { id: 'culture',      key: 'goal_culture',      icon: '🎭' },
  { id: 'fun',          key: 'goal_fun',          icon: '🎮' },
]

const TOTAL_STEPS = Object.keys(STEPS).length

export default function Onboarding() {
  const navigate = useNavigate()
  const { user, updateUser } = useAuth()
  const { t } = useTheme()
  const [currentStep, setCurrentStep] = useState(STEPS.AGE)
  const [selectedAge, setSelectedAge]               = useState(user?.ageRange || '')
  const [selectedPreferredLang, setSelectedPreferredLang] = useState(user?.preferredLanguage || 'en')
  const [selectedTargetLang, setSelectedTargetLang] = useState(user?.learningLanguage || '')
  const [selectedGoal, setSelectedGoal]             = useState(user?.goal || '')

  const handleNext = () => {
    if (currentStep < STEPS.GOAL) {
      setCurrentStep(currentStep + 1)
    } else {
      completeOnboarding()
    }
  }

  const handleBack = () => {
    if (currentStep > STEPS.AGE) {
      setCurrentStep(currentStep - 1)
    }
  }

  const completeOnboarding = async () => {
    await updateUser({
      ageRange: selectedAge,
      preferredLanguage: selectedPreferredLang,
      learningLanguage: selectedTargetLang,
      goal: selectedGoal,
      dailyGoal: user?.dailyGoal || 10,
      hasCompletedAssessment: false,
      assessmentScore: null,
      learningPlan: null,
    })
    sessionStorage.setItem('bharatlingo_assessment_required', '1')
    navigate('/assessment')
  }

  const isStepValid = () => {
    switch (currentStep) {
      case STEPS.AGE:               return !!selectedAge
      case STEPS.PREFERRED_LANGUAGE: return !!selectedPreferredLang
      case STEPS.TARGET_LANGUAGE:   return !!selectedTargetLang && selectedTargetLang !== selectedPreferredLang
      case STEPS.GOAL:              return !!selectedGoal
      default:                      return false
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case STEPS.AGE:
        return (
          <motion.div
            key="age"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <h2 className="text-2xl font-bold text-[#25231F] dark:text-white mb-2">
              {t('how_old_are_you')}
            </h2>
            <p className="text-[#77736B] dark:text-slate-400 mb-6">
              {t('age_desc')}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {AGE_RANGES.map((range) => (
                <motion.button
                  key={range.id}
                  type="button"
                  className={`
                    p-4 rounded-2xl border-2 text-left transition-all
                    ${selectedAge === range.id
                      ? 'border-[#0B8F62] bg-[#0B8F62]/10 dark:bg-[#0B8F62]/20'
                      : 'border-[#E8E6E0] dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-[#0B8F62]/50'
                    }
                  `}
                  onClick={() => setSelectedAge(range.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="text-2xl mb-1">{range.icon}</div>
                  <p className="font-bold text-[#25231F] dark:text-white text-sm">{t(range.labelKey)}</p>
                  <p className="text-xs text-[#77736B] dark:text-slate-400 mt-0.5">{t(range.descKey)}</p>
                  {selectedAge === range.id && (
                    <div className="mt-2 w-5 h-5 bg-[#0B8F62] rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )

      case STEPS.PREFERRED_LANGUAGE:
        return (
          <motion.div
            key="preferred-language"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <h2 className="text-2xl font-bold text-[#25231F] dark:text-white mb-2">
              {t('what_preferred_language')}
            </h2>
            <p className="text-[#77736B] dark:text-slate-400 mb-6">
              {t('preferred_lang_desc')}
            </p>
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
            <h2 className="text-2xl font-bold text-[#25231F] dark:text-white mb-2">
              {t('what_want_to_learn')}
            </h2>
            <p className="text-[#77736B] dark:text-slate-400 mb-6">
              {t('target_lang_desc')}
            </p>
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
            <h2 className="text-2xl font-bold text-[#25231F] dark:text-white mb-2">
              {t('whats_your_goal')}
            </h2>
            <p className="text-[#77736B] dark:text-slate-400 mb-6">
              {t('goal_desc')}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {GOALS.map((goal) => (
                <motion.button
                  key={goal.id}
                  type="button"
                  className={`
                    p-6 rounded-2xl border-2 text-left transition-all
                    ${selectedGoal === goal.id
                      ? 'border-[#0B8F62] bg-[#0B8F62]/10 dark:bg-[#0B8F62]/20'
                      : 'border-[#E8E6E0] dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-[#0B8F62]/50'
                    }
                  `}
                  onClick={() => setSelectedGoal(goal.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="text-3xl mb-2">{goal.icon}</div>
                  <p className="font-semibold text-[#25231F] dark:text-white">{t(goal.key)}</p>
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
    <div className="min-h-screen bg-[#F7F5EF] dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-full bg-[#0B8F62] flex items-center justify-center text-white font-bold text-lg">
              भा
            </div>
            <div className="text-sm text-[#77736B] dark:text-slate-400 font-medium">
              {t('step_x_of_y', { current: currentStep + 1, total: TOTAL_STEPS })}
            </div>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-[#E8E6E0] dark:bg-slate-800 rounded-full h-2">
            <motion.div
              className="bg-[#0B8F62] h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / TOTAL_STEPS) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          {/* Step dots */}
          <div className="flex gap-1.5 mt-3 justify-center">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all duration-300 ${
                  i < currentStep ? 'w-5 h-2 bg-[#0B8F62]' :
                  i === currentStep ? 'w-6 h-2 bg-[#0B8F62]' :
                  'w-2 h-2 bg-[#E8E6E0] dark:bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-[#E8E6E0] dark:border-slate-800 p-6 md:p-8">
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>

          <div className="flex justify-between mt-8">
            {currentStep > STEPS.AGE ? (
              <Button variant="ghost" onClick={handleBack}>
                {t('back')}
              </Button>
            ) : (
              <div />
            )}
            <Button onClick={handleNext} disabled={!isStepValid()}>
              {currentStep === STEPS.GOAL ? t('find_my_level') : t('continue')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

