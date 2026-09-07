import { motion } from 'framer-motion'
import { X, Check } from 'lucide-react'

export default function QuestionCard({ 
  children, 
  showResult = false,
  isCorrect = false,
  className = ''
}) {
  return (
    <motion.div
      className={`
        bg-white dark:bg-slate-900 border border-[#E8E6E0] dark:border-slate-800 rounded-2xl shadow-lg p-6 md:p-8
        ${showResult ? (isCorrect ? 'border-2 border-[#2F9E69] dark:border-[#2F9E69]' : 'border-2 border-[#D84B42] dark:border-[#D84B42]') : ''}
        ${className}
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {showResult && (
        <motion.div
          className={`
            flex items-center justify-center w-12 h-12 rounded-full mb-4
            ${isCorrect ? 'bg-[#2F9E69]' : 'bg-[#D84B42]'}
          `}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          {isCorrect ? <Check className="text-white" size={24} /> : <X className="text-white" size={24} />}
        </motion.div>
      )}
      
      {children}
    </motion.div>
  )
}
