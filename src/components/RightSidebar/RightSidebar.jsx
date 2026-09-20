import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Trophy, Zap, Search, Volume2, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../services/auth'
import { useProgress } from '../../services/progress'
import { useTheme } from '../../services/themeContext'
import { getLanguageById } from '../../data/languages'
import { translateTextLive } from '../../services/freeLanguageApi'
import { speakText } from '../../services/aiService'
import { checkIsAdmin } from '../../services/adminService'
import LanguageDropdown from '../LanguageDropdown/LanguageDropdown'
import StreakBadge from '../StreakBadge'
import XPBadge from '../XPBadge'

export default function RightSidebar({ onStreakClick }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { gems, quests, claimQuestReward } = useProgress()
  const { t } = useTheme()

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
    <aside className="w-80 hidden lg:flex flex-col space-y-4 shrink-0 py-6 pr-4">
      {/* 1. TOP HEADER STATUS BAR (Flag, Streak, XP, Gems) */}
      <div className="flex items-center justify-between gap-1.5 p-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm w-full min-w-0">
        <LanguageDropdown />
        <StreakBadge streak={user?.streak || 0} onClick={onStreakClick} />
        <XPBadge xp={user?.xp || 0} />
        <div className="flex items-center gap-1 bg-cyan-50 dark:bg-cyan-950/60 px-2.5 py-1 rounded-xl border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300 shrink-0 font-black text-xs">
          <span className="text-xs">💎</span>
          <span>{user?.gems !== undefined ? Number(user.gems) : gems}</span>
        </div>
      </div>

      {/* 2. LIVE AI TRANSLATOR & WORD LOOKUP */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Sparkles size={15} className="text-emerald-500" />
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            {t('live_translator') || 'Live AI Translator'}
          </h4>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2.5">
          Translate into <span className="font-bold text-emerald-600 dark:text-emerald-400">{learningLang.name}</span>
        </p>

        <form onSubmit={handleLiveTranslate} className="space-y-2">
          <div className="relative">
            <input
              type="text"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder={t('translator_placeholder') || `Type in ${preferredLang.name}...`}
              className="w-full text-xs font-medium px-3 py-2 pr-8 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-emerald-500 dark:text-white"
            />
            <button
              type="submit"
              disabled={isTranslating || !queryText.trim()}
              className="absolute right-2 top-2 text-slate-400 hover:text-emerald-600"
            >
              <Search size={14} />
            </button>
          </div>
        </form>

        {translatedResult && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2.5 p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">{translatedResult.translatedText}</p>
              <p className="text-[9px] text-slate-400">via {translatedResult.provider}</p>
            </div>
            <button
              onClick={() => handlePlayAudio(translatedResult.translatedText)}
              className="p-1 bg-white dark:bg-slate-800 rounded-md text-emerald-600 shadow-sm hover:scale-105 transition-transform"
            >
              <Volume2 size={14} />
            </button>
          </motion.div>
        )}
      </div>

      {/* 3. DAILY QUESTS WIDGET */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            {t('quests') || 'Daily Quests'}
          </h4>
          <span className="text-[10px] font-bold text-amber-500 flex items-center gap-1">
            <Zap size={12} fill="currentColor" />
            <span>Rewards</span>
          </span>
        </div>

        <div className="space-y-2.5">
          {quests.map((quest) => (
            <div key={quest.id} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2
                  size={15}
                  className={quest.completed ? 'text-emerald-500 shrink-0' : 'text-slate-300 dark:text-slate-600 shrink-0'}
                />
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 leading-snug">{quest.title}</p>
                  <p className="text-[10px] text-slate-400">
                    {quest.current} / {quest.target}
                  </p>
                </div>
              </div>

              {quest.completed && !quest.claimed ? (
                <button
                  onClick={() => claimQuestReward(quest.id)}
                  className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-[10px] shadow-sm hover:scale-105 active:scale-95 transition-all shrink-0"
                >
                  {t('claim_reward') || 'Claim!'}
                </button>
              ) : quest.claimed ? (
                <span className="text-[10px] font-bold text-emerald-500 shrink-0">{t('claimed') || 'Done ✓'}</span>
              ) : (
                <span className="font-bold text-amber-500 text-[10px] shrink-0">
                  +{quest.rewardXP} XP
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4. LEADERBOARD LEAGUE PREVIEW */}
      <div
        onClick={() => navigate('/leaderboard')}
        className="bg-gradient-to-br from-amber-500/10 via-white to-white dark:from-amber-900/20 dark:to-slate-900 rounded-2xl border border-amber-500/30 p-4 shadow-sm cursor-pointer hover:border-amber-500 transition-all group"
      >
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-sm">
              <Trophy size={14} fill="currentColor" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">{t('leaderboard') || 'Leaderboard'}</p>
              <p className="text-[10px] text-slate-400">
                {user?.rank ? `Rank #${user.rank}` : `${user?.xp || 0} XP`} • {t('rank_top_3') || 'Top 3 Advance'}
              </p>
            </div>
          </div>
        </div>
        <div className="w-full py-1.5 mt-1.5 bg-amber-500/10 group-hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-xs text-center rounded-lg transition-colors">
          {t('view_leaderboard') || 'View Leaderboard →'}
        </div>
      </div>

      {/* 5. ADMIN CONSOLE ACCESS (Admins Only) */}
      {checkIsAdmin(user) && (
        <div
          onClick={() => navigate('/admin')}
          className="bg-gradient-to-br from-emerald-600/15 via-teal-900/10 to-slate-900/80 rounded-2xl border border-emerald-500/30 p-3.5 shadow-sm cursor-pointer hover:border-emerald-400 transition-all group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <ShieldCheck size={14} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Admin Console</p>
              <p className="text-[10px] text-slate-400">System Telemetry & Content Health</p>
            </div>
          </div>
          <div className="w-full py-1 mt-2 bg-emerald-500/10 group-hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-[11px] text-center rounded-lg transition-colors">
            Open Admin Dashboard →
          </div>
        </div>
      )}
    </aside>
  )
}
