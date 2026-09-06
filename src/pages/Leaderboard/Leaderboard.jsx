import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../services/auth'
import { supabase, isSupabaseConfigured } from '../../services/supabase'
import AppSidebar from '../../components/Navigation/AppSidebar'
import RightSidebar from '../../components/RightSidebar/RightSidebar'
import { Trophy, Flame, Zap, ShieldCheck, Clock, ArrowUp, ArrowDown } from 'lucide-react'

const LEAGUES = [
  { id: 'bronze', name: 'Bronze League', emoji: '🥉', color: 'from-amber-700 to-amber-900', minXP: 0 },
  { id: 'silver', name: 'Silver League', emoji: '🥈', color: 'from-slate-400 to-slate-600', minXP: 200 },
  { id: 'gold', name: 'Gold League', emoji: '🥇', color: 'from-amber-400 to-amber-600', minXP: 500 },
  { id: 'sapphire', name: 'Sapphire League', emoji: '💎', color: 'from-blue-500 to-cyan-600', minXP: 1000 },
  { id: 'ruby', name: 'Ruby League', emoji: '🔮', color: 'from-rose-500 to-red-700', minXP: 2000 },
  { id: 'diamond', name: 'Diamond League', emoji: '👑', color: 'from-purple-600 to-indigo-800', minXP: 3500 },
]

const DEMO_USERS_BY_LEAGUE = {
  bronze: [
    { id: 'b-1', name: 'Aditya Gupta', xp: 180, streak: 3 },
    { id: 'b-2', name: 'Kavita Joshi', xp: 150, streak: 2 },
    { id: 'b-3', name: 'Rahul Nair', xp: 120, streak: 1 },
    { id: 'b-4', name: 'Pooja Reddy', xp: 90, streak: 2 },
    { id: 'b-5', name: 'Vikram Seth', xp: 60, streak: 1 },
  ],
  silver: [
    { id: 's-1', name: 'Deepak Sharma', xp: 480, streak: 6 },
    { id: 's-2', name: 'Neha Kulkarni', xp: 420, streak: 5 },
    { id: 's-3', name: 'Sameer Sen', xp: 370, streak: 4 },
    { id: 's-4', name: 'Anita Das', xp: 310, streak: 3 },
    { id: 's-5', name: 'Manish Pandey', xp: 260, streak: 2 },
  ],
  gold: [
    { id: 'g-1', name: 'Aarav Sharma', xp: 920, streak: 12 },
    { id: 'g-2', name: 'Priya Patel', xp: 860, streak: 8 },
    { id: 'g-3', name: 'Rohan Deshmukh', xp: 810, streak: 15 },
    { id: 'g-4', name: 'Meera Iyer', xp: 740, streak: 5 },
    { id: 'g-5', name: 'Gurpreet Singh', xp: 690, streak: 7 },
  ],
  sapphire: [
    { id: 'sp-1', name: 'Siddharth Roy', xp: 1850, streak: 24 },
    { id: 'sp-2', name: 'Ananya Verma', xp: 1620, streak: 19 },
    { id: 'sp-3', name: 'Karthik Rao', xp: 1480, streak: 16 },
    { id: 'sp-4', name: 'Divya Nambiar', xp: 1310, streak: 14 },
    { id: 'sp-5', name: 'Arjun Kapoor', xp: 1190, streak: 11 },
  ],
  ruby: [
    { id: 'rb-1', name: 'Tanvi Roy', xp: 3200, streak: 35 },
    { id: 'rb-2', name: 'Harsh Vardhan', xp: 2980, streak: 28 },
    { id: 'rb-3', name: 'Sanya Mirza', xp: 2650, streak: 22 },
    { id: 'rb-4', name: 'Gautam Gambhir', xp: 2340, streak: 18 },
  ],
  diamond: [
    { id: 'dm-1', name: 'Ravi Teja', xp: 5400, streak: 60 },
    { id: 'dm-2', name: 'Sunita Menon', xp: 4890, streak: 52 },
    { id: 'dm-3', name: 'Amitabh Sen', xp: 4320, streak: 45 },
    { id: 'dm-4', name: 'Pranathi Rao', xp: 3950, streak: 38 },
  ],
}

export default function Leaderboard() {
  const navigate = useNavigate()
  const { user } = useAuth()

  // Determine user's current league based on their total XP
  const userXP = user?.xp || 0
  const defaultLeague =
    [...LEAGUES].reverse().find((l) => userXP >= l.minXP) || LEAGUES[0]

  const [activeLeague, setActiveLeague] = useState(defaultLeague.id)
  const currentLeagueMeta = LEAGUES.find((l) => l.id === activeLeague) || LEAGUES[0]

  // Demo users for the active league
  const leagueUsers = DEMO_USERS_BY_LEAGUE[activeLeague] || DEMO_USERS_BY_LEAGUE['gold']

  // If viewing the user's active league, add the user into the list
  const isViewingMyLeague = activeLeague === defaultLeague.id
  let combinedList = [...leagueUsers]
  if (isViewingMyLeague && user) {
    if (!combinedList.some((u) => u.id === user.id)) {
      combinedList.push({
        id: user.id,
        name: user.name,
        xp: user.xp || 0,
        streak: user.streak || 0,
        isCurrentUser: true,
      })
    }
  }
  combinedList.sort((a, b) => (b.xp || 0) - (a.xp || 0))

  const userRank = user ? combinedList.findIndex((u) => u.id === user.id) + 1 : 1

  return (
    <div className="min-h-screen bg-[#F7F5EF] dark:bg-slate-950 flex justify-center pb-20 md:pb-0 text-[#25231F] dark:text-slate-100">
      <AppSidebar />

      <main className="flex-1 max-w-[680px] md:ml-64 px-4 py-6 md:py-8 space-y-6">
        {/* League Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {LEAGUES.map((league) => {
            const isCurrent = league.id === defaultLeague.id
            const isSelected = league.id === activeLeague

            return (
              <button
                key={league.id}
                onClick={() => setActiveLeague(league.id)}
                className={`px-4 py-2 rounded-2xl text-xs md:text-sm font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-400'
                }`}
              >
                <span>{league.emoji}</span>
                <span>{league.name.replace(' League', '')}</span>
                {isCurrent && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 ml-1" title="Your Current League" />
                )}
              </button>
            )
          })}
        </div>

        {/* League Banner */}
        <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${currentLeagueMeta.color} p-6 md:p-8 text-white shadow-xl flex items-center justify-between`}>
          <div className="space-y-1 relative z-10">
            <span className="text-[11px] font-black uppercase tracking-widest bg-black/20 px-2.5 py-1 rounded-full">
              Weekly League Tournament
            </span>
            <h1 className="text-2xl md:text-3xl font-black flex items-center gap-2">
              <span>{currentLeagueMeta.emoji}</span> {currentLeagueMeta.name}
            </h1>
            <p className="text-xs md:text-sm text-white/90 flex items-center gap-1.5 pt-1">
              <Clock className="w-3.5 h-3.5" /> 3 days remaining • Top 3 promote to higher tier!
            </p>
          </div>
          <div className="text-6xl md:text-7xl opacity-30 select-none">
            {currentLeagueMeta.emoji}
          </div>
        </div>

        {/* User Rank Sticky Pill */}
        {user && isViewingMyLeague && (
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border-2 border-emerald-500 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black text-sm">
                #{userRank}
              </span>
              <div>
                <p className="text-sm font-black text-slate-900 dark:text-white">{user.name} (You)</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">{user.xp || 0} Total XP</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-500">
              <Flame className="w-4 h-4 fill-current" />
              <span>{user.streak || 0} Day Streak</span>
            </div>
          </div>
        )}

        {/* Leaderboard Table List */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
          {combinedList.map((learner, index) => {
            const rank = index + 1
            const isMe = user && learner.id === user.id
            const isPromotion = rank <= 3
            const isDemotion = rank > combinedList.length - 2 && combinedList.length > 4

            let rankBadge = (
              <span className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center font-bold text-xs">
                {rank}
              </span>
            )

            if (rank === 1) rankBadge = <span className="text-xl">🥇</span>
            if (rank === 2) rankBadge = <span className="text-xl">🥈</span>
            if (rank === 3) rankBadge = <span className="text-xl">🥉</span>

            return (
              <div
                key={learner.id}
                className={`p-4 flex items-center justify-between transition-colors ${
                  isMe
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/30 font-bold'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-7 flex items-center justify-center">
                    {rankBadge}
                  </div>

                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                    {learner.name.charAt(0)}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {learner.name} {isMe && '(You)'}
                      </span>
                      {isPromotion && (
                        <span className="flex items-center text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded-full">
                          <ArrowUp className="w-2.5 h-2.5" /> Promotion
                        </span>
                      )}
                      {isDemotion && (
                        <span className="flex items-center text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-950 px-1.5 py-0.5 rounded-full">
                          <ArrowDown className="w-2.5 h-2.5" /> Demotion
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1 text-amber-500">
                        <Flame className="w-3 h-3 fill-current" /> {learner.streak || 1}d
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-black text-amber-600 dark:text-amber-400">
                    {learner.xp} XP
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </main>

      <RightSidebar />
    </div>
  )
}
