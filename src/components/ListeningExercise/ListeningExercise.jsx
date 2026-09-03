/**
 * ListeningExercise — Progressive Listening Intelligence for BharatLingo
 *
 * Levels:
 * - Level 1: Single Word Identification
 * - Level 2: Short Phrase Recognition
 * - Level 3: Full Sentence Comprehension
 * - Level 4: Mini Dialogue / Contextual Comprehension
 *
 * Features:
 * - Real TTS audio via AudioButton (state machine)
 * - Normal vs Slow-speed replay
 * - Replay count metrics tracking
 * - Dialogue / Audio Comprehension question format
 * - No penalty for replays
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AudioButton from '../AudioButton/AudioButton'
import { ttsService } from '../../services/audio/AudioService'
import { Headphones, Sparkles, Volume2 } from 'lucide-react'

export default function ListeningExercise({
  prompt,
  audioText,        // The text to speak
  audioTarget,      // Backward-compat alias
  options = [],
  correctAnswer,
  languageId = 'hi',
  selectedAnswer,
  onSelectAnswer,
  showResult = false,
  disabled = false,
  level = 2,        // 1 | 2 | 3 | 4
  comprehensionQuestion,
}) {
  // Support both field names
  const textToSpeak = audioText || audioTarget || correctAnswer || ''
  const [hasPlayed, setHasPlayed] = useState(false)
  const [replayCount, setReplayCount] = useState(0)
  const [showHint, setShowHint] = useState(false)

  // Determine listening tier if not explicitly provided
  const inferredLevel = level || (
    textToSpeak.split(' ').length <= 1 ? 1 :
    textToSpeak.split(' ').length <= 3 ? 2 :
    textToSpeak.split(' ').length <= 6 ? 3 : 4
  )

  const levelInfo = {
    1: { name: 'Level 1: Single Word', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
    2: { name: 'Level 2: Short Phrase', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
    3: { name: 'Level 3: Full Sentence', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
    4: { name: 'Level 4: Mini Dialogue', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  }[inferredLevel] || { name: 'Listening Practice', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' }

  // Show "tap to listen" hint after 1.5s if user hasn't played yet
  useEffect(() => {
    if (!hasPlayed) {
      const t = setTimeout(() => setShowHint(true), 1500)
      return () => clearTimeout(t)
    }
    setShowHint(false)
  }, [hasPlayed])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      ttsService.stop()
    }
  }, [])

  // Also stop when exercise changes (new textToSpeak)
  useEffect(() => {
    ttsService.stop()
    setHasPlayed(false)
    setReplayCount(0)
    setShowHint(false)
  }, [textToSpeak])

  const handleAudioPlay = (state) => {
    if (state === 'playing') {
      setHasPlayed(true)
      setReplayCount((prev) => prev + 1)
    }
  }

  if (!textToSpeak) {
    return (
      <div className="text-center py-8 text-[#D84B42]">
        <p className="font-semibold">⚠ Listening exercise: missing audio text</p>
        <p className="text-sm mt-1 text-[#77736B]">This exercise needs an audioText field.</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Level Badge Header */}
      <div className="flex items-center justify-between">
        <span className={`text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ${levelInfo.color} flex items-center gap-1`}>
          <Headphones size={13} />
          <span>{levelInfo.name}</span>
        </span>
        {replayCount > 0 && (
          <span className="text-[11px] font-bold text-[#77736B] dark:text-slate-400">
            Replays: {replayCount}
          </span>
        )}
      </div>

      {/* Header Prompt */}
      <h3 className="text-xl md:text-2xl font-bold text-[#25231F] dark:text-white text-center">
        {comprehensionQuestion || prompt || 'Listen carefully and select what you hear'}
      </h3>

      {/* Audio Controls Area */}
      <div className="flex flex-col items-center gap-3 py-3">
        {/* Main listen area */}
        <div className="flex items-center justify-center gap-4">
          {/* Normal speed */}
          <div className="flex flex-col items-center gap-2">
            <AudioButton
              text={textToSpeak}
              languageId={languageId}
              rate={0.88}
              variant="icon"
              size="large"
              label="Play audio"
              onStateChange={handleAudioPlay}
              className="w-20 h-20 !rounded-3xl shadow-xl hover:scale-105 transition-transform"
            />
            <span className="text-xs font-semibold text-[#77736B] dark:text-slate-400">
              {hasPlayed ? '↻ Replay (1.0x)' : '▶ Play (1.0x)'}
            </span>
          </div>

          {/* Slow speed */}
          <div className="flex flex-col items-center gap-2">
            <AudioButton
              text={textToSpeak}
              languageId={languageId}
              rate={0.52}
              variant="icon"
              size="medium"
              label="Play slowly"
              onStateChange={handleAudioPlay}
              className="w-14 h-14 !rounded-2xl shadow-md bg-[#3B82F6] hover:bg-[#2563EB] hover:scale-105 transition-transform"
            />
            <span className="text-xs font-semibold text-[#77736B] dark:text-slate-400">🐢 Slow (0.5x)</span>
          </div>
        </div>

        {/* Hint text */}
        {showHint && !hasPlayed && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-[#77736B] dark:text-slate-400 mt-1 flex items-center gap-1"
          >
            <Sparkles size={13} className="text-[#F39A45]" />
            <span>Tap the speaker icon to listen to the audio</span>
          </motion.p>
        )}
      </div>

      {/* What did you hear? */}
      <p className="text-center text-xs font-bold text-[#77736B] dark:text-slate-400 uppercase tracking-wider">
        {comprehensionQuestion ? 'Select the correct answer:' : 'What did you hear?'}
      </p>

      {/* Option Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
        {options.map((option, index) => {
          const isSelected = selectedAnswer === option
          const isCorrect = option === correctAnswer

          let cardStyle = 'border-[#E8E6E0] dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-[#0B8F62]/60 text-[#25231F] dark:text-white'

          if (isSelected) {
            if (showResult) {
              cardStyle = isCorrect
                ? 'border-[#2F9E69] bg-[#2F9E69]/15 text-[#2F9E69] font-extrabold shadow-md'
                : 'border-[#D84B42] bg-[#D84B42]/15 text-[#D84B42] font-extrabold'
            } else {
              cardStyle = 'border-[#0B8F62] bg-[#0B8F62]/10 text-[#0B8F62] dark:text-[#34D399] font-bold shadow-sm'
            }
          } else if (showResult && isCorrect) {
            cardStyle = 'border-[#2F9E69] bg-[#2F9E69]/10 text-[#2F9E69] font-bold'
          }

          return (
            <motion.button
              key={index}
              type="button"
              onClick={() => !showResult && !disabled && onSelectAnswer(option)}
              disabled={showResult || disabled}
              whileHover={!showResult && !disabled ? { scale: 1.02, y: -1 } : {}}
              whileTap={!showResult && !disabled ? { scale: 0.98 } : {}}
              className={`p-4 rounded-2xl border-2 text-center text-base font-bold transition-all ${cardStyle} ${showResult || disabled ? 'cursor-default' : 'cursor-pointer'}`}
            >
              {option}
            </motion.button>
          )
        })}
      </div>

      {/* Spoken Text Reveal on Answer */}
      {showResult && (
        <div className="p-3 bg-[#F7F5EF] dark:bg-slate-800/80 rounded-2xl border border-[#E8E6E0] dark:border-slate-700 text-center max-w-lg mx-auto">
          <p className="text-xs text-[#77736B] dark:text-slate-400">
            Audio Text:&nbsp;
            <span className="font-bold text-[#0B8F62] dark:text-[#34D399]">{textToSpeak}</span>
          </p>
        </div>
      )}
    </div>
  )
}

