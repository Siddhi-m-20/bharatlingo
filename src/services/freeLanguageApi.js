/**
 * Free Language APIs Service for BharatLingo
 * 
 * APIs Utilized (100% Free, Zero API Keys Required):
 * 1. MyMemory Translation API (https://api.mymemory.translated.net/get)
 *    - Used for live sentence and phrase translations across all Indian languages.
 * 2. Wikimedia / Wiktionary REST API (https://en.wiktionary.org/api/rest_v1/page/definition)
 *    - Used for lexical word lookup, parts of speech, and dictionary definitions.
 * 3. Web Speech API (window.speechSynthesis & webkitSpeechRecognition)
 *    - Used for client-side Indian language Text-To-Speech and voice input scoring.
 * 4. DiceBear Avatars API (https://api.dicebear.com/7.x)
 *    - Used for generated avatars in leaderboards and user profiles.
 */

// Language ISO map for MyMemory Translation API
const myMemoryLangMap = {
  hi: 'hi',
  mr: 'mr',
  ta: 'ta',
  te: 'te',
  bn: 'bn',
  pa: 'pa',
  gu: 'gu',
  en: 'en',
}

/**
 * 1. Live Translation using MyMemory Free API
 * @param {string} text - text to translate
 * @param {string} fromLang - source language code
 * @param {string} toLang - target language code
 */
export async function translateTextLive(text, fromLang = 'en', toLang = 'hi') {
  if (!text || !text.trim()) return text

  const src = myMemoryLangMap[fromLang] || 'en'
  const tgt = myMemoryLangMap[toLang] || 'hi'

  if (src === tgt) return text

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.trim())}&langpair=${src}|${tgt}`
    const response = await fetch(url)
    if (!response.ok) throw new Error('Translation network error')

    const data = await response.json()
    if (data && data.responseData && data.responseData.translatedText) {
      return {
        translatedText: data.responseData.translatedText,
        matchScore: data.responseData.match || 1,
        provider: 'MyMemory Free Translation API',
      }
    }
  } catch (err) {
    console.warn('MyMemory Translation API fallback:', err)
  }

  return {
    translatedText: text,
    matchScore: 0,
    provider: 'Local Dictionary Fallback',
  }
}

/**
 * 2. Dictionary Definition Lookup using Wiktionary API
 * @param {string} word - word to lookup
 */
export async function lookupWordDefinition(word) {
  if (!word || !word.trim()) return null

  try {
    const url = `https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(word.trim().toLowerCase())}`
    const response = await fetch(url)
    if (!response.ok) return null

    const data = await response.json()
    return {
      definitions: data,
      provider: 'Wiktionary Public API',
    }
  } catch (err) {
    return null
  }
}

/**
 * Documentation of all external APIs utilized in BharatLingo
 */
export const API_CATALOGUE = [
  {
    name: 'MyMemory Open Translation API',
    url: 'https://api.mymemory.translated.net',
    description: 'Free neural and statistical translation for Indian languages (Hindi, Marathi, Tamil, Telugu, Bengali, Punjabi, Gujarati).',
    usageLocation: 'Practice Arena Live AI Translator widget & Question verification',
    isFree: true,
  },
  {
    name: 'Wiktionary REST API',
    url: 'https://en.wiktionary.org/api/rest_v1',
    description: 'Public open-content multilingual dictionary definitions.',
    usageLocation: 'Vocabulary Explorer & Word Details',
    isFree: true,
  },
  {
    name: 'Open Indic-TTS Engine',
    url: 'Self-Hosted / Open-Source Indic-TTS API (/api/tts)',
    description: 'Server & local neural text-to-speech engine optimized for 8 supported languages with audio caching.',
    usageLocation: 'Lesson Audio Player, Listening exercises, Vocabulary charts, and Alphabet sounds',
    isFree: true,
  },
  {
    name: 'Web Speech Synthesis API (Fallback)',
    url: 'Native W3C Browser API',
    description: 'Secondary client fallback text-to-speech strictly filtered by native Indian voice locales.',
    usageLocation: 'Offline TTS Fallback',
    isFree: true,
  },
  {
    name: 'Web Speech Recognition API',
    url: 'Native W3C Browser API',
    description: 'Speech-to-text voice recognition for interactive speaking practice.',
    usageLocation: 'Speaking Exercise microphone evaluation',
    isFree: true,
  },
  {
    name: 'DiceBear Avatar API',
    url: 'https://api.dicebear.com',
    description: 'Vector avatar generator for learner profiles and leaderboard players.',
    usageLocation: 'Leaderboard rankings and Profile screens',
    isFree: true,
  },
]
