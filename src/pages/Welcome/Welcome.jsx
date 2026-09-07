import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Volume2 } from 'lucide-react'
import Button from '../../components/Button'
import BharatLingoLogo from '../../components/Logo/BharatLingoLogo'
import BharatMascot from '../../components/Mascot/BharatMascot'
import { languages, getGreetingByLanguageId, TOTAL_LANGUAGES_COUNT } from '../../data/languages'
import { ttsService, AUDIO_STATE } from '../../services/audio/AudioService'
import './Welcome.css'

export default function Welcome() {
  const [selectedLangId, setSelectedLangId] = useState('hi')
  const [isSpeaking, setIsSpeaking] = useState(false)

  const currentGreeting = getGreetingByLanguageId(selectedLangId)

  // Central audio state listener to animate speaker indicator
  useEffect(() => {
    const unsub = ttsService.subscribe((state) => {
      setIsSpeaking(state === AUDIO_STATE.PLAYING || state === AUDIO_STATE.LOADING)
    })
    return () => unsub()
  }, [])

  // Audio greeting playback on language tap or card tap
  const handleLanguageSelect = (langId) => {
    setSelectedLangId(langId)
    const greeting = getGreetingByLanguageId(langId)
    if (greeting?.greeting) {
      ttsService.speak(greeting.greeting, langId)
    }
  }

  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen bg-[#F7F5EF] dark:bg-slate-950 flex flex-col justify-between overflow-x-hidden lg:overflow-hidden transition-colors">
      {/* ── Top Header ────────────────────────────────────────────── */}
      <header className="p-4 sm:px-6 shrink-0">
        <nav className="container mx-auto flex items-center max-w-6xl">
          <Link to="/">
            <BharatLingoLogo size="large" />
          </Link>
        </nav>
      </header>

      {/* ── Main Content (No vertical scroll on desktop) ──────────── */}
      <main className="flex-1 flex items-center py-2 sm:py-4">
        <div className="container mx-auto px-4 max-w-6xl w-full">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
            
            {/* Left Hero Pitch */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4 sm:space-y-5"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B8F62]/10 dark:bg-[#0B8F62]/20 text-[#0B8F62] dark:text-[#34D399] text-xs font-black uppercase tracking-wider">
                <span>🦚</span>
                <span>{TOTAL_LANGUAGES_COUNT} Languages Supported</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#25231F] dark:text-white leading-tight">
                The free, fun way to learn{' '}
                <span className="text-[#0B8F62] dark:text-[#34D399]">Indian Languages!</span>
              </h1>
              
              <p className="text-sm sm:text-base text-[#77736B] dark:text-slate-400 max-w-lg leading-relaxed">
                Meet <span className="font-bold text-[#0B8F62]">Mayur</span>, your friendly peacock companion. Learn Hindi, Marathi, Tamil, Telugu, Bengali, Punjabi, Gujarati & English with bite-sized, gamified lessons!
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link to="/signup">
                  <Button size="large" className="w-full sm:w-auto font-black shadow-lg shadow-[#0B8F62]/30 px-7 py-3 text-base">
                    Get Started Free →
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="large" className="w-full sm:w-auto font-bold px-7 py-3 text-base border-2">
                    I Already Have an Account
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Right Mascot & Interactive Card with Glow */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <div className="relative w-full max-w-md mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0B8F62]/25 to-[#F39A45]/25 rounded-3xl blur-3xl -z-10" />
                <div className="relative bg-white dark:bg-slate-900 border-2 border-[#E8E6E0] dark:border-slate-800 rounded-3xl shadow-xl p-5 sm:p-6 flex flex-col items-center text-center space-y-3.5">
                  
                  {/* Mayur Interactive Extra-Bold Speech Bubble */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedLangId}
                      initial={{ opacity: 0, y: 8, scale: 0.94 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.94 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => handleLanguageSelect(selectedLangId)}
                      className={`relative bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800 border-2 border-[#0B8F62]/40 dark:border-[#34D399]/40 rounded-2xl px-5 py-2.5 shadow-md max-w-[340px] w-full cursor-pointer hover:scale-105 active:scale-95 transition-all ${
                        isSpeaking ? 'ring-4 ring-[#0B8F62]/30 dark:ring-[#34D399]/30' : ''
                      }`}
                      title="Click to hear greeting"
                    >
                      {/* Greeting Text in Native Script (Extra Bold) */}
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-2xl sm:text-3xl font-black text-[#0B8F62] dark:text-[#34D399] tracking-tight">
                          {currentGreeting.greeting}!
                        </span>
                        <Volume2
                          size={18}
                          className={`text-[#0B8F62] dark:text-[#34D399] transition-transform ${
                            isSpeaking ? 'animate-pulse scale-125 text-[#0B8F62]' : ''
                          }`}
                        />
                      </div>

                      {/* Language Source & Transliteration (Bold) */}
                      <div className="flex items-center justify-center gap-1.5 text-xs text-[#25231F] dark:text-slate-100 font-extrabold mt-0.5">
                        <span className="px-2 py-0.5 bg-[#0B8F62]/15 dark:bg-[#0B8F62]/30 text-[#0B8F62] dark:text-[#34D399] rounded-md font-black text-[11px]">
                          {currentGreeting.languageName} ({currentGreeting.nativeName})
                        </span>
                        <span>•</span>
                        <span className="text-slate-600 dark:text-slate-300 font-bold">
                          "{currentGreeting.transliteration}"
                        </span>
                      </div>

                      {/* Bubble Triangle Pointer */}
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-emerald-50 dark:bg-slate-800 border-r-2 border-b-2 border-[#0B8F62]/40 dark:border-[#34D399]/40 transform rotate-45" />
                    </motion.div>
                  </AnimatePresence>

                  {/* Mayur Mascot with Full Feathers */}
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
                    onClick={() => handleLanguageSelect(selectedLangId)}
                    className="py-0.5 cursor-pointer"
                    title="Click Mayur to hear greeting"
                  >
                    <BharatMascot size={160} mood={isSpeaking ? 'speaking' : 'waving'} showFeathers={true} />
                  </motion.div>

                  {/* Instruction */}
                  <p className="text-xs font-bold text-[#77736B] dark:text-slate-400">
                    Tap a language to hear Mayur greet you:
                  </p>

                  {/* Interactive Language Selector Pills for all 8 languages */}
                  <div className="flex flex-wrap justify-center gap-1.5 max-w-sm">
                    {languages.map((lang) => {
                      const isSelected = selectedLangId === lang.id
                      return (
                        <button
                          key={lang.id}
                          type="button"
                          onClick={() => handleLanguageSelect(lang.id)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-[#0B8F62] text-white shadow-md shadow-[#0B8F62]/30 scale-105 ring-2 ring-[#0B8F62]/30'
                              : 'bg-[#F7F5EF] dark:bg-slate-800 text-[#25231F] dark:text-slate-300 hover:bg-[#0B8F62]/15 hover:text-[#0B8F62]'
                          }`}
                        >
                          <span>{lang.nativeName}</span>
                          <span className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-[#77736B] dark:text-slate-400'}`}>
                            {lang.name}
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  {/* Verified Features Footer */}
                  <div className="pt-2 border-t border-[#E8E6E0] dark:border-slate-800 w-full">
                    <p className="text-[11px] text-[#77736B] dark:text-slate-400 font-medium">
                      {TOTAL_LANGUAGES_COUNT} Languages Supported • Smart AI Tutor • Real-Time Voice Practice
                    </p>
                  </div>

                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </main>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="p-3 sm:p-4 text-center text-[#77736B] dark:text-slate-500 text-xs shrink-0">
        <p>© {new Date().getFullYear()} BharatLingo. Learn Indian languages with confidence.</p>
      </footer>
    </div>
  )
}
