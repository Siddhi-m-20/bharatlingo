import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, BookA, Target, Trophy, User, Settings, BookOpen, Bot, PenTool } from 'lucide-react'
import BharatLingoLogo from '../Logo/BharatLingoLogo'
import AlphabetModal from '../AlphabetModal/AlphabetModal'
import { useAuth } from '../../services/auth'
import { getLanguageById } from '../../data/languages'
import { useTheme } from '../../services/themeContext'

export default function AppSidebar() {
  const location = useLocation()
  const { user } = useAuth()
  const { t } = useTheme()
  const [showAlphabetModal, setShowAlphabetModal] = useState(false)

  const learningLang = getLanguageById(user?.learningLanguage) || { name: 'Hindi' }

  const navItems = [
    { to: '/dashboard', label: t('learn') || 'LEARN', icon: Home },
    { to: '/stories', label: t('stories') || 'STORIES', icon: BookOpen },
    { to: '/tutor', label: t('tutor') || 'AI TUTOR', icon: Bot },
    { to: '/writing', label: 'WRITING', icon: PenTool },
    { to: '/letters', label: t('letters') || 'SCRIPT / LETTERS', icon: BookA },
    { to: '/practice', label: t('practice') || 'PRACTICE', icon: Target },
    { to: '/leaderboard', label: t('leaderboard') || 'LEADERBOARDS', icon: Trophy },
    { to: '/profile', label: t('profile') || 'PROFILE', icon: User },
    { to: '/settings', label: t('settings') || 'SETTINGS', icon: Settings },
  ]

  return (
    <>
      {/* ======================================================== */}
      {/* 1. DESKTOP FIXED LEFT SIDEBAR (Width 256px / 64 Tailwind) */}
      {/* ======================================================== */}
      <aside className="hidden md:flex flex-col justify-between w-72 h-screen fixed left-0 top-0 bg-white dark:bg-slate-900 border-r-2 border-[#E8E6E0] dark:border-slate-800 p-4 z-40 overflow-y-auto">
        <div>
          {/* Logo Brand Header */}
          <NavLink to="/dashboard" className="block px-2 py-2 mb-4 hover:opacity-90 transition-opacity">
            <BharatLingoLogo size="small" />
          </NavLink>

          {/* Vertical Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item, idx) => {
              const Icon = item.icon
              if (item.action === 'alphabet') {
                return (
                  <button
                    key={idx}
                    onClick={() => setShowAlphabetModal(true)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-[#77736B] dark:text-slate-400 hover:bg-[#F7F5EF] dark:hover:bg-slate-800 hover:text-[#25231F] dark:hover:text-white transition-all text-left group"
                  >
                    <Icon size={20} className="text-[#77736B] group-hover:text-[#0B8F62] transition-colors shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                )
              }

              const isActive = location.pathname === item.to
              return (
                <NavLink
                  key={idx}
                  to={item.to}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                    isActive
                      ? 'bg-[#0B8F62]/10 dark:bg-[#0B8F62]/20 border border-[#0B8F62] text-[#0B8F62] dark:text-[#34D399] shadow-sm'
                      : 'text-[#77736B] dark:text-slate-400 hover:bg-[#F7F5EF] dark:hover:bg-slate-800 hover:text-[#25231F] dark:hover:text-white border border-transparent'
                  }`}
                >
                  <Icon size={20} className={`shrink-0 ${isActive ? 'text-[#0B8F62] dark:text-[#34D399]' : 'text-[#77736B]'}`} />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              )
            })}
          </nav>
        </div>

        {/* Footer User Mini-Pill */}
        {user && (
          <div className="mt-4 p-3 bg-[#F7F5EF] dark:bg-slate-800/60 rounded-xl border border-[#E8E6E0] dark:border-slate-700 flex items-center justify-between min-w-0 max-w-full">
            <div className="flex items-center gap-2.5 overflow-hidden min-w-0 flex-1">
              <div className="w-8 h-8 rounded-full bg-[#0B8F62] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="overflow-hidden min-w-0 flex-1">
                <p className="text-xs font-bold text-[#25231F] dark:text-white truncate">{user.name}</p>
                <p className="text-[11px] text-[#77736B] dark:text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* ======================================================== */}
      {/* 2. MOBILE FIXED BOTTOM NAVIGATION BAR (Height 64px)       */}
      {/* ======================================================== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-t-2 border-[#E8E6E0] dark:border-slate-800 flex items-center justify-around px-2 z-40 shadow-lg">
        {navItems.slice(0, 5).map((item, idx) => {
          const Icon = item.icon
          if (item.action === 'alphabet') {
            return (
              <button
                key={idx}
                onClick={() => setShowAlphabetModal(true)}
                className="flex flex-col items-center justify-center p-1 text-[#77736B] dark:text-slate-400"
              >
                <Icon size={22} />
                <span className="text-[10px] font-bold mt-0.5">Letters</span>
              </button>
            )
          }

          const isActive = location.pathname === item.to
          return (
            <NavLink
              key={idx}
              to={item.to}
              className={`flex flex-col items-center justify-center p-1 transition-colors ${
                isActive ? 'text-[#0B8F62] dark:text-[#34D399] font-black' : 'text-[#77736B] dark:text-slate-400 font-semibold'
              }`}
            >
              <Icon size={22} />
              <span className="text-[10px] mt-0.5">{item.label.split(' ')[0]}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* Alphabet / Script Explorer Modal */}
      <AlphabetModal
        languageId={user?.learningLanguage || 'hi'}
        languageName={learningLang.name}
        isOpen={showAlphabetModal}
        onClose={() => setShowAlphabetModal(false)}
      />
    </>
  )
}
