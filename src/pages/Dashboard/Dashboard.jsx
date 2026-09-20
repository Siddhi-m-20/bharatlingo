/**
 * Dashboard — BharatLingo
 *
 * Truly Adaptive Learning Hub (Duolingo / Bhasha-inspired)
 * Powered strictly by authentic persisted user data, SM-2 retention metrics,
 * real learning activity history, and dynamic adaptive lesson sequencing.
 *
 * Milestone 3B Additions:
 * 1. Learning progress overview (completed lessons, exercises, accuracy/attempts, streaks, SM-2).
 * 2. Activity visualization (14-day daily exercise volume, XP earned, time spent).
 * 3. Language-scoped skill & topic mastery (vocabulary, listening, speaking, grammar, reading).
 * 4. Expanded Streak drawer with 28-day monthly activity consistency matrix & milestones.
 * 5. Transparent empty states without mock numbers.
 */

import { useEffect, useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../services/auth'
import { useProgress } from '../../services/progress'
import { fetchNextAdaptiveLesson } from '../../services/dynamicLessonService'
import { fetchLearningAnalytics } from '../../services/dbService'
import { getLanguageById } from '../../data/languages'
import {
  getSkillProficiencies,
  getWeakAreas,
  getReviewCandidates,
  TOPIC_CATEGORIES,
} from '../../services/learnerModel'
import { getSM2Stats } from '../../services/spacedRepetition'
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
  CheckCircle2,
  BookOpen,
  X,
  BarChart3,
  Clock,
  Layers,
  Award,
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
  const [lessonError, setLessonError] = useState(null)
  const [skillStats, setSkillStats] = useState(() => getSkillProficiencies(user?.learningLanguage || 'hi'))
  const [weakAreas, setWeakAreas] = useState({ topics: [], skills: [], hasWeaknesses: false })
  const [dueReviews, setDueReviews] = useState([])
  const [sm2Stats, setSm2Stats] = useState(() => getSM2Stats(user?.learningLanguage || 'hi', user?.id))
  const [showAlphabetModal, setShowAlphabetModal] = useState(false)
  const [showPlanBanner, setShowPlanBanner] = useState(false)
  const [analytics, setAnalytics] = useState({ activity: [], lessonAttempts: [], longestStreak: 0 })
  const [showStreakDetails, setShowStreakDetails] = useState(false)
  const [analyticsTab, setAnalyticsTab] = useState('activity') // 'activity' | 'skills' | 'memory'

  const learningLang = getLanguageById(user?.learningLanguage) || { name: 'Hindi', nativeName: 'हिन्दी', id: 'hi' }
  const preferredLang = getLanguageById(user?.preferredLanguage || 'en') || { name: 'English', id: 'en' }

  // ── 1. Fetch & Hydrate Dashboard Data ───────────────────────────────────────
  const loadAdaptiveDashboard = useCallback(async () => {
    if (!user?.learningLanguage) return
    setLoading(true)
    setLessonError(null)

    const langId = user.learningLanguage || 'hi'
    const preferredId = user.preferredLanguage || 'en'

    // Fetch real learner proficiencies, weak areas, spaced reviews, and SM-2 stats
    const skills = getSkillProficiencies(langId)
    const weak = getWeakAreas(langId)
    const reviews = getReviewCandidates(langId, 4)
    const sm2 = getSM2Stats(langId, user.id)

    setSkillStats(skills)
    setWeakAreas(weak)
    setDueReviews(reviews)
    setSm2Stats(sm2)

    // Fetch real analytics from Supabase if connected
    if (user.id) {
      try {
        const analyticsData = await fetchLearningAnalytics(user.id, langId)
        if (analyticsData) setAnalytics(analyticsData)
      } catch (err) {
        console.warn('[Dashboard] Analytics fetch non-fatal error:', err)
      }
    }

    // Fetch personalized next adaptive lesson
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
      setLessonError(err?.message || 'Unable to generate personalized lesson')
    } finally {
      setLoading(false)
    }
  }, [user?.learningLanguage, user?.preferredLanguage, user?.level, user?.goal, user?.id])

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

    loadAdaptiveDashboard()
  }, [user, navigate, loadAdaptiveDashboard])

  // ── 2. Real Metrics Aggregation ───────────────────────────────────────────
  // Completed lessons count (language-specific if available, fallback to total array)
  const completedLessonsList = user?.languageProgress?.[learningLang.id]?.completedLessons || user?.completedLessons || []
  const completedLessonsCount = Array.isArray(completedLessonsList) ? completedLessonsList.length : 0

  // Real exercises completed: sum of activity log + local learner profile attempts
  const exercisesFromActivity = (analytics.activity || []).reduce(
    (sum, item) => sum + (Number(item.exercises_completed) || 0),
    0
  )
  const persistedLearnerStats = user?.learnerStats?.[learningLang.id]
  const totalExercisesCount = Math.max(
    exercisesFromActivity,
    Number(persistedLearnerStats?.totalAttempts) || 0,
    Number(skillStats?.totalAttempts) || 0
  )

  // Real Accuracy: reflect genuine attempts or indicate starting level
  const totalAttempts = Number(persistedLearnerStats?.totalAttempts) || Number(skillStats?.totalAttempts) || (analytics.lessonAttempts || []).length
  const hasAccuracyData = totalAttempts > 0
  const realAccuracy = persistedLearnerStats?.overallAccuracy !== undefined
    ? Math.round(Number(persistedLearnerStats.overallAccuracy))
    : Math.round(Number(skillStats?.overall) || 0)

  // Words learned in memory (SM-2 tracked or user vocabulary cache)
  const vocabularyWordsCount = sm2Stats.totalTracked > 0
    ? sm2Stats.totalTracked
    : (user?.vocabulary && typeof user.vocabulary === 'object' ? Object.keys(user.vocabulary).length : 0)

  // Difficulty badge
  const currentDifficulty = Number(persistedLearnerStats?.currentDifficultyLevel) || Number(skillStats?.difficulty) || 1
  const getDifficultyBadge = (level = 1) => {
    switch (level) {
      case 5: return { label: 'Mastery', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' }
      case 4: return { label: 'Advanced', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' }
      case 3: return { label: 'Intermediate', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' }
      case 2: return { label: 'Elementary', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' }
      default: return { label: 'Beginner', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' }
    }
  }
  const diffBadge = getDifficultyBadge(currentDifficulty)

  // ── 3. Streak & Calendar Calculations ─────────────────────────────────────
  const persistedStreak = Number(user?.streak) || Number(streak) || 0
  const longestStreak = Math.max(Number(analytics.longestStreak) || 0, persistedStreak)
  const todayKey = getDateKey(new Date())

  const activityByDate = useMemo(() => {
    return (analytics.activity || []).reduce((result, item) => {
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
  }, [analytics.activity])

  const practicedDates = useMemo(() => {
    const set = new Set([
      ...Object.entries(activityByDate)
        .filter(([, act]) => (Number(act.exercises_completed) || 0) > 0 || (Number(act.session_duration_seconds) || 0) > 0 || (Number(act.xp_earned) || 0) > 0)
        .map(([dateKey]) => dateKey),
      ...(analytics.lessonAttempts || []).map((attempt) => attempt.completed_at?.slice(0, 10)).filter(Boolean),
    ])

    if (user?.lastActiveDate && persistedStreak > 0) {
      const lastActiveDate = new Date(`${user.lastActiveDate}T12:00:00`)
      for (let offset = 0; offset < persistedStreak; offset += 1) {
        const streakDate = new Date(lastActiveDate)
        streakDate.setDate(streakDate.getDate() - offset)
        set.add(getDateKey(streakDate))
      }
    }
    return set
  }, [activityByDate, analytics.lessonAttempts, user?.lastActiveDate, persistedStreak])

  // Current week (Monday to Sunday)
  const currentWeek = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date()
      date.setHours(12, 0, 0, 0)
      const mondayOffset = (date.getDay() + 6) % 7
      date.setDate(date.getDate() - mondayOffset + index)
      return { date, dateKey: getDateKey(date) }
    })
  }, [])

  const daysActiveThisWeek = currentWeek.filter((day) => practicedDates.has(day.dateKey)).length
  const exercisesThisWeek = currentWeek.reduce((sum, day) => {
    return sum + (activityByDate[day.dateKey]?.exercises_completed || 0)
  }, 0)

  // 14-day Daily Activity Trend for visualization
  const past14Days = useMemo(() => {
    return Array.from({ length: 14 }, (_, index) => {
      const d = new Date()
      d.setHours(12, 0, 0, 0)
      d.setDate(d.getDate() - (13 - index))
      const key = getDateKey(d)
      const act = activityByDate[key] || { exercises_completed: 0, xp_earned: 0, session_duration_seconds: 0 }
      return {
        date: d,
        dateKey: key,
        dayName: d.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 2),
        dayNum: d.getDate(),
        exercises: Number(act.exercises_completed) || 0,
        xp: Number(act.xp_earned) || 0,
        seconds: Number(act.session_duration_seconds) || 0,
        isToday: key === todayKey,
      }
    })
  }, [activityByDate, todayKey])

  const totalExercises14 = past14Days.reduce((sum, d) => sum + d.exercises, 0)
  const totalXP14 = past14Days.reduce((sum, d) => sum + d.xp, 0)
  const totalSeconds14 = past14Days.reduce((sum, d) => sum + d.seconds, 0)
  const maxExercises14 = Math.max(...past14Days.map((d) => d.exercises), 1)

  // 28-day Monthly Heat Matrix for Streak modal
  const past28Days = useMemo(() => {
    return Array.from({ length: 28 }, (_, index) => {
      const d = new Date()
      d.setHours(12, 0, 0, 0)
      d.setDate(d.getDate() - (27 - index))
      const key = getDateKey(d)
      return {
        date: d,
        dateKey: key,
        dayNum: d.getDate(),
        isPracticed: practicedDates.has(key),
        isToday: key === todayKey,
      }
    })
  }, [practicedDates, todayKey])

  const activeDays28 = past28Days.filter((d) => d.isPracticed).length

  // Streak Milestones
  const streakMilestones = [3, 7, 14, 30, 50, 100, 365]
  const nextMilestone = streakMilestones.find((m) => m > persistedStreak) || (persistedStreak + 50)

  // ── 4. Language-Scoped Skill Progress ──────────────────────────────────────
  const persistedSkills = persistedLearnerStats?.skills || {}
  const skillsList = [
    {
      key: 'vocabulary',
      label: 'Vocabulary',
      icon: '📖',
      score: Number(persistedSkills.vocabulary?.score) || Number(skillStats?.vocabulary) || 0,
      attempts: Number(persistedSkills.vocabulary?.attempts) || 0,
      correct: Number(persistedSkills.vocabulary?.correct) || 0,
    },
    {
      key: 'listening',
      label: 'Listening',
      icon: '🎧',
      score: Number(persistedSkills.listening?.score) || Number(skillStats?.listening) || 0,
      attempts: Number(persistedSkills.listening?.attempts) || 0,
      correct: Number(persistedSkills.listening?.correct) || 0,
    },
    {
      key: 'speaking',
      label: 'Speaking',
      icon: '🎙️',
      score: Number(persistedSkills.speaking?.score) || Number(skillStats?.speaking) || 0,
      attempts: Number(persistedSkills.speaking?.attempts) || 0,
      correct: Number(persistedSkills.speaking?.correct) || 0,
    },
    {
      key: 'grammar',
      label: 'Grammar',
      icon: '📝',
      score: Number(persistedSkills.grammar?.score) || Number(skillStats?.grammar) || 0,
      attempts: Number(persistedSkills.grammar?.attempts) || 0,
      correct: Number(persistedSkills.grammar?.correct) || 0,
    },
    {
      key: 'reading',
      label: 'Reading',
      icon: '📜',
      score: Number(persistedSkills.reading?.score) || Number(skillStats?.reading) || 0,
      attempts: Number(persistedSkills.reading?.attempts) || 0,
      correct: Number(persistedSkills.reading?.correct) || 0,
    },
  ]

  const persistedTopics = persistedLearnerStats?.topics || {}
  const practicedTopicsList = Object.values(persistedTopics).filter((t) => (t.attempts || 0) > 0)

  // ── 5. Continue Learning Navigation ───────────────────────────────────────
  const handleStartLesson = (topicId = null) => {
    if (topicId) {
      navigate(`/lesson/${learningLang.id}-adaptive-${topicId}-${Date.now()}`)
    } else if (nextLesson?.id) {
      navigate(`/lesson/${nextLesson.id}`)
    } else {
      const targetGoal = user?.goal || 'greetings'
      navigate(`/lesson/${learningLang.id}-adaptive-${targetGoal}-${Date.now()}`)
    }
  }

  // Dynamic exercise count & duration
  const exerciseCount = nextLesson?.exercises?.length || 10
  const estimatedMinutes = Math.max(3, Math.ceil(exerciseCount * 0.45))

  return (
    <div className="min-h-screen bg-[#F7F5EF] dark:bg-slate-950 flex justify-center pb-20 md:pb-6">
      {/* 1. LEFT SIDEBAR NAVIGATION */}
      <AppSidebar />

      {/* 2. CENTER CONTENT */}
      <main className="flex-1 max-w-[640px] md:ml-72 px-4 py-5 space-y-4">

        {/* ── Mobile Header Status Capsule (< lg screens) ──────────────── */}
        <div className="flex lg:hidden items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-2xl border border-[#E8E6E0] dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2">
            <LanguageFlag languageId={learningLang.id} size={28} />
            <div>
              <span className="text-xs font-black text-[#25231F] dark:text-white leading-none block">
                {learningLang.name}
              </span>
              <span className="text-[10px] text-[#77736B] dark:text-slate-400 leading-none">
                {preferredLang.name}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowStreakDetails(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 text-xs font-black cursor-pointer active:scale-95 transition-transform"
              title="Open Streak Details"
            >
              <Flame size={14} fill="currentColor" />
              <span>{persistedStreak}</span>
            </button>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 text-xs font-black">
              <Zap size={14} fill="currentColor" />
              <span>{user?.xp || 0}</span>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 text-xs font-black">
              <span>💎</span>
              <span>{user?.gems !== undefined ? Number(user.gems) : gems}</span>
            </div>
          </div>
        </div>

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
                  <p className="font-extrabold text-xs uppercase tracking-wider text-white/80 mb-0.5">
                    {t('personalized_path') || 'Your Personalized Path'}
                  </p>
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

        {/* ── 1. LEARNING PROGRESS OVERVIEW ──────────────────────────────── */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-[#E8E6E0] dark:border-slate-800 p-5 space-y-4">
          
          {/* Header Bar: Flag, Course Name & Dynamic Level Badge */}
          <div className="flex items-center justify-between pb-3.5 border-b border-[#E8E6E0]/70 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <LanguageFlag languageId={learningLang.id} size={38} className="shadow-sm" />
              <div>
                <h1 className="text-lg font-black text-[#25231F] dark:text-white leading-tight">
                  {learningLang.name}
                </h1>
                <p className="text-[11px] text-[#77736B] dark:text-slate-400">
                  {learningLang.nativeName} · {t('learning_in') || 'Learning in'}{' '}
                  <span className="font-bold text-[#0B8F62] dark:text-[#34D399]">
                    {preferredLang?.name || 'English'}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 text-xs font-black rounded-xl uppercase tracking-wider ${diffBadge.color}`}>
                {diffBadge.label}
              </span>
              <span className="px-2.5 py-1 bg-[#0B8F62]/10 text-[#0B8F62] dark:text-[#34D399] text-xs font-black rounded-xl flex items-center gap-1">
                <ShieldCheck size={13} />
                <span>
                  {hasAccuracyData
                    ? `${realAccuracy}% ${t('accuracy') || 'Accuracy'}`
                    : (user?.level ? user.level.toUpperCase() : 'ACTIVE')}
                </span>
              </span>
            </div>
          </div>

          {/* Real Persisted Learner Metrics Bar */}
          <div className="grid grid-cols-4 gap-2 pt-1 pb-1">
            <div className="bg-[#F7F5EF] dark:bg-slate-800/70 rounded-2xl p-2.5 text-center border border-[#E8E6E0]/80 dark:border-slate-700/60">
              <div className="flex items-center justify-center text-[#0B8F62] mb-1">
                <CheckCircle2 size={16} />
              </div>
              <p className="text-base font-black text-[#25231F] dark:text-white leading-none">
                {completedLessonsCount}
              </p>
              <p className="text-[10px] font-bold text-[#77736B] dark:text-slate-400 mt-1 uppercase tracking-tight">
                {t('lessons') || 'Lessons'}
              </p>
            </div>

            <div className="bg-[#F7F5EF] dark:bg-slate-800/70 rounded-2xl p-2.5 text-center border border-[#E8E6E0]/80 dark:border-slate-700/60">
              <div className="flex items-center justify-center text-[#0ea5e9] mb-1">
                <Zap size={16} />
              </div>
              <p className="text-base font-black text-[#25231F] dark:text-white leading-none">
                {totalExercisesCount}
              </p>
              <p className="text-[10px] font-bold text-[#77736B] dark:text-slate-400 mt-1 uppercase tracking-tight">
                {t('exercises') || 'Exercises'}
              </p>
            </div>

            <div
              onClick={() => setShowStreakDetails(true)}
              className="bg-[#F7F5EF] dark:bg-slate-800/70 hover:bg-rose-50/50 dark:hover:bg-slate-800 rounded-2xl p-2.5 text-center border border-[#E8E6E0]/80 dark:border-slate-700/60 cursor-pointer transition-colors group"
              title="View Streak Details"
            >
              <div className="flex items-center justify-center text-[#D84B42] mb-1 group-hover:scale-110 transition-transform">
                <Flame size={16} fill="currentColor" />
              </div>
              <p className="text-base font-black text-[#25231F] dark:text-white leading-none">
                {persistedStreak}
                <span className="text-[10px] font-normal text-slate-400 ml-0.5">/ {longestStreak}d</span>
              </p>
              <p className="text-[10px] font-bold text-[#77736B] dark:text-slate-400 mt-1 uppercase tracking-tight">
                {t('streak') || 'Streak'}
              </p>
            </div>

            <div className="bg-[#F7F5EF] dark:bg-slate-800/70 rounded-2xl p-2.5 text-center border border-[#E8E6E0]/80 dark:border-slate-700/60">
              <div className="flex items-center justify-center text-[#8B5CF6] mb-1">
                <BookOpen size={16} />
              </div>
              <p className="text-base font-black text-[#25231F] dark:text-white leading-none">
                {vocabularyWordsCount}
              </p>
              <p className="text-[10px] font-bold text-[#77736B] dark:text-slate-400 mt-1 uppercase tracking-tight">
                {sm2Stats.dueCount > 0 ? `${sm2Stats.dueCount} due` : (t('words') || 'Words')}
              </p>
            </div>
          </div>

          {/* ── "YOUR NEXT LESSON" HERO CARD (Personalized Stream) ────────── */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-black text-[#0B8F62] dark:text-[#34D399] uppercase tracking-wider">
                <Sparkles size={15} />
                <span>{t('continue_lesson') || 'Your Next Lesson'}</span>
              </div>
              <span className="text-[11px] font-bold text-[#77736B] dark:text-slate-400">
                {exerciseCount} {t('exercises') || 'exercises'} · ~{estimatedMinutes} mins
              </span>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="bg-[#F7F5EF]/80 dark:bg-slate-800/60 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 border border-[#E8E6E0] dark:border-slate-700">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  className="w-6 h-6 border-2 border-[#0B8F62] border-t-transparent rounded-full"
                />
                <p className="text-xs text-[#77736B] dark:text-slate-400 font-bold">
                  Selecting personalized exercises for {learningLang.name}...
                </p>
              </div>
            ) : lessonError ? (
              /* Error State */
              <div className="bg-rose-50 dark:bg-rose-950/40 rounded-2xl p-5 border border-rose-200 dark:border-rose-900/60 space-y-3">
                <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 text-xs font-bold">
                  <AlertTriangle size={16} />
                  <span>Unable to assemble adaptive lesson</span>
                </div>
                <p className="text-[11px] text-rose-600 dark:text-rose-300">
                  {lessonError}
                </p>
                <button
                  type="button"
                  onClick={loadAdaptiveDashboard}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw size={12} />
                  <span>Retry</span>
                </button>
              </div>
            ) : !nextLesson ? (
              /* Empty State */
              <div className="bg-[#F7F5EF] dark:bg-slate-800/60 rounded-2xl p-6 text-center border border-[#E8E6E0] dark:border-slate-700 space-y-3">
                <div className="text-3xl">🌱</div>
                <div>
                  <h4 className="font-black text-sm text-[#25231F] dark:text-white">
                    Ready to start learning {learningLang.name}?
                  </h4>
                  <p className="text-xs text-[#77736B] dark:text-slate-400 mt-1">
                    Begin with foundational greetings and core everyday vocabulary.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleStartLesson('greetings')}
                  className="py-2.5 px-4 bg-[#0B8F62] hover:bg-[#097b54] text-white rounded-xl font-bold text-xs inline-flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Play size={14} className="fill-white" />
                  <span>Start First Lesson</span>
                </button>
              </div>
            ) : (
              /* Active Lesson Hero */
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
                    <span className="font-black text-[#0B8F62]">{t('adapts_dynamically') || 'Adapts to you'}: </span>
                    {nextLesson?.rationale || nextLesson?.description || `Personalized exercise sequence aligned with your ${user?.goal || 'conversation'} goal.`}
                  </p>
                </div>

                {/* Primary Action Button */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleStartLesson()}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-[#0B8F62] to-[#10B981] hover:from-[#097b54] hover:to-[#059669] text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-[#0B8F62]/20 hover:shadow-lg transition-all cursor-pointer"
                >
                  <Play size={16} className="fill-white" />
                  <span>{t('start_lesson') || 'Continue Learning'}</span>
                </motion.button>
              </div>
            )}
          </div>
        </div>

        {/* ── 2. SUBORDINATED QUICK TOOLS ──────────────────────────────── */}
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

        {/* ── 3. LEARNING ANALYTICS & SKILL MASTERY CARD (Milestone 3B) ──── */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-[#E8E6E0] dark:border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8E6E0]/70 dark:border-slate-800 flex-wrap gap-2">
            <div>
              <h2 className="font-black text-sm text-[#25231F] dark:text-white flex items-center gap-1.5">
                <BarChart3 size={16} className="text-[#0B8F62]" />
                <span>Learning Analytics & Mastery</span>
              </h2>
              <p className="text-[11px] text-[#77736B] dark:text-slate-400 font-medium">
                Authentic activity & competencies in {learningLang.name}
              </p>
            </div>

            {/* Tab Switches */}
            <div className="flex items-center bg-[#F7F5EF] dark:bg-slate-800 p-1 rounded-xl border border-[#E8E6E0]/80 dark:border-slate-700/80 shrink-0">
              <button
                type="button"
                onClick={() => setAnalyticsTab('activity')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  analyticsTab === 'activity'
                    ? 'bg-white dark:bg-slate-900 text-[#0B8F62] dark:text-[#34D399] shadow-xs'
                    : 'text-[#77736B] dark:text-slate-400 hover:text-[#25231F] dark:hover:text-white'
                }`}
              >
                Activity
              </button>
              <button
                type="button"
                onClick={() => setAnalyticsTab('skills')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  analyticsTab === 'skills'
                    ? 'bg-white dark:bg-slate-900 text-[#0B8F62] dark:text-[#34D399] shadow-xs'
                    : 'text-[#77736B] dark:text-slate-400 hover:text-[#25231F] dark:hover:text-white'
                }`}
              >
                Skills
              </button>
              <button
                type="button"
                onClick={() => setAnalyticsTab('memory')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  analyticsTab === 'memory'
                    ? 'bg-white dark:bg-slate-900 text-[#0B8F62] dark:text-[#34D399] shadow-xs'
                    : 'text-[#77736B] dark:text-slate-400 hover:text-[#25231F] dark:hover:text-white'
                }`}
              >
                Memory (SM-2)
              </button>
            </div>
          </div>

          {/* TAB 1: ACTIVITY VISUALIZATION */}
          {analyticsTab === 'activity' && (
            <div className="space-y-3.5">
              {/* Summary Stats Pill Row */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-[#F7F5EF] dark:bg-slate-800/70 p-2.5 rounded-2xl border border-[#E8E6E0]/80 dark:border-slate-700/60 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#77736B] dark:text-slate-400">14-Day Volume</p>
                  <p className="text-base font-black text-[#25231F] dark:text-white mt-0.5">{totalExercises14} <span className="text-[10px] text-slate-400 font-bold">ex</span></p>
                </div>
                <div className="bg-[#F7F5EF] dark:bg-slate-800/70 p-2.5 rounded-2xl border border-[#E8E6E0]/80 dark:border-slate-700/60 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#77736B] dark:text-slate-400">XP Accumulated</p>
                  <p className="text-base font-black text-amber-600 dark:text-amber-400 mt-0.5">+{totalXP14} <span className="text-[10px] text-slate-400 font-bold">XP</span></p>
                </div>
                <div className="bg-[#F7F5EF] dark:bg-slate-800/70 p-2.5 rounded-2xl border border-[#E8E6E0]/80 dark:border-slate-700/60 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#77736B] dark:text-slate-400">Active Time</p>
                  <p className="text-base font-black text-[#0ea5e9] mt-0.5">{Math.round(totalSeconds14 / 60)} <span className="text-[10px] text-slate-400 font-bold">min</span></p>
                </div>
              </div>

              {/* 14-Day Timeline Bar Chart */}
              {totalExercises14 === 0 && totalXP14 === 0 ? (
                <div className="bg-[#F7F5EF]/60 dark:bg-slate-800/40 rounded-2xl p-6 text-center border border-[#E8E6E0] dark:border-slate-800 space-y-1">
                  <div className="text-2xl mb-1">⏳</div>
                  <p className="text-xs font-bold text-[#25231F] dark:text-white">No activity logged in the past 14 days</p>
                  <p className="text-[11px] text-[#77736B] dark:text-slate-400">Complete lessons to see your daily exercise count and XP trend.</p>
                </div>
              ) : (
                <div className="bg-[#F7F5EF]/50 dark:bg-slate-800/40 rounded-2xl p-3 border border-[#E8E6E0] dark:border-slate-700/70 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-bold text-[#77736B] dark:text-slate-400">
                    <span>14-Day Daily Exercise Curve</span>
                    <span>Peak: {maxExercises14} exercises</span>
                  </div>

                  {/* Responsive flex bars */}
                  <div className="flex items-end justify-between gap-1 h-24 pt-2">
                    {past14Days.map((day) => {
                      const heightPercent = day.exercises > 0
                        ? Math.max(12, Math.round((day.exercises / maxExercises14) * 100))
                        : 5
                      return (
                        <div
                          key={day.dateKey}
                          className="flex-1 flex flex-col items-center justify-end h-full group relative"
                          title={`${day.dayName} ${day.dayNum}: ${day.exercises} exercises, ${day.xp} XP`}
                        >
                          {/* Tooltip on hover */}
                          <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute -top-8 bg-slate-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap z-10 transition-opacity">
                            {day.exercises} ex · {day.xp} XP
                          </div>

                          <div
                            style={{ height: `${heightPercent}%` }}
                            className={`w-full max-w-[18px] rounded-t-md transition-all ${
                              day.exercises > 0
                                ? day.isToday
                                  ? 'bg-[#10B981] shadow-xs'
                                  : 'bg-[#0B8F62] hover:bg-[#097b54]'
                                : 'bg-slate-200 dark:bg-slate-700/60'
                            }`}
                          />
                          <span className={`text-[9px] font-bold mt-1 ${day.isToday ? 'text-[#0B8F62] font-black' : 'text-[#77736B] dark:text-slate-400'}`}>
                            {day.dayNum}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SKILL PROFICIENCIES & TOPICS */}
          {analyticsTab === 'skills' && (
            <div className="space-y-4">
              {/* 5 Core Linguistic Skills */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-[#77736B] dark:text-slate-400">
                  <span>Language Competencies</span>
                  <span>{learningLang.name}</span>
                </div>

                <div className="space-y-2">
                  {skillsList.map((skill) => (
                    <div key={skill.key} className="bg-[#F7F5EF] dark:bg-slate-800/60 p-2.5 rounded-2xl border border-[#E8E6E0]/80 dark:border-slate-700/60 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">{skill.icon}</span>
                          <span className="text-xs font-bold text-[#25231F] dark:text-white">{skill.label}</span>
                        </div>
                        {skill.attempts > 0 ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-[#0B8F62] dark:text-[#34D399]">{skill.score}%</span>
                            <span className="text-[10px] text-[#77736B] dark:text-slate-400">({skill.attempts} attempts)</span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 italic">Not yet practiced</span>
                        )}
                      </div>

                      {/* Progress bar track */}
                      <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${skill.attempts > 0 ? skill.score : 0}%` }}
                          className="h-full bg-[#0B8F62] rounded-full transition-all duration-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Practiced Topics Mastery Breakdown */}
              <div className="space-y-2 pt-1 border-t border-[#E8E6E0]/70 dark:border-slate-800">
                <p className="text-[11px] font-black uppercase tracking-wider text-[#77736B] dark:text-slate-400">
                  Topic Mastery Levels (1 to 5)
                </p>

                {practicedTopicsList.length === 0 ? (
                  <p className="text-xs text-[#77736B] dark:text-slate-400 bg-[#F7F5EF]/60 dark:bg-slate-800/40 p-3 rounded-2xl border border-[#E8E6E0] dark:border-slate-800 italic">
                    Topic masteries appear here automatically as you practice lessons.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {practicedTopicsList.slice(0, 4).map((top) => (
                      <div key={top.id} className="p-2.5 bg-[#F7F5EF] dark:bg-slate-800/70 rounded-2xl border border-[#E8E6E0]/80 dark:border-slate-700/60 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{top.icon || '📚'}</span>
                          <div>
                            <p className="text-xs font-bold text-[#25231F] dark:text-white leading-tight">{top.name}</p>
                            <p className="text-[10px] text-slate-400">{top.accuracy}% acc · {top.attempts} tries</p>
                          </div>
                        </div>
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-[#0B8F62]/10 text-[#0B8F62] shrink-0">
                          Lv.{top.masteryLevel || 1}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: SM-2 MEMORY RETENTION */}
          {analyticsTab === 'memory' && (
            <div className="space-y-3">
              {sm2Stats.totalTracked === 0 ? (
                <div className="bg-[#F7F5EF]/60 dark:bg-slate-800/40 rounded-2xl p-6 text-center border border-[#E8E6E0] dark:border-slate-800 space-y-1">
                  <div className="text-2xl mb-1">🧠</div>
                  <p className="text-xs font-bold text-[#25231F] dark:text-white">No vocabulary in spaced repetition yet</p>
                  <p className="text-[11px] text-[#77736B] dark:text-slate-400">
                    Vocabulary learned in lessons automatically enters your SuperMemo SM-2 deck with personalized review intervals.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* SM-2 Metrics Grid */}
                  <div className="grid grid-cols-4 gap-2">
                    <div className="bg-[#F7F5EF] dark:bg-slate-800/70 p-2.5 rounded-2xl border border-[#E8E6E0]/80 dark:border-slate-700/60 text-center">
                      <p className="text-[9px] font-bold uppercase text-[#77736B] dark:text-slate-400">Tracked</p>
                      <p className="text-base font-black text-[#25231F] dark:text-white">{sm2Stats.totalTracked}</p>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 text-center">
                      <p className="text-[9px] font-bold uppercase text-emerald-700 dark:text-emerald-300">Mastered</p>
                      <p className="text-base font-black text-emerald-700 dark:text-emerald-300">{sm2Stats.masteredCount}</p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-950/40 p-2.5 rounded-2xl border border-blue-200 dark:border-blue-900/60 text-center">
                      <p className="text-[9px] font-bold uppercase text-blue-700 dark:text-blue-300">Learning</p>
                      <p className="text-base font-black text-blue-700 dark:text-blue-300">{sm2Stats.learningCount}</p>
                    </div>
                    <div className="bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-2xl border border-rose-200 dark:border-rose-900/60 text-center">
                      <p className="text-[9px] font-bold uppercase text-rose-700 dark:text-rose-400">Due Today</p>
                      <p className="text-base font-black text-rose-700 dark:text-rose-400">{sm2Stats.dueCount}</p>
                    </div>
                  </div>

                  {/* Retention Score Meter */}
                  <div className="bg-[#F7F5EF] dark:bg-slate-800/70 p-3 rounded-2xl border border-[#E8E6E0]/80 dark:border-slate-700/60 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#25231F] dark:text-white">Estimated Memory Retention</span>
                      <span className="font-black text-[#0B8F62] dark:text-[#34D399]">{sm2Stats.averageRetention}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${Math.min(100, sm2Stats.averageRetention)}%` }}
                        className="h-full bg-gradient-to-r from-[#0B8F62] to-[#10B981] rounded-full"
                      />
                    </div>
                    <p className="text-[10px] text-[#77736B] dark:text-slate-400 pt-0.5">
                      Dynamically calibrated by the SuperMemo SM-2 algorithm based on recall intervals and response speed.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
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
                {dueReviews.length} words due
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
              className="w-full py-2 bg-[#D84B42]/10 hover:bg-[#D84B42]/20 text-[#D84B42] dark:text-[#F87171] rounded-xl text-xs font-black transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
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
                Tap any topic — the engine constructs an adaptive exercise set
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
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between h-24 cursor-pointer ${
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

      {/* ── 4. STREAK DETAIL DRAWER / MODAL (Milestone 3B Enhanced) ────── */}
      <AnimatePresence>
        {showStreakDetails && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-[#25231F]/50 p-0 sm:items-center sm:p-4 backdrop-blur-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowStreakDetails(false)}
          >
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-labelledby="streak-details-title"
              className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl dark:bg-slate-900 sm:rounded-3xl border border-[#E8E6E0] dark:border-slate-800 space-y-4"
              initial={{ y: 32 }}
              animate={{ y: 0 }}
              exit={{ y: 32 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-[#D84B42]">
                    <Flame size={22} fill="currentColor" />
                    <h2 id="streak-details-title" className="text-lg font-black text-[#25231F] dark:text-white">
                      {t('streak_details') || 'Streak Details'}
                    </h2>
                  </div>
                  <p className="mt-1 text-xs text-[#77736B] dark:text-slate-400">
                    Keep your daily momentum alive across all your Indian language sessions.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowStreakDetails(false)}
                  className="rounded-lg p-1.5 text-[#77736B] hover:bg-[#F7F5EF] dark:hover:bg-slate-800 cursor-pointer"
                  aria-label="Close streak details"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Current & Longest Streak Counters */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-2xl bg-[#D84B42]/10 p-3.5 border border-[#D84B42]/20">
                  <p className="text-[10px] font-black uppercase tracking-wider text-[#D84B42]">
                    {t('current_streak') || 'Current Streak'}
                  </p>
                  <p className="mt-1 text-2xl font-black text-[#25231F] dark:text-white">
                    {persistedStreak} <span className="text-sm font-bold text-[#77736B]">{t('days') || 'days'}</span>
                  </p>
                </div>
                <div className="rounded-2xl bg-[#F7F5EF] dark:bg-slate-800 p-3.5 border border-[#E8E6E0] dark:border-slate-700">
                  <p className="text-[10px] font-black uppercase tracking-wider text-[#77736B] dark:text-slate-400">
                    {t('longest_streak') || 'Longest Streak'}
                  </p>
                  <p className="mt-1 text-2xl font-black text-[#25231F] dark:text-white">
                    {longestStreak} <span className="text-sm font-bold text-[#77736B]">{t('days') || 'days'}</span>
                  </p>
                </div>
              </div>

              {/* Today Status Pill */}
              <div className="p-3 rounded-2xl border border-[#E8E6E0] dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#25231F] dark:text-white block">Today's Practice</span>
                  <span className="text-[11px] text-[#77736B] dark:text-slate-400">
                    {practicedDates.has(todayKey)
                      ? 'Goal accomplished! Streak preserved for today.'
                      : 'Complete any lesson or review to keep your streak.'}
                  </span>
                </div>
                <span
                  className={`text-[11px] font-black px-2.5 py-1 rounded-full shrink-0 ${
                    practicedDates.has(todayKey)
                      ? 'bg-[#0B8F62]/10 text-[#0B8F62] dark:text-[#34D399]'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {practicedDates.has(todayKey) ? '✓ Completed' : 'Pending'}
                </span>
              </div>

              {/* Monthly Consistency Heat Grid (28 days) */}
              <div className="rounded-2xl border border-[#E8E6E0] dark:border-slate-800 p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-black uppercase tracking-wider text-[#25231F] dark:text-white">Monthly Consistency</span>
                  <span className="text-[11px] font-bold text-[#0B8F62]">
                    {activeDays28} of 28 active days ({Math.round((activeDays28 / 28) * 100)}%)
                  </span>
                </div>

                {/* 4x7 circular dot matrix */}
                <div className="grid grid-cols-7 gap-1.5 pt-1">
                  {past28Days.map((d) => (
                    <div
                      key={d.dateKey}
                      className="flex flex-col items-center justify-center p-1 rounded-lg"
                      title={`${d.dateKey}: ${d.isPracticed ? 'Practiced' : 'No practice'}`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full transition-all ${
                          d.isPracticed
                            ? 'bg-[#0B8F62] shadow-xs'
                            : d.isToday
                            ? 'border-2 border-dashed border-[#D84B42] bg-rose-50 dark:bg-rose-950/40'
                            : 'bg-slate-200 dark:bg-slate-700/60'
                        }`}
                      />
                      <span className="text-[8px] font-bold text-slate-400 mt-0.5">{d.dayNum}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly Calendar Row */}
              <div className="rounded-2xl border border-[#E8E6E0] dark:border-slate-800 p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <h3 className="font-black uppercase tracking-wider text-[#25231F] dark:text-white">This Week</h3>
                  <span className="text-[11px] font-bold text-[#77736B] dark:text-slate-400">
                    {daysActiveThisWeek} of 7 active
                  </span>
                </div>

                <div className="grid grid-cols-7 gap-1.5 text-center">
                  {currentWeek.map(({ date, dateKey }) => {
                    const isPracticed = practicedDates.has(dateKey)
                    const isToday = dateKey === todayKey
                    return (
                      <div key={dateKey} className="flex flex-col items-center">
                        <span className="text-[9px] font-bold text-[#77736B] dark:text-slate-400">
                          {date.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 2)}
                        </span>
                        <div
                          className={`mt-1 flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-black transition-colors ${
                            isPracticed
                              ? 'bg-[#0B8F62] text-white shadow-xs'
                              : isToday
                              ? 'border-2 border-dashed border-[#D84B42] text-[#D84B42]'
                              : 'bg-[#E8E6E0] dark:bg-slate-700 text-[#77736B] dark:text-slate-400'
                          }`}
                        >
                          {date.getDate()}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Milestone Tracker */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <h3 className="font-black uppercase tracking-wider text-[#25231F] dark:text-white">Milestone Targets</h3>
                  <span className="text-[10px] font-bold text-[#0B8F62]">
                    {nextMilestone - persistedStreak} {nextMilestone - persistedStreak === 1 ? 'day' : 'days'} to next goal
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[3, 7, 30, 100].map((milestone) => (
                    <div
                      key={milestone}
                      className={`rounded-xl p-2 text-center border ${
                        persistedStreak >= milestone
                          ? 'bg-[#0B8F62]/10 border-[#0B8F62]/30 text-[#0B8F62]'
                          : 'bg-[#F7F5EF] dark:bg-slate-800 border-[#E8E6E0] dark:border-slate-700 text-[#77736B] dark:text-slate-400'
                      }`}
                    >
                      <Flame
                        size={14}
                        className="mx-auto"
                        fill={persistedStreak >= milestone ? 'currentColor' : 'none'}
                      />
                      <p className="mt-1 text-[10px] font-black">{milestone} days</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => {
                  setShowStreakDetails(false)
                  handleStartLesson()
                }}
                className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-black text-white cursor-pointer transition-all shadow-md ${
                  practicedDates.has(todayKey)
                    ? 'bg-[#0B8F62] hover:bg-[#097b54] shadow-[#0B8F62]/20'
                    : 'bg-[#D84B42] hover:bg-[#c0392b] shadow-[#D84B42]/20'
                }`}
              >
                <Flame size={15} fill="currentColor" />
                <span>
                  {practicedDates.has(todayKey)
                    ? 'Streak safe today! Practice more'
                    : 'Practice now to keep your streak'}
                </span>
              </button>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. RIGHT SIDEBAR (Stats, Quests, Translator) */}
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
