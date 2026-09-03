import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../services/auth'
import { useProgress } from '../../services/progress'
import { getScenariosForLanguage } from '../../data/conversations'
import { evaluateTutorResponse } from '../../services/tutorService'
import { getLanguageById } from '../../data/languages'
import { speakText } from '../../services/aiService'
import { speechRecognitionService, REC_STATE } from '../../services/audio/SpeechRecognitionService'
import { audioFX } from '../../utils/audioFX'
import { triggerConfetti } from '../../utils/confetti'
import AppSidebar from '../../components/Navigation/AppSidebar'
import RightSidebar from '../../components/RightSidebar/RightSidebar'
import Button from '../../components/Button'
import { MessageSquare, Volume2, Mic, MicOff, Send, Sparkles, CheckCircle2, ChevronRight, BookOpen, Award, ArrowLeft } from 'lucide-react'

export default function ConversationTutor() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addXP, updateStreak } = useProgress()

  const [scenarios, setScenarios] = useState([])
  const [selectedScenario, setSelectedScenario] = useState(null)
  const [currentTurnIdx, setCurrentTurnIdx] = useState(0)
  const [chatHistory, setChatHistory] = useState([])
  const [inputVal, setInputVal] = useState('')
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [feedbackData, setFeedbackData] = useState(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [showTranslations, setShowTranslations] = useState(true)

  const chatEndRef = useRef(null)
  const learningLang = getLanguageById(user?.learningLanguage) || { name: 'Hindi', id: 'hi' }
  const preferredLang = getLanguageById(user?.preferredLanguage || 'en') || { name: 'English', id: 'en' }

  // Load scenarios for user's language
  useEffect(() => {
    if (!user?.learningLanguage) {
      navigate('/onboarding')
      return
    }
    const scList = getScenariosForLanguage(user.learningLanguage)
    setScenarios(scList)
    if (scList.length > 0 && !selectedScenario) {
      setSelectedScenario(scList[0])
    }
  }, [user?.learningLanguage, navigate])

  // Initialize conversation when scenario changes
  useEffect(() => {
    if (selectedScenario && selectedScenario.turns.length > 0) {
      const firstTurn = selectedScenario.turns[0]
      setCurrentTurnIdx(0)
      setIsCompleted(false)
      setFeedbackData(null)
      setInputVal('')
      setChatHistory([
        {
          id: 'tutor_0',
          sender: 'tutor',
          text: firstTurn.tutorMessage,
          pronunciation: firstTurn.pronunciation,
          translation: firstTurn.englishMeaning,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])

      // Auto speak first turn
      speakText(firstTurn.tutorMessage, user?.learningLanguage || 'hi')
    }
  }, [selectedScenario, user?.learningLanguage])

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory, feedbackData])

  const handlePlayTutorAudio = (text) => {
    speakText(text, user?.learningLanguage || 'hi')
  }

  // Handle Speech Recognition Mic Toggle
  const handleToggleMic = () => {
    if (isRecording) {
      speechRecognitionService.stop()
      setIsRecording(false)
      return
    }

    if (!speechRecognitionService.isSupported()) {
      alert('Speech recognition is not supported in this browser. Please use Chrome/Edge or type your response.')
      return
    }

    setIsRecording(true)
    const activeTurn = selectedScenario?.turns[currentTurnIdx]
    const targetWord = activeTurn?.suggestedReplies?.[0] || ''

    speechRecognitionService.start(user?.learningLanguage || 'hi', targetWord, {
      onResult: (res) => {
        setIsRecording(false)
        if (res?.transcript) {
          setInputVal(res.transcript)
        }
      },
      onError: (err) => {
        setIsRecording(false)
        console.warn('ASR Error:', err)
      },
    })
  }

  const handleSendMessage = (textToSend = inputVal) => {
    const text = (textToSend || '').trim()
    if (!text || !selectedScenario || isEvaluating || isCompleted) return

    const activeTurn = selectedScenario.turns[currentTurnIdx]
    if (!activeTurn) return

    // Append user message
    const userMsg = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setChatHistory((prev) => [...prev, userMsg])
    setInputVal('')
    setIsEvaluating(true)

    // Evaluate response with AI Tutor service
    setTimeout(() => {
      const evaluation = evaluateTutorResponse(
        text,
        activeTurn,
        user.learningLanguage,
        user.preferredLanguage || 'en'
      )

      setFeedbackData(evaluation)
      setIsEvaluating(false)

      if (evaluation.isAcceptable) {
        audioFX.playCorrect()
        addXP(10)

        // Advance to next turn or complete
        const nextTurnIdx = currentTurnIdx + 1
        if (nextTurnIdx < selectedScenario.turns.length) {
          const nextTurn = selectedScenario.turns[nextTurnIdx]
          setCurrentTurnIdx(nextTurnIdx)

          setTimeout(() => {
            setChatHistory((prev) => [
              ...prev,
              {
                id: `tutor_${nextTurnIdx}`,
                sender: 'tutor',
                text: nextTurn.tutorMessage,
                pronunciation: nextTurn.pronunciation,
                translation: nextTurn.englishMeaning,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ])
            speakText(nextTurn.tutorMessage, user?.learningLanguage || 'hi')
          }, 800)
        } else {
          // Scenario Completed!
          setTimeout(() => {
            setIsCompleted(true)
            audioFX.playVictory()
            triggerConfetti()
            addXP(25)
            updateStreak()
          }, 1000)
        }
      } else {
        audioFX.playWrong()
      }
    }, 400)
  }

  return (
    <div className="min-h-screen bg-[#F7F5EF] dark:bg-slate-950 flex justify-center pb-20 md:pb-0">
      {/* 1. LEFT SIDEBAR */}
      <AppSidebar />

      {/* 2. CENTER TUTOR CONVERSATION HUB */}
      <main className="flex-1 max-w-[660px] md:ml-64 px-4 py-6 md:py-8 flex flex-col space-y-4 min-h-screen">
        {/* Header Title Banner */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border-2 border-[#E8E6E0] dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#0B8F62]/15 text-[#0B8F62] flex items-center justify-center text-2xl shadow-sm">
              {selectedScenario?.icon || '💬'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-[#25231F] dark:text-white">
                  {selectedScenario?.title || 'AI Conversation Tutor'}
                </h1>
                <span className="text-[10px] font-black uppercase bg-[#0B8F62]/10 text-[#0B8F62] px-2 py-0.5 rounded-md">
                  {selectedScenario?.difficulty || 'Roleplay'}
                </span>
              </div>
              <p className="text-xs text-[#77736B] dark:text-slate-400">
                Interactive real-time roleplay in <span className="font-bold text-[#0B8F62]">{learningLang.name}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowTranslations(!showTranslations)}
            className="text-xs font-bold text-[#77736B] hover:text-[#0B8F62] px-3 py-1.5 bg-[#F7F5EF] dark:bg-slate-800 rounded-xl transition-colors"
          >
            {showTranslations ? 'Hide Translation' : 'Show Translation'}
          </button>
        </div>

        {/* Scenario Carousel Selector */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {scenarios.map((sc) => {
            const isSelected = selectedScenario?.id === sc.id
            return (
              <button
                key={sc.id}
                onClick={() => setSelectedScenario(sc)}
                className={`px-3.5 py-2 rounded-2xl border-2 shrink-0 flex items-center gap-2 text-xs font-black transition-all ${
                  isSelected
                    ? 'border-[#0B8F62] bg-[#0B8F62]/10 text-[#0B8F62] dark:text-[#34D399] shadow-sm'
                    : 'border-[#E8E6E0] dark:border-slate-800 bg-white dark:bg-slate-900 text-[#77736B] hover:border-[#0B8F62]/40'
                }`}
              >
                <span>{sc.icon}</span>
                <span>{sc.title}</span>
              </button>
            )
          })}
        </div>

        {/* Chat Transcript Area */}
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl border-2 border-[#E8E6E0] dark:border-slate-800 p-5 shadow-sm overflow-y-auto space-y-4 min-h-[380px] max-h-[500px]">
          {chatHistory.map((msg) => {
            const isTutor = msg.sender === 'tutor'
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col ${isTutor ? 'items-start' : 'items-end'}`}
              >
                <div
                  className={`max-w-[85%] p-4 rounded-2xl shadow-sm text-sm space-y-1.5 ${
                    isTutor
                      ? 'bg-[#F7F5EF] dark:bg-slate-800 text-[#25231F] dark:text-white rounded-tl-sm border border-[#E8E6E0] dark:border-slate-700'
                      : 'bg-[#0B8F62] text-white rounded-tr-sm shadow-md shadow-[#0B8F62]/20'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-extrabold text-base leading-snug">{msg.text}</p>
                    {isTutor && (
                      <button
                        onClick={() => handlePlayTutorAudio(msg.text)}
                        className="p-1 rounded-lg bg-white/80 dark:bg-slate-700 text-[#0B8F62] hover:scale-110 transition-transform shadow-xs"
                        title="Pronounce"
                      >
                        <Volume2 size={16} />
                      </button>
                    )}
                  </div>

                  {isTutor && msg.pronunciation && (
                    <p className="text-xs text-[#77736B] dark:text-slate-400 font-medium">
                      ({msg.pronunciation})
                    </p>
                  )}

                  {isTutor && showTranslations && msg.translation && (
                    <p className="text-xs text-[#0B8F62] dark:text-[#34D399] font-medium pt-1 border-t border-black/5 dark:border-white/5">
                      Meaning: {msg.translation}
                    </p>
                  )}
                </div>
                <span className="text-[10px] text-[#77736B] px-1 mt-0.5">{msg.timestamp}</span>
              </motion.div>
            )
          })}

          {isEvaluating && (
            <div className="flex items-center gap-2 text-xs text-[#77736B] italic p-2">
              <Sparkles size={14} className="animate-spin text-[#0B8F62]" />
              <span>AI Tutor is analyzing your phrasing & naturalness...</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Dynamic AI Pedagogical Feedback Drawer */}
        <AnimatePresence>
          {feedbackData && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className={`p-4 rounded-2xl border-2 text-xs space-y-2 shadow-sm ${
                feedbackData.isAcceptable
                  ? 'bg-[#2F9E69]/10 border-[#2F9E69]/40 text-[#25231F] dark:text-white'
                  : 'bg-[#D84B42]/10 border-[#D84B42]/40 text-[#25231F] dark:text-white'
              }`}
            >
              <div className="flex items-center justify-between font-black">
                <span className={feedbackData.isAcceptable ? 'text-[#2F9E69]' : 'text-[#D84B42]'}>
                  {feedbackData.praise} (Naturalness Score: {feedbackData.score}%)
                </span>
                <span className="text-[10px] uppercase font-bold text-[#77736B]">Tutor Analysis</span>
              </div>

              <p className="text-[#77736B] dark:text-slate-300 font-medium">{feedbackData.feedback}</p>

              {feedbackData.naturalAlternative && (
                <div className="pt-1 text-[11px]">
                  <span className="font-bold text-[#0B8F62]">Native phrasing example: </span>
                  <span className="font-bold text-[#25231F] dark:text-white">"{feedbackData.naturalAlternative}"</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Suggested Quick Replies */}
        {!isCompleted && selectedScenario?.turns[currentTurnIdx]?.suggestedReplies && (
          <div className="space-y-1.5">
            <p className="text-[11px] font-bold text-[#77736B] dark:text-slate-400 uppercase tracking-wider">
              Suggested Phrasings (Tap to send):
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedScenario.turns[currentTurnIdx].suggestedReplies.map((reply, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(reply)}
                  className="px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-[#0B8F62]/10 border border-[#E8E6E0] dark:border-slate-800 hover:border-[#0B8F62] rounded-xl text-xs font-bold text-[#25231F] dark:text-slate-200 transition-all text-left shadow-xs"
                >
                  "{reply}"
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Controls Bar */}
        {!isCompleted ? (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSendMessage()
            }}
            className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border-2 border-[#E8E6E0] dark:border-slate-800 shadow-sm"
          >
            <button
              type="button"
              onClick={handleToggleMic}
              className={`p-3 rounded-xl transition-all ${
                isRecording
                  ? 'bg-[#D84B42] text-white animate-pulse'
                  : 'bg-[#F7F5EF] dark:bg-slate-800 text-[#0B8F62] hover:bg-[#0B8F62]/10'
              }`}
              title={isRecording ? 'Stop recording' : 'Speak your reply'}
            >
              {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
            </button>

            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={`Reply in ${learningLang.name} script or English...`}
              disabled={isEvaluating}
              className="flex-1 text-sm font-medium px-3 py-2 bg-transparent focus:outline-none dark:text-white"
            />

            <button
              type="submit"
              disabled={!inputVal.trim() || isEvaluating}
              className="p-3 bg-[#0B8F62] hover:bg-[#09734e] disabled:opacity-50 text-white rounded-xl shadow-md transition-all"
            >
              <Send size={18} />
            </button>
          </form>
        ) : (
          <div className="bg-gradient-to-r from-[#0B8F62] to-[#2F9E69] rounded-3xl p-6 text-white text-center space-y-3 shadow-lg">
            <Award size={36} className="mx-auto text-amber-300" />
            <h3 className="text-xl font-black">Scenario Completed! +35 XP</h3>
            <p className="text-xs text-white/90 max-w-sm mx-auto">
              You successfully held a full native conversation in {learningLang.name}!
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <Button variant="outline" className="!text-white !border-white" onClick={() => setSelectedScenario(scenarios[0])}>
                Practice Again
              </Button>
              <Button onClick={() => navigate('/dashboard')}>
                Back to Roadmap
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* 3. RIGHT SIDEBAR */}
      <RightSidebar />
    </div>
  )
}
