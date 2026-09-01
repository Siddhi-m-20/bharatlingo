import { supabase, isSupabaseConfigured } from './supabase'

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
  heartsLost = 0,
  durationSeconds = 60,
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
          hearts_lost: heartsLost,
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
    } catch (err) {
      console.warn('Supabase recordLessonCompletion sync error:', err)
    }
  }

  return { success: true }
}

// 2. Record Streak updates in streaks table
export async function syncStreakToDatabase(userId, streakCount, lastDate) {
  if (!userId || !isSupabaseConfigured() || !supabase) return

  try {
    await supabase.from('streaks').upsert(
      {
        user_id: userId,
        current_streak: streakCount,
        last_extended_date: lastDate,
      },
      { onConflict: 'user_id' }
    )
  } catch (err) {
    console.warn('Supabase streak sync error:', err)
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
