export const languages = [
  {
    id: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    voiceCode: 'hi-IN',
  },
  {
    id: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    voiceCode: 'en-US',
  },
  {
    id: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    flag: '🇮🇳',
    voiceCode: 'mr-IN',
  },
  {
    id: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    flag: '🇮🇳',
    voiceCode: 'ta-IN',
  },
  {
    id: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    flag: '🇮🇳',
    voiceCode: 'te-IN',
  },
  {
    id: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    flag: '🇮🇳',
    voiceCode: 'bn-IN',
  },
  {
    id: 'pa',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    flag: '🇮🇳',
    voiceCode: 'pa-IN',
  },
  {
    id: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    flag: '🇮🇳',
    voiceCode: 'gu-IN',
  },
]

export const LANGUAGE_GREETINGS = {
  hi: {
    greeting: 'नमस्ते',
    transliteration: 'Namaste',
    meaning: 'Hello',
    languageName: 'Hindi',
    nativeName: 'हिन्दी',
  },
  mr: {
    greeting: 'नमस्कार',
    transliteration: 'Namaskar',
    meaning: 'Hello',
    languageName: 'Marathi',
    nativeName: 'मराठी',
  },
  ta: {
    greeting: 'வணக்கம்',
    transliteration: 'Vanakkam',
    meaning: 'Hello',
    languageName: 'Tamil',
    nativeName: 'தமிழ்',
  },
  te: {
    greeting: 'నమస్కారం',
    transliteration: 'Namaskaram',
    meaning: 'Hello',
    languageName: 'Telugu',
    nativeName: 'తెలుగు',
  },
  bn: {
    greeting: 'নমস্কার',
    transliteration: 'Nomoshkar',
    meaning: 'Hello',
    languageName: 'Bengali',
    nativeName: 'বাংলা',
  },
  pa: {
    greeting: 'ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ',
    transliteration: 'Sat Sri Akal',
    meaning: 'Hello / Greetings',
    languageName: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
  },
  gu: {
    greeting: 'નમસ્તે',
    transliteration: 'Namaste',
    meaning: 'Hello',
    languageName: 'Gujarati',
    nativeName: 'ગુજરાતી',
  },
  en: {
    greeting: 'Hello',
    transliteration: 'Hello',
    meaning: 'Hello',
    languageName: 'English',
    nativeName: 'English',
  },
}

export const getLanguageById = (id) => languages.find(lang => lang.id === id)
export const getGreetingByLanguageId = (id) => LANGUAGE_GREETINGS[id] || LANGUAGE_GREETINGS.hi
export const supportedLanguages = languages
export const TOTAL_LANGUAGES_COUNT = languages.length
export default languages

