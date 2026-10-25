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
          ? 'border-[#0B8F62] dark:border-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 shadow-lg ring-2 ring-[#0B8F62]/40' 
          : 'border-[#E8E6E0] dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-[#0B8F62]/50 hover:shadow-md'
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
          className="absolute top-3 right-3 w-6 h-6 bg-[#0B8F62] dark:bg-emerald-500 rounded-full flex items-center justify-center shadow-sm"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
      )}
      
      <div className="text-4xl mb-3">{language.flag}</div>
      <h3 className={`text-lg font-bold mb-1 transition-colors ${selected ? 'text-emerald-950 dark:text-emerald-100 font-extrabold' : 'text-[#25231F] dark:text-white'}`}>
        {language.name}
      </h3>
      <p className={`text-sm transition-colors ${selected ? 'text-emerald-700 dark:text-emerald-200 font-semibold' : 'text-[#77736B] dark:text-slate-300'}`}>
        {language.nativeName}
      </p>
    </motion.div>
  )
}
