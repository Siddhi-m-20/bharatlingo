import { motion } from 'framer-motion'
import { Volume2 } from 'lucide-react'
import { speak } from '../services/speech'

export default function AudioButton({ 
  text, 
  language = 'en-US', 
  size = 'medium',
  className = ''
}) {
  const handleClick = () => {
    speak(text, language)
  }
  
  const sizes = {
    small: 'w-8 h-8',
    medium: 'w-10 h-10',
    large: 'w-12 h-12',
  }
  
  return (
    <motion.button
      className={`
        flex items-center justify-center rounded-full bg-[#0B8F62] text-white
        hover:bg-[#0FB878] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0B8F62]
        ${sizes[size]}
        ${className}
      `}
      onClick={handleClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      aria-label={`Play audio: ${text}`}
    >
      <Volume2 size={size === 'small' ? 16 : size === 'medium' ? 20 : 24} />
    </motion.button>
  )
}
