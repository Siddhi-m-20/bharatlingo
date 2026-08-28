import { motion } from 'framer-motion'

export default function LanguageCard({ 
  language, 
  selected = false, 
  onClick, 
  disabled = false,
  className = ''
}) {
  return (
    <motion.div
      className={`
        relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200
        ${selected 
          ? 'border-[#0B8F62] bg-[#0B8F62]/10 shadow-lg' 
          : 'border-[#E8E6E0] bg-white hover:border-[#0B8F62]/50 hover:shadow-md'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      onClick={!disabled ? onClick : undefined}
      whileHover={!disabled ? { y: -4 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
    >
      {selected && (
        <motion.div
          className="absolute top-3 right-3 w-6 h-6 bg-[#0B8F62] rounded-full flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
      )}
      
      <div className="text-4xl mb-3">{language.flag}</div>
      <h3 className="text-lg font-semibold text-[#25231F] mb-1">{language.name}</h3>
      <p className="text-sm text-[#77736B]">{language.nativeName}</p>
    </motion.div>
  )
}
