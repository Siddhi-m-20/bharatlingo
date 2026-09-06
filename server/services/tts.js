import crypto from 'crypto'

// In-memory bounded LRU cache (Keeps audio snappy in memory without creating files on disk)
class ServerAudioCache {
  constructor(maxSize = 250) {
    this._map = new Map()
    this._max = maxSize
  }

  get(key) {
    if (!this._map.has(key)) return null
    const val = this._map.get(key)
    this._map.delete(key)
    this._map.set(key, val)
    return val
  }

  set(key, val) {
    if (this._map.size >= this._max) {
      const oldest = this._map.keys().next().value
      this._map.delete(oldest)
    }
    this._map.set(key, val)
  }

  clear() {
    this._map.clear()
  }
}

const memoryCache = new ServerAudioCache(250)

// Language configuration for Indian languages
export const SUPPORTED_LANGUAGES = {
  hi: { name: 'Hindi', code: 'hi-IN', googleCode: 'hi' },
  en: { name: 'English', code: 'en-IN', googleCode: 'en' },
  mr: { name: 'Marathi', code: 'mr-IN', googleCode: 'mr' },
  ta: { name: 'Tamil', code: 'ta-IN', googleCode: 'ta' },
  te: { name: 'Telugu', code: 'te-IN', googleCode: 'te' },
  bn: { name: 'Bengali', code: 'bn-IN', googleCode: 'bn' },
  pa: { name: 'Punjabi', code: 'pa-IN', googleCode: 'pa' },
  gu: { name: 'Gujarati', code: 'gu-IN', googleCode: 'gu' },
  kn: { name: 'Kannada', code: 'kn-IN', googleCode: 'kn' },
  ml: { name: 'Malayalam', code: 'ml-IN', googleCode: 'ml' },
}

/**
 * Generate a deterministic in-memory cache key for text, language and rate
 */
function getCacheKey(text, language = 'hi', rate = 1.0) {
  const normText = text.trim().toLowerCase()
  const hash = crypto.createHash('md5').update(`${language}:${rate}:${normText}`).digest('hex')
  return `${language}_${hash}`
}

/**
 * Synthesize speech via High-Fidelity Indic Cloud Audio Engine (Universal Free Engine)
 */
async function synthesizeViaCloudIndic(text, langConfig) {
  const lang = langConfig.googleCode || 'hi'
  const cleanText = text.trim()

  if (cleanText.length <= 180) {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=${lang}&client=tw-ob`
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://translate.google.com/',
      },
    })

    if (!response.ok) {
      throw new Error(`Cloud Indic TTS returned HTTP ${response.status}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    const audioBuffer = Buffer.from(arrayBuffer)
    if (audioBuffer && audioBuffer.length > 200) {
      return {
        audioBuffer,
        contentType: 'audio/mpeg',
        provider: 'cloud_indic_engine',
      }
    }
  } else {
    // For longer sentences, split by punctuation and concatenate MP3 buffers
    const sentences = cleanText.match(/[^.!?।\n]+[.!?।\n]*/g) || [cleanText]
    const chunks = []

    for (const s of sentences) {
      const trimmed = s.trim()
      if (!trimmed) continue
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(trimmed)}&tl=${lang}&client=tw-ob`
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      })
      if (res.ok) {
        const arr = await res.arrayBuffer()
        chunks.push(Buffer.from(arr))
      }
    }

    if (chunks.length > 0) {
      return {
        audioBuffer: Buffer.concat(chunks),
        contentType: 'audio/mpeg',
        provider: 'cloud_indic_engine',
      }
    }
  }

  throw new Error('Empty or invalid audio stream from Cloud Indic TTS engine')
}

/**
 * Universal Speech Synthesizer (In-Memory LRU Cached, Zero Disk Bloat)
 */
export async function synthesizeSpeech(text, language = 'hi', options = {}) {
  if (!text || !text.trim()) {
    throw new Error('Missing text for speech synthesis')
  }

  const langKey = language.toLowerCase()
  const langConfig = SUPPORTED_LANGUAGES[langKey] || SUPPORTED_LANGUAGES['hi']
  const rate = options.rate || 1.0
  const cacheKey = getCacheKey(text, langKey, rate)

  // 1. Check in-memory cache (Fast & zero disk usage)
  const cachedMem = memoryCache.get(cacheKey)
  if (cachedMem) {
    return {
      audioBuffer: cachedMem.buffer,
      contentType: cachedMem.contentType,
      isCached: true,
      provider: 'memory_cache',
      language: langKey,
    }
  }

  // 2. Synthesize via High-Fidelity Cloud Indic Engine
  const cloudResult = await synthesizeViaCloudIndic(text, langConfig)
  if (cloudResult?.audioBuffer) {
    memoryCache.set(cacheKey, { buffer: cloudResult.audioBuffer, contentType: cloudResult.contentType })
    return {
      ...cloudResult,
      isCached: false,
      language: langKey,
    }
  }

  throw new Error('Failed to generate speech audio stream')
}
