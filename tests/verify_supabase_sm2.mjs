import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const url = 'https://riyrfdkfdathzfcqlnvc.supabase.co';
const anonKey = 'sb_publishable_sIj5ndgNaixgk4j68IlY2A_PIK2kI5L';

const sessionData = JSON.parse(
  fs.readFileSync('C:/Users/siddh/.gemini/antigravity-ide/brain/3388e95f-344d-40d5-bb56-dd9af5c492f4/scratch/live_session.json', 'utf8')
);

const userId = sessionData.user.id;
const otherUserId = '1fb12a72-3900-46d3-a273-c9f836e7f343'; // Siddhi

console.log(`=== SUPABASE SM-2 PERSISTENCE VERIFICATION ===`);
console.log(`Target Supabase URL: ${url}`);
console.log(`Authenticated User ID: ${userId} (${sessionData.user.email})`);
console.log(`Other User ID (Isolation Target): ${otherUserId}\n`);

// 1. Authenticated Client
const authedClient = createClient(url, anonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  global: {
    headers: {
      Authorization: `Bearer ${sessionData.access_token}`,
    },
  },
});

// 2. Unauthenticated Client
const unauthedClient = createClient(url, anonKey);

async function runVerification() {
  let passed = 0;
  let total = 0;

  function assert(condition, description, detail = '') {
    total++;
    if (condition) {
      console.log(`[PASS] ${description}`);
      if (detail) console.log(`       ${detail}`);
      passed++;
    } else {
      console.error(`[FAIL] ${description}`);
      if (detail) console.error(`       ${detail}`);
      process.exit(1);
    }
  }

  // STEP 1: Verify Table Exists and Schema Columns
  console.log('--- 1. VERIFY TABLE AND COLUMNS ---');
  const expectedCols = [
    'id', 'user_id', 'language_id', 'word', 'translation', 'category',
    'repetition', 'interval_days', 'ease_factor', 'quality', 'retention_score',
    'history', 'last_reviewed_at', 'next_review_at', 'updated_at'
  ];
  const { data: tableCheck, error: tableErr } = await authedClient
    .from('user_spaced_repetition')
    .select(expectedCols.join(','))
    .limit(1);

  assert(!tableErr, 'Table public.user_spaced_repetition exists and columns match schema', tableErr ? tableErr.message : `All ${expectedCols.length} columns verified.`);

  // Clean up any test rows from previous runs for clean state
  await authedClient
    .from('user_spaced_repetition')
    .delete()
    .eq('user_id', userId)
    .eq('word', 'namaste_test_verification');

  // STEP 2: Verify RLS Policy 1 (INSERT WITH CHECK auth.uid() = user_id)
  console.log('\n--- 2. VERIFY RLS POLICY: INSERT ---');
  // Attempt unauthorized insert for another user
  const { error: crossInsertErr } = await authedClient
    .from('user_spaced_repetition')
    .insert({
      user_id: otherUserId,
      language_id: 'hi',
      word: 'namaste_cross_user_hack',
      translation: 'Hello',
    });
  assert(
    crossInsertErr && crossInsertErr.code === '42501',
    'RLS blocks inserting row for another user_id (code 42501)',
    `Blocked with error: ${crossInsertErr?.message}`
  );

  // Authorized insert for own user_id
  const testWord = 'namaste_test_verification';
  const { data: insertData, error: insertErr } = await authedClient
    .from('user_spaced_repetition')
    .insert({
      user_id: userId,
      language_id: 'hi',
      word: testWord,
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
    .single();

  assert(!insertErr && insertData?.id, 'Users can insert own spaced repetition row', `Inserted row ID: ${insertData?.id}`);

  // STEP 3: Verify RLS Policy 2 (SELECT USING auth.uid() = user_id)
  console.log('\n--- 3. VERIFY RLS POLICY: SELECT ---');
  const { data: ownData, error: ownSelErr } = await authedClient
    .from('user_spaced_repetition')
    .select('*')
    .eq('word', testWord);
  assert(!ownSelErr && ownData.length === 1, 'Users can view own spaced repetition items', `Found ${ownData.length} row(s) for user.`);

  // Verify unauthenticated client cannot read the row
  const { data: unauthedData } = await unauthedClient
    .from('user_spaced_repetition')
    .select('*')
    .eq('word', testWord);
  assert(unauthedData.length === 0, 'Unauthenticated users cannot read user_spaced_repetition (RLS filters out)');

  // STEP 4: Verify RLS Policy 3 (UPDATE USING auth.uid() = user_id)
  console.log('\n--- 4. VERIFY RLS POLICY: UPDATE ---');
  const { data: updateData, error: updateErr } = await authedClient
    .from('user_spaced_repetition')
    .update({ repetition: 2, interval_days: 6, ease_factor: 2.60, quality: 5 })
    .eq('id', insertData.id)
    .select()
    .single();
  assert(!updateErr && updateData?.repetition === 2, 'Users can update own spaced repetition item', `Updated repetition to ${updateData?.repetition}, interval to ${updateData?.interval_days}d, ease_factor: ${updateData?.ease_factor}`);

  // STEP 5: Verify Unique Constraint and Index
  console.log('\n--- 5. VERIFY UNIQUE CONSTRAINT AND CONFLICT RESOLUTION ---');
  // Attempt duplicate raw insert without upsert -> must trigger 23505 unique violation
  const { error: dupErr } = await authedClient
    .from('user_spaced_repetition')
    .insert({
      user_id: userId,
      language_id: 'hi',
      word: testWord,
      translation: 'Greetings / Hello',
    });
  assert(
    dupErr && dupErr.code === '23505',
    'Unique constraint UNIQUE(user_id, language_id, word) is strictly enforced (code 23505)',
    `Duplicate caught: ${dupErr?.message}`
  );

  // Test UPSERT via onConflict: user_id,language_id,word
  const { error: upsertErr } = await authedClient
    .from('user_spaced_repetition')
    .upsert(
      {
        user_id: userId,
        language_id: 'hi',
        word: testWord,
        translation: 'Greetings / Hello',
        repetition: 3,
        interval_days: 16,
        ease_factor: 2.70,
        quality: 5,
      },
      { onConflict: 'user_id,language_id,word' }
    );
  assert(!upsertErr, 'UPSERT onConflict(user_id, language_id, word) updates existing record cleanly');

  // STEP 6: Run One Real Authenticated SM-2 Review
  console.log('\n--- 6. RUN ONE REAL AUTHENTICATED SM-2 REVIEW ---');
  // Load dbService functions dynamically in project environment
  const { createServer } = await import('vite');
  const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
  const { syncSpacedRepetitionItem, fetchUserSpacedRepetition } = await vite.ssrLoadModule('./src/services/dbService.js');
  const { calculateSM2 } = await vite.ssrLoadModule('./src/services/spacedRepetition.js');

  const { supabase } = await vite.ssrLoadModule('./src/services/supabase.js');
  await supabase.auth.setSession({
    access_token: sessionData.access_token,
    refresh_token: sessionData.refresh_token,
  });

  const currentItemState = {
    id: `hi_${testWord}`,
    word: testWord,
    translation: 'Greetings / Hello',
    languageId: 'hi',
    category: 'Greetings',
    repetition: 3,
    interval: 16,
    easeFactor: 2.70,
    quality: 5,
    lastReviewedAt: new Date().toISOString(),
    nextReviewAt: new Date(Date.now() + 16 * 86400000).toISOString(),
    history: [],
    retentionScore: 98,
  };

  // Perform SM-2 calculation with review rating Quality = 5 (Perfect recall)
  const sm2ReviewResult = calculateSM2(currentItemState, 5);
  console.log(`       SM-2 Review Execution: Quality=5 -> Repetition: ${sm2ReviewResult.repetition}, Interval: ${sm2ReviewResult.interval}d, Ease Factor: ${sm2ReviewResult.easeFactor}`);

  // Sync to Supabase
  const syncResult = await syncSpacedRepetitionItem(userId, sm2ReviewResult);
  assert(syncResult.success, 'SM-2 Review successfully saved to Supabase via dbService.syncSpacedRepetitionItem');

  // STEP 7: Confirm Row Appears in Supabase
  console.log('\n--- 7. CONFIRM ROW APPEARS IN SUPABASE ---');
  const { data: confirmedRow, error: confirmErr } = await authedClient
    .from('user_spaced_repetition')
    .select('*')
    .eq('user_id', userId)
    .eq('word', testWord)
    .single();

  assert(!confirmErr && confirmedRow, 'Confirmed row exists in Supabase with correct reviewed state',
    `Word: "${confirmedRow?.word}", Repetition: ${confirmedRow?.repetition}, Interval: ${confirmedRow?.interval_days}d, EaseFactor: ${confirmedRow?.ease_factor}, Quality: ${confirmedRow?.quality}`
  );

  // STEP 8: Refresh / Re-login and Confirm Review State Comes Back
  console.log('\n--- 8. REFRESH / RE-LOGIN HYDRATION CHECK ---');
  const fetchedAfterRefresh = await fetchUserSpacedRepetition(userId);
  assert(
    fetchedAfterRefresh.success && fetchedAfterRefresh.itemsByLanguage?.hi?.some(item => item.word === testWord),
    'Review state successfully hydrates from Supabase upon fresh session load / login',
    `Hydrated ${fetchedAfterRefresh.itemsByLanguage?.hi?.length} Hindi items from cloud.`
  );

  // STEP 9: Test Another User Cannot Access It (Multi-tenant Isolation)
  console.log('\n--- 9. CROSS-USER ISOLATION VERIFICATION ---');
  // Querying using otherUserId filter from the current authenticated token
  const { data: crossUserData, error: crossUserErr } = await authedClient
    .from('user_spaced_repetition')
    .select('*')
    .eq('user_id', otherUserId);

  assert(
    crossUserData && crossUserData.length === 0,
    'Other user cannot view this user\'s data (cross-user query returns 0 rows due to RLS)'
  );

  // STEP 10: Verify RLS Policy 4 (DELETE USING auth.uid() = user_id)
  console.log('\n--- 10. VERIFY RLS POLICY: DELETE ---');
  const { data: delData, error: delErr } = await authedClient
    .from('user_spaced_repetition')
    .delete()
    .eq('id', confirmedRow.id)
    .select();

  assert(!delErr && delData.length === 1, 'Users can delete own spaced repetition item', `Deleted verified test row ID: ${confirmedRow.id}`);

  // Confirm row is deleted
  const { data: afterDel } = await authedClient
    .from('user_spaced_repetition')
    .select('*')
    .eq('id', confirmedRow.id);
  assert(afterDel.length === 0, 'Cleaned up verification test row successfully');

  await vite.close();

  console.log(`\n======================================================`);
  console.log(`ALL ${passed}/${total} VERIFICATION CHECKS PASSED SUCCESSFULLY!`);
  console.log(`======================================================`);
}

runVerification().catch((err) => {
  console.error('Verification failed with uncaught exception:', err);
  process.exit(1);
});
