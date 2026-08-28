import express from 'express'
import { speechToText } from '../services/speech.js'

const router = express.Router()

router.post('/speech-to-text', async (req, res) => {
  try {
    const { audio, language } = req.body
    
    if (!audio || !language) {
      return res.status(400).json({ error: 'Missing required fields: audio, language' })
    }

    const result = await speechToText(audio, language)
    res.json(result)
  } catch (error) {
    console.error('Speech recognition error:', error)
    res.status(500).json({ error: 'Speech recognition service unavailable' })
  }
})

export default router
