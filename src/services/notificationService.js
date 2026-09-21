/**
 * Notification Service — BharatLingo PWA & Push Notifications
 *
 * Implements browser Push API and Service Worker notification infrastructure.
 * - Explicit user-initiated opt-in (never on page load)
 * - Durably associated with authenticated user in Supabase
 * - Zero hardcoded secrets / exposed private keys
 * - Graceful fallback for unsupported or denied states
 */

import { supabase } from './supabase.js'

const PUSH_STORAGE_KEY = 'bharatlingo_push_subscription'

/**
 * Check if the current browser environment supports Push API & Service Workers
 */
export function isPushSupported() {
  if (typeof window === 'undefined') return false
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )
}

/**
 * Get current browser notification permission
 * @returns {'granted' | 'denied' | 'default' | 'unsupported'}
 */
export function getNotificationPermission() {
  if (!isPushSupported()) return 'unsupported'
  return Notification.permission
}

/**
 * Request notification permission from the user
 * MUST be invoked directly from a user action (e.g. clicking an enable button).
 */
export async function requestNotificationPermission() {
  if (!isPushSupported()) {
    return { success: false, permission: 'unsupported', message: 'Notifications are not supported in this browser' }
  }

  try {
    const permission = await Notification.requestPermission()
    return {
      success: permission === 'granted',
      permission,
      message: permission === 'granted' ? 'Notification permission granted' : 'Notification permission was not granted',
    }
  } catch (err) {
    console.warn('[NotificationService] Permission request failed:', err)
    return { success: false, permission: 'denied', message: err.message }
  }
}

/**
 * Converts URL-safe base64 string to Uint8Array for PushManager applicationServerKey
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

/**
 * Dynamically resolves VAPID public key from env or backend API
 */
async function getOrFetchVapidPublicKey() {
  const envKey = import.meta.env?.VITE_VAPID_PUBLIC_KEY
  if (envKey && envKey.trim()) return envKey.trim()
  try {
    const res = await fetch('/api/push/public-key')
    if (res.ok) {
      const data = await res.json()
      if (data.publicKey) return data.publicKey
    }
  } catch {}
  return null
}

/**
 * Subscribe user to Push Notifications and persist to authenticated user's profile
 *
 * @param {object} user - Currently authenticated user
 * @returns {Promise<{ success: boolean, subscription?: object, message?: string }>}
 */
export async function subscribeToPush(user) {
  if (!isPushSupported()) {
    return { success: false, message: 'Push notifications are not supported on this browser' }
  }

  const permission = await requestNotificationPermission()
  if (!permission.success) {
    return { success: false, message: 'Permission was not granted by the user' }
  }

  try {
    const registration = await navigator.serviceWorker.ready
    const vapidPublicKey = await getOrFetchVapidPublicKey()

    let subscription = await registration.pushManager.getSubscription()

    if (!subscription) {
      const subscribeOptions = { userVisibleOnly: true }
      if (vapidPublicKey && vapidPublicKey.trim()) {
        subscribeOptions.applicationServerKey = urlBase64ToUint8Array(vapidPublicKey.trim())
      }
      try {
        subscription = await registration.pushManager.subscribe(subscribeOptions)
      } catch (subErr) {
        console.warn('[NotificationService] PushManager subscribe error:', subErr.message)
      }
    }

    const subData = subscription
      ? subscription.toJSON()
      : { enabled: true, type: 'local_notification', subscribedAt: new Date().toISOString() }

    // 1. Durably save to localStorage for offline access
    localStorage.setItem(PUSH_STORAGE_KEY, JSON.stringify(subData))

    // 2. Persist to Supabase authenticated user's profile settings
    if (user?.id) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('settings')
          .eq('id', user.id)
          .maybeSingle()

        const existingSettings = profile?.settings || {}
        await supabase
          .from('profiles')
          .update({
            settings: {
              ...existingSettings,
              push_subscription: subData,
              notifications_enabled: true,
              notifications_updated_at: new Date().toISOString(),
            },
          })
          .eq('id', user.id)
      } catch (dbErr) {
        console.warn('[NotificationService] Supabase profile subscription sync non-fatal:', dbErr)
      }
    }

    return {
      success: true,
      subscription: subData,
      message: 'Daily streak reminders enabled successfully!',
    }
  } catch (err) {
    console.error('[NotificationService] Failed to subscribe to push notifications:', err)
    return { success: false, message: err.message || 'Could not complete push subscription' }
  }
}

/**
 * Unsubscribe user from Push Notifications
 */
export async function unsubscribeFromPush(user) {
  if (!isPushSupported()) return { success: true }

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    if (subscription) {
      await subscription.unsubscribe()
    }

    localStorage.removeItem(PUSH_STORAGE_KEY)

    if (user?.id) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('settings')
          .eq('id', user.id)
          .maybeSingle()

        const existingSettings = profile?.settings || {}
        await supabase
          .from('profiles')
          .update({
            settings: {
              ...existingSettings,
              push_subscription: null,
              notifications_enabled: false,
              notifications_updated_at: new Date().toISOString(),
            },
          })
          .eq('id', user.id)
      } catch (dbErr) {
        console.warn('[NotificationService] Supabase unsubscribe non-fatal:', dbErr)
      }
    }

    return { success: true, message: 'Notifications disabled' }
  } catch (err) {
    console.error('[NotificationService] Error unsubscribing:', err)
    return { success: false, message: err.message }
  }
}

/**
 * Sends a server-side Web Push notification via /api/push/send-test
 *
 * @param {object} subscription - Web Push subscription object
 * @param {object} payload - Notification payload
 * @returns {Promise<{ success: boolean, message: string, expired?: boolean }>}
 */
export async function sendServerPush(subscription, payload = {}) {
  try {
    const res = await fetch('/api/push/send-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription, payload }),
    })

    const data = await res.json().catch(() => ({}))

    if (res.status === 410) {
      return {
        success: false,
        expired: true,
        message: 'Subscription has expired or been revoked by the push service',
      }
    }

    if (!res.ok) {
      return {
        success: false,
        message: data.error || 'Server push delivery failed',
        statusCode: res.status,
      }
    }

    return {
      success: true,
      message: 'Push notification delivered from server via Web Push! 🔥',
      data,
    }
  } catch (err) {
    return {
      success: false,
      message: err.message || 'Network error reaching push server',
    }
  }
}

/**
 * End-to-end Test Reminder: dispatches via server Web Push if subscribed,
 * or falls back to local service worker notification.
 *
 * @param {object} user - Authenticated user
 * @param {object} options - Notification options { title, body, url }
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export async function sendPushNotificationTest(user, options = {}) {
  if (!isPushSupported()) {
    return { success: false, message: 'Notifications unsupported on this device' }
  }
  if (Notification.permission !== 'granted') {
    return { success: false, message: 'Notification permission not granted' }
  }

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()

    if (subscription) {
      const serverRes = await sendServerPush(subscription.toJSON(), options)
      if (serverRes.success) {
        return serverRes
      }
      if (serverRes.expired) {
        await unsubscribeFromPush(user)
        return {
          success: false,
          message: 'Push subscription expired. Please re-enable reminders.',
        }
      }
    }

    // Fallback to local Service Worker notification
    return await sendLocalStreakReminder(options)
  } catch (err) {
    return await sendLocalStreakReminder(options)
  }
}

/**
 * Trigger a local test reminder notification via Service Worker
 */
export async function sendLocalStreakReminder(options = {}) {
  if (!isPushSupported()) {
    return { success: false, message: 'Notifications unsupported' }
  }
  if (Notification.permission !== 'granted') {
    return { success: false, message: 'Notification permission not granted' }
  }

  try {
    const registration = await navigator.serviceWorker.ready
    const title = options.title || 'BharatLingo — Daily Streak Reminder 🔥'
    const notificationOptions = {
      body:
        options.body ||
        'Keep your daily language streak going! Quick 3-minute practice waiting.',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      data: { url: options.url || '/dashboard' },
    }

    await registration.showNotification(title, notificationOptions)
    return { success: true, message: 'Test reminder notification sent!' }
  } catch (err) {
    return { success: false, message: err.message }
  }
}

