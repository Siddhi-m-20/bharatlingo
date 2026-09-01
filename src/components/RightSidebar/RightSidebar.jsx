import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Trophy, Zap, Heart, RotateCcw, Search, Volume2, Sparkles, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../../services/auth'
import { useProgress } from '../../services/progress'
import { getLanguageById } from '../../data/languages'
import { translateTextLive } from '../../services/freeLanguageApi'
import { speakText } from '../../services/aiService'
import LanguageDropdown from '../LanguageDropdown/LanguageDropdown'
import StreakBadge from '../StreakBadge'
import XPBadge from '../XPBadge'

export default function RightSidebar() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { hearts, restoreHearts } = useProgress()

  const [queryText, setQueryText] = useState('')
  const [translatedResult, setTranslatedResult] = useState(null)
  const [isTranslating, setIsTranslating] = useState(false)

  const learningLang = getLanguageById(user?.learningLanguage) || { name: 'Hindi', flag: '🇮🇳', id: 'hi' }
  const preferredLang = getLanguageById(user?.preferredLanguage || 'en') || { name: 'English', id: 'en' }

  const handleLiveTranslate = async (e) => {
    e.preventDefault()
    if (!queryText.trim()) return

    setIsTranslating(true)
    const res = await translateTextLive(queryText, preferredLang.id, learningLang.id)
    setIsTranslating(false)
    setTranslatedResult(res)
  }

  const handlePlayAudio = (text) => {
    speakText(text, learningLang.id)
  }

  return (
    <aside className="w-80 hidden lg:flex flex-col space-y-6 shrink-0 py-6 pr-4">
      {/* 1. TOP HEADER STATUS BAR (Flag, Streak, XP, Hearts) */}
      <div className="flex items-center justify-between gap-2 p-2 bg-white dark:bg-slate-900 rounded-2xl border-2 border-[#E8E6E0] dark:border-slate-800 shadow-sm">
        <LanguageDropdown />
        <StreakBadge streak={user?.streak || 0} />
        <XPBadge xp={user?.xp || 0} />
        <div className="flex items-center gap-1 bg-[#F7F5EF] dark:bg-slate-800 px-2 py-1 rounded-xl border border-[#E8E6E0] dark:border-slate-700">
          <Heart size={16} className="text-[#D84B42]" fill="#D84B42" />
          <span className="text-xs font-black">{hearts}</span>
          {hearts < 5 && (
            <button
              onClick={restoreHearts}
              className="text-[#0B8F62] hover:scale-110 transition-transform ml-0.5"
              title="Refill Hearts"
            >
              <RotateCcw size={12} />
            </button>
          )}
        </div>
      </div>

      {/* 2. LIVE AI TRANSLATOR & WORD LOOKUP (Powered by MyMemory Free API) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-[#E8E6E0] dark:border-slate-800 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={18} className="text-[#0B8F62]" />
          <h4 className="text-sm font-black text-[#25231F] dark:text-white uppercase tracking-wider">
            Live AI Translator
          </h4>
        </div>
        <p className="text-[11px] text-[#77736B] dark:text-slate-400 mb-3">
          Translate anything into <span className="font-bold text-[#0B8F62]">{learningLang.name}</span> instantly (Free MyMemory API)
        </p>

        <form onSubmit={handleLiveTranslate} className="space-y-2.5">
          <div className="relative">
            <input
              type="text"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder={`Type in ${preferredLang.name}...`}
              className="w-full text-xs font-medium px-3 py-2.5 pr-8 bg-[#F7F5EF] dark:bg-slate-800 border border-[#E8E6E0] dark:border-slate-700 rounded-xl focus:outline-none focus:border-[#0B8F62] dark:text-white"
            />
            <button
              type="submit"
              disabled={isTranslating || !queryText.trim()}
              className="absolute right-2 top-2 text-[#77736B] hover:text-[#0B8F62]"
            >
              <Search size={15} />
            </button>
          </div>
        </form>

        {translatedResult && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-3 bg-[#0B8F62]/10 border border-[#0B8F62]/30 rounded-xl flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-black text-[#0B8F62]">{translatedResult.translatedText}</p>
              <p className="text-[9px] text-[#77736B]">via {translatedResult.provider}</p>
            </div>
            <button
              onClick={() => handlePlayAudio(translatedResult.translatedText)}
              className="p-1.5 bg-white dark:bg-slate-800 rounded-lg text-[#0B8F62] shadow-sm hover:scale-105 transition-transform"
            >
              <Volume2 size={15} />
            </button>
          </motion.div>
        )}
      </div>

      {/* 3. DAILY QUESTS WIDGET */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-[#E8E6E0] dark:border-slate-800 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-black text-[#25231F] dark:text-white uppercase tracking-wider">
            Daily Quests
          </h4>
          <span className="text-[11px] font-bold text-[#F39A45] flex items-center gap-1">
            <Zap size={13} fill="currentColor" />
            <span>XP Boost</span>
          </span>
        </div>

        <div className="space-y-3">
          {/* Quest 1 */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={16} className={user?.xp >= 20 ? 'text-[#2F9E69]' : 'text-[#77736B]'} />
              <div>
                <p className="font-bold text-[#25231F] dark:text-white">Earn 20 XP</p>
                <p className="text-[10px] text-[#77736B]">{user?.xp || 0} / 20 XP</p>
              </div>
            </div>
            <span className="font-extrabold text-[#F39A45]">+10 XP</span>
          </div>

          {/* Quest 2 */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={16} className={(user?.completedLessons || []).length > 0 ? 'text-[#2F9E69]' : 'text-[#77736B]'} />
              <div>
                <p className="font-bold text-[#25231F] dark:text-white">Complete 1 Lesson</p>
                <p className="text-[10px] text-[#77736B]">Practice path</p>
              </div>
            </div>
            <span className="font-extrabold text-[#F39A45]">+15 XP</span>
          </div>
        </div>
      </div>

      {/* 4. LEADERBOARD LEAGUE PREVIEW */}
      <div
        onClick={() => navigate('/leaderboard')}
        className="bg-gradient-to-br from-[#F39A45]/15 via-white to-white dark:from-amber-900/20 dark:to-slate-900 rounded-3xl border-2 border-[#F39A45]/40 p-5 shadow-sm cursor-pointer hover:border-[#F39A45] transition-all group"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#F39A45] text-white flex items-center justify-center shadow-sm">
              <Trophy size={16} fill="currentColor" />
            </div>
            <div>
              <p className="text-xs font-black text-[#25231F] dark:text-white uppercase tracking-wider">Diamond League</p>
              <p className="text-[10px] text-[#77736B]">Rank #{user?.rank || 1} • Top 3 Advance</p>
            </div>
          </div>
        </div>
        <div className="w-full py-2 mt-2 bg-[#F39A45]/10 group-hover:bg-[#F39A45]/20 text-[#F39A45] font-extrabold text-xs text-center rounded-xl transition-colors">
          View Leaderboard →
        </div>
      </div>
    </aside>
  )
}
