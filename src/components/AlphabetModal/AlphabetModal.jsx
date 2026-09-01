import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Volume2, X, Sparkles } from 'lucide-react'
import { alphabetDataByLanguage } from '../../data/alphabets'
import { speakText } from '../../services/aiService'

export default function AlphabetModal({ languageId = 'hi', languageName = 'Hindi', isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('vowels')
  const data = alphabetDataByLanguage[languageId] || alphabetDataByLanguage['hi']

  if (!isOpen) return null

  const handlePlayAudio = (char) => {
    speakText(char, languageId)
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-[#E8E6E0] flex items-center justify-between bg-[#F7F5EF]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#0B8F62] text-white flex items-center justify-center font-bold text-lg shadow-md shadow-[#0B8F62]/20">
                अ
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-[#25231F]">{languageName} Script Chart</h3>
                <p className="text-xs text-[#77736B]">{data.scriptName} • Tap any letter to hear sound</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-black/5 text-[#77736B] hover:text-[#25231F] transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex border-b border-[#E8E6E0] bg-white px-6 pt-3 gap-3">
            <button
              onClick={() => setActiveTab('vowels')}
              className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'vowels'
                  ? 'border-[#0B8F62] text-[#0B8F62]'
                  : 'border-transparent text-[#77736B] hover:text-[#25231F]'
              }`}
            >
              <Sparkles size={16} />
              <span>{data.vowelsTitle}</span>
            </button>
            <button
              onClick={() => setActiveTab('consonants')}
              className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'consonants'
                  ? 'border-[#0B8F62] text-[#0B8F62]'
                  : 'border-transparent text-[#77736B] hover:text-[#25231F]'
              }`}
            >
              <Sparkles size={16} />
              <span>{data.consonantsTitle}</span>
            </button>
          </div>

          {/* Alphabet Grid */}
          <div className="p-6 overflow-y-auto flex-1 bg-[#FBFBFA]">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
              {(activeTab === 'vowels' ? data.vowels : data.consonants).map((item, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => handlePlayAudio(item.char)}
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  className="p-4 bg-white border-2 border-[#E8E6E0] hover:border-[#0B8F62] rounded-2xl text-left shadow-sm hover:shadow-md transition-all group flex flex-col justify-between min-h-[105px]"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-3xl font-black text-[#0B8F62] group-hover:scale-110 transition-transform">
                      {item.char}
                    </span>
                    <Volume2 size={16} className="text-[#77736B] group-hover:text-[#0B8F62] transition-colors" />
                  </div>
                  <div className="mt-2">
                    <p className="text-xs font-bold text-[#25231F]">/{item.roman}/</p>
                    <p className="text-[11px] text-[#77736B] truncate">{item.example}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-white border-t border-[#E8E6E0] text-center text-xs text-[#77736B]">
            Tip: Listen carefully to the pronunciation and practice repeating each character!
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
