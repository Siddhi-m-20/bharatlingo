import { motion } from 'framer-motion'
import { Flame, Zap, ArrowRight, Home, RotateCcw, Target, Sparkles } from 'lucide-react'
import Button from '../Button'
import BharatMascot from '../Mascot/BharatMascot'

export default function CelebrationModal({
  totalXP = 25,
  streak = 1,
  streakIncreased = true,
  isPerfect = false,
  accuracy = 100,
  nextLesson = null,
  onContinueNext,
  onReplayTopic,
  onPracticeWeak,
  onGoDashboard,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-4 px-2 space-y-5"
    >
      {/* Celebration Mascot & Header */}
      <div className="flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ duration: 0.5 }}
          className="mb-2"
        >
          <BharatMascot size={84} mood="celebrating" />
        </motion.div>
        <h2 className="text-2xl sm:text-3xl font-black text-[#25231F] dark:text-white">Lesson Complete!</h2>
        <p className="text-xs sm:text-sm font-semibold text-[#77736B] dark:text-slate-400 mt-0.5">
          {accuracy}% Accuracy {isPerfect && '• Perfect Score! ⭐'}
        </p>
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
        {/* XP Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-3.5 bg-[#F39A45]/15 dark:bg-[#F39A45]/20 border-2 border-[#F39A45]/40 rounded-2xl flex flex-col items-center justify-center shadow-sm"
        >
          <div className="w-9 h-9 rounded-full bg-[#F39A45] flex items-center justify-center text-white mb-1 shadow-md shadow-[#F39A45]/40">
            <Zap size={20} fill="currentColor" />
          </div>
          <span className="text-xl sm:text-2xl font-black text-[#F39A45] dark:text-[#FBBF24]">+{totalXP} XP</span>
          <span className="text-[11px] font-bold text-[#77736B] dark:text-slate-400 uppercase tracking-wide">Total Earned</span>
        </motion.div>

        {/* Streak Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-3.5 bg-[#D84B42]/15 dark:bg-[#D84B42]/20 border-2 border-[#D84B42]/40 rounded-2xl flex flex-col items-center justify-center shadow-sm relative overflow-hidden"
        >
          {streakIncreased && (
            <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-[#D84B42] text-white text-[10px] font-black rounded-md">
              +1
            </span>
          )}
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-9 h-9 rounded-full bg-[#D84B42] flex items-center justify-center text-white mb-1 shadow-md shadow-[#D84B42]/40"
          >
            <Flame size={20} fill="currentColor" />
          </motion.div>
          <span className="text-xl sm:text-2xl font-black text-[#D84B42] dark:text-[#F87171]">
            {streak} {streak === 1 ? 'Day' : 'Days'}
          </span>
          <span className="text-[11px] font-bold text-[#77736B] dark:text-slate-400 uppercase tracking-wide">
            {streakIncreased ? 'Streak Increased!' : 'Streak Active'}
          </span>
        </motion.div>
      </div>

      {/* Next Lesson Unlocked Preview Banner */}
      {nextLesson && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={onContinueNext}
          className="p-3.5 bg-[#0B8F62]/10 dark:bg-[#0B8F62]/20 border-2 border-[#0B8F62]/30 hover:border-[#0B8F62] rounded-2xl text-left flex items-center justify-between max-w-md mx-auto cursor-pointer transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0B8F62] text-white flex items-center justify-center shadow-md shadow-[#0B8F62]/30 text-xl group-hover:scale-105 transition-transform">
              {nextLesson.topicIcon || '🎯'}
            </div>
            <div>
              <p className="text-[10px] font-black text-[#0B8F62] dark:text-[#34D399] uppercase tracking-wider">Up Next</p>
              <p className="text-sm font-black text-[#25231F] dark:text-white leading-tight">{nextLesson.name}</p>
              <p className="text-[11px] text-[#77736B] dark:text-slate-400 truncate max-w-[210px] mt-0.5">
                {nextLesson.rationale || nextLesson.nameNative}
              </p>
            </div>
          </div>
          <ArrowRight size={18} className="text-[#0B8F62] dark:text-[#34D399] shrink-0 group-hover:translate-x-1 transition-transform" />
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3 max-w-md mx-auto pt-2">
        {/* Next Lesson Primary Button */}
        <Button
          size="large"
          className="w-full justify-center flex items-center gap-2 font-bold py-3 text-base sm:text-lg bg-[#0B8F62] hover:bg-[#0FB878] text-white shadow-md shadow-[#0B8F62]/20 rounded-xl"
          onClick={onContinueNext}
        >
          <span>Continue to Next Lesson</span>
          <ArrowRight size={18} />
        </Button>

        {/* Return to Dashboard Secondary Button */}
        <Button
          variant="outline"
          size="large"
          className="w-full justify-center flex items-center gap-2 font-bold py-3 text-base sm:text-lg border-2 border-[#0B8F62] text-[#0B8F62] hover:bg-[#0B8F62] hover:text-white rounded-xl transition-all"
          onClick={onGoDashboard}
        >
          <Home size={18} />
          <span>Return to Dashboard</span>
        </Button>

        {/* Quick Practice Alternatives */}
        {(onReplayTopic || onPracticeWeak) && (
          <div className="grid grid-cols-2 gap-2 pt-1">
            {onReplayTopic && (
              <button
                type="button"
                onClick={onReplayTopic}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                <RotateCcw size={14} className="text-amber-500" />
                <span>Practice Again</span>
              </button>
            )}

            {onPracticeWeak && (
              <button
                type="button"
                onClick={onPracticeWeak}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                <Target size={14} className="text-blue-500" />
                <span>Review Words</span>
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
