/**
 * Dashboard — BharatLingo
 *
 * Truly Adaptive Learning Hub (Duolingo / Bhasha-inspired)
 *
 * Core Features:
 * 1. "Your Next Lesson" / "Personalized Practice" Hero Card (with dynamic pedagogical rationale)
 * 2. Spaced Review & Weak Area Quick Drills
 * 3. Topic Discovery Grid (Explore topics with real-time adaptive exercise selection)
 * 5. Clean, modern, responsive aesthetics without fixed sequential lesson numbers.
 */

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../services/auth'
import { useProgress } from '../../services/progress'
import { fetchNextAdaptiveLesson } from '../../services/dynamicLessonService'
import { fetchLearningAnalytics } from '../../services/dbService'
import { getLanguageById } from '../../data/languages'
import { getSkillProficiencies, getWeakAreas, getReviewCandidates, TOPIC_CATEGORIES } from '../../services/learnerModel'
import { useTheme } from '../../services/themeContext'
import AppSidebar from '../../components/Navigation/AppSidebar'
import RightSidebar from '../../components/RightSidebar/RightSidebar'
import LanguageFlag from '../../components/LanguageFlag/LanguageFlag'
import AlphabetModal from '../../components/AlphabetModal/AlphabetModal'
import {
  Play,
  Sparkles,
  Flame,
  ArrowRight,
  RefreshCw,
  Zap,
  Compass,
  AlertTriangle,
  Brain,
  ShieldCheck,
  X,
} from 'lucide-react'

function getDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { streak, gems } = useProgress()
  const { t } = useTheme()

  const [nextLesson, setNextLesson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [skillStats, setSkillStats] = useState(() => getSkillProficiencies(user?.learningLanguage || 'hi'))
  const [weakAreas, setWeakAreas] = useState({ topics: [], skills: [], hasWeaknesses: false })
  const [dueReviews, setDueReviews] = useState([])
  const [showAlphabetModal, setShowAlphabetModal] = useState(false)
  const [showPlanBanner, setShowPlanBanner] = useState(false)
  const [analytics, setAnalytics] = useState({ activity: [], lessonAttempts: [], longestStreak: 0 })
  const [showStreakDetails, setShowStreakDetails] = useState(false)

  const learningLang = getLanguageById(user?.learningLanguage) || { name: 'Hindi', nativeName: 'हिन्दी', id: 'hi' }
  const preferredLang = getLanguageById(user?.preferredLanguage || 'en') || { name: 'English', id: 'en' }

  useEffect(() => {
    if (!user?.learningLanguage || !user?.goal) {
      navigate('/onboarding')
      return
    }

    if (
      !user?.hasCompletedAssessment &&
      (user?.assessmentScore === null || user?.assessmentScore === undefined) &&
      (!user?.completedLessons || user.completedLessons.length === 0)
    ) {
      navigate('/assessment')
      return
    }

    // Check if user just completed placement assessment
    const justAssessed = sessionStorage.getItem('bharatlingo_just_assessed')
    if (justAssessed && user.learningPlan) {
      setShowPlanBanner(true)
      sessionStorage.removeItem('bharatlingo_just_assessed')
    }

    async function loadAdaptiveDashboard() {
      setLoading(true)
      const langId = user.learningLanguage || 'hi'
      const preferredId = user.preferredLanguage || 'en'

      // 1. Fetch learner proficiencies & weak areas
      const skills = getSkillProficiencies(langId)
      const weak = getWeakAreas(langId)
      const reviews = getReviewCandidates(langId, 4)

      setSkillStats(skills)
      setWeakAreas(weak)
      setDueReviews(reviews)

      if (user.id) {
        setAnalytics(await fetchLearningAnalytics(user.id, langId))
      }

      // 2. Fetch the dynamically selected next lesson
      try {
        const adaptiveLesson = await fetchNextAdaptiveLesson({
          languageId: langId,
          preferredLang: preferredId,
          level: user.level || 'beginner',
          goal: user.goal || 'conversation',
        })
        setNextLesson(adaptiveLesson)
      } catch (err) {
        console.warn('[Dashboard] Failed to load adaptive lesson:', err)
      } finally {
        setLoading(false)
      }
    }

    loadAdaptiveDashboard()
  }, [user, navigate])

  const handleStartLesson = (topicId = null) => {
    if (topicId) {
      navigate(`/lesson/${learningLang.id}-adaptive-${topicId}-${Date.now()}`)
    } else if (nextLesson) {
      navigate(`/lesson/${nextLesson.id}`)
    } else {
      navigate(`/lesson/${learningLang.id}-adaptive-greetings-${Date.now()}`)
    }
  }

  const getDifficultyBadge = (level = 1) => {
    switch (level) {
      case 5: return { label: 'Mastery', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' }
      case 4: return { label: 'Advanced', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' }
      case 3: return { label: 'Intermediate', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' }
      case 2: return { label: 'Elementary', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' }
      default: return { label: 'Beginner', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' }
    }
  }

  const activityByDate = analytics.activity.reduce((result, item) => {
    const current = result[item.activity_date] || {
      activity_date: item.activity_date,
      exercises_completed: 0,
      xp_earned: 0,
      session_duration_seconds: 0,
    }
    result[item.activity_date] = {
      ...current,
      exercises_completed: current.exercises_completed + (Number(item.exercises_completed) || 0),
      xp_earned: current.xp_earned + (Number(item.xp_earned) || 0),
      session_duration_seconds: current.session_duration_seconds + (Number(item.session_duration_seconds) || 0),
    }
    return result
  }, {})
  const practicedDates = new Set([
    ...Object.entries(activityByDate)
      .filter(([, activity]) => (Number(activity.exercises_completed) || 0) > 0 || (Number(activity.session_duration_seconds) || 0) > 0 || (Number(activity.xp_earned) || 0) > 0)
      .map(([dateKey]) => dateKey),
    ...analytics.lessonAttempts.map((attempt) => attempt.completed_at?.slice(0, 10)).filter(Boolean),
  ])
  const persistedStreak = Number(user?.streak) || 0
  if (user?.lastActiveDate && persistedStreak > 0) {
    const lastActiveDate = new Date(`${user.lastActiveDate}T12:00:00`)
    for (let offset = 0; offset < persistedStreak; offset += 1) {
      const streakDate = new Date(lastActiveDate)
      streakDate.setDate(streakDate.getDate() - offset)
      practicedDates.add(getDateKey(streakDate))
    }
  }
  const todayKey = getDateKey(new Date())
  const currentWeek = Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setHours(12, 0, 0, 0)
    const mondayOffset = (date.getDay() + 6) % 7
    date.setDate(date.getDate() - mondayOffset + index)
    return { date, dateKey: getDateKey(date) }
  })
  const persistedLearnerStats = user?.learnerStats?.[learningLang.id]
  const persistedSkills = persistedLearnerStats?.skills
  const persistedTopics = persistedLearnerStats?.topics || {}
  const masteryTopics = Object.values(persistedTopics).filter((topic) => topic.attempts > 0)
  const mastery = masteryTopics.length > 0
    ? Math.round(masteryTopics.reduce((sum, topic) => sum + (Number(topic.masteryLevel) || 0), 0) / masteryTopics.length / 5 * 100)
    : 0
  const displaySkills = persistedSkills
    ? {
        vocabulary: Number(persistedSkills.vocabulary?.score) || 0,
        listening: Number(persistedSkills.listening?.score) || 0,
        speaking: Number(persistedSkills.speaking?.score) || 0,
        grammar: Number(persistedSkills.grammar?.score) || 0,
        overall: Number(persistedLearnerStats.overallAccuracy) || 0,
        difficulty: Number(persistedLearnerStats.currentDifficultyLevel) || 1,
      }
    : skillStats
    const diffBadge = getDifficultyBadge(displaySkills.difficulty)
  return (
    <div className="min-h-screen bg-[#F7F5EF] dark:bg-slate-950 flex justify-center pb-20 md:pb-6">
      {/* 1. LEFT SIDEBAR NAVIGATION */}
      <AppSidebar />

      {/* 2. CENTER CONTENT */}
      <main className="flex-1 max-w-[640px] md:ml-72 px-4 py-5 space-y-4">

        {/* ── Placement Plan Welcome Banner (Dismissible) ───────────────── */}
        <AnimatePresence>
          {showPlanBanner && user.learningPlan && (
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-gradient-to-r from-[#0B8F62] via-[#0ea5e9] to-[#3B82F6] rounded-2xl p-4 text-white relative overflow-hidden shadow-sm"
            >
              <button
                onClick={() => setShowPlanBanner(false)}
                className="absolute top-2.5 right-3 text-white/70 hover:text-white text-lg font-bold"
                aria-label="Dismiss"
              >
                ×
              </button>
              <div className="flex items-start gap-3">
                <div className="text-2xl">🎯</div>
                <div className="flex-1">
                  <p className="font-extrabold text-xs uppercase tracking-wider text-white/80 mb-0.5">{t('personalized_path') || 'Your Personalized Path'}</p>
                  <p className="font-bold text-sm">
                    {user.learningPlan.startingLevel} · {user.learningPlan.goal}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {(user.learningPlan.focusAreas || []).slice(0, 3).map((area, i) => (
                      <span key={i} className="text-[11px] font-semibold bg-white/20 px-2 py-0.5 rounded-full">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── 1. COURSE HEADER & "YOUR NEXT LESSON" HERO CARD ──────────── */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-[#E8E6E0] dark:border-slate-800 p-5 space-y-4">
          
          {/* Header Bar: Flag, Course Name & Overall Mastery */}
          <div className="flex items-center justify-between pb-3.5 border-b border-[#E8E6E0]/70 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <LanguageFlag languageId={learningLang.id} size={36} className="shadow-sm" />
              <div>
                <h1 className="text-lg font-black text-[#25231F] dark:text-white leading-tight">
                  {learningLang.name}
                </h1>
                <p className="text-[11px] text-[#77736B] dark:text-slate-400">
                  {learningLang.nativeName} · <span className="font-bold text-[#0B8F62] dark:text-[#34D399]">{preferredLang?.name || 'English'}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 text-xs font-black rounded-xl uppercase tracking-wider ${diffBadge.color}`}>
                {diffBadge.label}
              </span>
              <span className="px-2.5 py-1 bg-[#0B8F62]/10 text-[#0B8F62] dark:text-[#34D399] text-xs font-black rounded-xl">
                {displaySkills.overall}% {t('accuracy')}
              </span>
            </div>
          </div>

          {/* "Your Next Lesson" Dynamic Hero Showcase */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-black text-[#0B8F62] dark:text-[#34D399] uppercase tracking-wider">
                <Sparkles size={15} />
                <span>{t('continue_lesson') || 'Your Next Lesson'}</span>
              </div>
              <span className="text-[11px] font-bold text-[#77736B] dark:text-slate-400">
                ~5 mins · 10–12 exercises
              </span>
            </div>

            {loading ? (
              <div className="bg-[#F7F5EF]/80 dark:bg-slate-800/60 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 border border-[#E8E6E0] dark:border-slate-700">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  className="w-6 h-6 border-2 border-[#0B8F62] border-t-transparent rounded-full"
                />
                <p className="text-xs text-[#77736B] dark:text-slate-400 font-bold">
                  Selecting optimal exercises...
                </p>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-[#F7F5EF] to-[#EDE8DE] dark:from-slate-800/80 dark:to-slate-800/40 rounded-2xl p-4 border border-[#E8E6E0] dark:border-slate-700/80 space-y-3 shadow-xs">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-[#E8E6E0] dark:border-slate-700 flex items-center justify-center text-3xl shrink-0">
                      {nextLesson?.topicIcon || '📚'}
                    </div>
                    <div>
                      <h3 className="font-black text-base text-[#25231F] dark:text-white">
                        {nextLesson?.name || 'Everyday Essentials'}
                      </h3>
                      <p className="text-xs text-[#77736B] dark:text-slate-400 font-medium">
                        {nextLesson?.nameNative || learningLang.nativeName}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pedagogical Rationale Banner */}
                <div className="bg-white/80 dark:bg-slate-900/80 rounded-xl p-2.5 border border-[#E8E6E0] dark:border-slate-700 flex items-start gap-2 text-xs">
                  <Brain size={16} className="text-[#0B8F62] shrink-0 mt-0.5" />
                  <p className="text-[#25231F] dark:text-slate-200 font-semibold leading-relaxed">
                    <span className="font-black text-[#0B8F62]">{t('adapts_dynamically')}: </span>
                    {nextLesson?.rationale || nextLesson?.description || 'Active recall & listening reinforcement.'}
                  </p>
                </div>

                {/* Primary Action King Button */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleStartLesson()}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-[#0B8F62] to-[#10B981] hover:from-[#097b54] hover:to-[#059669] text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-[#0B8F62]/20 hover:shadow-lg transition-all cursor-pointer"
                >
                  <Play size={16} className="fill-white" />
                  <span>{t('start_lesson') || 'Start Lesson'}</span>
                </motion.button>
              </div>
            )}
          </div>
        </div>

        {/* ── 3. SUBORDINATED QUICK TOOLS ──────────────────────────────── */}
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => navigate('/stories')}
            className="flex flex-col items-center justify-center p-2.5 bg-white dark:bg-slate-900 hover:bg-amber-50/50 dark:hover:bg-slate-800/80 border border-[#E8E6E0] dark:border-slate-800 rounded-2xl transition-all group cursor-pointer"
          >
            <span className="text-xl mb-1 group-hover:scale-110 transition-transform">📖</span>
            <span className="text-[11px] font-bold text-[#25231F] dark:text-slate-200">{t('stories')}</span>
          </button>

          <button
            onClick={() => navigate('/tutor')}
            className="flex flex-col items-center justify-center p-2.5 bg-white dark:bg-slate-900 hover:bg-indigo-50/50 dark:hover:bg-slate-800/80 border border-[#E8E6E0] dark:border-slate-800 rounded-2xl transition-all group cursor-pointer"
          >
            <span className="text-xl mb-1 group-hover:scale-110 transition-transform">🤖</span>
            <span className="text-[11px] font-bold text-[#25231F] dark:text-slate-200">{t('tutor')}</span>
          </button>

          <button
            onClick={() => navigate('/writing')}
            className="flex flex-col items-center justify-center p-2.5 bg-white dark:bg-slate-900 hover:bg-emerald-50/50 dark:hover:bg-slate-800/80 border border-[#E8E6E0] dark:border-slate-800 rounded-2xl transition-all group cursor-pointer"
          >
            <span className="text-xl mb-1 group-hover:scale-110 transition-transform">✍️</span>
            <span className="text-[11px] font-bold text-[#25231F] dark:text-slate-200">{t('writing')}</span>
          </button>

          <button
            onClick={() => navigate('/letters')}
            className="flex flex-col items-center justify-center p-2.5 bg-white dark:bg-slate-900 hover:bg-purple-50/50 dark:hover:bg-slate-800/80 border border-[#E8E6E0] dark:border-slate-800 rounded-2xl transition-all group cursor-pointer"
          >
            <span className="text-xl mb-1 group-hover:scale-110 transition-transform">🔤</span>
            <span className="text-[11px] font-bold text-[#25231F] dark:text-slate-200">{t('letters')}</span>
          </button>
        </div>

        {/* ── 4. SPACED REVIEW & WEAK TOPIC QUICK DRILLS ──────────────── */}
        {dueReviews.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-[#E8E6E0] dark:border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-black text-[#D84B42] dark:text-[#F87171] uppercase tracking-wider">
                <RefreshCw size={14} className="animate-spin" style={{ animationDuration: '8s' }} />
                <span>{t('review_candidates') || 'Spaced Review Ready'}</span>
              </div>
              <span className="text-[11px] font-bold text-[#77736B] dark:text-slate-400">
                {dueReviews.length} words
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {dueReviews.map((item, idx) => (
                <div
                  key={idx}
                  className="px-3 py-1.5 bg-[#F7F5EF] dark:bg-slate-800 rounded-xl border border-[#E8E6E0] dark:border-slate-700 text-xs font-bold text-[#25231F] dark:text-slate-200 flex items-center gap-1.5"
                >
                  <span>{item.word}</span>
                  <span className="text-[10px] text-[#77736B] dark:text-slate-400 font-normal">({item.translation})</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate('/practice')}
              className="w-full py-2 bg-[#D84B42]/10 hover:bg-[#D84B42]/20 text-[#D84B42] dark:text-[#F87171] rounded-xl text-xs font-black transition-colors flex items-center justify-center gap-1.5"
            >
              <span>{t('need_review') || 'Practice Due Reviews'}</span>
              <ArrowRight size={13} />
            </button>
          </div>
        )}

        {/* ── 5. TOPIC DISCOVERY HUB (Explore Topics Adaptively) ──────── */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-[#E8E6E0] dark:border-slate-800 p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E8E6E0]/70 dark:border-slate-800">
            <div>
              <h2 className="font-black text-sm text-[#25231F] dark:text-white flex items-center gap-1.5">
                <Compass size={16} className="text-[#0B8F62]" />
                Explore Topics
              </h2>
              <p className="text-[11px] text-[#77736B] dark:text-slate-400 font-medium">
                Tap any topic — the engine will construct a personalized exercise set
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
            {TOPIC_CATEGORIES.slice(0, 6).map((topic) => {
              const isWeak = weakAreas.topics.some((w) => w.id === topic.id)
              return (
                <motion.button
                  key={topic.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleStartLesson(topic.id)}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between h-24 ${
                    isWeak
                      ? 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60'
                      : 'bg-[#F7F5EF]/60 dark:bg-slate-800/60 border-[#E8E6E0] dark:border-slate-700/60 hover:border-[#0B8F62]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{topic.icon}</span>
                    {isWeak && (
                      <span className="px-1.5 py-0.5 bg-rose-500 text-white text-[9px] font-black rounded-md">
                        Needs Focus
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-black text-xs text-[#25231F] dark:text-white leading-tight">
                      {topic.name}
                    </p>
                    <span className="text-[10px] text-[#0B8F62] font-bold flex items-center gap-0.5 mt-0.5">
                      <span>Practice</span>
                      <ArrowRight size={10} />
                    </span>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </div>

      </main>

      {/* Streak details opened from the flame badge */}
      <AnimatePresence>
        {showStreakDetails && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-[#25231F]/40 p-0 sm:items-center sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowStreakDetails(false)}
          >
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-labelledby="streak-details-title"
              className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl dark:bg-slate-900 sm:rounded-3xl"
              initial={{ y: 32 }}
              animate={{ y: 0 }}
              exit={{ y: 32 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-[#D84B42]">
                    <Flame size={22} fill="currentColor" />
                    <h2 id="streak-details-title" className="text-lg font-black text-[#25231F] dark:text-white">Streak details</h2>
                  </div>
                  <p className="mt-1 text-xs text-[#77736B] dark:text-slate-400">Keep building your daily learning habit.</p>
                </div>
                <button type="button" onClick={() => setShowStreakDetails(false)} className="rounded-lg p-1 text-[#77736B] hover:bg-[#F7F5EF] dark:hover:bg-slate-800" aria-label="Close streak details">
                  <X size={18} />
                </button>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2.5">
                <div className="rounded-2xl bg-[#D84B42]/10 p-3">
                  <p className="text-[10px] font-bold uppercase text-[#D84B42]">{t('current_streak')}</p>
                  <p className="mt-1 text-2xl font-black text-[#25231F] dark:text-white">{streak} days</p>
                </div>
                <div className="rounded-2xl bg-[#F7F5EF] p-3 dark:bg-slate-800">
                  <p className="text-[10px] font-bold uppercase text-[#77736B] dark:text-slate-400">{t('longest_streak')}</p>
                  <p className="mt-1 text-2xl font-black text-[#25231F] dark:text-white">{Math.max(analytics.longestStreak, streak)} days</p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-[#E8E6E0] p-3 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#25231F] dark:text-white">This week</h3>
                  <span className={`text-[10px] font-bold ${practicedDates.has(todayKey) ? 'text-[#0B8F62]' : 'text-[#D84B42]'}`}>
                    {practicedDates.has(todayKey) ? 'Today complete' : 'Today not complete'}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-7 gap-1.5">
                  {currentWeek.map(({ date, dateKey }) => (
                    <div key={dateKey} className="text-center">
                      <p className="text-[9px] font-bold text-[#77736B] dark:text-slate-400">{date.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 2)}</p>
                      <div className={`mx-auto mt-1 flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-black ${practicedDates.has(dateKey) ? 'bg-[#0B8F62] text-white' : 'bg-[#E8E6E0] text-[#77736B] dark:bg-slate-700 dark:text-slate-400'}`}>
                        {date.getDate()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#25231F] dark:text-white">Milestones</h3>
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {[7, 30, 100, 365].map((milestone) => (
                    <div key={milestone} className={`rounded-xl p-2 text-center ${streak >= milestone ? 'bg-[#0B8F62]/10 text-[#0B8F62]' : 'bg-[#F7F5EF] text-[#77736B] dark:bg-slate-800 dark:text-slate-400'}`}>
                      <Flame size={14} className="mx-auto" fill={streak >= milestone ? 'currentColor' : 'none'} />
                      <p className="mt-1 text-[10px] font-black">{milestone} days</p>
                    </div>
                  ))}
                </div>
              </div>

              {!practicedDates.has(todayKey) && (
                <button type="button" onClick={() => { setShowStreakDetails(false); handleStartLesson() }} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B8F62] px-4 py-3 text-xs font-black text-white hover:bg-[#097b54]">
                  <Flame size={15} /> Keep your streak going
                </button>
              )}
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. RIGHT SIDEBAR (Stats, Streaks, Leaderboard) */}
      <RightSidebar onStreakClick={() => setShowStreakDetails(true)} />

      {/* Alphabet Modal */}
      <AlphabetModal
        languageId={user.learningLanguage}
        languageName={learningLang.name}
        isOpen={showAlphabetModal}
        onClose={() => setShowAlphabetModal(false)}
      />
    </div>
  )
}
