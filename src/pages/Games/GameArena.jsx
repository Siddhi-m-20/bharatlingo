/**
 * Game Arena — BharatLingo
 *
 * Unified Game Runner supporting all 10 educational game modes.
 * Features round transitions, countdown timers, sound/audio integration,
 * instant educational feedback, and heart-free persistence of XP & Gems.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Volume2,
  Mic,
  MicOff,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  X,
  Zap,
  Flame,
  Award,
  Clock,
  Sparkles,
  HelpCircle,
} from 'lucide-react'
import { useAuth } from '../../services/auth'
import { useProgress } from '../../services/progress'
import { useTheme } from '../../services/themeContext'
import { getLanguageById } from '../../data/languages'
import { generateGameSession, calculateGameRewards, GAME_MODES } from '../../services/gameEngine'
import { speakText } from '../../services/aiService'
import { SpeechRecognitionService } from '../../services/audio/SpeechRecognitionService'
import { PronunciationScorer } from '../../services/audio/PronunciationScorer'
import { recordLearningActivity, persistLearnerStats } from '../../services/dbService'
import { recordExerciseAttempt } from '../../services/learnerModel'
import ProgressBar from '../../components/ProgressBar/ProgressBar'

export default function GameArena() {
  const { gameId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addXP, addGems } = useProgress()
  const { t } = useTheme()

  const [session, setSession] = useState(null)
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState(null) // { isCorrect: boolean, message: string }
  const [isCompleted, setIsCompleted] = useState(false)
  const [rewards, setRewards] = useState(null)
  const [sessionStartTime] = useState(Date.now())

  // Game-specific interactive states
  const [matchedPairs, setMatchedPairs] = useState(new Set())
  const [selectedLeft, setSelectedLeft] = useState(null)
  const [selectedRight, setSelectedRight] = useState(null)
  const [constructedSentence, setConstructedSentence] = useState([])
  const [flippedCards, setFlippedCards] = useState([])
  const [matchedCardIds, setMatchedCardIds] = useState(new Set())
  const [isRecording, setIsRecording] = useState(false)
  const [recordedText, setRecordedText] = useState('')
  const [pronunciationScore, setPronunciationScore] = useState(null)

  // Timer states (for timed modes)
  const [timeLeft, setTimeLeft] = useState(null)
  const timerRef = useRef(null)

  const learningLang = getLanguageById(user?.learningLanguage) || { name: 'Hindi', nativeName: 'हिन्दी', id: 'hi' }
  const preferredLang = getLanguageById(user?.preferredLanguage || 'en') || { name: 'English', id: 'en' }

  // 1. Initialize Game Session
  useEffect(() => {
    if (!user?.learningLanguage) {
      navigate('/onboarding')
      return
    }
    const sess = generateGameSession(gameId, user.learningLanguage, user?.preferredLanguage || 'en')
    setSession(sess)
    setCurrentRoundIdx(0)
    setScore(0)
    setIsCompleted(false)
    setFeedback(null)
    resetRoundStates()
  }, [gameId, user?.learningLanguage, user?.preferredLanguage, navigate])

  const resetRoundStates = () => {
    setMatchedPairs(new Set())
    setSelectedLeft(null)
    setSelectedRight(null)
    setConstructedSentence([])
    setFlippedCards([])
    setMatchedCardIds(new Set())
    setIsRecording(false)
    setRecordedText('')
    setPronunciationScore(null)
  }

  // 2. Timed Modes countdown logic
  useEffect(() => {
    if (!session || isCompleted) return
    const currentRound = session.rounds[currentRoundIdx]
    if (!currentRound) return

    if (currentRound.timeLimitSeconds && !feedback) {
      setTimeLeft(currentRound.timeLimitSeconds)
      if (timerRef.current) clearInterval(timerRef.current)

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current)
            handleAnswer(false, 'Time ran out!')
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [session, currentRoundIdx, isCompleted, feedback])

  // 3. Audio Playback
  const handlePlayAudio = useCallback((text) => {
    if (!text) return
    speakText(text, user?.learningLanguage || 'hi')
  }, [user?.learningLanguage])

  // 4. Handle Answer Submission
  const handleAnswer = useCallback((isCorrect, customMessage = null) => {
    if (feedback) return
    if (timerRef.current) clearInterval(timerRef.current)

    if (isCorrect) setScore((prev) => prev + 1)

    setFeedback({
      isCorrect,
      message: customMessage || (isCorrect ? '✓ Excellent work!' : '✗ Keep practicing!'),
    })

    // Record attempt for learner profile
    try {
      const qMeta = {
        type: session?.gameId || 'game',
        prompt: `Game: ${session?.modeMeta?.title}`,
        languageId: user?.learningLanguage || 'hi',
      }
      const updatedStats = recordExerciseAttempt(user?.learningLanguage || 'hi', qMeta, isCorrect)
      if (user?.id && updatedStats) persistLearnerStats(user.id, updatedStats)
    } catch {}
  }, [feedback, session, user?.learningLanguage, user?.id])

  // 5. Proceed to Next Round or Finish
  const handleNextRound = async () => {
    if (!session) return

    if (currentRoundIdx < session.totalRounds - 1) {
      setCurrentRoundIdx((prev) => prev + 1)
      setFeedback(null)
      resetRoundStates()
    } else {
      // Game Complete!
      const totalRounds = session.totalRounds
      const finalScore = score
      const earned = calculateGameRewards(session.gameId, finalScore, totalRounds)
      setRewards(earned)
      setIsCompleted(true)

      // Award XP & Gems durably
      addXP(earned.xpEarned)
      addGems(earned.gemsEarned)

      // Commit activity log to Supabase/localStorage
      if (user?.id) {
        try {
          await recordLearningActivity({
            userId: user.id,
            activityDate: new Date().toISOString().split('T')[0],
            exercisesCompleted: totalRounds,
            xpEarned: earned.xpEarned,
            sessionDurationSeconds: Math.max(1, Math.round((Date.now() - sessionStartTime) / 1000)),
            languageId: user.learningLanguage,
            sessionType: 'game',
          })
        } catch {}
      }
    }
  }

  // 6. Speech Recognition for Pronunciation Challenge
  const handleStartSpeaking = async (referenceWord) => {
    if (isRecording) {
      SpeechRecognitionService.stopListening()
      setIsRecording(false)
      return
    }

    setRecordedText('')
    setIsRecording(true)

    SpeechRecognitionService.startListening({
      languageId: user?.learningLanguage || 'hi',
      onResult: (transcript, isFinal) => {
        setRecordedText(transcript)
        if (isFinal) {
          setIsRecording(false)
          const evalResult = PronunciationScorer.scorePronunciation(transcript, referenceWord, user?.learningLanguage || 'hi')
          setPronunciationScore(evalResult.score)
          if (evalResult.score >= 65) {
            handleAnswer(true, `Great pronunciation! Score: ${evalResult.score}%`)
          } else {
            handleAnswer(false, `Keep practicing! Pronunciation score: ${evalResult.score}%`)
          }
        }
      },
      onError: (err) => {
        setIsRecording(false)
        setRecordedText('Could not capture audio. Please try again.')
      },
    })
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#F7F5EF] dark:bg-slate-950 flex items-center justify-center p-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-10 h-10 border-4 border-[#0B8F62] border-t-transparent rounded-full"
        />
      </div>
    )
  }

  const currentRound = session.rounds[currentRoundIdx]
  const progressPercent = ((currentRoundIdx + 1) / session.totalRounds) * 100

  return (
    <div className="min-h-screen bg-[#F7F5EF] dark:bg-slate-950 flex flex-col justify-between p-4 md:p-6">
      
      {/* ── Arena Top Header ──────────────────────────────────────────── */}
      <div className="max-w-2xl w-full mx-auto space-y-3">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/games')}
            className="p-2 -ml-2 rounded-xl text-slate-500 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Exit Game"
          >
            <X size={22} />
          </button>

          <div className="flex items-center gap-3">
            <span className="text-xs font-black text-[#0B8F62] dark:text-[#34D399] uppercase tracking-wider flex items-center gap-1.5">
              <span>{session.modeMeta.icon}</span>
              <span>{session.modeMeta.title}</span>
            </span>
            {timeLeft !== null && (
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center gap-1">
                <Clock size={12} />
                <span>{timeLeft}s</span>
              </span>
            )}
          </div>

          <div className="text-xs font-black text-[#77736B] dark:text-slate-400">
            {currentRoundIdx + 1} / {session.totalRounds}
          </div>
        </div>

        <ProgressBar progress={progressPercent} />
      </div>

      {/* ── Arena Central Game Board ──────────────────────────────────── */}
      <main className="max-w-2xl w-full mx-auto my-auto py-6">
        <AnimatePresence mode="wait">
          {!isCompleted && currentRound && (
            <motion.div
              key={`${session.gameId}-${currentRoundIdx}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >

              {/* ══════════════════════════════════════════════════════════════ */}
              {/* MODE 1: WORD MATCH (Pair Matching)                            */}
              {/* ══════════════════════════════════════════════════════════════ */}
              {session.gameId === 'word_match' && (
                <div className="space-y-4">
                  <div className="text-center space-y-1">
                    <h2 className="text-xl font-black text-[#25231F] dark:text-white">
                      Match the Word Pairs
                    </h2>
                    <p className="text-xs text-[#77736B] dark:text-slate-400">
                      Tap a word on the left, then tap its corresponding meaning on the right.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    {/* Left Target Words (Independently shuffled) */}
                    <div className="space-y-2">
                      {(currentRound.leftItems || currentRound.pairs.map((p) => ({ id: p.id, text: p.left, pronunciation: p.pronunciation }))).map((item) => {
                        const isMatched = matchedPairs.has(item.id)
                        const isSelected = selectedLeft === item.id
                        return (
                          <button
                            key={`left-${item.id}`}
                            type="button"
                            disabled={isMatched || Boolean(feedback)}
                            onClick={() => {
                              setSelectedLeft(item.id)
                              if (selectedRight) {
                                if (selectedRight === item.id) {
                                  const nextMatched = new Set([...matchedPairs, item.id])
                                  setMatchedPairs(nextMatched)
                                  setSelectedLeft(null)
                                  setSelectedRight(null)
                                  if (nextMatched.size === currentRound.pairs.length) {
                                    handleAnswer(true, 'All pairs matched flawlessly!')
                                  }
                                } else {
                                  setSelectedLeft(null)
                                  setSelectedRight(null)
                                }
                              }
                            }}
                            className={`w-full p-3.5 rounded-2xl border-2 text-left font-black text-sm transition-all cursor-pointer ${
                              isMatched
                                ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 opacity-60'
                                : isSelected
                                ? 'border-[#0B8F62] bg-[#0B8F62]/10 text-[#0B8F62] dark:text-[#34D399]'
                                : 'border-[#E8E6E0] dark:border-slate-800 bg-white dark:bg-slate-900 text-[#25231F] dark:text-white hover:border-[#0B8F62]/40'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{item.text}</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handlePlayAudio(item.text)
                                }}
                                className="text-slate-400 hover:text-[#0B8F62]"
                              >
                                <Volume2 size={15} />
                              </button>
                            </div>
                          </button>
                        )
                      })}
                    </div>

                    {/* Right Translated Meanings (Independently shuffled) */}
                    <div className="space-y-2">
                      {(currentRound.rightItems || currentRound.pairs.map((p) => ({ id: p.id, text: p.right }))).map((item) => {
                        const isMatched = matchedPairs.has(item.id)
                        const isSelected = selectedRight === item.id
                        return (
                          <button
                            key={`right-${item.id}`}
                            type="button"
                            disabled={isMatched || Boolean(feedback)}
                            onClick={() => {
                              setSelectedRight(item.id)
                              if (selectedLeft) {
                                if (selectedLeft === item.id) {
                                  const nextMatched = new Set([...matchedPairs, item.id])
                                  setMatchedPairs(nextMatched)
                                  setSelectedLeft(null)
                                  setSelectedRight(null)
                                  if (nextMatched.size === currentRound.pairs.length) {
                                    handleAnswer(true, 'All pairs matched flawlessly!')
                                  }
                                } else {
                                  setSelectedLeft(null)
                                  setSelectedRight(null)
                                }
                              }
                            }}
                            className={`w-full p-3.5 rounded-2xl border-2 text-left font-bold text-sm transition-all cursor-pointer ${
                              isMatched
                                ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 opacity-60'
                                : isSelected
                                ? 'border-[#0B8F62] bg-[#0B8F62]/10 text-[#0B8F62] dark:text-[#34D399]'
                                : 'border-[#E8E6E0] dark:border-slate-800 bg-white dark:bg-slate-900 text-[#25231F] dark:text-white hover:border-[#0B8F62]/40'
                            }`}
                          >
                            {item.text}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════════════════════════════════ */}
              {/* MODE 2: SENTENCE BUILDER                                      */}
              {/* ══════════════════════════════════════════════════════════════ */}
              {session.gameId === 'sentence_builder' && (
                <div className="space-y-5">
                  <div className="text-center space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#0B8F62] dark:text-[#34D399] bg-[#0B8F62]/10 px-2 py-0.5 rounded-full">
                      Sentence Assembly
                    </span>
                    <h2 className="text-xl font-black text-[#25231F] dark:text-white pt-1">
                      {currentRound.prompt}
                    </h2>
                  </div>

                  {/* Sentence Assembly Strip */}
                  <div className="min-h-16 p-4 rounded-2xl border-2 border-dashed border-[#0B8F62]/40 bg-white dark:bg-slate-900 flex flex-wrap items-center gap-2">
                    {constructedSentence.length === 0 ? (
                      <span className="text-xs text-slate-400 italic">Tap words below in order...</span>
                    ) : (
                      constructedSentence.map((tokenObj, tIdx) => (
                        <button
                          key={tokenObj.id || tIdx}
                          type="button"
                          disabled={Boolean(feedback)}
                          onClick={() => {
                            setConstructedSentence((prev) => prev.filter((_, idx) => idx !== tIdx))
                          }}
                          className="px-3.5 py-2 bg-[#0B8F62] text-white font-black text-sm rounded-xl shadow-sm hover:bg-rose-600 transition-colors cursor-pointer"
                        >
                          {tokenObj.word || tokenObj}
                        </button>
                      ))
                    )}
                  </div>

                  {/* Shuffled Word Bank */}
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    {currentRound.scrambledTokens.map((rawToken, idx) => {
                      const tokenObj = typeof rawToken === 'string' ? { id: `legacy-${idx}-${rawToken}`, word: rawToken } : rawToken
                      const isUsed = constructedSentence.some((item) => (item.id || item) === tokenObj.id)
                      return (
                        <button
                          key={tokenObj.id || idx}
                          type="button"
                          disabled={isUsed || Boolean(feedback)}
                          onClick={() => setConstructedSentence((prev) => [...prev, tokenObj])}
                          className={`px-4 py-2.5 rounded-xl border-2 font-bold text-sm transition-all cursor-pointer ${
                            isUsed
                              ? 'opacity-30 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800'
                              : 'border-[#E8E6E0] dark:border-slate-800 bg-white dark:bg-slate-900 text-[#25231F] dark:text-white hover:border-[#0B8F62]'
                          }`}
                        >
                          {tokenObj.word}
                        </button>
                      )
                    })}
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-center pt-2">
                    <button
                      type="button"
                      disabled={constructedSentence.length === 0 || Boolean(feedback)}
                      onClick={() => {
                        const built = constructedSentence.map((t) => t.word || t).join(' ')
                        const expected = currentRound.correctTokens.join(' ')
                        const isCorrect = built.trim() === expected.trim()
                        handleAnswer(isCorrect, isCorrect ? 'Perfect sentence structure!' : `Correct: ${expected}`)
                      }}
                      className="py-3 px-8 bg-[#0B8F62] hover:bg-[#097b54] disabled:opacity-40 text-white rounded-xl font-black text-sm transition-all cursor-pointer"
                    >
                      Check Sentence
                    </button>
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════════════════════════════════ */}
              {/* MODE 3: LISTENING CHALLENGE                                   */}
              {/* ══════════════════════════════════════════════════════════════ */}
              {session.gameId === 'listening_challenge' && (
                <div className="space-y-6 text-center">
                  <div className="space-y-1">
                    <h2 className="text-xl font-black text-[#25231F] dark:text-white">
                      Listen and Choose
                    </h2>
                    <p className="text-xs text-[#77736B] dark:text-slate-400">
                      Tap the audio button to hear the spoken phrase.
                    </p>
                  </div>

                  <div className="flex justify-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => handlePlayAudio(currentRound.audioText)}
                      className="w-20 h-20 rounded-full bg-gradient-to-br from-[#0B8F62] to-[#10B981] text-white flex items-center justify-center shadow-lg shadow-[#0B8F62]/20 hover:shadow-xl transition-all cursor-pointer"
                    >
                      <Volume2 size={36} />
                    </motion.button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                    {currentRound.options.map((opt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        disabled={Boolean(feedback)}
                        onClick={() => {
                          const isCorrect = opt === currentRound.correctAnswer
                          handleAnswer(isCorrect, isCorrect ? `Correct! "${currentRound.meaning}"` : `Correct was: ${currentRound.correctAnswer}`)
                        }}
                        className="p-4 rounded-2xl border-2 border-[#E8E6E0] dark:border-slate-800 bg-white dark:bg-slate-900 text-[#25231F] dark:text-white font-black text-base hover:border-[#0B8F62] transition-all cursor-pointer text-center"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════════════════════════════════ */}
              {/* MODE 4: QUICK TRANSLATION                                     */}
              {/* ══════════════════════════════════════════════════════════════ */}
              {session.gameId === 'quick_translation' && (
                <div className="space-y-6 text-center">
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                      {currentRound.direction === 'target_to_native' ? 'Translate to Your Language' : 'Translate to Target Script'}
                    </span>
                    <h2 className="text-3xl font-black text-[#25231F] dark:text-white">
                      {currentRound.prompt}
                    </h2>
                    {currentRound.pronunciation && (
                      <p className="text-xs text-[#0B8F62] font-semibold">
                        ({currentRound.pronunciation})
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {currentRound.options.map((opt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        disabled={Boolean(feedback)}
                        onClick={() => {
                          const isCorrect = opt === currentRound.correctAnswer
                          handleAnswer(isCorrect, isCorrect ? 'Fast & Accurate!' : `Correct translation: ${currentRound.correctAnswer}`)
                        }}
                        className="p-4 rounded-2xl border-2 border-[#E8E6E0] dark:border-slate-800 bg-white dark:bg-slate-900 text-[#25231F] dark:text-white font-black text-base hover:border-[#0B8F62] transition-all cursor-pointer"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════════════════════════════════ */}
              {/* MODE 5: PICTURE MATCH                                         */}
              {/* ══════════════════════════════════════════════════════════════ */}
              {session.gameId === 'picture_match' && (
                <div className="space-y-6 text-center">
                  <div className="space-y-1">
                    <h2 className="text-xl font-black text-[#25231F] dark:text-white">
                      {t('match_visual') || 'Match the Image'}
                    </h2>
                    <p className="text-xs text-[#77736B] dark:text-slate-400">
                      {t('select_word_for_concept') || 'Select the target language word for this concept.'}
                    </p>
                  </div>

                  {/* Visual Presentation Card */}
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-36 h-36 mx-auto rounded-3xl bg-white dark:bg-slate-900 border-2 border-[#E8E6E0] dark:border-slate-800 flex items-center justify-center p-3 shadow-md hover:shadow-lg transition-all overflow-hidden relative group">
                      <img
                        src={currentRound.image || '/images/vocab/default.svg'}
                        alt={currentRound.meaning || 'Vocabulary Illustration'}
                        className="w-full h-full object-contain filter drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.onerror = null
                          e.currentTarget.src = '/images/vocab/default.svg'
                        }}
                      />
                    </div>

                    {/* Prominent Concept Clue Badge so learner always clearly understands what the image is asking */}
                    {currentRound.meaning && (
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700/60 shadow-xs">
                        <span className="text-[11px] font-bold text-[#77736B] dark:text-slate-400 uppercase tracking-wide">
                          {t('concept_meaning') || 'Meaning'}:
                        </span>
                        <span className="text-base font-black text-emerald-800 dark:text-emerald-300">
                          {currentRound.meaning}
                        </span>
                        {currentRound.pronunciation && (
                          <span className="text-xs text-[#77736B] dark:text-slate-400 font-medium">
                            ({currentRound.pronunciation})
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {currentRound.options.map((opt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        disabled={Boolean(feedback)}
                        onClick={() => {
                          const isCorrect = opt === currentRound.correctAnswer
                          handleAnswer(isCorrect, isCorrect ? `✓ ${currentRound.meaning}` : `Correct: ${currentRound.correctAnswer} (${currentRound.meaning})`)
                        }}
                        className="p-4 rounded-2xl border-2 border-[#E8E6E0] dark:border-slate-800 bg-white dark:bg-slate-900 text-[#25231F] dark:text-white font-black text-base hover:border-[#0B8F62] transition-all cursor-pointer"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════════════════════════════════ */}
              {/* MODE 6: ODD ONE OUT                                           */}
              {/* ══════════════════════════════════════════════════════════════ */}
              {session.gameId === 'odd_one_out' && (
                <div className="space-y-6 text-center">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full">
                      Spot The Intruder
                    </span>
                    <h2 className="text-xl font-black text-[#25231F] dark:text-white pt-1">
                      Which word does NOT belong?
                    </h2>
                    <p className="text-xs text-[#77736B] dark:text-slate-400">
                      Three words share a category, one is an outsider.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {currentRound.options.map((opt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        disabled={Boolean(feedback)}
                        onClick={() => {
                          const isCorrect = opt.isIntruder
                          handleAnswer(isCorrect, isCorrect ? `Great eye! "${opt.word}" (${opt.meaning}) is the intruder.` : `Intruder was: ${currentRound.correctAnswer}`)
                        }}
                        className="p-4 rounded-2xl border-2 border-[#E8E6E0] dark:border-slate-800 bg-white dark:bg-slate-900 text-left hover:border-[#0B8F62] transition-all cursor-pointer flex items-center justify-between"
                      >
                        <div>
                          <p className="font-black text-base text-[#25231F] dark:text-white">{opt.word}</p>
                          <p className="text-xs text-[#77736B] dark:text-slate-400 mt-0.5">{opt.meaning}</p>
                        </div>
                        <HelpCircle size={16} className="text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════════════════════════════════ */}
              {/* MODE 7: MEMORY CARDS                                          */}
              {/* ══════════════════════════════════════════════════════════════ */}
              {session.gameId === 'memory_cards' && (
                <div className="space-y-5 text-center">
                  <div className="space-y-1">
                    <h2 className="text-xl font-black text-[#25231F] dark:text-white">
                      Memory Match
                    </h2>
                    <p className="text-xs text-[#77736B] dark:text-slate-400">
                      Flip cards to find pairs of target words and meanings.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {currentRound.cards.map((card) => {
                      const isFlipped = flippedCards.includes(card.id)
                      const isMatched = matchedCardIds.has(card.id)
                      return (
                        <button
                          key={card.id}
                          type="button"
                          disabled={isMatched || isFlipped || flippedCards.length >= 2}
                          onClick={() => {
                            if (flippedCards.length === 0) {
                              setFlippedCards([card.id])
                            } else if (flippedCards.length === 1) {
                              const firstCardId = flippedCards[0]
                              if (card.id === firstCardId) return
                              const firstCard = currentRound.cards.find((c) => c.id === firstCardId)
                              setFlippedCards([firstCardId, card.id])

                              if (firstCard.pairId === card.pairId) {
                                // Match found!
                                setTimeout(() => {
                                  const nextSet = new Set([...matchedCardIds, firstCardId, card.id])
                                  setMatchedCardIds(nextSet)
                                  setFlippedCards([])
                                  if (nextSet.size === currentRound.cards.length) {
                                    handleAnswer(true, 'All memory cards revealed!')
                                  }
                                }, 600)
                              } else {
                                // Mismatch
                                setTimeout(() => {
                                  setFlippedCards([])
                                }, 1000)
                              }
                            }
                          }}
                          className={`h-24 rounded-2xl border-2 flex items-center justify-center text-center p-2 font-black transition-all cursor-pointer ${
                            isMatched
                              ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 opacity-60'
                              : isFlipped
                              ? 'border-[#0B8F62] bg-[#0B8F62]/10 text-[#0B8F62] dark:text-[#34D399] text-sm'
                              : 'border-[#E8E6E0] dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 text-2xl hover:border-[#0B8F62]/50'
                          }`}
                        >
                          {isFlipped || isMatched ? card.content : '🎴'}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════════════════════════════════ */}
              {/* MODE 8: SCRIPT CHALLENGE                                      */}
              {/* ══════════════════════════════════════════════════════════════ */}
              {session.gameId === 'script_challenge' && (
                <div className="space-y-6 text-center">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-0.5 rounded-full">
                      Authentic Script Reading
                    </span>
                    <h2 className="text-xl font-black text-[#25231F] dark:text-white pt-1">
                      Identify the Character
                    </h2>
                  </div>

                  <div className="w-24 h-24 mx-auto rounded-3xl bg-white dark:bg-slate-900 border-2 border-[#E8E6E0] dark:border-slate-800 flex flex-col items-center justify-center shadow-sm">
                    <span className="text-4xl font-black text-[#0B8F62] dark:text-[#34D399]">{currentRound.char}</span>
                    <span className="text-[10px] text-slate-400 font-bold mt-1">{currentRound.sound}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {currentRound.options.map((opt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        disabled={Boolean(feedback)}
                        onClick={() => {
                          const isCorrect = opt === currentRound.correctAnswer
                          handleAnswer(isCorrect, isCorrect ? `Correct reading: "${currentRound.sound}"` : `Character is: ${currentRound.correctAnswer}`)
                        }}
                        className="p-4 rounded-2xl border-2 border-[#E8E6E0] dark:border-slate-800 bg-white dark:bg-slate-900 text-[#25231F] dark:text-white font-black text-xl hover:border-[#0B8F62] transition-all cursor-pointer"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════════════════════════════════ */}
              {/* MODE 9: PRONUNCIATION CHALLENGE                               */}
              {/* ══════════════════════════════════════════════════════════════ */}
              {session.gameId === 'pronunciation_challenge' && (
                <div className="space-y-6 text-center">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-2.5 py-0.5 rounded-full">
                      Voice Practice
                    </span>
                    <h2 className="text-xl font-black text-[#25231F] dark:text-white pt-1">
                      Speak the Phrase Clearly
                    </h2>
                  </div>

                  <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-[#E8E6E0] dark:border-slate-800 space-y-2">
                    <h3 className="text-3xl font-black text-[#0B8F62] dark:text-[#34D399]">
                      {currentRound.targetWord}
                    </h3>
                    <p className="text-xs text-slate-500 font-bold">
                      Pronunciation: <span className="text-[#25231F] dark:text-white">{currentRound.pronunciation}</span>
                    </p>
                    <p className="text-xs text-slate-400">
                      Meaning: {currentRound.meaning}
                    </p>

                    <div className="flex justify-center pt-2">
                      <button
                        type="button"
                        onClick={() => handlePlayAudio(currentRound.targetWord)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 hover:bg-slate-200 transition-colors cursor-pointer"
                      >
                        <Volume2 size={14} />
                        <span>Listen Sample</span>
                      </button>
                    </div>
                  </div>

                  {/* Microphone Trigger */}
                  <div className="space-y-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      disabled={Boolean(feedback)}
                      onClick={() => handleStartSpeaking(currentRound.targetWord)}
                      className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-white shadow-lg transition-all cursor-pointer ${
                        isRecording
                          ? 'bg-rose-500 animate-pulse shadow-rose-500/30'
                          : 'bg-[#0B8F62] hover:bg-[#097b54] shadow-[#0B8F62]/20'
                      }`}
                    >
                      {isRecording ? <MicOff size={32} /> : <Mic size={32} />}
                    </motion.button>
                    <p className="text-xs text-slate-500 font-medium">
                      {isRecording ? 'Listening... Speak now!' : 'Tap mic to speak'}
                    </p>
                    {recordedText && (
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Heard: "{recordedText}"
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════════════════════════════════ */}
              {/* MODE 10: SPEED ROUND                                          */}
              {/* ══════════════════════════════════════════════════════════════ */}
              {session.gameId === 'speed_round' && (
                <div className="space-y-6 text-center">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-full">
                      Rapid Sprint · Round {currentRoundIdx + 1}
                    </span>
                    <h2 className="text-3xl font-black text-[#25231F] dark:text-white pt-2">
                      {currentRound.prompt}
                    </h2>
                    {currentRound.pronunciation && (
                      <p className="text-xs text-[#0B8F62] font-semibold">({currentRound.pronunciation})</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {currentRound.options.map((opt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        disabled={Boolean(feedback)}
                        onClick={() => {
                          const isCorrect = opt === currentRound.correctAnswer
                          handleAnswer(isCorrect, isCorrect ? 'Fast!' : `Answer: ${currentRound.correctAnswer}`)
                        }}
                        className="p-4 rounded-2xl border-2 border-[#E8E6E0] dark:border-slate-800 bg-white dark:bg-slate-900 text-[#25231F] dark:text-white font-black text-base hover:border-[#0B8F62] transition-all cursor-pointer"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Completion Screen ────────────────────────────────────────── */}
        {isCompleted && rewards && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6 max-w-md mx-auto p-6 bg-white dark:bg-slate-900 rounded-3xl border border-[#E8E6E0] dark:border-slate-800 shadow-xl"
          >
            <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-50 dark:bg-emerald-950/50 text-[#0B8F62] dark:text-[#34D399] flex items-center justify-center text-4xl shadow-sm">
              🏆
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-black text-[#25231F] dark:text-white">
                {t('game_completed') || 'Game Completed!'}
              </h2>
              <p className="text-xs text-[#77736B] dark:text-slate-400">
                You reinforced your {learningLang.name} knowledge with authentic practice.
              </p>
            </div>

            {/* Score & Rewards Cards */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3 bg-[#F7F5EF] dark:bg-slate-800/60 rounded-2xl border border-[#E8E6E0] dark:border-slate-700 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Score</p>
                <p className="text-lg font-black text-[#25231F] dark:text-white mt-0.5">
                  {score} / {session.totalRounds}
                </p>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-900/60 text-center">
                <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase">XP Earned</p>
                <p className="text-lg font-black text-amber-700 dark:text-amber-400 mt-0.5">
                  +{rewards.xpEarned}
                </p>
              </div>
              <div className="p-3 bg-sky-50 dark:bg-sky-950/40 rounded-2xl border border-sky-200 dark:border-sky-900/60 text-center">
                <p className="text-[10px] font-bold text-sky-700 dark:text-sky-400 uppercase">Gems</p>
                <p className="text-lg font-black text-sky-700 dark:text-sky-400 mt-0.5">
                  +{rewards.gemsEarned}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  const sess = generateGameSession(gameId, user.learningLanguage, user?.preferredLanguage || 'en')
                  setSession(sess)
                  setCurrentRoundIdx(0)
                  setScore(0)
                  setIsCompleted(false)
                  setFeedback(null)
                  resetRoundStates()
                }}
                className="w-full py-3.5 bg-[#0B8F62] hover:bg-[#097b54] text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-[#0B8F62]/20 transition-all cursor-pointer"
              >
                <RotateCcw size={16} />
                <span>{t('play_again') || 'Play Again'}</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/games')}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                Back to Games Hub
              </button>
            </div>
          </motion.div>
        )}
      </main>

      {/* ── Bottom Feedback Drawer ───────────────────────────────────── */}
      <AnimatePresence>
        {feedback && !isCompleted && (
          <motion.footer
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className={`fixed bottom-0 left-0 right-0 p-4 md:p-5 border-t-2 shadow-2xl z-50 ${
              feedback.isCorrect
                ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-300 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950 border-rose-300 dark:border-rose-800'
            }`}
          >
            <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                {feedback.isCorrect ? (
                  <CheckCircle2 size={24} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <XCircle size={24} className="text-rose-600 dark:text-rose-400 shrink-0" />
                )}
                <div>
                  <p className={`text-sm font-black ${
                    feedback.isCorrect ? 'text-emerald-800 dark:text-emerald-200' : 'text-rose-800 dark:text-rose-200'
                  }`}>
                    {feedback.message}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleNextRound}
                className={`py-2.5 px-6 rounded-xl font-black text-xs text-white shrink-0 shadow-sm cursor-pointer transition-transform active:scale-95 ${
                  feedback.isCorrect
                    ? 'bg-[#0B8F62] hover:bg-[#097b54]'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                Continue →
              </button>
            </div>
          </motion.footer>
        )}
      </AnimatePresence>

    </div>
  )
}
