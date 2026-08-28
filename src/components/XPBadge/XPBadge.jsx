import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'

export default function XPBadge({ xp = 0, showLabel = true, className = '' }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <motion.div
        className="flex items-center justify-center w-10 h-10 rounded-full bg-[#F39A45] text-white"
        whileHover={{ scale: 1.1 }}
        animate={{ rotate: [0, -5, 5, 0] }}
        transition={{ duration: 0.5 }}
      >
        <Zap size={20} />
      </motion.div>
      {showLabel && (
        <div>
          <p className="text-xs text-[#77736B] font-medium">XP</p>
          <p className="text-lg font-bold text-[#25231F]">{xp}</p>
        </div>
      )}
    </div>
  )
}
