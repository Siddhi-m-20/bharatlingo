import { motion } from 'framer-motion'
import { Flame, Zap, Award, ArrowRight, Home, CheckCircle2 } from 'lucide-react'
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
  onGoDashboard,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-4 px-2 space-y-6"
    >
      {/* Celebration Mascot & Header */}
      <div className="flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ duration: 0.5 }}
          className="mb-3"
        >
          <BharatMascot size={88} mood="celebrating" />
        </motion.div>
        <h2 className="text-3xl font-black text-[#25231F] dark:text-white">Lesson Complete!</h2>
        <p className="text-sm font-semibold text-[#77736B] dark:text-slate-400 mt-1">
          {accuracy}% Accuracy {isPerfect && '• Perfect Score! ⭐'}
        </p>
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-2 gap-3.5 max-w-md mx-auto">
        {/* XP Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 bg-[#F39A45]/15 dark:bg-[#F39A45]/20 border-2 border-[#F39A45]/40 rounded-2xl flex flex-col items-center justify-center shadow-sm"
        >
          <div className="w-10 h-10 rounded-full bg-[#F39A45] flex items-center justify-center text-white mb-1 shadow-md shadow-[#F39A45]/40">
            <Zap size={22} fill="currentColor" />
          </div>
          <span className="text-2xl font-black text-[#F39A45] dark:text-[#FBBF24]">+{totalXP} XP</span>
          <span className="text-xs font-bold text-[#77736B] dark:text-slate-400 uppercase tracking-wide">Earned</span>
        </motion.div>

        {/* Streak Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 bg-[#D84B42]/15 dark:bg-[#D84B42]/20 border-2 border-[#D84B42]/40 rounded-2xl flex flex-col items-center justify-center shadow-sm relative overflow-hidden"
        >
          {streakIncreased && (
            <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-[#D84B42] text-white text-[10px] font-black rounded-md">
              +1
            </span>
          )}
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-10 h-10 rounded-full bg-[#D84B42] flex items-center justify-center text-white mb-1 shadow-md shadow-[#D84B42]/40"
          >
            <Flame size={22} fill="currentColor" />
          </motion.div>
          <span className="text-2xl font-black text-[#D84B42] dark:text-[#F87171]">
            {streak} {streak === 1 ? 'Day' : 'Days'}
          </span>
          <span className="text-xs font-bold text-[#77736B] dark:text-slate-400 uppercase tracking-wide">
            {streakIncreased ? 'Streak Increased!' : 'Streak Active'}
          </span>
        </motion.div>
      </div>

      {/* Next Lesson Unlocked Card */}
      {nextLesson && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-4 bg-[#0B8F62]/10 dark:bg-[#0B8F62]/20 border-2 border-[#0B8F62]/30 rounded-2xl text-left flex items-center justify-between max-w-md mx-auto"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0B8F62] text-white flex items-center justify-center shadow-md shadow-[#0B8F62]/30 text-xl">
              {nextLesson.topicIcon || '🎯'}
            </div>
            <div>
              <p className="text-[10px] font-black text-[#0B8F62] dark:text-[#34D399] uppercase tracking-wider">Next Adaptive Session</p>
              <p className="text-sm font-black text-[#25231F] dark:text-white">{nextLesson.name}</p>
              <p className="text-[11px] text-[#77736B] dark:text-slate-400 truncate max-w-[220px]">
                {nextLesson.rationale || nextLesson.nameNative}
              </p>
            </div>
          </div>
          <ArrowRight size={18} className="text-[#0B8F62] dark:text-[#34D399] shrink-0" />
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2.5 max-w-md mx-auto pt-2">
        {nextLesson ? (
          <Button size="large" className="w-full justify-center flex items-center gap-2 font-black" onClick={onContinueNext}>
            <span>Continue to Next Lesson</span>
            <ArrowRight size={18} />
          </Button>
        ) : null}

        <Button
          variant={nextLesson ? 'outline' : 'primary'}
          size="large"
          className="w-full justify-center flex items-center gap-2 font-black"
          onClick={onGoDashboard}
        >
          <Home size={18} />
          <span>Go to Dashboard</span>
        </Button>
      </div>
    </motion.div>
  )
}
