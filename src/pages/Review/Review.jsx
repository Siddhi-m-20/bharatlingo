import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../services/auth'
import { useProgress } from '../../services/progress'
import { useTheme } from '../../services/themeContext'
import { getLanguageById } from '../../data/languages'
import { getLessonsForLanguage } from '../../data/lessons'
import { getVocabularyForLanguage } from '../../data/vocabulary'
import { getMistakes, resolveMistake, getMasteryMap } from '../../services/mistakeService'
import { getSM2Stats, recordSM2Review, getDueSM2Items } from '../../services/spacedRepetition'
import { speakText } from '../../services/aiService'
import { audioFX } from '../../utils/audioFX'
import { triggerConfetti } from '../../utils/confetti'
import TopNavbar from '../../components/Navigation/TopNavbar'
import AppSidebar from '../../components/Navigation/AppSidebar'
import RightSidebar from '../../components/RightSidebar/RightSidebar'
import {
  RotateCcw,
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
  Trophy,
  AlertCircle,
  Volume2,
  ArrowRight,
  Flame,
  Zap,
  Brain,
  Check,
  X,
} from 'lucide-react'

export default function Review() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addXP, addGems } = useProgress()
  const { t, siteLanguage } = useTheme()

  const learningLang = getLanguageById(user?.learningLanguage) || { name: 'Gujarati', id: 'gu' }
  const preferredLangId = user?.preferredLanguage || siteLanguage || 'mr'

  const [activeTab, setActiveTab] = useState('lessons') // 'lessons' | 'drill' | 'mistakes'
  const [lessonFilter, setLessonFilter] = useState('all') // 'all' | 'completed' | 'in_progress'

  // Mistakes & Spaced Repetition State
  const [mistakes, setMistakes] = useState([])
  const [sm2Stats, setSm2Stats] = useState({ totalTracked: 0, dueCount: 0, masteredCount: 0, averageRetention: 100 })
  const [masteryMap, setMasteryMap] = useState({})

  // Quick Review Drill State
  const [isDrillActive, setIsDrillActive] = useState(false)
  const [drillQuestions, setDrillQuestions] = useState([])
  const [currentDrillIdx, setCurrentDrillIdx] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [drillChecked, setDrillChecked] = useState(false)
  const [drillScore, setDrillScore] = useState(0)
  const [isDrillFinished, setIsDrillFinished] = useState(false)

  // Load User Data
  useEffect(() => {
    setMistakes(getMistakes(learningLang.id))
    setSm2Stats(getSM2Stats(learningLang.id, user?.id))
    setMasteryMap(getMasteryMap(learningLang.id))
  }, [learningLang.id, user?.id])

  // Completed Lessons Set
  const completedLessonsList = user?.languageProgress?.[learningLang.id]?.completedLessons || user?.completedLessons || []
  const completedSet = useMemo(() => new Set(completedLessonsList), [completedLessonsList])

  // All Curriculum Lessons
  const allLessons = useMemo(() => {
    return getLessonsForLanguage(learningLang.id, preferredLangId)
  }, [learningLang.id, preferredLangId])

  // Filtered Lessons
  const filteredLessons = useMemo(() => {
    if (lessonFilter === 'completed') {
      return allLessons.filter((l) => completedSet.has(l.id))
    }
    if (lessonFilter === 'in_progress') {
      return allLessons.filter((l) => !completedSet.has(l.id))
    }
    return allLessons
  }, [allLessons, lessonFilter, completedSet])

  // Play pronunciation
  const handlePlayAudio = (e, text) => {
    e?.stopPropagation()
    speakText(text, learningLang.id)
  }

  // Handle Resolving a Mistake
  const handleResolveMistake = (word) => {
    resolveMistake(word, learningLang.id)
    setMistakes(getMistakes(learningLang.id))
    audioFX.playCorrect()
  }

  // Generate Quick 5-Question Drill
  const handleStartDrill = () => {
    const vocab = getVocabularyForLanguage(learningLang.id, preferredLangId)
    if (!vocab || vocab.length < 4) return

    // Shuffle and pick 5 items
    const shuffled = [...vocab].sort(() => Math.random() - 0.5)
    const picked = shuffled.slice(0, 5)

    const questions = picked.map((item) => {
      // Pick 3 distractors
      const otherVocab = vocab.filter((v) => v.word !== item.word)
      const distractors = otherVocab.sort(() => Math.random() - 0.5).slice(0, 3).map((d) => d.meaning)
      const options = [...distractors, item.meaning].sort(() => Math.random() - 0.5)

      return {
        word: item.word,
        pronunciation: item.pronunciation,
        correctMeaning: item.meaning,
        options,
      }
    })

    setDrillQuestions(questions)
    setCurrentDrillIdx(0)
    setSelectedOption(null)
    setDrillChecked(false)
    setDrillScore(0)
    setIsDrillFinished(false)
    setIsDrillActive(true)
    setActiveTab('drill')
  }

  // Handle Drill Check
  const handleCheckDrillAnswer = () => {
    if (!selectedOption || drillChecked) return
    const currentQ = drillQuestions[currentDrillIdx]
    const isCorrect = selectedOption === currentQ.correctMeaning

    setDrillChecked(true)

    if (isCorrect) {
      audioFX.playCorrect()
      setDrillScore((s) => s + 1)
      recordSM2Review(currentQ.word, 5, learningLang.id, user?.id)
    } else {
      audioFX.playWrong()
      recordSM2Review(currentQ.word, 2, learningLang.id, user?.id)
    }
  }

  // Handle Drill Next
  const handleNextDrillQuestion = () => {
    if (currentDrillIdx < drillQuestions.length - 1) {
      setCurrentDrillIdx((prev) => prev + 1)
      setSelectedOption(null)
      setDrillChecked(false)
    } else {
      // Completed drill
      setIsDrillFinished(true)
      audioFX.playVictory()
      triggerConfetti()
      addXP(drillScore * 5 + 10)
      addGems(2)
      setSm2Stats(getSM2Stats(learningLang.id, user?.id))
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F5EF] dark:bg-slate-950 flex flex-col md:flex-row pb-20 md:pb-6">
      {/* 1. LEFT SIDEBAR */}
      <AppSidebar />

      {/* 2. CENTER CONTENT */}
      <main className="flex-1 min-w-0 md:ml-72 flex flex-col min-h-screen">
        <TopNavbar />

        <div className="p-4 sm:p-6 lg:p-8 space-y-6 w-full max-w-7xl mx-auto flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
            
            {/* Primary Content Column */}
            <div className="lg:col-span-8 space-y-6">

            {/* 1. Header Banner */}
            <header className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-[#E8E6E0] dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-full text-xs font-black text-amber-700 dark:text-amber-400">
                  <RotateCcw size={13} />
                  <span>{learningLang.name} {t('review') || 'Review'}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-[#25231F] dark:text-white tracking-tight">
                  {t('review_hub_title') || 'Review & Past Lessons'}
                </h1>
                <p className="text-xs sm:text-sm text-[#77736B] dark:text-slate-400">
                  {t('review_hub_subtitle') || 'Revisit past curriculum lessons, practice weak vocabulary, and maintain high retention.'}
                </p>
              </div>

              {/* Action: Launch Quick 5-Question Drill */}
              <button
                type="button"
                onClick={handleStartDrill}
                className="px-5 py-3 bg-[#0B8F62] hover:bg-[#09734e] text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:scale-[1.02] shrink-0"
              >
                <Zap size={16} />
                <span>{t('start_quick_review') || 'Quick Review (5 Qs)'}</span>
              </button>
            </header>

            {/* 2. Key Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-[#E8E6E0] dark:border-slate-800 shadow-xs min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#77736B] dark:text-slate-400 mb-1 min-w-0">
                  <CheckCircle2 size={14} className="text-[#0B8F62] shrink-0" />
                  <span className="truncate">{t('completed_tag') || 'Completed'}</span>
                </div>
                <div className="text-xl font-black text-[#25231F] dark:text-white truncate">
                  {completedSet.size} / {allLessons.length}
                </div>
                <div className="text-[10px] text-[#77736B] dark:text-slate-500 font-semibold mt-0.5 truncate">
                  {t('past_lessons') || 'Past lessons'}
                </div>
              </div>

              <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-[#E8E6E0] dark:border-slate-800 shadow-xs min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#77736B] dark:text-slate-400 mb-1 min-w-0">
                  <Trophy size={14} className="text-amber-500 shrink-0" />
                  <span className="truncate">{t('mastered') || 'Mastered Words'}</span>
                </div>
                <div className="text-xl font-black text-[#25231F] dark:text-white truncate">
                  {Object.values(masteryMap).filter((m) => m >= 2).length}
                </div>
                <div className="text-[10px] text-[#77736B] dark:text-slate-500 font-semibold mt-0.5 truncate">
                  {t('vocab_words') || 'Vocab words'}
                </div>
              </div>

              <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-[#E8E6E0] dark:border-slate-800 shadow-xs min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#77736B] dark:text-slate-400 mb-1 min-w-0">
                  <Brain size={14} className="text-blue-500 shrink-0" />
                  <span className="truncate">{t('memory_retention') || 'Retention'}</span>
                </div>
                <div className="text-xl font-black text-[#25231F] dark:text-white truncate">
                  {sm2Stats.averageRetention}%
                </div>
                <div className="text-[10px] text-[#77736B] dark:text-slate-500 font-semibold mt-0.5 truncate">
                  {sm2Stats.dueCount} {t('words_due') || 'words due'}
                </div>
              </div>

              <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-[#E8E6E0] dark:border-slate-800 shadow-xs min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#77736B] dark:text-slate-400 mb-1 min-w-0">
                  <AlertCircle size={14} className="text-rose-500 shrink-0" />
                  <span className="truncate">{t('words_to_fix') || 'Mistakes Bank'}</span>
                </div>
                <div className="text-xl font-black text-[#25231F] dark:text-white truncate">
                  {mistakes.length}
                </div>
                <div className="text-[10px] text-[#77736B] dark:text-slate-500 font-semibold mt-0.5 truncate">
                  {t('needs_focus') || 'Needs focus'}
                </div>
              </div>
            </div>

            {/* 3. Navigation Tabs */}
            <div className="flex flex-wrap items-center gap-2 border-b border-[#E8E6E0] dark:border-slate-800 pb-2">
              <button
                type="button"
                onClick={() => setActiveTab('lessons')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'lessons'
                    ? 'bg-[#0B8F62] text-white shadow-xs'
                    : 'text-[#77736B] dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <BookOpen size={14} className="shrink-0" />
                <span>{t('past_lessons') || 'Past Curriculum Lessons'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('mistakes')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'mistakes'
                    ? 'bg-[#0B8F62] text-white shadow-xs'
                    : 'text-[#77736B] dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <AlertCircle size={14} className="shrink-0" />
                <span>{t('words_to_fix') || 'Mistakes Bank'} ({mistakes.length})</span>
              </button>

              {isDrillActive && (
                <button
                  type="button"
                  onClick={() => setActiveTab('drill')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'drill'
                      ? 'bg-[#0B8F62] text-white shadow-xs'
                      : 'text-[#77736B] dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Zap size={14} className="shrink-0" />
                  <span>{t('quick_review') || 'Active Review Drill'}</span>
                </button>
              )}
            </div>

            {/* 4. Tab Content: Quick Review Drill (Duolingo Style) */}
            {activeTab === 'drill' && isDrillActive && (
              <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-[#E8E6E0] dark:border-slate-800 shadow-sm space-y-6">
                {!isDrillFinished ? (
                  <>
                    {/* Drill Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-[#77736B] dark:text-slate-400">
                        <span>{t('quick_review') || 'Quick Review'}</span>
                        <span>{currentDrillIdx + 1} / {drillQuestions.length}</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#0B8F62] transition-all duration-300 rounded-full"
                          style={{ width: `${((currentDrillIdx + 1) / drillQuestions.length) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Question Card */}
                    {drillQuestions[currentDrillIdx] && (
                      <div className="text-center py-4 space-y-4">
                        <div className="text-xs uppercase font-bold text-[#77736B] dark:text-slate-400 tracking-wider">
                          {t('select_meaning') || 'Select the correct meaning'}
                        </div>

                        <div className="inline-flex items-center justify-center gap-3">
                          <h2 className="text-3xl sm:text-4xl font-black text-[#25231F] dark:text-white">
                            {drillQuestions[currentDrillIdx].word}
                          </h2>
                          <button
                            type="button"
                            onClick={(e) => handlePlayAudio(e, drillQuestions[currentDrillIdx].word)}
                            className="p-2.5 rounded-full bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-[#0B8F62] dark:text-emerald-400 transition-colors cursor-pointer"
                          >
                            <Volume2 size={20} />
                          </button>
                        </div>

                        {drillQuestions[currentDrillIdx].pronunciation && (
                          <p className="text-xs font-semibold text-[#77736B] dark:text-slate-400">
                            🗣️ {drillQuestions[currentDrillIdx].pronunciation}
                          </p>
                        )}

                        {/* Options Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto pt-4 text-left">
                          {drillQuestions[currentDrillIdx].options.map((opt, i) => {
                            const isSelected = selectedOption === opt
                            let btnStyle = 'bg-white dark:bg-slate-800 border-[#E8E6E0] dark:border-slate-700 text-[#25231F] dark:text-white hover:border-[#0B8F62]'

                            if (drillChecked) {
                              if (opt === drillQuestions[currentDrillIdx].correctMeaning) {
                                btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 font-black'
                              } else if (isSelected) {
                                btnStyle = 'bg-rose-50 border-rose-500 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
                              }
                            } else if (isSelected) {
                              btnStyle = 'border-[#0B8F62] bg-[#0B8F62]/10 text-[#0B8F62] dark:text-[#34D399] font-black'
                            }

                            return (
                              <button
                                key={i}
                                type="button"
                                disabled={drillChecked}
                                onClick={() => setSelectedOption(opt)}
                                className={`p-4 rounded-2xl border-2 text-sm font-bold transition-all cursor-pointer flex items-center justify-between gap-2 shadow-xs ${btnStyle}`}
                              >
                                <span className="leading-snug break-words">{opt}</span>
                                {drillChecked && opt === drillQuestions[currentDrillIdx].correctMeaning && (
                                  <Check size={16} className="text-[#0B8F62] shrink-0" />
                                )}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Drill Action Bottom Bar */}
                    <div className="flex items-center justify-between pt-4 border-t border-[#E8E6E0] dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => setIsDrillActive(false)}
                        className="text-xs font-bold text-[#77736B] hover:text-[#25231F] dark:hover:text-white cursor-pointer"
                      >
                        {t('exit') || 'Exit Review'}
                      </button>

                      {!drillChecked ? (
                        <button
                          type="button"
                          disabled={!selectedOption}
                          onClick={handleCheckDrillAnswer}
                          className="px-6 py-2.5 bg-[#0B8F62] hover:bg-[#09734e] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm"
                        >
                          {t('check_answer') || 'Check Answer'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleNextDrillQuestion}
                          className="px-6 py-2.5 bg-[#0B8F62] hover:bg-[#09734e] text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm"
                        >
                          {t('continue') || 'Continue →'}
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  /* Drill Complete Card */
                  <div className="text-center py-8 space-y-4">
                    <div className="text-5xl">🎉</div>
                    <h2 className="text-2xl font-black text-[#25231F] dark:text-white">
                      {t('review_completed_congrats') || 'Review Drill Complete!'}
                    </h2>
                    <p className="text-xs text-[#77736B] dark:text-slate-400">
                      You scored {drillScore} / {drillQuestions.length} and earned +{drillScore * 5 + 10} XP!
                    </p>

                    <div className="flex flex-wrap justify-center gap-3 pt-4">
                      <button
                        type="button"
                        onClick={handleStartDrill}
                        className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black transition-colors cursor-pointer"
                      >
                        {t('try_again') || 'Practice Another Drill'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsDrillActive(false)
                          setActiveTab('lessons')
                        }}
                        className="px-5 py-2.5 bg-[#0B8F62] text-white rounded-xl text-xs font-black transition-colors cursor-pointer"
                      >
                        {t('view_all_lessons') || 'View Lessons Library'}
                      </button>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* 5. Tab Content: Mistakes Bank */}
            {activeTab === 'mistakes' && (
              <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-[#E8E6E0] dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E8E6E0] dark:border-slate-800">
                  <div>
                    <h2 className="text-lg font-black text-[#25231F] dark:text-white">
                      {t('words_to_fix') || 'Mistakes Bank'}
                    </h2>
                    <p className="text-xs text-[#77736B] dark:text-slate-400">
                      Vocabulary words you recently stumbled on during lessons.
                    </p>
                  </div>
                </div>

                {mistakes.length === 0 ? (
                  <div className="text-center py-10 space-y-2">
                    <span className="text-4xl">🌟</span>
                    <h3 className="text-base font-black text-[#25231F] dark:text-white">
                      {t('no_mistakes_yet') || 'No mistakes to review!'}
                    </h3>
                    <p className="text-xs text-[#77736B] dark:text-slate-400">
                      Great job keeping your answers accurate. Keep learning new units!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {mistakes.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-[#F7F5EF] dark:bg-slate-800/60 border border-[#E8E6E0] dark:border-slate-700 flex items-center justify-between gap-3 min-w-0"
                      >
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-base font-black text-[#25231F] dark:text-white truncate">{item.word}</span>
                            <button
                              type="button"
                              onClick={(e) => handlePlayAudio(e, item.word)}
                              className="text-[#0B8F62] hover:opacity-80 cursor-pointer shrink-0"
                            >
                              <Volume2 size={14} />
                            </button>
                          </div>
                          {item.pronunciation && (
                            <p className="text-[11px] text-[#77736B] dark:text-slate-400 truncate">{item.pronunciation}</p>
                          )}
                          <p className="text-xs font-bold text-[#0B8F62] dark:text-emerald-400 truncate">{item.translation}</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleResolveMistake(item.word)}
                          className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 hover:bg-emerald-50 hover:text-[#0B8F62] text-xs font-black text-[#77736B] dark:text-slate-300 border border-[#E8E6E0] dark:border-slate-600 transition-colors cursor-pointer shrink-0 whitespace-nowrap"
                        >
                          {t('mark_mastered') || 'Mastered ✓'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* 6. Tab Content: Past Completed Lessons Library */}
            {activeTab === 'lessons' && (
              <section className="space-y-4">
                {/* Filter Sub-Pills */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {[
                      { id: 'all', label: t('all') || 'All Lessons' },
                      { id: 'completed', label: `${t('completed_tag') || 'Completed'} (${completedSet.size})` },
                      { id: 'in_progress', label: t('needs_focus') || 'In Progress' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setLessonFilter(f.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                          lessonFilter === f.id
                            ? 'bg-[#25231F] text-white dark:bg-white dark:text-slate-900 shadow-xs'
                            : 'bg-white dark:bg-slate-900 text-[#77736B] dark:text-slate-400 border border-[#E8E6E0] dark:border-slate-800'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  <span className="text-xs text-[#77736B] dark:text-slate-400 font-bold hidden sm:inline">
                    {filteredLessons.length} {t('exercises') || 'lessons'}
                  </span>
                </div>

                {/* Lessons List Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredLessons.map((lesson) => {
                    const isCompleted = completedSet.has(lesson.id)

                    return (
                      <div
                        key={lesson.id}
                        className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-[#E8E6E0] dark:border-slate-800 shadow-xs flex flex-col justify-between gap-4 hover:border-[#0B8F62] transition-colors min-w-0"
                      >
                        <div className="space-y-2 min-w-0">
                          <div className="flex items-center justify-between gap-2 min-w-0">
                            <span className="text-[10px] uppercase font-black text-[#77736B] dark:text-slate-400 tracking-wider truncate">
                              {lesson.unit || 'Unit 1'}
                            </span>
                            {isCompleted ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-black border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 shrink-0 whitespace-nowrap">
                                <CheckCircle2 size={11} />
                                <span>{t('completed_tag') || 'Completed'}</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold shrink-0 whitespace-nowrap">
                                {t('start') || 'Available'}
                              </span>
                            )}
                          </div>

                          <h3 className="text-base font-black text-[#25231F] dark:text-white leading-snug break-words">
                            {lesson.name}
                          </h3>

                          {lesson.nameNative && (
                            <p className="text-xs font-bold text-[#0B8F62] dark:text-[#34D399] break-words">
                              {lesson.nameNative}
                            </p>
                          )}

                          {/* Vocabulary Sample Pills */}
                          {lesson.vocabulary && lesson.vocabulary.length > 0 && (
                            <div className="pt-2 flex flex-wrap gap-1.5 min-w-0">
                              {lesson.vocabulary.slice(0, 4).map((v, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={(e) => handlePlayAudio(e, v.word)}
                                  className="px-2 py-1 rounded-lg bg-[#F7F5EF] dark:bg-slate-800/80 hover:bg-emerald-50 text-[11px] font-bold text-[#25231F] dark:text-slate-300 flex items-center gap-1 cursor-pointer transition-colors max-w-full truncate"
                                  title={v.translation}
                                >
                                  <span className="truncate">{v.word}</span>
                                  <Volume2 size={10} className="text-[#0B8F62] shrink-0" />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Direct Replay / Review Action Button */}
                        <button
                          type="button"
                          onClick={() => navigate(`/lesson/${lesson.id}`)}
                          className={`w-full py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                            isCompleted
                              ? 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-[#0B8F62] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-[#0B8F62] hover:bg-[#09734e] text-white'
                          }`}
                        >
                          <RotateCcw size={13} className="shrink-0" />
                          <span>{isCompleted ? (t('review_lesson') || 'Review Lesson →') : (t('start') || 'Start Lesson →')}</span>
                        </button>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            </div>

            {/* Secondary Column: Right Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              <RightSidebar />
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
