import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../services/auth'
import { useTheme } from '../../services/themeContext'
import { supportedLanguages, getLanguageById } from '../../data/languages'
import { getLessonsForLanguage } from '../../data/lessons'
import { AudioService } from '../../services/audio/AudioService'
import AppSidebar from '../../components/Navigation/AppSidebar'
import RightSidebar from '../../components/RightSidebar/RightSidebar'
import { BookOpen, Sparkles, Volume2, ArrowRight, CheckCircle2, ChevronRight, Layers, FileText } from 'lucide-react'

export default function CurriculumExplorer() {
  const { user, updateUser } = useAuth()
  const { t } = useTheme()
  const navigate = useNavigate()

  const [selectedLang, setSelectedLang] = useState(user?.learningLanguage || 'hi')
  const [selectedLessonIndex, setSelectedLessonIndex] = useState(0)

  const langMeta = getLanguageById(selectedLang) || { name: 'Hindi', nativeName: 'हिन्दी' }
  const lessons = getLessonsForLanguage(selectedLang, user?.preferredLanguage || 'en')
  const activeLesson = lessons[selectedLessonIndex] || lessons[0]

  const handleLanguageChange = (langId) => {
    setSelectedLang(langId)
    setSelectedLessonIndex(0)
  }

  const playWord = (word) => {
    if (!word) return
    AudioService.speak(word, selectedLang)
  }

  const handleStartLesson = (lessonId) => {
    if (user && updateUser && user.learningLanguage !== selectedLang) {
      updateUser({ learningLanguage: selectedLang })
    }
    navigate(`/lesson/${lessonId}`)
  }

  return (
    <div className="min-h-screen bg-[#F7F5EF] dark:bg-slate-950 flex justify-center pb-20 md:pb-0 text-[#25231F] dark:text-slate-100">
      <AppSidebar />

      <main className="flex-1 max-w-[680px] md:ml-64 px-4 py-6 md:py-8 space-y-6">
        {/* Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 md:p-8 text-white shadow-xl mb-8">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider mb-3">
              <Layers className="w-3.5 h-3.5" /> 10-Module Standard Syllabus CMS
            </div>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight mb-2">
              Curriculum & Syllabus Explorer
            </h1>
            <p className="text-white/90 text-sm md:text-base max-w-xl">
              Inspect all progressive pedagogical units, vocabulary banks, sentence structures, and exercise matrices across 9 Indian languages.
            </p>
          </div>
          <div className="absolute right-6 -bottom-6 text-8xl md:text-9xl opacity-20 select-none">
            📚
          </div>
        </div>

        {/* Language Selection Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
          {supportedLanguages.map((lang) => (
            <button
              key={lang.id}
              onClick={() => handleLanguageChange(lang.id)}
              className={`px-4 py-2 rounded-2xl text-xs md:text-sm font-bold shrink-0 transition-all cursor-pointer flex items-center gap-2 ${
                selectedLang === lang.id
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-300'
              }`}
            >
              <span>{lang.flag || '🇮🇳'}</span>
              <span>{lang.name}</span>
              <span className="opacity-70 text-xs">({lang.nativeName})</span>
            </button>
          ))}
        </div>

        {/* Curriculum Grid: Left Units List, Right Unit Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: 10 Units List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2">
              Modules ({lessons.length})
            </h3>
            <div className="space-y-2">
              {lessons.map((lesson, idx) => {
                const isSelected = selectedLessonIndex === idx
                return (
                  <div
                    key={lesson.id}
                    onClick={() => setSelectedLessonIndex(idx)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300'
                    }`}
                  >
                    <div>
                      <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                        {lesson.unit || `Unit ${idx + 1}`}
                      </div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white">
                        {lesson.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {lesson.nameNative}
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-slate-300'}`} />
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right Column: Selected Unit Detail (Vocabulary & Exercises) */}
          <div className="lg:col-span-2 space-y-6">
            {activeLesson && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm space-y-6">
                {/* Unit Header */}
                <div className="flex items-start justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2 inline-block">
                      {activeLesson.unit}
                    </span>
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
                      {activeLesson.name} ({activeLesson.nameNative})
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      {activeLesson.vocabulary?.length || 0} Core Words • {activeLesson.exercises?.length || 0} Exercise Types
                    </p>
                  </div>

                  <button
                    onClick={() => handleStartLesson(activeLesson.id)}
                    className="px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    Start Lesson <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Vocabulary Bank Table */}
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                    <FileText className="w-4 h-4" /> Core Vocabulary Bank
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeLesson.vocabulary?.map((vocab, vIdx) => (
                      <div
                        key={vIdx}
                        className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-start justify-between"
                      >
                        <div>
                          <div className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <span>{vocab.word}</span>
                            {vocab.pronunciation && (
                              <span className="text-[11px] font-mono font-medium text-indigo-600 dark:text-indigo-400">
                                /{vocab.pronunciation}/
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
                            {vocab.translation}
                          </div>
                          {vocab.example && (
                            <div className="text-[11px] text-slate-400 italic mt-1">
                              "{vocab.example}"
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => playWord(vocab.word)}
                          className="p-2 rounded-xl bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 hover:scale-110 active:scale-95 transition-all shadow-sm"
                          title="Listen pronunciation"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Exercise Matrix */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Pedagogical Exercises in this Lesson
                  </h4>
                  <div className="space-y-2.5">
                    {activeLesson.exercises?.map((ex, eIdx) => (
                      <div
                        key={eIdx}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 font-bold flex items-center justify-center text-[11px]">
                            {eIdx + 1}
                          </span>
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">
                              {ex.type?.replace('-', ' ')}
                            </span>
                            <span className="text-slate-400 ml-2 truncate max-w-xs inline-block align-middle">
                              {ex.prompt}
                            </span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-600 text-[11px] font-bold">
                          +{ex.xp || 15} XP
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <RightSidebar />
    </div>
  )
}
