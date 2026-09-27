import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../services/auth'
import { useProgress } from '../../services/progress'
import { fetchLessonById, fetchNextAdaptiveLesson } from '../../services/dynamicLessonService'
import { getLanguageById } from '../../data/languages'
import { recordExerciseAttempt } from '../../services/learnerModel'
import { persistLearnerStats } from '../../services/dbService'
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
import SentenceOrderExercise from '../../components/SentenceOrderExercise/SentenceOrderExercise'
import ReadingExercise from '../../components/ReadingExercise/ReadingExercise'
import { digitToLanguageWord, sanitizeLanguageOptions, getPromptText, getLocalizedTopicName } from '../../data/translations.js'
import { localizeLesson, translateMeaning } from '../../data/lessons/index'
import { Sparkles, Crown, Brain, Lightbulb } from 'lucide-react'
import { triggerConfetti } from '../../utils/confetti'
import { ttsService } from '../../services/audio/AudioService'
import { useTheme } from '../../services/themeContext'

export default function Lesson() {
  const { lessonId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t } = useTheme()
  const {
    gems,
    spendGems,
    addXP,
    updateStreak,
    completeLesson,
    completeLegendaryLesson,
    unlockAchievement,
  } = useProgress()

  const isLegendary = new URLSearchParams(window.location.search).get('mode') === 'legendary'

  const [lesson, setLesson] = useState(null)
  const [nextLesson, setNextLesson] = useState(null)
  const [currentExercise, setCurrentExercise] = useState(0)
  const [answers, setAnswers] = useState([])
  const [showResult, setShowResult] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [hintVisible, setHintVisible] = useState(false)
  const [lessonComplete, setLessonComplete] = useState(false)
  const [perfectLesson, setPerfectLesson] = useState(true)
  const [streakResult, setStreakResult] = useState({ increased: false, newStreak: 1 })
  const [totalXPEarned, setTotalXPEarned] = useState(0)

  const exerciseStartTimeRef = useRef(Date.now())
  const lessonStartTimeRef = useRef(Date.now())

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
      // Fetch lesson — supports adaptive session IDs, topic IDs, and static IDs
      let loadedLesson = await fetchLessonById({
        languageId: user.learningLanguage,
        lessonId,
        preferredLangId: preferredLang,
        level: user.level || 'beginner',
        goal: user.goal || 'conversation',
      })

      if (!loadedLesson) {
        navigate('/dashboard')
        return
      }

      if (cancelled) return

      // Ensure all exercises, prompts, options, and word meanings are 100% localized to preferred language
      const localizedLesson = localizeLesson(loadedLesson, user.learningLanguage, preferredLang)
      setLesson(localizedLesson || loadedLesson)
      setCurrentExercise(0)
      setAnswers([])
      setShowResult(false)
      setSelectedAnswer('')
      setHintVisible(false)
      setLessonComplete(false)
      setPerfectLesson(true)
      exerciseStartTimeRef.current = Date.now()
      lessonStartTimeRef.current = Date.now()
      ttsService.stop()

      // Pre-fetch a following adaptive lesson
      try {
        const following = await fetchNextAdaptiveLesson({
          languageId: user.learningLanguage,
          preferredLang,
          level: user.level || 'beginner',
          goal: user.goal || 'conversation',
        })
        if (!cancelled) setNextLesson(following)
      } catch {}
    }

    loadLesson()
    return () => { cancelled = true }
  }, [lessonId, user?.learningLanguage, user?.preferredLanguage, user?.goal, navigate])

  const handleAnswer = (answer, { skipped = false } = {}) => {
    if (showResult || !lesson) return

    const timeSpentMs = Date.now() - exerciseStartTimeRef.current
    setSelectedAnswer(answer)
    const currentExerciseData = lesson.exercises[currentExercise]
    
    // Check answer correctness
    let isCorrect = false
    if (skipped) {
      isCorrect = false
    } else if (currentExerciseData.type === 'matching' || answer === 'matched_all') {
      isCorrect = true
    } else if (currentExerciseData.type === 'speaking') {
      isCorrect = answer === currentExerciseData.correctAnswer || answer === currentExerciseData.targetWord
    } else {
      const isTarget = currentExerciseData.type === 'fill-blank' || (currentExerciseData.word && currentExerciseData.correctAnswer === currentExerciseData.word)
      const optLang = isTarget ? user.learningLanguage : (user?.preferredLanguage || 'en')
      const cleanAns = digitToLanguageWord(currentExerciseData.correctAnswer, optLang)
      const translatedAns = (!isTarget && optLang !== 'en') ? translateMeaning(cleanAns, optLang) : cleanAns
      isCorrect =
        String(answer).trim().toLowerCase() === String(currentExerciseData.correctAnswer).trim().toLowerCase() ||
        String(answer).trim().toLowerCase() === String(cleanAns).trim().toLowerCase() ||
        String(answer).trim().toLowerCase() === String(translatedAns).trim().toLowerCase()
    }

    // Record attempt in authoritative Learner Model
    const learnerStats = recordExerciseAttempt(user.learningLanguage, currentExerciseData, isCorrect, { timeSpentMs })
    if (user?.id && learnerStats) persistLearnerStats(user.id, learnerStats)

    if (!isCorrect) {
      if (!skipped) audioFX.playWrong()
      setPerfectLesson(false)
    } else {
      audioFX.playCorrect()
    }

    const xpEarned = isCorrect ? (currentExerciseData.xp || 10) : 0
    setAnswers((prev) => [...prev, { exercise: currentExercise, answer, isCorrect, skipped, xp: xpEarned }])
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
      setHintVisible(false)
      exerciseStartTimeRef.current = Date.now()
    } else {
      // handleAnswer has already recorded the current response in `answers`.
      // Passing it directly avoids counting the final exercise twice.
      completeLessonFlow(answers)
    }
  }

  const completeLessonFlow = async (latestAnswers = answers) => {
    try {
      audioFX.playVictory()
      triggerConfetti()
    } catch {}

    try {
      const finalStreak = updateStreak()
      if (finalStreak) setStreakResult(finalStreak)
    } catch (err) {
      console.error('Error updating streak:', err)
    }

    const correctCount = latestAnswers.filter((a) => a.isCorrect).length
    const accuracy = Math.round((correctCount / Math.max(1, lesson?.exercises?.length || 1)) * 100)
    const baseBonus = isLegendary ? 40 : 15
    const earnedXP = latestAnswers.reduce((sum, answer) => sum + (answer.xp || 0), 0) + baseBonus
    const isPerfect = latestAnswers.length > 0 && latestAnswers.every((answer) => answer.isCorrect)

    try {
      addXP(baseBonus)
      setTotalXPEarned((prev) => prev + baseBonus)
    } catch {}

    try {
      if (isLegendary) {
        if (completeLegendaryLesson) {
          await completeLegendaryLesson(lessonId)
        }
      } else {
        await completeLesson(lessonId, {
          xpEarned: earnedXP,
          accuracy,
          isPerfect,
          exercisesCompleted: latestAnswers.length,
          durationSeconds: Math.max(1, Math.round((Date.now() - lessonStartTimeRef.current) / 1000)),
        })
      }
    } catch (err) {
      console.error('Error saving lesson completion:', err)
    }

    try {
      if (perfectLesson) {
        unlockAchievement('perfect_lesson')
      }
    } catch {}

    // Refresh next adaptive recommendation based on completed performance
    try {
      const refreshedNext = await fetchNextAdaptiveLesson({
        languageId: user.learningLanguage,
        preferredLang: user.preferredLanguage || 'en',
        level: user.level || 'beginner',
        goal: user.goal || 'conversation',
      })
      if (refreshedNext) setNextLesson(refreshedNext)
    } catch {}

    setLessonComplete(true)
  }

  const handleContinueNextLesson = async () => {
    if (nextLesson?.id) {
      navigate(`/lesson/${nextLesson.id}`)
    } else {
      try {
        const following = await fetchNextAdaptiveLesson({
          languageId: user.learningLanguage,
          preferredLang: user.preferredLanguage || 'en',
          level: user.level || 'beginner',
          goal: user.goal || 'conversation',
        })
        if (following?.id) {
          navigate(`/lesson/${following.id}`)
          return
        }
      } catch {}
      navigate('/dashboard')
    }
  }

  const handleReplayTopic = () => {
    const topicId = lesson?.topicId || lesson?.id || 'greetings'
    const newSessionId = `adaptive_${user.learningLanguage}_${topicId}_${Date.now()}`
    navigate(`/lesson/${newSessionId}`)
  }

  const handlePracticeWeak = () => {
    navigate('/practice')
  }

  const handleShowHint = () => {
    if (showResult || !lesson) return
    setHintVisible(true)
  }

  const handleSkipSpeaking = () => handleAnswer('', { skipped: true })

  const getCorrectAnswerLabel = (exercise) => {
    if (!exercise) return ''
    if (exercise.type === 'matching') return t('match_words_meanings') || 'Match every word with its meaning'
    const prefCode = user?.preferredLanguage || 'en'
    const isTarget = exercise.type === 'fill-blank' || (exercise.word && exercise.correctAnswer === exercise.word)
    if (!isTarget && prefCode !== 'en') {
      const cleanAns = digitToLanguageWord(exercise.correctAnswer, prefCode)
      return translateMeaning(cleanAns, prefCode)
    }
    return exercise.correctAnswer || exercise.targetWord || ''
  }

  const getExerciseHeader = () => {
    const curEx = lesson?.exercises?.[currentExercise]
    const prefLang = user?.preferredLanguage || 'en'

    // Skill / Category detection
    const cat = (curEx?.category || curEx?.skill || curEx?.type || '').toLowerCase()
    let categoryKey = 'vocabulary'
    if (cat === 'grammar' || cat === 'sentence-order' || cat === 'fill-blank') {
      categoryKey = 'grammar'
    } else if (cat === 'listening') {
      categoryKey = 'listening_practice'
    } else if (cat === 'speaking') {
      categoryKey = 'speaking_practice'
    } else if (cat === 'reading') {
      categoryKey = 'reading_practice'
    } else {
      categoryKey = 'vocabulary'
    }

    const localizedCategory = t(categoryKey) || (categoryKey === 'vocabulary' ? 'Vocabulary' : 'Grammar & Syntax')

    // Localized topic if available
    let localizedTopic = ''
    if (lesson?.topicId || lesson?.topic) {
      localizedTopic = getLocalizedTopicName(lesson.topicId || lesson.topic, prefLang)
    }

    if (localizedTopic && localizedTopic.toLowerCase() !== localizedCategory.toLowerCase()) {
      return `${localizedTopic} • ${localizedCategory}`
    }
    return localizedCategory
  }

  const renderExercise = () => {
    if (!lesson || !lesson.exercises[currentExercise]) return null
    const exercise = lesson.exercises[currentExercise]

    switch (exercise.type) {
      case 'sentence-order':
        return (
          <SentenceOrderExercise
            prompt={exercise.prompt}
            words={exercise.words}
            sentence={exercise.sentence}
            correctAnswer={exercise.correctAnswer}
            languageId={user?.learningLanguage || 'hi'}
            onSubmit={handleAnswer}
            disabled={showResult}
            showResult={showResult}
          />
        )


      case 'reading':
        return (
          <ReadingExercise
            prompt={exercise.prompt}
            passage={exercise.passage}
            question={exercise.question}
            options={exercise.options}
            correctAnswer={exercise.correctAnswer}
            languageId={user?.learningLanguage || 'hi'}
            onSubmit={handleAnswer}
            disabled={showResult}
            showResult={showResult}
          />
        )

      case 'picture-choice':
      case 'picture_choice':
      case 'visual-match':
      case 'visual_match':
      case 'multiple-choice': {
        const langCode = user?.learningLanguage || 'hi'
        const prefCode = user?.preferredLanguage || 'en'
        const isTarget = exercise.type === 'fill-blank' || (exercise.word && exercise.correctAnswer === exercise.word)
        const optionLang = isTarget ? langCode : prefCode
        const cleanCorrect = digitToLanguageWord(exercise.correctAnswer, optionLang)
        const rawOptions = (exercise.options && exercise.options.length > 0)
          ? exercise.options.map((opt) => {
              const optStr = typeof opt === 'string' ? opt : opt?.word || opt?.text || opt?.label || ''
              return (optionLang !== 'en' && !isTarget) ? translateMeaning(optStr, optionLang) : optStr
            })
          : []
        const translatedCorrect = (!isTarget && optionLang !== 'en')
          ? translateMeaning(cleanCorrect, optionLang)
          : cleanCorrect
        const sanitizedOptions = sanitizeLanguageOptions(rawOptions, translatedCorrect, optionLang)

        const targetLangObj = getLanguageById(langCode)
        const targetLangName = targetLangObj?.nativeName || targetLangObj?.name || 'target language'

        let displayPrompt = exercise.prompt || ''
        const quotedMatch = displayPrompt.match(/["'](.*?)["']/)
        const extractedWord = quotedMatch ? quotedMatch[1] : (exercise.targetWord || exercise.word || exercise.translation || '')

        if (isTarget) {
          // Meaning -> Target Word question: prompt word MUST be in learner's preferred language (e.g. "बहीण", never English "Sister")
          const rawMeaning = exercise.translation || extractedWord
          const translatedSource = prefCode !== 'en' ? translateMeaning(rawMeaning, prefCode) : rawMeaning
          displayPrompt = getPromptText('translate_to_target', prefCode, targetLangName, translatedSource)
        } else {
          // Target Word -> Meaning question: prompt word is target script (e.g. "બહેન")
          const targetWord = exercise.targetWord || exercise.word || extractedWord
          displayPrompt = getPromptText('meaning', prefCode, targetLangName, targetWord)
        }

        return (
          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-semibold text-[#25231F] dark:text-white mb-6">
              {displayPrompt}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sanitizedOptions.map((option, index) => {
                const isMatch = option === translatedCorrect || option === cleanCorrect || option === exercise.correctAnswer
                return (
                  <motion.button
                    key={index}
                    type="button"
                    className={`
                      p-4 rounded-xl border-2 text-left transition-all
                      ${showResult && isMatch
                        ? 'border-[#2F9E69] bg-[#2F9E69]/10 text-[#2F9E69] font-bold'
                        : selectedAnswer === option
                          ? showResult
                            ? 'border-[#D84B42] bg-[#D84B42]/10 text-[#D84B42]'
                          : 'border-[#0B8F62] bg-[#0B8F62]/10 text-[#0B8F62]'
                        : 'border-[#E8E6E0] dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-[#0B8F62]/50 text-[#25231F] dark:text-slate-200'
                      }
                      ${showResult ? 'cursor-not-allowed' : 'cursor-pointer'}
                    `}
                    onClick={() => !showResult && handleAnswer(option)}
                    disabled={showResult}
                    whileHover={!showResult ? { scale: 1.02 } : {}}
                    whileTap={!showResult ? { scale: 0.98 } : {}}
                  >
                    <span className="font-medium">{option}</span>
                  </motion.button>
                )
              })}
            </div>
          </div>
        )
      }

      case 'translation':
        if (exercise.wordBank && exercise.wordBank.length > 0) {
          return (
            <WordBank
              prompt={exercise.prompt}
              wordBank={exercise.wordBank}
              correctAnswer={exercise.correctAnswer}
              onSubmit={handleAnswer}
              disabled={showResult}
              showResult={showResult}
              isCorrect={answers[answers.length - 1]?.isCorrect}
            />
          )
        }
        return (
          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-semibold text-[#25231F] dark:text-white mb-6">
              {exercise.prompt}
            </h3>
            <input
              type="text"
              value={selectedAnswer}
              onChange={(e) => setSelectedAnswer(e.target.value)}
              className="w-full px-4 py-3 border-2 border-[#E8E6E0] dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B8F62] focus:border-[#0B8F62] dark:bg-slate-900 dark:text-white"
              placeholder={t('type_answer_placeholder') || 'Type your answer...'}
              disabled={showResult}
            />
            {!showResult && (
              <div className="flex justify-end pt-2">
                <Button
                  onClick={() => handleAnswer(selectedAnswer)}
                  disabled={!selectedAnswer.trim() || showResult}
                >
                  {t('check_answer') || 'Check Answer'}
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
            disabled={showResult}
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
            onSkip={handleSkipSpeaking}
            disabled={showResult}
            showResult={showResult}
          />
        )

      case 'matching':
        return (
          <MatchingExercise
            prompt={exercise.prompt}
            pairs={exercise.pairs}
            onSubmit={handleAnswer}
            disabled={showResult}
            showResult={showResult}
          />
        )

      case 'fill-blank': {
        const instructionText = exercise.instruction || exercise.prompt || t('fill_blank') || 'Fill in the blank with the correct word'

        let sentenceWithBlank = exercise.blankedSentence || exercise.sentence || ''
        if (!sentenceWithBlank && exercise.sentenceContext && (exercise.word || exercise.correctAnswer)) {
          const w = exercise.word || exercise.correctAnswer
          sentenceWithBlank = exercise.sentenceContext.replace(w, '___')
        }
        if (!sentenceWithBlank && exercise.example && (exercise.word || exercise.correctAnswer)) {
          const w = exercise.word || exercise.correctAnswer
          sentenceWithBlank = exercise.example.replace(w, '___')
        }
        if (!sentenceWithBlank && exercise.prompt && exercise.prompt.includes('___')) {
          sentenceWithBlank = exercise.prompt.includes(':')
            ? exercise.prompt.split(':').slice(1).join(':').trim()
            : exercise.prompt
        }
        if (!sentenceWithBlank) {
          sentenceWithBlank = `... ___ ...`
        }

        const segments = sentenceWithBlank.split('___')

        return (
          <div className="space-y-6">
            <h3 className="text-xl md:text-2xl font-semibold text-[#25231F] dark:text-white">
              {instructionText}
            </h3>

            {/* Sentence Callout Card with Interactive Blank */}
            <div className="p-6 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-center my-4">
              <p className="text-2xl md:text-3xl font-bold tracking-wide text-slate-900 dark:text-white leading-relaxed">
                {segments.map((segment, idx) => (
                  <span key={idx}>
                    {segment}
                    {idx < segments.length - 1 && (
                      <span className={`inline-block min-w-[90px] px-3 py-1 mx-2 border-b-4 text-center font-black transition-all ${
                        showResult
                          ? selectedAnswer === exercise.correctAnswer
                            ? 'border-[#2F9E69] text-[#2F9E69] bg-[#2F9E69]/10 rounded-lg'
                            : 'border-[#D84B42] text-[#D84B42] bg-[#D84B42]/10 rounded-lg'
                          : selectedAnswer
                            ? 'border-[#0B8F62] text-[#0B8F62] bg-[#0B8F62]/10 rounded-lg'
                            : 'border-amber-400 text-amber-500 bg-amber-500/10 rounded-lg animate-pulse'
                      }`}>
                        {selectedAnswer || '______'}
                      </span>
                    )}
                  </span>
                ))}
              </p>
              {exercise.audioText && (
                <div className="mt-4 flex justify-center">
                  <AudioButton text={exercise.audioText} languageId={user?.learningLanguage || 'gu'} />
                </div>
              )}
            </div>

            {exercise.options && exercise.options.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {exercise.options.map((option, index) => (
                  <motion.button
                    key={index}
                    type="button"
                    className={`
                      p-4 rounded-xl border-2 text-left transition-all
                      ${showResult && option === exercise.correctAnswer
                        ? 'border-[#2F9E69] bg-[#2F9E69]/10 text-[#2F9E69] font-bold'
                        : selectedAnswer === option
                          ? showResult
                            ? 'border-[#D84B42] bg-[#D84B42]/10 text-[#D84B42]'
                          : 'border-[#0B8F62] bg-[#0B8F62]/10 text-[#0B8F62]'
                        : 'border-[#E8E6E0] dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-[#0B8F62]/50 text-[#25231F] dark:text-slate-200'
                      }
                      ${showResult ? 'cursor-not-allowed' : 'cursor-pointer'}
                    `}
                    onClick={() => !showResult && handleAnswer(option)}
                    disabled={showResult}
                    whileHover={!showResult ? { scale: 1.02 } : {}}
                    whileTap={!showResult ? { scale: 0.98 } : {}}
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
                  className="w-full px-4 py-3 border-2 border-[#E8E6E0] dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B8F62] dark:bg-slate-900 dark:text-white"
                  placeholder={t('type_answer_placeholder') || 'Type your answer...'}
                  disabled={showResult}
                />
                {!showResult && (
                  <div className="flex justify-end pt-2">
                    <Button
                      onClick={() => handleAnswer(selectedAnswer)}
                      disabled={!selectedAnswer.trim() || showResult}
                    >
                      {t('check_answer') || 'Check Answer'}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      }

      default: {
        return (
          <div className="text-center py-8 space-y-3">
            <p className="text-[#D84B42] font-semibold">{t('unknown_exercise_type') || 'Unknown exercise type'}: {exercise.type || 'undefined'}</p>
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
    const wasSkipped = lastAnswer?.skipped || false
    const exercise = lesson.exercises[currentExercise]

    return (
      <div className="text-center py-4 border-t border-[#E8E6E0] dark:border-slate-800 mt-6">
        <div className="flex items-center justify-center gap-2 mb-1">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`text-2xl font-bold ${wasSkipped ? 'text-[#77736B]' : isCorrect ? 'text-[#2F9E69]' : 'text-[#D84B42]'}`}
          >
            {wasSkipped ? (t('speaking_skipped') || 'Speaking skipped') : isCorrect ? (t('excellent') || '✓ Excellent!') : (t('not_quite') || '✗ Not quite right')}
          </motion.div>
        </div>

        {wasSkipped && (
          <p className="text-sm font-medium text-[#77736B] dark:text-slate-400 mt-1">
            {t('no_xp_skipped_speaking') || 'No XP earned for this skipped speaking exercise.'}
          </p>
        )}

        {!isCorrect && !wasSkipped && (
          <p className="text-sm font-medium text-[#77736B] dark:text-slate-400 mt-1">
            {t('correct_answer_is') || 'Correct answer:'} <span className="font-bold text-[#25231F] dark:text-white">{getCorrectAnswerLabel(exercise)}</span>
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
      <div className="min-h-screen bg-[#F7F5EF] dark:bg-slate-950 flex items-center justify-center">
        <p className="text-[#77736B] dark:text-slate-400 font-medium">Generating your personalized lesson...</p>
      </div>
    )
  }


  if (lessonComplete) {
    const correctCount = answers.filter((a) => a.isCorrect).length
    const accuracy = Math.round((correctCount / Math.max(1, lesson?.exercises?.length || 1)) * 100)

    return (
      <div className="min-h-screen bg-[#F7F5EF] dark:bg-slate-950 flex items-center justify-center p-4 py-8 overflow-y-auto">
        <div className="w-full max-w-md my-auto">
          <QuestionCard className="dark:bg-slate-900 dark:border-slate-800">
            <CelebrationModal
              totalXP={totalXPEarned}
              streak={streakResult?.newStreak || 1}
              streakIncreased={streakResult?.increased ?? false}
              isPerfect={perfectLesson}
              accuracy={accuracy}
              nextLesson={nextLesson}
              onContinueNext={handleContinueNextLesson}
              onReplayTopic={handleReplayTopic}
              onPracticeWeak={handlePracticeWeak}
              onGoDashboard={() => navigate('/dashboard')}
            />
          </QuestionCard>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${isLegendary ? 'bg-amber-950/20 dark:bg-amber-950/40' : 'bg-[#F7F5EF] dark:bg-slate-950'} flex flex-col justify-between p-4 md:p-8`}>
      {/* Top Navigation */}
      <div className="w-full max-w-2xl mx-auto space-y-2">
        {isLegendary && (
          <div className="mb-3 px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-bold text-xs flex items-center justify-between shadow-lg shadow-amber-500/20 animate-pulse">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 fill-current" />
              <span>{t('legendary_challenge_mode') || 'LEGENDARY CHALLENGE MODE'}</span>
            </div>
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-[11px]">+40 XP & +20 💎</span>
          </div>
        )}

        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            {t('exit') || '✕ Exit'}
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#77736B] dark:text-slate-400">
              {getExerciseHeader()}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-900 rounded-xl border border-[#E8E6E0] dark:border-slate-800 text-xs font-black text-cyan-600 dark:text-cyan-400 shadow-xs">
            <span>💎</span>
            <span>{user?.gems !== undefined ? Number(user.gems) : gems}</span>
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
        <div className="flex items-center gap-3">
          <div className="text-xs text-[#77736B] dark:text-slate-400 font-bold">
            {t('exercise_counter') || 'Exercise'} {currentExercise + 1} {t('of_word') || 'of'} {lesson.exercises.length}
          </div>
          {!showResult && (
            <button
              type="button"
              onClick={handleShowHint}
              className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
            >
              <Lightbulb className="w-3.5 h-3.5" /> {hintVisible ? (t('answer_shown') || 'Answer shown') : (t('need_hint') || 'Need a hint?')}
            </button>
          )}
        </div>
        {showResult && (
          <Button onClick={handleNext} size="large">
            {currentExercise === lesson.exercises.length - 1 ? (t('complete_lesson') || 'Complete Lesson') : (t('continue') || 'Continue')}
          </Button>
        )}
      </div>
      {hintVisible && !showResult && (
        <div className="w-full max-w-2xl mx-auto mt-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100">
          <span className="font-bold">{t('answer_label') || 'Answer:'} </span>{getCorrectAnswerLabel(lesson.exercises[currentExercise])}
          <span className="ml-2 text-xs opacity-75">{t('try_it_now') || 'Try it now to earn the exercise XP.'}</span>
        </div>
      )}
    </div>
  )
}
