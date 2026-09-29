import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../services/auth'
import { useTheme } from '../../services/themeContext'
import { useProgress } from '../../services/progress'
import { alphabetDataByLanguage } from '../../data/alphabets'
import { getLanguageById } from '../../data/languages'
import { AudioService } from '../../services/audio/AudioService'
import TopNavbar from '../../components/Navigation/TopNavbar'
import AppSidebar from '../../components/Navigation/AppSidebar'
import RightSidebar from '../../components/RightSidebar/RightSidebar'
import LetterWritingCanvas from '../../components/WritingPad/LetterWritingCanvas'
import {
  Volume2,
  Sparkles,
  BookOpen,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Award,
  PenTool,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

export default function Alphabet() {
  const { user } = useAuth()
  const { t } = useTheme()
  const { addXP, addGems } = useProgress()

  const currentLang = user?.learningLanguage || 'hi'
  const langMeta = getLanguageById(currentLang) || { name: 'Hindi', nativeName: 'हिन्दी' }
  const scriptData = alphabetDataByLanguage[currentLang] || alphabetDataByLanguage['hi']

  const [activeTab, setActiveTab] = useState('vowels') // 'vowels' | 'consonants' | 'writing' | 'practice'
  const [selectedChar, setSelectedChar] = useState(null)

  // Writing Mode States
  const [writingCategory, setWritingCategory] = useState('vowels')
  const [writingIndex, setWritingIndex] = useState(0)
  const [masteredLetters, setMasteredLetters] = useState(() => {
    try {
      const stored = localStorage.getItem(`bl_writing_mastered_${currentLang}`)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  // Practice Mode States
  const [quizItem, setQuizItem] = useState(null)
  const [quizOptions, setQuizOptions] = useState([])
  const [quizFeedback, setQuizFeedback] = useState(null)
  const [score, setScore] = useState(0)

  const writingList = writingCategory === 'vowels' ? scriptData.vowels || [] : scriptData.consonants || []
  const currentWritingChar = writingList[writingIndex] || writingList[0] || { char: 'अ', roman: 'a', example: 'अनार' }

  const playCharAudio = (char) => {
    if (!char) return
    AudioService.speak(char, currentLang)
  }

  const startNewQuizQuestion = () => {
    const allChars = [...(scriptData.vowels || []), ...(scriptData.consonants || [])]
    if (allChars.length === 0) return

    const correct = allChars[Math.floor(Math.random() * allChars.length)]
    const distractors = allChars
      .filter((c) => c.char !== correct.char)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)

    const options = [correct, ...distractors].sort(() => Math.random() - 0.5)

    setQuizItem(correct)
    setQuizOptions(options)
    setQuizFeedback(null)

    playCharAudio(correct.char)
  }

  const handleQuizAnswer = (option) => {
    if (quizFeedback !== null) return

    if (option.char === quizItem.char) {
      setQuizFeedback('correct')
      setScore((s) => s + 1)
      addXP(10)
      addGems(2)
      AudioService.playChime(true)
    } else {
      setQuizFeedback('wrong')
      AudioService.playChime(false)
    }
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    if (tab === 'practice' && !quizItem) {
      startNewQuizQuestion()
    }
  }

  const handleMasteredLetter = (char) => {
    if (!masteredLetters.includes(char)) {
      const updated = [...masteredLetters, char]
      setMasteredLetters(updated)
      try {
        localStorage.setItem(`bl_writing_mastered_${currentLang}`, JSON.stringify(updated))
      } catch {}
      addXP(15)
      addGems(3)
    }
  }

  const handleNextWritingLetter = () => {
    if (writingIndex < writingList.length - 1) {
      setWritingIndex(writingIndex + 1)
    } else {
      setWritingIndex(0)
    }
  }

  const handlePrevWritingLetter = () => {
    if (writingIndex > 0) {
      setWritingIndex(writingIndex - 1)
    } else {
      setWritingIndex(writingList.length - 1)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F5EF] dark:bg-slate-950 flex flex-col md:flex-row pb-20 md:pb-6 text-[#25231F] dark:text-slate-100">
      <AppSidebar />

      <main className="flex-1 min-w-0 md:ml-72 flex flex-col min-h-screen">
        <TopNavbar />

        <div className="p-4 sm:p-6 lg:p-8 space-y-6 w-full max-w-full flex-1">
        {/* Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-6 md:p-8 text-white shadow-xl mb-6">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" /> {t('script_alphabet_mastery')}
            </div>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight mb-2">
              {scriptData.scriptName}
            </h1>
            <p className="text-white/90 text-sm md:text-base max-w-xl">
              Learn authentic letters, vowels (स्वर), consonants (व्यंजन), writing strokes, and native pronunciations for {langMeta.name}.
            </p>
          </div>
          <div className="absolute right-6 -bottom-6 text-8xl md:text-9xl opacity-20 select-none font-bold">
            अ
          </div>
        </div>

        {/* ── 4 Tab Switcher ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm mb-6">
          <button
            onClick={() => handleTabChange('vowels')}
            className={`py-2.5 px-2 rounded-xl font-bold text-xs transition-all cursor-pointer truncate ${
              activeTab === 'vowels'
                ? 'bg-[#0B8F62] text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {scriptData.vowelsTitle || t('vowels_tab')}
          </button>

          <button
            onClick={() => handleTabChange('consonants')}
            className={`py-2.5 px-2 rounded-xl font-bold text-xs transition-all cursor-pointer truncate ${
              activeTab === 'consonants'
                ? 'bg-[#0B8F62] text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {scriptData.consonantsTitle || t('consonants_tab')}
          </button>

          <button
            onClick={() => handleTabChange('writing')}
            className={`py-2.5 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer truncate ${
              activeTab === 'writing'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <PenTool size={13} />
            <span>{t('letter_writing')}</span>
          </button>

          <button
            onClick={() => handleTabChange('practice')}
            className={`py-2.5 px-2 rounded-xl font-bold text-xs transition-all cursor-pointer truncate ${
              activeTab === 'practice'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t('practice_quiz')}
          </button>
        </div>

        {/* ── TAB 1: LETTER WRITING STUDIO ── */}
        {activeTab === 'writing' && (
          <div className="space-y-4">
            {/* Category selection */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setWritingCategory('vowels')
                    setWritingIndex(0)
                  }}
                  className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    writingCategory === 'vowels'
                      ? 'bg-[#0B8F62] text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  Vowels ({scriptData.vowels?.length || 0})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setWritingCategory('consonants')
                    setWritingIndex(0)
                  }}
                  className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    writingCategory === 'consonants'
                      ? 'bg-[#0B8F62] text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  Consonants ({scriptData.consonants?.length || 0})
                </button>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-black text-[#0B8F62] dark:text-[#34D399] bg-[#0B8F62]/10 px-3 py-1.5 rounded-xl">
                <CheckCircle2 size={15} />
                <span>
                  {masteredLetters.length} / {(scriptData.vowels?.length || 0) + (scriptData.consonants?.length || 0)} {t('mastered_count')}
                </span>
              </div>
            </div>

            {/* Letter carousel */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 shadow-sm">
              <div className="flex items-center justify-between gap-2 mb-2 px-1">
                <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  {t('pick_character')} ({writingIndex + 1}/{writingList.length})
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handlePrevWritingLetter}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={handleNextWritingLetter}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {writingList.map((item, idx) => {
                  const isSelected = writingIndex === idx
                  const isMastered = masteredLetters.includes(item.char)
                  return (
                    <button
                      key={idx}
                      onClick={() => setWritingIndex(idx)}
                      className={`relative flex-shrink-0 w-13 h-15 rounded-xl border-2 flex flex-col items-center justify-center transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#0B8F62] bg-[#0B8F62]/15 text-[#0B8F62] dark:text-[#34D399] ring-2 ring-[#0B8F62]/40 shadow-sm scale-105'
                          : isMastered
                          ? 'border-emerald-400/60 bg-emerald-50/50 dark:bg-emerald-950/20 text-slate-900 dark:text-white'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:border-[#0B8F62]/40'
                      }`}
                    >
                      {isMastered && (
                        <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#0B8F62] text-white flex items-center justify-center text-[9px] font-black shadow-xs">
                          ✓
                        </span>
                      )}
                      <span className="text-lg font-black leading-none">{item.char}</span>
                      <span className="text-[9px] font-bold mt-0.5 opacity-70">{item.roman}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Main Canvas Drawing Suite */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <LetterWritingCanvas
                key={`${currentLang}-${currentWritingChar.char}`}
                character={currentWritingChar.char}
                roman={currentWritingChar.roman}
                example={currentWritingChar.example}
                languageId={currentLang}
                currentIndex={writingIndex}
                totalCount={writingList.length}
                showTopBar={false}
                onMastered={handleMasteredLetter}
                onNext={handleNextWritingLetter}
              />
            </div>
          </div>
        )}

        {/* ── TAB 2: PRACTICE QUIZ ── */}
        {activeTab === 'practice' && (
          <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-lg text-center">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-500">{t('letter_recognition_test')}</span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 font-bold text-xs">
                <Award className="w-3.5 h-3.5" /> Score: {score}
              </span>
            </div>

            {quizItem && (
              <div className="space-y-6">
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  {t('listen_choose_letter')}
                </p>

                <button
                  type="button"
                  onClick={() => playCharAudio(quizItem.char)}
                  className="w-20 h-20 mx-auto rounded-3xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-3xl shadow-md hover:scale-110 active:scale-95 transition-all cursor-pointer"
                  title={t('play_pronunciation')}
                >
                  <Volume2 className="w-8 h-8" />
                </button>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  {quizOptions.map((opt, idx) => {
                    const isSelected = quizFeedback !== null
                    const isCorrect = opt.char === quizItem.char

                    let btnStyles =
                      'p-5 rounded-2xl border-2 flex flex-col items-center justify-center transition-all cursor-pointer'

                    if (quizFeedback === 'correct' && isCorrect) {
                      btnStyles += ' border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 shadow-md scale-105'
                    } else if (quizFeedback === 'wrong' && isCorrect) {
                      btnStyles += ' border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-600'
                    } else if (quizFeedback === 'wrong') {
                      btnStyles += ' border-rose-400 bg-rose-50 dark:bg-rose-950/30 text-rose-600 opacity-60'
                    } else {
                      btnStyles += ' border-slate-200 dark:border-slate-800 hover:border-emerald-400 bg-slate-50/50 dark:bg-slate-800/50'
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleQuizAnswer(opt)}
                        disabled={quizFeedback !== null}
                        className={btnStyles}
                      >
                        <span className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-1">
                          {opt.char}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          {opt.roman}
                        </span>
                      </button>
                    )
                  })}
                </div>

                {quizFeedback !== null && (
                  <div className="pt-4 flex flex-col items-center gap-3 animate-in fade-in duration-200">
                    <div className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      {t('word_example_label')} <span className="text-emerald-600 dark:text-emerald-400 font-black">{quizItem.example}</span> ({quizItem.roman})
                    </div>
                    <button
                      onClick={startNewQuizQuestion}
                      className="px-6 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    >
                      {t('next_letter')}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3 & 4: VOWELS / CONSONANTS GRID ── */}
        {(activeTab === 'vowels' || activeTab === 'consonants') && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {(activeTab === 'vowels' ? scriptData.vowels : scriptData.consonants)?.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setSelectedChar(item)
                  playCharAudio(item.char)
                }}
                className="group relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-xl hover:border-emerald-400 dark:hover:border-emerald-500 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col items-center justify-between"
              >
                <div className="w-full flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-[11px] font-mono uppercase font-bold text-emerald-600 dark:text-emerald-400">
                    /{item.roman}/
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      playCharAudio(item.char)
                    }}
                    className="p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:scale-110 transition-all"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white my-2 group-hover:scale-110 transition-transform">
                  {item.char}
                </div>

                <div className="text-center w-full pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {item.example}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  </div>
)
}
