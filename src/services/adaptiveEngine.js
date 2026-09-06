/**
 * Adaptive Engine — BharatLingo
 *
 * Backward-compatibility wrapper delegating to `learnerModel.js` and `lessonEngine.js`.
 */

export {
  TOPIC_CATEGORIES,
  inferTopicCategory as inferCategory,
  recordExerciseAttempt,
  getWeakAreas,
  getLearnerProfile as getAdaptiveLearningProfile,
  getSkillProficiencies,
} from './learnerModel.js'

export {
  generateAdaptiveLesson,
  generateNextLesson,
  generateLessonSequence,
  generateLesson,
} from './lessonEngine.js'

import { getMistakes } from './mistakeService.js'
import { getDueSM2Items } from './spacedRepetition.js'
import { getLessonsForLanguage } from '../data/lessons/index.js'
import { createWordToMeaningMCQ, createTranslationExercise } from './exercisePool.js'


/**
 * Legacy personalized workout generator
 */
export function generatePersonalizedWorkout(languageId = 'hi', preferredLanguage = 'en', count = 5) {
  const mistakes = getMistakes(languageId) || []
  const sm2Due = getDueSM2Items(languageId) || []
  const seedLessons = getLessonsForLanguage(languageId, preferredLanguage) || []
  const allVocab = seedLessons.flatMap((l) => l.vocabulary || [])

  const workout = []
  const seen = new Set()

  for (const m of [...mistakes, ...sm2Due]) {
    if (workout.length >= count) break
    const k = (m.word || '').toLowerCase()
    if (!seen.has(k)) {
      seen.add(k)
      const match = allVocab.find((v) => v.word === m.word) || { word: m.word, translation: m.translation }
      workout.push(createWordToMeaningMCQ(match, allVocab, languageId, preferredLanguage))
    }
  }

  // Fallback to core vocab
  for (const v of allVocab) {
    if (workout.length >= count) break
    const k = (v.word || '').toLowerCase()
    if (!seen.has(k)) {
      seen.add(k)
      workout.push(createTranslationExercise(v, allVocab, languageId, preferredLanguage))
    }
  }

  return workout
}
