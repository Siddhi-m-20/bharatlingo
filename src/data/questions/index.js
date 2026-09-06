import { hindiAssessmentQuestions } from './hindi.js'
import { marathiAssessmentQuestions } from './marathi.js'
import { tamilAssessmentQuestions } from './tamil.js'
import { teluguAssessmentQuestions } from './telugu.js'
import { bengaliAssessmentQuestions } from './bengali.js'
import { punjabiAssessmentQuestions } from './punjabi.js'
import { gujaratiAssessmentQuestions } from './gujarati.js'
import { englishAssessmentQuestions } from './english.js'
import { getPromptText, dictionary } from '../translations.js'
import { getLanguageById } from '../languages.js'

export const rawAssessmentQuestions = {
  hi: hindiAssessmentQuestions,
  mr: marathiAssessmentQuestions,
  ta: tamilAssessmentQuestions,
  te: teluguAssessmentQuestions,
  bn: bengaliAssessmentQuestions,
  pa: punjabiAssessmentQuestions,
  gu: gujaratiAssessmentQuestions,
  en: englishAssessmentQuestions,
}

function translateAssessmentMeaning(meaning, preferredLang) {
  if (!meaning || preferredLang === 'en') return meaning
  const clean = meaning.split('/')[0].trim().toLowerCase()
  const entry = dictionary.find((d) => {
    const enVal = d.translations['en']?.toLowerCase()
    return enVal === clean || enVal?.includes(clean) || clean.includes(enVal)
  })
  if (entry && entry.translations[preferredLang]) {
    return entry.translations[preferredLang]
  }
  return meaning
}

export const getAssessmentQuestions = (languageId, preferredLangId = 'en') => {
  const rawQuestions = rawAssessmentQuestions[languageId] || []
  const targetLang = getLanguageById(languageId) || { name: languageId }
  const targetLangName = targetLang.nativeName || targetLang.name

  return rawQuestions.map((q) => {
    const localized = { ...q }
    if (q.type === 'multiple-choice') {
      const match = q.prompt.match(/["'](.*?)["']/)
      const word = match ? match[1] : ''
      if (word) {
        localized.prompt = getPromptText('meaning', preferredLangId, targetLangName, word)
      }
      if (q.options && preferredLangId !== 'en') {
        localized.options = q.options.map((opt) => translateAssessmentMeaning(opt, preferredLangId))
        localized.correctAnswer = translateAssessmentMeaning(q.correctAnswer, preferredLangId)
      }
    } else if (q.type === 'translation') {
      const match = q.prompt.match(/["'](.*?)["']/)
      const word = match ? match[1] : ''
      const translatedSource = translateAssessmentMeaning(word, preferredLangId)
      localized.prompt = getPromptText('translate_to_target', preferredLangId, targetLangName, translatedSource)
    } else if (q.type === 'listening') {
      localized.prompt = getPromptText('listening', preferredLangId, targetLangName)
    }
    return localized
  })
}
