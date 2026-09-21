/**
 * Games Hub — BharatLingo
 *
 * Dedicated showcase for 10 interactive language-learning games.
 * Real language data, category filtering, adaptive difficulty,
 * and seamless launch into GameArena.
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Gamepad2,
  Sparkles,
  Flame,
  Zap,
  Clock,
  ArrowRight,
  Filter,
  Play,
  ArrowLeft,
  Layers,
} from 'lucide-react'
import { useAuth } from '../../services/auth'
import { useProgress } from '../../services/progress'
import { useTheme } from '../../services/themeContext'
import { getLanguageById } from '../../data/languages'
import { GAME_MODES } from '../../services/gameEngine'
import AppSidebar from '../../components/Navigation/AppSidebar'
import LanguageFlag from '../../components/LanguageFlag/LanguageFlag'

export default function GamesHub() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { streak, gems } = useProgress()
  const { t } = useTheme()

  const [selectedCategory, setSelectedCategory] = useState('all')

  const learningLang = getLanguageById(user?.learningLanguage) || { name: 'Hindi', nativeName: 'हिन्दी', id: 'hi' }
  const preferredLang = getLanguageById(user?.preferredLanguage || 'en') || { name: 'English', id: 'en' }
  const persistedStreak = Number(user?.streak) || Number(streak) || 0

  const categories = [
    { id: 'all', label: 'All Games', count: GAME_MODES.length },
    { id: 'vocabulary', label: 'Vocabulary', count: GAME_MODES.filter((g) => g.category === 'vocabulary').length },
    { id: 'grammar', label: 'Grammar', count: GAME_MODES.filter((g) => g.category === 'grammar').length },
    { id: 'audio', label: 'Listening & Voice', count: GAME_MODES.filter((g) => g.category === 'audio').length },
    { id: 'speed', label: 'Speed & Memory', count: GAME_MODES.filter((g) => g.category === 'speed').length },
    { id: 'reading', label: 'Script & Reading', count: GAME_MODES.filter((g) => g.category === 'reading').length },
  ]

  const filteredModes = selectedCategory === 'all'
    ? GAME_MODES
    : GAME_MODES.filter((g) => g.category === selectedCategory)

  const getDifficultyStars = (level) => {
    switch (level) {
      case 3: return '⭐⭐⭐ Hard'
      case 2: return '⭐⭐ Medium'
      default: return '⭐ Easy'
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F5EF] dark:bg-slate-950 flex pb-20 md:pb-6">
      {/* 1. LEFT SIDEBAR NAVIGATION */}
      <AppSidebar />

      {/* 2. CENTER CONTENT */}
      <main className="flex-1 min-w-0 md:ml-72 px-4 sm:px-6 lg:px-8 py-5">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* ── Top Header Bar ────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 md:p-6 rounded-3xl border border-[#E8E6E0] dark:border-slate-800 shadow-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="p-1.5 -ml-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-[#77736B] dark:text-slate-400 cursor-pointer"
                  title="Back to Dashboard"
                >
                  <ArrowLeft size={18} />
                </button>
                <div className="flex items-center gap-2 text-xs font-black text-[#0B8F62] dark:text-[#34D399] uppercase tracking-wider">
                  <Gamepad2 size={16} />
                  <span>{t('games') || 'Interactive Learning Games'}</span>
                </div>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-[#25231F] dark:text-white">
                Practice {learningLang.name} Through Play
              </h1>
              <p className="text-xs text-[#77736B] dark:text-slate-400 max-w-xl">
                {t('games_subtitle') || 'Play educational games to reinforce vocabulary, grammar, and pronunciation with authentic language data.'}
              </p>
            </div>

            {/* Learner Badges */}
            <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
              <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-[#F7F5EF] dark:bg-slate-800 border border-[#E8E6E0] dark:border-slate-700">
                <LanguageFlag languageId={learningLang.id} size={24} />
                <div>
                  <span className="text-xs font-black text-[#25231F] dark:text-white leading-none block">
                    {learningLang.name}
                  </span>
                  <span className="text-[10px] text-[#77736B] dark:text-slate-400">
                    in {preferredLang.name}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 text-xs font-black">
                <Flame size={15} fill="currentColor" />
                <span>{persistedStreak}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 text-xs font-black">
                <Zap size={15} fill="currentColor" />
                <span>{user?.xp || 0}</span>
              </div>
            </div>
          </div>

          {/* ── Category Filter Pills ─────────────────────────────────── */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#0B8F62] text-white shadow-sm shadow-[#0B8F62]/20'
                    : 'bg-white dark:bg-slate-900 text-[#77736B] dark:text-slate-400 border border-[#E8E6E0] dark:border-slate-800 hover:border-[#0B8F62]/50 hover:text-[#25231F] dark:hover:text-white'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${
                  selectedCategory === cat.id ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'
                }`}>
                  {cat.count}
                </span>
              </button>
            ))}
          </div>

          {/* ── Games Grid ────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredModes.map((mode, idx) => (
              <motion.div
                key={mode.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.04 }}
                className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-[#E8E6E0] dark:border-slate-800 shadow-sm hover:border-[#0B8F62] hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  {/* Card Header: Icon + Category + Difficulty */}
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-[#F7F5EF] dark:bg-slate-800 flex items-center justify-center text-2xl shadow-xs group-hover:scale-110 transition-transform">
                      {mode.icon}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {mode.category}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {getDifficultyStars(mode.difficulty)}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="font-black text-base text-[#25231F] dark:text-white group-hover:text-[#0B8F62] dark:group-hover:text-[#34D399] transition-colors">
                      {mode.title}
                    </h3>
                    <p className="text-xs text-[#77736B] dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
                      {mode.description}
                    </p>
                  </div>
                </div>

                {/* Card Footer: Rewards + Play Action */}
                <div className="pt-4 mt-3 border-t border-[#E8E6E0]/80 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-[#77736B] dark:text-slate-400">
                    <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-black">
                      <Zap size={13} fill="currentColor" />
                      +{mode.baseXP} XP
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400 font-black">
                      <span>💎</span>
                      +{mode.baseGems}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate(`/games/${mode.id}`)}
                    className="py-2 px-3.5 bg-[#0B8F62] hover:bg-[#097b54] text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm shadow-[#0B8F62]/20 group-hover:shadow-md transition-all cursor-pointer active:scale-95"
                  >
                    <span>{t('play_now') || 'Play'}</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </main>
    </div>
  )
}
