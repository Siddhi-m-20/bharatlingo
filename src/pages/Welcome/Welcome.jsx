import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Button from '../../components/Button'
import BharatLingoLogo from '../../components/Logo/BharatLingoLogo'
import BharatMascot from '../../components/Mascot/BharatMascot'
import './Welcome.css'

export default function Welcome() {
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
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
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
                    9 Indian Languages • Free Open APIs • AI Speech
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
