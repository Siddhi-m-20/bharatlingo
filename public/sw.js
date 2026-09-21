// BharatLingo Service Worker — Production App Shell & Push Notifications
const CACHE_NAME = 'bharatlingo-shell-v1'

const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
]

// 1. Install & Precache App Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
      .catch((err) => {
        console.warn('[SW] Precache non-fatal error:', err)
      })
  )
})

// 2. Activate & Clean Outdated Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.map((name) => {
            if (name !== CACHE_NAME) {
              return caches.delete(name)
            }
          })
        )
      )
      .then(() => self.clients.claim())
  )
})

// 3. Fetch Strategy: Network-First with Offline Fallback
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Bypass non-GET, API calls, and Supabase database requests from cache
  if (
    event.request.method !== 'GET' ||
    url.pathname.startsWith('/api') ||
    url.hostname.includes('supabase.co') ||
    url.protocol.startsWith('chrome-extension')
  ) {
    return
  }

  // Navigation requests: Try network, fall back to cached shell
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cached = await caches.match('/')
        return cached || new Response('Offline', { status: 503, statusText: 'Offline' })
      })
    )
    return
  }

  // Static assets (CSS, JS, images, fonts): Stale-while-revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache))
          }
          return networkResponse
        })
        .catch(() => cachedResponse)

      return cachedResponse || fetchPromise
    })
  )
})

// 4. Push Notification Event Listener (Browser Push API)
self.addEventListener('push', (event) => {
  let data = {}

  if (event.data) {
    try {
      data = event.data.json()
    } catch {
      data = { title: 'BharatLingo Reminder', body: event.data.text() }
    }
  }

  const title = data.title || 'BharatLingo — Keep Your Streak Alive! 🔥'
  const options = {
    body: data.body || 'Practice your Indian language lessons today to keep your daily learning streak going.',
    icon: data.icon || '/icons/icon-192.png',
    badge: data.badge || '/icons/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/dashboard',
      timestamp: Date.now(),
    },
    actions: [
      { action: 'practice', title: 'Practice Now' },
      { action: 'dismiss', title: 'Later' },
    ],
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

// 5. Notification Click Action Listener
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'dismiss') {
    return
  }

  const targetUrl = event.notification.data?.url || '/dashboard'

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Focus existing open tab if available
        for (const client of windowClients) {
          if ('focus' in client) {
            client.navigate(targetUrl)
            return client.focus()
          }
        }
        // Open new window if none active
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl)
        }
      })
  )
})
