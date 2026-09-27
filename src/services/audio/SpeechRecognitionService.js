/**
 * SpeechRecognitionService — Speech-to-text for speaking exercises
 *
 * Priority:
 *   1. Browser SpeechRecognition (webkitSpeechRecognition / SpeechRecognition)
 *   2. Manual fallback (shows pronunciation guide)
 *
 * Recording states: idle | requesting | recording | processing | result | error | unsupported
 */

import { voiceLocales } from './AudioService.js'

export const REC_STATE = {
  IDLE:        'idle',
  REQUESTING:  'requesting',
  RECORDING:   'recording',
  PROCESSING:  'processing',
  RESULT:      'result',
  ERROR:       'error',
  UNSUPPORTED: 'unsupported',
}

// ── Text normalization for Indic scripts ──────────────────────────────────────
export function normalizeText(text) {
  if (!text) return ''
  return text
    .trim()
    // Normalize Unicode (NFC)
    .normalize('NFC')
    // Remove common punctuation (but NOT Indic characters)
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?'"।॥]/g, '')
    // Collapse whitespace
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

// ── Token similarity ──────────────────────────────────────────────────────────
function tokenSimilarity(a, b) {
  const tokensA = new Set(a.split(' ').filter(Boolean))
  const tokensB = new Set(b.split(' ').filter(Boolean))
  if (tokensA.size === 0 && tokensB.size === 0) return 100
  if (tokensA.size === 0 || tokensB.size === 0) return 0

  let matches = 0
  tokensA.forEach((t) => { if (tokensB.has(t)) matches++ })
  return Math.round((matches / Math.max(tokensA.size, tokensB.size)) * 100)
}

// ── Levenshtein character similarity ─────────────────────────────────────────
function charSimilarity(s1, s2) {
  if (s1 === s2) return 100
  if (!s1 || !s2) return 0

  const len1 = s1.length
  const len2 = s2.length
  const matrix = Array.from({ length: len1 + 1 }, () => Array(len2 + 1).fill(0))

  for (let i = 0; i <= len1; i++) matrix[i][0] = i
  for (let j = 0; j <= len2; j++) matrix[0][j] = j

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      )
    }
  }

  const dist = matrix[len1][len2]
  const maxLen = Math.max(len1, len2)
  return Math.max(0, Math.round(((maxLen - dist) / maxLen) * 100))
}

import { evaluatePronunciation } from './PronunciationScorer.js'

// ── Combined similarity score & Detailed Pronunciation Scorer ────────────────
export function calculateSpeakingScore(recognized, expected) {
  const normR = normalizeText(recognized)
  const normE = normalizeText(expected)

  const detailedEval = evaluatePronunciation(expected, recognized)

  const tokenScore = tokenSimilarity(normR, normE)
  const charScore  = charSimilarity(normR, normE)

  // Use the higher-accuracy composite score
  const score = Math.max(detailedEval.score, Math.round((tokenScore + charScore) / 2))

  let grade
  if (score >= 90)      grade = 'Excellent'
  else if (score >= 75) grade = 'Great'
  else if (score >= 50) grade = 'Keep practicing'
  else                  grade = 'Try again'

  return {
    score,
    grade,
    isMatch: score >= 65,
    normR,
    normE,
    wordResults: detailedEval.wordResults || [],
    wordsToImprove: detailedEval.wordsToImprove || [],
    feedbackMessage: detailedEval.feedbackMessage || grade,
  }
}

// ── SpeechRecognitionService ──────────────────────────────────────────────────
export class SpeechRecognitionService {
  constructor() {
    const SR = typeof window !== 'undefined'
      ? (window.SpeechRecognition || window.webkitSpeechRecognition)
      : null
    this._SR = SR
    this._recognition = null
    this._state = REC_STATE.IDLE
    this._listeners = new Set()
    this._stream = null
  }

  isSupported() {
    return !!this._SR
  }

  getState() {
    return this._state
  }

  _setState(state) {
    this._state = state
    this._listeners.forEach((fn) => fn(state))
  }

  subscribe(fn) {
    this._listeners.add(fn)
    return () => this._listeners.delete(fn)
  }

  // ── Get locale string for language id ────────────────────────────────────
  _getLocale(langId) {
    const locales = voiceLocales[langId]
    if (locales && locales.length > 0) return locales[0]
    return 'hi-IN'
  }

  // ── Start recognition ─────────────────────────────────────────────────────
  start(langId, targetText, { onResult, onError, onStateChange } = {}) {
    if (!this._SR) {
      this._setState(REC_STATE.UNSUPPORTED)
      if (onError) onError({ type: 'unsupported', message: 'Speech recognition is not available in this browser.' })
      return
    }

    // Clean up previous
    this._cleanup()

    this._setState(REC_STATE.REQUESTING)
    if (onStateChange) onStateChange(REC_STATE.REQUESTING)

    try {
      const recognition = new this._SR()
      this._recognition = recognition

      const locale = this._getLocale(langId)
      recognition.lang = locale
      recognition.continuous = false
      recognition.interimResults = false
      recognition.maxAlternatives = 3

      if (import.meta.env?.DEV) {
        console.log(`[ASR] Starting recognition | lang: ${locale} | target: "${targetText}"`)
      }

      recognition.onstart = () => {
        this._setState(REC_STATE.RECORDING)
        if (onStateChange) onStateChange(REC_STATE.RECORDING)
      }

      recognition.onresult = (event) => {
        this._setState(REC_STATE.PROCESSING)
        if (onStateChange) onStateChange(REC_STATE.PROCESSING)

        const transcript = event.results[0][0].transcript
        const confidence = event.results[0][0].confidence ?? 0.8

        const scoring = calculateSpeakingScore(transcript, targetText)

        if (import.meta.env?.DEV) {
          console.log(`[ASR] Recognized: "${transcript}" | score: ${scoring.score}% | match: ${scoring.isMatch}`)
        }

        this._setState(REC_STATE.RESULT)
        if (onStateChange) onStateChange(REC_STATE.RESULT)
        if (onResult) onResult({ transcript, confidence, ...scoring })
      }

      recognition.onerror = (event) => {
        this._cleanup()
        const errorType = event.error

        if (import.meta.env?.DEV) {
          console.error(`[ASR ERROR] ${errorType}`)
        }

        let message
        if (errorType === 'not-allowed' || errorType === 'permission-denied') {
          message = 'Microphone permission was denied. Allow microphone access in your browser settings and try again.'
          this._setState(REC_STATE.ERROR)
        } else if (errorType === 'no-speech') {
          message = 'No speech detected. Please try speaking more clearly.'
          this._setState(REC_STATE.ERROR)
        } else if (errorType === 'network') {
          message = 'Speech recognition requires an internet connection.'
          this._setState(REC_STATE.ERROR)
        } else if (errorType === 'aborted') {
          // Intentional stop - not an error
          this._setState(REC_STATE.IDLE)
          return
        } else {
          message = `Speech recognition error: ${errorType}`
          this._setState(REC_STATE.ERROR)
        }

        if (onError) onError({ type: errorType, message, isTechnicalFailure: true })
      }

      recognition.onend = () => {
        if (this._state === REC_STATE.RECORDING) {
          // ended without result (silence)
          this._setState(REC_STATE.ERROR)
          if (onError) onError({
            type: 'no-speech',
            message: 'We couldn\'t hear clearly. Try speaking a little closer to the microphone.',
            isTechnicalFailure: true,
          })
        }
        this._cleanup()
      }

      recognition.start()
    } catch (err) {
      this._setState(REC_STATE.ERROR)
      if (onError) onError({ type: 'error', message: err.message, isTechnicalFailure: true })
    }
  }

  // ── Stop recording ────────────────────────────────────────────────────────
  stop() {
    if (this._recognition) {
      try {
        this._recognition.stop()
      } catch (_) {}
    }
    if (this._state === REC_STATE.RECORDING || this._state === REC_STATE.REQUESTING) {
      this._setState(REC_STATE.IDLE)
    }
  }

  stopRecording() {
    return this.stop()
  }

  stopListening() {
    return this.stop()
  }

  // ── Flexible start methods ────────────────────────────────────────────────
  startRecording(langId, arg2, arg3) {
    let callbacks = {}
    let targetText = ''
    if (typeof arg2 === 'string') {
      targetText = arg2
      callbacks = arg3 || {}
    } else if (typeof arg2 === 'object' && arg2 !== null) {
      callbacks = arg2
      targetText = typeof arg3 === 'string' ? arg3 : ''
    }
    return this.start(langId, targetText, callbacks)
  }

  startListening(options = {}) {
    const { languageId = 'hi', targetWord = '', onResult, onError, onStateChange } = options
    const wrappedCallbacks = {
      onResult: (res) => {
        if (onResult) {
          onResult(res.transcript, true)
        }
      },
      onError: (err) => {
        if (onError) onError(err)
      },
      onStateChange: (st) => {
        if (onStateChange) onStateChange(st)
      },
    }
    return this.start(languageId, targetWord, wrappedCallbacks)
  }

  // ── Static methods for class consumers (e.g. GameArena.jsx) ───────────────
  static start(langId, targetText, callbacks) {
    return speechRecognitionService.start(langId, targetText, callbacks)
  }

  static startRecording(langId, arg2, arg3) {
    return speechRecognitionService.startRecording(langId, arg2, arg3)
  }

  static startListening(options) {
    return speechRecognitionService.startListening(options)
  }

  static stop() {
    return speechRecognitionService.stop()
  }

  static stopRecording() {
    return speechRecognitionService.stopRecording()
  }

  static stopListening() {
    return speechRecognitionService.stopListening()
  }

  static isSupported() {
    return speechRecognitionService.isSupported()
  }

  // ── Cleanup ───────────────────────────────────────────────────────────────
  _cleanup() {
    if (this._recognition) {
      try {
        this._recognition.onstart = null
        this._recognition.onresult = null
        this._recognition.onerror = null
        this._recognition.onend = null
      } catch (_) {}
      this._recognition = null
    }
    if (this._stream) {
      this._stream.getTracks().forEach((track) => track.stop())
      this._stream = null
    }
  }

  destroy() {
    this.stop()
    this._cleanup()
    this._listeners.clear()
  }
}

export const speechRecognitionService = new SpeechRecognitionService()
