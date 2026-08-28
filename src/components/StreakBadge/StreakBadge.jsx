import { motion } from 'framer-motion'
import { Flame } from 'lucide-react'

export default function StreakBadge({ streak = 0, showLabel = true, className = '' }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <motion.div
        className="flex items-center justify-center w-10 h-10 rounded-full bg-[#D84B42] text-white"
        whileHover={{ scale: 1.1 }}
        animate={streak > 0 ? {
          scale: [1, 1.1, 1],
          rotate: [0, -10, 10, 0]
        } : {}}
        transition={{ duration: 0.5 }}
      >
        <Flame size={20} />
      </motion.div>
      {showLabel && (
        <div>
          <p className="text-xs text-[#77736B] font-medium">Streak</p>
          <p className="text-lg font-bold text-[#25231F]">{streak} day{streak !== 1 ? 's' : ''}</p>
        </div>
      )}
    </div>
  )
}
