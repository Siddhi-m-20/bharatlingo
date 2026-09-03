import express from 'express'
import {
  getDynamicLessons,
  getDynamicLesson,
  generateLearningPlan,
  generateAssessmentQuestions,
} from '../services/lessonEngine.js'

const router = express.Router()

router.get('/languages', (req, res) => {
  const languages = [
    { id: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
    { id: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
    { id: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
    { id: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
    { id: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
    { id: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
    { id: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
    { id: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
    { id: 'raj', name: 'Rajasthani', nativeName: 'राजस्थानी', flag: '🇮🇳' },
  ]
  res.json(languages)
})

/**
 * GET /api/lessons/dynamic
 * Query params: languageId, goal, ageRange, level, count
 * Returns an array of dynamically generated lessons (NO AI provider info exposed)
 */
router.get('/lessons/dynamic', (req, res) => {
  try {
    const { languageId = 'hi', goal = 'conversation', ageRange = 'adult', level = 'beginner', count = '10' } = req.query
    const lessons = getDynamicLessons({
      languageId,
      goal,
      ageRange,
      level,
      count: Math.min(parseInt(count, 10) || 10, 50),
    })
    res.json({ lessons, generatedAt: new Date().toISOString() })
  } catch (err) {
    console.error('Dynamic lessons error:', err)
    res.status(500).json({ error: 'Could not generate lessons. Please try again.' })
  }
})

/**
 * GET /api/lessons/dynamic/:index
 * Returns a single dynamic lesson at a given index
 */
router.get('/lessons/dynamic/:index', (req, res) => {
  try {
    const { languageId = 'hi', goal = 'conversation', ageRange = 'adult', level = 'beginner' } = req.query
    const lessonIndex = Math.max(0, parseInt(req.params.index, 10) || 0)
    const lesson = getDynamicLesson({ languageId, goal, ageRange, level, lessonIndex })
    res.json(lesson)
  } catch (err) {
    console.error('Dynamic lesson error:', err)
    res.status(500).json({ error: 'Could not generate lesson. Please try again.' })
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
    console.error('Learning plan error:', err)
    res.status(500).json({ error: 'Could not generate learning plan. Please try again.' })
  }
})

/**
 * GET /api/assessment/questions
 * Query params: languageId, ageRange, goal, count
 * Returns assessment questions with real TTS/STT exercises
 */
router.get('/assessment/questions', (req, res) => {
  try {
    const { languageId = 'hi', ageRange = 'adult', goal = 'conversation', count = '6' } = req.query
    const questions = generateAssessmentQuestions({
      languageId,
      ageRange,
      goal,
      count: Math.min(parseInt(count, 10) || 6, 12),
    })
    res.json({ questions })
  } catch (err) {
    console.error('Assessment questions error:', err)
    res.status(500).json({ error: 'Could not load assessment. Please try again.' })
  }
})

export default router
