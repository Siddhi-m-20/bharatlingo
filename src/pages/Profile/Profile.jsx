import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../services/auth'
import { achievements } from '../../data/achievements'
import { getLanguageById } from '../../data/languages'
import AppSidebar from '../../components/Navigation/AppSidebar'
import RightSidebar from '../../components/RightSidebar/RightSidebar'
import Button from '../../components/Button'
import { Award, Flame, Zap, BookOpen, Calendar, Target } from 'lucide-react'

const AGE_LABELS = {
  'child':       'Under 13',
  'teen':        '13–17',
  'young-adult': '18–25',
  'adult':       '26–49',
  'senior':      '50+',
}

export default function Profile() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const language = getLanguageById(user?.learningLanguage)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const unlockedAchievements = user
    ? achievements.filter((achievement) => achievement.condition(user))
    : []

  return (
    <div className="min-h-screen bg-[#F7F5EF] dark:bg-slate-950 flex justify-center pb-20 md:pb-0">
      {/* 1. LEFT SIDEBAR */}
      <AppSidebar />

      {/* 2. CENTER PROFILE CONTENT */}
      <main className="flex-1 max-w-[620px] md:ml-64 px-4 py-6 md:py-8 space-y-6">
        {/* User Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-[#E8E6E0] dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center gap-5 mb-6">
            <img
              src={`https://api.dicebear.com/7.x/bottts/svg?seed=${user?.name || 'Bharat'}&backgroundColor=b6e3f4,c0aede,d1d4f9`}
              alt={user?.name}
              className="w-20 h-20 rounded-3xl border-2 border-[#0B8F62] p-1 bg-white shadow-md"
            />
            <div>
              <h1 className="text-2xl font-black text-[#25231F] dark:text-white">{user?.name}</h1>
              <p className="text-xs text-[#77736B] dark:text-slate-400">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2 text-xs font-bold text-[#0B8F62]">
                <Calendar size={13} />
                <span>Joined {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-3 text-center pt-2 border-t border-[#E8E6E0] dark:border-slate-800">
            <div className="p-3 bg-[#F7F5EF] dark:bg-slate-800 rounded-2xl">
              <div className="flex items-center justify-center gap-1 text-[#F39A45] font-black text-xl">
                <Zap size={18} fill="currentColor" />
                <span>{user?.xp || 0}</span>
              </div>
              <p className="text-[11px] font-bold text-[#77736B] dark:text-slate-400 uppercase mt-0.5">Total XP</p>
            </div>

            <div className="p-3 bg-[#F7F5EF] dark:bg-slate-800 rounded-2xl">
              <div className="flex items-center justify-center gap-1 text-[#D84B42] font-black text-xl">
                <Flame size={18} fill="currentColor" />
                <span>{user?.streak || 0}</span>
              </div>
              <p className="text-[11px] font-bold text-[#77736B] dark:text-slate-400 uppercase mt-0.5">Day Streak</p>
            </div>

            <div className="p-3 bg-[#F7F5EF] dark:bg-slate-800 rounded-2xl">
              <div className="flex items-center justify-center gap-1 text-[#0B8F62] font-black text-xl">
                <BookOpen size={18} />
                <span>{user?.completedLessons?.length || 0}</span>
              </div>
              <p className="text-[11px] font-bold text-[#77736B] dark:text-slate-400 uppercase mt-0.5">Mastered</p>
            </div>
          </div>
        </div>

        {/* Learning Plan Summary (if available) */}
        {user?.learningPlan && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-[#E8E6E0] dark:border-slate-800 p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Target size={18} className="text-[#0B8F62]" />
              <h3 className="text-base font-black text-[#25231F] dark:text-white uppercase tracking-wider">
                My Learning Plan
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 bg-[#F7F5EF] dark:bg-slate-800 rounded-xl">
                <p className="font-black text-sm text-[#0B8F62]">{user.learningPlan.startingLevel}</p>
                <p className="text-[10px] text-[#77736B] dark:text-slate-400 mt-0.5">Level</p>
              </div>
              <div className="p-2.5 bg-[#F7F5EF] dark:bg-slate-800 rounded-xl">
                <p className="font-black text-sm text-[#3B82F6]">{user.learningPlan.goal}</p>
                <p className="text-[10px] text-[#77736B] dark:text-slate-400 mt-0.5">Goal</p>
              </div>
              <div className="p-2.5 bg-[#F7F5EF] dark:bg-slate-800 rounded-xl">
                <p className="font-black text-sm text-[#F39A45]">{user.learningPlan.dailyPractice}</p>
                <p className="text-[10px] text-[#77736B] dark:text-slate-400 mt-0.5">Daily</p>
              </div>
            </div>
            {user.ageRange && (
              <p className="text-xs text-[#77736B] dark:text-slate-400">
                Age group: <span className="font-bold text-[#25231F] dark:text-white">{AGE_LABELS[user.ageRange] || user.ageRange}</span>
              </p>
            )}
            <div className="flex flex-wrap gap-1.5">
              {(user.learningPlan.focusAreas || []).slice(0, 4).map((area, i) => (
                <span key={i} className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#0B8F62]/10 text-[#0B8F62] dark:text-[#34D399]">
                  {area}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Achievements Showcase */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-[#E8E6E0] dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award size={20} className="text-[#F39A45]" />
              <h3 className="text-base font-black text-[#25231F] dark:text-white uppercase tracking-wider">
                Achievements & Badges ({unlockedAchievements.length})
              </h3>
            </div>
          </div>

          {unlockedAchievements.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-xs text-[#77736B] dark:text-slate-400">
                Complete lessons and maintain daily streaks to unlock prestigious badges!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {unlockedAchievements.map((achievement) => (
                <motion.div
                  key={achievement.id}
                  whileHover={{ scale: 1.04, y: -2 }}
                  className="bg-[#0B8F62]/10 border border-[#0B8F62]/30 rounded-2xl p-4 text-center space-y-1"
                >
                  <div className="text-3xl">{achievement.icon}</div>
                  <p className="font-black text-xs text-[#25231F] dark:text-white">{achievement.name}</p>
                  <p className="text-[10px] text-[#77736B] dark:text-slate-400 leading-tight">
                    {achievement.description}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Log Out Action */}
        <div className="pt-2">
          <Button variant="danger" className="w-full font-bold" onClick={handleLogout}>
            Log Out Account
          </Button>
        </div>
      </main>

      {/* 3. RIGHT SIDEBAR */}
      <RightSidebar />
    </div>
  )
}
