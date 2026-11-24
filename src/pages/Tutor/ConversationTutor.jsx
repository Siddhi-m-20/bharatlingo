import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../services/auth'
import { useProgress } from '../../services/progress'
import { getLanguageById } from '../../data/languages'
import { speakText } from '../../services/aiService'
import { speechRecognitionService } from '../../services/audio/SpeechRecognitionService'
import { audioFX } from '../../utils/audioFX'
import TopNavbar from '../../components/Navigation/TopNavbar'
import AppSidebar from '../../components/Navigation/AppSidebar'
import { Volume2, Mic, MicOff, Send, Sparkles } from 'lucide-react'
import { useTheme } from '../../services/themeContext'

const OPENING_MESSAGES = {
  hi: 'नमस्ते! आज किस बारे में बात करें?',
  mr: 'नमस्कार! आज आपण कोणत्या विषयावर बोलूया?',
  ta: 'வணக்கம்! இன்று எந்த விஷயத்தைப் பற்றி பேசலாம்?',
  te: 'నమస్కారం! ఈ రోజు ఏ విషయం గురించి మాట్లాడదాం?',
  bn: 'নমস্কার! আজ কোন বিষয়ে কথা বলব?',
  pa: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਅੱਜ ਕਿਸ topic ਬਾਰੇ ਗੱਲ ਕਰੀਏ?',
  gu: 'નમસ્તે! આજે કયા વિષય પર વાત કરીએ?',
  en: 'Hello! What would you like to talk about today?',
}

const FALLBACK_REPLIES = {
  hi: 'बहुत अच्छा। आप आगे क्या कहना चाहते हैं?',
  mr: 'छान! पुढे तुम्हाला काय म्हणायचे आहे?',
  ta: 'நன்று! அடுத்து என்ன சொல்ல விரும்புகிறீர்கள்?',
  te: 'చాలా బాగుంది! ఇప్పుడు ఇంకేమి చెప్పాలనుకుంటున్నారు?',
  bn: 'খুব ভালো! এবার আর কী বলতে চান?',
  pa: 'ਬਹੁਤ ਵਧੀਆ! ਹੁਣ ਤੁਸੀਂ ਕੀ ਕਹਿਣਾ ਚਾਹੋਗੇ?',
  gu: 'ખૂબ સરસ! હવે આગળ તમે શું કહેવા માંગો છો?',
  en: 'That is great. What would you like to talk about next?',
}

function timestamp() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function ConversationTutor() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addXP } = useProgress()
  const { t } = useTheme()

  const [chatHistory, setChatHistory] = useState([])
  const [inputVal, setInputVal] = useState('')
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [feedbackData, setFeedbackData] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [showTranslations, setShowTranslations] = useState(true)

  const chatEndRef = useRef(null)
  const learningLang = getLanguageById(user?.learningLanguage) || { name: 'Hindi', id: 'hi' }

  useEffect(() => {
    if (!user?.learningLanguage) {
      navigate('/onboarding')
      return
    }

    const languageId = user.learningLanguage
    const opening = OPENING_MESSAGES[languageId] || OPENING_MESSAGES.hi
    setFeedbackData(null)
    setInputVal('')
    setChatHistory([{
      id: 'tutor_opening',
      sender: 'tutor',
      text: opening,
      timestamp: timestamp(),
    }])
    speakText(opening, languageId)
  }, [user?.learningLanguage, navigate])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory, feedbackData])

  const handlePlayTutorAudio = (text) => {
    speakText(text, user?.learningLanguage || 'hi')
  }

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
    speechRecognitionService.start(user?.learningLanguage || 'hi', '', {
      onResult: (result) => {
        setIsRecording(false)
        if (result?.transcript) setInputVal(result.transcript)
      },
      onError: (error) => {
        setIsRecording(false)
        console.warn('ASR Error:', error)
      },
    })
  }

  const handleSendMessage = async (textToSend = inputVal) => {
    const text = String(textToSend || '').trim()
    if (!text || isEvaluating) return

    const languageId = user?.learningLanguage || 'hi'
    const userMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: timestamp(),
    }
    const nextHistory = [...chatHistory, userMessage]

    setChatHistory(nextHistory)
    setInputVal('')
    setIsEvaluating(true)

    let evaluation
    try {
      const response = await fetch('/api/tutor/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          learnerResponse: text,
          learningLanguage: languageId,
          preferredLanguage: user?.preferredLanguage || 'en',
          level: user?.level || 'beginner',
          chatHistory: nextHistory,
        }),
      })

      if (!response.ok) throw new Error(`Tutor API returned ${response.status}`)
      evaluation = await response.json()

      if (
        typeof evaluation?.isAcceptable !== 'boolean'
        || !Number.isFinite(Number(evaluation?.score))
        || typeof evaluation?.tutorReply !== 'string'
      ) {
        throw new Error('Tutor API returned an invalid response')
      }
    } catch (error) {
      console.warn('[Tutor] Generative chat unavailable, using simple fallback:', error.message)
      evaluation = {
        isAcceptable: true,
        score: 70,
        praise: 'Good conversation!',
        feedback: 'Keep practising naturally.',
        naturalAlternative: text,
        correctedReply: text,
        tutorReply: FALLBACK_REPLIES[languageId] || FALLBACK_REPLIES.en,
      }
    }

    setFeedbackData(evaluation)
    setIsEvaluating(false)

    if (evaluation.isAcceptable) {
      audioFX.playCorrect()
      addXP(10)
    } else {
      audioFX.playWrong()
    }

    const tutorReply = String(evaluation.tutorReply || '').trim()
    if (tutorReply) {
      setTimeout(() => {
        setChatHistory((current) => [
          ...current,
          {
            id: `tutor_${Date.now()}`,
            sender: 'tutor',
            text: tutorReply,
            timestamp: timestamp(),
          },
        ])
        speakText(tutorReply, languageId)
      }, 500)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F5EF] dark:bg-slate-950 flex flex-col md:flex-row pb-20 md:pb-6">
      <AppSidebar />

      <main className="flex-1 min-w-0 md:ml-72 flex flex-col min-h-screen">
        <TopNavbar />

        <div className="p-4 sm:p-6 lg:p-8 space-y-4 w-full max-w-5xl mx-auto flex-1">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border-2 border-[#E8E6E0] dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#0B8F62]/15 text-[#0B8F62] flex items-center justify-center text-2xl shadow-sm">
                💬
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-black text-[#25231F] dark:text-white">
                    AI Conversation Tutor
                  </h1>
                  <span className="text-[10px] font-black uppercase bg-[#0B8F62]/10 text-[#0B8F62] px-2 py-0.5 rounded-md">
                    Free Chat
                  </span>
                </div>
                <p className="text-xs text-[#77736B] dark:text-slate-400">
                  Normal conversation practice in <span className="font-bold text-[#0B8F62]">{learningLang.name}</span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowTranslations((current) => !current)}
              className="text-xs font-bold text-[#77736B] hover:text-[#0B8F62] px-3 py-1.5 bg-[#F7F5EF] dark:bg-slate-800 rounded-xl transition-colors"
            >
              {showTranslations ? 'Hide Translation' : 'Show Translation'}
            </button>
          </div>

          <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl border-2 border-[#E8E6E0] dark:border-slate-800 p-4 sm:p-5 shadow-sm overflow-y-auto space-y-4 min-h-[220px] max-h-[520px]">
            {chatHistory.map((message) => {
              const isTutor = message.sender === 'tutor'
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col ${isTutor ? 'items-start' : 'items-end'}`}
                >
                  <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm text-sm ${
                    isTutor
                      ? 'bg-[#F7F5EF] dark:bg-slate-800 text-[#25231F] dark:text-white rounded-tl-sm border border-[#E8E6E0] dark:border-slate-700'
                      : 'bg-[#0B8F62] text-white rounded-tr-sm shadow-md shadow-[#0B8F62]/20'
                  }`}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-extrabold text-base leading-snug">{message.text}</p>
                      {isTutor && (
                        <button
                          type="button"
                          onClick={() => handlePlayTutorAudio(message.text)}
                          className="p-1 rounded-lg bg-white/80 dark:bg-slate-700 text-[#0B8F62] hover:scale-110 transition-transform"
                          title={t('pronounce')}
                        >
                          <Volume2 size={16} />
                        </button>
                      )}
                    </div>
                    {isTutor && showTranslations && message.translation && (
                      <p className="text-xs text-[#0B8F62] dark:text-[#34D399] font-medium pt-1 border-t border-black/5 dark:border-white/5">
                        Meaning: {message.translation}
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] text-[#77736B] px-1 mt-0.5">{message.timestamp}</span>
                </motion.div>
              )
            })}

            {isEvaluating && (
              <div className="flex items-center gap-2 text-xs text-[#77736B] italic p-2">
                <Sparkles size={14} className="animate-spin text-[#0B8F62]" />
                <span>The tutor is preparing a natural reply...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <AnimatePresence>
            {feedbackData && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={`p-4 rounded-2xl border-2 text-xs space-y-2 shadow-sm ${
                  feedbackData.isAcceptable
                    ? 'bg-[#2F9E69]/10 border-[#2F9E69]/40'
                    : 'bg-[#D84B42]/10 border-[#D84B42]/40'
                }`}
              >
                <div className="flex items-center justify-between font-black">
                  <span className={feedbackData.isAcceptable ? 'text-[#2F9E69]' : 'text-[#D84B42]'}>
                    {feedbackData.praise} (Naturalness Score: {feedbackData.score}%)
                  </span>
                  <span className="text-[10px] uppercase font-bold text-[#77736B]">
                    {t('tutor_analysis') || 'Tutor Analysis'}
                  </span>
                </div>
                <p className="text-[#77736B] dark:text-slate-300 font-medium">{feedbackData.feedback}</p>
                {feedbackData.naturalAlternative && (
                  <div className="pt-1 text-[11px]">
                    <span className="font-bold text-[#0B8F62]">
                      {t('native_phrasing_example') || 'Natural phrasing:'}{' '}
                    </span>
                    <span className="font-bold text-[#25231F] dark:text-white">
                      "{feedbackData.naturalAlternative}"
                    </span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <form
            onSubmit={(event) => {
              event.preventDefault()
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
              onChange={(event) => setInputVal(event.target.value)}
              placeholder={t('reply_tutor_placeholder') || `Reply in ${learningLang.name} script...`}
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
        </div>
      </main>
    </div>
  )
}
