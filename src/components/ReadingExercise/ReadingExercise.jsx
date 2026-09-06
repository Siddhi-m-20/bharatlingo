import { useState } from 'react'
import { motion } from 'framer-motion'
import { Volume2, BookOpen } from 'lucide-react'
import { AudioService } from '../../services/audio/AudioService'

export default function ReadingExercise({
  prompt,
  passage,
  question,
  options = [],
  correctAnswer,
  languageId,
  onSubmit,
  disabled,
  showResult,
}) {
  const [selectedOption, setSelectedOption] = useState(null)

  const handleSelect = (opt) => {
    if (disabled || showResult) return
    setSelectedOption(opt)
    onSubmit(opt)
  }

  const playPassageAudio = () => {
    if (passage) {
      AudioService.speak(passage, languageId || 'hi')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
          <BookOpen className="w-4 h-4" /> Reading Comprehension
        </div>
        {passage && (
          <button
            type="button"
            onClick={playPassageAudio}
            className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 hover:scale-105 active:scale-95 transition-all shadow-sm"
            title="Listen to story passage"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Passage Box */}
      <div className="p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 shadow-inner">
        <p className="text-base md:text-lg font-medium leading-relaxed text-slate-900 dark:text-slate-100">
          {passage}
        </p>
      </div>

      {/* Question */}
      <div>
        <h4 className="text-base md:text-lg font-bold text-slate-900 dark:text-white mb-3">
          {question || prompt}
        </h4>

        {/* Options */}
        <div className="space-y-2.5">
          {options.map((option, index) => {
            const isSelected = selectedOption === option
            let btnStyle =
              'w-full p-4 rounded-xl border-2 text-left font-medium transition-all text-sm md:text-base cursor-pointer'

            if (showResult) {
              if (option === correctAnswer) {
                btnStyle += ' border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold'
              } else if (isSelected) {
                btnStyle += ' border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
              } else {
                btnStyle += ' border-slate-200 dark:border-slate-800 opacity-50'
              }
            } else if (isSelected) {
              btnStyle += ' border-amber-500 bg-amber-50 dark:bg-amber-950/30'
            } else {
              btnStyle += ' border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-300 dark:hover:border-slate-700'
            }

            return (
              <motion.button
                key={index}
                type="button"
                className={btnStyle}
                onClick={() => handleSelect(option)}
                disabled={disabled || showResult}
                whileHover={!showResult && !disabled ? { scale: 1.01 } : {}}
                whileTap={!showResult && !disabled ? { scale: 0.99 } : {}}
              >
                {option}
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
