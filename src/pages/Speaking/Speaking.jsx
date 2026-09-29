import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../services/auth'
import { useProgress } from '../../services/progress'
import { useTheme } from '../../services/themeContext'
import { getLanguageById } from '../../data/languages'
import { getSpeakingPhrases, SPEAKING_CATEGORIES } from '../../data/speakingPhrases'
import { speechRecognitionService, REC_STATE } from '../../services/audio/SpeechRecognitionService'
import { speakText } from '../../services/aiService'
import { audioFX } from '../../utils/audioFX'
import { triggerConfetti } from '../../utils/confetti'
import TopNavbar from '../../components/Navigation/TopNavbar'
import AppSidebar from '../../components/Navigation/AppSidebar'
import RightSidebar from '../../components/RightSidebar/RightSidebar'
import {
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  Trophy,
  Flame,
  RotateCcw,
  ChevronRight,
  Bot,
  CheckCircle2,
  Award,
  ArrowRight,
  VolumeX,
} from 'lucide-react'

export default function Speaking() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addXP, updateStreak } = useProgress()
  const { t, siteLanguage } = useTheme()

  const learningLang = getLanguageById(user?.learningLanguage) || { name: 'Gujarati', id: 'gu' }
  const preferredLangId = user?.preferredLanguage || siteLanguage || 'mr'

  const [category, setCategory] = useState('words')
  const [phrases, setPhrases] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)

  // ASR & Speaking States
  const [recState, setRecState] = useState(REC_STATE.IDLE)
  const [evalResult, setEvalResult] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [isSlowAudio, setIsSlowAudio] = useState(false)

  // Session Stats
  const [sessionCompletedCount, setSessionCompletedCount] = useState(0)
  const [sessionScores, setSessionScores] = useState([])

  const timerRef = useRef(null)

  // Load phrases
  useEffect(() => {
    const list = getSpeakingPhrases(learningLang.id, preferredLangId)
    setPhrases(list)
    setCurrentIndex(0)
    setEvalResult(null)
    setErrorMessage(null)
  }, [learningLang.id, preferredLangId])

  // Filtered phrases by category
  const filteredPhrases = category === 'all'
    ? phrases
    : phrases.filter((p) => p.category === category)

  const currentPhrase = filteredPhrases[currentIndex] || filteredPhrases[0]

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        speechRecognitionService.stop?.()
        speechRecognitionService.stopRecording?.()
      } catch (_) {}
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  // Timer while recording
  useEffect(() => {
    if (recState === REC_STATE.RECORDING) {
      setRecordingSeconds(0)
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 15) {
            handleStopRecording()
            return 15
          }
          return prev + 1
        })
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [recState])

  // Handle Play Audio
  const handlePlayAudio = (slow = false) => {
    if (!currentPhrase?.phrase) return
    setIsSlowAudio(slow)
    speakText(currentPhrase.phrase, learningLang.id, slow ? 0.7 : 1.0)
    setTimeout(() => setIsSlowAudio(false), 2000)
  }

  // Handle Start Recording
  const handleStartRecording = () => {
    if (!currentPhrase) return
    setErrorMessage(null)
    setEvalResult(null)

    try {
      speechRecognitionService.startRecording(
        learningLang.id,
        {
          onResult: (result) => {
            setEvalResult(result)
            setRecState(REC_STATE.RESULT)
            if (result.score >= 65) {
              audioFX.playCorrect()
              triggerConfetti()
              addXP(10)
              updateStreak?.()
              setSessionCompletedCount((c) => c + 1)
              setSessionScores((prev) => [...prev, result.score])
            } else {
              audioFX.playWrong()
            }
          },
          onError: (err) => {
            setErrorMessage(err.message || 'Speech recognition error. Please try again.')
            setRecState(REC_STATE.ERROR)
          },
          onStateChange: (state) => {
            setRecState(state)
          },
        },
        currentPhrase.phrase
      )
    } catch (err) {
      setErrorMessage(err.message || 'Microphone activation failed.')
      setRecState(REC_STATE.ERROR)
    }
  }

  // Handle Stop Recording
  const handleStopRecording = () => {
    try {
      speechRecognitionService.stop?.()
      speechRecognitionService.stopRecording?.()
    } catch (_) {}
  }

  // Next Phrase / Word
  const handleNextPhrase = () => {
    try {
      speechRecognitionService.stop?.()
      speechRecognitionService.stopRecording?.()
    } catch (_) {}
    setEvalResult(null)
    setErrorMessage(null)
    setRecState(REC_STATE.IDLE)
    if (currentIndex < filteredPhrases.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      setCurrentIndex(0)
    }
  }

  // Calculate Average Accuracy
  const averageAccuracy = sessionScores.length > 0
    ? Math.round(sessionScores.reduce((a, b) => a + b, 0) / sessionScores.length)
    : 85

  return (
    <div className="min-h-screen bg-[#F7F5EF] dark:bg-slate-950 flex flex-col md:flex-row pb-20 md:pb-6">
      {/* 1. LEFT SIDEBAR */}
      <AppSidebar />

      {/* 2. CENTER CONTENT */}
      <main className="flex-1 min-w-0 md:ml-72 flex flex-col min-h-screen">
        <TopNavbar />

        <div className="p-4 sm:p-6 lg:p-8 space-y-6 w-full max-w-7xl mx-auto flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">

              {/* ── PRIMARY COLUMN: Speaking Practice Hub (8 cols) ────────── */}
              <div className="lg:col-span-8 space-y-6">

                {/* 1. Header Banner */}
                <header className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-[#E8E6E0] dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-full text-xs font-black text-[#0B8F62] dark:text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-[#0B8F62] animate-pulse" />
                      <span>{learningLang.name} {t('speaking') || 'Speaking'}</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-[#25231F] dark:text-white tracking-tight">
                      {t('speaking_hub_title') || 'Speaking Practice & Voice Tutor'}
                    </h1>
                    <p className="text-xs sm:text-sm text-[#77736B] dark:text-slate-400">
                      {t('speaking_hub_subtitle') || 'Speak target language words and phrases aloud with live speech analysis.'}
                    </p>
                  </div>

                  {/* Stats Badges */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="px-4 py-2 bg-[#F7F5EF] dark:bg-slate-800 rounded-2xl border border-[#E8E6E0] dark:border-slate-700 text-center">
                      <div className="text-xs text-[#77736B] dark:text-slate-400 font-bold flex items-center justify-center gap-1">
                        <Trophy size={13} className="text-[#F39A45]" />
                        <span>{t('accuracy') || 'Accuracy'}</span>
                      </div>
                      <div className="text-lg font-black text-[#25231F] dark:text-white">
                        {sessionScores.length > 0 ? `${averageAccuracy}%` : '—'}
                      </div>
                    </div>

                    <div className="px-4 py-2 bg-[#F7F5EF] dark:bg-slate-800 rounded-2xl border border-[#E8E6E0] dark:border-slate-700 text-center">
                      <div className="text-xs text-[#77736B] dark:text-slate-400 font-bold flex items-center justify-center gap-1">
                        <CheckCircle2 size={13} className="text-[#0B8F62]" />
                        <span>{t('done') || 'Completed'}</span>
                      </div>
                      <div className="text-lg font-black text-[#0B8F62] dark:text-emerald-400">
                        {sessionCompletedCount}
                      </div>
                    </div>
                  </div>
                </header>

                {/* 2. Category Filter Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {SPEAKING_CATEGORIES.map((cat) => {
                    const label = cat.label[preferredLangId] || cat.label['en'] || cat.id
                    const isSelected = category === cat.id
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setCategory(cat.id)
                          setCurrentIndex(0)
                          setEvalResult(null)
                          setErrorMessage(null)
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#0B8F62] text-white shadow-sm'
                            : 'bg-white dark:bg-slate-900 text-[#77736B] dark:text-slate-400 border border-[#E8E6E0] dark:border-slate-800 hover:border-[#0B8F62]'
                        }`}
                      >
                        <span>{cat.icon}</span>
                        <span>{label}</span>
                      </button>
                    )
                  })}
                </div>

                {/* 3. Main Speaking Drill Card (Duolingo Style) */}
                {currentPhrase ? (
                  <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-[#E8E6E0] dark:border-slate-800 shadow-sm space-y-6 relative overflow-hidden">
                    {/* Top phrase status indicator */}
                    <div className="flex items-center justify-between text-xs font-bold text-[#77736B] dark:text-slate-400 border-b border-[#E8E6E0] dark:border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#0B8F62]" />
                        <span className="font-black text-[#25231F] dark:text-white uppercase tracking-wider text-xs">
                          {currentPhrase.isWord || category === 'words'
                            ? (t('speak_this_word') || 'Speak this word')
                            : (t('speak_this_phrase') || 'Speak this phrase')}
                        </span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-bold">
                        {currentIndex + 1} / {filteredPhrases.length} • +10 XP
                      </span>
                    </div>

                    {/* Phrase Showcase */}
                    <div className="text-center py-4 space-y-3">
                      {/* Target Phrase in Authentic Script */}
                      <h2 className="text-3xl sm:text-4xl font-black text-[#25231F] dark:text-white leading-relaxed tracking-wide">
                        {currentPhrase.phrase}
                      </h2>

                      {/* Transliteration Guide */}
                      {currentPhrase.pronunciation && (
                        <p className="text-sm font-semibold text-[#0B8F62] dark:text-[#34D399]">
                          🗣️ {currentPhrase.pronunciation}
                        </p>
                      )}

                      {/* Meaning in Native / Preferred Language */}
                      <div className="inline-block px-4 py-1.5 bg-[#F7F5EF] dark:bg-slate-800 rounded-xl text-xs sm:text-sm font-bold text-[#77736B] dark:text-slate-300 border border-[#E8E6E0] dark:border-slate-700">
                        💡 {currentPhrase.meaning}
                      </div>
                    </div>

                    {/* Audio Listen Buttons */}
                    <div className="flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => handlePlayAudio(false)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-[#0B8F62] dark:text-emerald-400 rounded-xl text-xs font-black transition-colors cursor-pointer border border-emerald-200 dark:border-emerald-800"
                      >
                        <Volume2 size={16} />
                        <span>{t('listen_and_speak') || 'Listen Native Audio'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePlayAudio(true)}
                        className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black transition-colors cursor-pointer"
                        title={t('play_slowly')}
                      >
                        <span>🐢</span>
                        <span>{t('slow') || 'Slow'}</span>
                      </button>
                    </div>

                    {/* Microphone Centerpiece */}
                    <div className="py-6 flex flex-col items-center justify-center gap-3">
                      {recState === REC_STATE.RECORDING ? (
                        <div className="flex flex-col items-center gap-3">
                          {/* Pulsing Recording Button */}
                          <button
                            type="button"
                            onClick={handleStopRecording}
                            className="w-24 h-24 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/30 cursor-pointer animate-pulse ring-8 ring-rose-200 dark:ring-rose-950/60"
                            title={t('tap_to_stop')}
                          >
                            <MicOff size={36} />
                          </button>

                          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-black text-xs">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                            <span>{t('listening_to_you') || 'Listening to you... Speak clearly!'} ({15 - recordingSeconds}s)</span>
                          </div>
                        </div>
                      ) : recState === REC_STATE.PROCESSING ? (
                        <div className="flex flex-col items-center gap-2 py-4">
                          <div className="w-10 h-10 border-4 border-[#0B8F62] border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs font-bold text-[#77736B] dark:text-slate-400">
                            {t('analyzing') || 'Evaluating pronunciation...'}
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <button
                            type="button"
                            onClick={handleStartRecording}
                            className="w-20 h-20 rounded-full bg-[#0B8F62] hover:bg-[#09734e] text-white flex items-center justify-center shadow-lg shadow-[#0B8F62]/20 hover:scale-105 active:scale-95 transition-all cursor-pointer ring-4 ring-emerald-100 dark:ring-emerald-950/50"
                            title={t('tap_to_speak')}
                          >
                            <Mic size={32} />
                          </button>
                          <span className="text-xs font-black text-[#25231F] dark:text-slate-200">
                            {t('speak_now') || 'Tap to Speak'}
                          </span>
                        </div>
                      )}

                      {/* Error Notification */}
                      {errorMessage && (
                        <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-bold text-center max-w-sm">
                          ⚠️ {errorMessage}
                        </div>
                      )}
                    </div>

                    {/* Score & Evaluation Feedback Card */}
                    {evalResult && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-5 rounded-2xl border-2 space-y-3 ${
                          evalResult.score >= 65
                            ? 'bg-emerald-50/70 border-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-700'
                            : 'bg-amber-50/70 border-amber-300 dark:bg-amber-950/30 dark:border-amber-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">
                              {evalResult.score >= 80 ? '🌟' : evalResult.score >= 65 ? '👍' : '🔄'}
                            </span>
                            <div>
                              <div className="text-base font-black text-[#25231F] dark:text-white">
                                {evalResult.score >= 80
                                  ? (t('excellent') || 'Excellent Pronunciation!')
                                  : evalResult.score >= 65
                                  ? (t('great_job') || 'Good Effort!')
                                  : (t('keep_practicing') || 'Keep Practicing!')}
                              </div>
                              <div className="text-xs text-[#77736B] dark:text-slate-400">
                                {t('accuracy') || 'Accuracy'}: <strong className="text-[#0B8F62]">{evalResult.score}%</strong>
                              </div>
                            </div>
                          </div>

                          {evalResult.score >= 65 && (
                            <div className="px-3 py-1 rounded-full bg-[#0B8F62] text-white text-xs font-black shadow-xs">
                              +10 XP 🎉
                            </div>
                          )}
                        </div>

                        {/* Speech Recognition Output */}
                        {evalResult.transcript && (
                          <div className="text-xs bg-white dark:bg-slate-800/80 p-3 rounded-xl border border-current/10 space-y-1">
                            <span className="font-bold text-[#77736B] dark:text-slate-400">{t('you_said') || 'Recognized Speech'}:</span>
                            <p className="font-bold text-[#25231F] dark:text-white">"{evalResult.transcript}"</p>
                          </div>
                        )}

                        {/* Word-by-Word Analysis Badges */}
                        {evalResult.wordResults && evalResult.wordResults.length > 0 && (
                          <div className="space-y-1 pt-1">
                            <span className="text-[11px] font-bold text-[#77736B] dark:text-slate-400 uppercase">
                              {t('word_breakdown') || 'Word Match Analysis'}:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {evalResult.wordResults.map((w, i) => (
                                <span
                                  key={i}
                                  className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                                    w.matchStatus === 'exact'
                                      ? 'bg-[#0B8F62] text-white'
                                      : w.matchStatus === 'close'
                                      ? 'bg-amber-500 text-white'
                                      : 'bg-rose-500 text-white'
                                  }`}
                                >
                                  {w.targetWord}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* Navigation Bottom Controls */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#E8E6E0] dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          setEvalResult(null)
                          setErrorMessage(null)
                          setRecState(REC_STATE.IDLE)
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-black text-[#77736B] dark:text-slate-400 hover:text-[#25231F] dark:hover:text-white transition-colors cursor-pointer"
                      >
                        <RotateCcw size={14} />
                        <span>{t('try_again') || 'Try Again'}</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleNextPhrase}
                          className="px-3.5 py-2 text-xs font-bold text-[#77736B] dark:text-slate-400 hover:text-[#25231F] dark:hover:text-white transition-colors cursor-pointer"
                        >
                          {t('cant_speak_now') || "Can't speak now"}
                        </button>

                        <button
                          type="button"
                          onClick={handleNextPhrase}
                          className="flex items-center gap-2 px-5 py-2.5 bg-[#0B8F62] hover:bg-[#09734e] text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm hover:translate-x-0.5"
                        >
                          <span>{currentPhrase.isWord || category === 'words' ? (t('next_word') || 'Next Word') : (t('next_phrase') || 'Next Phrase')}</span>
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  </section>
                ) : null}

                {/* 4. AI Voice Tutor Promotion Banner */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 text-center sm:text-left">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[11px] font-black uppercase tracking-wider">
                      <Bot size={13} />
                      <span>BharatLingo AI Tutor</span>
                    </div>
                    <h3 className="text-lg font-black tracking-tight">
                      {t('full_conversation_prompt') || 'Ready for a real interactive dialogue?'}
                    </h3>
                    <p className="text-xs text-emerald-100 max-w-md">
                      {t('tutor_promo_subtitle') || 'Chat with our AI Voice Tutor in real-world Indian scenarios like ordering chai, asking directions, and everyday conversations.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate('/tutor')}
                    className="px-5 py-2.5 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 shadow-sm"
                  >
                    {t('open_ai_tutor') || 'Launch AI Voice Tutor →'}
                  </button>
                </div>

              </div>

              {/* ── SECONDARY COLUMN: Right Sidebar (4 cols) ───────────────── */}
              <div className="lg:col-span-4 space-y-6">
                <RightSidebar />
              </div>

            </div>
          </div>
        </main>
    </div>
  )
}

