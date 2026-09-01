import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check, Globe } from 'lucide-react'
import { languages, getLanguageById } from '../../data/languages'
import { useAuth } from '../../services/auth'
import LanguageFlag from '../LanguageFlag/LanguageFlag'

export default function LanguageDropdown() {
  const { user, updateUser } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const currentLang = getLanguageById(user?.learningLanguage) || languages[0]
  const preferredLang = getLanguageById(user?.preferredLanguage || 'en') || languages[1]

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelectLanguage = (langId) => {
    if (langId !== user?.learningLanguage) {
      updateUser({ learningLanguage: langId })
    }
    setIsOpen(false)
  }

  const handleSelectPreferred = (langId) => {
    if (langId !== user?.preferredLanguage) {
      updateUser({ preferredLanguage: langId })
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#F7F5EF] dark:bg-slate-800 hover:bg-[#E8E6E0] dark:hover:bg-slate-700 border border-[#E8E6E0] dark:border-slate-700 rounded-xl transition-all text-xs font-black text-[#25231F] dark:text-white"
        title="Switch Learning Course"
      >
        <LanguageFlag languageId={currentLang.id} size={18} />
        <span className="truncate max-w-[70px]">{currentLang.name}</span>
        <ChevronDown size={13} className={`text-[#77736B] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className="absolute left-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-2 border-[#E8E6E0] dark:border-slate-800 p-3.5 z-50 overflow-hidden"
          >
            {/* Learning Language Section */}
            <div className="px-2 py-1 text-[11px] font-black text-[#77736B] dark:text-slate-400 uppercase tracking-wider">
              Learning Course
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1 pr-1 mt-1">
              {languages.map((lang) => {
                const isSelected = currentLang.id === lang.id
                return (
                  <button
                    key={lang.id}
                    onClick={() => handleSelectLanguage(lang.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left text-xs transition-colors ${
                      isSelected
                        ? 'bg-[#0B8F62]/10 text-[#0B8F62] dark:text-[#34D399] font-black'
                        : 'hover:bg-[#F7F5EF] dark:hover:bg-slate-800 text-[#25231F] dark:text-slate-200 font-semibold'
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

            {/* Preferred / Source Language Section */}
            <div className="mt-3 pt-2.5 border-t border-[#E8E6E0] dark:border-slate-800">
              <div className="px-2 py-1 text-[11px] font-black text-[#77736B] dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Globe size={13} />
                <span>I Speak (Questions In)</span>
              </div>
              <div className="max-h-36 overflow-y-auto space-y-1 pr-1 mt-1">
                {languages.map((lang) => {
                  const isSelected = preferredLang.id === lang.id
                  return (
                    <button
                      key={lang.id}
                      onClick={() => handleSelectPreferred(lang.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left text-xs transition-colors ${
                        isSelected
                          ? 'bg-[#3B82F6]/10 text-[#3B82F6] font-black'
                          : 'hover:bg-[#F7F5EF] dark:hover:bg-slate-800 text-[#25231F] dark:text-slate-200 font-semibold'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <LanguageFlag languageId={lang.id} size={18} />
                        <span>{lang.name}</span>
                      </div>
                      {isSelected && <Check size={14} />}
                    </button>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
