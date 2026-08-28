import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../services/auth'
import { useProgress } from '../../services/progress'
import { getVocabularyForLanguage } from '../../data/vocabulary'
import { getLanguageById } from '../../data/languages'
import Button from '../../components/Button'
import AudioButton from '../../components/AudioButton'

export default function Practice() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { restoreHearts } = useProgress()
  const [vocabulary, setVocabulary] = useState([])
  const [filteredVocab, setFilteredVocab] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [currentCard, setCurrentCard] = useState(null)
  const [showAnswer, setShowAnswer] = useState(false)

  useEffect(() => {
    if (!user?.learningLanguage) {
      navigate('/onboarding')
      return
    }

    const vocab = getVocabularyForLanguage(user.learningLanguage)
    setVocabulary(Object.values(vocab))
    setFilteredVocab(Object.values(vocab))
  }, [user, navigate])

  const categories = [
    { id: 'all', name: 'All Words' },
    { id: 'needs-practice', name: 'Needs Practice' },
    { id: 'learning', name: 'Learning' },
    { id: 'almost-mastered', name: 'Almost Mastered' },
    { id: 'mastered', name: 'Mastered' },
  ]

  const filterVocabulary = (category) => {
    setSelectedCategory(category)
    
    if (category === 'all') {
      setFilteredVocab(vocabulary)
    } else {
      const masteryMap = {
        'needs-practice': 0,
        'learning': 1,
        'almost-mastered': 2,
        'mastered': 3,
      }
      setFilteredVocab(vocabulary.filter(word => word.mastery === masteryMap[category]))
    }
  }

  const startPractice = () => {
    if (filteredVocab.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredVocab.length)
      setCurrentCard(filteredVocab[randomIndex])
      setShowAnswer(false)
    }
  }

  const handleRestoreHearts = () => {
    restoreHearts()
    navigate('/dashboard')
  }

  const language = getLanguageById(user.learningLanguage)

  if (!user || !language) {
    return (
      <div className="min-h-screen bg-[#F7F5EF] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#77736B]">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F5EF]">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              ← Back
            </Button>
            <h1 className="text-xl font-bold text-[#25231F]">Practice Review</h1>
            <div />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!currentCard ? (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-[#25231F]">Vocabulary Review</h2>
                <Button onClick={handleRestoreHearts}>Restore Hearts</Button>
              </div>
              
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    className={`
                      px-4 py-2 rounded-full whitespace-nowrap transition-all
                      ${selectedCategory === category.id
                        ? 'bg-[#0B8F62] text-white'
                        : 'bg-white text-[#77736B] hover:bg-[#E8E6E0]'
                      }
                    `}
                    onClick={() => filterVocabulary(category.id)}
                  >
                    {category.name}
                  </button>
                ))}
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                {filteredVocab.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-[#77736B]">No words in this category yet.</p>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-[#77736B] mb-4">
                      {filteredVocab.length} words to review
                    </p>
                    <Button size="large" className="w-full" onClick={startPractice}>
                      Start Practice
                    </Button>
                  </>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-xl font-bold text-[#25231F] mb-4">All Words</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vocabulary.map((word, index) => (
                  <motion.div
                    key={index}
                    className="bg-white rounded-xl shadow p-4"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-lg font-semibold text-[#25231F]">{word.word}</p>
                        <p className="text-sm text-[#77736B]">{word.translation}</p>
                      </div>
                      <AudioButton 
                        text={word.word} 
                        language={language.voiceCode}
                        size="small"
                      />
                    </div>
                    <p className="text-xs text-[#77736B] mb-2">
                      {word.pronunciation}
                    </p>
                    <p className="text-sm text-[#77736B] italic">
                      {word.example}
                    </p>
                    <div className="mt-2">
                      <div className="w-full bg-[#E8E6E0] rounded-full h-2">
                        <div 
                          className="bg-[#0B8F62] h-2 rounded-full transition-all"
                          style={{ width: `${(word.mastery / 3) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-[#77736B] mt-1">
                        Mastery: {['Needs Practice', 'Learning', 'Almost Mastered', 'Mastered'][word.mastery]}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto"
          >
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="text-center mb-6">
                <p className="text-4xl font-bold text-[#25231F] mb-2">{currentCard.word}</p>
                <AudioButton 
                  text={currentCard.word} 
                  language={language.voiceCode}
                />
              </div>

              {!showAnswer ? (
                <Button size="large" className="w-full" onClick={() => setShowAnswer(true)}>
                  Show Answer
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-2xl font-semibold text-[#0B8F62] mb-2">
                      {currentCard.translation}
                    </p>
                    <p className="text-sm text-[#77736B]">{currentCard.pronunciation}</p>
                  </div>
                  
                  <div className="bg-[#F7F5EF] rounded-lg p-4">
                    <p className="text-sm text-[#77736B] italic">
                      {currentCard.example}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        // Decrease mastery
                        setVocabulary(prev => prev.map(w => 
                          w.word === currentCard.word 
                            ? { ...w, mastery: Math.max(0, w.mastery - 1) }
                            : w
                        ))
                        startPractice()
                      }}
                    >
                      Needs Practice
                    </Button>
                    <Button 
                      className="flex-1"
                      onClick={() => {
                        // Increase mastery
                        setVocabulary(prev => prev.map(w => 
                          w.word === currentCard.word 
                            ? { ...w, mastery: Math.min(3, w.mastery + 1) }
                            : w
                        ))
                        startPractice()
                      }}
                    >
                      Got it!
                    </Button>
                  </div>

                  <Button 
                    variant="ghost" 
                    className="w-full"
                    onClick={() => setCurrentCard(null)}
                  >
                    End Practice
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}
