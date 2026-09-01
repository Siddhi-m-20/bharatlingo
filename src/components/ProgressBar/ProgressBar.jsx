import { motion } from 'framer-motion'

export default function ProgressBar({ 
  progress = 0, 
  size = 'medium',
  showLabel = true,
  className = '',
  color = '#0B8F62'
}) {
  const safeProgress = Number.isFinite(Number(progress))
    ? Math.min(100, Math.max(0, Number(progress)))
    : 0
  const sizes = {
    small: 'h-2',
    medium: 'h-3',
    large: 'h-4',
  }
  
  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-[#77736B]">Progress</span>
          <span className="text-sm font-semibold text-[#25231F]">{Math.round(safeProgress)}%</span>
        </div>
      )}
      <div className={`w-full bg-[#E8E6E0] rounded-full overflow-hidden ${sizes[size]}`}>
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${safeProgress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
