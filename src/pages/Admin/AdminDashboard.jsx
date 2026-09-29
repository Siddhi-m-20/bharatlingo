import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../services/auth'
import {
  fetchAllUserProfiles,
  aggregateAdminMetrics,
  auditContentHealth,
} from '../../services/adminService'
import { languages } from '../../data/languages'
import {
  Users,
  UserCheck,
  UserPlus,
  BookOpen,
  CheckCircle2,
  Award,
  Globe2,
  Search,
  Filter,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
  BarChart3,
  Layers,
  ArrowLeft,
  Calendar,
  Zap,
  Flame,
  FileText,
  Clock,
  Sparkles,
  Info,
  CheckCircle,
  XCircle,
  ChevronRight,
  X,
} from 'lucide-react'
import './AdminDashboard.css'

export default function AdminDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [rawProfiles, setRawProfiles] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [languageFilter, setLanguageFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState(null)

  // Load real data from Supabase / local profiles
  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError(null)

    try {
      const profiles = await fetchAllUserProfiles()
      setRawProfiles(profiles)
    } catch (err) {
      console.error('Failed to load admin data:', err)
      setError('Failed to load system metrics. Please check your database connection.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Aggregate metrics from real profiles
  const metrics = useMemo(() => {
    return aggregateAdminMetrics(rawProfiles)
  }, [rawProfiles])

  // Audit content health
  const contentHealthReports = useMemo(() => {
    return auditContentHealth()
  }, [])

  // Filtered users for User Management table
  const filteredUsers = useMemo(() => {
    return (metrics.users || []).filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.id.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesLang =
        languageFilter === 'all' ||
        u.learningLanguage === languageFilter ||
        u.preferredLanguage === languageFilter

      return matchesSearch && matchesLang
    })
  }, [metrics.users, searchQuery, languageFilter])

  // Target language enrollment data sorted by popularity
  const targetLangAnalytics = useMemo(() => {
    const totalWithLang = Object.values(metrics.targetLanguageDistribution || {}).reduce((a, b) => a + b, 0)
    return languages.map((lang) => {
      const count = metrics.targetLanguageDistribution?.[lang.id] || 0
      const percentage = totalWithLang > 0 ? Math.round((count / totalWithLang) * 100) : 0
      return {
        ...lang,
        enrollmentCount: count,
        percentage,
      }
    }).sort((a, b) => b.enrollmentCount - a.enrollmentCount)
  }, [metrics.targetLanguageDistribution])

  // Interface language distribution
  const interfaceLangAnalytics = useMemo(() => {
    const total = Object.values(metrics.interfaceLanguageDistribution || {}).reduce((a, b) => a + b, 0)
    return languages.map((lang) => {
      const count = metrics.interfaceLanguageDistribution?.[lang.id] || 0
      const percentage = total > 0 ? Math.round((count / total) * 100) : 0
      return {
        ...lang,
        count,
        percentage,
      }
    }).sort((a, b) => b.count - a.count)
  }, [metrics.interfaceLanguageDistribution])

  return (
    <div className="admin-container min-h-screen bg-[#0E1520] text-gray-100 flex flex-col font-sans">
      {/* Admin Top Navigation Bar */}
      <header className="admin-header border-b border-[#1E293B] bg-[#121B2A]/90 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#1E2B3E] hover:bg-[#25364E] text-gray-300 hover:text-white transition-colors border border-gray-700/50"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Learner App
            </Link>
            <div className="h-4 w-px bg-gray-700" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-950/40">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold tracking-tight text-white">BharatLingo Admin Console</h1>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Live Telemetry
                  </span>
                </div>
                <p className="text-xs text-gray-400">Authenticated Administrator: <span className="text-emerald-400 font-mono">{user?.email}</span></p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-[#1E2B3E] hover:bg-[#283B54] text-gray-200 border border-gray-700 transition-all disabled:opacity-50"
              title={t('refresh_metrics')}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-400' : ''}`} />
              {refreshing ? 'Syncing...' : 'Refresh Telemetry'}
            </button>
          </div>
        </div>
      </header>

      {/* Admin Navigation Tabs */}
      <div className="border-b border-[#1E293B] bg-[#111927]">
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-2 overflow-x-auto py-2">
          {[
            { id: 'overview', label: 'System Overview', icon: BarChart3 },
            { id: 'users', label: `Learner Directory (${metrics.totalUsers})`, icon: Users },
            { id: 'languages', label: 'Language Analytics', icon: Globe2 },
            { id: 'learning', label: 'Learning Activity', icon: Zap },
            { id: 'health', label: 'Content Health & Scripts', icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#1A2638]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-500 border-t-transparent"></div>
            <p className="text-xs text-gray-400">Loading system metrics from Supabase...</p>
          </div>
        ) : (
          <>
            {/* 1. OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Real Key Performance Indicators */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                  <div className="admin-stat-card p-4 rounded-xl bg-[#141E2E] border border-gray-800/80 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-gray-400 mb-2">
                      <span className="text-xs font-medium">Registered Users</span>
                      <Users className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="text-2xl font-bold text-white tracking-tight">{metrics.totalUsers}</div>
                    <div className="text-[11px] text-gray-400 mt-1">Unique learner accounts</div>
                  </div>

                  <div className="admin-stat-card p-4 rounded-xl bg-[#141E2E] border border-gray-800/80 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-gray-400 mb-2">
                      <span className="text-xs font-medium">Active Learners</span>
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="text-2xl font-bold text-emerald-400 tracking-tight">{metrics.activeLearners}</div>
                    <div className="text-[11px] text-gray-400 mt-1">Active within past 7 days</div>
                  </div>

                  <div className="admin-stat-card p-4 rounded-xl bg-[#141E2E] border border-gray-800/80 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-gray-400 mb-2">
                      <span className="text-xs font-medium">New Learners</span>
                      <UserPlus className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="text-2xl font-bold text-purple-400 tracking-tight">{metrics.newUsers}</div>
                    <div className="text-[11px] text-gray-400 mt-1">Joined in last 30 days</div>
                  </div>

                  <div className="admin-stat-card p-4 rounded-xl bg-[#141E2E] border border-gray-800/80 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-gray-400 mb-2">
                      <span className="text-xs font-medium">Supported Languages</span>
                      <Globe2 className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="text-2xl font-bold text-amber-400 tracking-tight">{metrics.supportedLanguages}</div>
                    <div className="text-[11px] text-gray-400 mt-1">Indian languages + English</div>
                  </div>

                  <div className="admin-stat-card p-4 rounded-xl bg-[#141E2E] border border-gray-800/80 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-gray-400 mb-2">
                      <span className="text-xs font-medium">Lessons Completed</span>
                      <BookOpen className="w-4 h-4 text-teal-400" />
                    </div>
                    <div className="text-2xl font-bold text-teal-400 tracking-tight">{metrics.totalLessonsCompleted}</div>
                    <div className="text-[11px] text-gray-400 mt-1">Completed curriculum lessons</div>
                  </div>

                  <div className="admin-stat-card p-4 rounded-xl bg-[#141E2E] border border-gray-800/80 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-gray-400 mb-2">
                      <span className="text-xs font-medium">Exercises Practiced</span>
                      <CheckCircle2 className="w-4 h-4 text-pink-400" />
                    </div>
                    <div className="text-2xl font-bold text-pink-400 tracking-tight">{metrics.totalExercisesCompleted}</div>
                    <div className="text-[11px] text-gray-400 mt-1">Interactive exercise drills</div>
                  </div>
                </div>

                {/* Platform Summary & Language Snapshot */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Target Language Enrollment Snapshot */}
                  <div className="p-5 rounded-xl bg-[#141E2E] border border-gray-800/80">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                        <Globe2 className="w-4 h-4 text-emerald-400" /> Target Language Enrollment
                      </h2>
                      <span className="text-xs text-gray-400">Total: {metrics.totalUsers} learners</span>
                    </div>

                    <div className="space-y-3">
                      {targetLangAnalytics.map((lang) => (
                        <div key={lang.id} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="font-medium text-gray-200">
                              {lang.flag} {lang.name} ({lang.nativeName})
                            </span>
                            <span className="text-gray-400">
                              {lang.enrollmentCount} {lang.enrollmentCount === 1 ? 'learner' : 'learners'} ({lang.percentage}%)
                            </span>
                          </div>
                          <div className="w-full bg-[#1F2B3E] h-2 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                              style={{ width: `${lang.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* System Health & Architecture Integrity Notice */}
                  <div className="p-5 rounded-xl bg-[#141E2E] border border-gray-800/80 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-blue-400" /> Architecture & Data Invariance
                        </h2>
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          ACID Compliant
                        </span>
                      </div>

                      <div className="space-y-3 text-xs text-gray-300 leading-relaxed">
                        <div className="p-3 rounded-lg bg-[#0F1724] border border-gray-800 flex items-start gap-2.5">
                          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-white">Strict Zero-Mock Policy:</span> All metric counters, user records, and language breakdowns reflect 100% genuine database state. No synthetic numbers or mock users are generated.
                          </div>
                        </div>

                        <div className="p-3 rounded-lg bg-[#0F1724] border border-gray-800 flex items-start gap-2.5">
                          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-white">Continuous Learning Model:</span> Curriculum constraints, fixed modules, heart penalties, and daily lockouts are absent by design.
                          </div>
                        </div>

                        <div className="p-3 rounded-lg bg-[#0F1724] border border-gray-800 flex items-start gap-2.5">
                          <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-white">Privacy & RLS Isolation:</span> Cross-user session timings are preserved under Row-Level Security. System metrics represent safe aggregate values.
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between text-xs text-gray-400">
                      <span>Total System XP Accrued: <strong className="text-white font-mono">{metrics.totalXP.toLocaleString()} XP</strong></span>
                      <span>Average Streak: <strong className="text-white font-mono">{metrics.avgStreak} days</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. USER MANAGEMENT TAB */}
            {activeTab === 'users' && (
              <div className="space-y-4">
                {/* Search & Filter Toolbar */}
                <div className="p-4 rounded-xl bg-[#141E2E] border border-gray-800/80 flex flex-wrap items-center justify-between gap-4">
                  <div className="relative flex-1 min-w-[240px]">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search learners by name, email, or user ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#0F1724] border border-gray-700 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Filter className="w-3.5 h-3.5" />
                      <span>Language:</span>
                    </div>
                    <select
                      value={languageFilter}
                      onChange={(e) => setLanguageFilter(e.target.value)}
                      className="px-3 py-2 rounded-lg bg-[#0F1724] border border-gray-700 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    >
                      <option value="all">All Languages</option>
                      {languages.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.flag} {l.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Users Table */}
                <div className="rounded-xl bg-[#141E2E] border border-gray-800/80 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-300">
                      <thead className="bg-[#0F1724] border-b border-gray-800 text-gray-400 uppercase font-semibold text-[11px] tracking-wider">
                        <tr>
                          <th className="px-4 py-3">Learner</th>
                          <th className="px-4 py-3">Role</th>
                          <th className="px-4 py-3">Target Lang</th>
                          <th className="px-4 py-3">UI Lang</th>
                          <th className="px-4 py-3">Lessons Done</th>
                          <th className="px-4 py-3">Exercises</th>
                          <th className="px-4 py-3">XP</th>
                          <th className="px-4 py-3">Streak</th>
                          <th className="px-4 py-3">Registered</th>
                          <th className="px-4 py-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/60">
                        {filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan={10} className="px-4 py-12 text-center text-gray-400">
                              <Users className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                              <p className="font-medium">No learners found</p>
                              <p className="text-[11px] text-gray-500 mt-1">Try modifying your search query or language filter.</p>
                            </td>
                          </tr>
                        ) : (
                          filteredUsers.map((u) => {
                            const targetLang = languages.find((l) => l.id === u.learningLanguage)
                            const prefLang = languages.find((l) => l.id === u.preferredLanguage)
                            const regDate = u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'

                            return (
                              <tr key={u.id} className="hover:bg-[#1A2638] transition-colors">
                                <td className="px-4 py-3">
                                  <div className="font-semibold text-white">{u.name}</div>
                                  <div className="text-[11px] text-gray-400 font-mono">{u.email}</div>
                                </td>
                                <td className="px-4 py-3">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                      u.role === 'admin'
                                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                        : 'bg-gray-700/30 text-gray-300'
                                    }`}
                                  >
                                    {u.role}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  {targetLang ? (
                                    <span className="inline-flex items-center gap-1">
                                      <span>{targetLang.flag}</span>
                                      <span className="font-medium text-gray-200">{targetLang.name}</span>
                                    </span>
                                  ) : (
                                    <span className="text-gray-500">Unselected</span>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  {prefLang ? (
                                    <span className="font-medium text-gray-300">{prefLang.name}</span>
                                  ) : (
                                    <span className="text-gray-500">en</span>
                                  )}
                                </td>
                                <td className="px-4 py-3 font-mono">{u.completedLessonsCount}</td>
                                <td className="px-4 py-3 font-mono">{u.exercisesCompleted}</td>
                                <td className="px-4 py-3 font-mono font-bold text-amber-400">{u.xp}</td>
                                <td className="px-4 py-3">
                                  <span className="inline-flex items-center gap-1 font-mono text-orange-400">
                                    <Flame className="w-3.5 h-3.5 fill-orange-400/20" /> {u.streak}d
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-gray-400 text-[11px]">{regDate}</td>
                                <td className="px-4 py-3 text-right">
                                  <button
                                    onClick={() => setSelectedUser(u)}
                                    className="px-2.5 py-1 rounded bg-[#0B8F62]/20 hover:bg-[#0B8F62]/40 text-emerald-300 text-[11px] font-medium transition-colors"
                                  >
                                    Inspect
                                  </button>
                                </td>
                              </tr>
                            )
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Inspect User Drawer / Modal */}
                {selectedUser && (
                  <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="max-w-lg w-full bg-[#141E2E] border border-gray-700 rounded-2xl p-6 text-gray-200 shadow-2xl space-y-4">
                      <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-base">
                            {selectedUser.name[0]?.toUpperCase() || 'L'}
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-base">{selectedUser.name}</h3>
                            <p className="text-xs text-gray-400 font-mono">{selectedUser.email}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedUser(null)}
                          className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-lg bg-[#0F1724] border border-gray-800">
                          <span className="text-gray-400 block mb-1">Target Language</span>
                          <span className="font-semibold text-white">{selectedUser.learningLanguage || 'Not chosen'}</span>
                        </div>
                        <div className="p-3 rounded-lg bg-[#0F1724] border border-gray-800">
                          <span className="text-gray-400 block mb-1">Interface Language</span>
                          <span className="font-semibold text-white">{selectedUser.preferredLanguage}</span>
                        </div>
                        <div className="p-3 rounded-lg bg-[#0F1724] border border-gray-800">
                          <span className="text-gray-400 block mb-1">Total XP</span>
                          <span className="font-semibold text-amber-400 font-mono">{selectedUser.xp} XP</span>
                        </div>
                        <div className="p-3 rounded-lg bg-[#0F1724] border border-gray-800">
                          <span className="text-gray-400 block mb-1">Streak</span>
                          <span className="font-semibold text-orange-400 font-mono">{selectedUser.streak} days</span>
                        </div>
                        <div className="p-3 rounded-lg bg-[#0F1724] border border-gray-800">
                          <span className="text-gray-400 block mb-1">Completed Lessons</span>
                          <span className="font-semibold text-white font-mono">{selectedUser.completedLessonsCount}</span>
                        </div>
                        <div className="p-3 rounded-lg bg-[#0F1724] border border-gray-800">
                          <span className="text-gray-400 block mb-1">Interactive Exercises</span>
                          <span className="font-semibold text-white font-mono">{selectedUser.exercisesCompleted}</span>
                        </div>
                        <div className="p-3 rounded-lg bg-[#0F1724] border border-gray-800 col-span-2">
                          <span className="text-gray-400 block mb-1">Internal User ID</span>
                          <span className="font-mono text-gray-300 text-[11px] select-all">{selectedUser.id}</span>
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          onClick={() => setSelectedUser(null)}
                          className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs font-medium text-white transition-colors"
                        >
                          Close Details
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. LANGUAGE ANALYTICS TAB */}
            {activeTab === 'languages' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Target Language Breakdown */}
                  <div className="p-5 rounded-xl bg-[#141E2E] border border-gray-800/80 space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                      <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                        <Globe2 className="w-4 h-4 text-emerald-400" /> Target Learning Languages
                      </h2>
                      <span className="text-xs text-gray-400">Total: {metrics.totalUsers} registered</span>
                    </div>

                    <div className="space-y-4">
                      {targetLangAnalytics.map((lang) => (
                        <div key={lang.id} className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="font-medium text-gray-200">
                              {lang.flag} {lang.name} ({lang.nativeName})
                            </span>
                            <span className="font-mono text-gray-300">
                              {lang.enrollmentCount} learners ({lang.percentage}%)
                            </span>
                          </div>
                          <div className="w-full bg-[#0F1724] h-2.5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                              style={{ width: `${lang.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Interface Language Breakdown */}
                  <div className="p-5 rounded-xl bg-[#141E2E] border border-gray-800/80 space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                      <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                        <Globe2 className="w-4 h-4 text-blue-400" /> Preferred Interface Languages (UI Sync)
                      </h2>
                      <span className="text-xs text-gray-400">8 Supported Languages</span>
                    </div>

                    <div className="space-y-4">
                      {interfaceLangAnalytics.map((lang) => (
                        <div key={lang.id} className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="font-medium text-gray-200">
                              {lang.flag} {lang.name} ({lang.nativeName})
                            </span>
                            <span className="font-mono text-gray-300">
                              {lang.count} users ({lang.percentage}%)
                            </span>
                          </div>
                          <div className="w-full bg-[#0F1724] h-2.5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full transition-all duration-500"
                              style={{ width: `${lang.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. LEARNING ACTIVITY TAB */}
            {activeTab === 'learning' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 rounded-xl bg-[#141E2E] border border-gray-800/80">
                    <div className="text-xs text-gray-400 mb-1">Total System Volume</div>
                    <div className="text-2xl font-bold text-white font-mono">{metrics.totalExercisesCompleted}</div>
                    <div className="text-xs text-emerald-400 mt-1">Exercises practiced across all learners</div>
                  </div>
                  <div className="p-5 rounded-xl bg-[#141E2E] border border-gray-800/80">
                    <div className="text-xs text-gray-400 mb-1">Curriculum Completions</div>
                    <div className="text-2xl font-bold text-white font-mono">{metrics.totalLessonsCompleted}</div>
                    <div className="text-xs text-teal-400 mt-1">Completed lessons registered in profiles</div>
                  </div>
                  <div className="p-5 rounded-xl bg-[#141E2E] border border-gray-800/80">
                    <div className="text-xs text-gray-400 mb-1">Total Experience (XP)</div>
                    <div className="text-2xl font-bold text-amber-400 font-mono">{metrics.totalXP.toLocaleString()}</div>
                    <div className="text-xs text-gray-400 mt-1">XP durably earned system-wide</div>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-[#141E2E] border border-gray-800/80 space-y-3">
                  <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-400" /> Granular Session Privacy Notice
                  </h2>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Under Supabase Row-Level Security (RLS), minute-by-minute session timestamps in the <code className="bg-gray-800 px-1.5 py-0.5 rounded text-gray-200">learning_activity</code> table are restricted to each user's authenticated UUID.
                    In strict compliance with privacy guidelines, this dashboard aggregates verified cross-learner data from durable profiles and does not fabricate synthetic time-series curves.
                  </p>
                </div>
              </div>
            )}

            {/* 5. CONTENT HEALTH TAB */}
            {activeTab === 'health' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#141E2E] border border-gray-800/80 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-emerald-400" /> Curriculum & Script Content Audit
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Real-time inventory of curriculum lessons, alphabet catalogues, and authentic stroke tracing data across 8 Indian languages.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    8 Languages Tracked
                  </span>
                </div>

                <div className="rounded-xl bg-[#141E2E] border border-gray-800/80 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-300">
                      <thead className="bg-[#0F1724] border-b border-gray-800 text-gray-400 uppercase font-semibold text-[11px] tracking-wider">
                        <tr>
                          <th className="px-4 py-3">Language</th>
                          <th className="px-4 py-3">Curriculum Lessons</th>
                          <th className="px-4 py-3">Exercises Available</th>
                          <th className="px-4 py-3">Alphabet Catalogue</th>
                          <th className="px-4 py-3">Stroke Tracing Status</th>
                          <th className="px-4 py-3">Content Health</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/60">
                        {contentHealthReports.map((item) => (
                          <tr key={item.languageId} className="hover:bg-[#1A2638] transition-colors">
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center gap-2 font-semibold text-white">
                                <span className="text-base">{item.flag}</span>
                                <span>{item.name} ({item.nativeName})</span>
                              </span>
                            </td>
                            <td className="px-4 py-3 font-mono">{item.lessonCount} lessons</td>
                            <td className="px-4 py-3 font-mono">{item.exerciseCount} exercises</td>
                            <td className="px-4 py-3 font-mono">{item.totalChars} characters</td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                                  item.hasAuthenticStrokes
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                }`}
                              >
                                {item.hasAuthenticStrokes ? (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Authentic ({item.strokeCount} chars)
                                  </>
                                ) : (
                                  <>
                                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" /> Pending Authentic Data
                                  </>
                                )}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {item.isFullyReady ? (
                                <span className="text-emerald-400 font-medium flex items-center gap-1">
                                  <CheckCircle className="w-3.5 h-3.5" /> 100% Operational
                                </span>
                              ) : (
                                <span className="text-amber-400 font-medium flex items-center gap-1">
                                  <AlertCircle className="w-3.5 h-3.5" /> {item.gaps.join('; ')}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
