import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../services/auth'
import Button from '../../components/Button'
import BharatLingoLogo from '../../components/Logo/BharatLingoLogo'
import BharatMascot from '../../components/Mascot/BharatMascot'
import './Welcome.css'

export default function Welcome() {
  const navigate = useNavigate()
  const { loginWithGoogle } = useAuth()
  return (
    <div className="min-h-screen bg-[#F7F5EF] dark:bg-slate-950 flex flex-col transition-colors">
      <header className="p-4">
        <nav className="container mx-auto flex justify-between items-center max-w-6xl">
          <Link to="/">
            <BharatLingoLogo size="medium" />
          </Link>
          <Link to="/login">
            <Button variant="ghost" size="small" className="font-bold">
              Log in
            </Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex items-center">
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Hero Pitch */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#25231F] dark:text-white leading-tight">
                The free, fun way to learn{' '}
                <span className="text-[#0B8F62] dark:text-[#34D399]">Indian Languages!</span>
              </h1>
              <p className="text-base md:text-lg text-[#77736B] dark:text-slate-400 max-w-lg leading-relaxed">
                Meet <span className="font-bold text-[#0B8F62]">Mayur</span>, your friendly language companion. Learn Hindi, Marathi, Tamil, Telugu, Bengali, Punjabi, Gujarati & more with gamified micro-lessons!
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link to="/signup">
                  <Button size="large" className="w-full sm:w-auto font-black shadow-lg shadow-[#0B8F62]/30">
                    Get Started Free →
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="large" className="w-full sm:w-auto font-bold">
                    I Already Have an Account
                  </Button>
                </Link>
              </div>
              <div className="pt-1">
                <button
                  onClick={async () => {
                    await loginWithGoogle()
                    navigate('/dashboard')
                  }}
                  className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Quick Sign-in with Google</span>
                </button>
              </div>
            </motion.div>

            {/* Right Mascot & Script Animation Card */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="relative w-full aspect-square max-w-md mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0B8F62]/20 to-[#F39A45]/20 rounded-full blur-3xl" />
                <div className="relative bg-white dark:bg-slate-900 border-2 border-[#E8E6E0] dark:border-slate-800 rounded-3xl shadow-2xl p-8 h-full flex flex-col items-center justify-center text-center space-y-4">
                  {/* Mayur Mascot */}
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                  >
                    <BharatMascot size={150} mood="waving" />
                  </motion.div>

                  <div className="flex flex-wrap justify-center gap-2 text-xl font-bold text-[#25231F] dark:text-white pt-2">
                    <span className="px-2.5 py-1 bg-[#0B8F62]/10 text-[#0B8F62] rounded-xl text-sm">हिन्दी</span>
                    <span className="px-2.5 py-1 bg-[#3B82F6]/10 text-[#3B82F6] rounded-xl text-sm">मराठी</span>
                    <span className="px-2.5 py-1 bg-[#F39A45]/10 text-[#F39A45] rounded-xl text-sm">தமிழ்</span>
                    <span className="px-2.5 py-1 bg-[#8B5CF6]/10 text-[#8B5CF6] rounded-xl text-sm">తెలుగు</span>
                    <span className="px-2.5 py-1 bg-[#EC4899]/10 text-[#EC4899] rounded-xl text-sm">বাংলা</span>
                    <span className="px-2.5 py-1 bg-[#10B981]/10 text-[#10B981] rounded-xl text-sm">ਪੰਜਾਬੀ</span>
                  </div>
                  <p className="text-xs text-[#77736B] dark:text-slate-400 font-medium">
                    9 Indian Languages • Smart AI Tutor • Real-Time Voice Practice
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <footer className="p-6 text-center text-[#77736B] dark:text-slate-500 text-xs">
        <p>© {new Date().getFullYear()} BharatLingo. Learn Indian languages with confidence.</p>
      </footer>
    </div>
  )
}
