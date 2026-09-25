import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../services/auth'
import { useProgress } from '../../services/progress'
import { getLanguageById } from '../../data/languages'
import { fetchAssessmentQuestions, generatePersonalizedPlan } from '../../services/dynamicLessonService'
import { recordExerciseAttempt } from '../../services/learnerModel'
import { persistLearnerStats, recordLearningActivity } from '../../services/dbService'
import QuestionCard from '../../components/QuestionCard'
import Button from '../../components/Button'
import ProgressBar from '../../components/ProgressBar'
import ListeningExercise from '../../components/ListeningExercise/ListeningExercise'
import SpeakingExercise from '../../components/SpeakingExercise/SpeakingExercise'
import SentenceOrderExercise from '../../components/SentenceOrderExercise/SentenceOrderExercise'
import MatchingExercise from '../../components/MatchingExercise/MatchingExercise'
import AudioButton from '../../components/AudioButton'
import { digitToLanguageWord, sanitizeLanguageOptions } from '../../data/translations.js'

// ── Personalized Plan Screen ─────────────────────────────────────────────────
function PersonalizedPlanScreen({ plan, user, onContinue }) {
  const language = getLanguageById(user?.learningLanguage)
  const levelColors = {
    Beginner: 'text-[#0B8F62] bg-[#0B8F62]/10',
    Elementary: 'text-[#3B82F6] bg-[#3B82F6]/10',
    Intermediate: 'text-[#F39A45] bg-[#F39A45]/10',
    Advanced: 'text-[#8B5CF6] bg-[#8B5CF6]/10',
  }
  const levelStyle = levelColors[plan?.startingLevel] || levelColors.Beginner

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className="text-5xl mb-3"
        >
          🎯
        </motion.div>
        <h2 className="text-2xl font-black text-[#25231F] dark:text-white">
          Your Personalized Learning Plan
        </h2>
        <p className="text-[#77736B] dark:text-slate-400 text-sm">
          Tailored for you based on your answers and goals
        </p>
      </div>

      {/* Plan card */}
      <div className="bg-[#F7F5EF] dark:bg-slate-800 rounded-2xl p-5 space-y-4 border border-[#E8E6E0] dark:border-slate-700">
        {/* Top stats row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-3 text-center border border-[#E8E6E0] dark:border-slate-700">
            <span className={`text-xs font-black px-2 py-0.5 rounded-full ${levelStyle}`}>
              {plan?.startingLevel || 'Beginner'}
            </span>
            <p className="text-[10px] text-[#77736B] dark:text-slate-400 mt-1 font-medium">Starting Level</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl p-3 text-center border border-[#E8E6E0] dark:border-slate-700">
            <p className="text-sm font-black text-[#0B8F62]">{plan?.goal || 'Conversation'}</p>
            <p className="text-[10px] text-[#77736B] dark:text-slate-400 mt-1 font-medium">Goal</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl p-3 text-center border border-[#E8E6E0] dark:border-slate-700">
            <p className="text-sm font-black text-[#3B82F6]">{plan?.dailyPractice || '10 min'}</p>
            <p className="text-[10px] text-[#77736B] dark:text-slate-400 mt-1 font-medium">Daily Practice</p>
          </div>
        </div>

        {/* Language info */}
        {language && (
          <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-[#E8E6E0] dark:border-slate-700">
            <span className="text-3xl">{language.flag}</span>
            <div>
              <p className="font-bold text-[#25231F] dark:text-white text-sm">Learning {language.name}</p>
              <p className="text-xs text-[#77736B] dark:text-slate-400">{language.nativeName}</p>
            </div>
          </div>
        )}

        {/* Focus areas */}
        <div>
          <p className="text-xs font-black text-[#25231F] dark:text-white uppercase tracking-wider mb-2">
            Focus Areas
          </p>
          <div className="space-y-1.5">
            {(plan?.focusAreas || []).map((area, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
                className="flex items-center gap-2"
              >
                <div className="w-4 h-4 rounded-full bg-[#0B8F62] flex items-center justify-center flex-shrink-0">
                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm text-[#25231F] dark:text-white">{area}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Next lesson recommendation */}
        <div className="p-3 bg-[#0B8F62]/10 dark:bg-[#0B8F62]/20 rounded-xl border border-[#0B8F62]/20">
          <p className="text-xs font-black text-[#0B8F62] uppercase tracking-wider mb-1">
            Recommended First Lesson
          </p>
          <p className="font-bold text-[#25231F] dark:text-white text-sm">
            🎓 {plan?.recommendedFirstLesson || 'Greetings & Introductions'}
          </p>
        </div>
      </div>

      <Button onClick={onContinue} className="w-full justify-center">
        Start Learning →
      </Button>
    </motion.div>
  )
}

// ── Main Assessment component ─────────────────────────────────────────────────
export default function Assessment() {
  const navigate = useNavigate()
  const { user, updateUser } = useAuth()
  const { addXP, addGems } = useProgress()

  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState([])
  const [showResult, setShowResult] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [showPlan, setShowPlan] = useState(false)
  const [plan, setPlan] = useState(null)
  const [generatingPlan, setGeneratingPlan] = useState(false)
  const assessmentStartTimeRef = useRef(Date.now())

  const language = getLanguageById(user?.learningLanguage)

  // Load assessment questions from dynamic API
  useEffect(() => {
    if (!user) return

    if (!user?.learningLanguage) {
      navigate('/onboarding')
      return
    }
    if (user.hasCompletedAssessment || user.assessmentScore !== null && user.assessmentScore !== undefined) {
      navigate('/dashboard', { replace: true })
      return
    }
    if (sessionStorage.getItem('bharatlingo_assessment_required') !== '1') {
      navigate('/dashboard', { replace: true })
      return
    }
    let cancelled = false

    async function loadQuestions() {
      setLoading(true)
      setLoadError(null)
      try {
        const qs = await fetchAssessmentQuestions({
          languageId: user.learningLanguage,
          preferredLanguage: user?.preferredLanguage || 'en',
          ageRange: user.ageRange || 'adult',
          goal: user.goal || 'conversation',
          count: 15,
        })
        const langObj = getLanguageById(user.learningLanguage)
        const targetLangName = langObj?.name || 'target language'
        const normalized = (qs || []).map((q) => {
          let prompt = q.prompt || ''
          if (/select\s+(the\s+)?(correct\s+)?image\s+for\s+["']?(.*?)["']?/i.test(prompt)) {
            const match = prompt.match(/select\s+(the\s+)?(correct\s+)?image\s+for\s+["']?(.*?)["']?/i)
            const target = match ? match[3] : ''
            prompt = `What is "${target}" in ${targetLangName}?`
          }
          const isTarget = q.type === 'listening' || q.type === 'fill-blank' || (q.word && q.correctAnswer === q.word)
          const optLang = isTarget ? user.learningLanguage : (user?.preferredLanguage || 'en')
          const cleanAns = digitToLanguageWord(q.correctAnswer, optLang)
          const rawOpts = (q.options && q.options.length > 0)
            ? q.options.map((opt) => (typeof opt === 'string' ? opt : opt?.word || opt?.text || opt?.label || ''))
            : []
          const cleanOpts = sanitizeLanguageOptions(rawOpts, cleanAns, optLang)
          return {
            ...q,
            type: (q.type === 'picture_choice' || q.type === 'picture-choice') ? 'multiple-choice' : q.type,
            prompt,
            correctAnswer: cleanAns,
            options: cleanOpts,
          }
        })
        if (!cancelled) {
          setQuestions(normalized)
          assessmentStartTimeRef.current = Date.now()
          setLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError('Could not load questions. Please try again.')
          setLoading(false)
        }
      }
    }

    loadQuestions()
    return () => { cancelled = true }
  }, [user?.learningLanguage, user?.ageRange, user?.goal, user?.hasCompletedAssessment, user?.assessmentScore, user?.completedLessons, navigate])

  const handleAnswer = useCallback((answer, { skipped = false } = {}) => {
    if (showResult || !questions[currentQuestion]) return
    setSelectedAnswer(answer)
    const q = questions[currentQuestion]
    const langCode = user?.learningLanguage || 'hi'
    const prefCode = user?.preferredLanguage || 'en'
    const isTargetOptions = q.type === 'fill-blank' || (q.word && q.correctAnswer === q.word)
    const optionLang = isTargetOptions ? langCode : prefCode
    const cleanCorrect = digitToLanguageWord(q.correctAnswer, optionLang)

    const isMatching = q.type === 'matching' || answer === 'matched_all'
    const isSpeaking = q.type === 'speaking'
    const isCorrect = skipped ? false : (
      isMatching ||
      isSpeaking ||
      (answer || '').trim().toLowerCase() === (q.correctAnswer || '').trim().toLowerCase() ||
      (answer || '').trim().toLowerCase() === (cleanCorrect || '').trim().toLowerCase()
    )
    setAnswers((prev) => [...prev, { question: currentQuestion, answer, isCorrect, skipped }])
    setShowResult(true)
    if (isCorrect) addXP(q.xp || 10)

    try {
      const learnerStats = recordExerciseAttempt(user?.learningLanguage || 'hi', q, isCorrect)
      if (user?.id && learnerStats) persistLearnerStats(user.id, learnerStats)
    } catch { }
  }, [showResult, questions, currentQuestion, addXP, user?.learningLanguage, user?.preferredLanguage])

  const handleNext = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
      setShowResult(false)
      setSelectedAnswer('')
    } else {
      const q = questions[currentQuestion]
      const langCode = user?.learningLanguage || 'hi'
      const prefCode = user?.preferredLanguage || 'en'
      const isTargetOptions = q?.type === 'fill-blank' || (q?.word && q?.correctAnswer === q?.word)
      const cleanCorrect = digitToLanguageWord(q?.correctAnswer, isTargetOptions ? langCode : prefCode)
      const isMatching = q?.type === 'matching' || selectedAnswer === 'matched_all'
      const isSpeaking = q?.type === 'speaking' && Boolean(selectedAnswer)
      const isCorrect =
        isMatching ||
        isSpeaking ||
        (selectedAnswer || '').trim().toLowerCase() === (q?.correctAnswer || '').trim().toLowerCase() ||
        (selectedAnswer || '').trim().toLowerCase() === (cleanCorrect || '').trim().toLowerCase()

      await completeAssessment([
        ...answers,
        { question: currentQuestion, answer: selectedAnswer, isCorrect },
      ])
    }
  }

  const completeAssessment = async (latestAnswers = answers) => {
    const correctCount = latestAnswers.filter((a) => a.isCorrect).length
    const total = questions.length
    const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0

    let level
    if (percentage <= 30) level = 'beginner'
    else if (percentage <= 60) level = 'elementary'
    else if (percentage <= 80) level = 'intermediate'
    else level = 'advanced'

    // Award initial completion rewards (XP + Diamonds) based on placement
    const completionBonusXP = 20
    const completionBonusGems = 25
    addXP(completionBonusXP)
    addGems(completionBonusGems)

    // Save assessment score and mark assessment as completed permanently
    await updateUser({
      level,
      assessmentScore: percentage,
      hasCompletedAssessment: true,
      lastActiveDate: new Date().toISOString().split('T')[0],
      streak: 1,
    })
    sessionStorage.removeItem('bharatlingo_assessment_required')

    await recordLearningActivity({
      userId: user.id,
      activityDate: new Date().toISOString().split('T')[0],
      exercisesCompleted: total,
      xpEarned: completionBonusXP + latestAnswers.reduce((sum, answer) => sum + (answer.isCorrect ? 10 : 0), 0),
      sessionDurationSeconds: Math.max(1, Math.round((Date.now() - assessmentStartTimeRef.current) / 1000)),
      languageId: user.learningLanguage,
      sessionType: 'assessment',
    })

    // Generate personalized learning plan (server-side — no provider details exposed)
    setGeneratingPlan(true)
    try {
      const generatedPlan = await generatePersonalizedPlan({
        languageId: user.learningLanguage,
        ageRange: user.ageRange || 'adult',
        goal: user.goal || 'conversation',
        level,
        assessmentScore: percentage,
        dailyGoal: user.dailyGoal || 10,
      })
      await updateUser({ learningPlan: generatedPlan })
      setPlan(generatedPlan)
    } catch {
      // Plan generation failed gracefully — still show basic plan
      const fallback = {
        startingLevel: level.charAt(0).toUpperCase() + level.slice(1),
        goal: (user.goal || 'conversation').charAt(0).toUpperCase() + (user.goal || 'conversation').slice(1),
        dailyPractice: `${user.dailyGoal || 10} min`,
        focusAreas: ['Everyday conversation', 'Essential vocabulary', 'Listening', 'Speaking'],
        recommendedFirstLesson: 'Greetings & Introductions',
      }
      setPlan(fallback)
    } finally {
      setGeneratingPlan(false)
      setShowPlan(true)
    }
  }

  const handlePlanContinue = () => {
    // Signal dashboard to show the personalized plan banner
    sessionStorage.setItem('bharatlingo_just_assessed', '1')
    navigate('/dashboard')
  }

  // ── Render question types ──────────────────────────────────────────────────
  const renderQuestion = () => {
    const q = questions[currentQuestion]
    if (!q) return null

    switch (q.type) {
      case 'picture-choice':
      case 'picture_choice':
      case 'multiple-choice':
      case 'fill-blank': {
        const langCode = user?.learningLanguage || 'hi'
        const prefCode = user?.preferredLanguage || 'en'
        const isTargetOptions = q.type === 'fill-blank' || (q.word && q.correctAnswer === q.word)
        const optionLang = isTargetOptions ? langCode : prefCode
        const cleanCorrect = digitToLanguageWord(q.correctAnswer, optionLang)
        const rawOptions = (q.options && q.options.length > 0)
          ? q.options.map((opt) => (typeof opt === 'string' ? opt : opt?.word || opt?.text || opt?.label || ''))
          : []
        const sanitizedOptions = sanitizeLanguageOptions(rawOptions, cleanCorrect, optionLang)

        let displayPrompt = q.prompt || ''
        if (/select\s+(the\s+)?(correct\s+)?image\s+for\s+["']?(.*?)["']?/i.test(displayPrompt)) {
          const match = displayPrompt.match(/select\s+(the\s+)?(correct\s+)?image\s+for\s+["']?(.*?)["']?/i)
          const target = match ? match[3] : ''
          const targetLangObj = getLanguageById(langCode)
          const targetLangName = targetLangObj?.name || 'target language'
          displayPrompt = `What is "${target}" in ${targetLangName}?`
        }

        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-[#25231F] dark:text-white mb-4">
              {displayPrompt}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sanitizedOptions.map((option, idx) => {
                const isMatch = option === cleanCorrect || option === q.correctAnswer
                return (
                  <motion.button
                    key={idx}
                    type="button"
                    className={`
                      p-4 rounded-xl border-2 text-left transition-all
                      ${selectedAnswer === option
                        ? showResult
                          ? isMatch
                            ? 'border-[#2F9E69] bg-[#2F9E69]/10'
                            : 'border-[#D84B42] bg-[#D84B42]/10'
                          : 'border-[#0B8F62] bg-[#0B8F62]/10'
                        : showResult && isMatch
                          ? 'border-[#2F9E69] bg-[#2F9E69]/10'
                          : 'border-[#E8E6E0] dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-[#0B8F62]/50'
                      }
                      ${showResult ? 'cursor-default' : 'cursor-pointer'}
                    `}
                    onClick={() => !showResult && handleAnswer(option)}
                    disabled={showResult}
                    whileHover={!showResult ? { scale: 1.02 } : {}}
                    whileTap={!showResult ? { scale: 0.98 } : {}}
                  >
                    <span className="font-medium text-[#25231F] dark:text-white">{option}</span>
                  </motion.button>
                )
              })}
            </div>
          </div>
        )
      }

      case 'sentence-order':
      case 'sentence_order':
        return (
          <SentenceOrderExercise
            prompt={q.prompt}
            words={q.words || []}
            sentence={q.sentence || q.correctAnswer}
            correctAnswer={q.correctAnswer}
            languageId={user?.learningLanguage || 'hi'}
            onSubmit={handleAnswer}
            disabled={showResult}
            showResult={showResult}
          />
        )

      case 'matching':
        return (
          <MatchingExercise
            prompt={q.prompt}
            pairs={q.pairs || []}
            onSubmit={(ans) => handleAnswer(ans || 'matched_all')}
            onComplete={(ans) => handleAnswer(ans || 'matched_all')}
            disabled={showResult}
            showResult={showResult}
            languageId={user?.learningLanguage || 'hi'}
          />
        )

      case 'translation':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-[#25231F] dark:text-white mb-2">
              {q.prompt}
            </h3>
            <input
              type="text"
              value={selectedAnswer}
              onChange={(e) => setSelectedAnswer(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && selectedAnswer && !showResult && handleAnswer(selectedAnswer)}
              className="w-full px-4 py-3 border-2 border-[#E8E6E0] dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-[#25231F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0B8F62] focus:border-[#0B8F62]"
              placeholder="Type or select words below..."
              disabled={showResult}
            />
            {q.wordBank && q.wordBank.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {q.wordBank.map((word, wIdx) => (
                  <button
                    key={wIdx}
                    type="button"
                    disabled={showResult}
                    onClick={() => {
                      if (showResult) return
                      setSelectedAnswer((prev) => (prev ? `${prev} ${word}`.trim() : word))
                    }}
                    className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-800 dark:text-slate-100 hover:border-[#0B8F62] hover:bg-[#0B8F62]/5 active:scale-95 transition-all shadow-xs cursor-pointer"
                  >
                    {word}
                  </button>
                ))}
                {selectedAnswer && !showResult && (
                  <button
                    type="button"
                    onClick={() => setSelectedAnswer('')}
                    className="px-2.5 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:underline font-semibold cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            )}
            <Button onClick={() => handleAnswer(selectedAnswer)} disabled={!selectedAnswer || showResult}>
              Check Answer
            </Button>
          </div>
        )

      case 'listening':
        return (
          <ListeningExercise
            prompt={q.prompt}
            audioText={q.audioText || q.correctAnswer}
            options={q.options || []}
            correctAnswer={q.correctAnswer}
            languageId={user?.learningLanguage || 'hi'}
            selectedAnswer={selectedAnswer}
            onSelectAnswer={(ans) => !showResult && handleAnswer(ans)}
            showResult={showResult}
            disabled={showResult}
            level={2}
          />
        )

      case 'speaking':
        return (
          <SpeakingExercise
            prompt={q.prompt}
            targetWord={q.targetWord || q.correctAnswer}
            pronunciation={q.pronunciation}
            languageId={user?.learningLanguage || 'hi'}
            showResult={showResult}
            onSubmit={(answer) => !showResult && handleAnswer(answer)}
            onSkip={() => !showResult && handleAnswer('', { skipped: true })}
          />
        )

      case 'challenge':
        if (q.sentence || (q.words && q.words.length > 0)) {
          return (
            <SentenceOrderExercise
              prompt={q.prompt}
              words={q.words || []}
              sentence={q.sentence || q.correctAnswer}
              correctAnswer={q.correctAnswer}
              languageId={user?.learningLanguage || 'hi'}
              onSubmit={handleAnswer}
              disabled={showResult}
              showResult={showResult}
            />
          )
        }
        return (
          <SpeakingExercise
            prompt={q.prompt}
            targetWord={q.targetWord || q.correctAnswer}
            pronunciation={q.pronunciation}
            languageId={user?.learningLanguage || 'hi'}
            showResult={showResult}
            onSubmit={(answer) => !showResult && handleAnswer(answer)}
            onSkip={() => !showResult && handleAnswer('', { skipped: true })}
          />
        )

      default:
        return null
    }
  }

  const renderAnswerFeedback = () => {
    const last = answers[answers.length - 1]
    if (!last) return null
    const q = questions[currentQuestion]
    if (!q) return null

    // For speaking, matching, and sentence-order, don't show duplicate feedback
    if (['speaking', 'matching', 'sentence-order', 'sentence_order'].includes(q.type)) return null

    return (
      <div className={`mt-4 p-4 rounded-xl border-2 text-center ${last.isCorrect ? 'border-[#2F9E69] bg-[#2F9E69]/10' : 'border-[#D84B42] bg-[#D84B42]/10'}`}>
        <p className={`text-lg font-bold ${last.isCorrect ? 'text-[#2F9E69]' : 'text-[#D84B42]'}`}>
          {last.isCorrect ? '✓ Correct!' : '✗ Not quite'}
        </p>
        {!last.isCorrect && q.correctAnswer && q.correctAnswer !== 'matched_all' && (
          <p className="text-sm text-[#77736B] dark:text-slate-400 mt-1">
            Correct answer: <span className="font-bold text-[#25231F] dark:text-white">{q.correctAnswer}</span>
          </p>
        )}
      </div>
    )
  }

  // ── Loading states ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F5EF] dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            className="w-12 h-12 border-4 border-[#0B8F62] border-t-transparent rounded-full mx-auto"
          />
          <p className="text-[#77736B] dark:text-slate-400 font-medium">
            Finding your starting level...
          </p>
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-[#F7F5EF] dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="text-4xl">⚠️</div>
          <p className="text-[#D84B42] font-semibold">{loadError}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  if (generatingPlan) {
    return (
      <div className="min-h-screen bg-[#F7F5EF] dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            className="w-12 h-12 border-4 border-[#0B8F62] border-t-transparent rounded-full mx-auto"
          />
          <p className="text-[#77736B] dark:text-slate-400 font-medium">
            Generating your personalized lesson plan...
          </p>
        </div>
      </div>
    )
  }

  // ── Personalized plan view ─────────────────────────────────────────────────
  if (showPlan && plan) {
    return (
      <div className="min-h-screen bg-[#F7F5EF] dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-[#E8E6E0] dark:border-slate-800 p-6 md:p-8">
          <PersonalizedPlanScreen plan={plan} user={user} onContinue={handlePlanContinue} />
        </div>
      </div>
    )
  }

  // ── Assessment questions ────────────────────────────────────────────────────
  if (!questions.length) {
    return (
      <div className="min-h-screen bg-[#F7F5EF] dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-[#77736B] dark:text-slate-400">No questions available.</p>
          <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
        </div>
      </div>
    )
  }

  const q = questions[currentQuestion]

  return (
    <div className="min-h-screen bg-[#F7F5EF] dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-black text-[#25231F] dark:text-white">Find Your Starting Level</h1>
              {language && (
                <p className="text-xs text-[#77736B] dark:text-slate-400 flex items-center gap-1 mt-0.5">
                  <span>{language.flag}</span>
                  <span>Learning: {language.name}</span>
                  <span className="ml-2 font-semibold text-[#0B8F62]">Questions in: {getLanguageById(user?.preferredLanguage || 'en')?.name || 'English'}</span>
                </p>
              )}
            </div>
            <div className="text-sm text-[#77736B] dark:text-slate-400 font-medium">
              {currentQuestion + 1} / {questions.length}
            </div>
          </div>
          <ProgressBar progress={((currentQuestion + 1) / questions.length) * 100} />

          {/* Progressive Stage & Skill Badges */}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {/* Stage Indicator Badge */}
            <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${
              (currentQuestion < 5)
                ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                : (currentQuestion < 10)
                ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800'
                : 'bg-purple-100 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800'
            }`}>
              {currentQuestion < 5
                ? '🌱 Stage 1: Fundamentals'
                : currentQuestion < 10
                ? '⚡ Stage 2: Applied Language'
                : '⭐ Stage 3: Fluency & Syntax'}
            </span>

            {/* Exercise type badge */}
            {q?.type === 'listening' && (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                🎧 Listening
              </span>
            )}
            {q?.type === 'speaking' && (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                🎤 Speaking
              </span>
            )}
            {(q?.type === 'sentence-order' || q?.type === 'sentence_order') && (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                🧩 Sentence Order
              </span>
            )}
            {q?.type === 'matching' && (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                🔄 Matching
              </span>
            )}
            {(q?.type === 'picture_choice' || q?.type === 'picture-choice') && (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                📖 Word Meaning
              </span>
            )}
            {(q?.type === 'multiple-choice' || q?.type === 'fill-blank') && (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800">
                ✏️ {q?.type === 'fill-blank' ? 'Grammar Cloze' : 'Vocabulary'}
              </span>
            )}
            {q?.type === 'translation' && (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                🔤 Translation
              </span>
            )}
            {q?.type === 'challenge' && (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                🏆 Mastery Challenge
              </span>
            )}
          </div>
        </div>

        {/* Question card */}
        <QuestionCard showResult={showResult} isCorrect={answers[answers.length - 1]?.isCorrect}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.25 }}
            >
              {renderQuestion()}
              {showResult && renderAnswerFeedback()}
            </motion.div>
          </AnimatePresence>
        </QuestionCard>

        {/* Next button */}
        <div className="flex justify-end mt-5">
          <Button onClick={handleNext} disabled={!showResult}>
            {currentQuestion === questions.length - 1 ? 'See My Learning Plan →' : 'Next →'}
          </Button>
        </div>
      </div>
    </div>
  )
}
