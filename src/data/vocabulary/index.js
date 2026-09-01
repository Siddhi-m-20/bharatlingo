import { getLessonsForLanguage } from '../lessons'

export const getVocabularyForLanguage = (languageId, preferredLangId = 'en') => {
  const lessons = getLessonsForLanguage(languageId, preferredLangId)

  const vocabulary = []
  lessons.forEach((lesson) => {
    (lesson.vocabulary || []).forEach((word) => {
      vocabulary.push({
        ...word,
        lessonId: lesson.id,
        mastery: 0,
      })
    })
  })

  return vocabulary
}
