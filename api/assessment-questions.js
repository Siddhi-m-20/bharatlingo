import { generateAssessmentQuestions } from '../server/services/lessonEngine.js'

const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
].filter(Boolean)

function getAllowedOrigin(req) {
  const origin = req.headers.origin
  if (!origin) return null
  if (ALLOWED_ORIGINS.includes(origin)) return origin
  // Permit in non-production so local dev always works
  if (process.env.NODE_ENV !== 'production') return origin
  return null
}

export default async function handler(req, res) {
  const allowedOrigin = getAllowedOrigin(req)
  if (allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin)
    res.setHeader('Access-Control-Allow-Credentials', 'true')
  }
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
