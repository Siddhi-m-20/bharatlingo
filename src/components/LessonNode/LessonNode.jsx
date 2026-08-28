import { motion } from 'framer-motion'
import { Check, Lock, Play } from 'lucide-react'

export default function LessonNode({ 
  lesson, 
  status = 'locked', 
  onClick, 
  current = false,
  className = ''
}) {
  const statusStyles = {
    completed: 'bg-[#2F9E69] text-white border-[#2F9E69]',
    current: 'bg-[#0B8F62] text-white border-[#0B8F62] shadow-lg shadow-[#0B8F62]/30',
    locked: 'bg-[#E8E6E0] text-[#77736B] border-[#E8E6E0]',
  }
  
  const icons = {
    completed: <Check size={20} />,
    current: <Play size={20} />,
    locked: <Lock size={20} />,
  }
  
  return (
    <motion.div
      className={`
        relative flex flex-col items-center cursor-pointer
        ${className}
      `}
      onClick={status !== 'locked' ? onClick : undefined}
      whileHover={status !== 'locked' ? { scale: 1.05 } : {}}
      whileTap={status !== 'locked' ? { scale: 0.95 } : {}}
    >
      <div
        className={`
          w-16 h-16 rounded-full flex items-center justify-center border-4
          ${statusStyles[status]}
          ${status === 'current' ? 'animate-pulse' : ''}
        `}
      >
        {icons[status]}
      </div>
      
      <div className="mt-2 text-center">
        <p className="text-sm font-semibold text-[#25231F]">{lesson.name}</p>
        <p className="text-xs text-[#77736B]">{lesson.nameNative}</p>
      </div>
      

    </motion.div>
  )
}
