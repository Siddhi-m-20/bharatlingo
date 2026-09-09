// Optional Indic NLP adapters. Curated lessons remain usable when no model
// service is configured.
const INDICXLIT_URL = process.env.INDICXLIT_URL
const MAX_TEXT_LENGTH = 1000

export const supportedLanguageIds = new Set(['en', 'hi', 'mr', 'ta', 'te', 'bn', 'pa', 'gu'])

const scriptMatchers = [
  { script: 'Devanagari', languages: ['hi', 'mr'], pattern: /[\u0900-\u097F]/u },
  { script: 'Tamil', languages: ['ta'], pattern: /[\u0B80-\u0BFF]/u },
  { script: 'Telugu', languages: ['te'], pattern: /[\u0C00-\u0C7F]/u },
  { script: 'Bengali', languages: ['bn'], pattern: /[\u0980-\u09FF]/u },
  { script: 'Gurmukhi', languages: ['pa'], pattern: /[\u0A00-\u0A7F]/u },
  { script: 'Gujarati', languages: ['gu'], pattern: /[\u0A80-\u0AFF]/u },
  { script: 'Latin', languages: ['en'], pattern: /[A-Za-z]/u },
]

function assertValidText(text) {
  if (typeof text !== 'string' || !text.trim()) throw new Error('Text is required')
  if (text.length > MAX_TEXT_LENGTH) throw new Error(`Text must be ${MAX_TEXT_LENGTH} characters or fewer`)
}

export function identifyLanguage(text) {
  assertValidText(text)
  const match = scriptMatchers.find((entry) => entry.pattern.test(text))
  if (!match) return { script: 'Unknown', candidates: [], confidence: 'none', source: 'rule-based' }
  return {
    script: match.script,
    candidates: match.languages,
    confidence: match.languages.length === 1 ? 'high' : 'script-only',
    source: 'rule-based',
  }
}

export async function transliterateText({ text, source, target, direction = 'roman-to-native' }) {
  assertValidText(text)
  if (!supportedLanguageIds.has(source) || !supportedLanguageIds.has(target)) throw new Error('Unsupported source or target language')
  if (!['roman-to-native', 'native-to-roman'].includes(direction)) throw new Error('Direction must be roman-to-native or native-to-roman')

  if (INDICXLIT_URL) {
    try {
      const response = await fetch(`${INDICXLIT_URL.replace(/\/$/, '')}/transliterate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, source, target, direction }), signal: AbortSignal.timeout(4000),
      })
      if (response.ok) {
        const data = await response.json()
        const transliteratedText = data.transliteratedText || data.text || data.output
        if (typeof transliteratedText === 'string' && transliteratedText.trim()) return { transliteratedText, source: 'indicxlit' }
      }
    } catch (error) {
      console.warn('IndicXlit adapter unavailable; using safe fallback:', error.message)
    }
  }

  return { transliteratedText: text, source: 'unavailable', note: 'Configure INDICXLIT_URL with a compatible IndicXlit adapter to enable model transliteration.' }
}

export const indicNlpCapabilities = () => ({
  transliteration: Boolean(INDICXLIT_URL),
  languageIdentification: 'rule-based script detection',
  handwritingFeedback: 'planned — canonical stroke data only',
})
