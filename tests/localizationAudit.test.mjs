import { uiTranslations } from '../src/services/uiTranslations.js'

const SUPPORTED_LANGUAGES = ['en', 'hi', 'mr', 'ta', 'te', 'bn', 'pa', 'gu']

console.log('--- BHARATLINGO LOCALIZATION AUDIT SUITE ---')

const keys = Object.keys(uiTranslations)
console.log(`Total Translation Keys: ${keys.length}`)

let missingCount = 0
let emptyCount = 0

keys.forEach(key => {
  const translations = uiTranslations[key] || {}
  SUPPORTED_LANGUAGES.forEach(lang => {
    if (!translations[lang]) {
      console.error(`[MISSING] Key "${key}" is missing language: "${lang}"`)
      missingCount++
    } else if (typeof translations[lang] !== 'string' || translations[lang].trim() === '') {
      console.error(`[EMPTY] Key "${key}" has empty string for language: "${lang}"`)
      emptyCount++
    }
  })
})

if (missingCount === 0 && emptyCount === 0) {
  console.log(`✅ ZERO LEAKS! All ${keys.length} keys populated across all 8 site languages (en, hi, mr, ta, te, bn, pa, gu).`)
  process.exit(0)
} else {
  console.error(`❌ AUDIT FAILED! Found ${missingCount} missing keys and ${emptyCount} empty translations.`)
  process.exit(1)
}
