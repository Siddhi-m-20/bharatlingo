import { evaluateTutorWithGenerativeAI } from '../server/services/generativeTutor.js'

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
  if (process.env.NODE_ENV !== 'production') return origin
  return null
}

export default async function handler(req, res) {
  const allowedOrigin = getAllowedOrigin(req)
  if (allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin)
    res.setHeader('Access-Control-Allow-Credentials', 'true')
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
    const learnerResponse = String(body.learnerResponse || '').trim()
    if (!learnerResponse) return res.status(400).json({ error: 'Learner response is required.' })
    if (learnerResponse.length > 1200) return res.status(400).json({ error: 'Learner response is too long.' })
    const evaluation = await evaluateTutorWithGenerativeAI(body)
    return res.status(200).json({ ...evaluation, source: 'ai' })
  } catch (error) {
    console.error('[Vercel Tutor Generative Response Error]', error.message)
    return res.status(503).json({ error: 'Generative tutor unavailable', source: 'fallback' })
  }
}
