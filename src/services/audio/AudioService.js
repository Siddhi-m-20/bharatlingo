/**
 * AudioService — Central audio state machine for BharatLingo
 *
 * States: idle | loading | playing | paused | completed | error | unsupported
 *
 * All TTS goes through this service. Never scatter speechSynthesis.speak() in components.
 */

// ── Voice locale priority map ───────────────────────────────────────────────
export const voiceLocales = {
  en:  ['en-IN', 'en-US', 'en-GB', 'en-AU'],
  hi:  ['hi-IN'],
  mr:  ['mr-IN', 'hi-IN'],
  ta:  ['ta-IN'],
  te:  ['te-IN'],
  bn:  ['bn-IN', 'hi-IN'],
  pa:  ['pa-IN', 'hi-IN'],
  gu:  ['gu-IN', 'hi-IN'],
  raj: ['hi-IN'],
}

// ── Audio states ─────────────────────────────────────────────────────────────
export const AUDIO_STATE = {
  IDLE:        'idle',
  LOADING:     'loading',
  PLAYING:     'playing',
  PAUSED:      'paused',
  COMPLETED:   'completed',
  ERROR:       'error',
  UNSUPPORTED: 'unsupported',
}

// ── Simple LRU audio cache (key → result metadata) ──────────────────────────
class AudioCache {
  constructor(maxSize = 50) {
    this._map = new Map()
    this._max = maxSize
  }

  key(langId, locale, text) {
    return `${langId}:${locale}:${text}`
  }

  has(langId, locale, text) {
    return this._map.has(this.key(langId, locale, text))
  }

  get(langId, locale, text) {
    return this._map.get(this.key(langId, locale, text))
  }

  set(langId, locale, text, value) {
    const k = this.key(langId, locale, text)
    if (this._map.size >= this._max) {
      // Evict oldest
      const firstKey = this._map.keys().next().value
      this._map.delete(firstKey)
    }
    this._map.set(k, value)
  }
}

export const audioCache = new AudioCache()

// ── TTSService (BrowserTTSProvider) ─────────────────────────────────────────
class TTSService {
  constructor() {
    this._supported = typeof window !== 'undefined' && 'speechSynthesis' in window
    this._voicesLoaded = false
    this._voices = []
    this._listeners = new Set()
    this._currentState = AUDIO_STATE.IDLE
    this._currentUtterance = null

    if (this._supported) {
      this._initVoices()
    }
  }

  // ── Voice initialisation ──────────────────────────────────────────────────
  _initVoices() {
    const load = () => {
      this._voices = window.speechSynthesis.getVoices()
      if (this._voices.length > 0) {
        this._voicesLoaded = true
        if (import.meta.env.DEV) {
          console.log('[TTS] Voices loaded:', this._voices.length)
        }
      }
    }

    load()

    // voiceschanged fires when the browser finishes loading its voice list
    window.speechSynthesis.addEventListener('voiceschanged', () => {
      load()
    })
  }

  // ── Fetch voices, waiting for voiceschanged if not yet loaded ─────────────
  async _getVoices() {
    if (this._voicesLoaded && this._voices.length > 0) return this._voices

    return new Promise((resolve) => {
      const voices = window.speechSynthesis.getVoices()
      if (voices.length > 0) {
        this._voices = voices
        this._voicesLoaded = true
        resolve(voices)
        return
      }

      const onChanged = () => {
        const v = window.speechSynthesis.getVoices()
        this._voices = v
        this._voicesLoaded = true
        window.speechSynthesis.removeEventListener('voiceschanged', onChanged)
        resolve(v)
      }
      window.speechSynthesis.addEventListener('voiceschanged', onChanged)

      // Timeout fallback: after 3s resolve with whatever we have
      setTimeout(() => {
        window.speechSynthesis.removeEventListener('voiceschanged', onChanged)
        this._voicesLoaded = true
        resolve(window.speechSynthesis.getVoices())
      }, 3000)
    })
  }

  // ── Select best available voice for a language ───────────────────────────
  getBestVoice(langId, voices) {
    const priorities = voiceLocales[langId] || voiceLocales['hi']

    for (const locale of priorities) {
      // Exact locale match
      const exact = voices.find(
        (v) => v.lang.toLowerCase() === locale.toLowerCase()
      )
      if (exact) return { voice: exact, locale, isFallback: locale !== priorities[0] }

      // Prefix match (e.g. "hi" matches "hi-IN")
      const prefix = voices.find(
        (v) => v.lang.toLowerCase().startsWith(locale.split('-')[0].toLowerCase())
      )
      if (prefix) return { voice: prefix, locale: prefix.lang, isFallback: true }
    }

    // Ultimate fallback: any available voice
    if (voices.length > 0) return { voice: voices[0], locale: voices[0].lang, isFallback: true }
    return { voice: null, locale: priorities[0], isFallback: true }
  }

  // ── State management ──────────────────────────────────────────────────────
  _setState(state) {
    this._currentState = state
    this._listeners.forEach((fn) => fn(state))
  }

  subscribe(fn) {
    this._listeners.add(fn)
    return () => this._listeners.delete(fn)
  }

  getState() {
    return this._currentState
  }

  // ── Main speak function ───────────────────────────────────────────────────
  async speak(text, langId = 'hi', { rate = 0.88, pitch = 1.0, onEnd } = {}) {
    if (!this._supported) {
      this._setState(AUDIO_STATE.UNSUPPORTED)
      return { success: false, reason: 'unsupported' }
    }

    if (!text || !text.trim()) {
      this._setState(AUDIO_STATE.ERROR)
      return { success: false, reason: 'no_text' }
    }

    // Cancel any ongoing speech
    this.stop()

    this._setState(AUDIO_STATE.LOADING)

    try {
      const voices = await this._getVoices()
      const { voice, locale, isFallback } = this.getBestVoice(langId, voices)

      const Utterance = window.SpeechSynthesisUtterance
      if (!Utterance) {
        throw new Error('Speech synthesis is unavailable in this browser')
      }
      const utterance = new Utterance(text)
      utterance.lang = locale
      utterance.rate = rate
      utterance.pitch = pitch

      if (voice) {
        utterance.voice = voice
      }

      if (import.meta.env.DEV) {
        if (isFallback) {
          console.warn(`[TTS] language: ${locale} | provider: BrowserSpeech | voice: ${voice?.name || 'none'} | status: fallback`)
        } else {
          console.log(`[TTS] language: ${locale} | provider: BrowserSpeech | voice: ${voice?.name} | status: playing`)
        }
      }

      this._currentUtterance = utterance

      utterance.onstart = () => {
        this._setState(AUDIO_STATE.PLAYING)
      }

      utterance.onend = () => {
        this._currentUtterance = null
        this._setState(AUDIO_STATE.COMPLETED)
        if (onEnd) onEnd({ success: true, isFallback })
      }

      utterance.onerror = (e) => {
        this._currentUtterance = null
        if (import.meta.env.DEV) {
          console.error(`[TTS ERROR] language: ${locale} | reason: ${e.error}`)
        }
        // 'interrupted' is not a real error - user cancelled
        if (e.error === 'interrupted' || e.error === 'canceled') {
          this._setState(AUDIO_STATE.IDLE)
        } else {
          this._setState(AUDIO_STATE.ERROR)
        }
        if (onEnd) onEnd({ success: false, reason: e.error })
      }

      window.speechSynthesis.speak(utterance)

      // Chrome/Edge bug: speechSynthesis can get stuck on long texts
      // Watchdog: if still loading after 1.5s, try to restart
      const startTime = Date.now()
      const watchdog = setInterval(() => {
        if (this._currentState === AUDIO_STATE.PLAYING) {
          clearInterval(watchdog)
          return
        }
        if (Date.now() - startTime > 1500 && this._currentState === AUDIO_STATE.LOADING) {
          // Chrome stuck bug - pause/resume trick
          window.speechSynthesis.pause()
          window.speechSynthesis.resume()
        }
        if (Date.now() - startTime > 4000) {
          clearInterval(watchdog)
          if (this._currentState === AUDIO_STATE.LOADING) {
            this._setState(AUDIO_STATE.ERROR)
          }
        }
      }, 250)

      return { success: true, isFallback, voice: voice?.name, locale }
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('[TTS ERROR]', err)
      }
      this._setState(AUDIO_STATE.ERROR)
      return { success: false, reason: err.message }
    }
  }

  // ── Slow speech (0.55x) ───────────────────────────────────────────────────
  async speakSlow(text, langId = 'hi', opts = {}) {
    return this.speak(text, langId, { ...opts, rate: 0.55 })
  }

  // ── Stop ──────────────────────────────────────────────────────────────────
  stop() {
    if (this._supported) {
      window.speechSynthesis.cancel()
    }
    this._currentUtterance = null
    if (
      this._currentState === AUDIO_STATE.PLAYING ||
      this._currentState === AUDIO_STATE.LOADING
    ) {
      this._setState(AUDIO_STATE.IDLE)
    }
  }

  isSupported() {
    return this._supported
  }
}

// ── Singleton export ──────────────────────────────────────────────────────────
export const ttsService = new TTSService()

// ── Convenience re-export for backward compat ─────────────────────────────────
export function speakText(text, langId = 'hi', onEnd = null) {
  return ttsService.speak(text, langId, { onEnd: onEnd ? () => onEnd() : undefined })
}
