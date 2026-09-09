import { motion } from 'framer-motion'
import { Flame } from 'lucide-react'

export default function StreakBadge({ streak = 0, showLabel = false, className = '', onClick }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      className={`flex items-center gap-1 px-2 py-1 rounded-lg bg-[#D84B42]/10 dark:bg-[#D84B42]/20 border border-[#D84B42]/30 text-[#D84B42] dark:text-[#F87171] shrink-0 font-black text-xs ${className}`}
      title={`${streak} Day Streak`}
      aria-label={`${streak} day streak. Open streak details.`}
    >
      <motion.div
        animate={streak > 0 ? { scale: [1, 1.15, 1] } : {}}
        transition={{ duration: 1, repeat: Infinity }}
      >
        <Flame size={14} fill="currentColor" />
      </motion.div>
      <span>{streak}</span>
      {showLabel && <span className="hidden sm:inline font-bold">days</span>}
    </motion.button>
  )
}
