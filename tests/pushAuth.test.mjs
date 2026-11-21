import test from 'node:test'
import assert from 'node:assert/strict'
import {
  authenticateRequest,
  checkPushRateLimit,
  getBearerToken,
  resetPushRateLimits,
  subscriptionsMatch,
} from '../server/services/pushAuth.js'
import { isValidSubscription } from '../server/services/pushService.js'

const validSubscription = {
  endpoint: 'https://push.service/user-a',
  keys: { auth: 'auth-user-a', p256dh: 'p256dh-user-a' },
}

function request(authorization) {
  return { headers: authorization ? { authorization } : {} }
}

test('Push auth rejects a missing bearer token with 401', async () => {
  const result = await authenticateRequest(request())
  assert.equal(result.statusCode, 401)
})

test('Push auth rejects invalid and expired tokens with 401', async () => {
  const verifier = async (token) => ({
    user: null,
    reason: token === 'expired-token' ? 'invalid_token' : 'invalid_token',
  })

  for (const token of ['invalid-token', 'expired-token']) {
    const result = await authenticateRequest(request(`Bearer ${token}`), verifier)
    assert.equal(result.statusCode, 401)
    assert.match(result.error, /Invalid or expired/)
  }
})

test('Push auth accepts only a verified user identity', async () => {
  let receivedToken = null
  const verifier = async (token) => {
    receivedToken = token
    return { user: { id: 'user-a' }, client: { name: 'token-bound-client' } }
  }

  const result = await authenticateRequest(request('Bearer verified-token'), verifier)
  assert.equal(receivedToken, 'verified-token')
  assert.equal(result.user.id, 'user-a')
  assert.equal(result.token, 'verified-token')
})

test('Malformed push subscriptions are rejected', () => {
  assert.equal(isValidSubscription(null), false)
  assert.equal(isValidSubscription({ endpoint: 'not-a-url' }), false)
  assert.equal(isValidSubscription({ endpoint: 'http://push.service/user-a', keys: validSubscription.keys }), false)
  assert.equal(isValidSubscription({ endpoint: validSubscription.endpoint, keys: { auth: '', p256dh: 'key' } }), false)
  assert.equal(isValidSubscription(validSubscription), true)
})

test('A subscription cannot be used by another authenticated user', () => {
  const otherUserSubscription = {
    ...validSubscription,
    endpoint: 'https://push.service/user-b',
  }

  assert.equal(subscriptionsMatch(validSubscription, otherUserSubscription), false)
  assert.equal(subscriptionsMatch(validSubscription, { ...validSubscription }), true)
})

test('Legitimate authenticated request can be matched to its stored subscription', async () => {
  const auth = await authenticateRequest(
    request('Bearer user-a-token'),
    async () => ({ user: { id: 'user-a' }, client: {} }),
  )
  const storedSubscription = { ...validSubscription }

  assert.equal(auth.statusCode, undefined)
  assert.equal(auth.user.id, 'user-a')
  assert.equal(subscriptionsMatch(storedSubscription, validSubscription), true)
})

test('Push sends are rate limited per verified user', () => {
  resetPushRateLimits()
  for (let attempt = 0; attempt < 10; attempt += 1) {
    assert.equal(checkPushRateLimit('user-a').allowed, true)
  }
  const blocked = checkPushRateLimit('user-a')
  assert.equal(blocked.allowed, false)
  assert.ok(blocked.retryAfterSeconds > 0)
  assert.equal(checkPushRateLimit('user-b').allowed, true)
  resetPushRateLimits()
})

test('Bearer token parsing does not accept arbitrary authorization values', () => {
  assert.equal(getBearerToken(request('Basic abc')), null)
  assert.equal(getBearerToken(request('Bearer one two')), null)
  assert.equal(getBearerToken(request('Bearer verified-token')), 'verified-token')
})
