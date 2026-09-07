import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// High-Fidelity Indic Audio Engine for Local Vite Dev Server
function indicTtsPlugin() {
  const languageCodes = {
    hi: 'hi',
    en: 'en',
    mr: 'mr',
    ta: 'ta',
    te: 'te',
    bn: 'bn',
    pa: 'pa',
    gu: 'gu',
  }

  const memoryCache = new Map()

  return {
    name: 'indic-tts-dev-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/tts')) {
          return next()
        }

        try {
          let text = ''
          let language = 'hi'
          let rate = 1.0

          if (req.method === 'GET') {
            const parsedUrl = new URL(req.url, 'http://localhost:5173')
            text = parsedUrl.searchParams.get('text') || ''
            language = parsedUrl.searchParams.get('lang') || parsedUrl.searchParams.get('language') || 'hi'
            rate = parseFloat(parsedUrl.searchParams.get('rate')) || 1.0
          } else if (req.method === 'POST') {
            const bodyStr = await new Promise((resolve) => {
              let acc = ''
              req.on('data', (chunk) => { acc += chunk })
              req.on('end', () => resolve(acc))
            })
            try {
              const body = JSON.parse(bodyStr)
              text = body.text || ''
              language = body.language || 'hi'
              rate = parseFloat(body.rate) || 1.0
            } catch {}
          }

          if (!text || !text.trim()) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Missing text parameter' }))
            return
          }

          const langCode = languageCodes[language.toLowerCase()] || 'hi'
          const cacheKey = `${langCode}:${text.trim()}`

          if (memoryCache.has(cacheKey)) {
            const cachedBuffer = memoryCache.get(cacheKey)
            res.statusCode = 200
            res.setHeader('Content-Type', 'audio/mpeg')
            res.setHeader('Cache-Control', 'public, max-age=86400')
            res.setHeader('X-TTS-Source', 'memory_cache')
            res.end(cachedBuffer)
            return
          }

          // Fetch natural Indic audio from high-fidelity Indic engine
          const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text.trim())}&tl=${langCode}&client=tw-ob`
          const fetchRes = await fetch(ttsUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Referer': 'https://translate.google.com/',
            },
          })

          if (!fetchRes.ok) {
            throw new Error(`TTS upstream error: ${fetchRes.status}`)
          }

          const arrayBuf = await fetchRes.arrayBuffer()
          const buffer = Buffer.from(arrayBuf)

          if (buffer && buffer.length > 100) {
            memoryCache.set(cacheKey, buffer)
            res.statusCode = 200
            res.setHeader('Content-Type', 'audio/mpeg')
            res.setHeader('Cache-Control', 'public, max-age=86400')
            res.setHeader('X-TTS-Source', 'indic_engine')
            res.end(buffer)
            return
          }

          throw new Error('Received empty audio payload')
        } catch (err) {
          console.warn('[Indic TTS Dev Middleware Error]', err.message)
          next()
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), indicTtsPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})

