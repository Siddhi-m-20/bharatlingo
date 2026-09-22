import {
  getAdaptiveLesson,
  getDynamicLessons,
  getDynamicLesson,
} from '../server/services/lessonEngine.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const {
      languageId = 'hi',
      goal = 'conversation',
      ageRange = 'adult',
      level = 'beginner',
      topicId = null,
      count = '10',
      type = 'adaptive',
      index = null,
    } = req.query || {}

    // 1. Single dynamic lesson by index
    if (index !== null && index !== undefined && index !== '') {
      const lessonIndex = Math.max(0, parseInt(index, 10) || 0)
      const lesson = getDynamicLesson({ languageId, goal, ageRange, level, lessonIndex })
      return res.status(200).json(lesson)
    }

    // 2. Dynamic lessons array
    if (type === 'dynamic') {
      const lessons = getDynamicLessons({
        languageId,
        goal,
        ageRange,
        level,
        count: Math.min(parseInt(count, 10) || 10, 50),
      })
      return res.status(200).json({ lessons, generatedAt: new Date().toISOString() })
    }

    // 3. Adaptive lesson (default)
    const lesson = getAdaptiveLesson({ languageId, goal, ageRange, level, topicId })
    return res.status(200).json(lesson)
  } catch (err) {
    console.error('[Vercel Serverless Lessons Error]', err)
    return res.status(500).json({ error: 'Could not generate lesson.' })
  }
}
