import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../services/auth'
import { achievements } from '../../data/achievements'
import { getLanguageById } from '../../data/languages'
import XPBadge from '../../components/XPBadge'
import StreakBadge from '../../components/StreakBadge'
import Button from '../../components/Button'

export default function Profile() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const language = getLanguageById(user.learningLanguage)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const unlockedAchievements = achievements.filter(achievement => 
    achievement.condition(user)
  )

  return (
    <div className="min-h-screen bg-[#F7F5EF]">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              ← Back
            </Button>
            <h1 className="text-xl font-bold text-[#25231F]">Profile</h1>
            <div />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-20 h-20 rounded-full bg-[#0B8F62] flex items-center justify-center text-white text-3xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#25231F]">{user.name}</h2>
                <p className="text-[#77736B]">{user.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <XPBadge xp={user.xp || 0} showLabel={false} />
                <p className="text-sm text-[#77736B] mt-1">Total XP</p>
              </div>
              <div className="text-center">
                <StreakBadge streak={user.streak || 0} showLabel={false} />
                <p className="text-sm text-[#77736B] mt-1">Streak</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#25231F]">{user.completedLessons?.length || 0}</p>
                <p className="text-sm text-[#77736B]">Lessons</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#25231F]">{Object.keys(user.vocabulary || {}).length}</p>
                <p className="text-sm text-[#77736B]">Words</p>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold text-[#25231F] mb-2">Learning</h3>
              <p className="text-[#77736B]">{language?.name} ({language?.nativeName})</p>
              <p className="text-sm text-[#77736B]">Level: {user.level || 'Beginner'}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-[#25231F] mb-4">Achievements</h3>
            {unlockedAchievements.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[#77736B]">Your first badge is waiting. Complete a lesson to earn it!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {unlockedAchievements.map((achievement) => (
                  <motion.div
                    key={achievement.id}
                    className="bg-[#0B8F62]/10 rounded-xl p-4 text-center"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-4xl mb-2">{achievement.icon}</div>
                    <p className="font-semibold text-[#25231F] text-sm">{achievement.name}</p>
                    <p className="text-xs text-[#77736B]">{achievement.description}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-[#25231F] mb-4">Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[#77736B]">Daily Goal</span>
                <span className="font-semibold text-[#25231F]">{user.dailyGoal} XP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#77736B]">Current Level</span>
                <span className="font-semibold text-[#25231F] capitalize">{user.level || 'Beginner'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#77736B]">Learning Goal</span>
                <span className="font-semibold text-[#25231F] capitalize">{user.goal || 'Not set'}</span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Button variant="danger" className="w-full" onClick={handleLogout}>
              Log Out
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
