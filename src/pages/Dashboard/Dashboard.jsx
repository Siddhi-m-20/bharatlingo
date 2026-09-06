/**
 * Dashboard — BharatLingo
 *
 * Truly Adaptive Learning Hub (Duolingo / Bhasha-inspired)
 *
 * Core Features:
 * 1. "Your Next Lesson" / "Personalized Practice" Hero Card (with dynamic pedagogical rationale)
 * 2. Real-time Skill Proficiency Radar / Breakdown (Vocabulary, Listening, Speaking, Grammar)
 * 3. Spaced Review & Weak Area Quick Drills
 * 4. Topic Discovery Grid (Explore topics with real-time adaptive exercise selection)
 * 5. Clean, modern, responsive aesthetics without fixed sequential lesson numbers.
 */

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../services/auth'
import { useProgress } from '../../services/progress'
import { fetchNextAdaptiveLesson } from '../../services/dynamicLessonService'
import { getLanguageById } from '../../data/languages'
import { getSkillProficiencies, getWeakAreas, getReviewCandidates, TOPIC_CATEGORIES } from '../../services/learnerModel'
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
  Target,
  Mic,
  Headphones,
  BookOpen,
  Compass,
  AlertTriangle,
  Brain,
  ShieldCheck,
} from 'lucide-react'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { streak, hearts, gems } = useProgress()

  const [nextLesson, setNextLesson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [skillStats, setSkillStats] = useState({ vocabulary: 75, listening: 75, speaking: 75, grammar: 75, overall: 80, difficulty: 1 })
  const [weakAreas, setWeakAreas] = useState({ topics: [], skills: [], hasWeaknesses: false })
  const [dueReviews, setDueReviews] = useState([])
  const [showAlphabetModal, setShowAlphabetModal] = useState(false)
  const [showPlanBanner, setShowPlanBanner] = useState(false)

  const learningLang = getLanguageById(user?.learningLanguage) || { name: 'Hindi', nativeName: 'हिन्दी', id: 'hi' }
  const preferredLang = getLanguageById(user?.preferredLanguage || 'en') || { name: 'English', id: 'en' }

  useEffect(() => {
    if (!user?.learningLanguage || !user?.goal) {
      navigate('/onboarding')
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

  const diffBadge = getDifficultyBadge(skillStats.difficulty)

  return (
    <div className="min-h-screen bg-[#F7F5EF] dark:bg-slate-950 flex justify-center pb-20 md:pb-6">
      {/* 1. LEFT SIDEBAR NAVIGATION */}
      <AppSidebar />

      {/* 2. CENTER CONTENT */}
      <main className="flex-1 max-w-[640px] md:ml-64 px-4 py-5 space-y-4">

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
                  <p className="font-extrabold text-xs uppercase tracking-wider text-white/80 mb-0.5">Your Personalized Path</p>
                  <p className="font-bold text-sm">
                    {user.learningPlan.startingLevel} Level · {user.learningPlan.goal}
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
                  {learningLang.name} Course
                </h1>
                <p className="text-[11px] text-[#77736B] dark:text-slate-400">
                  {learningLang.nativeName} · Teaching in{' '}
                  <span className="font-bold text-[#0B8F62] dark:text-[#34D399]">{preferredLang?.name || 'English'}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 text-xs font-black rounded-xl uppercase tracking-wider ${diffBadge.color}`}>
                {diffBadge.label}
              </span>
              <span className="px-2.5 py-1 bg-[#0B8F62]/10 text-[#0B8F62] dark:text-[#34D399] text-xs font-black rounded-xl">
                {skillStats.overall}% Accuracy
              </span>
            </div>
          </div>

          {/* "Your Next Lesson" Dynamic Hero Showcase */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-black text-[#0B8F62] dark:text-[#34D399] uppercase tracking-wider">
                <Sparkles size={15} />
                <span>Your Next Lesson</span>
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
                  Selecting optimal exercises from your performance history...
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

                {/* Pedagogical Rationale Banner ("Why this was selected") */}
                <div className="bg-white/80 dark:bg-slate-900/80 rounded-xl p-2.5 border border-[#E8E6E0] dark:border-slate-700 flex items-start gap-2 text-xs">
                  <Brain size={16} className="text-[#0B8F62] shrink-0 mt-0.5" />
                  <p className="text-[#25231F] dark:text-slate-200 font-semibold leading-relaxed">
                    <span className="font-black text-[#0B8F62]">Adaptive Focus: </span>
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
                  <span>Start Personalized Lesson</span>
                </motion.button>
              </div>
            )}
          </div>
        </div>

        {/* ── 2. REAL-TIME SKILL PROFICIENCY METERS ────────────────────── */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-[#E8E6E0] dark:border-slate-800 p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E8E6E0]/70 dark:border-slate-800">
            <h2 className="font-black text-xs text-[#25231F] dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Target size={15} className="text-[#0B8F62]" />
              Skill Proficiency Radar
            </h2>
            <span className="text-[11px] font-bold text-[#77736B] dark:text-slate-400">
              Adapts dynamically
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            {/* Vocabulary */}
            <div className="p-3 bg-[#F7F5EF] dark:bg-slate-800 rounded-2xl border border-[#E8E6E0] dark:border-slate-700/60 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-black">
                <span className="text-[#77736B] dark:text-slate-400 flex items-center gap-1">
                  <BookOpen size={13} className="text-amber-500" />
                  Vocab
                </span>
                <span className="text-[#25231F] dark:text-white">{skillStats.vocabulary}%</span>
              </div>
              <div className="w-full bg-[#E8E6E0] dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${skillStats.vocabulary}%` }}
                />
              </div>
            </div>

            {/* Listening */}
            <div className="p-3 bg-[#F7F5EF] dark:bg-slate-800 rounded-2xl border border-[#E8E6E0] dark:border-slate-700/60 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-black">
                <span className="text-[#77736B] dark:text-slate-400 flex items-center gap-1">
                  <Headphones size={13} className="text-blue-500" />
                  Listen
                </span>
                <span className="text-[#25231F] dark:text-white">{skillStats.listening}%</span>
              </div>
              <div className="w-full bg-[#E8E6E0] dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${skillStats.listening}%` }}
                />
              </div>
            </div>

            {/* Speaking */}
            <div className="p-3 bg-[#F7F5EF] dark:bg-slate-800 rounded-2xl border border-[#E8E6E0] dark:border-slate-700/60 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-black">
                <span className="text-[#77736B] dark:text-slate-400 flex items-center gap-1">
                  <Mic size={13} className="text-emerald-500" />
                  Speech
                </span>
                <span className="text-[#25231F] dark:text-white">{skillStats.speaking}%</span>
              </div>
              <div className="w-full bg-[#E8E6E0] dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${skillStats.speaking}%` }}
                />
              </div>
            </div>

            {/* Grammar */}
            <div className="p-3 bg-[#F7F5EF] dark:bg-slate-800 rounded-2xl border border-[#E8E6E0] dark:border-slate-700/60 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-black">
                <span className="text-[#77736B] dark:text-slate-400 flex items-center gap-1">
                  <Zap size={13} className="text-purple-500" />
                  Grammar
                </span>
                <span className="text-[#25231F] dark:text-white">{skillStats.grammar}%</span>
              </div>
              <div className="w-full bg-[#E8E6E0] dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-purple-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${skillStats.grammar}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── 3. SUBORDINATED QUICK TOOLS ──────────────────────────────── */}
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => navigate('/stories')}
            className="flex flex-col items-center justify-center p-2.5 bg-white dark:bg-slate-900 hover:bg-amber-50/50 dark:hover:bg-slate-800/80 border border-[#E8E6E0] dark:border-slate-800 rounded-2xl transition-all group cursor-pointer"
          >
            <span className="text-xl mb-1 group-hover:scale-110 transition-transform">📖</span>
            <span className="text-[11px] font-bold text-[#25231F] dark:text-slate-200">Stories</span>
          </button>

          <button
            onClick={() => navigate('/tutor')}
            className="flex flex-col items-center justify-center p-2.5 bg-white dark:bg-slate-900 hover:bg-indigo-50/50 dark:hover:bg-slate-800/80 border border-[#E8E6E0] dark:border-slate-800 rounded-2xl transition-all group cursor-pointer"
          >
            <span className="text-xl mb-1 group-hover:scale-110 transition-transform">🤖</span>
            <span className="text-[11px] font-bold text-[#25231F] dark:text-slate-200">AI Tutor</span>
          </button>

          <button
            onClick={() => navigate('/writing')}
            className="flex flex-col items-center justify-center p-2.5 bg-white dark:bg-slate-900 hover:bg-emerald-50/50 dark:hover:bg-slate-800/80 border border-[#E8E6E0] dark:border-slate-800 rounded-2xl transition-all group cursor-pointer"
          >
            <span className="text-xl mb-1 group-hover:scale-110 transition-transform">✍️</span>
            <span className="text-[11px] font-bold text-[#25231F] dark:text-slate-200">Writing</span>
          </button>

          <button
            onClick={() => navigate('/letters')}
            className="flex flex-col items-center justify-center p-2.5 bg-white dark:bg-slate-900 hover:bg-purple-50/50 dark:hover:bg-slate-800/80 border border-[#E8E6E0] dark:border-slate-800 rounded-2xl transition-all group cursor-pointer"
          >
            <span className="text-xl mb-1 group-hover:scale-110 transition-transform">🔤</span>
            <span className="text-[11px] font-bold text-[#25231F] dark:text-slate-200">Script</span>
          </button>
        </div>

        {/* ── 4. SPACED REVIEW & WEAK TOPIC QUICK DRILLS ──────────────── */}
        {dueReviews.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-[#E8E6E0] dark:border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-black text-[#D84B42] dark:text-[#F87171] uppercase tracking-wider">
                <RefreshCw size={14} className="animate-spin" style={{ animationDuration: '8s' }} />
                <span>Spaced Review Ready</span>
              </div>
              <span className="text-[11px] font-bold text-[#77736B] dark:text-slate-400">
                {dueReviews.length} words due for retention
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
              <span>Practice Due Reviews</span>
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

      {/* 3. RIGHT SIDEBAR (Stats, Streaks, Leaderboard) */}
      <RightSidebar />

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
