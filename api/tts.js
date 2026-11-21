import { synthesizeSpeech, SUPPORTED_LANGUAGES } from '../server/services/tts.js'

const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
].filter(Boolean)

function getCorsOrigin(req) {
  const origin = req.headers.origin
  if (ALLOWED_ORIGINS.includes(origin)) {
    return origin
  }
  if (process.env.NODE_ENV !== 'production' && origin) {
    return origin
  }
  return ALLOWED_ORIGINS[0] || false
}

export default async function handler(req, res) {
  const origin = getCorsOrigin(req)
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Access-Control-Allow-Credentials', 'true')
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    let text = ''
    let language = 'hi'
    let rate = 1.0

    if (req.method === 'GET') {
      text = req.query?.text || ''
      language = req.query?.lang || req.query?.language || 'hi'
      rate = parseFloat(req.query?.rate) || 1.0

      if (req.query?.info === 'languages') {
        return res.status(200).json({ languages: SUPPORTED_LANGUAGES })
      }
    } else if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
      text = body.text || ''
      language = body.language || body.lang || 'hi'
      rate = parseFloat(body.rate) || 1.0
    } else {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Missing or empty text parameter' })
    }

    const result = await synthesizeSpeech(text, language, { rate })

    res.setHeader('Content-Type', result.contentType || 'audio/mpeg')
    res.setHeader('Content-Length', result.audioBuffer.length)
    res.setHeader('Cache-Control', 'public, max-age=86400, immutable')
    res.setHeader('X-TTS-Provider', result.provider)
    res.setHeader('X-TTS-Language', result.language)

    return res.status(200).send(result.audioBuffer)
  } catch (err) {
    console.error('[Vercel Serverless TTS Error]')
    return res.status(500).json({
      error: 'TTS synthesis error',
    })
  }
}
