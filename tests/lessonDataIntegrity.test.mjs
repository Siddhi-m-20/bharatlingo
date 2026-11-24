import test from 'node:test'
import assert from 'node:assert/strict'
import { getLessonsForLanguage } from '../src/data/lessons/index.js'
import { getAssessmentQuestions } from '../src/data/questions/index.js'

const LANGUAGE_IDS = ['hi', 'mr', 'ta', 'te', 'bn', 'pa', 'gu', 'en']
const SUPPORTED_TYPES = new Set([
  'multiple-choice',
  'picture-choice',
  'picture_choice',
  'visual_match',
  'visual-match',
  'listening',
  'speaking',
  'translation',
  'matching',
  'fill-blank',
  'sentence-order',
  'reading',
])

for (const languageId of LANGUAGE_IDS) {
  test(`lesson data integrity for ${languageId}`, () => {
    const lessons = getLessonsForLanguage(languageId, 'en')
    assert.ok(lessons.length > 0)

    for (const lesson of lessons) {
      assert.ok(lesson.id, 'Every lesson must have an id')
      assert.ok(Array.isArray(lesson.vocabulary) && lesson.vocabulary.length > 0, `${lesson.id} must have vocabulary`)
      assert.ok(Array.isArray(lesson.exercises) && lesson.exercises.length > 0, `${lesson.id} must have exercises`)

      for (const exercise of lesson.exercises) {
        assert.ok(SUPPORTED_TYPES.has(exercise.type), `${lesson.id} has unsupported exercise type ${exercise.type}`)
        assert.ok(exercise.correctAnswer || exercise.pairs, `${lesson.id}/${exercise.type} must have a correct answer`)

        if (exercise.type === 'fill-blank') {
          const blankSentence = exercise.blankedSentence || exercise.sentence || ''
          assert.match(blankSentence, /___/, `${lesson.id} fill-blank must contain ___`)
          assert.ok(Array.isArray(exercise.options) && exercise.options.length > 1, `${lesson.id} fill-blank must have options`)
          assert.ok(exercise.options.includes(exercise.correctAnswer), `${lesson.id} fill-blank correct answer must be an option`)
        }

        if (exercise.type === 'sentence-order') {
          assert.ok(Array.isArray(exercise.words) && exercise.words.length >= 3, `${lesson.id} sentence-order must have shuffled words`)
          assert.ok(exercise.sentence || exercise.correctAnswer, `${lesson.id} sentence-order must have the source sentence`)
        }

        if (exercise.type === 'matching') {
          assert.ok(Array.isArray(exercise.pairs) && exercise.pairs.length >= 2, `${lesson.id} matching must have pairs`)
        }

        if (exercise.type === 'speaking') {
          assert.ok(exercise.targetWord || exercise.correctAnswer, `${lesson.id} speaking must have a target word`)
        }

        if (exercise.type === 'listening') {
          assert.ok(exercise.audioText || exercise.correctAnswer, `${lesson.id} listening must have audio text`)
        }

        if (exercise.type === 'reading') {
          assert.ok(exercise.passage && exercise.question, `${lesson.id} reading must have passage and question`)
        }
      }
    }
  })

  test(`assessment data fill-in-the-blank integrity for ${languageId}`, () => {
    const questions = getAssessmentQuestions(languageId, 'en')
    for (const question of questions) {
      if (question.type === 'fill-blank') {
        const blankSentence = question.blankedSentence || question.sentence || ''
        assert.match(blankSentence, /___/, `${languageId} assessment fill-blank must contain ___`)
        assert.ok(Array.isArray(question.options) && question.options.includes(question.correctAnswer),
          `${languageId} assessment fill-blank must include its correct answer`)
      }
    }
  })
}
