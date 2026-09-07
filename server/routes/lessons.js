import express from 'express'
import {
  getDynamicLessons,
  getDynamicLesson,
  getAdaptiveLesson,
  generateLearningPlan,
  generateAssessmentQuestions,
  UnsupportedLanguageError,
} from '../services/lessonEngine.js'
import { languages as supportedLanguages } from '../../src/data/languages.js'

const router = express.Router()

// Never fall back to another language: an unsupported language is a client error.
function handleLessonError(res, err, fallbackMessage) {
  if (err instanceof UnsupportedLanguageError) {
    return res.status(400).json({ error: err.message })
  }
  console.error(fallbackMessage, err)
  return res.status(500).json({ error: fallbackMessage })
}

function adaptiveLessonHandler(req, res) {
  try {
    const source = req.method === 'POST' ? { ...req.query, ...req.body } : req.query
    const {
      languageId = 'hi',
      goal = 'conversation',
      ageRange = 'adult',
      level = 'beginner',
      preferredLang = 'en',
      topicId = null,
      learnerState = null,
    } = source
    const lesson = getAdaptiveLesson({ languageId, goal, ageRange, level, preferredLang, topicId, learnerState })
    res.json(lesson)
  } catch (err) {
    handleLessonError(res, err, 'Could not generate adaptive lesson.')
  }
}

// GET is the cold-start variant; POST carries the learner snapshot so the API
// adapts to the same learner model the client uses.
router.get('/lessons/adaptive', adaptiveLessonHandler)
router.post('/lessons/adaptive', adaptiveLessonHandler)


router.get('/languages', (req, res) => {
  res.json(supportedLanguages.map(({ id, name, nativeName, flag }) => ({ id, name, nativeName, flag })))
})

/**
 * GET /api/lessons/dynamic
 * Query params: languageId, goal, ageRange, level, count
 * Returns an array of dynamically generated lessons (NO AI provider info exposed)
 */
router.get('/lessons/dynamic', (req, res) => {
  try {
    const { languageId = 'hi', goal = 'conversation', ageRange = 'adult', level = 'beginner', preferredLang = 'en', count = '10' } = req.query
    const lessons = getDynamicLessons({
      languageId,
      goal,
      ageRange,
      level,
      preferredLang,
      count: Math.min(parseInt(count, 10) || 10, 50),
    })
    res.json({ lessons, generatedAt: new Date().toISOString() })
  } catch (err) {
    handleLessonError(res, err, 'Could not generate lessons. Please try again.')
  }
})

/**
 * GET /api/lessons/dynamic/:index
 * Returns a single dynamic lesson at a given index
 */
router.get('/lessons/dynamic/:index', (req, res) => {
  try {
    const { languageId = 'hi', goal = 'conversation', ageRange = 'adult', level = 'beginner', preferredLang = 'en' } = req.query
    const lessonIndex = Math.max(0, parseInt(req.params.index, 10) || 0)
    const lesson = getDynamicLesson({ languageId, goal, ageRange, level, preferredLang, lessonIndex })
    res.json(lesson)
  } catch (err) {
    handleLessonError(res, err, 'Could not generate lesson. Please try again.')
  }
})

/**
 * POST /api/learning-plan
 * Body: { languageId, ageRange, goal, level, assessmentScore, dailyGoal }
 * Returns a personalized learning plan (no AI model/provider names exposed)
 */
router.post('/learning-plan', (req, res) => {
  try {
    const { languageId = 'hi', ageRange = 'adult', goal = 'conversation', level = 'beginner', assessmentScore = null, dailyGoal = 10 } = req.body
    const plan = generateLearningPlan({ languageId, ageRange, goal, level, assessmentScore, dailyGoal })
    res.json(plan)
  } catch (err) {
    handleLessonError(res, err, 'Could not generate learning plan. Please try again.')
  }
})

/**
 * GET /api/assessment/questions
 * Query params: languageId, ageRange, goal, count
 * Returns assessment questions with real TTS/STT exercises
 */
router.get('/assessment/questions', (req, res) => {
  try {
    const { languageId = 'hi', ageRange = 'adult', goal = 'conversation', preferredLang = 'en', count = '6' } = req.query
    const questions = generateAssessmentQuestions({
      languageId,
      ageRange,
      goal,
      preferredLang,
      count: Math.min(parseInt(count, 10) || 6, 12),
    })
    res.json({ questions })
  } catch (err) {
    handleLessonError(res, err, 'Could not load assessment. Please try again.')
  }
})

export default router
