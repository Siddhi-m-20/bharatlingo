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
  const isWritingSupported = Boolean(scriptData && (scriptData.vowels?.length || scriptData.consonants?.length))

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
      <main className="flex-1 max-w-[640px] md:ml-72 px-4 py-4 md:py-5 space-y-3.5">
        {/* Compact Banner */}
        <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-4 sm:px-5 py-3 rounded-2xl text-white shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-base font-bold shadow-inner shrink-0">
              ✍️
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black tracking-tight leading-tight">
                {t('writing_practice') || 'Writing Practice'}: {scriptData.scriptName}
              </h1>
              <p className="text-white/80 text-[11px] hidden sm:block">
                Trace authentic letters for {langMeta.name} with guided auto-correction
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-2.5 py-1 rounded-xl shrink-0">
            <CheckCircle2 size={13} className="text-emerald-300 shrink-0" />
            <span className="text-xs font-black text-white">
              {masteredLetters.length} / {(scriptData.vowels?.length || 0) + (scriptData.consonants?.length || 0)}
            </span>
          </div>
        </div>

        {/* ── Integrated Category & Character Carousel Card ── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-[#E8E6E0] dark:border-slate-800 p-3.5 shadow-sm space-y-2.5">
          {/* Top Controls Row */}
          <div className="flex items-center justify-between gap-2">
            {/* Category Tabs */}
            <div className="flex items-center gap-1.5 bg-[#F7F5EF] dark:bg-slate-800/80 p-1 rounded-xl">
              <button
                onClick={() => {
                  setActiveCategory('vowels')
                  setSelectedIndex(0)
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  activeCategory === 'vowels'
                    ? 'bg-[#0B8F62] text-white shadow-xs'
                    : 'text-[#77736B] dark:text-slate-400 hover:text-[#25231F] dark:hover:text-white'
                }`}
              >
                स्वर (Vowels) • {scriptData.vowels?.length || 0}
              </button>
              <button
                onClick={() => {
                  setActiveCategory('consonants')
                  setSelectedIndex(0)
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  activeCategory === 'consonants'
                    ? 'bg-[#0B8F62] text-white shadow-xs'
                    : 'text-[#77736B] dark:text-slate-400 hover:text-[#25231F] dark:hover:text-white'
                }`}
              >
                व्यंजन (Consonants) • {scriptData.consonants?.length || 0}
              </button>
            </div>

            {/* Carousel Navigation Arrows */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold text-[#77736B] dark:text-slate-400 hidden sm:inline mr-1">
                {selectedIndex + 1} of {currentList.length}
              </span>
              <button
                onClick={handlePrevLetter}
                className="p-1.5 rounded-lg border border-[#E8E6E0] dark:border-slate-800 text-[#77736B] hover:text-[#25231F] hover:bg-[#F7F5EF] dark:hover:bg-slate-800 cursor-pointer transition-colors"
                title="Previous letter"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={handleNextLetter}
                className="p-1.5 rounded-lg border border-[#E8E6E0] dark:border-slate-800 text-[#77736B] hover:text-[#25231F] hover:bg-[#F7F5EF] dark:hover:bg-slate-800 cursor-pointer transition-colors"
                title="Next letter"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Character Carousel (Scrollbar hidden) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {currentList.map((item, idx) => {
              const isSelected = selectedIndex === idx
              const isMastered = masteredLetters.includes(item.char)
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedIndex(idx)}
                  className={`relative flex-shrink-0 w-11 h-13 sm:w-12 sm:h-14 rounded-xl border-2 flex flex-col items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#0B8F62] bg-[#0B8F62]/15 text-[#0B8F62] dark:text-[#34D399] ring-2 ring-[#0B8F62]/40 shadow-xs scale-102'
                      : isMastered
                      ? 'border-emerald-400/60 bg-emerald-50/50 dark:bg-emerald-950/20 text-[#25231F] dark:text-white hover:border-[#0B8F62]'
                      : 'border-[#E8E6E0] dark:border-slate-800 bg-[#F7F5EF]/60 dark:bg-slate-800/60 text-[#77736B] dark:text-slate-300 hover:border-[#0B8F62]/40'
                  }`}
                >
                  {isMastered && (
                    <span className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full bg-[#0B8F62] text-white flex items-center justify-center text-[8px] font-black">
                      ✓
                    </span>
                  )}
                  <span className="text-lg font-black leading-none">{item.char}</span>
                  <span className="text-[9px] font-bold mt-0.5 opacity-80 leading-none">{item.roman}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Main Canvas Drawing Suite ── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-[#E8E6E0] dark:border-slate-800 p-4 sm:p-5 shadow-sm">
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
