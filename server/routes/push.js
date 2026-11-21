import express from 'express'
import {
  sendPushNotification,
  getVapidPublicKey,
  isValidSubscription,
  verifySupabaseToken,
  verifySubscriptionOwnership,
} from '../services/pushService.js'

const router = express.Router()

// Simple in-memory rate limiting
const rateLimitStore = new Map()
const RATE_LIMIT_WINDOW = 60000 // 1 minute
const RATE_LIMIT_MAX = 10 // requests per window

function rateLimit(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown'
  const now = Date.now()
  const windowStart = now - RATE_LIMIT_WINDOW
  
  if (!rateLimitStore.has(ip)) {
    rateLimitStore.set(ip, [])
  }
  
  const requests = rateLimitStore.get(ip).filter(time => time > windowStart)
  rateLimitStore.set(ip, requests)
  
  if (requests.length >= RATE_LIMIT_MAX) {
    return res.status(429).json({ success: false, error: 'Too many requests' })
  }
  
  requests.push(now)
  next()
}

router.get('/push/public-key', (req, res) => {
  try {
    const publicKey = getVapidPublicKey()
    if (!publicKey) {
      return res.status(500).json({ success: false, error: 'VAPID public key unavailable' })
    }
    return res.json({ success: true, publicKey })
  } catch (err) {
    return res.status(500).json({ success: false, error: 'VAPID public key unavailable' })
  }
})

router.post('/push/send-test', rateLimit, async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Authentication required' })
    }

    const token = authHeader.substring(7)
    const user = await verifySupabaseToken(token)
    
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid or expired token' })
    }

    const { subscription, payload } = req.body || {}

    if (!subscription) {
      return res.status(400).json({
        success: false,
        error: 'Missing push subscription in request body',
      })
    }

    if (!isValidSubscription(subscription)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid push subscription',
      })
    }

    // Verify subscription ownership
    const ownsSubscription = await verifySubscriptionOwnership(user.id, subscription)
    if (!ownsSubscription) {
      return res.status(403).json({
        success: false,
        error: 'Subscription does not belong to authenticated user',
      })
    }

    // Validate payload
    if (payload && typeof payload !== 'object') {
      return res.status(400).json({ success: false, error: 'Invalid payload format' })
    }

    const result = await sendPushNotification(subscription, payload)

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'Push notification sent successfully',
      })
    }

    if (result.expired) {
      return res.status(410).json({
        success: false,
        expired: true,
        error: 'Subscription expired',
      })
    }

    return res.status(result.statusCode || 500).json({
      success: false,
      error: result.error || 'Failed to dispatch push notification',
    })
  } catch (err) {
    console.error('[Push Route] Error:', err.message)
    return res.status(500).json({ success: false, error: 'Failed to dispatch push notification' })
  }
})

export default router
