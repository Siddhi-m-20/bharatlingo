import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Activity, Flame, Zap, Clock } from 'lucide-react'

function getDateKey(date) {
  const d = new Date(date)
  d.setHours(12, 0, 0, 0)
  return d.toISOString().slice(0, 10)
}

function formatDuration(seconds) {
  const mins = Math.round((Number(seconds) || 0) / 60)
  return mins > 0 ? `${mins}m` : '0m'
}

export default function ActivityChart({ activity = [], className = '' }) {
  const todayKey = useMemo(() => getDateKey(new Date()), [])

  const activityByDate = useMemo(() => {
    const list = Array.isArray(activity) ? activity : []
    return list.reduce((result, item) => {
      const key = item.activity_date || getDateKey(item.created_at || new Date())
      const current = result[key] || {
        activity_date: key,
        exercises_completed: 0,
        xp_earned: 0,
        session_duration_seconds: 0,
      }
      result[key] = {
        ...current,
        exercises_completed: current.exercises_completed + (Number(item.exercises_completed) || 0),
        xp_earned: current.xp_earned + (Number(item.xp_earned) || 0),
        session_duration_seconds: current.session_duration_seconds + (Number(item.session_duration_seconds) || 0),
      }
      return result
    }, {})
  }, [activity])

  const past14Days = useMemo(() => {
    return Array.from({ length: 14 }, (_, index) => {
      const d = new Date()
      d.setHours(12, 0, 0, 0)
      d.setDate(d.getDate() - (13 - index))
      const key = getDateKey(d)
      const act = activityByDate[key] || { exercises_completed: 0, xp_earned: 0, session_duration_seconds: 0 }
      return {
        date: d,
        dateKey: key,
        dayName: d.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 2),
        dayNum: d.getDate(),
        exercises: Number(act.exercises_completed) || 0,
        xp: Number(act.xp_earned) || 0,
        seconds: Number(act.session_duration_seconds) || 0,
        isToday: key === todayKey,
      }
    })
  }, [activityByDate, todayKey])

  const totalExercises14 = past14Days.reduce((sum, d) => sum + d.exercises, 0)
  const totalXP14 = past14Days.reduce((sum, d) => sum + d.xp, 0)
  const totalSeconds14 = past14Days.reduce((sum, d) => sum + d.seconds, 0)
  const maxExercises14 = Math.max(...past14Days.map((d) => d.exercises), 1)

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-3xl border-2 border-[#E8E6E0] dark:border-slate-800 p-5 shadow-sm space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#0B8F62]/10 text-[#0B8F62] dark:text-[#34D399] flex items-center justify-center">
            <Activity size={18} />
          </div>
          <div>
            <h3 className="text-sm font-black text-[#25231F] dark:text-white uppercase tracking-wider">
              14-Day Practice Activity
            </h3>
            <p className="text-[11px] text-[#77736B] dark:text-slate-400">
              Daily exercise volume and consistency trend
            </p>
          </div>
        </div>

        {/* 14-day total stats summary badges */}
        <div className="flex items-center gap-3 text-xs font-bold">
          <span className="flex items-center gap-1 text-[#0B8F62] bg-[#0B8F62]/10 px-2.5 py-1 rounded-full">
            <Flame size={13} />
            {totalExercises14} exs
          </span>
          <span className="flex items-center gap-1 text-[#F39A45] bg-[#F39A45]/10 px-2.5 py-1 rounded-full">
            <Zap size={13} />
            {totalXP14} XP
          </span>
          <span className="flex items-center gap-1 text-[#3B82F6] bg-[#3B82F6]/10 px-2.5 py-1 rounded-full">
            <Clock size={13} />
            {formatDuration(totalSeconds14)}
          </span>
        </div>
      </div>

      {/* 14-Day Bar Visualization */}
      <div className="pt-2 pb-1 w-full overflow-x-auto">
        <div className="grid grid-cols-[repeat(14,minmax(0,1fr))] gap-1 sm:gap-1.5 items-end h-28 px-1 min-w-[280px] w-full">
          {past14Days.map((day) => {
            const heightPercent = Math.max(day.exercises > 0 ? (day.exercises / maxExercises14) * 100 : 8, 8)
            return (
              <div key={day.dateKey} className="flex flex-col items-center h-full justify-end group relative w-full">
                {/* Tooltip on Hover */}
                <div className="absolute -top-10 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                  <div className="bg-[#25231F] text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-lg whitespace-nowrap">
                    {day.dayName} {day.dayNum}: {day.exercises} exs ({day.xp} XP)
                  </div>
                  <div className="w-1.5 h-1.5 bg-[#25231F] rotate-45 -mt-1" />
                </div>

                {/* Bar */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${heightPercent}%` }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className={`w-full max-w-[20px] rounded-t-lg transition-colors cursor-pointer ${
                    day.isToday
                      ? 'bg-[#0B8F62] ring-2 ring-[#0B8F62]/30 dark:ring-[#34D399]/40'
                      : day.exercises > 0
                      ? 'bg-[#10B981]/70 hover:bg-[#0B8F62]'
                      : 'bg-[#E8E6E0] dark:bg-slate-800'
                  }`}
                />

                {/* Day label */}
                <span className={`text-[9px] font-bold mt-1.5 truncate max-w-full text-center ${day.isToday ? 'text-[#0B8F62] dark:text-[#34D399] font-black' : 'text-[#77736B] dark:text-slate-400'}`}>
                  {day.dayName}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
