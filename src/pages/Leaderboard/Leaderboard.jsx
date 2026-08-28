import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../services/auth'
import Button from '../../components/Button'

const DEMO_USERS = [
  { id: 1, name: 'Aarav', xp: 820, streak: 12 },
  { id: 2, name: 'Meera', xp: 760, streak: 8 },
  { id: 3, name: 'Siddhi', xp: 710, streak: 15 },
  { id: 4, name: 'Rohan', xp: 640, streak: 5 },
  { id: 5, name: 'Priya', xp: 590, streak: 7 },
  { id: 6, name: 'Arjun', xp: 520, streak: 3 },
  { id: 7, name: 'Kavya', xp: 480, streak: 10 },
  { id: 8, name: 'Dev', xp: 420, streak: 6 },
]

export default function Leaderboard() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const allUsers = [...DEMO_USERS, { id: user.id, name: user.name, xp: user.xp || 0, streak: user.streak || 0 }]
    .sort((a, b) => b.xp - a.xp)

  const userRank = allUsers.findIndex(u => u.id === user.id) + 1

  return (
    <div className="min-h-screen bg-[#F7F5EF]">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              ← Back
            </Button>
            <h1 className="text-xl font-bold text-[#25231F]">Weekly League</h1>
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
            <div className="text-center mb-6">
              <p className="text-sm text-[#77736B] mb-1">Your rank</p>
              <p className="text-4xl font-bold text-[#0B8F62]">#{userRank}</p>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-[#25231F]">{user.xp || 0}</p>
                <p className="text-sm text-[#77736B]">XP</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#25231F]">{user.streak || 0}</p>
                <p className="text-sm text-[#77736B]">Day Streak</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#25231F]">{user.completedLessons?.length || 0}</p>
                <p className="text-sm text-[#77736B]">Lessons</p>
              </div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-[#25231F] mb-4">Top Learners</h2>
          <div className="space-y-3">
            {allUsers.map((userItem, index) => (
              <motion.div
                key={userItem.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`
                  bg-white rounded-xl shadow p-4 flex items-center justify-between
                  ${userItem.id === user.id ? 'border-2 border-[#0B8F62]' : ''}
                `}
              >
                <div className="flex items-center gap-4">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center font-bold
                    ${index < 3 ? 'bg-[#F39A45] text-white' : 'bg-[#E8E6E0] text-[#77736B]'}
                  `}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-[#25231F]">{userItem.name}</p>
                    <p className="text-sm text-[#77736B]">🔥 {userItem.streak} day streak</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#0B8F62]">{userItem.xp} XP</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-[#E8E6E0] rounded-xl text-center">
            <p className="text-sm text-[#77736B]">
              Weekly league resets every Sunday at midnight. Keep learning to climb the ranks!
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
