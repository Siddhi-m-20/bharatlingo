import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../services/auth'
import { achievements } from '../../data/achievements'
import { languages, getLanguageById } from '../../data/languages'
import AppSidebar from '../../components/Navigation/AppSidebar'
import RightSidebar from '../../components/RightSidebar/RightSidebar'
import LanguageFlag from '../../components/LanguageFlag/LanguageFlag'
import Button from '../../components/Button'
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
} from 'lucide-react'

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

export default function Profile() {
  const navigate = useNavigate()
  const { user, updateUser, logout } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)

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

  return (
    <div className="min-h-screen bg-[#F7F5EF] dark:bg-slate-950 flex justify-center pb-20 md:pb-0">
      {/* 1. LEFT SIDEBAR */}
      <AppSidebar />

      {/* 2. CENTER PROFILE CONTENT */}
      <main className="flex-1 max-w-[640px] md:ml-72 px-4 py-6 md:py-8 space-y-6">
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
                <Check size={16} /> Profile details successfully updated!
              </span>
              <button onClick={() => setSavedSuccess(false)} className="text-white/80 hover:text-white">
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── View Profile Card / Edit Profile Card ── */}
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
                        {user?.name || 'Learner'}
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
                        Joined {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
                      </span>
                      {activeCourse && (
                        <span className="flex items-center gap-1.5 text-[#3B82F6] bg-[#3B82F6]/10 px-2.5 py-1 rounded-full">
                          <LanguageFlag languageId={activeCourse.id} size={14} />
                          Learning {activeCourse.name}
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
                  Edit Profile
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
                    Total XP
                  </p>
                </div>

                <div className="p-3 bg-[#F7F5EF] dark:bg-slate-800 rounded-2xl">
                  <div className="flex items-center justify-center gap-1 text-[#D84B42] font-black text-xl">
                    <Flame size={18} fill="currentColor" />
                    <span>{user?.streak || 0}</span>
                  </div>
                  <p className="text-[11px] font-bold text-[#77736B] dark:text-slate-400 uppercase mt-0.5">
                    Day Streak
                  </p>
                </div>

                <div className="p-3 bg-[#F7F5EF] dark:bg-slate-800 rounded-2xl">
                  <div className="flex items-center justify-center gap-1 text-[#0B8F62] font-black text-xl">
                    <BookOpen size={18} />
                    <span>{user?.completedLessons?.length || 0}</span>
                  </div>
                  <p className="text-[11px] font-bold text-[#77736B] dark:text-slate-400 uppercase mt-0.5">
                    Mastered
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* ── Edit Profile Form ── */
            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8E6E0] dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Edit3 size={18} className="text-[#0B8F62]" />
                  <h2 className="text-lg font-black text-[#25231F] dark:text-white">Edit Profile</h2>
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
                  Choose Avatar Style
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
                      placeholder="Custom avatar seed or nickname"
                      className="w-full px-3.5 py-2 text-xs font-bold bg-[#F7F5EF] dark:bg-slate-800 border border-[#E8E6E0] dark:border-slate-700 rounded-xl focus:outline-none focus:border-[#0B8F62] text-[#25231F] dark:text-white"
                    />
                    <p className="text-[10px] text-[#77736B] dark:text-slate-400 mt-1">
                      Type any word or pick a preset character below:
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
                  Full Name / Display Name *
                </label>
                <input
                  type="text"
                  required
                  maxLength={30}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-2.5 text-sm font-bold bg-[#F7F5EF] dark:bg-slate-800 border border-[#E8E6E0] dark:border-slate-700 rounded-xl focus:outline-none focus:border-[#0B8F62] text-[#25231F] dark:text-white"
                />
              </div>

              {/* Bio / About */}
              <div>
                <label className="block text-xs font-black text-[#77736B] dark:text-slate-400 uppercase tracking-wider mb-1">
                  Bio / Learning Motto (Optional)
                </label>
                <textarea
                  rows={2}
                  maxLength={160}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="e.g. Learning Marathi for travel and discovering Indian regional literature!"
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
                    Learning Language
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
                    Interface Language
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
                    Primary Goal
                  </label>
                  <select
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs font-bold bg-[#F7F5EF] dark:bg-slate-800 border border-[#E8E6E0] dark:border-slate-700 rounded-xl focus:outline-none focus:border-[#0B8F62] text-[#25231F] dark:text-white"
                  >
                    {GOAL_OPTIONS.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.icon} {g.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-[#77736B] dark:text-slate-400 uppercase tracking-wider mb-1">
                    Age Group
                  </label>
                  <select
                    value={ageRange}
                    onChange={(e) => setAgeRange(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs font-bold bg-[#F7F5EF] dark:bg-slate-800 border border-[#E8E6E0] dark:border-slate-700 rounded-xl focus:outline-none focus:border-[#0B8F62] text-[#25231F] dark:text-white"
                  >
                    {Object.entries(AGE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Daily Goal */}
              <div>
                <label className="block text-xs font-black text-[#77736B] dark:text-slate-400 uppercase tracking-wider mb-1">
                  Daily Study Target
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
                      {mins} mins
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1 font-bold" onClick={handleCancelEditing}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="flex-1 font-bold flex items-center justify-center gap-1.5">
                  <Check size={16} /> Save Changes
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Learning Plan Summary (if available) */}
        {user?.learningPlan && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-[#E8E6E0] dark:border-slate-800 p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Target size={18} className="text-[#0B8F62]" />
              <h3 className="text-base font-black text-[#25231F] dark:text-white uppercase tracking-wider">
                My Learning Plan
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 bg-[#F7F5EF] dark:bg-slate-800 rounded-xl">
                <p className="font-black text-sm text-[#0B8F62]">{user.learningPlan.startingLevel}</p>
                <p className="text-[10px] text-[#77736B] dark:text-slate-400 mt-0.5">Level</p>
              </div>
              <div className="p-2.5 bg-[#F7F5EF] dark:bg-slate-800 rounded-xl">
                <p className="font-black text-sm text-[#3B82F6]">
                  {GOAL_OPTIONS.find((g) => g.id === (user.goal || user.learningPlan.goal))?.label || user.learningPlan.goal}
                </p>
                <p className="text-[10px] text-[#77736B] dark:text-slate-400 mt-0.5">Goal</p>
              </div>
              <div className="p-2.5 bg-[#F7F5EF] dark:bg-slate-800 rounded-xl">
                <p className="font-black text-sm text-[#F39A45]">{user.dailyGoal || 10} mins</p>
                <p className="text-[10px] text-[#77736B] dark:text-slate-400 mt-0.5">Daily Goal</p>
              </div>
            </div>
            {user.ageRange && (
              <p className="text-xs text-[#77736B] dark:text-slate-400">
                Age group: <span className="font-bold text-[#25231F] dark:text-white">{AGE_LABELS[user.ageRange] || user.ageRange}</span>
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
                Achievements & Badges ({unlockedAchievements.length})
              </h3>
            </div>
          </div>

          {unlockedAchievements.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-xs text-[#77736B] dark:text-slate-400">
                Complete lessons and maintain daily streaks to unlock prestigious badges!
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
                  <p className="font-black text-xs text-[#25231F] dark:text-white">{achievement.name}</p>
                  <p className="text-[10px] text-[#77736B] dark:text-slate-400 leading-tight">
                    {achievement.description}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Log Out Action */}
        <div className="pt-2">
          <Button variant="danger" className="w-full font-bold" onClick={handleLogout}>
            Log Out Account
          </Button>
        </div>
      </main>

      {/* 3. RIGHT SIDEBAR */}
      <RightSidebar />
    </div>
  )
}
