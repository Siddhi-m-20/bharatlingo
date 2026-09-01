import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../services/auth'
import { useProgress } from '../../services/progress'
import { getVocabularyForLanguage } from '../../data/vocabulary'
import { getLanguageById } from '../../data/languages'
import { getMistakes, resolveMistake, updateWordMastery, getMasteryMap } from '../../services/mistakeService'
import { speakText } from '../../services/aiService'
import { audioFX } from '../../utils/audioFX'
import Button from '../../components/Button'
import AppSidebar from '../../components/Navigation/AppSidebar'
import RightSidebar from '../../components/RightSidebar/RightSidebar'
import { Volume2, Sparkles, AlertCircle, Heart } from 'lucide-react'

export default function Practice() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { restoreHearts, addXP, hearts } = useProgress()

  const [vocabulary, setVocabulary] = useState([])
  const [mistakes, setMistakes] = useState([])
  const [activeTab, setActiveTab] = useState('flashcards') // 'flashcards' | 'mistakes'
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [reviewedCount, setReviewedCount] = useState(0)

  const language = getLanguageById(user?.learningLanguage)
  const preferredLang = getLanguageById(user?.preferredLanguage || 'en')

  useEffect(() => {
    if (!user?.learningLanguage) {
      navigate('/onboarding')
      return
    }

    const preferredId = user.preferredLanguage || 'en'
    const vocabList = getVocabularyForLanguage(user.learningLanguage, preferredId)
    const masteryMap = getMasteryMap(user.learningLanguage)

    const mapped = vocabList.map((item) => ({
      ...item,
      mastery: masteryMap[item.word] !== undefined ? masteryMap[item.word] : 0,
    }))

    setVocabulary(mapped)
    setMistakes(getMistakes(user.learningLanguage))
  }, [user, navigate])

  const activeList = activeTab === 'mistakes'
    ? mistakes
    : selectedFilter === 'all'
    ? vocabulary
    : selectedFilter === 'mastered'
    ? vocabulary.filter((v) => v.mastery >= 2)
    : vocabulary.filter((v) => v.mastery < 2)

  const currentCard = activeList[currentCardIndex] || activeList[0]

  const handlePlayAudio = (e, text) => {
    e?.stopPropagation()
    speakText(text, user?.learningLanguage || 'hi')
  }

  const handleNextCard = () => {
    setIsFlipped(false)
    if (currentCardIndex < activeList.length - 1) {
      setCurrentCardIndex((prev) => prev + 1)
    } else {
      setCurrentCardIndex(0)
    }
  }

  const handleRateCard = (isKnown) => {
    if (!currentCard) return

    if (isKnown) {
      audioFX.playCorrect()
      addXP(5)
      updateWordMastery(currentCard.word, user.learningLanguage, true)
      if (activeTab === 'mistakes') {
        resolveMistake(currentCard.word, user.learningLanguage)
        setMistakes(getMistakes(user.learningLanguage))
      }
    } else {
      audioFX.playWrong()
      updateWordMastery(currentCard.word, user.learningLanguage, false)
    }

    setReviewedCount((prev) => prev + 1)
    handleNextCard()
  }

  const handleRefillHearts = () => {
    restoreHearts()
    audioFX.playVictory()
  }

  return (
    <div className="min-h-screen bg-[#F7F5EF] dark:bg-slate-950 flex justify-center pb-20 md:pb-0">
      {/* 1. LEFT SIDEBAR */}
      <AppSidebar />

      {/* 2. CENTER PRACTICE CONTENT */}
      <main className="flex-1 max-w-[620px] md:ml-64 px-4 py-6 md:py-8 space-y-6">
        {/* Practice Mode Selector */}
        <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl shadow-sm border-2 border-[#E8E6E0] dark:border-slate-800">
          <button
            onClick={() => {
              setActiveTab('flashcards')
              setCurrentCardIndex(0)
              setIsFlipped(false)
            }}
            className={`flex-1 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              activeTab === 'flashcards'
                ? 'bg-[#0B8F62] text-white shadow-md'
                : 'text-[#77736B] hover:text-[#25231F] dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Sparkles size={16} />
            <span>Vocabulary ({vocabulary.length})</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('mistakes')
              setCurrentCardIndex(0)
              setIsFlipped(false)
            }}
            className={`flex-1 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              activeTab === 'mistakes'
                ? 'bg-[#D84B42] text-white shadow-md'
                : 'text-[#77736B] hover:text-[#25231F] dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <AlertCircle size={16} />
            <span>Mistakes ({mistakes.length})</span>
          </button>
        </div>

        {/* Flashcard Component */}
        {activeList.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 text-center border-2 border-[#E8E6E0] dark:border-slate-800 shadow-sm">
            <div className="text-5xl mb-3">✨</div>
            <h3 className="text-xl font-bold text-[#25231F] dark:text-white">No Words to Review!</h3>
            <p className="text-sm text-[#77736B] dark:text-slate-400 mt-1 mb-6">
              {activeTab === 'mistakes'
                ? 'Zero pending mistakes! Keep up the great streak.'
                : 'Complete lessons to build up your vocabulary bank!'}
            </p>
            <Button onClick={() => navigate('/dashboard')}>Back to Learn Path</Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center text-xs font-black text-[#77736B] dark:text-slate-400 px-2">
              <span>Card {currentCardIndex + 1} of {activeList.length}</span>
              <span>Session Score: {reviewedCount} words</span>
            </div>

            {/* 3D Flip Card */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="relative min-h-[320px] w-full cursor-pointer perspective-1000 select-none"
            >
              <motion.div
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.4 }}
                className="w-full h-full min-h-[320px] bg-white dark:bg-slate-900 border-2 border-[#E8E6E0] dark:border-slate-800 hover:border-[#0B8F62] rounded-3xl p-8 flex flex-col justify-between items-center text-center shadow-lg hover:shadow-xl transition-all"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {!isFlipped ? (
                  // Front: Target Word
                  <div className="flex flex-col items-center justify-center flex-1 w-full space-y-4">
                    <span className="text-xs font-black uppercase tracking-wider text-[#0B8F62] bg-[#0B8F62]/10 px-3 py-1 rounded-full">
                      {language?.name} Target Word
                    </span>
                    <h2 className="text-4xl md:text-5xl font-black text-[#25231F] dark:text-white">
                      {currentCard.word}
                    </h2>
                    {currentCard.pronunciation && (
                      <p className="text-base text-[#77736B] dark:text-slate-400 font-medium">
                        ({currentCard.pronunciation})
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={(e) => handlePlayAudio(e, currentCard.word)}
                      className="p-3 bg-[#0B8F62]/10 text-[#0B8F62] rounded-full hover:bg-[#0B8F62]/20 transition-colors shadow-sm"
                      title="Pronounce"
                    >
                      <Volume2 size={24} />
                    </button>
                    <p className="text-xs text-[#77736B] dark:text-slate-500 pt-2">
                      Tap card to reveal meaning in {preferredLang?.name || 'English'}
                    </p>
                  </div>
                ) : (
                  // Back: Preferred Translation
                  <div
                    className="flex flex-col items-center justify-center flex-1 w-full space-y-4"
                    style={{ transform: 'rotateY(180deg)' }}
                  >
                    <span className="text-xs font-black uppercase tracking-wider text-[#3B82F6] bg-[#3B82F6]/10 px-3 py-1 rounded-full">
                      Translation ({preferredLang?.name || 'English'})
                    </span>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-[#25231F] dark:text-white">
                      {currentCard.translation || currentCard.word}
                    </h2>
                    {currentCard.example && (
                      <p className="text-sm text-[#77736B] dark:text-slate-400 italic max-w-sm">
                        "{currentCard.example}"
                      </p>
                    )}
                    <p className="text-xs text-[#77736B] dark:text-slate-500 pt-2">Rate your recall below:</p>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Evaluation Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleRateCard(false)}
                className="py-4 bg-white dark:bg-slate-900 border-2 border-[#D84B42] text-[#D84B42] font-black rounded-2xl hover:bg-[#D84B42]/10 transition-all text-sm shadow-sm"
              >
                Still Learning ✕
              </button>
              <button
                onClick={() => handleRateCard(true)}
                className="py-4 bg-[#0B8F62] text-white font-black rounded-2xl hover:bg-[#09734e] transition-all text-sm shadow-lg shadow-[#0B8F62]/30"
              >
                Mastered! ✓ (+5 XP)
              </button>
            </div>
          </div>
        )}

        {/* Refill Hearts Banner */}
        {hearts < 5 && (
          <div className="p-4 bg-white dark:bg-slate-900 border-2 border-[#E8E6E0] dark:border-slate-800 rounded-3xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <Heart size={24} className="text-[#D84B42]" fill="#D84B42" />
              <div>
                <p className="text-sm font-bold text-[#25231F] dark:text-white">Refill Energy Hearts</p>
                <p className="text-xs text-[#77736B]">Practice reviews restore full vitality</p>
              </div>
            </div>
            <Button size="small" onClick={handleRefillHearts}>
              Refill All (5/5)
            </Button>
          </div>
        )}
      </main>

      {/* 3. RIGHT SIDEBAR */}
      <RightSidebar />
    </div>
  )
}
