import { hindiLessons } from './hindi.js'
import { marathiLessons } from './marathi.js'
import { tamilLessons } from './tamil.js'
import { teluguLessons } from './telugu.js'
import { bengaliLessons } from './bengali.js'
import { punjabiLessons } from './punjabi.js'
import { gujaratiLessons } from './gujarati.js'
import { englishLessons } from './english.js'
import { createComprehensiveFoundationLessons } from './comprehensiveFoundation.js'
import { getPromptText, getTranslation, dictionary, targetNameMap } from '../translations.js'
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

// Find translation of an English meaning into preferred language
export function translateMeaning(meaning, preferredLang) {
  if (!meaning || preferredLang === 'en') return meaning
  const cleanMeaning = meaning.split('/')[0].trim().toLowerCase()
  const entry = dictionary.find((d) => {
    const enVal = d.translations['en']?.toLowerCase()
    return enVal === cleanMeaning || enVal?.includes(cleanMeaning) || cleanMeaning.includes(enVal)
  })
  if (entry && entry.translations[preferredLang]) {
    return entry.translations[preferredLang]
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

    if (ex.type === 'multiple-choice') {
      // Check if prompt is asking for target word meaning
      const match = ex.prompt.match(/["'](.*?)["']/)
      const word = match ? match[1] : ''

      if (word) {
        localized.prompt = getPromptText('meaning', preferredLangId, targetLangName, word)
      }

      // Translate options to preferred language
      if (ex.options && preferredLangId !== 'en') {
        localized.options = ex.options.map((opt) => translateMeaning(opt, preferredLangId))
        localized.correctAnswer = translateMeaning(ex.correctAnswer, preferredLangId)
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
      localized.prompt = getPromptText('fill_blank', preferredLangId, targetLangName)
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
