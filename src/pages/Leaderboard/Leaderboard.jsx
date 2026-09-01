import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../services/auth'
import { supabase, isSupabaseConfigured } from '../../services/supabase'
import AppSidebar from '../../components/Navigation/AppSidebar'
import RightSidebar from '../../components/RightSidebar/RightSidebar'
import { Trophy, Flame, Zap, ShieldCheck } from 'lucide-react'

const DEMO_USERS = [
  { id: 'demo-1', name: 'Aarav Sharma', xp: 820, streak: 12, avatarSeed: 'Aarav' },
  { id: 'demo-2', name: 'Priya Patel', xp: 760, streak: 8, avatarSeed: 'Priya' },
  { id: 'demo-3', name: 'Rohan Deshmukh', xp: 710, streak: 15, avatarSeed: 'Rohan' },
  { id: 'demo-4', name: 'Meera Iyer', xp: 640, streak: 5, avatarSeed: 'Meera' },
  { id: 'demo-5', name: 'Gurpreet Singh', xp: 590, streak: 7, avatarSeed: 'Gurpreet' },
  { id: 'demo-6', name: 'Tanvi Roy', xp: 520, streak: 3, avatarSeed: 'Tanvi' },
  { id: 'demo-7', name: 'Karthik Rao', xp: 480, streak: 10, avatarSeed: 'Karthik' },
  { id: 'demo-8', name: 'Ananya Verma', xp: 420, streak: 6, avatarSeed: 'Ananya' },
]

export default function Leaderboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [boardUsers, setBoardUsers] = useState(DEMO_USERS)

  useEffect(() => {
    const fetchTopLearners = async () => {
      if (isSupabaseConfigured() && supabase) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('id, name, xp, streak')
            .order('xp', { ascending: false })
            .limit(20)

          if (!error && data && data.length > 0) {
            setBoardUsers(data)
          }
        } catch (err) {
          console.warn('Leaderboard fetch fallback to demo list:', err)
        }
      }
    }

    fetchTopLearners()
  }, [])

  // Combine user into list if not already present
  const allUsers = user
    ? boardUsers.some((u) => u.id === user.id)
      ? [...boardUsers].sort((a, b) => (b.xp || 0) - (a.xp || 0))
      : [...boardUsers, { id: user.id, name: user.name, xp: user.xp || 0, streak: user.streak || 0 }].sort(
          (a, b) => (b.xp || 0) - (a.xp || 0)
        )
    : boardUsers

  const userRank = user ? allUsers.findIndex((u) => u.id === user.id) + 1 : 1

  return (
    <div className="min-h-screen bg-[#F7F5EF] dark:bg-slate-950 flex justify-center pb-20 md:pb-0">
      {/* 1. LEFT SIDEBAR */}
      <AppSidebar />

      {/* 2. CENTER LEADERBOARDS CONTENT */}
      <main className="flex-1 max-w-[620px] md:ml-64 px-4 py-6 md:py-8 space-y-6">
        {/* League Banner Header */}
        <div className="bg-gradient-to-r from-[#F39A45] via-[#FB923C] to-[#EA580C] rounded-3xl p-6 text-white shadow-md flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-black uppercase tracking-widest bg-black/20 px-2.5 py-1 rounded-md">
              Current League
            </span>
            <h1 className="text-2xl font-black">Diamond League</h1>
            <p className="text-xs text-white/90">Top 3 learners advance to the Champion's Tier!</p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl shadow-inner">
            💎
          </div>
        </div>

        {/* User Rank Sticky Pill */}
        {user && (
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border-2 border-[#0B8F62] shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[#0B8F62] text-white flex items-center justify-center font-black text-sm">
                #{userRank}
              </span>
              <div>
                <p className="text-sm font-black text-[#25231F] dark:text-white">{user.name} (You)</p>
                <p className="text-xs text-[#0B8F62] font-bold">{user.xp || 0} Total XP</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#F39A45]">
              <Flame size={16} fill="currentColor" />
              <span>{user.streak || 0} Day Streak</span>
            </div>
          </div>
        )}

        {/* Leaderboard Table List */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-[#E8E6E0] dark:border-slate-800 shadow-sm overflow-hidden divide-y divide-[#E8E6E0] dark:divide-slate-800">
          {allUsers.map((player, idx) => {
            const rank = idx + 1
            const isCurrentUser = user && player.id === user.id

            return (
              <motion.div
                key={player.id || idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className={`p-4 flex items-center justify-between transition-colors ${
                  isCurrentUser
                    ? 'bg-[#0B8F62]/10 dark:bg-[#0B8F62]/20 font-black'
                    : 'hover:bg-[#F7F5EF] dark:hover:bg-slate-800/50'
                }`}
              >
                {/* Rank & User Info */}
                <div className="flex items-center gap-3.5">
                  <div className="w-7 text-center font-black text-sm">
                    {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
                  </div>
                  {/* Avatar (DiceBear API) */}
                  <img
                    src={`https://api.dicebear.com/7.x/bottts/svg?seed=${player.name || idx}&backgroundColor=b6e3f4,c0aede,d1d4f9`}
                    alt={player.name}
                    className="w-10 h-10 rounded-full border border-[#E8E6E0] dark:border-slate-700 bg-white"
                  />
                  <div>
                    <p className={`text-sm ${isCurrentUser ? 'font-black text-[#0B8F62] dark:text-[#34D399]' : 'font-bold text-[#25231F] dark:text-white'}`}>
                      {player.name} {isCurrentUser && '(You)'}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-[#77736B] dark:text-slate-400">
                      <span className="flex items-center gap-0.5">
                        <Flame size={12} className="text-[#D84B42]" fill="currentColor" />
                        {player.streak || 1}d
                      </span>
                    </div>
                  </div>
                </div>

                {/* XP Score */}
                <div className="flex items-center gap-1 font-black text-sm text-[#25231F] dark:text-white">
                  <span>{player.xp || 0}</span>
                  <span className="text-xs text-[#77736B] font-bold">XP</span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </main>

      {/* 3. RIGHT SIDEBAR */}
      <RightSidebar />
    </div>
  )
}
