import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../services/auth'
import { useProgress } from '../../services/progress'
import { alphabetDataByLanguage } from '../../data/alphabets'
import { getLanguageById, languages } from '../../data/languages'
import AppSidebar from '../../components/Navigation/AppSidebar'
import RightSidebar from '../../components/RightSidebar/RightSidebar'
import LanguageFlag from '../../components/LanguageFlag/LanguageFlag'
import LetterWritingCanvas from '../../components/WritingPad/LetterWritingCanvas'
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

  return (
    <div className="min-h-screen bg-[#F7F5EF] dark:bg-slate-950 flex justify-center pb-20 md:pb-0 text-[#25231F] dark:text-slate-100">
      {/* 1. LEFT SIDEBAR */}
      <AppSidebar />

      {/* 2. CENTER CONTENT */}
      <main className="flex-1 max-w-[680px] md:ml-64 px-4 py-6 md:py-8 space-y-6">
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border-2 border-[#E8E6E0] dark:border-slate-800 shadow-sm">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                setActiveCategory('vowels')
                setSelectedIndex(0)
              }}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-black transition-all ${
                activeCategory === 'vowels'
                  ? 'bg-[#0B8F62] text-white shadow-md'
                  : 'text-[#77736B] dark:text-slate-400 hover:bg-[#F7F5EF] dark:hover:bg-slate-800'
              }`}
            >
              स्वर (Vowels) - {scriptData.vowels?.length || 0}
            </button>
            <button
              onClick={() => {
                setActiveCategory('consonants')
                setSelectedIndex(0)
              }}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-black transition-all ${
                activeCategory === 'consonants'
                  ? 'bg-[#0B8F62] text-white shadow-md'
                  : 'text-[#77736B] dark:text-slate-400 hover:bg-[#F7F5EF] dark:hover:bg-slate-800'
              }`}
            >
              व्यंजन (Consonants) - {scriptData.consonants?.length || 0}
            </button>
          </div>

          {/* Mastered Counter */}
          <div className="flex items-center gap-1.5 text-xs font-black text-[#0B8F62] dark:text-[#34D399] bg-[#0B8F62]/10 px-3 py-1.5 rounded-xl">
            <CheckCircle2 size={14} />
            <span>
              {masteredLetters.length} / {(scriptData.vowels?.length || 0) + (scriptData.consonants?.length || 0)} Mastered
            </span>
          </div>
        </div>

        {/* ── Letter Horizontal Scroll Selector ── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-[#E8E6E0] dark:border-slate-800 p-3 shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-2 px-1">
            <span className="text-xs font-black text-[#77736B] dark:text-slate-400 uppercase tracking-wider">
              Select Character to Practice ({selectedIndex + 1} of {currentList.length})
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevLetter}
                className="p-1 rounded-lg border border-[#E8E6E0] dark:border-slate-800 text-[#77736B] hover:text-[#25231F]"
                title="Previous letter"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={handleNextLetter}
                className="p-1 rounded-lg border border-[#E8E6E0] dark:border-slate-800 text-[#77736B] hover:text-[#25231F]"
                title="Next letter"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {currentList.map((item, idx) => {
              const isSelected = selectedIndex === idx
              const isMastered = masteredLetters.includes(item.char)
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedIndex(idx)}
                  className={`flex-shrink-0 w-12 h-14 rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${
                    isSelected
                      ? 'border-[#0B8F62] bg-[#0B8F62]/10 text-[#0B8F62] dark:text-[#34D399] ring-2 ring-[#0B8F62]/40 shadow-sm scale-105'
                      : isMastered
                      ? 'border-[#0B8F62]/40 bg-white dark:bg-slate-800 text-[#25231F] dark:text-white'
                      : 'border-[#E8E6E0] dark:border-slate-800 bg-[#F7F5EF] dark:bg-slate-800/60 text-[#77736B] dark:text-slate-300 hover:border-[#0B8F62]/40'
                  }`}
                >
                  <span className="text-lg font-black leading-none">{item.char}</span>
                  <span className="text-[9px] font-bold mt-0.5 opacity-80">{item.roman}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Main Canvas Drawing Suite ── */}
        <LetterWritingCanvas
          key={`${currentLang}-${currentChar.char}`}
          character={currentChar.char}
          roman={currentChar.roman}
          example={currentChar.example}
          languageId={currentLang}
          onMastered={handleMastered}
          onNext={handleNextLetter}
        />
      </main>

      {/* 3. RIGHT SIDEBAR */}
      <RightSidebar />
    </div>
  )
}
