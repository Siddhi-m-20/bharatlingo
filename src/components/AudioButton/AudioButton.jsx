/**
 * AudioButton — Synchronized state machine audio control for BharatLingo
 *
 * States: idle | loading | playing | completed | error | unsupported
 *
 * Features:
 * - Synchronized with global central AudioService
 * - Prevents multiple buttons from showing playing state simultaneously
 * - Provides waveform animation while playing
 * - Provides immediate one-click retry if audio synthesis encounters an issue
 * - Keyboard accessible
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ttsService, AUDIO_STATE } from '../../services/audio/AudioService'

// ── Waveform bars animation ──────────────────────────────────────────────────
function Waveform({ active }) {
  const bars = [3, 6, 9, 6, 3] // heights in units (×2px)
  return (
    <div className="flex items-end gap-[3px] h-5" aria-hidden="true">
      {bars.map((h, i) => (
        <motion.div
          key={i}
          className="w-[3px] bg-current rounded-full"
          animate={
            active
              ? { height: [`${h * 2}px`, `${Math.min(h * 2 + 8, 18)}px`, `${h * 2}px`] }
              : { height: `${h * 2}px` }
          }
          transition={
            active
              ? { repeat: Infinity, duration: 0.4 + i * 0.1, ease: 'easeInOut' }
              : { duration: 0.2 }
          }
        />
      ))}
    </div>
  )
}

// ── Loading spinner ──────────────────────────────────────────────────────────
function Spinner() {
  return (
    <motion.div
      className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}
      aria-hidden="true"
    />
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AudioButton({
  text,
  languageId = 'hi',
  rate = 0.88,
  size = 'medium',    // small | medium | large
  variant = 'button', // button | icon
  label,              // optional custom label
  autoPlay = false,
  className = '',
  onStateChange,
}) {
  const [audioState, setAudioState] = useState(AUDIO_STATE.IDLE)
  const mountedRef = useRef(true)
  const autoPlayedRef = useRef(false)
  const myTrackId = `${(languageId || 'hi').toLowerCase()}:${(text || '').trim()}`

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  // Subscribe to central AudioService for authoritative state synchronization
  useEffect(() => {
    const unsubscribe = ttsService.subscribe((state, activeId) => {
      if (!mountedRef.current) return

      if (activeId === myTrackId) {
        setAudioState(state)
        if (onStateChange) onStateChange(state)

        if (state === AUDIO_STATE.COMPLETED) {
          setTimeout(() => {
            if (mountedRef.current && ttsService.getActiveId() !== myTrackId) {
              setAudioState(AUDIO_STATE.IDLE)
            }
          }, 1500)
        }
      } else {
        // Another sound is playing or idle, ensure this button is idle
        setAudioState((prev) => {
          if (prev === AUDIO_STATE.PLAYING || prev === AUDIO_STATE.LOADING) {
            return AUDIO_STATE.IDLE
          }
          return prev
        })
      }
    })

    return () => {
      unsubscribe()
    }
  }, [myTrackId, onStateChange])

  const handlePlay = useCallback(async (e) => {
    if (e && e.stopPropagation) e.stopPropagation()
    if (!text) return

    // If currently playing, stop it
    if (audioState === AUDIO_STATE.PLAYING && ttsService.getActiveId() === myTrackId) {
      ttsService.stop()
      if (mountedRef.current) setAudioState(AUDIO_STATE.IDLE)
      return
    }

    if (mountedRef.current) setAudioState(AUDIO_STATE.LOADING)
    if (onStateChange) onStateChange(AUDIO_STATE.LOADING)

    const result = await ttsService.speak(text, languageId, {
      rate,
      onEnd: ({ success }) => {
        if (!mountedRef.current) return
        const nextState = success ? AUDIO_STATE.COMPLETED : AUDIO_STATE.ERROR
        setAudioState(nextState)
        if (onStateChange) onStateChange(nextState)

        if (success) {
          setTimeout(() => {
            if (mountedRef.current) setAudioState(AUDIO_STATE.IDLE)
          }, 1500)
        }
      },
    })

    if (!mountedRef.current) return

    if (result.success) {
      setAudioState(AUDIO_STATE.PLAYING)
      if (onStateChange) onStateChange(AUDIO_STATE.PLAYING)
    } else {
      setAudioState(AUDIO_STATE.ERROR)
      if (onStateChange) onStateChange(AUDIO_STATE.ERROR)
    }
  }, [text, languageId, rate, audioState, myTrackId, onStateChange])

  // Auto-play on mount when requested (with gesture context fallback)
  useEffect(() => {
    if (autoPlay && text && !autoPlayedRef.current) {
      autoPlayedRef.current = true
      const t = setTimeout(() => {
        handlePlay()
      }, 350)
      return () => clearTimeout(t)
    }
  }, [autoPlay, text, handlePlay])

  // Preload audio in background for snappy responsiveness
  useEffect(() => {
    if (text) {
      ttsService.preload(text, languageId, rate)
    }
  }, [text, languageId, rate])

  // ── Icon-only variant (circular button) ───────────────────────────────────
  if (variant === 'icon') {
    const sizes = { small: 'w-8 h-8', medium: 'w-10 h-10', large: 'w-12 h-12' }
    const iconSizes = { small: 16, medium: 20, large: 24 }
    const iconSize = iconSizes[size] || 20

    const stateIcon = () => {
      switch (audioState) {
        case AUDIO_STATE.LOADING:   return <Spinner />
        case AUDIO_STATE.PLAYING:   return <Waveform active />
        case AUDIO_STATE.ERROR:     return <RetryIcon size={iconSize} />
        case AUDIO_STATE.COMPLETED: return <ReplayIcon size={iconSize} />
        default:                    return <SpeakerIcon size={iconSize} />
      }
    }

    const stateColor = () => {
      switch (audioState) {
        case AUDIO_STATE.PLAYING:   return 'bg-[#0FB878] ring-4 ring-[#0B8F62]/25'
        case AUDIO_STATE.ERROR:     return 'bg-[#F39A45] hover:bg-[#E08328]'
        case AUDIO_STATE.LOADING:   return 'bg-[#0B8F62]/70'
        default:                    return 'bg-[#0B8F62] hover:bg-[#0FB878]'
      }
    }

    return (
      <motion.button
        type="button"
        className={`flex items-center justify-center rounded-full text-white transition-all focus:outline-none focus:ring-2 focus:ring-[#0B8F62] focus:ring-offset-2 shadow-sm ${sizes[size] || sizes.medium} ${stateColor()} ${className}`}
        onClick={handlePlay}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        aria-label={label || (audioState === AUDIO_STATE.ERROR ? `Retry audio for ${text}` : `Play audio: ${text}`)}
        title={label || (audioState === AUDIO_STATE.ERROR ? 'Audio failed. Tap to retry.' : `Play audio: ${text}`)}
      >
        {stateIcon()}
      </motion.button>
    )
  }

  // ── Full button variant ───────────────────────────────────────────────────
  const isPlaying   = audioState === AUDIO_STATE.PLAYING
  const isLoading   = audioState === AUDIO_STATE.LOADING
  const isError     = audioState === AUDIO_STATE.ERROR
  const isCompleted = audioState === AUDIO_STATE.COMPLETED

  const buttonContent = () => {
    if (isLoading)   return <><Spinner /><span>Generating audio...</span></>
    if (isPlaying)   return <><Waveform active /><span>Playing...</span></>
    if (isError)     return <><RetryIcon size={16} /><span>Retry Audio</span></>
    if (isCompleted) return <><ReplayIcon size={16} /><span>Replay</span></>
    return <><SpeakerIcon size={16} /><span>{label || 'Listen'}</span></>
  }

  const buttonStyle = () => {
    if (isError)   return 'bg-[#F39A45]/10 border-[#F39A45] text-[#D0731D] hover:bg-[#F39A45]/20'
    if (isPlaying) return 'bg-[#0B8F62] border-[#0B8F62] text-white ring-4 ring-[#0B8F62]/20'
    return 'bg-white border-[#0B8F62] text-[#0B8F62] hover:bg-[#0B8F62]/10'
  }

  return (
    <motion.button
      type="button"
      className={`flex items-center justify-center gap-2 px-4 py-2.5 border-2 rounded-2xl font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#0B8F62] focus:ring-offset-2 ${buttonStyle()} ${className}`}
      onClick={handlePlay}
      whileHover={!isLoading ? { scale: 1.03 } : {}}
      whileTap={!isLoading ? { scale: 0.97 } : {}}
      aria-label={label || `Play audio: ${text}`}
      aria-busy={isLoading}
      aria-pressed={isPlaying}
      disabled={isLoading}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={audioState}
          className="flex items-center gap-2"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
        >
          {buttonContent()}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  )
}

// ── SVG Icons ─────────────────────────────────────────────────────────────────
function SpeakerIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  )
}

function ReplayIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 .49-3.5" />
    </svg>
  )
}

function RetryIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
    </svg>
  )
}
