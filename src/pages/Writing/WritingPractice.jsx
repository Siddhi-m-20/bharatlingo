import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../services/auth'
import { useProgress } from '../../services/progress'
import { useTheme } from '../../services/themeContext'
import { alphabetDataByLanguage } from '../../data/alphabets'
import { getLanguageById, languages } from '../../data/languages'
import AppSidebar from '../../components/Navigation/AppSidebar'
import RightSidebar from '../../components/RightSidebar/RightSidebar'
import LanguageFlag from '../../components/LanguageFlag/LanguageFlag'
import LetterWritingCanvas from '../../components/WritingPad/LetterWritingCanvas'
import Button from '../../components/Button'
import {
  PenTool,
  Sparkles,
  Award,
  Zap,
  BookOpen,
  Volume2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react'

export default function WritingPractice() {
  const { user, updateUser } = useAuth()
  const { addXP, addGems } = useProgress()

  const currentLang = user?.learningLanguage || 'hi'
  const langMeta = getLanguageById(currentLang) || { name: 'Hindi', nativeName: 'हिन्दी' }
  const scriptData = alphabetDataByLanguage[currentLang] || alphabetDataByLanguage['hi']

  const [activeCategory, setActiveCategory] = useState('vowels') // 'vowels' | 'consonants'
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [masteredLetters, setMasteredLetters] = useState(() => {
    try {
      const stored = localStorage.getItem(`bl_writing_mastered_${currentLang}`)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  const currentList = activeCategory === 'vowels' ? scriptData.vowels || [] : scriptData.consonants || []
  const currentChar = currentList[selectedIndex] || currentList[0] || { char: 'अ', roman: 'a', example: 'अनार' }

  const handleMastered = (char, score) => {
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

  const handleNextLetter = () => {
    if (selectedIndex < currentList.length - 1) {
      setSelectedIndex(selectedIndex + 1)
    } else {
      setSelectedIndex(0)
    }
  }

  const handlePrevLetter = () => {
    if (selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1)
    } else {
      setSelectedIndex(currentList.length - 1)
    }
  }

  const navigate = useNavigate()
  const { t } = useTheme()
  const isWritingSupported = currentLang === 'hi' || currentLang === 'mr'

  if (!isWritingSupported) {
    return (
      <div className="min-h-screen bg-[#F7F5EF] dark:bg-slate-950 flex justify-center pb-20 md:pb-0 text-[#25231F] dark:text-slate-100">
        {/* 1. LEFT SIDEBAR */}
        <AppSidebar />

        {/* 2. CENTER CONTENT */}
        <main className="flex-1 max-w-[680px] md:ml-72 px-4 py-6 md:py-8 space-y-6">
          {/* Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-6 md:p-8 text-white shadow-xl">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider mb-3">
                <PenTool className="w-3.5 h-3.5" /> {t('writing_practice') || 'Writing Practice'}
              </div>
              <h1 className="text-2xl md:text-4xl font-black tracking-tight mb-2">
                {t('writing_practice') || 'Writing Practice'}: {langMeta.name}
              </h1>
              <p className="text-white/90 text-sm md:text-base max-w-xl">
                {scriptData.scriptName}
              </p>
            </div>
            <div className="absolute right-4 -bottom-4 text-8xl md:text-9xl opacity-20 select-none font-bold">
              ✍️
            </div>
          </div>

          {/* Polished Empty / Availability Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-[#E8E6E0] dark:border-slate-800 p-8 sm:p-12 text-center shadow-sm space-y-6">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center text-4xl shadow-inner">
              📝
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h2 className="text-xl sm:text-2xl font-black text-[#25231F] dark:text-white">
                {t('writing_unavailable_msg') || 'Interactive writing practice is not yet available for this script.'}
              </h2>
              <p className="text-sm text-[#77736B] dark:text-slate-400 font-medium">
                {t('writing_practice_alt_msg') || 'Practice reading and speaking meanwhile.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                onClick={() => navigate('/letters')}
                className="w-full sm:w-auto justify-center"
              >
                <BookOpen size={16} className="mr-1.5" />
                {t('explore_alphabet') || 'Explore Alphabet'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate('/dashboard')}
                className="w-full sm:w-auto justify-center"
              >
                {t('back_to_dashboard') || 'Back to Dashboard'}
              </Button>
            </div>
          </div>
        </main>

        {/* 3. RIGHT SIDEBAR */}
        <RightSidebar />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F5EF] dark:bg-slate-950 flex justify-center pb-20 md:pb-0 text-[#25231F] dark:text-slate-100">
      {/* 1. LEFT SIDEBAR */}
      <AppSidebar />

      {/* 2. CENTER CONTENT */}
      <main className="flex-1 max-w-[680px] md:ml-72 px-4 py-6 md:py-8 space-y-6">
        {/* Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-6 md:p-8 text-white shadow-xl">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider mb-3">
              <PenTool className="w-3.5 h-3.5" /> Interactive Script & Calligraphy Studio
            </div>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight mb-2">
              Writing Practice: {scriptData.scriptName}
            </h1>
            <p className="text-white/90 text-sm md:text-base max-w-xl">
              Trace and write authentic native letters for {langMeta.name}. Get instant stroke accuracy feedback and audio pronunciation.
            </p>
          </div>
          <div className="absolute right-4 -bottom-4 text-8xl md:text-9xl opacity-20 select-none font-bold">
            ✍️
          </div>
        </div>

        {/* ── Category & Stats Switcher ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-3xl border-2 border-[#E8E6E0] dark:border-slate-800 shadow-sm">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                setActiveCategory('vowels')
                setSelectedIndex(0)
              }}
              className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                activeCategory === 'vowels'
                  ? 'bg-[#0B8F62] text-white shadow-md shadow-[#0B8F62]/20'
                  : 'text-[#77736B] dark:text-slate-400 hover:bg-[#F7F5EF] dark:hover:bg-slate-800'
              }`}
            >
              स्वर (Vowels) • {scriptData.vowels?.length || 0}
            </button>
            <button
              onClick={() => {
                setActiveCategory('consonants')
                setSelectedIndex(0)
              }}
              className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                activeCategory === 'consonants'
                  ? 'bg-[#0B8F62] text-white shadow-md shadow-[#0B8F62]/20'
                  : 'text-[#77736B] dark:text-slate-400 hover:bg-[#F7F5EF] dark:hover:bg-slate-800'
              }`}
            >
              व्यंजन (Consonants) • {scriptData.consonants?.length || 0}
            </button>
          </div>

          {/* Mastered Counter & Progress */}
          <div className="flex items-center gap-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-4 py-2 rounded-2xl">
            <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div className="flex flex-col text-left">
              <span className="text-xs font-black text-emerald-800 dark:text-emerald-300">
                {masteredLetters.length} of {(scriptData.vowels?.length || 0) + (scriptData.consonants?.length || 0)} Mastered
              </span>
              <span className="text-[10px] font-bold text-emerald-600/80 dark:text-emerald-400/80">
                {Math.round((masteredLetters.length / Math.max(1, (scriptData.vowels?.length || 0) + (scriptData.consonants?.length || 0))) * 100)}% Complete
              </span>
            </div>
          </div>
        </div>

        {/* ── Letter Horizontal Scroll Selector ── */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-[#E8E6E0] dark:border-slate-800 p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-3 px-1">
            <div>
              <h3 className="text-xs sm:text-sm font-black text-[#25231F] dark:text-white uppercase tracking-wider">
                Select Character ({selectedIndex + 1} of {currentList.length})
              </h3>
              <p className="text-[11px] text-[#77736B] dark:text-slate-400 font-medium">
                Tap any letter to trace with guided stroke auto-correction
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrevLetter}
                className="p-2 rounded-xl border border-[#E8E6E0] dark:border-slate-800 text-[#77736B] hover:text-[#25231F] hover:bg-[#F7F5EF] dark:hover:bg-slate-800 cursor-pointer transition-colors"
                title="Previous letter"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={handleNextLetter}
                className="p-2 rounded-xl border border-[#E8E6E0] dark:border-slate-800 text-[#77736B] hover:text-[#25231F] hover:bg-[#F7F5EF] dark:hover:bg-slate-800 cursor-pointer transition-colors"
                title="Next letter"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 pt-1 scrollbar-thin">
            {currentList.map((item, idx) => {
              const isSelected = selectedIndex === idx
              const isMastered = masteredLetters.includes(item.char)
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedIndex(idx)}
                  className={`relative flex-shrink-0 w-14 h-16 rounded-2xl border-2 flex flex-col items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#0B8F62] bg-[#0B8F62]/15 text-[#0B8F62] dark:text-[#34D399] ring-2 ring-[#0B8F62]/40 shadow-md scale-105'
                      : isMastered
                      ? 'border-emerald-400/60 bg-emerald-50/50 dark:bg-emerald-950/20 text-[#25231F] dark:text-white hover:border-[#0B8F62]'
                      : 'border-[#E8E6E0] dark:border-slate-800 bg-[#F7F5EF]/60 dark:bg-slate-800/60 text-[#77736B] dark:text-slate-300 hover:border-[#0B8F62]/40'
                  }`}
                >
                  {isMastered && (
                    <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#0B8F62] text-white flex items-center justify-center text-[9px] font-black shadow-xs">
                      ✓
                    </span>
                  )}
                  <span className="text-xl font-black leading-none">{item.char}</span>
                  <span className="text-[10px] font-bold mt-0.5 opacity-80">{item.roman}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Main Canvas Drawing Suite (Duolingo Style) ── */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-[#E8E6E0] dark:border-slate-800 p-6 shadow-sm">
          <LetterWritingCanvas
            key={`${currentLang}-${currentChar.char}`}
            character={currentChar.char}
            roman={currentChar.roman}
            example={currentChar.example}
            languageId={currentLang}
            currentIndex={selectedIndex}
            totalCount={currentList.length}
            showTopBar={false}
            onMastered={handleMastered}
            onNext={handleNextLetter}
          />
        </div>
      </main>

      {/* 3. RIGHT SIDEBAR */}
      <RightSidebar />
    </div>
  )
}
