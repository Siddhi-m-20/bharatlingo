import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../services/auth'
import { languages } from '../../data/languages'
import Button from '../../components/Button'

export default function Settings() {
  const navigate = useNavigate()
  const { user, updateUser, logout } = useAuth()
  const [soundEffects, setSoundEffects] = useState(true)
  const [pronunciation, setPronunciation] = useState(true)
  const [reducedMotion, setReducedMotion] = useState(false)

  const handleLanguageChange = (field, value) => {
    updateUser({ [field]: value })
  }

  const handleDailyGoalChange = (value) => {
    updateUser({ dailyGoal: parseInt(value) })
  }

  const handleResetProgress = () => {
    if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      updateUser({
        xp: 0,
        streak: 0,
        completedLessons: [],
        vocabulary: {},
        achievements: [],
        level: 'beginner',
      })
      alert('Progress has been reset.')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#F7F5EF]">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              ← Back
            </Button>
            <h1 className="text-xl font-bold text-[#25231F]">Settings</h1>
            <div />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto space-y-6"
        >
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-[#25231F] mb-4">Language Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#25231F] mb-2">
                  Interface Language
                </label>
                <select
                  value={user.preferredLanguage}
                  onChange={(e) => handleLanguageChange('preferredLanguage', e.target.value)}
                  className="w-full px-4 py-2 border border-[#E8E6E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B8F62]"
                >
                  {languages.map((lang) => (
                    <option key={lang.id} value={lang.id}>
                      {lang.name} ({lang.nativeName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#25231F] mb-2">
                  Learning Language
                </label>
                <select
                  value={user.learningLanguage}
                  onChange={(e) => handleLanguageChange('learningLanguage', e.target.value)}
                  className="w-full px-4 py-2 border border-[#E8E6E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B8F62]"
                >
                  {languages.map((lang) => (
                    <option key={lang.id} value={lang.id}>
                      {lang.name} ({lang.nativeName})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-[#25231F] mb-4">Learning Goals</h3>
            
            <div>
              <label className="block text-sm font-medium text-[#25231F] mb-2">
                Daily Goal (XP)
              </label>
              <select
                value={user.dailyGoal}
                onChange={(e) => handleDailyGoalChange(e.target.value)}
                className="w-full px-4 py-2 border border-[#E8E6E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B8F62]"
              >
                <option value={5}>5 minutes (5 XP)</option>
                <option value={10}>10 minutes (10 XP)</option>
                <option value={15}>15 minutes (15 XP)</option>
                <option value={20}>20 minutes (20 XP)</option>
                <option value={30}>30 minutes (30 XP)</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-[#25231F] mb-4">Accessibility</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[#25231F]">Sound Effects</p>
                  <p className="text-sm text-[#77736B]">Play sounds for correct/incorrect answers</p>
                </div>
                <button
                  onClick={() => setSoundEffects(!soundEffects)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    soundEffects ? 'bg-[#0B8F62]' : 'bg-[#E8E6E0]'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      soundEffects ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[#25231F]">Pronunciation Audio</p>
                  <p className="text-sm text-[#77736B]">Play audio for vocabulary words</p>
                </div>
                <button
                  onClick={() => setPronunciation(!pronunciation)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    pronunciation ? 'bg-[#0B8F62]' : 'bg-[#E8E6E0]'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      pronunciation ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[#25231F]">Reduced Motion</p>
                  <p className="text-sm text-[#77736B]">Minimize animations throughout the app</p>
                </div>
                <button
                  onClick={() => setReducedMotion(!reducedMotion)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    reducedMotion ? 'bg-[#0B8F62]' : 'bg-[#E8E6E0]'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      reducedMotion ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-[#25231F] mb-4">Data Management</h3>
            
            <div className="space-y-3">
              <Button variant="danger" onClick={handleResetProgress}>
                Reset Progress
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                Log Out
              </Button>
            </div>
          </div>

          <div className="text-center text-sm text-[#77736B]">
            <p>BharatLingo v1.0.0</p>
            <p>© 2024 BharatLingo. All rights reserved.</p>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
