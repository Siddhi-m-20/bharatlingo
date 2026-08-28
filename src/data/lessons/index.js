import { hindiLessons } from './hindi.js'
import { marathiLessons } from './marathi.js'
import { tamilLessons } from './tamil.js'
import { teluguLessons } from './telugu.js'
import { bengaliLessons } from './bengali.js'
import { punjabiLessons } from './punjabi.js'
import { gujaratiLessons } from './gujarati.js'
import { englishLessons } from './english.js'
import { rajasthaniLessons } from './rajasthani.js'

export const lessonsByLanguage = {
  hi: hindiLessons,
  mr: marathiLessons,
  ta: tamilLessons,
  te: teluguLessons,
  bn: bengaliLessons,
  pa: punjabiLessons,
  gu: gujaratiLessons,
  en: englishLessons,
  raj: rajasthaniLessons,
}

export const getLessonsForLanguage = (languageId) => {
  return lessonsByLanguage[languageId] || []
}

export const getLessonById = (languageId, lessonId) => {
  const lessons = getLessonsForLanguage(languageId)
  return lessons.find(lesson => lesson.id === lessonId)
}
