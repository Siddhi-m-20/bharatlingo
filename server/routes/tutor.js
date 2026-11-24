import express from 'express'
import { evaluateTutorWithGenerativeAI } from '../services/generativeTutor.js'

const router = express.Router()

router.post('/tutor/respond', async (req, res) => {
  try {
    console.info('[Tutor] Generative tutor request')
    const body = req.body || {}
    const learnerResponse = String(body.learnerResponse || '').trim()
    if (!learnerResponse) {
      return res.status(400).json({ error: 'Learner response is required.' })
    }
    if (learnerResponse.length > 1200) {
      return res.status(400).json({ error: 'Learner response is too long.' })
    }
    const evaluation = await evaluateTutorWithGenerativeAI(body)
    return res.json({ ...evaluation, source: 'ai' })
  } catch (error) {
    console.error('[Tutor Generative Response Error]', error.message)
    return res.status(503).json({
      error: 'Generative tutor unavailable',
      source: 'fallback',
    })
  }
})

export default router
