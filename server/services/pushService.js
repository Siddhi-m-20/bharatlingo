import webpush from 'web-push'
import dotenv from 'dotenv'

dotenv.config()

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
    console.warn('[PushService] VAPID initialization warning:', err.message)
  }
  return false
}

initVapid()

/**
 * Validates whether an object matches the W3C PushSubscription schema
 * @param {object} subscription
 * @returns {boolean}
 */
export function isValidSubscription(subscription) {
  return Boolean(
    subscription &&
      typeof subscription === 'object' &&
      typeof subscription.endpoint === 'string' &&
      subscription.endpoint.startsWith('http') &&
      subscription.keys &&
      typeof subscription.keys.auth === 'string' &&
      typeof subscription.keys.p256dh === 'string'
  )
}

/**
 * Returns the public VAPID key for client registration
 * @returns {string}
 */
export function getVapidPublicKey() {
  return VAPID_PUBLIC_KEY
}

/**
 * Dispatches a Web Push Notification using VAPID
 *
 * @param {object} subscription - Web Push subscription { endpoint, keys: { auth, p256dh } }
 * @param {object} payload - Notification payload { title, body, icon, url, data }
 * @returns {Promise<{ success: boolean, statusCode?: number, error?: string, expired?: boolean }>}
 */
export async function sendPushNotification(subscription, payload = {}) {
  if (!initVapid()) {
    return {
      success: false,
      error: 'VAPID keys not configured on server',
      statusCode: 500,
    }
  }

  if (!isValidSubscription(subscription)) {
    return {
      success: false,
      error: 'Invalid push subscription format: endpoint and auth/p256dh keys are required',
      statusCode: 400,
      invalid: true,
    }
  }

  const notificationPayload = {
    title: payload?.title || 'BharatLingo — Daily Streak Reminder 🔥',
    body:
      payload?.body ||
      'Keep your daily language streak going! Quick 3-minute practice waiting.',
    icon: payload?.icon || '/icons/icon-192.png',
    badge: payload?.badge || '/icons/icon-192.png',
    data: {
      url: payload?.url || payload?.data?.url || '/dashboard',
      timestamp: Date.now(),
      ...(payload?.data || {}),
    },
  }

  try {
    const response = await webpush.sendNotification(
      subscription,
      JSON.stringify(notificationPayload),
      {
        TTL: 86400, // 24 hours
        urgency: 'high',
      }
    )

    return {
      success: true,
      statusCode: response.statusCode,
      headers: response.headers,
      payload: notificationPayload,
    }
  } catch (err) {
    // 404 Not Found or 410 Gone indicates the push subscription has expired or been revoked
    const isExpired = err.statusCode === 404 || err.statusCode === 410

    return {
      success: false,
      error: err.message,
      statusCode: err.statusCode || 500,
      expired: isExpired,
      endpoint: subscription.endpoint,
    }
  }
}
