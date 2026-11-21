/**
 * Unit tests for the SuperMemo SM-2 spaced repetition algorithm.
 * A bug here silently corrupts review schedules — items may never be reviewed
 * or reviewed far too often.
 *
 * Run with: node --test tests/spacedRepetition.test.mjs
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { calculateSM2, createInitialItem } from '../src/services/spacedRepetition.js'

// ── createInitialItem ─────────────────────────────────────────────────────────

test('new item starts with correct SM-2 defaults', () => {
  const item = createInitialItem('पानी', 'Water', 'hi', 'everyday')
  assert.equal(item.word, 'पानी')
  assert.equal(item.translation, 'Water')
  assert.equal(item.languageId, 'hi')
  assert.equal(item.repetition, 0)
  assert.equal(item.interval, 0)
  assert.equal(item.easeFactor, 2.5)
  assert.equal(item.quality, 0)
  assert.equal(item.retentionScore, 100)
  assert.ok(Array.isArray(item.history))
  assert.equal(item.history.length, 0)
})

test('item id is derived from languageId and word', () => {
  const item = createInitialItem('नमस्ते', 'Hello', 'hi')
  assert.equal(item.id, 'hi_नमस्ते')
})

// ── calculateSM2 — first review ───────────────────────────────────────────────

test('perfect answer (q=5) on new item schedules review in 1 day, repetition becomes 1', () => {
  const item = createInitialItem('test', 'test', 'hi')
  const result = calculateSM2(item, 5)
  assert.equal(result.repetition, 1)
  assert.equal(result.interval, 1)
  assert.ok(result.easeFactor > 2.5) // perfect answer increases ease
})

test('answer quality 4 on new item schedules review in 1 day', () => {
  const item = createInitialItem('test', 'test', 'hi')
  const result = calculateSM2(item, 4)
  assert.equal(result.repetition, 1)
  assert.equal(result.interval, 1)
})

test('answer quality 3 on new item schedules review in 1 day', () => {
  const item = createInitialItem('test', 'test', 'hi')
  const result = calculateSM2(item, 3)
  assert.equal(result.repetition, 1)
  assert.equal(result.interval, 1)
})

// ── calculateSM2 — second review ──────────────────────────────────────────────

test('second correct review (repetition=1) schedules review in 6 days', () => {
  const item = { ...createInitialItem('test', 'test', 'hi'), repetition: 1, interval: 1, easeFactor: 2.5 }
  const result = calculateSM2(item, 4)
  assert.equal(result.repetition, 2)
  assert.equal(result.interval, 6)
})

// ── calculateSM2 — third+ review ──────────────────────────────────────────────

test('third correct review uses interval × easeFactor formula', () => {
  const item = { ...createInitialItem('test', 'test', 'hi'), repetition: 2, interval: 6, easeFactor: 2.5 }
  const result = calculateSM2(item, 4)
  assert.equal(result.repetition, 3)
  assert.ok(result.interval > 6) // must grow
  assert.equal(result.interval, Math.round(6 * result.easeFactor))
})

// ── Failed recall ──────────────────────────────────────────────────────────────

test('failed recall (q=0) resets repetition to 0 and schedules review in 1 day', () => {
  const item = { ...createInitialItem('test', 'test', 'hi'), repetition: 5, interval: 30, easeFactor: 2.5 }
  const result = calculateSM2(item, 0)
  assert.equal(result.repetition, 0)
  assert.equal(result.interval, 1)
})

test('failed recall (q=2) resets repetition to 0', () => {
  const item = { ...createInitialItem('test', 'test', 'hi'), repetition: 3, interval: 20, easeFactor: 2.5 }
  const result = calculateSM2(item, 2)
  assert.equal(result.repetition, 0)
  assert.equal(result.interval, 1)
})

// ── Ease factor bounds ─────────────────────────────────────────────────────────

test('ease factor never drops below 1.3 no matter how many failures', () => {
  let item = createInitialItem('hard', 'hard', 'hi')
  for (let i = 0; i < 20; i++) {
    item = calculateSM2(item, 0)
  }
  assert.ok(item.easeFactor >= 1.3, `easeFactor ${item.easeFactor} dropped below 1.3`)
})

test('perfect repeated answers raise ease factor above starting value of 2.5', () => {
  let item = createInitialItem('easy', 'easy', 'hi')
  for (let i = 0; i < 5; i++) {
    item = calculateSM2(item, 5)
  }
  assert.ok(item.easeFactor > 2.5)
})

// ── Quality constraints ────────────────────────────────────────────────────────

test('quality is clamped to 0–5 range', () => {
  const item = createInitialItem('test', 'test', 'hi')
  const low = calculateSM2(item, -1)
  const high = calculateSM2(item, 10)
  assert.ok(low.quality >= 0)
  assert.ok(high.quality <= 5)
})

// ── History tracking ──────────────────────────────────────────────────────────

test('each review adds one entry to history', () => {
  let item = createInitialItem('test', 'test', 'hi')
  item = calculateSM2(item, 4)
  item = calculateSM2(item, 4)
  assert.equal(item.history.length, 2)
})

test('history is capped at 15 entries (last 14 preserved + 1 appended)', () => {
  let item = createInitialItem('test', 'test', 'hi')
  for (let i = 0; i < 30; i++) {
    item = calculateSM2(item, 4)
  }
  // Implementation keeps last 14 entries then appends 1 → max 15
  assert.ok(item.history.length <= 15, `history length ${item.history.length} exceeds 15`)
})

// ── Date scheduling ───────────────────────────────────────────────────────────

test('nextReviewAt is set to a future date after a successful review', () => {
  const item = createInitialItem('test', 'test', 'hi')
  const result = calculateSM2(item, 4)
  const nextDate = new Date(result.nextReviewAt)
  assert.ok(nextDate > new Date(), 'nextReviewAt should be in the future')
})

test('lastReviewedAt is approximately now', () => {
  const before = Date.now()
  const item = createInitialItem('test', 'test', 'hi')
  const result = calculateSM2(item, 4)
  const after = Date.now()
  const reviewedAt = new Date(result.lastReviewedAt).getTime()
  assert.ok(reviewedAt >= before - 1000)
  assert.ok(reviewedAt <= after + 1000)
})
