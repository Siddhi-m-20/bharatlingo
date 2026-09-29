import { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home,
  BookA,
  Target,
  Trophy,
  User,
  Settings,
  BookOpen,
  Bot,
  PenTool,
  Gamepad2,
  Mic,
  RotateCcw,
  MoreHorizontal,
  X,
  ChevronRight,
} from 'lucide-react'
import BharatLingoLogo from '../Logo/BharatLingoLogo'
import { useAuth } from '../../services/auth'
import { getLanguageById } from '../../data/languages'
import { useTheme } from '../../services/themeContext'

export default function AppSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t } = useTheme()
  const [showMoreMenu, setShowMoreMenu] = useState(false)

  const learningLang = getLanguageById(user?.learningLanguage) || { name: 'Hindi' }

  const navItems = [
    { to: '/dashboard', label: t('learn') || 'LEARN', icon: Home },
    { to: '/speaking', label: t('speaking') || 'SPEAKING', icon: Mic },
    { to: '/review', label: t('review') || 'REVIEW', icon: RotateCcw },
    { to: '/practice', label: t('practice') || 'PRACTICE', icon: Target },
    { to: '/games', label: t('games') || 'GAMES', icon: Gamepad2 },
    { to: '/stories', label: t('stories') || 'STORIES', icon: BookOpen },
    { to: '/tutor', label: t('tutor') || 'AI TUTOR', icon: Bot },
    { to: '/writing', label: t('writing') || 'WRITING', icon: PenTool },
    { to: '/letters', label: t('letters') || 'SCRIPT / LETTERS', icon: BookA },
    { to: '/leaderboard', label: t('leaderboard') || 'LEADERBOARDS', icon: Trophy },
    { to: '/profile', label: t('profile') || 'PROFILE', icon: User },
    { to: '/settings', label: t('settings') || 'SETTINGS', icon: Settings },
  ]

  // Primary routes on bottom mobile bar
  const primaryMobileRoutes = ['/dashboard', '/speaking', '/review', '/games']
  const isMoreActive = !primaryMobileRoutes.includes(location.pathname)

  // Secondary modules shown inside the "More" bottom drawer on mobile
  const moreNavItems = [
    { to: '/practice', label: t('practice'), icon: Target, desc: t('nav_practice_desc') },
    { to: '/stories', label: t('stories'), icon: BookOpen, desc: t('nav_stories_desc') },
    { to: '/tutor', label: t('tutor'), icon: Bot, desc: t('nav_tutor_desc') },
    { to: '/writing', label: t('writing'), icon: PenTool, desc: t('nav_writing_desc') },
    { to: '/letters', label: t('letters'), icon: BookA, desc: t('nav_letters_desc') },
    { to: '/leaderboard', label: t('leaderboard'), icon: Trophy, desc: t('nav_leaderboard_desc') },
    { to: '/profile', label: t('profile'), icon: User, desc: t('nav_profile_desc') },
    { to: '/settings', label: t('settings'), icon: Settings, desc: t('nav_settings_desc') },
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
        {/* Tab 1: Learn */}
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center p-1 transition-colors ${
              isActive ? 'text-[#0B8F62] dark:text-[#34D399] font-black' : 'text-[#77736B] dark:text-slate-400 font-semibold'
            }`
          }
        >
          <Home size={21} />
          <span className="text-[10px] mt-0.5">{t('learn')}</span>
        </NavLink>

        {/* Tab 2: Speaking */}
        <NavLink
          to="/speaking"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center p-1 transition-colors ${
              isActive ? 'text-[#0B8F62] dark:text-[#34D399] font-black' : 'text-[#77736B] dark:text-slate-400 font-semibold'
            }`
          }
        >
          <Mic size={21} />
          <span className="text-[10px] mt-0.5">{t('speaking')}</span>
        </NavLink>

        {/* Tab 3: Review */}
        <NavLink
          to="/review"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center p-1 transition-colors ${
              isActive ? 'text-[#0B8F62] dark:text-[#34D399] font-black' : 'text-[#77736B] dark:text-slate-400 font-semibold'
            }`
          }
        >
          <RotateCcw size={21} />
          <span className="text-[10px] mt-0.5">{t('review')}</span>
        </NavLink>

        {/* Tab 4: Games */}
        <NavLink
          to="/games"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center p-1 transition-colors ${
              isActive ? 'text-[#0B8F62] dark:text-[#34D399] font-black' : 'text-[#77736B] dark:text-slate-400 font-semibold'
            }`
          }
        >
          <Gamepad2 size={21} />
          <span className="text-[10px] mt-0.5">{t('games')}</span>
        </NavLink>

        {/* Tab 5: More (Expands bottom drawer with all remaining features) */}
        <button
          type="button"
          onClick={() => setShowMoreMenu(true)}
          className={`flex flex-col items-center justify-center p-1 transition-colors cursor-pointer relative ${
            isMoreActive || showMoreMenu
              ? 'text-[#0B8F62] dark:text-[#34D399] font-black'
              : 'text-[#77736B] dark:text-slate-400 font-semibold'
          }`}
        >
          <MoreHorizontal size={21} />
          <span className="text-[10px] mt-0.5">{t('more')}</span>
          {isMoreActive && (
            <span className="absolute top-1 right-2.5 w-1.5 h-1.5 rounded-full bg-[#0B8F62] dark:bg-[#34D399] animate-pulse" />
          )}
        </button>
      </nav>

      {/* ======================================================== */}
      {/* 3. MOBILE "MORE FEATURES" SLIDE-UP DRAWER (Bottom Sheet) */}
      {/* ======================================================== */}
      <AnimatePresence>
        {showMoreMenu && (
          <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMoreMenu(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Slide-up Container */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="relative bg-white dark:bg-slate-900 rounded-t-3xl border-t-2 border-[#E8E6E0] dark:border-slate-800 p-5 pb-8 max-h-[85vh] overflow-y-auto shadow-2xl space-y-4"
            >
              {/* Handle Bar */}
              <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto cursor-pointer" onClick={() => setShowMoreMenu(false)} />

              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-2 border-b border-[#E8E6E0] dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm text-[#25231F] dark:text-white uppercase tracking-wider">
                    {t('more')}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-[10px] font-black text-[#0B8F62] dark:text-emerald-400">
                    {t('modules_count', { count: moreNavItems.length })}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMoreMenu(false)}
                  className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* User Mini Profile Banner */}
              {user && (
                <div className="p-3 bg-[#F7F5EF] dark:bg-slate-800/80 rounded-2xl border border-[#E8E6E0] dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-[#0B8F62] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-[#25231F] dark:text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-[#77736B] dark:text-slate-400 truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 text-xs font-black text-[#0B8F62] dark:text-emerald-400 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-xl border border-[#E8E6E0] dark:border-slate-800">
                    <span>⚡ {user.xp || 0} XP</span>
                  </div>
                </div>
              )}

              {/* Grid of All Additional Features */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                {moreNavItems.map((item, idx) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.to
                  return (
                    <NavLink
                      key={idx}
                      to={item.to}
                      onClick={() => setShowMoreMenu(false)}
                      className={`p-3 rounded-2xl border flex flex-col gap-1.5 transition-all text-left ${
                        isActive
                          ? 'bg-[#0B8F62]/10 dark:bg-[#0B8F62]/20 border-[#0B8F62] text-[#0B8F62] dark:text-[#34D399] shadow-xs'
                          : 'bg-white dark:bg-slate-800/60 border-[#E8E6E0] dark:border-slate-700/80 hover:border-[#0B8F62] text-[#25231F] dark:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className={`p-2 rounded-xl ${
                          isActive
                            ? 'bg-[#0B8F62] text-white'
                            : 'bg-[#F7F5EF] dark:bg-slate-700 text-[#0B8F62] dark:text-emerald-400'
                        }`}>
                          <Icon size={18} />
                        </div>
                        {isActive && (
                          <span className="w-2 h-2 rounded-full bg-[#0B8F62] animate-pulse" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-black truncate">{item.label}</div>
                        <div className="text-[10px] text-[#77736B] dark:text-slate-400 line-clamp-1">{item.desc}</div>
                      </div>
                    </NavLink>
                  )
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
