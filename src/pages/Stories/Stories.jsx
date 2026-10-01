import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../services/auth'
import { useTheme } from '../../services/themeContext'
import { getStoriesByLanguage } from '../../data/stories'
import { getLanguageById } from '../../data/languages'
import AppSidebar from '../../components/Navigation/AppSidebar'
import TopNavbar from '../../components/Navigation/TopNavbar'
import { BookOpen, Sparkles, Trophy, CheckCircle, Play } from 'lucide-react'

export default function Stories() {
  const { user } = useAuth()
  const { t } = useTheme()
  const navigate = useNavigate()

  const currentLang = user?.learningLanguage || 'hi'
  const langMeta = getLanguageById(currentLang) || { name: 'Hindi', nativeName: 'हिन्दी' }
  const stories = getStoriesByLanguage(currentLang)

  const completedStories = user?.completedStories || []

  return (
    <div className="min-h-screen bg-[#F7F5EF] dark:bg-slate-950 flex flex-col md:flex-row pb-20 md:pb-6 text-[#25231F] dark:text-slate-100">
      {/* Left Sidebar */}
      <AppSidebar />

      {/* Main Content */}
      <main className="flex-1 min-w-0 md:ml-72 flex flex-col min-h-screen">
        <TopNavbar />

        <div className="p-4 sm:p-6 lg:p-8 space-y-6 w-full max-w-full flex-1">
          {/* Header banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-6 md:p-8 text-white shadow-xl mb-8">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5" /> {t('cultural_micro_stories') || 'Cultural Micro-Stories'}
              </div>
              <h1 className="text-2xl md:text-4xl font-black tracking-tight mb-2">
                {langMeta.nativeName} {t('stories')}
              </h1>
              <p className="text-white/90 text-sm md:text-base max-w-xl">
                {t('stories_banner_desc') || 'Immerse yourself in authentic Indian conversations, folklore, and local dialogues. Listen with sentence-by-sentence audio and answer checkpoints!'}
              </p>
            </div>
            <div className="absolute right-4 -bottom-6 text-8xl md:text-9xl opacity-20 select-none">
              📖
            </div>
          </div>

          {/* Stories Grid */}
          {stories.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
              <BookOpen className="w-12 h-12 mx-auto text-amber-500 mb-4" />
              <h3 className="text-lg font-bold mb-1">{t('new_stories_coming_soon') || 'New stories coming soon!'}</h3>
              <p className="text-slate-500 text-sm">{(t('stories_coming_soon_desc') || 'We are adding more immersive cultural stories for {language}.').replace('{language}', langMeta.name)}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {stories.map((story) => {
                const isCompleted = completedStories.includes(story.id)

                return (
                  <div
                    key={story.id}
                    onClick={() => navigate(`/story/${story.id}`)}
                    className="group relative cursor-pointer overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl hover:border-amber-400 dark:hover:border-amber-500 transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                          {story.coverEmoji || '📖'}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {t(story.level?.toLowerCase()) || story.level}
                          </span>
                          {isCompleted && (
                            <span className="flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
                              <CheckCircle className="w-3.5 h-3.5" /> {t('done') || 'Done'}
                            </span>
                          )}
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors mb-1">
                        {story.title}
                      </h3>
                      <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-2">
                        {story.titleEn}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                        {story.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-300">
                        <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                          <Trophy className="w-3.5 h-3.5" /> +{story.rewardXP} XP
                        </span>
                        <span className="text-cyan-500">💎 +{story.rewardGems}</span>
                      </div>

                      <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 shadow-md group-hover:shadow-amber-500/25 transition-all">
                        <Play className="w-3.5 h-3.5 fill-current" /> {t('read_btn') || 'Read'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
