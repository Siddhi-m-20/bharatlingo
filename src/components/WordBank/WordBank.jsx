import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '../Button'

export default function WordBank({
  prompt,
  wordBank = [],
  correctAnswer,
  onSubmit,
  disabled = false,
  showResult = false,
  isCorrect = false,
}) {
  const [selectedWords, setSelectedWords] = useState([])
  const [availableWords, setAvailableWords] = useState([])

  useEffect(() => {
    setAvailableWords(wordBank.map((word, idx) => ({ id: `${word}-${idx}`, word })))
    setSelectedWords([])
  }, [wordBank, correctAnswer])

  const handleSelectWord = (item) => {
    if (disabled || showResult) return
    setSelectedWords((prev) => [...prev, item])
    setAvailableWords((prev) => prev.filter((w) => w.id !== item.id))
  }

  const handleRemoveWord = (item) => {
    if (disabled || showResult) return
    setSelectedWords((prev) => prev.filter((w) => w.id !== item.id))
    setAvailableWords((prev) => [...prev, item])
  }

  const currentSentence = selectedWords.map((w) => w.word).join(' ')

  return (
    <div className="space-y-6">
      <h3 className="text-xl md:text-2xl font-semibold text-[#25231F] mb-4">
        {prompt}
      </h3>

      {/* Assemble Line */}
      <div className="min-h-[64px] p-4 bg-[#F7F5EF] border-2 border-dashed border-[#D2CFC7] rounded-2xl flex flex-wrap gap-2 items-center">
        {selectedWords.length === 0 && (
          <p className="text-sm text-[#77736B] italic select-none">
            Tap words below to build the sentence...
          </p>
        )}
        <AnimatePresence>
          {selectedWords.map((item) => (
            <motion.button
              key={item.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={() => handleRemoveWord(item)}
              disabled={disabled || showResult}
              className="px-4 py-2.5 bg-white border-2 border-[#0B8F62] text-[#0B8F62] font-semibold rounded-xl shadow-sm hover:bg-[#0B8F62]/10 transition-colors"
            >
              {item.word}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Available Word Tiles */}
      <div className="flex flex-wrap gap-2.5 justify-center py-2">
        {availableWords.map((item) => (
          <motion.button
            key={item.id}
            onClick={() => handleSelectWord(item)}
            disabled={disabled || showResult}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2.5 bg-white border-2 border-[#E8E6E0] hover:border-[#0B8F62] text-[#25231F] font-medium rounded-xl shadow-sm hover:shadow transition-all"
          >
            {item.word}
          </motion.button>
        ))}
      </div>

      {/* Action Button */}
      {!showResult && (
        <div className="pt-2 flex justify-end">
          <Button
            onClick={() => onSubmit(currentSentence)}
            disabled={selectedWords.length === 0 || disabled}
          >
            Check Answer
          </Button>
        </div>
      )}
    </div>
  )
}
