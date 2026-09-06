import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Volume2, CheckCircle2, XCircle, Sparkles } from 'lucide-react'
import { AudioService } from '../../services/audio/AudioService'

export default function PictureChoiceExercise({
  exercise,
  languageId = 'hi',
  onAnswer,
  disabled = false,
  showResult = false,
  selectedAnswer = '',
}) {
  const [selectedOption, setSelectedOption] = useState(selectedAnswer || '')

  useEffect(() => {
    setSelectedOption(selectedAnswer || '')
  }, [selectedAnswer])

  const options = exercise?.options || []
  const targetWord = exercise?.targetWord || exercise?.question || ''
  const prompt = exercise?.prompt || exercise?.questionText || 'Select the correct image'
  const audioText = exercise?.audioText || targetWord

  const handlePlayAudio = (e, text, lang = languageId) => {
    if (e) e.stopPropagation()
    if (text) {
      AudioService.speak(text, lang)
    }
  }

  const handleSelect = (option) => {
    if (disabled || showResult) return
    const value = typeof option === 'string' ? option : option.text || option.word || option.label
    setSelectedOption(value)
    if (onAnswer) {
      onAnswer(value)
    }
    // Automatically play the selected word's audio
    if (option.audioText || option.text) {
      AudioService.speak(option.audioText || option.text, languageId)
    }
  }

  // Keyboard shortcut listener (1, 2, 3, 4)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (disabled || showResult) return
      const keyIndex = parseInt(e.key, 10) - 1
      if (keyIndex >= 0 && keyIndex < options.length) {
        handleSelect(options[keyIndex])
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [options, disabled, showResult])

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      {/* ── Exercise Prompt Header ── */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0B8F62]/10 dark:bg-[#0B8F62]/20 text-[#0B8F62] dark:text-[#34D399] text-xs font-black uppercase tracking-wider">
          <Sparkles size={14} /> Visual Recognition
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-[#25231F] dark:text-white">
          {prompt}
        </h2>

        {/* Target Word Speaker Banner */}
        {targetWord && (
          <div className="inline-flex items-center gap-3 bg-white dark:bg-slate-900 border-2 border-[#E8E6E0] dark:border-slate-800 px-5 py-2.5 rounded-2xl shadow-sm">
            <button
              type="button"
              onClick={(e) => handlePlayAudio(e, audioText)}
              className="w-10 h-10 rounded-xl bg-[#0B8F62] hover:bg-[#09734e] text-white flex items-center justify-center transition-transform active:scale-95 shadow-md flex-shrink-0"
              title="Listen to word"
              aria-label="Listen to word"
            >
              <Volume2 size={20} />
            </button>
            <div className="text-left">
              <span className="text-lg font-black text-[#25231F] dark:text-white block">
                {targetWord}
              </span>
              {exercise?.roman && (
                <span className="text-xs font-semibold text-[#77736B] dark:text-slate-400">
                  {exercise.roman}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── 2x2 Picture Cards Grid ── */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {options.map((opt, index) => {
          const optValue = typeof opt === 'string' ? opt : opt.text || opt.word || opt.label
          const isSelected = selectedOption === optValue
          const isCorrect = showResult && optValue === exercise?.correctAnswer
          const isWrong = showResult && isSelected && optValue !== exercise?.correctAnswer
          const emoji = opt.emoji || opt.image || opt.icon || '🖼️'
          const label = opt.text || opt.word || optValue
          const translation = opt.meaning || opt.translation || ''
          const roman = opt.roman || opt.transliteration || ''

          let borderStyle = 'border-[#E8E6E0] dark:border-slate-800 bg-white dark:bg-slate-900'
          if (showResult) {
            if (isCorrect) {
              borderStyle = 'border-[#0B8F62] bg-[#0B8F62]/10 dark:bg-[#0B8F62]/20 ring-2 ring-[#0B8F62]'
            } else if (isWrong) {
              borderStyle = 'border-[#D84B42] bg-[#D84B42]/10 dark:bg-[#D84B42]/20 ring-2 ring-[#D84B42]'
            }
          } else if (isSelected) {
            borderStyle = 'border-[#0B8F62] bg-[#0B8F62]/10 dark:bg-[#0B8F62]/20 ring-2 ring-[#0B8F62]/40 shadow-md'
          }

          return (
            <motion.button
              key={index}
              type="button"
              whileHover={!disabled && !showResult ? { scale: 1.03, y: -2 } : {}}
              whileTap={!disabled && !showResult ? { scale: 0.97 } : {}}
              onClick={() => handleSelect(opt)}
              disabled={disabled || showResult}
              className={`relative p-4 rounded-3xl border-2 text-center flex flex-col items-center justify-between min-h-[160px] sm:min-h-[180px] transition-all cursor-pointer select-none ${borderStyle}`}
            >
              {/* Keyboard Shortcut Badge */}
              <span className="absolute top-3 left-3 w-5 h-5 rounded-lg bg-[#F7F5EF] dark:bg-slate-800 text-[10px] font-black text-[#77736B] dark:text-slate-400 flex items-center justify-center border border-[#E8E6E0] dark:border-slate-700">
                {index + 1}
              </span>

              {/* Status Icon on result */}
              {showResult && isCorrect && (
                <CheckCircle2 size={20} className="absolute top-3 right-3 text-[#0B8F62]" />
              )}
              {showResult && isWrong && (
                <XCircle size={20} className="absolute top-3 right-3 text-[#D84B42]" />
              )}

              {/* Large Emoji / Sticker / Visual */}
              <div className="my-auto py-2">
                <span className="text-5xl sm:text-6xl drop-shadow-sm filter block transition-transform hover:scale-110">
                  {emoji}
                </span>
              </div>

              {/* Word Labels */}
              <div className="w-full pt-2 border-t border-[#E8E6E0]/60 dark:border-slate-800/60">
                <div className="flex items-center justify-center gap-1.5">
                  <span className="text-base sm:text-lg font-black text-[#25231F] dark:text-white">
                    {label}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handlePlayAudio(e, label)}
                    className="p-1 text-[#77736B] hover:text-[#0B8F62] dark:hover:text-[#34D399] transition-colors"
                    title={`Pronounce ${label}`}
                  >
                    <Volume2 size={14} />
                  </button>
                </div>

                {roman && (
                  <p className="text-[11px] font-medium text-[#77736B] dark:text-slate-400">
                    {roman}
                  </p>
                )}

                {translation && (
                  <p className="text-xs font-bold text-[#0B8F62] dark:text-[#34D399] mt-0.5">
                    {translation}
                  </p>
                )}
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
