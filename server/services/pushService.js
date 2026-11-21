import webpush from 'web-push'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:support@bharatlingo.in'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

const supabase = SUPABASE_URL && SUPABASE_ANON_KEY 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null

let vapidConfigured = false

function initVapid() {
  if (vapidConfigured) return true
  try {
    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      console.error('[PushService] VAPID keys not configured')
      return false
    }
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
    vapidConfigured = true
    return true
  } catch (err) {
    console.error('[PushService] VAPID initialization failed')
    return false
  }
}

initVapid()

export function isValidSubscription(subscription) {
  if (!subscription || typeof subscription !== 'object') return false

  try {
    const endpoint = new URL(subscription.endpoint)
    return (
      endpoint.protocol === 'https:' &&
      typeof subscription.keys?.auth === 'string' &&
      subscription.keys.auth.length > 0 &&
      typeof subscription.keys?.p256dh === 'string' &&
      subscription.keys.p256dh.length > 0
    )
  } catch {
    return false
  }
}

export function getVapidPublicKey() {
  if (!VAPID_PUBLIC_KEY) {
    throw new Error('VAPID public key not configured')
  }
  return VAPID_PUBLIC_KEY
}

export async function verifySupabaseToken(token) {
  if (!supabase) {
    console.error('[PushService] Supabase not configured for token verification')
    return null
  }
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) {
      return null
    }
    return user
  } catch (err) {
    console.error('[PushService] Token verification failed')
    return null
  }
}

export async function verifySubscriptionOwnership(userId, subscription) {
  if (!supabase || !userId || !subscription?.endpoint) {
    return false
  }
  
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('settings')
      .eq('id', userId)
      .maybeSingle()
    
    if (error || !profile) {
      return false
    }
    
    const storedSub = profile.settings?.push_subscription
    if (!storedSub) {
      return false
    }
    
    return storedSub.endpoint === subscription.endpoint
  } catch (err) {
    console.error('[PushService] Ownership verification failed')
    return false
  }
}

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
      error: 'Invalid push subscription format',
      statusCode: 400,
      invalid: true,
    }
  }

  const notificationPayload = {
    title: payload?.title || 'BharatLingo — Daily Streak Reminder',
    body:
      payload?.body ||
      'Keep your daily language streak going! Quick practice waiting.',
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
        TTL: 86400,
        urgency: 'high',
      }
    )

    return {
      success: true,
      statusCode: response.statusCode,
      payload: notificationPayload,
    }
  } catch (err) {
    const isExpired = err.statusCode === 404 || err.statusCode === 410

    return {
      success: false,
      error: isExpired ? 'Subscription expired' : 'Failed to dispatch push notification',
      statusCode: err.statusCode || 500,
      expired: isExpired,
    }
  }
}
