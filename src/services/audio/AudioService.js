/**
 * AudioService — Central authoritative audio state machine for BharatLingo
 *
 * States: idle | loading | playing | paused | completed | error | unsupported
 *
 * Architecture:
 * 1. Authoritative playback state machine: only ONE sound plays at a time.
 * 2. Primary Provider: Server / Local Indic-TTS (/api/tts) with persistent caching.
 * 3. Fallback Provider: Browser Web Speech API with STRICT locale matching only
 *    (never fallback from Tamil/Telugu/Marathi/etc. to English or Hindi).
 * 4. Queue / cancel race-condition prevention & V8 garbage collection protection.
 * 5. Full synchronization with AudioButton & exercise components.
 */

// ── Strict voice locale map for native browser TTS fallback ──────────────────
// NEVER include English or Hindi in other Indian language lists.
export const strictVoiceLocales = {
  en:  ['en-in', 'en-us', 'en-gb', 'en-au', 'en-ca'],
  hi:  ['hi-in', 'hi'],
  mr:  ['mr-in', 'mr'],
  ta:  ['ta-in', 'ta-lk', 'ta-sg', 'ta'],
  te:  ['te-in', 'te'],
  bn:  ['bn-in', 'bn-bd', 'bn'],
  pa:  ['pa-in', 'pa-pk', 'pa', 'pan'],
  gu:  ['gu-in', 'gu'],
}

// Backward-compat alias
export const voiceLocales = strictVoiceLocales

// ── Authoritative Audio states ────────────────────────────────────────────────
export const AUDIO_STATE = {
  IDLE:        'idle',
  LOADING:     'loading',
  PLAYING:     'playing',
  PAUSED:      'paused',
  COMPLETED:   'completed',
  ERROR:       'error',
  UNSUPPORTED: 'unsupported',
}

// ── Client-side LRU Audio Cache (Blob URLs & Metadata) ───────────────────────
export class ClientAudioCache {
  constructor(maxSize = 100) {
    this._urls = new Map()
    this._max = maxSize
  }

  key(langId, text, rate = 1.0) {
    return `${langId || 'hi'}:${rate}:${(text || '').trim().toLowerCase()}`
  }

  has(langId, text, rate = 1.0) {
    return this._urls.has(this.key(langId, text, rate))
  }

  get(langId, text, rate = 1.0) {
    const k = this.key(langId, text, rate)
    if (!this._urls.has(k)) return null
    // Refresh LRU
    const val = this._urls.get(k)
    this._urls.delete(k)
    this._urls.set(k, val)
    return val
  }

  set(langId, text, rate = 1.0, url) {
    const k = this.key(langId, text, rate)
    if (this._urls.size >= this._max) {
      const oldestKey = this._urls.keys().next().value
      const oldUrl = this._urls.get(oldestKey)
      if (oldUrl && typeof oldUrl === 'string' && oldUrl.startsWith('blob:')) {
        try { URL.revokeObjectURL(oldUrl) } catch {}
      }
      this._urls.delete(oldestKey)
    }
    this._urls.set(k, url)
  }

  clear() {
    for (const url of this._urls.values()) {
      if (url && typeof url === 'string' && url.startsWith('blob:')) {
        try { URL.revokeObjectURL(url) } catch {}
      }
    }
    this._urls.clear()
  }
}

export const audioCache = new ClientAudioCache(150)

// ── Central Audio State Machine Engine ────────────────────────────────────────
export class CentralAudioService {
  constructor() {
    this._currentState = AUDIO_STATE.IDLE
    this._activeId = null
    this._activeAudioElement = null
    this._activeUtterance = null
    this._listeners = new Set()
    this._voicesLoaded = false
    this._voices = []
    this._watchdog = null
    this._isSupported = true

    if (typeof window !== 'undefined') {
      this._initSpeechSynthesis()
    }
  }

  // ── Browser Speech Synthesis Initialization ───────────────────────────────
  _initSpeechSynthesis() {
    if (!('speechSynthesis' in window)) return

    const loadVoices = () => {
      try {
        const v = window.speechSynthesis.getVoices()
        if (v && v.length > 0) {
          this._voices = v
          this._voicesLoaded = true
        }
      } catch {}
    }

    loadVoices()
    try {
      window.speechSynthesis.addEventListener('voiceschanged', loadVoices)
    } catch {}
  }

  // ── Retrieve voices with timeout fallback ─────────────────────────────────
  async _getBrowserVoices() {
    if (this._voicesLoaded && this._voices.length > 0) return this._voices
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return []

    return new Promise((resolve) => {
      const existing = window.speechSynthesis.getVoices()
      if (existing && existing.length > 0) {
        this._voices = existing
        this._voicesLoaded = true
        resolve(existing)
        return
      }

      let settled = false
      const handler = () => {
        if (settled) return
        settled = true
        const v = window.speechSynthesis.getVoices()
        this._voices = v
        this._voicesLoaded = true
        try {
          window.speechSynthesis.removeEventListener('voiceschanged', handler)
        } catch {}
        resolve(v)
      }

      try {
        window.speechSynthesis.addEventListener('voiceschanged', handler)
      } catch {}

      setTimeout(() => {
        if (!settled) {
          settled = true
          try {
            window.speechSynthesis.removeEventListener('voiceschanged', handler)
          } catch {}
          const v = window.speechSynthesis.getVoices()
          this._voices = v
          this._voicesLoaded = true
          resolve(v)
        }
      }, 1500)
    })
  }

  // ── Strict Voice Matching (No Mismatched Language Fallback) ────────────────
  getStrictVoice(langId, voices) {
    if (!voices || voices.length === 0) return null
    const targets = strictVoiceLocales[langId] || strictVoiceLocales['hi'] || []

    for (const target of targets) {
      // 1. Exact locale match (e.g. 'ta-in' === 'ta-in')
      const exact = voices.find((v) => {
        const vl = (v.lang || '').toLowerCase().replace('_', '-')
        return vl === target
      })
      if (exact) return exact

      // 2. Prefix match strictly for the language code (e.g. 'ta-LK' for 'ta')
      const prefix = voices.find((v) => {
        const vl = (v.lang || '').toLowerCase().replace('_', '-')
        const base = target.split('-')[0]
        return vl.startsWith(`${base}-`) || vl === base
      })
      if (prefix) return prefix
    }

    return null
  }

  // ── State Broadcast ───────────────────────────────────────────────────────
  _setState(state, activeId = this._activeId, meta = {}) {
    this._currentState = state
    if (state === AUDIO_STATE.IDLE || state === AUDIO_STATE.COMPLETED || state === AUDIO_STATE.ERROR) {
      if (state === AUDIO_STATE.IDLE) {
        this._activeId = null
      }
    }
    this._listeners.forEach((fn) => {
      try {
        fn(state, activeId, meta)
      } catch (err) {
        console.warn('[AudioService listener error]', err)
      }
    })
  }

  subscribe(fn) {
    this._listeners.add(fn)
    // Return unsubscribe function
    return () => this._listeners.delete(fn)
  }

  getState() {
    return this._currentState
  }

  getActiveId() {
    return this._activeId
  }

  isSupported() {
    return this._isSupported
  }

  // ── Global Stop ───────────────────────────────────────────────────────────
  stop() {
    if (this._watchdog) {
      clearInterval(this._watchdog)
      this._watchdog = null
    }

    // Stop HTML Audio element
    if (this._activeAudioElement) {
      try {
        this._activeAudioElement.pause()
        this._activeAudioElement.currentTime = 0
        this._activeAudioElement.onplay = null
        this._activeAudioElement.onended = null
        this._activeAudioElement.onerror = null
        this._activeAudioElement.onpause = null
      } catch {}
      this._activeAudioElement = null
    }

    // Stop Browser Speech Synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel()
      } catch {}
    }
    this._activeUtterance = null
    if (typeof window !== 'undefined') {
      window.__bharatlingo_active_utterance = null
    }

    if (this._currentState !== AUDIO_STATE.IDLE) {
      this._setState(AUDIO_STATE.IDLE)
    }
  }

  // ── Primary Provider: Server / Local Indic-TTS API ─────────────────────────
  async _playViaIndicTts(text, langId, rate, trackId, onEnd) {
    let audioUrl = audioCache.get(langId, text, rate)

    if (!audioUrl) {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim(),
          language: langId,
          rate,
        }),
      })

      if (!response.ok) {
        throw new Error(`Indic-TTS server returned status ${response.status}`)
      }

      const blob = await response.blob()
      if (!blob || blob.size < 40) {
        throw new Error('Empty audio stream received from Indic-TTS')
      }

      audioUrl = URL.createObjectURL(blob)
      audioCache.set(langId, text, rate, audioUrl)
    }

    return new Promise((resolve, reject) => {
      const audio = new Audio(audioUrl)
      audio.playbackRate = Math.max(0.5, Math.min(rate, 2.0))
      this._activeAudioElement = audio

      audio.onplay = () => {
        if (this._activeId === trackId) {
          this._setState(AUDIO_STATE.PLAYING, trackId, { provider: 'indic_tts' })
        }
      }

      audio.onended = () => {
        if (this._activeId === trackId) {
          this._activeAudioElement = null
          this._setState(AUDIO_STATE.COMPLETED, trackId, { provider: 'indic_tts' })
          if (onEnd) onEnd({ success: true, provider: 'indic_tts' })
        }
        resolve({ success: true, provider: 'indic_tts' })
      }

      audio.onerror = (e) => {
        if (this._activeId === trackId) {
          this._activeAudioElement = null
        }
        reject(new Error(audio.error ? audio.error.message : 'Audio playback error'))
      }

      audio.play().catch((err) => {
        reject(err)
      })
    })
  }

  // ── Tier 2 Provider: High-Fidelity Direct Indic Cloud Audio ───────────────
  async _playViaDirectIndicAudio(text, langId, rate, trackId, onEnd) {
    const langCodeMap = {
      hi: 'hi',
      mr: 'mr',
      ta: 'ta',
      te: 'te',
      bn: 'bn',
      pa: 'pa',
      gu: 'gu',
      en: 'en',
    }
    const targetLang = langCodeMap[langId.toLowerCase()] || 'hi'
    const directUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text.trim())}&tl=${targetLang}&client=tw-ob`

    return new Promise((resolve, reject) => {
      const audio = new Audio(directUrl)
      audio.playbackRate = Math.max(0.5, Math.min(rate, 2.0))
      this._activeAudioElement = audio

      audio.onplay = () => {
        if (this._activeId === trackId) {
          this._setState(AUDIO_STATE.PLAYING, trackId, { provider: 'direct_indic_cloud' })
        }
      }

      audio.onended = () => {
        if (this._activeId === trackId) {
          this._activeAudioElement = null
          this._setState(AUDIO_STATE.COMPLETED, trackId, { provider: 'direct_indic_cloud' })
          if (onEnd) onEnd({ success: true, provider: 'direct_indic_cloud' })
        }
        resolve({ success: true, provider: 'direct_indic_cloud' })
      }

      audio.onerror = (e) => {
        if (this._activeId === trackId) {
          this._activeAudioElement = null
        }
        reject(new Error('Direct Indic audio stream unavailable'))
      }

      audio.play().catch((err) => {
        reject(err)
      })
    })
  }

  // ── Fallback Provider: Browser SpeechSynthesis (Strict Matching Only) ─────
  async _playViaBrowserSpeech(text, langId, rate, pitch, trackId, onEnd) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      throw new Error('Web Speech API unsupported in this browser')
    }

    const voices = await this._getBrowserVoices()
    const voice = this.getStrictVoice(langId, voices)

    if (!voice) {
      throw new Error(`No strictly matching native speech voice found for language '${langId}'`)
    }

    // Fix Chromium cancel race condition with asynchronous microtask yield
    try {
      window.speechSynthesis.cancel()
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 50))

    return new Promise((resolve, reject) => {
      const Utterance = window.SpeechSynthesisUtterance
      if (!Utterance) {
        return reject(new Error('SpeechSynthesisUtterance unavailable'))
      }

      const utterance = new Utterance(text)
      utterance.voice = voice
      utterance.lang = voice.lang || strictVoiceLocales[langId]?.[0] || 'hi-IN'
      utterance.rate = rate
      utterance.pitch = pitch

      // Prevent V8 Garbage Collection bug from cutting audio mid-playback
      this._activeUtterance = utterance
      window.__bharatlingo_active_utterance = utterance

      utterance.onstart = () => {
        if (this._activeId === trackId) {
          this._setState(AUDIO_STATE.PLAYING, trackId, { provider: 'browser_speech', voice: voice.name })
        }
      }

      utterance.onend = () => {
        if (this._activeId === trackId) {
          this._activeUtterance = null
          window.__bharatlingo_active_utterance = null
          this._setState(AUDIO_STATE.COMPLETED, trackId, { provider: 'browser_speech' })
          if (onEnd) onEnd({ success: true, provider: 'browser_speech' })
        }
        resolve({ success: true, provider: 'browser_speech', voice: voice.name })
      }

      utterance.onerror = (e) => {
        this._activeUtterance = null
        window.__bharatlingo_active_utterance = null
        if (e.error === 'interrupted' || e.error === 'canceled') {
          if (this._activeId === trackId) {
            this._setState(AUDIO_STATE.IDLE, trackId)
            if (onEnd) onEnd({ success: true, reason: e.error })
          }
          resolve({ success: true, reason: e.error })
        } else {
          if (this._activeId === trackId) {
            this._setState(AUDIO_STATE.ERROR, trackId, { error: e.error })
            if (onEnd) onEnd({ success: false, error: e.error })
          }
          reject(new Error(`SpeechSynthesis error: ${e.error}`))
        }
      }

      window.speechSynthesis.speak(utterance)

      // Watchdog timer to recover if browser speech engine hangs
      const startTime = Date.now()
      this._watchdog = setInterval(() => {
        if (this._currentState === AUDIO_STATE.PLAYING) {
          clearInterval(this._watchdog)
          this._watchdog = null
          return
        }
        if (Date.now() - startTime > 1600 && this._currentState === AUDIO_STATE.LOADING) {
          try {
            window.speechSynthesis.pause()
            window.speechSynthesis.resume()
          } catch {}
        }
        if (Date.now() - startTime > 4500) {
          if (this._watchdog) {
            clearInterval(this._watchdog)
            this._watchdog = null
          }
          if (this._currentState === AUDIO_STATE.LOADING && this._activeId === trackId) {
            this._setState(AUDIO_STATE.ERROR, trackId, { error: 'Speech synthesis timeout' })
            reject(new Error('Speech synthesis timeout'))
          }
        }
      }, 250)
    })
  }

  // ── Unified Speak Command (Robust Server /api/tts with Direct & Browser Fallbacks) ──
  async speak(text, langId = 'hi', { rate = 0.9, pitch = 1.0, onEnd } = {}) {
    if (!text || !text.trim()) {
      this._setState(AUDIO_STATE.ERROR, null, { error: 'No text provided' })
      return { success: false, reason: 'no_text' }
    }

    const cleanText = text.trim()
    const cleanLang = (langId || 'hi').toLowerCase()
    const trackId = `${cleanLang}:${cleanText}`

    // Stop any currently playing audio immediately (Single Authoritative Playback)
    this.stop()

    this._activeId = trackId
    this._setState(AUDIO_STATE.LOADING, trackId)

    // Tier 1: Primary Server / Middleware Indic-TTS API (/api/tts with Disk/Memory Caching)
    try {
      const result = await this._playViaIndicTts(cleanText, cleanLang, rate, trackId, onEnd)
      return { success: true, provider: result.provider }
    } catch (indicErr) {
      if (import.meta.env?.DEV) {
        console.warn(`[TTS] Backend /api/tts failed (${indicErr.message}). Attempting Direct Indic Cloud Audio...`)
      }

      // Tier 2: Direct High-Fidelity Indic Cloud Audio Stream
      try {
        const directResult = await this._playViaDirectIndicAudio(cleanText, cleanLang, rate, trackId, onEnd)
        return { success: true, provider: directResult.provider }
      } catch (directErr) {
        if (import.meta.env?.DEV) {
          console.warn(`[TTS] Direct Indic stream failed (${directErr.message}). Attempting Browser Speech fallback...`)
        }

        // Tier 3: Strict Native Browser SpeechSynthesis Fallback
        try {
          const fallbackResult = await this._playViaBrowserSpeech(cleanText, cleanLang, rate, pitch, trackId, onEnd)
          return { success: true, provider: fallbackResult.provider, voice: fallbackResult.voice }
        } catch (browserErr) {
          if (import.meta.env?.DEV) {
            console.error('[TTS] All TTS tiers failed:', browserErr.message)
          }

          // Safety Audio Cue: Play subtle tone so user gets instant audible feedback
          try {
            playWebAudioChime(true)
          } catch {}

          if (this._activeId === trackId) {
            this._setState(AUDIO_STATE.ERROR, trackId, {
              error: browserErr.message || 'Audio synthesis unavailable',
              canRetry: true,
            })
            if (onEnd) onEnd({ success: false, reason: browserErr.message })
          }

          return {
            success: false,
            reason: browserErr.message || 'audio_unavailable',
            canRetry: true,
          }
        }
      }
    }
  }

  // ── Slow Speech (0.55x) ───────────────────────────────────────────────────
  async speakSlow(text, langId = 'hi', opts = {}) {
    return this.speak(text, langId, { ...opts, rate: 0.55 })
  }

  // ── Audio Preloading ──────────────────────────────────────────────────────
  async preload(text, langId = 'hi', rate = 0.9) {
    if (!text || !text.trim()) return
    const cleanText = text.trim()
    const cleanLang = (langId || 'hi').toLowerCase()

    if (audioCache.has(cleanLang, cleanText, rate)) return

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanText, language: cleanLang, rate }),
      })
      if (response.ok) {
        const blob = await response.blob()
        if (blob && blob.size > 40) {
          const url = URL.createObjectURL(blob)
          audioCache.set(cleanLang, cleanText, rate, url)
        }
      }
    } catch {}
  }
}

// ── Singleton export ──────────────────────────────────────────────────────────
export const ttsService = new CentralAudioService()

// ── Web Audio Chime Synthesizer ───────────────────────────────────────────────
function playWebAudioChime(isSuccess = true) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {})
    }
    const now = ctx.currentTime

    if (isSuccess) {
      const osc1 = ctx.createOscillator()
      const osc2 = ctx.createOscillator()
      const gain = ctx.createGain()

      osc1.type = 'sine'
      osc2.type = 'sine'
      osc1.frequency.setValueAtTime(523.25, now) // C5
      osc1.frequency.setValueAtTime(783.99, now + 0.08) // G5
      osc2.frequency.setValueAtTime(659.25, now + 0.08) // E5

      gain.gain.setValueAtTime(0.18, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45)

      osc1.connect(gain)
      osc2.connect(gain)
      gain.connect(ctx.destination)

      osc1.start(now)
      osc2.start(now + 0.08)
      osc1.stop(now + 0.45)
      osc2.stop(now + 0.45)
    } else {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(220, now) // A3
      osc.frequency.setValueAtTime(164.81, now + 0.1) // E3
      gain.gain.setValueAtTime(0.15, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.35)
    }
  } catch (e) {
    // Web Audio blocked or unsupported
  }
}

// ── Unified AudioService API ──────────────────────────────────────────────────
export const AudioService = {
  speak: (text, langId = 'hi', opts = {}) => ttsService.speak(text, langId, opts),
  speakSlow: (text, langId = 'hi', opts = {}) => ttsService.speakSlow(text, langId, opts),
  stop: () => ttsService.stop(),
  getState: () => ttsService.getState(),
  getActiveId: () => ttsService.getActiveId(),
  isSupported: () => ttsService.isSupported(),
  subscribe: (fn) => ttsService.subscribe(fn),
  playChime: (isSuccess = true) => playWebAudioChime(isSuccess),
  preload: (text, langId = 'hi', rate = 0.9) => ttsService.preload(text, langId, rate),
}

export function speakText(text, langId = 'hi', onEnd = null) {
  return ttsService.speak(text, langId, { onEnd: onEnd ? () => onEnd() : undefined })
}

export default AudioService
