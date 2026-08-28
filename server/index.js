import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import translationRoutes from './routes/translation.js'
import speechRoutes from './routes/speech.js'
import lessonsRoutes from './routes/lessons.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'BharatLingo API is running' })
})

app.use('/api', translationRoutes)
app.use('/api', speechRoutes)
app.use('/api', lessonsRoutes)

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong on the server' })
})

app.listen(PORT, () => {
  console.log(`BharatLingo server running on port ${PORT}`)
})
