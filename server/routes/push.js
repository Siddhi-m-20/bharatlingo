import express from 'express'
import {
  sendPushNotification,
  getVapidPublicKey,
  isValidSubscription,
} from '../services/pushService.js'

const router = express.Router()

/**
 * GET /api/push/public-key
 * Returns the VAPID public key so client can subscribe with PushManager
 */
router.get('/push/public-key', (req, res) => {
  try {
    const publicKey = getVapidPublicKey()
    if (!publicKey) {
      return res.status(500).json({ success: false, error: 'VAPID public key unavailable' })
    }
    return res.json({ success: true, publicKey })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
})

/**
 * POST /api/push/send-test
 * Sends a push notification to the provided subscription
 */
router.post('/push/send-test', async (req, res) => {
  try {
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
        error: 'Invalid push subscription: endpoint and auth/p256dh keys are required',
      })
    }

    const result = await sendPushNotification(subscription, payload)

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'Push notification sent successfully',
        statusCode: result.statusCode,
        payload: result.payload,
      })
    }

    if (result.expired) {
      return res.status(410).json({
        success: false,
        expired: true,
        error: 'Subscription has expired or been unregistered by the push service',
        statusCode: 410,
      })
    }

    return res.status(result.statusCode || 500).json({
      success: false,
      error: result.error || 'Failed to dispatch push notification',
      statusCode: result.statusCode || 500,
    })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
})

export default router
