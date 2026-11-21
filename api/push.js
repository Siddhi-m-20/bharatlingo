import webpush from 'web-push'
import { createClient } from '@supabase/supabase-js'

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:support@bharatlingo.in'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

// Create Supabase client for token verification
const supabase = SUPABASE_URL && SUPABASE_ANON_KEY 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null

let vapidConfigured = false
function initVapid() {
  if (vapidConfigured) return true
  try {
    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      console.error('[Vercel Serverless Push] VAPID keys not configured')
      return false
    }
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
    vapidConfigured = true
    return true
  } catch (err) {
    console.error('[Vercel Serverless Push] VAPID initialization failed')
    return false
  }
}

function isValidSubscription(sub) {
  if (!sub || typeof sub !== 'object') return false

  try {
    const endpoint = new URL(sub.endpoint)
    return (
      endpoint.protocol === 'https:' &&
      typeof sub.keys?.auth === 'string' &&
      sub.keys.auth.length > 0 &&
      typeof sub.keys?.p256dh === 'string' &&
      sub.keys.p256dh.length > 0
    )
  } catch {
    return false
  }
}

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

// Simple in-memory rate limiting
const rateLimitStore = new Map()
const RATE_LIMIT_WINDOW = 60000
const RATE_LIMIT_MAX = 10

function checkRateLimit(ip) {
  const now = Date.now()
  const windowStart = now - RATE_LIMIT_WINDOW
  
  if (!rateLimitStore.has(ip)) {
    rateLimitStore.set(ip, [])
  }
  
  const requests = rateLimitStore.get(ip).filter(time => time > windowStart)
  rateLimitStore.set(ip, requests)
  
  if (requests.length >= RATE_LIMIT_MAX) {
    return false
  }
  
  requests.push(now)
  return true
}

async function verifySupabaseToken(token) {
  if (!supabase) {
    console.error('[Push] Supabase not configured for token verification')
    return null
  }
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) {
      return null
    }
    return user
  } catch (err) {
    console.error('[Push] Token verification failed')
    return null
  }
}

async function verifySubscriptionOwnership(userId, subscription) {
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
    
    // Compare endpoints to verify ownership
    return storedSub.endpoint === subscription.endpoint
  } catch (err) {
    console.error('[Push] Ownership verification failed')
    return false
  }
}

export default async function handler(req, res) {
  const origin = getCorsOrigin(req)
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Access-Control-Allow-Credentials', 'true')
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With'
  )

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method === 'GET') {
    if (!VAPID_PUBLIC_KEY) {
      return res.status(500).json({ success: false, error: 'VAPID public key not configured' })
    }
    return res.status(200).json({
      success: true,
      publicKey: VAPID_PUBLIC_KEY,
    })
  }

  if (req.method === 'POST') {
    // Rate limiting
    const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown'
    if (!checkRateLimit(ip)) {
      return res.status(429).json({ success: false, error: 'Too many requests' })
    }

    // Authentication required
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Authentication required' })
    }

    const token = authHeader.substring(7)
    const user = await verifySupabaseToken(token)
    
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid or expired token' })
    }

    if (!initVapid()) {
      return res.status(500).json({ success: false, error: 'Push service not configured' })
    }
    
    const { subscription, payload } = req.body || {}

    if (!subscription || !isValidSubscription(subscription)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or missing push subscription',
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

    const notificationPayload = {
      title: payload?.title || 'BharatLingo — Daily Streak Reminder',
      body:
        payload?.body ||
        'Keep your daily language streak going! Quick practice waiting.',
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
      })
    } catch (err) {
      const isExpired = err.statusCode === 404 || err.statusCode === 410
      return res.status(isExpired ? 410 : err.statusCode || 500).json({
        success: false,
        expired: isExpired,
        error: isExpired ? 'Subscription expired' : 'Failed to send notification',
      })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
