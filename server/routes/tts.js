import express from 'express'
import { synthesizeSpeech, SUPPORTED_LANGUAGES } from '../services/tts.js'

const router = express.Router()

/**
 * POST /api/tts
 * Body: { text: string, language: string, rate?: number }
 */
router.post('/tts', async (req, res) => {
  try {
    const { text, language = 'hi', rate = 1.0 } = req.body

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Missing or empty text parameter' })
    }

    const result = await synthesizeSpeech(text, language, { rate: parseFloat(rate) || 1.0 })

    res.set({
      'Content-Type': result.contentType,
      'Content-Length': result.audioBuffer.length,
      'Cache-Control': 'public, max-age=86400, immutable',
      'X-TTS-Provider': result.provider,
      'X-TTS-Cached': result.isCached ? '1' : '0',
      'X-TTS-Language': result.language,
    })

    return res.send(result.audioBuffer)
  } catch (error) {
    console.error('[TTS Route Error]', error)
    return res.status(500).json({
      error: 'TTS synthesis error',
      message: error.message,
    })
  }
})

/**
 * GET /api/tts
 * Query: ?text=...&lang=...&rate=...
 */
router.get('/tts', async (req, res) => {
  try {
    const text = req.query.text
    const language = req.query.lang || req.query.language || 'hi'
    const rate = parseFloat(req.query.rate) || 1.0

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Missing or empty text parameter' })
    }

    const result = await synthesizeSpeech(text, language, { rate })

    res.set({
      'Content-Type': result.contentType,
      'Content-Length': result.audioBuffer.length,
      'Cache-Control': 'public, max-age=86400, immutable',
      'X-TTS-Provider': result.provider,
      'X-TTS-Cached': result.isCached ? '1' : '0',
      'X-TTS-Language': result.language,
    })

    return res.send(result.audioBuffer)
  } catch (error) {
    console.error('[TTS Route Error]', error)
    return res.status(500).json({
      error: 'TTS synthesis error',
      message: error.message,
    })
  }
})

/**
 * GET /api/tts/languages
 * Returns list of supported languages and info
 */
router.get('/tts/languages', (req, res) => {
  res.json({
    languages: SUPPORTED_LANGUAGES,
  })
})

export default router
