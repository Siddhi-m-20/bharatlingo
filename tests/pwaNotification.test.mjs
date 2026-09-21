import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { isPushSupported, getNotificationPermission } from '../src/services/notificationService.js'

test('PWA Manifest: File exists and has valid production configuration', () => {
  const manifestPath = path.resolve('public/manifest.json')
  assert.ok(fs.existsSync(manifestPath), 'manifest.json must exist in public directory')

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  assert.equal(manifest.name, 'BharatLingo — Learn Indian Languages')
  assert.equal(manifest.short_name, 'BharatLingo')
  assert.equal(manifest.display, 'standalone')
  assert.equal(manifest.theme_color, '#0B8F62')
  assert.equal(manifest.background_color, '#F7F5EF')
  assert.equal(manifest.start_url, '/')

  assert.ok(Array.isArray(manifest.icons) && manifest.icons.length >= 2, 'Must include icons')
  for (const icon of manifest.icons) {
    const iconFilePath = path.resolve('public', icon.src.replace(/^\//, ''))
    assert.ok(fs.existsSync(iconFilePath), `Icon file ${icon.src} must exist at ${iconFilePath}`)
  }
})

test('PWA Service Worker: Script exists and registers cache, fetch, push, and notificationclick handlers', () => {
  const swPath = path.resolve('public/sw.js')
  assert.ok(fs.existsSync(swPath), 'sw.js must exist in public directory')

  const swContent = fs.readFileSync(swPath, 'utf8')
  assert.ok(swContent.includes("addEventListener('install'"), 'SW must have install event listener')
  assert.ok(swContent.includes("addEventListener('activate'"), 'SW must have activate event listener')
  assert.ok(swContent.includes("addEventListener('fetch'"), 'SW must have fetch event listener')
  assert.ok(swContent.includes("addEventListener('push'"), 'SW must have push event listener')
  assert.ok(swContent.includes("addEventListener('notificationclick'"), 'SW must have notificationclick event listener')
})

test('HTML PWA Integration: index.html links manifest and iOS apple-touch-icon', () => {
  const indexPath = path.resolve('index.html')
  const indexContent = fs.readFileSync(indexPath, 'utf8')

  assert.ok(indexContent.includes('rel="manifest"'), 'index.html must link manifest.json')
  assert.ok(indexContent.includes('rel="apple-touch-icon"'), 'index.html must have apple-touch-icon')
  assert.ok(indexContent.includes('name="theme-color" content="#0B8F62"'), 'index.html must specify theme-color')
})

test('Notification Service: Safe execution in Node/SSR and zero exposed credentials', () => {
  // In Node environment without browser window
  assert.equal(isPushSupported(), false, 'isPushSupported should be safely false in Node environment')
  assert.equal(getNotificationPermission(), 'unsupported', 'getNotificationPermission should return unsupported in Node')

  // Inspect notificationService for any hardcoded private keys or secrets
  const servicePath = path.resolve('src/services/notificationService.js')
  const serviceContent = fs.readFileSync(servicePath, 'utf8')

  assert.equal(serviceContent.includes('service_role'), false, 'Service role key must not exist')
  assert.equal(serviceContent.includes('VAPID_PRIVATE_KEY'), false, 'VAPID private key must not exist')
})

test('Backend Push Service: Subscription validation & VAPID resolution', async () => {
  const { isValidSubscription, getVapidPublicKey, sendPushNotification } = await import(
    '../server/services/pushService.js'
  )

  const pubKey = getVapidPublicKey()
  assert.ok(typeof pubKey === 'string' && pubKey.length > 20, 'Must have a valid public key')

  // Validation
  assert.equal(isValidSubscription(null), false)
  assert.equal(isValidSubscription({}), false)
  assert.equal(isValidSubscription({ endpoint: 'not-a-url' }), false)
  assert.equal(isValidSubscription({ endpoint: 'https://push.service/123' }), false)
  assert.equal(
    isValidSubscription({
      endpoint: 'https://push.service/123',
      keys: { auth: 'auth123', p256dh: 'p256dh123' },
    }),
    true
  )

  // Disallow invalid subscription
  const invalidRes = await sendPushNotification({ endpoint: 'bad' })
  assert.equal(invalidRes.success, false)
  assert.equal(invalidRes.statusCode, 400)
  assert.equal(invalidRes.invalid, true)
})

test('Backend Push Delivery: End-to-end simulation & expired subscription handling', async () => {
  const { sendPushNotification } = await import('../server/services/pushService.js')

  // Mock valid-shaped test subscription
  const testSub = {
    endpoint: 'https://fcm.googleapis.com/fcm/send/test-mock-token',
    keys: {
      auth: 'BC4abcdef1234567890=',
      p256dh: 'BCvkNefqYlkTi1ATnFmoz-t906jPgPvctWCaI8ujqNZHLCWtDddvj0eyS6e5nQKn6D4GwtDj0FoWu2cG5qUnU0Y=',
    },
  }

  const payload = {
    title: 'Hindi Streak Safe! 🔥',
    body: 'Great job maintaining your Hindi streak today!',
    url: '/dashboard',
  }

  const result = await sendPushNotification(testSub, payload)

  // Result must either succeed (201) or safely report push endpoint failure (e.g. 400/404/410) without throwing unhandled exceptions
  assert.ok(typeof result.statusCode === 'number', 'Must return numeric HTTP status code')
  if (!result.success) {
    assert.ok(result.error, 'Must provide explanatory error message')
    assert.ok(typeof result.expired === 'boolean', 'Must identify subscription expiration state')
  } else {
    assert.equal(result.payload.title, payload.title)
  }
})

test('Client Service Worker Push Handler: Payload schema conformance', () => {
  const swPath = path.resolve('public/sw.js')
  const swContent = fs.readFileSync(swPath, 'utf8')

  // Verify push listener processes data.json() and sets title, body, icon, and data.url
  assert.ok(swContent.includes('event.data.json()'))
  assert.ok(swContent.includes('self.registration.showNotification'))
  assert.ok(swContent.includes('notificationclick'))
  assert.ok(swContent.includes('targetUrl'))
})

test('Production Security Audit: VAPID private key is NEVER exposed in client bundle', () => {
  // Check dist directory if it exists
  const distDir = path.resolve('dist')
  if (fs.existsSync(distDir)) {
    const checkDir = (dir) => {
      const files = fs.readdirSync(dir)
      for (const file of files) {
        const fullPath = path.join(dir, file)
        if (fs.statSync(fullPath).isDirectory()) {
          checkDir(fullPath)
        } else if (file.endsWith('.js')) {
          const content = fs.readFileSync(fullPath, 'utf8')
          assert.equal(
            content.includes('7v9pCsV-juMrSGLN-dGEZuTL4tQcavHouQcC5tVZn54'),
            false,
            `Private VAPID key was leaked into client build file: ${file}`
          )
          assert.equal(
            content.includes('service_role'),
            false,
            `Supabase service_role key was leaked into client build file: ${file}`
          )
        }
      }
    }
    checkDir(distDir)
  }
})

