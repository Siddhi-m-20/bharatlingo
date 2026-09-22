import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'

console.log('--- 1. VERIFYING PRODUCTION BUILD ARTIFACTS ---')
const distDir = path.resolve('dist')
assert.ok(fs.existsSync(path.join(distDir, 'index.html')), 'dist/index.html must exist')
assert.ok(fs.existsSync(path.join(distDir, 'manifest.json')), 'dist/manifest.json must exist')
assert.ok(fs.existsSync(path.join(distDir, 'sw.js')), 'dist/sw.js must exist')
assert.ok(fs.existsSync(path.join(distDir, 'icons/icon-192.png')), 'dist/icons/icon-192.png must exist')
assert.ok(fs.existsSync(path.join(distDir, 'icons/icon-512.png')), 'dist/icons/icon-512.png must exist')
console.log('✅ All production build assets verified in dist/')

console.log('--- 2. VERIFYING HTML SHELL & MANIFEST INTEGRATION ---')
const html = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8')
assert.ok(html.includes('rel="manifest"'), 'HTML must link manifest')
assert.ok(html.includes('id="root"'), 'HTML must contain root div')
console.log('✅ HTML shell correctly configured for SPA & PWA')

console.log('--- 3. VERIFYING VERCEL ROUTING CONFIG ---')
const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'))
assert.ok(Array.isArray(vercelConfig.rewrites), 'vercel.json must have rewrites')
assert.equal(vercelConfig.rewrites[0].source, '/((?!api/).*)', 'rewrites must preserve /api/ routes')
assert.equal(vercelConfig.rewrites[0].destination, '/index.html', 'rewrites must point to /index.html')
console.log('✅ vercel.json rewrite rule perfectly configured for SPA + Serverless')

console.log('--- 4. VERIFYING VERCEL SERVERLESS PUSH HANDLER ---')
const { default: handler } = await import('../api/push.js')

let gStatus, gJson
await handler(
  { method: 'GET' },
  {
    setHeader: () => {},
    status: (s) => ({
      json: (j) => {
        gStatus = s
        gJson = j
      },
      end: () => {},
    }),
  }
)
assert.equal(gStatus, 200, 'GET /api/push must return 200')
assert.ok(gJson.publicKey, 'GET /api/push must return VAPID public key')
console.log('✅ /api/push GET returns 200 with public key: ' + gJson.publicKey.slice(0, 16) + '...')

let pStatus, pJson
await handler(
  { method: 'POST', body: {} },
  {
    setHeader: () => {},
    status: (s) => ({
      json: (j) => {
        pStatus = s
        pJson = j
      },
      end: () => {},
    }),
  }
)
assert.equal(pStatus, 400, 'POST /api/push with empty body must reject 400')
console.log('✅ /api/push POST safely rejects invalid subscription with 400')

console.log('\n--- 5. VERIFYING PRODUCTION CLIENT ROUTE INTEGRITY ---')
const appContent = fs.readFileSync('src/App.jsx', 'utf8')
const requiredRoutes = [
  '/onboarding',
  '/assessment',
  '/dashboard',
  '/games',
  '/games/:gameId',
  '/writing',
]
for (const route of requiredRoutes) {
  assert.ok(appContent.includes(`path="${route}"`), `Route ${route} must be registered in App.jsx`)
  console.log(`✅ Production route verified: ${route}`)
}

console.log('\n🎉 ALL PRODUCTION SMOKE TESTS PASSED WITH 100% SUCCESS!')
