# BharatLingo — Database Guide

> **For the learner-developer:** This document explains every database table, how they relate to each other, what security rules protect them, and how the frontend reads and writes to them. Read [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) first.

---

## Database technology

BharatLingo uses **Supabase**, which is a hosted **PostgreSQL** database with added features:
- **Auth**: manages user accounts, passwords, sessions
- **Row Level Security (RLS)**: database-level rules that prevent users from reading or writing other users' data
- **JavaScript client**: the `@supabase/supabase-js` library used in `src/services/supabase.js`

**What is PostgreSQL?** A powerful open-source relational database. Data is stored in tables with rows and columns, and tables can reference each other.

**What is RLS?** A PostgreSQL feature where you define *policies* on each table. Every query is automatically filtered by these rules — the database itself enforces them, not just the application code. This is the most reliable form of data protection.

---

## Migration files

The database schema is defined in SQL migration files in `supabase/migrations/`. Each file is numbered chronologically and applied in order:

| File | Purpose |
|---|---|
| `20260901000000_init_schema.sql` | Creates all 18 tables, RLS policies, and triggers |
| `20260907000001_add_learning_state.sql` | Adds `learning_activity` table |
| `20260907000002_remove_hearts_system.sql` | Removes the old "hearts" mechanic |
| `20260909000000_add_user_spaced_repetition.sql` | Adds `user_spaced_repetition` table |
| `20261031000000_fix_profiles_public_access.sql` | **Security fix**: removes public profile access |
| `20261031000001_protect_reward_fields.sql` | **Security fix**: prevents direct XP/gems/streak updates |

**To apply these migrations to your Supabase project:** Copy and paste each file into the Supabase SQL Editor, or use the Supabase CLI.

---

## Table reference

### Content tables (read-only public data)

These tables hold the app's learning content. Any visitor can read them (even before logging in).

#### `languages`
Defines the 8 supported languages.
```
id          VARCHAR(10)  PK  — 'hi', 'en', 'mr', 'ta', 'te', 'bn', 'pa', 'gu'
name        VARCHAR(100)     — 'Hindi'
native_name VARCHAR(100)     — 'हिन्दी'
script      VARCHAR(50)      — 'Devanagari'
voice_code  VARCHAR(20)      — 'hi-IN' (for TTS)
```

#### `courses`
Language-pair learning paths (e.g. "Learn Hindi in English").
```
id                  VARCHAR(50)  PK  — 'en-hi'
source_language_id  FK → languages
target_language_id  FK → languages
title, description, level, total_xp
```

#### `units`
Groups of lessons within a course.
```
id         FK → courses
unit_number, title, color_theme, icon
```

#### `lessons`
Individual lesson definitions.
```
id         VARCHAR(50)  PK  — 'hi-greetings'
unit_id    FK → units
language_id FK → languages
lesson_order, name, name_native, category, xp_reward
```

#### `vocabulary`
Word bank with multi-language translations stored as JSONB.
```
id           UUID  PK
language_id  FK → languages
lesson_id    FK → lessons
word, root_word, pronunciation, part_of_speech
translations  JSONB  — {"en": "Water", "hi": "पानी", "mr": "पाणी"}
example_target, audio_url
```

#### `exercises`
Exercise definitions for each lesson.
```
id              VARCHAR(100)  PK
lesson_id       FK → lessons
exercise_type   — 'multiple-choice', 'translation', 'listening', 'speaking', 'matching', 'word-bank'
prompt_key, target_word, correct_answer, xp
options  JSONB  — list of answer options
pairs    JSONB  — word pairs for matching exercises
```

---

### User tables (owner-only access)

These tables store individual user data. RLS ensures each user can only access their own rows.

#### `profiles` ⭐ (most important table)
The master user profile table. One row per user, linked to `auth.users`.

```
id                  UUID  PK  FK → auth.users (Supabase Auth)
name, email, avatar_url
preferred_language  VARCHAR(10)  — UI language ('en', 'hi', etc.)
learning_language   VARCHAR(10)  — What they are learning
goal                VARCHAR(50)  — 'conversation', 'work', 'travel', etc.
level               VARCHAR(50)  — 'beginner', 'elementary', 'intermediate', 'advanced'
daily_goal          INTEGER      — daily XP target (default: 10)
age_range           VARCHAR(20)  — 'adult', 'teen', etc.
assessment_score    INTEGER      — 0–100 from placement test
has_completed_assessment BOOLEAN
learning_plan       JSONB        — { startingLevel, focusAreas, recommendedFirstLesson }
xp                  INTEGER
gems                INTEGER
streak              INTEGER
last_active_date    TEXT         — 'YYYY-MM-DD' string
completed_lessons   JSONB        — ['hi-greetings', 'hi-numbers', ...]
language_progress   JSONB        — { hi: { completedLessons: [], xp: 0, level: 'beginner' } }
learner_stats       JSONB        — { hi: { vocabulary: 72, listening: 60, ... } }
active_quests       JSONB        — daily quest state array
settings            JSONB        — { audio: true, soundFx: true, speaking: true }
legendary_completed JSONB        — lesson IDs completed in legendary mode
vocabulary          JSONB        — user-specific vocabulary notes
achievements        JSONB        — ['first_step', 'xp_100', 'streak_7', ...]
completed_stories   JSONB        — story IDs completed
```

**Why so much data in one table?** This is a design tradeoff. Storing progress in JSONB columns on `profiles` means fewer database queries — one `SELECT *` loads everything. The downside is it is harder to query analytically. The separate transaction tables (`lesson_attempts`, `xp_transactions`) provide the queryable audit trail.

#### `user_progress`
Per-lesson completion status per user.
```
user_id    FK → profiles
lesson_id  VARCHAR(50)
status     — 'locked', 'unlocked', 'in_progress', 'completed'
score      INTEGER  — accuracy %
stars      INTEGER  — 1, 2, or 3
completed_at TIMESTAMPTZ
UNIQUE(user_id, lesson_id)
```

#### `lesson_attempts`
Every lesson session ever attempted.
```
user_id, lesson_id
xp_earned, accuracy, is_perfect, duration_seconds
completed_at TIMESTAMPTZ
```

#### `exercise_attempts`
Per-exercise correctness log within a lesson session.
```
lesson_attempt_id  FK → lesson_attempts
user_id, exercise_id
user_answer, is_correct
```

#### `xp_transactions`
Audit trail for every XP earn event.
```
user_id, amount
source_type  — 'lesson_complete', 'streak_bonus', 'achievement', 'practice'
reference_id — the lesson or achievement that caused it
```

#### `streaks`
Current and longest streak per user.
```
user_id  UNIQUE
current_streak, longest_streak
last_extended_date TEXT
freezes_available INTEGER  — not yet used in the app UI
```

#### `learning_activity`
Daily activity summary for the activity chart.
```
user_id, activity_date TEXT
exercises_completed, xp_earned, session_duration_seconds
language_id, session_type  — 'lesson', 'practice'
UNIQUE(user_id, activity_date, session_type)
```

#### `user_spaced_repetition`
Cloud backup of the SM-2 spaced repetition deck.
```
user_id, language_id, word, translation, category
repetition, interval_days, ease_factor, quality
retention_score, history JSONB
last_reviewed_at, next_review_at
```

---

## RLS policies summary

| Table | Who can read? | Who can write? |
|---|---|---|
| languages, courses, units, lessons, vocabulary, exercises | Anyone (public) | No one (admin via service role only) |
| achievements, leaderboard_entries | Anyone (public) | Owner only (leaderboard entries) |
| profiles | **Owner only** (`auth.uid() = id`) | Owner only |
| user_progress | Owner only | Owner only |
| lesson_attempts, exercise_attempts | Owner only | Owner only |
| xp_transactions | Owner only | Owner only (insert only) |
| streaks, daily_goals | Owner only | Owner only |
| user_achievements | Owner only | Owner only (insert only) |
| notifications | Owner only | Owner only |

**Security trigger:** A PostgreSQL trigger on `profiles` (`validate_profile_update`) **prevents any user from directly updating `xp`, `gems`, or `streak`** via the standard API. These fields can only be modified by the server using the service role key.

---

## Database service (`src/services/dbService.js`)

All database operations go through this single file. It is the only place in the frontend that talks directly to Supabase tables (other than auth).

**Key functions:**

| Function | What it does |
|---|---|
| `recordLessonCompletion()` | Inserts into `lesson_attempts`, upserts `user_progress`, inserts `xp_transactions`, calls `recordLearningActivity()` |
| `recordLearningActivity()` | Upserts into `learning_activity` — accumulates daily totals |
| `syncStreakToDatabase()` | Upserts into `streaks` |
| `fetchLearningAnalytics()` | Reads last 41 days of `learning_activity` + `lesson_attempts` + `streaks` |
| `recordAchievementUnlock()` | Upserts into `user_achievements` |
| `fetchLeaderboardFromDB()` | Reads top 20 from `leaderboard_entries` |
| `syncSpacedRepetitionItem()` | Upserts one SM-2 item into `user_spaced_repetition` |
| `syncSpacedRepetitionBatch()` | Upserts many SM-2 items at once |
| `fetchUserSpacedRepetition()` | Reads all SM-2 items on login |
| `persistLearnerStats()` | Writes to `profiles.learner_stats` JSONB column |

**Persistence queue pattern:**
```js
const persistenceQueues = new Map()  // userId → Promise chain

function enqueuePersistence(userId, operation) {
  // Chains operations for the same user sequentially
  // Prevents race conditions when two saves happen at the same time
}
```
This ensures that if two database writes for the same user happen within milliseconds of each other, they execute in order rather than simultaneously (which could cause conflicts).

---

## Offline fallback

Every database function in `dbService.js` starts with:
```js
if (!userId || !isSupabaseConfigured() || !supabase) return
```

If Supabase is not configured (missing env vars), the function returns silently. All user data is maintained in `localStorage` instead. This is the **offline / demo mode** that makes the app work without a Supabase project.

---

## 🧪 Practical exercise

Open `src/services/dbService.js` and find the `recordLessonCompletion()` function.

1. How many different database tables does one call to `recordLessonCompletion()` write to?
2. What happens if the user is not connected to the internet when this runs?
3. Why does the function use `upsert` for `user_progress` but `insert` for `lesson_attempts`?

*(Answers: 4 tables. It fails silently and returns early. Because `user_progress` tracks the current state of each lesson (one row per lesson), while `lesson_attempts` is a history log — you want to add a new record every time, not overwrite the previous one.)*
