import express from 'express'
import { identifyLanguage, transliterateText } from '../services/indicNlp.js'

const router = express.Router()

router.post('/transliterate', async (req, res) => {
  try {
    res.json(await transliterateText(req.body || {}))
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.post('/language-identify', (req, res) => {
  try {
    res.json(identifyLanguage(req.body?.text))
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

export default router
