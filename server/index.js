import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import translationRoutes from './routes/translation.js'
import speechRoutes from './routes/speech.js'
import lessonsRoutes from './routes/lessons.js'
import ttsRoutes from './routes/tts.js'
import indicNlpRoutes from './routes/indicNlp.js'
import pushRoutes from './routes/push.js'
import tutorRoutes from './routes/tutor.js'
import { indicNlpCapabilities } from './services/indicNlp.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
].filter(Boolean)

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true)
    }
    return callback(new Error('Not allowed by CORS'))
  },
  credentials: true
}))
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'BharatLingo API is running', indicNlp: indicNlpCapabilities() })
})

app.use('/api', translationRoutes)
app.use('/api', speechRoutes)
app.use('/api', lessonsRoutes)
app.use('/api', ttsRoutes)
app.use('/api', indicNlpRoutes)
app.use('/api', pushRoutes)
app.use('/api', tutorRoutes)

app.use((err, req, res, next) => {
  console.error('[Server Error]')
  res.status(500).json({ error: 'Something went wrong on the server' })
})

app.listen(PORT, () => {
  console.log(`BharatLingo server running on port ${PORT}`)
})
