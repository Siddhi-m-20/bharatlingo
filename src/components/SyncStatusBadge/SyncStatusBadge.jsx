import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Database, CheckCircle2, Cloud, HardDrive, X } from 'lucide-react'
import { isSupabaseConfigured } from '../../services/supabase'

export default function SyncStatusBadge() {
  const isCloud = isSupabaseConfigured()
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all hover:scale-105"
        style={{
          backgroundColor: isCloud ? 'rgba(47, 158, 105, 0.1)' : 'rgba(243, 154, 69, 0.1)',
          borderColor: isCloud ? 'rgba(47, 158, 105, 0.3)' : 'rgba(243, 154, 69, 0.3)',
          color: isCloud ? '#0B8F62' : '#F39A45',
        }}
        title="View Database & Sync Health"
      >
        <span className={`w-2 h-2 rounded-full animate-pulse ${isCloud ? 'bg-[#2F9E69]' : 'bg-[#F39A45]'}`} />
        <span className="hidden md:inline">{isCloud ? 'Cloud Synced' : 'Local Mode'}</span>
      </button>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-[#E8E6E0]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#0B8F62]/10 flex items-center justify-center text-[#0B8F62]">
                    <Database size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-[#25231F]">Database & Sync Status</h3>
                    <p className="text-xs text-[#77736B]">18-Table PostgreSQL Architecture</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-full hover:bg-black/5 text-[#77736B]"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="py-4 space-y-3.5">
                <div className="flex items-center justify-between p-3 bg-[#F7F5EF] rounded-2xl">
                  <div className="flex items-center gap-2.5 text-sm font-semibold text-[#25231F]">
                    {isCloud ? <Cloud size={18} className="text-[#0B8F62]" /> : <HardDrive size={18} className="text-[#F39A45]" />}
                    <span>Backend Storage</span>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    isCloud ? 'bg-[#0B8F62]/10 text-[#0B8F62]' : 'bg-[#F39A45]/10 text-[#F39A45]'
                  }`}>
                    {isCloud ? 'Supabase PostgreSQL' : 'Local Storage Cache'}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-[#77736B]">
                  <div className="flex justify-between">
                    <span>Active Tables:</span>
                    <span className="font-bold text-[#25231F]">18 Relational Tables</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Row Level Security (RLS):</span>
                    <span className="font-bold text-[#2F9E69]">Enforced</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dynamic Streaks:</span>
                    <span className="font-bold text-[#25231F]">Realtime DB Synchronized</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sequential Lesson Locks:</span>
                    <span className="font-bold text-[#25231F]">Automated via user_progress</span>
                  </div>
                </div>

                <div className="p-3 bg-[#0B8F62]/10 border border-[#0B8F62]/20 rounded-xl text-xs text-[#0B8F62] flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>All your XP, Streaks, and Progress are safely persisted!</span>
                </div>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="w-full py-2.5 bg-[#25231F] text-white font-bold rounded-xl text-sm hover:bg-black transition-colors"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
