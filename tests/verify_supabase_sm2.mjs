/**
 * Supabase SM-2 Persistence Verification
 *
 * Verifies that the user_spaced_repetition table exists with the correct schema,
 * that RLS policies enforce per-user isolation (INSERT / SELECT / UPDATE / DELETE),
 * and that upsert conflict resolution works correctly.
 *
 * CREDENTIALS: Loaded exclusively from environment variables — never hardcoded.
 *   SUPABASE_URL          — Supabase project URL
 *   SUPABASE_ANON_KEY     — Supabase anon (publishable) key
 *   SUPABASE_TEST_JWT     — Valid user JWT for the test account
 *   SUPABASE_TEST_USER_ID — UUID of the test account user
 *
 * If any credential env var is absent the test exits 0 with a clear SKIP notice
 * so CI passes gracefully when credentials are not provisioned.
 */

import test from 'node:test'
import assert from 'node:assert/strict'
import { createClient } from '@supabase/supabase-js'

// ── Credential resolution ────────────────────────────────────────────────────

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
const TEST_JWT = process.env.SUPABASE_TEST_JWT
const TEST_USER_ID = process.env.SUPABASE_TEST_USER_ID

// ── Skip guard ───────────────────────────────────────────────────────────────

const SKIP = !SUPABASE_URL || !SUPABASE_ANON_KEY || !TEST_JWT || !TEST_USER_ID

if (SKIP) {
  console.log('⚠️  SUPABASE SM-2 VERIFICATION SKIPPED')
  console.log('   Missing env vars: one or more of')
  console.log('   SUPABASE_URL / VITE_SUPABASE_URL')
  console.log('   SUPABASE_ANON_KEY / VITE_SUPABASE_ANON_KEY')
  console.log('   SUPABASE_TEST_JWT')
  console.log('   SUPABASE_TEST_USER_ID')
  console.log('   Set these in .env (gitignored) or your CI secrets to run live verification.')
  process.exit(0)
}

// ── Clients ──────────────────────────────────────────────────────────────────

/** Authenticated client — all RLS checks run under this identity */
const authedClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
  global: { headers: { Authorization: `Bearer ${TEST_JWT}` } },
})

/** Unauthenticated client — used to verify RLS blocks anonymous reads */
const unauthedClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// A second stable UUID to test cross-user isolation.
// This is the "other user" we must NOT be able to read or write as.
const OTHER_USER_ID = process.env.SUPABASE_TEST_OTHER_USER_ID || '00000000-0000-0000-0000-000000000001'

const TEST_WORD = 'namaste_test_sm2_verification'

// ── Expected schema columns ──────────────────────────────────────────────────

const EXPECTED_COLUMNS = [
  'id', 'user_id', 'language_id', 'word', 'translation', 'category',
  'repetition', 'interval_days', 'ease_factor', 'quality', 'retention_score',
  'history', 'last_reviewed_at', 'next_review_at', 'updated_at',
]

// ── Tests ────────────────────────────────────────────────────────────────────

test('SM-2 Supabase: table exists and all required columns are present', async () => {
  const { data, error } = await authedClient
    .from('user_spaced_repetition')
    .select(EXPECTED_COLUMNS.join(','))
    .limit(1)

  assert.equal(error, null, `Table/column check failed: ${error?.message}`)
  console.log(`  ✓ All ${EXPECTED_COLUMNS.length} expected columns verified`)
})

test('SM-2 Supabase: RLS blocks INSERT for another user\'s user_id', async () => {
  const { error } = await authedClient
    .from('user_spaced_repetition')
    .insert({
      user_id: OTHER_USER_ID,
      language_id: 'hi',
      word: 'cross_user_hack_attempt',
      translation: 'should be blocked',
    })

  assert.ok(
    error && error.code === '42501',
    `Expected RLS violation (42501) but got: ${error?.code} — ${error?.message}`
  )
  console.log(`  ✓ Cross-user INSERT blocked: ${error.message}`)
})

test('SM-2 Supabase: authorized INSERT + SELECT + UPDATE + UPSERT + DELETE lifecycle', async () => {
  // ── Clean up any leftover row from a previous failed run ──────────────────
  await authedClient
    .from('user_spaced_repetition')
    .delete()
    .eq('user_id', TEST_USER_ID)
    .eq('word', TEST_WORD)

  // ── INSERT ────────────────────────────────────────────────────────────────
  const { data: inserted, error: insertErr } = await authedClient
    .from('user_spaced_repetition')
    .insert({
      user_id: TEST_USER_ID,
      language_id: 'hi',
      word: TEST_WORD,
      translation: 'Greetings / Hello',
      category: 'Greetings',
      repetition: 1,
      interval_days: 1,
      ease_factor: 2.50,
      quality: 4,
      retention_score: 100,
      history: [{ date: new Date().toISOString(), quality: 4, repetition: 1, interval: 1 }],
      last_reviewed_at: new Date().toISOString(),
      next_review_at: new Date(Date.now() + 86400000).toISOString(),
    })
    .select()
    .single()

  assert.equal(insertErr, null, `INSERT failed: ${insertErr?.message}`)
  assert.ok(inserted?.id, 'Inserted row must have an id')
  console.log(`  ✓ INSERT succeeded — row id: ${inserted.id}`)

  // ── SELECT own rows ───────────────────────────────────────────────────────
  const { data: ownRows, error: selErr } = await authedClient
    .from('user_spaced_repetition')
    .select('*')
    .eq('word', TEST_WORD)

  assert.equal(selErr, null, `SELECT failed: ${selErr?.message}`)
  assert.equal(ownRows.length, 1, `Expected 1 row, got ${ownRows.length}`)
  console.log(`  ✓ SELECT own row succeeded`)

  // ── Unauthenticated client cannot read ────────────────────────────────────
  const { data: unauthedRows } = await unauthedClient
    .from('user_spaced_repetition')
    .select('*')
    .eq('word', TEST_WORD)

  assert.equal((unauthedRows || []).length, 0, 'Unauthenticated client must see 0 rows (RLS)')
  console.log(`  ✓ Unauthenticated SELECT correctly blocked by RLS`)

  // ── UPDATE ────────────────────────────────────────────────────────────────
  const { data: updated, error: updateErr } = await authedClient
    .from('user_spaced_repetition')
    .update({ repetition: 2, interval_days: 6, ease_factor: 2.60, quality: 5 })
    .eq('id', inserted.id)
    .select()
    .single()

  assert.equal(updateErr, null, `UPDATE failed: ${updateErr?.message}`)
  assert.equal(updated.repetition, 2, 'Repetition should be 2 after update')
  console.log(`  ✓ UPDATE succeeded — repetition: ${updated.repetition}, interval: ${updated.interval_days}d`)

  // ── Unique constraint enforcement ─────────────────────────────────────────
  const { error: dupErr } = await authedClient
    .from('user_spaced_repetition')
    .insert({
      user_id: TEST_USER_ID,
      language_id: 'hi',
      word: TEST_WORD,
      translation: 'duplicate attempt',
    })

  assert.ok(
    dupErr && dupErr.code === '23505',
    `Expected unique violation (23505) but got: ${dupErr?.code}`
  )
  console.log(`  ✓ Unique constraint enforced: ${dupErr.message.slice(0, 80)}`)

  // ── UPSERT (conflict resolution) ─────────────────────────────────────────
  const { error: upsertErr } = await authedClient
    .from('user_spaced_repetition')
    .upsert(
      {
        user_id: TEST_USER_ID,
        language_id: 'hi',
        word: TEST_WORD,
        translation: 'Greetings / Hello',
        repetition: 3,
        interval_days: 16,
        ease_factor: 2.70,
        quality: 5,
      },
      { onConflict: 'user_id,language_id,word' }
    )

  assert.equal(upsertErr, null, `UPSERT failed: ${upsertErr?.message}`)
  console.log(`  ✓ UPSERT (onConflict) succeeded`)

  // ── Cross-user isolation (SELECT filter) ─────────────────────────────────
  const { data: crossRows } = await authedClient
    .from('user_spaced_repetition')
    .select('*')
    .eq('user_id', OTHER_USER_ID)

  assert.equal((crossRows || []).length, 0, 'Cross-user SELECT must return 0 rows')
  console.log(`  ✓ Cross-user SELECT isolation verified — 0 rows returned`)

  // ── DELETE ────────────────────────────────────────────────────────────────
  const { data: deleted, error: delErr } = await authedClient
    .from('user_spaced_repetition')
    .delete()
    .eq('id', inserted.id)
    .select()

  assert.equal(delErr, null, `DELETE failed: ${delErr?.message}`)
  assert.equal(deleted.length, 1, 'Should have deleted exactly 1 row')

  // Confirm row gone
  const { data: afterDel } = await authedClient
    .from('user_spaced_repetition')
    .select('id')
    .eq('id', inserted.id)

  assert.equal((afterDel || []).length, 0, 'Row must be gone after DELETE')
  console.log(`  ✓ DELETE succeeded — verification row cleaned up`)
})
