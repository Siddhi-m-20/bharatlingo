import { useState } from 'react'
import { Flame, Zap, Sparkles, Trophy } from 'lucide-react'
import { useAuth } from '../../services/auth'
import { useProgress } from '../../services/progress'
import { useTheme } from '../../services/themeContext'
import LanguageDropdown from '../LanguageDropdown/LanguageDropdown'
import StreakBadge from '../StreakBadge'
import XPBadge from '../XPBadge'
import SiteSettingsBar from '../SiteSettingsBar/SiteSettingsBar'

export default function TopNavbar({ onStreakClick }) {
  const { user } = useAuth()
  const { streak, gems } = useProgress()
  const { t } = useTheme()

  const persistedStreak = Number(user?.streak) || Number(streak) || 0

  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-[#E8E6E0] dark:border-slate-800 px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-xs transition-colors">
      {/* Left: Target Language Selector */}
      <div className="flex items-center gap-3 min-w-0">
        <LanguageDropdown />
      </div>

      {/* Right: Streak, XP, Gems, Theme & Language Settings */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <StreakBadge streak={persistedStreak} onClick={onStreakClick} />
        <XPBadge xp={user?.xp || 0} />
        
        {/* Gems Badge */}
        <div className="flex items-center gap-1.5 bg-cyan-50 dark:bg-cyan-950/60 px-3 py-1.5 rounded-xl border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300 font-black text-xs shrink-0 shadow-xs">
          <span>💎</span>
          <span>{user?.gems !== undefined ? Number(user.gems) : gems}</span>
        </div>

        {/* Integrated Site Settings (Theme & UI Language) */}
        <SiteSettingsBar inline={true} />
      </div>
    </header>
  )
}
