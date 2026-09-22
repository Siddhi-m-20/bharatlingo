import { generateLearningPlan } from '../server/services/lessonEngine.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
    const {
      languageId = 'hi',
      ageRange = 'adult',
      goal = 'conversation',
      level = 'beginner',
      assessmentScore = null,
      dailyGoal = 10,
    } = body

    const plan = generateLearningPlan({
      languageId,
      ageRange,
      goal,
      level,
      assessmentScore,
      dailyGoal,
    })

    return res.status(200).json(plan)
  } catch (err) {
    console.error('[Vercel Serverless Learning Plan Error]', err)
    return res.status(500).json({ error: 'Could not generate learning plan.' })
  }
}
