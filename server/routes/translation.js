import express from 'express'
import { translateText } from '../services/translation.js'

const router = express.Router()

router.post('/translate', async (req, res) => {
  try {
    const { text, source, target } = req.body
    
    if (!text || !source || !target) {
      return res.status(400).json({ error: 'Missing required fields: text, source, target' })
    }

    const result = await translateText(text, source, target)
    res.json(result)
  } catch (error) {
    console.error('Translation error:', error)
    res.status(500).json({ error: 'Translation service unavailable' })
  }
})

export default router
