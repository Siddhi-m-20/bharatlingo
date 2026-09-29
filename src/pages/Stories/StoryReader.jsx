/**
 * StoryReader — BharatLingo
 *
 * Features:
 * - Target-language text with audio per sentence
 * - Interface-language translation & explanation (toggleable)
 * - Pronunciation guide per segment
 * - Comprehension checkpoint questions
 * - Speaking practice segments (repeat the phrase)
 * - Word meanings on tap/hover
 * - XP + Gems on completion
 * - Level-adaptive display (beginner shows more help)
 * - Audio failure never blocks progression
 */

import { useState, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../services/auth'
import { useProgress } from '../../services/progress'
import { recordLearningActivity } from '../../services/dbService'
import { getStoryById } from '../../data/stories'
import { AudioService } from '../../services/audio/AudioService'
import AudioButton from '../../components/AudioButton/AudioButton'
import SpeakingExercise from '../../components/SpeakingExercise/SpeakingExercise'
import { ArrowLeft, Volume2, Sparkles, CheckCircle2, XCircle, Trophy, Mic } from 'lucide-react'
import { useTheme } from '../../services/themeContext'

// ── Word meaning tooltip ──────────────────────────────────────────────────────
function WordPill({ word, meaning, languageId }) {
  const [showMeaning, setShowMeaning] = useState(false)
  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={() => {
          setShowMeaning((v) => !v)
          AudioService.speak(word, languageId)
        }}
        className="underline decoration-dotted decoration-amber-500 cursor-pointer hover:text-amber-600 transition-colors"
        title={meaning || 'Tap to hear & see meaning'}
      >
        {word}
      </button>
      <AnimatePresence>
        {showMeaning && meaning && (
          <motion.span
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: -32, scale: 1 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute left-1/2 -translate-x-1/2 z-50 px-2.5 py-1 rounded-lg bg-amber-900 text-white text-xs font-semibold whitespace-nowrap shadow-xl pointer-events-none"
          >
            {meaning}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  )
}

// ── Speaking practice segment ─────────────────────────────────────────────────
function SpeakingSegment({ segment, languageId, onComplete }) {
  const { t } = useTheme()
  const [done, setDone] = useState(false)
  const handleSubmit = (answer) => {
    setDone(true)
    // Never penalize in story context — just mark complete
    setTimeout(() => onComplete(), 600)
  }
  const handleSkip = () => {
    setDone(true)
    setTimeout(() => onComplete(), 300)
  }
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-purple-200 dark:border-purple-800 p-6 md:p-8 shadow-lg">
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 dark:bg-purple-950/50 mb-4">
        <Mic className="w-3.5 h-3.5" /> Speaking Practice
      </div>
      {done ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-6 space-y-2"
        >
          <div className="text-4xl">🎤</div>
          <p className="font-bold text-purple-600 dark:text-purple-400">{t('great_practice') || 'Great practice!'}</p>
        </motion.div>
      ) : (
        <SpeakingExercise
          prompt={segment.prompt || `Say this aloud: "${segment.targetText}"`}
          targetWord={segment.targetText}
          pronunciation={segment.pronunciation}
          languageId={languageId}
          onSubmit={handleSubmit}
          onSkip={handleSkip}
          showResult={false}
        />
      )}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function StoryReader() {
  const { storyId } = useParams()
  const navigate = useNavigate()
  const { user, updateUser } = useAuth()
  const { addXP, addGems } = useProgress()
  const { t } = useTheme()

  const story = getStoryById(storyId)

  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [checkpointStatus, setCheckpointStatus] = useState(null) // 'correct' | 'wrong' | null
  const [completed, setCompleted] = useState(false)
  const [showTranslation, setShowTranslation] = useState(true)
  const [xpEarned, setXpEarned] = useState(0)
  const storyStartTimeRef = useRef(Date.now())

  const playAudio = useCallback((text) => {
    if (!text || !story) return
    // Audio failure never blocks story — just attempt silently
    AudioService.speak(text, story.languageId).catch(() => {})
  }, [story])

  // Determine help level based on user's proficiency
  const learnerLevel = user?.level || 'beginner'
  const showPronunciation = learnerLevel === 'beginner' || learnerLevel === 'elementary'
  const showTranslationByDefault = learnerLevel === 'beginner' || learnerLevel === 'elementary'

  if (!story) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <h2 className="text-xl font-bold mb-4">{t('story_not_found') || 'Story not found'}</h2>
        <button
          onClick={() => navigate('/stories')}
          className="px-6 py-2.5 rounded-full bg-amber-500 text-white font-bold"
        >
          {t('back_to_stories') || 'Back to Stories'}
        </button>
      </div>
    )
  }

  const currentSegment = story.segments[currentStepIndex]
  const isCheckpoint = currentSegment?.isCheckpoint
  const isSpeaking = currentSegment?.isSpeakingPractice
  const progressPercent = Math.round(((currentStepIndex + 1) / story.segments.length) * 100)

  const handleNext = () => {
    if (currentStepIndex + 1 < story.segments.length) {
      const nextIndex = currentStepIndex + 1
      setCurrentStepIndex(nextIndex)
      setSelectedOption(null)
      setCheckpointStatus(null)

      // Auto-play next segment audio
      const nextSeg = story.segments[nextIndex]
      if (nextSeg && !nextSeg.isCheckpoint && !nextSeg.isSpeakingPractice && nextSeg.audioText) {
        setTimeout(() => playAudio(nextSeg.audioText), 200)
      }
    } else {
      handleComplete()
    }
  }

  const handleCheckpointSelect = (opt) => {
    if (checkpointStatus === 'correct') return
    setSelectedOption(opt)

    if (opt === currentSegment.correctAnswer) {
      setCheckpointStatus('correct')
      AudioService.playChime(true)
      // Award XP for correct checkpoint
      const cpXP = 5
      addXP(cpXP)
      setXpEarned((prev) => prev + cpXP)
    } else {
      setCheckpointStatus('wrong')
      AudioService.playChime(false)
    }
  }

  const handleComplete = async () => {
    setCompleted(true)
    const baseXP = story.rewardXP || 30
    const totalXP = baseXP + xpEarned
    addXP(baseXP)
    addGems(story.rewardGems || 15)
    setXpEarned((prev) => prev + baseXP)

    if (user && updateUser) {
      const existing = Array.isArray(user.completedStories) ? user.completedStories : []
      if (!existing.includes(story.id)) {
        await updateUser({ completedStories: [...existing, story.id] })
      }
      await recordLearningActivity({
        userId: user.id,
        activityDate: new Date().toISOString().split('T')[0],
        exercisesCompleted: story.segments.filter((segment) => segment.isCheckpoint || segment.isSpeakingPractice).length,
        xpEarned: totalXP,
        sessionDurationSeconds: Math.max(1, Math.round((Date.now() - storyStartTimeRef.current) / 1000)),
        languageId,
        sessionType: 'story',
      })
    }
  }

  // ── Level badge colour ────────────────────────────────────────────────────
  const levelColor = {
    Beginner:     'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300',
    Elementary:   'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300',
    Intermediate: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300',
    Advanced:     'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300',
  }[story.level] || 'bg-slate-100 text-slate-600'

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={() => navigate('/stories')}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label={t('back_to_stories')}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Progress Bar */}
          <div className="flex-1 max-w-md">
            <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <p className="text-[10px] text-slate-400 text-right mt-0.5">
              {currentStepIndex + 1} / {story.segments.length}
            </p>
          </div>

          <button
            onClick={() => setShowTranslation(!showTranslation)}
            className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
              showTranslation
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30'
                : 'border-slate-300 dark:border-slate-700 text-slate-500'
            }`}
          >
            {showTranslation ? 'Hide translation' : 'Show translation'}
          </button>
        </div>
      </header>

      {/* ── Main Content ────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-6 flex flex-col">
        {!completed ? (
          <div className="space-y-5">
            {/* Story identity strip */}
            <div className="flex items-center gap-3">
              <span className="text-3xl">{story.coverEmoji || '📖'}</span>
              <div>
                <h2 className="font-black text-slate-900 dark:text-white text-lg leading-tight">
                  {story.title}
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
                    {story.titleEn}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${levelColor}`}>
                    {story.level}
                  </span>
                </div>
              </div>
            </div>

            {/* Current segment card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStepIndex}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
              >
                {/* ── CHECKPOINT ── */}
                {isCheckpoint && (
                  <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-amber-400/50 dark:border-amber-500/50 p-6 md:p-8 shadow-xl">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 dark:bg-amber-950/50 mb-4">
                      <Sparkles className="w-3.5 h-3.5" /> Story Checkpoint
                    </div>

                    <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-5">
                      {currentSegment.question}
                    </h3>

                    <div className="space-y-2.5">
                      {currentSegment.options.map((opt, idx) => {
                        const isSelected = selectedOption === opt
                        const isCorrectAnswer = opt === currentSegment.correctAnswer
                        let btnStyles = 'w-full text-left p-4 rounded-2xl border-2 font-medium text-sm transition-all duration-200 flex items-center justify-between cursor-pointer'

                        if (checkpointStatus === 'correct' && isCorrectAnswer) {
                          btnStyles += ' border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 shadow-md'
                        } else if (checkpointStatus === 'wrong' && isSelected) {
                          btnStyles += ' border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200'
                        } else if (isSelected) {
                          btnStyles += ' border-amber-500 bg-amber-50 dark:bg-amber-950/30'
                        } else {
                          btnStyles += ' border-slate-200 dark:border-slate-800 hover:border-amber-300 bg-slate-50/50 dark:bg-slate-800/50'
                        }

                        return (
                          <button key={idx} onClick={() => handleCheckpointSelect(opt)} className={btnStyles}>
                            <span>{opt}</span>
                            {checkpointStatus === 'correct' && isCorrectAnswer && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
                            {checkpointStatus === 'wrong' && isSelected && <XCircle className="w-5 h-5 text-rose-500 shrink-0" />}
                          </button>
                        )
                      })}
                    </div>

                    {checkpointStatus === 'correct' && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-start gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>✓ Correct! {currentSegment.explanation}</span>
                      </motion.div>
                    )}
                    {checkpointStatus === 'wrong' && (
                      <div className="mt-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs font-semibold">
                        ✗ Try again! Select the right answer to continue.
                      </div>
                    )}
                  </div>
                )}

                {/* ── SPEAKING PRACTICE ── */}
                {isSpeaking && (
                  <SpeakingSegment
                    segment={currentSegment}
                    languageId={story.languageId}
                    onComplete={handleNext}
                  />
                )}

                {/* ── DIALOGUE / NARRATIVE ── */}
                {!isCheckpoint && !isSpeaking && currentSegment && (
                  <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-lg">
                    {/* Speaker info */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl p-2 rounded-2xl bg-amber-50 dark:bg-amber-950/50 shadow-inner">
                          {currentSegment.avatar || '👤'}
                        </span>
                        <div>
                          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                            {currentSegment.speaker}
                          </h4>
                          <span className="text-[11px] text-slate-400">
                            {story.languageId.toUpperCase()} Speaker
                          </span>
                        </div>
                      </div>

                      {/* Audio button for this sentence */}
                      {currentSegment.audioText && (
                        <AudioButton
                          text={currentSegment.audioText}
                          languageId={story.languageId}
                          variant="icon"
                          size="medium"
                          label="Play sentence audio"
                        />
                      )}
                    </div>

                    {/* Main native text (large, bold) */}
                    <div className="my-5 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                      <p className="text-xl md:text-2xl font-black text-slate-900 dark:text-white leading-relaxed tracking-wide">
                        {currentSegment.text}
                      </p>

                      {/* Pronunciation guide (beginner/elementary only) */}
                      {showPronunciation && currentSegment.pronunciation && (
                        <p className="text-xs md:text-sm font-medium text-amber-600 dark:text-amber-400 mt-2 italic">
                          /{currentSegment.pronunciation}/
                        </p>
                      )}
                    </div>

                    {/* Translation (toggleable) */}
                    <AnimatePresence>
                      {showTranslation && currentSegment.translation && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-300 border-l-2 border-amber-500 pl-3 py-1">
                            {currentSegment.translation}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Key words / vocabulary highlight */}
                    {currentSegment.keyWords && currentSegment.keyWords.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                          Key Words — tap to hear:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {currentSegment.keyWords.map((kw, ki) => (
                            <WordPill
                              key={ki}
                              word={kw.word}
                              meaning={kw.meaning}
                              languageId={story.languageId}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* ── Action bar ── */}
            {!isSpeaking && (
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-slate-400 font-medium">
                  {currentStepIndex + 1} of {story.segments.length}
                </div>
                {isCheckpoint ? (
                  <button
                    disabled={checkpointStatus !== 'correct'}
                    onClick={handleNext}
                    className={`px-8 py-3 rounded-full font-bold text-sm shadow-lg transition-all ${
                      checkpointStatus === 'correct'
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-emerald-500/25 hover:scale-105 active:scale-95 cursor-pointer'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    Continue →
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="px-8 py-3 rounded-full font-bold text-sm bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    {currentStepIndex + 1 === story.segments.length ? 'Finish Story 🏆' : 'Next →'}
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          /* ── COMPLETION SCREEN ── */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex items-center justify-center"
          >
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 md:p-12 text-center shadow-2xl w-full max-w-md">
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-5xl shadow-xl shadow-amber-500/30 mb-6">
                🎉
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-2">
                Story Complete!
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto mb-8">
                You finished{' '}
                <span className="font-bold text-amber-600 dark:text-amber-400">"{story.title}"</span>{' '}
                and tested your comprehension.
              </p>

              {/* Rewards */}
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 min-w-[100px]">
                  <div className="flex items-center justify-center gap-1 text-amber-600 dark:text-amber-400 font-black text-xl">
                    <Trophy className="w-5 h-5" /> +{xpEarned}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500 mt-1">XP Earned</div>
                </div>
                <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800/60 min-w-[100px]">
                  <div className="flex items-center justify-center gap-1 text-sky-600 dark:text-sky-400 font-black text-xl">
                    💎 +{story.rewardGems}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500 mt-1">Gems Earned</div>
                </div>
              </div>

              <div className="flex gap-3 flex-col sm:flex-row">
                <button
                  onClick={() => navigate('/lesson/' + (user?.learningLanguage || 'hi') + '-gen-greetings-0')}
                  className="flex-1 py-3.5 rounded-2xl bg-[#0B8F62] text-white font-bold text-sm shadow-lg hover:scale-105 active:scale-95 transition-all"
                >
                  Next Lesson →
                </button>
                <button
                  onClick={() => navigate('/stories')}
                  className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm shadow-lg hover:scale-105 active:scale-95 transition-all"
                >
                  More Stories
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}
