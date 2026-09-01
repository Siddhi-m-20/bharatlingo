import { motion } from 'framer-motion'
import { Flame } from 'lucide-react'

export default function StreakBadge({ streak = 0, showLabel = false, className = '' }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#D84B42]/10 dark:bg-[#D84B42]/20 border border-[#D84B42]/30 text-[#D84B42] dark:text-[#F87171] shrink-0 font-black text-xs ${className}`}
      title={`${streak} Day Streak`}
    >
      <motion.div
        animate={streak > 0 ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 1, repeat: Infinity }}
      >
        <Flame size={16} fill="currentColor" />
      </motion.div>
      <span>{streak}</span>
      {showLabel && <span className="hidden sm:inline font-bold">days</span>}
    </motion.div>
  )
}
