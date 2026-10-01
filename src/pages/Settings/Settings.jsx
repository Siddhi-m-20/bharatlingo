import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../services/auth'
import { useTheme } from '../../services/themeContext'
import { languages } from '../../data/languages'
import TopNavbar from '../../components/Navigation/TopNavbar'
import AppSidebar from '../../components/Navigation/AppSidebar'
import LanguageFlag from '../../components/LanguageFlag/LanguageFlag'
import Button from '../../components/Button'
import { Sun, Moon, Sparkles, Leaf, Check, Volume2, VolumeX, Mic, MicOff } from 'lucide-react'
import { speechRecognitionService } from '../../services/audio/SpeechRecognitionService'

const THEMES = [
  { id: 'light', nameKey: 'theme_light', defaultName: 'Light Theme', icon: Sun, color: '#0B8F62' },
  { id: 'dark', nameKey: 'theme_dark', defaultName: 'Dark Theme', icon: Moon, color: '#10B981' },
  { id: 'saffron', nameKey: 'theme_saffron', defaultName: 'Saffron Theme', icon: Sparkles, color: '#EA580C' },
  { id: 'emerald', nameKey: 'theme_emerald', defaultName: 'Emerald Theme', icon: Leaf, color: '#059669' },
]

// Audio settings stored in localStorage
function useAudioSettings() {
  const [audioEnabled, setAudioEnabledState] = useState(() => {
    try { return JSON.parse(localStorage.getItem('bl_audio_enabled') ?? 'true') } catch { return true }
  })
  const [soundFX, setSoundFXState] = useState(() => {
    try { return JSON.parse(localStorage.getItem('bl_sound_fx') ?? 'true') } catch { return true }
  })
  const [speakingEnabled, setSpeakingEnabledState] = useState(() => {
    try { return JSON.parse(localStorage.getItem('bl_speaking_enabled') ?? 'true') } catch { return true }
  })

  const setAudioEnabled = (v) => {
    localStorage.setItem('bl_audio_enabled', JSON.stringify(v))
    setAudioEnabledState(v)
  }
  const setSoundFX = (v) => {
    localStorage.setItem('bl_sound_fx', JSON.stringify(v))
    setSoundFXState(v)
  }
  const setSpeakingEnabled = (v) => {
    localStorage.setItem('bl_speaking_enabled', JSON.stringify(v))
    setSpeakingEnabledState(v)
  }

  return { audioEnabled, setAudioEnabled, soundFX, setSoundFX, speakingEnabled, setSpeakingEnabled }
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#0B8F62] focus:ring-offset-2 ${checked ? 'bg-[#0B8F62]' : 'bg-[#E8E6E0] dark:bg-slate-700'}`}
      aria-label={label}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`}
      />
    </button>
  )
}

export default function Settings() {
  const navigate = useNavigate()
  const { user, updateUser, logout } = useAuth()
  const { theme, setTheme, siteLanguage, setSiteLanguage, t } = useTheme()
  const { audioEnabled, setAudioEnabled, soundFX, setSoundFX, speakingEnabled, setSpeakingEnabled } = useAudioSettings()
  const asrSupported = speechRecognitionService.isSupported()

  const handleSiteLanguageChange = (langId) => {
    setSiteLanguage(langId)
    updateUser({ preferredLanguage: langId })
  }

  const handlePreferredLanguageChange = (langId) => {
    setSiteLanguage(langId)
    updateUser({ preferredLanguage: langId })
  }

  const handleLearningLanguageChange = (langId) => {
    updateUser({ learningLanguage: langId })
  }

  const handleDailyGoalChange = (value) => {
    updateUser({ dailyGoal: parseInt(value, 10) })
  }

  const handleResetProgress = () => {
    if (confirm(t('reset_progress_confirm') || 'Are you sure you want to reset all progress? This cannot be undone.')) {
      updateUser({
        xp: 0,
        streak: 0,
        completedLessons: [],
        vocabulary: {},
        achievements: [],
        level: 'beginner',
      })
      alert(t('reset_progress_success') || 'Progress has been reset.')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#F7F5EF] dark:bg-slate-950 flex flex-col md:flex-row pb-20 md:pb-6">
      {/* 1. LEFT SIDEBAR */}
      <AppSidebar />

      {/* 2. CENTER SETTINGS CONTENT */}
      <main className="flex-1 min-w-0 md:ml-72 flex flex-col min-h-screen">
        <TopNavbar />

        <div className="p-4 sm:p-6 lg:p-8 space-y-6 w-full max-w-5xl mx-auto flex-1">
        {/* Appearance & Themes */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border-2 border-[#E8E6E0] dark:border-slate-800 p-6">
          <h3 className="text-lg font-black text-[#25231F] dark:text-white mb-1">
            {t('theme')}
          </h3>
          <p className="text-xs text-[#77736B] dark:text-slate-400 mb-4">{t('choose_theme_desc')}</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {THEMES.map((th) => {
              const Icon = th.icon
              const isSelected = theme === th.id
              return (
                <button
                  key={th.id}
                  onClick={() => setTheme(th.id)}
                  className={`p-3.5 rounded-2xl border-2 text-center flex flex-col items-center gap-2 text-xs font-black transition-all ${
                    isSelected
                      ? 'border-[#0B8F62] bg-[#0B8F62]/15 text-[#0B8F62] dark:text-[#34D399] shadow-md ring-2 ring-[#0B8F62]/30'
                      : 'border-[#E8E6E0] dark:border-slate-800 bg-white dark:bg-slate-800/80 text-[#25231F] dark:text-slate-300 hover:border-[#0B8F62]/40'
                  }`}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white shadow-sm"
                    style={{ backgroundColor: th.color }}
                  >
                    <Icon size={18} />
                  </div>
                  <span className="flex items-center gap-1">
                    {t(th.nameKey) || th.defaultName}
                    {isSelected && <Check size={13} className="text-[#0B8F62] dark:text-[#34D399]" />}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Site Language & Courses */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border-2 border-[#E8E6E0] dark:border-slate-800 p-6 space-y-4">
          <h3 className="text-lg font-black text-[#25231F] dark:text-white">{t('language_options')}</h3>

          <div>
            <label className="block text-xs font-black text-[#77736B] dark:text-slate-400 uppercase tracking-wider mb-2">
              {t('site_language')} ({t('site_language_desc')})
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {languages.map((lang) => {
                const isSelected = siteLanguage === lang.id
                return (
                  <button
                    key={lang.id}
                    onClick={() => handleSiteLanguageChange(lang.id)}
                    className={`flex items-center justify-between p-3 rounded-2xl border-2 text-xs font-bold transition-all ${
                      isSelected
                        ? 'border-[#0B8F62] bg-[#0B8F62]/10 text-[#0B8F62] dark:text-[#34D399] shadow-sm'
                        : 'border-[#E8E6E0] dark:border-slate-800 bg-[#F7F5EF]/50 dark:bg-slate-800 text-[#25231F] dark:text-slate-300 hover:border-[#0B8F62]/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <LanguageFlag languageId={lang.id} size={18} />
                      <span>{lang.name} ({lang.nativeName})</span>
                    </div>
                    {isSelected && <Check size={14} />}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-[#E8E6E0] dark:border-slate-800">
            <label className="block text-xs font-black text-[#77736B] dark:text-slate-400 uppercase tracking-wider mb-2">
              {t('questions_in')} ({t('questions_in_desc')})
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {languages.map((lang) => {
                const isSelected = (user?.preferredLanguage || siteLanguage) === lang.id
                return (
                  <button
                    key={lang.id}
                    onClick={() => handlePreferredLanguageChange(lang.id)}
                    className={`flex items-center justify-between p-3 rounded-2xl border-2 text-xs font-bold transition-all ${
                      isSelected
                        ? 'border-[#F39A45] bg-[#F39A45]/10 text-[#F39A45] dark:text-[#FBBF24] shadow-sm'
                        : 'border-[#E8E6E0] dark:border-slate-800 bg-[#F7F5EF]/50 dark:bg-slate-800 text-[#25231F] dark:text-slate-300 hover:border-[#F39A45]/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <LanguageFlag languageId={lang.id} size={18} />
                      <span>{lang.name} ({lang.nativeName})</span>
                    </div>
                    {isSelected && <Check size={14} />}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-[#E8E6E0] dark:border-slate-800">
            <label className="block text-xs font-black text-[#77736B] dark:text-slate-400 uppercase tracking-wider mb-2">
              {t('active_learning_course')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {languages.filter((l) => l.id !== 'en').map((lang) => {
                const isSelected = user?.learningLanguage === lang.id
                return (
                  <button
                    key={lang.id}
                    onClick={() => handleLearningLanguageChange(lang.id)}
                    className={`flex items-center justify-between p-3 rounded-2xl border-2 text-xs font-bold transition-all ${
                      isSelected
                        ? 'border-[#3B82F6] bg-[#3B82F6]/10 text-[#3B82F6] dark:text-[#60A5FA] shadow-sm'
                        : 'border-[#E8E6E0] dark:border-slate-800 bg-[#F7F5EF]/50 dark:bg-slate-800 text-[#25231F] dark:text-slate-300 hover:border-[#3B82F6]/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <LanguageFlag languageId={lang.id} size={18} />
                      <span>{lang.name} ({lang.nativeName})</span>
                    </div>
                    {isSelected && <Check size={14} />}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Audio Settings */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border-2 border-[#E8E6E0] dark:border-slate-800 p-6 space-y-4">
          <h3 className="text-lg font-black text-[#25231F] dark:text-white mb-1">{t('audio_settings')}</h3>

          <div className="space-y-4">
            {/* Audio ON/OFF */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {audioEnabled ? <Volume2 size={16} className="text-[#0B8F62]" /> : <VolumeX size={16} className="text-[#77736B]" />}
                <div>
                  <p className="text-sm font-bold text-[#25231F] dark:text-white">{t('audio')}</p>
                  <p className="text-xs text-[#77736B] dark:text-slate-400">{t('audio_desc')}</p>
                </div>
              </div>
              <Toggle checked={audioEnabled} onChange={setAudioEnabled} label={t('audio')} />
            </div>

            {/* Sound FX */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">🎵</span>
                <div>
                  <p className="text-sm font-bold text-[#25231F] dark:text-white">{t('sound_effects')}</p>
                  <p className="text-xs text-[#77736B] dark:text-slate-400">{t('sound_effects_desc')}</p>
                </div>
              </div>
              <Toggle checked={soundFX} onChange={setSoundFX} label={t('sound_effects')} />
            </div>

            {/* Speaking practice */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {speakingEnabled ? <Mic size={16} className="text-[#0B8F62]" /> : <MicOff size={16} className="text-[#77736B]" />}
                <div>
                  <p className="text-sm font-bold text-[#25231F] dark:text-white">{t('speaking_practice_setting')}</p>
                  <p className="text-xs text-[#77736B] dark:text-slate-400">
                    {asrSupported
                      ? t('speaking_practice_desc')
                      : t('speech_not_available')}
                  </p>
                </div>
              </div>
              <Toggle checked={speakingEnabled && asrSupported} onChange={setSpeakingEnabled} label={t('speaking_practice_setting')} />
            </div>

            {!asrSupported && (
              <p className="text-xs text-[#F39A45] bg-[#F39A45]/10 rounded-xl p-3">
                {t('speaking_browser_warning')}
              </p>
            )}
          </div>
        </div>

        {/* Daily Learning Goals */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border-2 border-[#E8E6E0] dark:border-slate-800 p-6">
          <h3 className="text-lg font-black text-[#25231F] dark:text-white mb-2">{t('daily_goal')}</h3>
          <select
            value={user?.dailyGoal || 10}
            onChange={(e) => handleDailyGoalChange(e.target.value)}
            className="w-full px-4 py-2.5 bg-[#F7F5EF] dark:bg-slate-800 border border-[#E8E6E0] dark:border-slate-700 rounded-xl font-bold focus:outline-none focus:border-[#0B8F62] text-[#25231F] dark:text-white"
          >
            <option value={5}>{t('goal_5min') || '5 minutes casual'} (5 XP)</option>
            <option value={10}>{t('goal_10min') || '10 minutes regular'} (10 XP)</option>
            <option value={15}>{t('goal_15min') || '15 minutes serious'} (15 XP)</option>
            <option value={20}>{t('goal_20min') || '20 minutes intense'} (20 XP)</option>
          </select>
        </div>

        {/* Account Actions */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border-2 border-[#E8E6E0] dark:border-slate-800 p-6 space-y-3">
          <h3 className="text-lg font-black text-[#25231F] dark:text-white mb-2">{t('account_actions')}</h3>
          <div className="flex gap-3">
            <Button variant="danger" className="flex-1 font-bold" onClick={handleResetProgress}>
              {t('reset_progress')}
            </Button>
            <Button variant="outline" className="flex-1 font-bold" onClick={handleLogout}>
              {t('log_out_account')}
            </Button>
          </div>
        </div>

        <div className="text-center text-xs text-[#77736B] pt-2">
          <p>BharatLingo v1.0.0</p>
          <p>© {new Date().getFullYear()} BharatLingo. {t('all_rights_reserved')}</p>
        </div>
        </div>
      </main>
    </div>
  )
}
