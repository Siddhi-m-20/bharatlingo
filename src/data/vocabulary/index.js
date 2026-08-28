import { getLessonsForLanguage } from '../lessons'

export const getVocabularyForLanguage = (languageId) => {
  const lessons = getLessonsForLanguage(languageId)
  
  const vocabulary = []
  lessons.forEach(lesson => {
    lesson.vocabulary.forEach(word => {
      vocabulary.push({
        ...word,
        lessonId: lesson.id,
        mastery: 0,
      })
    })
  })
  
  return vocabulary
}
