import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
const rateLimitWindowMs = 60 * 1000
const rateLimitMaxRequests = 10
const requestBuckets = new Map()

function getSupabaseClient(accessToken) {
  if (!supabaseUrl || !supabaseAnonKey || !accessToken) return null
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  })
}

export function getBearerToken(req) {
  const header = req?.headers?.authorization
  if (typeof header !== 'string') return null
  const match = header.match(/^Bearer\s+([^\s]+)$/i)
  return match?.[1] || null
}

export async function verifyAccessToken(token, clientFactory = getSupabaseClient) {
  const client = clientFactory(token)
  if (!client) return { user: null, reason: 'auth_not_configured' }

  try {
    const { data, error } = await client.auth.getUser(token)
    if (error || !data?.user?.id) return { user: null, reason: 'invalid_token' }
    return { user: data.user, client }
  } catch {
    return { user: null, reason: 'invalid_token' }
  }
}

export async function authenticateRequest(req, verifier = verifyAccessToken) {
  const token = getBearerToken(req)
  if (!token) return { user: null, statusCode: 401, error: 'Authentication required' }

  const result = await verifier(token)
  if (!result?.user) {
    return {
      user: null,
      statusCode: result?.reason === 'auth_not_configured' ? 500 : 401,
      error: result?.reason === 'auth_not_configured'
        ? 'Authentication service unavailable'
        : 'Invalid or expired authentication token',
    }
  }

  return { user: result.user, token, client: result.client }
}

export async function getOwnedSubscription(userId, accessToken, client = getSupabaseClient(accessToken)) {
  if (!userId || !client) return null

  try {
    const { data, error } = await client
      .from('profiles')
      .select('settings')
      .eq('id', userId)
      .maybeSingle()

    if (error) return null
    return data?.settings?.push_subscription || null
  } catch {
    return null
  }
}

export function subscriptionsMatch(left, right) {
  return Boolean(
    left &&
      right &&
      left.endpoint === right.endpoint &&
      left.keys?.auth === right.keys?.auth &&
      left.keys?.p256dh === right.keys?.p256dh
  )
}

export function checkPushRateLimit(userId) {
  const now = Date.now()
  const bucket = requestBuckets.get(userId)
  if (!bucket || now - bucket.startedAt >= rateLimitWindowMs) {
    requestBuckets.set(userId, { startedAt: now, count: 1 })
    return { allowed: true, retryAfterSeconds: 0 }
  }

  if (bucket.count >= rateLimitMaxRequests) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((rateLimitWindowMs - (now - bucket.startedAt)) / 1000),
    }
  }

  bucket.count += 1
  return { allowed: true, retryAfterSeconds: 0 }
}

export function resetPushRateLimits() {
  requestBuckets.clear()
}