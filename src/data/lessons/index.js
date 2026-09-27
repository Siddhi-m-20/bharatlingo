import { hindiLessons } from './hindi.js'
import { marathiLessons } from './marathi.js'
import { tamilLessons } from './tamil.js'
import { teluguLessons } from './telugu.js'
import { bengaliLessons } from './bengali.js'
import { punjabiLessons } from './punjabi.js'
import { gujaratiLessons } from './gujarati.js'
import { englishLessons } from './english.js'
import { createComprehensiveFoundationLessons } from './comprehensiveFoundation.js'
import {
  getPromptText,
  getTranslation,
  dictionary,
  targetNameMap,
  digitToLanguageWord,
  sanitizeLanguageOptions,
} from '../translations.js'
import { getLanguageById } from '../languages.js'

export const rawLessonsByLanguage = {
  hi: [...hindiLessons, ...createComprehensiveFoundationLessons('hi', 'Hindi')],
  mr: [...marathiLessons, ...createComprehensiveFoundationLessons('mr', 'Marathi')],
  ta: [...tamilLessons, ...createComprehensiveFoundationLessons('ta', 'Tamil')],
  te: [...teluguLessons, ...createComprehensiveFoundationLessons('te', 'Telugu')],
  bn: [...bengaliLessons, ...createComprehensiveFoundationLessons('bn', 'Bengali')],
  pa: [...punjabiLessons, ...createComprehensiveFoundationLessons('pa', 'Punjabi')],
  gu: [...gujaratiLessons, ...createComprehensiveFoundationLessons('gu', 'Gujarati')],
  en: [...englishLessons, ...createComprehensiveFoundationLessons('en', 'English')],
}

// Build cross-lingual index from rawLessonsByLanguage
const crossLingualVocabMap = {}

function buildCrossLingualVocabIndex() {
  if (Object.keys(crossLingualVocabMap).length > 0) return
  for (const [langId, lessons] of Object.entries(rawLessonsByLanguage)) {
    for (const l of lessons) {
      if (!l.vocabulary) continue
      for (const v of l.vocabulary) {
        if (!v.word || !v.translation) continue
        const rawEn = String(v.translation).trim().toLowerCase()
        const parts = rawEn.split('/').map((s) => s.trim().toLowerCase())
        const keys = [rawEn, ...parts]
        for (const k of keys) {
          if (!k) continue
          if (!crossLingualVocabMap[k]) crossLingualVocabMap[k] = {}
          if (!crossLingualVocabMap[k][langId]) {
            crossLingualVocabMap[k][langId] = v.word
          }
        }
      }
    }
  }
}

// Find translation of an English meaning into preferred language
export function translateMeaning(meaning, preferredLang) {
  if (!meaning || preferredLang === 'en') return meaning
  buildCrossLingualVocabIndex()

  const raw = String(meaning).trim()
  const lower = raw.toLowerCase()
  const cleanMeaning = lower.split('/')[0].trim()

  // 1. Direct dictionary match
  const entry = dictionary.find((d) => {
    const enVal = d.translations['en']?.toLowerCase()
    if (!enVal) return false
    return enVal === lower || enVal === cleanMeaning || enVal.includes(cleanMeaning) || lower.includes(enVal)
  })
  if (entry && entry.translations[preferredLang]) {
    return entry.translations[preferredLang]
  }

  // 2. Cross-lingual curriculum lookup
  if (crossLingualVocabMap[lower]?.[preferredLang]) {
    return crossLingualVocabMap[lower][preferredLang]
  }
  if (crossLingualVocabMap[cleanMeaning]?.[preferredLang]) {
    return crossLingualVocabMap[cleanMeaning][preferredLang]
  }

  // 3. Substring match in crossLingualVocabMap
  for (const [key, langMap] of Object.entries(crossLingualVocabMap)) {
    if (key.includes(cleanMeaning) || cleanMeaning.includes(key)) {
      if (langMap[preferredLang]) return langMap[preferredLang]
    }
  }

  return meaning
}

// Transform lesson data based on user's preferred language
export function localizeLesson(lesson, targetLangId, preferredLangId = 'en') {
  if (!lesson) return null
  const targetLang = getLanguageById(targetLangId) || { name: targetLangId }
  const targetLangName = targetLang.nativeName || targetLang.name

  // Localize vocabulary
  const localizedVocabulary = (lesson.vocabulary || []).map((v) => {
    const localizedTranslation = translateMeaning(v.translation, preferredLangId)
    return {
      ...v,
      translation: localizedTranslation,
      originalEnglish: v.translation,
    }
  })

  // Localize exercises
  const localizedExercises = (lesson.exercises || []).map((ex, idx) => {
    const localized = { ...ex }

    // Add speaking exercise dynamically if not present
    if (idx === 1 && !lesson.exercises.some((e) => e.type === 'speaking')) {
      const vocabWord = localizedVocabulary[0] || { word: 'नमस्ते', pronunciation: 'namaste' }
      localized.speakingBonus = {
        type: 'speaking',
        prompt: getPromptText('speaking', preferredLangId, targetLangName, vocabWord.word),
        targetWord: vocabWord.word,
        pronunciation: vocabWord.pronunciation,
        correctAnswer: vocabWord.word,
        xp: 15,
      }
    }

    if (ex.type === 'multiple-choice' || ex.type === 'picture_choice' || ex.type === 'picture-choice' || ex.type === 'visual_match') {
      localized.type = 'multiple-choice'
      const isTargetOptions = (ex.word && ex.correctAnswer === ex.word) || (ex.targetWord && ex.correctAnswer === ex.targetWord)

      if (isTargetOptions) {
        // Options are in target language (e.g. Gujarati: બહેન, માતા, ભાઈ)
        // Prompt asks learner to translate meaning word into target language:
        const rawSource = ex.translation || (ex.prompt && ex.prompt.match(/["'](.*?)["']/)?.[1]) || ''
        const translatedSource = preferredLangId !== 'en' ? translateMeaning(rawSource, preferredLangId) : rawSource
        localized.prompt = getPromptText('translate_to_target', preferredLangId, targetLangName, translatedSource)

        if (ex.options && ex.options.length > 0) {
          localized.options = sanitizeLanguageOptions(ex.options, ex.correctAnswer, targetLangId)
          localized.correctAnswer = ex.correctAnswer
        }
      } else {
        // Options are in learner's preferred language (e.g. Marathi: बहीण, आई, भाऊ)
        // Prompt asks learner what target word means:
        const targetWord = ex.targetWord || ex.word || ''
        if (targetWord) {
          localized.prompt = getPromptText('meaning', preferredLangId, targetLangName, targetWord)
        }

        // Translate options to preferred language and sanitize
        if (ex.options && ex.options.length > 0) {
          const translatedOpts = ex.options.map((opt) => {
            const optStr = typeof opt === 'string' ? opt : opt.text || opt.word || opt.label || ''
            return preferredLangId !== 'en' ? translateMeaning(optStr, preferredLangId) : optStr
          })
          const translatedCorrect = preferredLangId !== 'en'
            ? translateMeaning(ex.correctAnswer, preferredLangId)
            : ex.correctAnswer

          localized.options = sanitizeLanguageOptions(translatedOpts, translatedCorrect, preferredLangId)
          localized.correctAnswer = digitToLanguageWord(translatedCorrect, preferredLangId)
        }
      }
    } else if (ex.type === 'translation') {
      const match = ex.prompt.match(/["'](.*?)["']/)
      const wordToTranslate = match ? match[1] : ''
      const translatedSource = translateMeaning(wordToTranslate, preferredLangId)
      localized.prompt = getPromptText('translate_to_target', preferredLangId, targetLangName, translatedSource)

      // Provide word-bank tiles for better interactivity
      const targetWords = [
        ex.correctAnswer,
        ...(lesson.vocabulary || []).slice(0, 3).map((v) => v.word).filter((w) => w !== ex.correctAnswer),
      ].sort(() => Math.random() - 0.5)

      localized.wordBank = targetWords
    } else if (ex.type === 'listening') {
      localized.prompt = getPromptText('listening', preferredLangId, targetLangName)
      localized.audioText = ex.audioText || ex.audioTarget || ex.correctAnswer
      localized.audioTarget = localized.audioText
    } else if (ex.type === 'speaking') {
      localized.prompt = getPromptText('speaking', preferredLangId, targetLangName, ex.targetWord || ex.correctAnswer)
    } else if (ex.type === 'matching') {
      localized.prompt = getPromptText('matching', preferredLangId, targetLangName)
      if (ex.pairs && preferredLangId !== 'en') {
        localized.pairs = ex.pairs.map((p) => ({
          ...p,
          meaning: translateMeaning(p.meaning, preferredLangId),
        }))
      }
    } else if (ex.type === 'sentence-order') {
      localized.prompt = getPromptText('sentence_order', preferredLangId, targetLangName, ex.sentence || ex.correctAnswer)
    } else if (ex.type === 'fill-blank') {
      const instruction = getPromptText('fill_blank', preferredLangId, targetLangName)
      localized.instruction = instruction
      const blanked = ex.blankedSentence || ex.sentence || (ex.prompt && ex.prompt.includes('___') ? ex.prompt : '')
      if (blanked) {
        localized.blankedSentence = blanked
        localized.sentence = blanked
      }
      localized.prompt = instruction
    } else if (ex.type === 'reading') {
      localized.prompt = getPromptText('reading', preferredLangId, targetLangName)
    }

    return localized
  })

  // Ensure at least one speaking exercise is available in every lesson for rich AI audio interaction
  const hasSpeaking = localizedExercises.some((e) => e.type === 'speaking')
  if (!hasSpeaking && localizedVocabulary.length > 0) {
    const firstVocab = localizedVocabulary[0]
    localizedExercises.push({
      type: 'speaking',
      prompt: getPromptText('speaking', preferredLangId, targetLangName, firstVocab.word),
      targetWord: firstVocab.word,
      pronunciation: firstVocab.pronunciation,
      correctAnswer: firstVocab.word,
      xp: 15,
    })
  }

  return {
    ...lesson,
    vocabulary: localizedVocabulary,
    exercises: localizedExercises,
  }
}

export const getLessonsForLanguage = (languageId, preferredLangId = 'en') => {
  const raw = rawLessonsByLanguage[languageId] || []
  return raw.map((lesson) => localizeLesson(lesson, languageId, preferredLangId))
}

export const getLessonById = (languageId, lessonId, preferredLangId = 'en') => {
  const lessons = getLessonsForLanguage(languageId, preferredLangId)
  return lessons.find((lesson) => lesson.id === lessonId)
}
