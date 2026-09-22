import { generateAssessmentQuestions } from '../server/services/lessonEngine.js'

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
      preferredLanguage = 'en',
      ageRange = 'adult',
      goal = 'conversation',
      count = '15',
    } = req.query || {}

    const questions = generateAssessmentQuestions({
      languageId,
      preferredLanguage,
      ageRange,
      goal,
      count: parseInt(count, 10) || 15,
    })

    return res.status(200).json({ questions })
  } catch (err) {
    console.error('[Vercel Serverless Assessment Questions Error]', err)
    return res.status(500).json({ error: 'Could not generate assessment questions.' })
  }
}
