import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Palette, Globe, Check, Sun, Moon, Sparkles, Leaf, X } from 'lucide-react'
import { useTheme } from '../../services/themeContext'
import { useAuth } from '../../services/auth'
import { languages } from '../../data/languages'
import LanguageFlag from '../LanguageFlag/LanguageFlag'

const THEMES = [
  { id: 'light', name: 'Light Theme', icon: Sun, color: '#0B8F62', bg: '#F7F5EF' },
  { id: 'dark', name: 'Dark Theme', icon: Moon, color: '#10B981', bg: '#0F172A' },
  { id: 'saffron', name: 'Saffron Theme', icon: Sparkles, color: '#EA580C', bg: '#FFFBEB' },
  { id: 'emerald', name: 'Emerald Theme', icon: Leaf, color: '#059669', bg: '#ECFDF5' },
]

export default function SiteSettingsBar({ inline = false }) {
  const { theme, setTheme, siteLanguage, setSiteLanguage, t } = useTheme()
  const { user, updateUser } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={inline ? 'relative' : 'fixed bottom-5 right-5 z-40'} ref={menuRef}>
      {/* Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={
          inline
            ? 'flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black text-slate-700 dark:text-slate-200 hover:border-emerald-500 transition-all shadow-xs cursor-pointer'
            : 'flex items-center gap-2 px-3.5 py-2.5 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-[#E8E6E0] dark:border-slate-700 shadow-xl rounded-full text-xs font-black text-[#25231F] dark:text-white transition-all hover:shadow-2xl'
        }
        title="Theme & Site Language Options"
      >
        <Palette size={15} className="text-[#0B8F62] dark:text-[#34D399]" />
        <Globe size={15} className="text-[#3B82F6]" />
        <span>Theme & Language</span>
      </motion.button>

      {/* Settings Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: inline ? -10 : 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: inline ? -10 : 15 }}
            className={`absolute w-80 bg-white dark:bg-slate-900 border-2 border-[#E8E6E0] dark:border-slate-800 rounded-3xl shadow-2xl p-5 z-50 overflow-hidden ${
              inline ? 'top-12 right-0' : 'bottom-14 right-0'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E6E0] dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-[#0B8F62] dark:text-[#34D399]" />
                <h3 className="text-sm font-black text-[#25231F] dark:text-white">Theme & Language Options</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[#77736B]"
              >
                <X size={16} />
              </button>
            </div>

            {/* Theme Selector */}
            <div className="py-3">
              <p className="text-[11px] font-black text-[#77736B] dark:text-slate-400 uppercase tracking-wider mb-2">
                {t('theme')} (Color Palette)
              </p>
              <div className="grid grid-cols-2 gap-2">
                {THEMES.map((th) => {
                  const Icon = th.icon
                  const isSelected = theme === th.id
                  return (
                    <button
                      key={th.id}
                      onClick={() => setTheme(th.id)}
                      className={`p-2.5 rounded-2xl border-2 text-left flex items-center gap-2 text-xs font-black transition-all ${
                        isSelected
                          ? 'border-[#0B8F62] bg-[#0B8F62]/15 text-[#0B8F62] dark:text-[#34D399] shadow-sm ring-2 ring-[#0B8F62]/30'
                          : 'border-[#E8E6E0] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#25231F] dark:text-slate-200 hover:border-[#0B8F62]/40'
                      }`}
                    >
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm"
                        style={{ backgroundColor: th.color }}
                      >
                        <Icon size={12} />
                      </div>
                      <span className="truncate flex-1">{th.name}</span>
                      {isSelected && <Check size={13} />}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Site Interface Language */}
            <div className="pt-2 border-t border-[#E8E6E0] dark:border-slate-800">
              <p className="text-[11px] font-black text-[#77736B] dark:text-slate-400 uppercase tracking-wider mb-2">
                {t('site_language')} (UI Text)
              </p>
              <div className="max-h-44 overflow-y-auto space-y-1 pr-1">
                {languages.map((lang) => {
                  const isSelected = siteLanguage === lang.id
                  return (
                    <button
                      key={lang.id}
                      onClick={() => {
                        setSiteLanguage(lang.id)
                        if (user && updateUser) {
                          updateUser({ preferredLanguage: lang.id })
                        }
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-left text-xs transition-all ${
                        isSelected
                          ? 'bg-[#0B8F62]/10 text-[#0B8F62] dark:text-[#34D399] font-black'
                          : 'hover:bg-[#F7F5EF] dark:hover:bg-slate-800 text-[#25231F] dark:text-slate-300 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <LanguageFlag languageId={lang.id} size={18} />
                        <span>{lang.name} ({lang.nativeName})</span>
                      </div>
                      {isSelected && <Check size={14} />}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Footer tip */}
            <div className="mt-3 pt-2.5 border-t border-[#E8E6E0] dark:border-slate-800 text-center text-[11px] text-[#77736B] dark:text-slate-500 font-medium">
              Theme automatically persists in browser
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
