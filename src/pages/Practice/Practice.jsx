import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../services/auth'
import { useProgress } from '../../services/progress'
import { getVocabularyForLanguage } from '../../data/vocabulary'
import { getLanguageById } from '../../data/languages'
import { getMistakes, resolveMistake, updateWordMastery, getMasteryMap } from '../../services/mistakeService'
import { recordSM2Review, getDueSM2Items, getSM2Stats } from '../../services/spacedRepetition'
import { speakText } from '../../services/aiService'
import { audioFX } from '../../utils/audioFX'
import { triggerConfetti } from '../../utils/confetti'
import Button from '../../components/Button'
import AppSidebar from '../../components/Navigation/AppSidebar'
import RightSidebar from '../../components/RightSidebar/RightSidebar'
import { Volume2, Sparkles, AlertCircle, Heart, Zap, Clock, Trophy, RotateCcw, Brain, Flame } from 'lucide-react'

export default function Practice() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { restoreHearts, addXP, addGems, trackQuestProgress, hearts } = useProgress()

  const [vocabulary, setVocabulary] = useState([])
  const [mistakes, setMistakes] = useState([])
  const [activeTab, setActiveTab] = useState('flashcards') // 'flashcards' | 'mistakes' | 'speed'
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [reviewedCount, setReviewedCount] = useState(0)
  const [sm2Stats, setSm2Stats] = useState({ totalTracked: 0, dueCount: 0, masteredCount: 0, averageRetention: 100 })

  // Speed challenge state
  const [speedRunning, setSpeedRunning] = useState(false)
  const [speedTimer, setSpeedTimer] = useState(30)
  const [speedScore, setSpeedScore] = useState(0)
  const [speedQuestion, setSpeedQuestion] = useState(null)
  const [speedOptions, setSpeedOptions] = useState([])

  const language = getLanguageById(user?.learningLanguage) || { name: 'Hindi', id: 'hi' }
  const preferredLang = getLanguageById(user?.preferredLanguage || 'en')

  useEffect(() => {
    if (!user?.learningLanguage) {
      navigate('/onboarding')
      return
    }

    const preferredId = user.preferredLanguage || 'en'
    const vocabList = getVocabularyForLanguage(user.learningLanguage, preferredId)
    const masteryMap = getMasteryMap(user.learningLanguage)

    const mapped = vocabList.map((item) => ({
      ...item,
      mastery: masteryMap[item.word] !== undefined ? masteryMap[item.word] : 0,
    }))

    setVocabulary(mapped)
    setMistakes(getMistakes(user.learningLanguage))
    setSm2Stats(getSM2Stats(user.learningLanguage))
  }, [user, navigate])

  // Speed Challenge Timer
  useEffect(() => {
    let interval = null
    if (speedRunning && speedTimer > 0) {
      interval = setInterval(() => {
        setSpeedTimer((t) => t - 1)
      }, 1000)
    } else if (speedRunning && speedTimer === 0) {
      setSpeedRunning(false)
      audioFX.playVictory()
      triggerConfetti()
      addXP(speedScore * 5 + 10)
      addGems(Math.floor(speedScore / 2) + 2)
    }
    return () => clearInterval(interval)
  }, [speedRunning, speedTimer, speedScore])

  const activeList =
    activeTab === 'mistakes'
      ? mistakes
      : selectedFilter === 'all'
      ? vocabulary
      : selectedFilter === 'mastered'
      ? vocabulary.filter((v) => v.mastery >= 2)
      : vocabulary.filter((v) => v.mastery < 2)

  const currentCard = activeList[currentCardIndex] || activeList[0]

  const handlePlayAudio = (e, text) => {
    e?.stopPropagation()
    speakText(text, user?.learningLanguage || 'hi')
  }

  const handleNextCard = () => {
    setIsFlipped(false)
    if (currentCardIndex < activeList.length - 1) {
      setCurrentCardIndex((prev) => prev + 1)
    } else {
      setCurrentCardIndex(0)
    }
  }

  const handleRateCard = (quality) => {
    // quality: 5 (perfect), 3 (pass with difficulty), 1 (failed)
    if (!currentCard) return

    const isKnown = quality >= 3

    if (isKnown) {
      audioFX.playCorrect()
      addXP(5)
      updateWordMastery(currentCard.word, user.learningLanguage, true)
      if (activeTab === 'mistakes') {
        resolveMistake(currentCard.word, user.learningLanguage)
        setMistakes(getMistakes(user.learningLanguage))
      }
    } else {
      audioFX.playWrong()
      updateWordMastery(currentCard.word, user.learningLanguage, false)
    }

    // Record in SuperMemo SM-2 Spaced Repetition engine
    recordSM2Review(
      currentCard.word,
      currentCard.translation,
      user.learningLanguage,
      quality,
      currentCard.category || 'General'
    )
    setSm2Stats(getSM2Stats(user.learningLanguage))

    trackQuestProgress('practice', 1)
    setReviewedCount((prev) => prev + 1)
    handleNextCard()
  }

  // Speed Challenge Logic
  const startSpeedChallenge = () => {
    setSpeedRunning(true)
    setSpeedTimer(30)
    setSpeedScore(0)
    nextSpeedQuestion()
  }

  const nextSpeedQuestion = () => {
    if (vocabulary.length < 4) return
    const correct = vocabulary[Math.floor(Math.random() * vocabulary.length)]
    const distractors = vocabulary
      .filter((v) => v.word !== correct.word)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)

    const options = [correct, ...distractors].sort(() => Math.random() - 0.5)
    setSpeedQuestion(correct)
    setSpeedOptions(options)
  }

  const handleSpeedAnswer = (option) => {
    if (!speedRunning) return
    if (option.word === speedQuestion.word) {
      audioFX.playCorrect()
      setSpeedScore((s) => s + 1)
    } else {
      audioFX.playWrong()
    }
    nextSpeedQuestion()
  }

  return (
    <div className="min-h-screen bg-[#F7F5EF] dark:bg-slate-950 flex justify-center pb-20 md:pb-0 text-[#25231F] dark:text-slate-100">
      <AppSidebar />

      <main className="flex-1 max-w-[680px] md:ml-64 px-4 py-6 md:py-8 space-y-6">
        {/* Banner with SM-2 Spaced Repetition Stats */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-6 md:p-8 text-white shadow-xl">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider mb-3">
              <Brain className="w-3.5 h-3.5" /> SM-2 Spaced Repetition & Retention Engine
            </div>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight mb-2">
              Practice & Memory Lab
            </h1>
            <p className="text-white/90 text-sm md:text-base max-w-xl">
              Optimize long-term recall with SuperMemo SM-2 forgetting curves, mistake targeting, and rapid timed speed drills.
            </p>

            {/* SRS Metrics Badges */}
            <div className="grid grid-cols-3 gap-3 mt-6 max-w-md">
              <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3 text-center">
                <div className="text-xl font-black">{sm2Stats.totalTracked || vocabulary.length}</div>
                <div className="text-[10px] uppercase font-bold opacity-80">Tracked Words</div>
              </div>
              <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3 text-center">
                <div className="text-xl font-black">{sm2Stats.masteredCount}</div>
                <div className="text-[10px] uppercase font-bold opacity-80">Mastered</div>
              </div>
              <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3 text-center">
                <div className="text-xl font-black">{sm2Stats.averageRetention || 95}%</div>
                <div className="text-[10px] uppercase font-bold opacity-80">Memory Retention</div>
              </div>
            </div>
          </div>
          <div className="absolute right-6 -bottom-6 text-8xl md:text-9xl opacity-20 select-none font-bold">
            🧠
          </div>
        </div>

        {/* Mode Tabs */}
        <div className="flex p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('flashcards')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all cursor-pointer ${
              activeTab === 'flashcards'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Flashcards
          </button>
          <button
            onClick={() => setActiveTab('mistakes')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'mistakes'
                ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Mistakes {mistakes.length > 0 && `(${mistakes.length})`}
          </button>
          <button
            onClick={() => setActiveTab('speed')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'speed'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Speed Drill ⚡
          </button>
        </div>

        {/* TAB 1 & 2: FLASHCARDS / MISTAKE REVIEW */}
        {activeTab !== 'speed' ? (
          activeList.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
              <Sparkles className="w-12 h-12 mx-auto text-emerald-500 mb-3" />
              <h3 className="text-lg font-bold">No items found in this section!</h3>
              <p className="text-slate-500 text-sm mt-1">
                {activeTab === 'mistakes' ? 'You have cleared all your mistakes!' : 'Start lessons to build your vocabulary bank.'}
              </p>
            </div>
          ) : (
            <div className="max-w-md mx-auto space-y-6">
              {/* Flashcard Box with Flip animation */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="group relative h-80 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-8 shadow-xl flex flex-col items-center justify-between cursor-pointer transform transition-all duration-300 hover:border-emerald-400"
              >
                <div className="w-full flex items-center justify-between text-xs font-bold text-slate-400">
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800">
                    Card {currentCardIndex + 1} of {activeList.length}
                  </span>
                  <button
                    onClick={(e) => handlePlayAudio(e, currentCard?.word)}
                    className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 hover:scale-110 active:scale-95 transition-all"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-center my-auto">
                  {!isFlipped ? (
                    <div>
                      <div className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2">
                        {currentCard?.word}
                      </div>
                      {currentCard?.pronunciation && (
                        <div className="text-xs font-mono text-emerald-600 dark:text-emerald-400">
                          /{currentCard.pronunciation}/
                        </div>
                      )}
                      <div className="text-xs text-slate-400 mt-4">Tap to reveal translation</div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-2xl md:text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                        {currentCard?.translation}
                      </div>
                      {currentCard?.example && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 italic max-w-xs">
                          "{currentCard.example}"
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="text-[11px] font-semibold text-slate-400">
                  Category: {currentCard?.category || 'General'}
                </div>
              </div>

              {/* SM-2 Recall Feedback Buttons */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleRateCard(1)}
                  className="py-3 px-4 rounded-2xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold text-xs shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  Forgot (1)
                </button>
                <button
                  onClick={() => handleRateCard(3)}
                  className="py-3 px-4 rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold text-xs shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  Hard (3)
                </button>
                <button
                  onClick={() => handleRateCard(5)}
                  className="py-3 px-4 rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-xs shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  Easy (5)
                </button>
              </div>
            </div>
          )
        ) : (
          /* TAB 3: TIMED SPEED CHALLENGE DRILL */
          <div className="max-w-md mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-xl text-center space-y-6">
            {!speedRunning && speedTimer === 30 ? (
              <div className="space-y-4 py-6">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center text-4xl shadow-inner">
                  ⚡
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  30-Second Rapid Speed Drill
                </h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Match as many words as you can in 30 seconds to earn bonus XP and Gems!
                </p>
                <button
                  onClick={startSpeedChallenge}
                  className="px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm shadow-lg shadow-orange-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  Start Drill →
                </button>
              </div>
            ) : speedRunning ? (
              <div className="space-y-6">
                {/* Timer & Score Bar */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-black text-sm">
                    <Clock className="w-4 h-4" /> {speedTimer}s
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-black text-sm">
                    <Trophy className="w-4 h-4" /> Score: {speedScore}
                  </div>
                </div>

                {speedQuestion && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                      <div className="text-xs font-bold text-slate-400 uppercase">Target Word</div>
                      <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                        {speedQuestion.translation}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      {speedOptions.map((opt, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSpeedAnswer(opt)}
                          className="p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 font-bold text-base text-slate-900 dark:text-white hover:border-amber-400 hover:bg-amber-50/50 dark:hover:bg-slate-700 active:scale-95 transition-all cursor-pointer"
                        >
                          {opt.word}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Results */
              <div className="space-y-4 py-4 animate-in zoom-in-95 duration-300">
                <div className="text-5xl">🎉</div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Drill Complete!</h3>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  You matched {speedScore} words correctly in 30 seconds!
                </p>
                <div className="flex items-center justify-center gap-4 text-xs font-bold text-slate-500">
                  <span className="text-amber-600">+{speedScore * 5 + 10} XP</span>
                  <span className="text-cyan-500">+{Math.floor(speedScore / 2) + 2} 💎</span>
                </div>
                <button
                  onClick={startSpeedChallenge}
                  className="px-6 py-2.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-md hover:scale-105 active:scale-95 transition-all"
                >
                  Play Again
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      <RightSidebar />
    </div>
  )
}
