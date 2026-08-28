import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Button from '../../components/Button'
import './Welcome.css'

export default function Welcome() {
  return (
    <div className="min-h-screen bg-[#F7F5EF] flex flex-col">
      <header className="p-4">
        <nav className="container mx-auto flex justify-between items-center">
          <motion.div 
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="w-10 h-10 rounded-full bg-[#0B8F62] flex items-center justify-center text-white font-bold text-xl">
              भा
            </div>
            <span className="text-xl font-bold text-[#0B8F62]">BharatLingo</span>
          </motion.div>
          <Link to="/login">
            <Button variant="ghost" size="small">Log in</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex items-center">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#25231F] mb-6 leading-tight">
                Learn India.{' '}
                <span className="text-[#0B8F62]">One word at a time.</span>
              </h1>
              <p className="text-lg md:text-xl text-[#77736B] mb-8 max-w-lg">
                Play tiny lessons, hear Indian languages, build your vocabulary, and turn practice into confidence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/signup">
                  <Button size="large">Start learning →</Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="large">I already have an account</Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="relative w-full aspect-square max-w-md mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0B8F62]/20 to-[#F39A45]/20 rounded-full blur-3xl" />
                <div className="relative bg-white rounded-3xl shadow-2xl p-8 h-full flex flex-col items-center justify-center">
                  <div className="text-8xl mb-4">🇮🇳</div>
                  <div className="grid grid-cols-3 gap-4 text-4xl mb-6">
                    <span className="animate-bounce" style={{ animationDelay: '0s' }}>हिन्दी</span>
                    <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>मराठी</span>
                    <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>தமிழ்</span>
                    <span className="animate-bounce" style={{ animationDelay: '0.3s' }}>తెలుగు</span>
                    <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>বাংলা</span>
                    <span className="animate-bounce" style={{ animationDelay: '0.5s' }}>ਪੰਜਾਬੀ</span>
                  </div>
                  <p className="text-[#77736B] text-center">9 languages to explore</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <footer className="p-6 text-center text-[#77736B] text-sm">
        <p>© 2024 BharatLingo. Learn Indian languages with confidence.</p>
      </footer>
    </div>
  )
}
