import { supabase, isSupabaseConfigured } from './supabase'

const persistenceQueues = new Map()

function enqueuePersistence(userId, operation) {
  const previous = persistenceQueues.get(userId) || Promise.resolve()
  const current = previous.catch(() => {}).then(operation)
  persistenceQueues.set(userId, current)
  return current.finally(() => {
    if (persistenceQueues.get(userId) === current) persistenceQueues.delete(userId)
  })
}

/**
 * BharatLingo Database Service
 * Connects to the 18 Supabase tables and provides full persistence with local cache fallback
 */

// 1. Record a completed lesson attempt & save user progress
export async function recordLessonCompletion({
  userId,
  lessonId,
  xpEarned,
  accuracy = 100,
  isPerfect = false,
  durationSeconds = 60,
  exercisesCompleted = 0,
  languageId = null,
}) {
  if (!userId) return null

  // If Supabase is active
  if (isSupabaseConfigured() && supabase) {
    try {
      // 1. Insert lesson attempt
      await supabase.from('lesson_attempts').insert([
        {
          user_id: userId,
          lesson_id: lessonId,
          xp_earned: xpEarned,
          accuracy: accuracy,
          is_perfect: isPerfect,
          duration_seconds: durationSeconds,
        },
      ])

      // 2. Upsert user progress row
      await supabase.from('user_progress').upsert(
        {
          user_id: userId,
          lesson_id: lessonId,
          status: 'completed',
          score: Math.round(accuracy),
          stars: isPerfect ? 3 : accuracy >= 80 ? 2 : 1,
          completed_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,lesson_id' }
      )

      // 3. Record XP transaction
      await supabase.from('xp_transactions').insert([
        {
          user_id: userId,
          amount: xpEarned,
          source_type: 'lesson_complete',
          reference_id: lessonId,
        },
      ])

      await recordLearningActivity({
        userId,
        activityDate: new Date().toISOString().slice(0, 10),
        exercisesCompleted,
        xpEarned,
        sessionDurationSeconds: durationSeconds,
        languageId,
        sessionType: 'lesson',
      })
    } catch (err) {
      console.warn('Supabase recordLessonCompletion sync error:', err)
    }
  }

  return { success: true }
}

export async function persistLearnerStats(userId, learnerStats) {
  if (!userId || !isSupabaseConfigured() || !supabase) return
  await enqueuePersistence(userId, async () => {
    try {
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('learner_stats')
        .eq('id', userId)
        .maybeSingle()
      if (fetchError) throw fetchError

      const languageId = learnerStats.languageId || 'hi'
      const currentStats = profile?.learner_stats && typeof profile.learner_stats === 'object'
        ? profile.learner_stats
        : {}
      const { error } = await supabase
        .from('profiles')
        .update({ learner_stats: { ...currentStats, [languageId]: learnerStats } })
        .eq('id', userId)
      if (error) throw error
    } catch (err) {
      console.warn('Supabase learner stats sync error:', err)
    }
  })
}

export async function recordLearningActivity({
  userId,
  activityDate,
  exercisesCompleted = 0,
  xpEarned = 0,
  sessionDurationSeconds = 0,
  languageId = null,
  sessionType = 'lesson',
}) {
  if (!userId || !isSupabaseConfigured() || !supabase) return
  await enqueuePersistence(userId, async () => {
    try {
      const { data: existing, error: fetchError } = await supabase
        .from('learning_activity')
        .select('exercises_completed, xp_earned, session_duration_seconds')
        .eq('user_id', userId)
        .eq('activity_date', activityDate)
        .eq('session_type', sessionType)
        .maybeSingle()
      if (fetchError) throw fetchError

      const { error } = await supabase.from('learning_activity').upsert(
        {
          user_id: userId,
          activity_date: activityDate,
          exercises_completed: (existing?.exercises_completed || 0) + exercisesCompleted,
          xp_earned: (existing?.xp_earned || 0) + xpEarned,
          session_duration_seconds: (existing?.session_duration_seconds || 0) + sessionDurationSeconds,
          language_id: languageId,
          session_type: sessionType,
        },
        { onConflict: 'user_id,activity_date,session_type' },
      )
      if (error) throw error
    } catch (err) {
      console.warn('Supabase learning activity sync error:', err)
    }
  })
}

// 2. Record Streak updates in streaks table
export async function syncStreakToDatabase(userId, streakCount, lastDate) {
  if (!userId || !isSupabaseConfigured() || !supabase) return

  try {
    const { data: current } = await supabase
      .from('streaks')
      .select('longest_streak')
      .eq('user_id', userId)
      .maybeSingle()

    await supabase.from('streaks').upsert(
      {
        user_id: userId,
        current_streak: streakCount,
        longest_streak: Math.max(Number(current?.longest_streak) || 0, streakCount),
        last_extended_date: lastDate,
      },
      { onConflict: 'user_id' }
    )
  } catch (err) {
    console.warn('Supabase streak sync error:', err)
  }
}

export async function fetchLearningAnalytics(userId, languageId) {
  if (!userId || !isSupabaseConfigured() || !supabase) {
    return { activity: [], lessonAttempts: [], longestStreak: 0 }
  }

  try {
    const since = new Date()
    since.setDate(since.getDate() - 41)
    const sinceDate = since.toISOString().slice(0, 10)

    const [{ data: activity, error: activityError }, { data: lessonAttempts, error: attemptsError }, { data: streak, error: streakError }] = await Promise.all([
      supabase
        .from('learning_activity')
        .select('activity_date, exercises_completed, xp_earned, session_duration_seconds, language_id, session_type')
        .eq('user_id', userId)
        .gte('activity_date', sinceDate)
        .order('activity_date', { ascending: true }),
      supabase
        .from('lesson_attempts')
        .select('accuracy, completed_at, duration_seconds')
        .eq('user_id', userId)
        .gte('completed_at', `${sinceDate}T00:00:00.000Z`),
      supabase
        .from('streaks')
        .select('longest_streak')
        .eq('user_id', userId)
        .maybeSingle(),
    ])

    if (activityError) throw activityError
    if (attemptsError) throw attemptsError
    if (streakError) throw streakError

    return {
      activity: (activity || []).filter((item) => !languageId || !item.language_id || item.language_id === languageId),
      lessonAttempts: lessonAttempts || [],
      longestStreak: Number(streak?.longest_streak) || 0,
    }
  } catch (error) {
    console.warn('Supabase learning analytics fetch error:', error)
    return { activity: [], lessonAttempts: [], longestStreak: 0, error }
  }
}

// 3. Record Achievement Unlock
export async function recordAchievementUnlock(userId, achievementId) {
  if (!userId || !isSupabaseConfigured() || !supabase) return

  try {
    await supabase.from('user_achievements').upsert(
      {
        user_id: userId,
        achievement_id: achievementId,
        unlocked_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,achievement_id' }
    )
  } catch (err) {
    console.warn('Supabase achievement sync error:', err)
  }
}

// 4. Fetch Leaderboard entries
export async function fetchLeaderboardFromDB() {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('leaderboard_entries')
        .select('*')
        .order('xp', { ascending: false })
        .limit(20)

      if (!error && data && data.length > 0) {
        return data
      }
    } catch (err) {
      console.warn('Supabase leaderboard fetch error:', err)
    }
  }

  // Local fallback mock leaderboard
  return [
    { id: '1', user_name: 'Aarav Sharma', xp: 1240, league: 'Diamond', rank: 1, streak: 14 },
    { id: '2', user_name: 'Priya Patel', xp: 1150, league: 'Diamond', rank: 2, streak: 12 },
    { id: '3', user_name: 'Rohan Deshmukh', xp: 980, league: 'Gold', rank: 3, streak: 9 },
    { id: '4', user_name: 'Ananya Iyer', xp: 860, league: 'Gold', rank: 4, streak: 7 },
    { id: '5', user_name: 'Gurpreet Singh', xp: 740, league: 'Silver', rank: 5, streak: 5 },
    { id: '6', user_name: 'Tanvi Roy', xp: 620, league: 'Silver', rank: 6, streak: 4 },
  ]
}

// ── 5. Spaced Repetition (SuperMemo SM-2) Persistence ─────────────────────────

/**
 * Helper: Map local SM-2 item format to database row format
 */
export function mapSM2ItemToRow(userId, item) {
  if (!userId || !item || !item.word || !item.languageId) return null
  return {
    user_id: userId,
    language_id: item.languageId,
    word: item.word.trim(),
    translation: item.translation ? item.translation.trim() : '',
    category: item.category || 'General',
    repetition: Number(item.repetition) || 0,
    interval_days: Number(item.interval) || 0,
    ease_factor: Number(item.easeFactor) || 2.50,
    quality: Number(item.quality) || 0,
    retention_score: Number(item.retentionScore) || 100,
    history: Array.isArray(item.history) ? item.history : [],
    last_reviewed_at: item.lastReviewedAt || null,
    next_review_at: item.nextReviewAt || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

/**
 * Helper: Map database row format to local SM-2 item format
 */
export function mapRowToSM2Item(row) {
  if (!row) return null
  return {
    id: `${row.language_id}_${(row.word || '').toLowerCase().trim()}`,
    word: row.word,
    translation: row.translation || '',
    languageId: row.language_id,
    category: row.category || 'General',
    repetition: Number(row.repetition) || 0,
    interval: Number(row.interval_days) || 0,
    easeFactor: Number(row.ease_factor) || 2.50,
    quality: Number(row.quality) || 0,
    retentionScore: Number(row.retention_score) || 100,
    history: Array.isArray(row.history) ? row.history : [],
    lastReviewedAt: row.last_reviewed_at || null,
    nextReviewAt: row.next_review_at || new Date().toISOString(),
  }
}

/**
 * Sync a single SuperMemo SM-2 item to Supabase
 *
 * @param {string} userId - Valid user UUID
 * @param {Object} item - Local SM-2 item object
 * @returns {Promise<{success: boolean, data?: Object, error?: any}>}
 */
export async function syncSpacedRepetitionItem(userId, item) {
  if (!userId) {
    return { success: false, error: 'User ID is required' }
  }

  const row = mapSM2ItemToRow(userId, item)
  if (!row) {
    return { success: false, error: 'Invalid SM-2 item data' }
  }

  if (!isSupabaseConfigured() || !supabase) {
    return { success: false, error: 'Supabase is not configured' }
  }

  return enqueuePersistence(userId, async () => {
    try {
      const { data, error } = await supabase
        .from('user_spaced_repetition')
        .upsert(row, { onConflict: 'user_id,language_id,word' })
        .select()
        .maybeSingle()

      if (error) throw error
      return { success: true, data: data ? mapRowToSM2Item(data) : item }
    } catch (err) {
      console.warn('Supabase syncSpacedRepetitionItem error:', err)
      return { success: false, error: err }
    }
  })
}

/**
 * Sync a batch of SuperMemo SM-2 items to Supabase
 *
 * @param {string} userId - Valid user UUID
 * @param {Array<Object>} items - Array of local SM-2 item objects
 * @returns {Promise<{success: boolean, count?: number, error?: any}>}
 */
export async function syncSpacedRepetitionBatch(userId, items) {
  if (!userId) {
    return { success: false, error: 'User ID is required' }
  }

  if (!Array.isArray(items) || items.length === 0) {
    return { success: true, count: 0 }
  }

  const rows = items
    .map((item) => mapSM2ItemToRow(userId, item))
    .filter(Boolean)

  if (rows.length === 0) {
    return { success: false, error: 'No valid SM-2 items to sync' }
  }

  if (!isSupabaseConfigured() || !supabase) {
    return { success: false, error: 'Supabase is not configured' }
  }

  return enqueuePersistence(userId, async () => {
    try {
      const { error } = await supabase
        .from('user_spaced_repetition')
        .upsert(rows, { onConflict: 'user_id,language_id,word' })

      if (error) throw error
      return { success: true, count: rows.length }
    } catch (err) {
      console.warn('Supabase syncSpacedRepetitionBatch error:', err)
      return { success: false, error: err }
    }
  })
}

/**
 * Fetch all spaced repetition items for a user from Supabase,
 * structured by languageId matching local storage format.
 *
 * @param {string} userId - Valid user UUID
 * @returns {Promise<{success: boolean, itemsByLanguage: Object, raw?: Array, error?: any}>}
 */
export async function fetchUserSpacedRepetition(userId) {
  if (!userId) {
    return { success: false, itemsByLanguage: {}, error: 'User ID is required' }
  }

  if (!isSupabaseConfigured() || !supabase) {
    return { success: false, itemsByLanguage: {}, error: 'Supabase is not configured' }
  }

  try {
    const { data, error } = await supabase
      .from('user_spaced_repetition')
      .select('*')
      .eq('user_id', userId)
      .order('next_review_at', { ascending: true })

    if (error) throw error

    const itemsByLanguage = {}
    if (Array.isArray(data)) {
      for (const row of data) {
        const item = mapRowToSM2Item(row)
        if (item && item.languageId) {
          if (!itemsByLanguage[item.languageId]) {
            itemsByLanguage[item.languageId] = []
          }
          itemsByLanguage[item.languageId].push(item)
        }
      }
    }

    return { success: true, itemsByLanguage, raw: data || [] }
  } catch (err) {
    console.warn('Supabase fetchUserSpacedRepetition error:', err)
    return { success: false, itemsByLanguage: {}, error: err }
  }
}

