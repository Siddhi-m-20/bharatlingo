import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'

export default function XPBadge({ xp = 0, showLabel = false, className = '' }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#F39A45]/10 dark:bg-[#F39A45]/20 border border-[#F39A45]/30 text-[#F39A45] dark:text-[#FBBF24] shrink-0 font-black text-xs ${className}`}
      title={`${xp} Total XP`}
    >
      <Zap size={15} fill="currentColor" />
      <span>{xp}</span>
      {showLabel && <span className="font-bold">XP</span>}
    </motion.div>
  )
}
