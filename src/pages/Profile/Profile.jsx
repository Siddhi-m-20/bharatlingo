import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../services/auth'
import { fetchLearningAnalytics } from '../../services/dbService'
import { getSkillProficiencies } from '../../services/learnerModel'
import { achievements } from '../../data/achievements'
import { languages, getLanguageById } from '../../data/languages'
import TopNavbar from '../../components/Navigation/TopNavbar'
import AppSidebar from '../../components/Navigation/AppSidebar'
import RightSidebar from '../../components/RightSidebar/RightSidebar'
import LanguageFlag from '../../components/LanguageFlag/LanguageFlag'
import Button from '../../components/Button'
import ActivityChart from '../../components/ActivityChart/ActivityChart'
import {
  Award,
  Flame,
  Zap,
  BookOpen,
  Calendar,
  Target,
  Edit3,
  Check,
  X,
  User,
  Sparkles,
  Clock,
  Globe,
  Smile,
  Bell,
  BellRing,
  BellOff,
  BarChart3,
  RefreshCw,
} from 'lucide-react'
import {
  isPushSupported,
  getNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  sendPushNotificationTest,
} from '../../services/notificationService.js'
import { useTheme } from '../../services/themeContext'

const AGE_LABELS = {
  child: 'Under 13',
  teen: '13–17',
  'young-adult': '18–25',
  adult: '26–49',
  senior: '50+',
}

const GOAL_OPTIONS = [
  { id: 'conversation', label: 'Casual Conversation', icon: '💬' },
  { id: 'travel', label: 'Travel & Tourism', icon: '✈️' },
  { id: 'career', label: 'Career & Business', icon: '💼' },
  { id: 'culture', label: 'Cultural Heritage', icon: '🪔' },
  { id: 'exam', label: 'Exams & Schooling', icon: '📚' },
]

const AVATAR_PRESETS = [
  { name: 'Bharat', seed: 'Bharat', bg: 'b6e3f4' },
  { name: 'Ananya', seed: 'Ananya', bg: 'ffd5dc' },
  { name: 'Vikram', seed: 'Vikram', bg: 'c0aede' },
  { name: 'Meera', seed: 'Meera', bg: 'd1d4f9' },
  { name: 'Rohan', seed: 'Rohan', bg: 'ffdfbf' },
  { name: 'Kavya', seed: 'Kavya', bg: 'c1f4c5' },
  { name: 'Arya', seed: 'Arya', bg: 'fde2e4' },
  { name: 'Dev', seed: 'Dev', bg: 'e2ece9' },
]

function getAvatarUrl(seed, bg = 'b6e3f4,c0aede,d1d4f9') {
  return `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(seed || 'Bharat')}&backgroundColor=${bg}`
}

function formatMinutes(seconds, t) {
  const mins = Math.round((Number(seconds) || 0) / 60)
  const unit = t ? t('minutes_short') : 'min'
  return `${mins} ${unit}`
}

export default function Profile() {
  const navigate = useNavigate()
  const { user, updateUser, logout } = useAuth()
  const { t } = useTheme()
  const [isEditing, setIsEditing] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [analytics, setAnalytics] = useState({ activity: [], lessonAttempts: [], longestStreak: 0 })

  const [notificationState, setNotificationState] = useState(() => getNotificationPermission())
  const [notificationMsg, setNotificationMsg] = useState(null)
  const [isUpdatingNotif, setIsUpdatingNotif] = useState(false)

  const getGoalLabel = (goalId) => {
    return t(`goal_${goalId}`) || GOAL_OPTIONS.find((g) => g.id === goalId)?.label || goalId
  }

  const getAgeLabel = (ageKey) => {
    const normKey = String(ageKey || '').replace('-', '_')
    return t(`age_${normKey}`) || AGE_LABELS[ageKey] || ageKey
  }

  // Edit Form State
  const [name, setName] = useState(user?.name || '')
  const [bio, setBio] = useState(user?.bio || '')
  const [avatarSeed, setAvatarSeed] = useState(user?.avatar || user?.name || 'Bharat')
  const [learningLang, setLearningLang] = useState(user?.learningLanguage || 'hi')
  const [preferredLang, setPreferredLang] = useState(user?.preferredLanguage || 'en')
  const [goal, setGoal] = useState(user?.goal || 'conversation')
  const [ageRange, setAgeRange] = useState(user?.ageRange || 'adult')
  const [dailyGoal, setDailyGoal] = useState(user?.dailyGoal || 10)

  const activeCourse = getLanguageById(user?.learningLanguage)
  const fallbackSkills = getSkillProficiencies(user?.learningLanguage || 'hi')

  useEffect(() => {
    if (!user?.id || !user?.learningLanguage) return
    fetchLearningAnalytics(user.id, user.learningLanguage).then(setAnalytics)
  }, [user?.id, user?.learningLanguage])

  const persistedLearnerStats = user?.learnerStats?.[user?.learningLanguage]
  const persistedSkills = persistedLearnerStats?.skills
  const displaySkills = persistedSkills
    ? {
        listening: Number(persistedSkills.listening?.score) || 0,
        speaking: Number(persistedSkills.speaking?.score) || 0,
        overall: Number(persistedLearnerStats.overallAccuracy) || 0,
      }
    : fallbackSkills
  const activityList = Array.isArray(analytics?.activity) ? analytics.activity : []
  const lessonAttemptsList = Array.isArray(analytics?.lessonAttempts) ? analytics.lessonAttempts : []

  const activitySummary = activityList.reduce((result, item) => ({
    exercises: result.exercises + (Number(item.exercises_completed) || 0),
    xp: result.xp + (Number(item.xp_earned) || 0),
    seconds: result.seconds + (Number(item.session_duration_seconds) || 0),
  }), { exercises: 0, xp: 0, seconds: 0 })
  const activityDatesWithDuration = new Set(activityList
    .filter((item) => Number(item.session_duration_seconds) > 0)
    .map((item) => item.activity_date))
  activitySummary.seconds += lessonAttemptsList.reduce((total, attempt) => {
    const dateKey = attempt.completed_at?.slice(0, 10)
    return total + (dateKey && !activityDatesWithDuration.has(dateKey) ? Number(attempt.duration_seconds) || 0 : 0)
  }, 0)
  const masteryTopics = Object.values(persistedLearnerStats?.topics || {}).filter((topic) => topic.attempts > 0)
  const mastery = masteryTopics.length > 0
    ? Math.round(masteryTopics.reduce((sum, topic) => sum + (Number(topic.masteryLevel) || 0), 0) / masteryTopics.length / 5 * 100)
    : 0
  const makeStatItems = () => [
    [t('stat_learning_time'), formatMinutes(activitySummary.seconds, t)],
    [t('stat_exercises'), activitySummary.exercises],
    [t('stat_xp_earned'), activitySummary.xp],
    [t('stat_accuracy'), `${displaySkills.overall}%`],
    [t('stat_current_streak'), user?.streak || 0],
    [t('stat_longest_streak'), Math.max(analytics.longestStreak, user?.streak || 0)],
    [t('stat_mastery'), `${mastery}%`],
    [t('stat_listening'), `${displaySkills.listening}%`],
    [t('stat_speaking'), `${displaySkills.speaking}%`],
  ]
  const unlockedAchievements = user
    ? achievements.filter((achievement) => achievement.condition(user))
    : []

  const handleStartEditing = () => {
    setName(user?.name || '')
    setBio(user?.bio || '')
    setAvatarSeed(user?.avatar || user?.name || 'Bharat')
    setLearningLang(user?.learningLanguage || 'hi')
    setPreferredLang(user?.preferredLanguage || 'en')
    setGoal(user?.goal || 'conversation')
    setAgeRange(user?.ageRange || 'adult')
    setDailyGoal(user?.dailyGoal || 10)
    setIsEditing(true)
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    if (!name.trim()) return

    await updateUser({
      name: name.trim(),
      bio: bio.trim(),
      avatar: avatarSeed.trim(),
      learningLanguage: learningLang,
      preferredLanguage: preferredLang,
      goal,
      ageRange,
      dailyGoal: parseInt(dailyGoal, 10),
    })

    setIsEditing(false)
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  const handleCancelEditing = () => {
    setIsEditing(false)
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleToggleNotifications = async () => {
    setIsUpdatingNotif(true)
    setNotificationMsg(null)
    if (notificationState === 'granted') {
      const res = await unsubscribeFromPush(user)
      if (res.success) {
        setNotificationState('default')
        setNotificationMsg(t('reminders_off'))
      }
    } else {
      const res = await subscribeToPush(user)
      if (res.success) {
        setNotificationState('granted')
        setNotificationMsg(res.message || t('reminders_enabled'))
      } else {
        setNotificationState(getNotificationPermission())
        setNotificationMsg(res.message || t('notif_enable_error') || 'Could not enable notifications.')
      }
    }
    setIsUpdatingNotif(false)
  }

  const handleSendTestAlert = async () => {
    const courseName = activeCourse?.name || 'BharatLingo'
    const title = (t('streak_safe_title') || '{language} Streak Safe! 🔥').replace('{language}', courseName)
    const body = (t('streak_safe_body') || 'Keep up the great work learning {language}!').replace('{language}', courseName)
    const res = await sendPushNotificationTest(user, {
      title,
      body,
    })
    setNotificationMsg(res.message)
  }

  return (
    <div className="min-h-screen bg-[#F7F5EF] dark:bg-slate-950 flex flex-col md:flex-row pb-20 md:pb-6">
      {/* 1. LEFT SIDEBAR */}
      <AppSidebar />

      {/* 2. CENTER PROFILE CONTENT */}
      <main className="flex-1 min-w-0 md:ml-72 flex flex-col min-h-screen">
        <TopNavbar />

        <div className="p-4 sm:p-6 lg:p-8 space-y-6 w-full max-w-5xl mx-auto flex-1">
        {/* Success Alert Banner */}
        <AnimatePresence>
          {savedSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-[#0B8F62] text-white px-4 py-3 rounded-2xl flex items-center justify-between text-xs font-bold shadow-md"
            >
              <span className="flex items-center gap-2">
                <Check size={16} /> {t('profile_saved')}
              </span>
              <button onClick={() => setSavedSuccess(false)} className="text-white/80 hover:text-white">
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* View Profile Card / Edit Profile Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-[#E8E6E0] dark:border-slate-800 p-6 shadow-sm">
          {!isEditing ? (
            /* View Mode */
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <img
                    src={getAvatarUrl(user?.avatar || user?.name || 'Bharat')}
                    alt={user?.name || 'Profile Avatar'}
                    className="w-20 h-20 rounded-3xl border-2 border-[#0B8F62] p-1 bg-white shadow-md flex-shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-black text-[#25231F] dark:text-white">
                        {user?.name || t('default_learner') || 'Learner'}
                      </h1>
                    </div>
                    <p className="text-xs text-[#77736B] dark:text-slate-400 mt-0.5">{user?.email}</p>

                    {user?.bio && (
                      <p className="text-xs text-[#25231F] dark:text-slate-200 mt-2 italic bg-[#F7F5EF] dark:bg-slate-800/70 px-3 py-1.5 rounded-xl border border-[#E8E6E0] dark:border-slate-700">
                        "{user.bio}"
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 mt-3 text-xs font-bold">
                      <span className="flex items-center gap-1 text-[#0B8F62] bg-[#0B8F62]/10 px-2.5 py-1 rounded-full">
                        <Calendar size={12} />
                        {t('joined_label')} {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
                      </span>
                      {activeCourse && (
                        <span className="flex items-center gap-1.5 text-[#3B82F6] bg-[#3B82F6]/10 px-2.5 py-1 rounded-full">
                          <LanguageFlag languageId={activeCourse.id} size={14} />
                          {t('learning_label')} {activeCourse.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="small"
                  onClick={handleStartEditing}
                  className="flex items-center gap-1.5 font-black text-xs self-start"
                >
                  <Edit3 size={14} />
                  {t('edit_profile')}
                </Button>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-3 gap-3 text-center pt-4 border-t border-[#E8E6E0] dark:border-slate-800">
                <div className="p-3 bg-[#F7F5EF] dark:bg-slate-800 rounded-2xl">
                  <div className="flex items-center justify-center gap-1 text-[#F39A45] font-black text-xl">
                    <Zap size={18} fill="currentColor" />
                    <span>{user?.xp || 0}</span>
                  </div>
                  <p className="text-[11px] font-bold text-[#77736B] dark:text-slate-400 uppercase mt-0.5">
                    {t('total_xp')}
                  </p>
                </div>

                <div className="p-3 bg-[#F7F5EF] dark:bg-slate-800 rounded-2xl">
                  <div className="flex items-center justify-center gap-1 text-[#D84B42] font-black text-xl">
                    <Flame size={18} fill="currentColor" />
                    <span>{user?.streak || 0}</span>
                  </div>
                  <p className="text-[11px] font-bold text-[#77736B] dark:text-slate-400 uppercase mt-0.5">
                    {t('day_streak')}
                  </p>
                </div>

                <div className="p-3 bg-[#F7F5EF] dark:bg-slate-800 rounded-2xl">
                  <div className="flex items-center justify-center gap-1 text-[#0B8F62] font-black text-xl">
                    <BookOpen size={18} />
                    <span>{user?.completedLessons?.length || 0}</span>
                  </div>
                  <p className="text-[11px] font-bold text-[#77736B] dark:text-slate-400 uppercase mt-0.5">
                    {t('stat_mastered')}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E8E6E0] dark:border-slate-800 space-y-3">
                <h2 className="text-xs font-black text-[#25231F] dark:text-white uppercase tracking-wider">
                  {t('learner_statistics')}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {makeStatItems().map(([label, value]) => (
                    <div key={label} className="p-2.5 bg-[#F7F5EF] dark:bg-slate-800 rounded-xl">
                      <p className="text-[10px] font-bold text-[#77736B] dark:text-slate-400">{label}</p>
                      <p className="text-sm font-black text-[#25231F] dark:text-white">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* ── Edit Profile Form ── */
            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8E6E0] dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Edit3 size={18} className="text-[#0B8F62]" />
                  <h2 className="text-lg font-black text-[#25231F] dark:text-white">{t('edit_profile')}</h2>
                </div>
                <button
                  type="button"
                  onClick={handleCancelEditing}
                  className="text-[#77736B] hover:text-[#25231F] dark:hover:text-white p-1"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-black text-[#77736B] dark:text-slate-400 uppercase tracking-wider mb-2">
                  {t('choose_avatar')}
                </label>
                <div className="flex items-center gap-4 mb-3">
                  <img
                    src={getAvatarUrl(avatarSeed)}
                    alt="Preview Avatar"
                    className="w-16 h-16 rounded-2xl border-2 border-[#0B8F62] p-1 bg-white shadow-sm flex-shrink-0"
                  />
                  <div className="flex-1">
                    <input
                      type="text"
                      value={avatarSeed}
                      onChange={(e) => setAvatarSeed(e.target.value)}
                      placeholder={t('avatar_seed_placeholder')}
                      className="w-full px-3.5 py-2 text-xs font-bold bg-[#F7F5EF] dark:bg-slate-800 border border-[#E8E6E0] dark:border-slate-700 rounded-xl focus:outline-none focus:border-[#0B8F62] text-[#25231F] dark:text-white"
                    />
                    <p className="text-[10px] text-[#77736B] dark:text-slate-400 mt-1">
                      {t('avatar_hint')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {AVATAR_PRESETS.map((p) => {
                    const isSelected = avatarSeed === p.seed
                    return (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => setAvatarSeed(p.seed)}
                        className={`p-1 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${
                          isSelected
                            ? 'border-[#0B8F62] ring-2 ring-[#0B8F62]/30 bg-[#0B8F62]/10 scale-105'
                            : 'border-[#E8E6E0] dark:border-slate-800 hover:border-[#0B8F62]/50'
                        }`}
                      >
                        <img
                          src={getAvatarUrl(p.seed, p.bg)}
                          alt={p.name}
                          className="w-9 h-9 rounded-lg bg-white"
                        />
                        <span className="text-[9px] font-bold text-[#25231F] dark:text-slate-300 truncate w-full text-center">
                          {p.name}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Display Name */}
              <div>
                <label className="block text-xs font-black text-[#77736B] dark:text-slate-400 uppercase tracking-wider mb-1">
                  {t('full_name_label')}
                </label>
                <input
                  type="text"
                  required
                  maxLength={30}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('enter_name_placeholder')}
                  className="w-full px-4 py-2.5 text-sm font-bold bg-[#F7F5EF] dark:bg-slate-800 border border-[#E8E6E0] dark:border-slate-700 rounded-xl focus:outline-none focus:border-[#0B8F62] text-[#25231F] dark:text-white"
                />
              </div>

              {/* Bio / About */}
              <div>
                <label className="block text-xs font-black text-[#77736B] dark:text-slate-400 uppercase tracking-wider mb-1">
                  {t('bio_label')}
                </label>
                <textarea
                  rows={2}
                  maxLength={160}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder={t('bio_placeholder') || 'e.g. Learning Indian languages for conversations and cultural discovery!'}
                  className="w-full px-4 py-2 text-xs font-medium bg-[#F7F5EF] dark:bg-slate-800 border border-[#E8E6E0] dark:border-slate-700 rounded-xl focus:outline-none focus:border-[#0B8F62] text-[#25231F] dark:text-white resize-none"
                />
                <p className="text-[10px] text-right text-[#77736B] dark:text-slate-400 mt-0.5">
                  {bio.length}/160
                </p>
              </div>

              {/* Learning Course & Interface Language */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-[#77736B] dark:text-slate-400 uppercase tracking-wider mb-1">
                    {t('learning_language_label')}
                  </label>
                  <select
                    value={learningLang}
                    onChange={(e) => setLearningLang(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs font-bold bg-[#F7F5EF] dark:bg-slate-800 border border-[#E8E6E0] dark:border-slate-700 rounded-xl focus:outline-none focus:border-[#0B8F62] text-[#25231F] dark:text-white"
                  >
                    {languages.filter((l) => l.id !== 'en').map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name} ({l.nativeName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-[#77736B] dark:text-slate-400 uppercase tracking-wider mb-1">
                    {t('interface_language_label')}
                  </label>
                  <select
                    value={preferredLang}
                    onChange={(e) => setPreferredLang(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs font-bold bg-[#F7F5EF] dark:bg-slate-800 border border-[#E8E6E0] dark:border-slate-700 rounded-xl focus:outline-none focus:border-[#0B8F62] text-[#25231F] dark:text-white"
                  >
                    {languages.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name} ({l.nativeName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Goal & Age Range */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-[#77736B] dark:text-slate-400 uppercase tracking-wider mb-1">
                    {t('primary_goal_label')}
                  </label>
                  <select
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs font-bold bg-[#F7F5EF] dark:bg-slate-800 border border-[#E8E6E0] dark:border-slate-700 rounded-xl focus:outline-none focus:border-[#0B8F62] text-[#25231F] dark:text-white"
                  >
                    {GOAL_OPTIONS.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.icon} {getGoalLabel(g.id)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-[#77736B] dark:text-slate-400 uppercase tracking-wider mb-1">
                    {t('age_group_label')}
                  </label>
                  <select
                    value={ageRange}
                    onChange={(e) => setAgeRange(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs font-bold bg-[#F7F5EF] dark:bg-slate-800 border border-[#E8E6E0] dark:border-slate-700 rounded-xl focus:outline-none focus:border-[#0B8F62] text-[#25231F] dark:text-white"
                  >
                    {Object.keys(AGE_LABELS).map((k) => (
                      <option key={k} value={k}>
                        {getAgeLabel(k)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Daily Goal */}
              <div>
                <label className="block text-xs font-black text-[#77736B] dark:text-slate-400 uppercase tracking-wider mb-1">
                  {t('daily_study_target')}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 10, 15, 20].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setDailyGoal(mins)}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                        dailyGoal === mins
                          ? 'border-[#0B8F62] bg-[#0B8F62]/10 text-[#0B8F62] dark:text-[#34D399] ring-2 ring-[#0B8F62]/30'
                          : 'border-[#E8E6E0] dark:border-slate-800 bg-[#F7F5EF] dark:bg-slate-800 text-[#25231F] dark:text-slate-300'
                      }`}
                    >
                      {mins} {t('minutes_short') || 'mins'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1 font-bold" onClick={handleCancelEditing}>
                  {t('cancel')}
                </Button>
                <Button type="submit" variant="primary" className="flex-1 font-bold flex items-center justify-center gap-1.5">
                  <Check size={16} /> {t('save_changes')}
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Shared 14-Day Activity Chart */}
        <ActivityChart activity={analytics.activity} />

        {/* Learning Plan Summary (if available) */}
        {user?.learningPlan && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-[#E8E6E0] dark:border-slate-800 p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Target size={18} className="text-[#0B8F62]" />
              <h3 className="text-base font-black text-[#25231F] dark:text-white uppercase tracking-wider">
                {t('my_learning_plan')}
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 bg-[#F7F5EF] dark:bg-slate-800 rounded-xl">
                <p className="font-black text-sm text-[#0B8F62]">{user.learningPlan.startingLevel}</p>
                <p className="text-[10px] text-[#77736B] dark:text-slate-400 mt-0.5">{t('plan_level_label')}</p>
              </div>
              <div className="p-2.5 bg-[#F7F5EF] dark:bg-slate-800 rounded-xl">
                <p className="font-black text-sm text-[#3B82F6]">
                  {getGoalLabel(user.goal || user.learningPlan.goal)}
                </p>
                <p className="text-[10px] text-[#77736B] dark:text-slate-400 mt-0.5">{t('plan_goal_label')}</p>
              </div>
              <div className="p-2.5 bg-[#F7F5EF] dark:bg-slate-800 rounded-xl">
                <p className="font-black text-sm text-[#F39A45]">{user.dailyGoal || 10} {t('minutes_short') || 'mins'}</p>
                <p className="text-[10px] text-[#77736B] dark:text-slate-400 mt-0.5">{t('plan_daily_goal_label')}</p>
              </div>
            </div>
            {user.ageRange && (
              <p className="text-xs text-[#77736B] dark:text-slate-400">
                {t('age_group_display')} <span className="font-bold text-[#25231F] dark:text-white">{getAgeLabel(user.ageRange)}</span>
              </p>
            )}
            <div className="flex flex-wrap gap-1.5">
              {(user.learningPlan.focusAreas || []).slice(0, 4).map((area, i) => (
                <span key={i} className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#0B8F62]/10 text-[#0B8F62] dark:text-[#34D399]">
                  {area}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Achievements Showcase */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-[#E8E6E0] dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award size={20} className="text-[#F39A45]" />
              <h3 className="text-base font-black text-[#25231F] dark:text-white uppercase tracking-wider">
                {t('achievements_badges')} ({unlockedAchievements.length})
              </h3>
            </div>
          </div>

          {unlockedAchievements.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-xs text-[#77736B] dark:text-slate-400">
                {t('achievements_empty')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {unlockedAchievements.map((achievement) => (
                <motion.div
                  key={achievement.id}
                  whileHover={{ scale: 1.04, y: -2 }}
                  className="bg-[#0B8F62]/10 border border-[#0B8F62]/30 rounded-2xl p-4 text-center space-y-1"
                >
                  <div className="text-3xl">{achievement.icon}</div>
                  <p className="font-black text-xs text-[#25231F] dark:text-white">
                    {t(`achievement_${achievement.id}_name`) || achievement.name}
                  </p>
                  <p className="text-[10px] text-[#77736B] dark:text-slate-400 leading-tight">
                    {t(`achievement_${achievement.id}_desc`) || achievement.description}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Daily Streak Reminders & Notification Control */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-[#E8E6E0] dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 text-white flex items-center justify-center shadow-sm">
                {notificationState === 'granted' ? <BellRing size={20} /> : <Bell size={20} />}
              </div>
              <div>
                <h3 className="text-sm font-black text-[#25231F] dark:text-white">
                  {t('daily_streak_reminders')}
                </h3>
                <p className="text-[11px] text-[#77736B] dark:text-slate-400">
                  {isPushSupported() ? t('push_alert_tagline') : t('push_not_supported')}
                </p>
              </div>
            </div>

            <span
              className={`text-[10px] font-black px-2.5 py-1 rounded-full shrink-0 border ${
                notificationState === 'granted'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                  : notificationState === 'denied'
                  ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                  : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
              }`}
            >
              {notificationState === 'granted' ? t('notif_active') : notificationState === 'denied' ? t('notif_blocked') : t('notif_off')}
            </span>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              disabled={isUpdatingNotif || !isPushSupported()}
              onClick={handleToggleNotifications}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                notificationState === 'granted'
                  ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                  : 'bg-[#0B8F62] hover:bg-[#097b54] text-white shadow-sm shadow-[#0B8F62]/20'
              }`}
            >
              {isUpdatingNotif ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : notificationState === 'granted' ? (
                <>
                  <BellOff size={14} />
                  <span>{t('turn_off_reminders')}</span>
                </>
              ) : (
                <>
                  <BellRing size={14} />
                  <span>{t('enable_reminders')}</span>
                </>
              )}
            </button>

            {notificationState === 'granted' && (
              <button
                type="button"
                onClick={handleSendTestAlert}
                className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                title={t('test_reminder_tooltip')}
              >
                <span>{t('test_alert')}</span>
              </button>
            )}
          </div>

          {notificationMsg && (
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/30 p-2 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
              {notificationMsg}
            </p>
          )}
        </div>

        {/* Log Out Action */}
        <div className="pt-2">
          <Button variant="danger" className="w-full font-bold" onClick={handleLogout}>
            {t('log_out_account')}
          </Button>
        </div>
        </div>
      </main>
    </div>
  )
}
