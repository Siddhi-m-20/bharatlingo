import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Volume2, RotateCcw } from 'lucide-react'
import { AudioService } from '../../services/audio/AudioService'

export default function SentenceOrderExercise({
  prompt,
  words = [],
  correctAnswer,
  sentence,
  languageId,
  onSubmit,
  disabled,
  showResult,
}) {
  const [selectedWords, setSelectedWords] = useState([])
  const [availableWords, setAvailableWords] = useState([])

  useEffect(() => {
    let initialWords = words && words.length > 0 ? words : []
    if (initialWords.length === 0 && correctAnswer) {
      initialWords = String(correctAnswer).split(' ').sort(() => Math.random() - 0.5)
    }
    setAvailableWords(initialWords.map((w, idx) => ({ id: `${w}_${idx}`, word: w })))
    setSelectedWords([])
  }, [prompt, words, correctAnswer])

  const handleSelectWord = (item) => {
    if (disabled || showResult) return
    setSelectedWords((prev) => [...prev, item])
    setAvailableWords((prev) => prev.filter((w) => w.id !== item.id))
  }

  const handleDeselectWord = (item) => {
    if (disabled || showResult) return
    setSelectedWords((prev) => prev.filter((w) => w.id !== item.id))
    setAvailableWords((prev) => [...prev, item])
  }

  const handleReset = () => {
    if (disabled || showResult) return
    let initialWords = words && words.length > 0 ? words : String(correctAnswer).split(' ')
    setAvailableWords(initialWords.map((w, idx) => ({ id: `${w}_${idx}`, word: w })))
    setSelectedWords([])
  }

  const handleCheck = () => {
    const constructedSentence = selectedWords.map((w) => w.word).join(' ').trim()
    onSubmit(constructedSentence)
  }

  const playAudio = () => {
    if (sentence || correctAnswer) {
      AudioService.speak(sentence || correctAnswer, languageId || 'hi')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg md:text-2xl font-bold text-slate-900 dark:text-white">
          {prompt}
        </h3>
        {(sentence || correctAnswer) && (
          <button
            type="button"
            onClick={playAudio}
            className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 hover:scale-105 active:scale-95 transition-all shadow-sm"
            title="Listen to sentence"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Selected Sentence Box */}
      <div className="min-h-[72px] p-3 md:p-4 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 flex flex-wrap items-center gap-2">
        {selectedWords.length === 0 ? (
          <span className="text-slate-400 dark:text-slate-500 text-sm font-medium italic">
            Tap words below to arrange them here...
          </span>
        ) : (
          selectedWords.map((item) => (
            <motion.button
              key={item.id}
              type="button"
              layout
              onClick={() => handleDeselectWord(item)}
              disabled={disabled || showResult}
              className="px-4 py-2 rounded-xl bg-amber-500 text-white font-bold text-sm md:text-base shadow-sm hover:bg-amber-600 active:scale-95 transition-all cursor-pointer"
            >
              {item.word}
            </motion.button>
          ))
        )}
      </div>

      {/* Available Word Tiles */}
      <div className="flex flex-wrap items-center gap-2.5 pt-2">
        {availableWords.map((item) => (
          <motion.button
            key={item.id}
            type="button"
            layout
            onClick={() => handleSelectWord(item)}
            disabled={disabled || showResult}
            className="px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-bold text-sm md:text-base shadow-sm hover:border-amber-400 hover:bg-amber-50/50 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
          >
            {item.word}
          </motion.button>
        ))}
      </div>

      {/* Actions */}
      {!showResult && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleReset}
            disabled={selectedWords.length === 0 || disabled}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-40 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Clear
          </button>

          <button
            type="button"
            onClick={handleCheck}
            disabled={selectedWords.length === 0 || disabled}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm shadow-md shadow-emerald-500/20 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Check Answer
          </button>
        </div>
      )}
    </div>
  )
}
