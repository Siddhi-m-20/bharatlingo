import webpush from 'web-push'

const VAPID_PUBLIC_KEY =
  process.env.VAPID_PUBLIC_KEY ||
  'BCvkNefqYlkTi1ATnFmoz-t906jPgPvctWCaI8ujqNZHLCWtDddvj0eyS6e5nQKn6D4GwtDj0FoWu2cG5qUnU0Y'
const VAPID_PRIVATE_KEY =
  process.env.VAPID_PRIVATE_KEY || '7v9pCsV-juMrSGLN-dGEZuTL4tQcavHouQcC5tVZn54'
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:support@bharatlingo.in'

let vapidConfigured = false
function initVapid() {
  if (vapidConfigured) return true
  try {
    if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
      webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
      vapidConfigured = true
      return true
    }
  } catch (err) {
    console.warn('[Vercel Serverless Push] VAPID warning:', err.message)
  }
  return false
}

function isValidSubscription(sub) {
  return Boolean(
    sub &&
      typeof sub === 'object' &&
      typeof sub.endpoint === 'string' &&
      sub.endpoint.startsWith('http') &&
      sub.keys &&
      typeof sub.keys.auth === 'string' &&
      typeof sub.keys.p256dh === 'string'
  )
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // GET: Public key
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      publicKey: VAPID_PUBLIC_KEY,
    })
  }

  // POST: Send push notification
  if (req.method === 'POST') {
    initVapid()
    const { subscription, payload } = req.body || {}

    if (!subscription || !isValidSubscription(subscription)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or missing push subscription',
      })
    }

    const notificationPayload = {
      title: payload?.title || 'BharatLingo — Daily Streak Reminder 🔥',
      body:
        payload?.body ||
        'Keep your daily language streak going! Quick 3-minute practice waiting.',
      icon: payload?.icon || '/icons/icon-192.png',
      badge: payload?.badge || '/icons/icon-192.png',
      data: {
        url: payload?.url || '/dashboard',
        timestamp: Date.now(),
        ...(payload?.data || {}),
      },
    }

    try {
      const response = await webpush.sendNotification(
        subscription,
        JSON.stringify(notificationPayload),
        { TTL: 86400, urgency: 'high' }
      )

      return res.status(200).json({
        success: true,
        message: 'Push notification sent successfully',
        statusCode: response.statusCode,
        payload: notificationPayload,
      })
    } catch (err) {
      const isExpired = err.statusCode === 404 || err.statusCode === 410
      return res.status(isExpired ? 410 : err.statusCode || 500).json({
        success: false,
        expired: isExpired,
        error: err.message,
        statusCode: err.statusCode || 500,
      })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
