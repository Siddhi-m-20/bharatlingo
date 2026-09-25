-- ==============================================================================
-- BharatLingo Complete Production Supabase Schema
-- Includes 18 relational tables, RLS policies, functions, and triggers
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. LANGUAGES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.languages (
  id VARCHAR(10) PRIMARY KEY, -- e.g., 'hi', 'mr', 'ta', 'te', 'bn', 'pa', 'gu', 'en'
  name VARCHAR(100) NOT NULL,
  native_name VARCHAR(100) NOT NULL,
  script VARCHAR(50) NOT NULL,
  locale VARCHAR(20) NOT NULL,
  voice_code VARCHAR(20) NOT NULL,
  translation_code VARCHAR(20) NOT NULL,
  flag_emoji VARCHAR(10) DEFAULT '🇮🇳',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 2. COURSES TABLE (Language Pairs e.g., Learn Marathi from Hindi)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.courses (
  id VARCHAR(50) PRIMARY KEY, -- e.g., 'hi-mr', 'en-hi'
  source_language_id VARCHAR(10) REFERENCES public.languages(id) ON DELETE CASCADE,
  target_language_id VARCHAR(10) REFERENCES public.languages(id) ON DELETE CASCADE,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  level VARCHAR(50) DEFAULT 'beginner',
  total_xp INTEGER DEFAULT 1000,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. UNITS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.units (
  id VARCHAR(50) PRIMARY KEY, -- e.g., 'hi-mr-unit-1'
  course_id VARCHAR(50) REFERENCES public.courses(id) ON DELETE CASCADE,
  unit_number INTEGER NOT NULL,
  title VARCHAR(150) NOT NULL,
  title_native VARCHAR(150),
  description TEXT,
  color_theme VARCHAR(50) DEFAULT '#0B8F62',
  icon VARCHAR(50) DEFAULT 'book-open',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. LESSONS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.lessons (
  id VARCHAR(50) PRIMARY KEY, -- e.g., 'hi-greetings'
  unit_id VARCHAR(50) REFERENCES public.units(id) ON DELETE CASCADE,
  language_id VARCHAR(10) REFERENCES public.languages(id) ON DELETE CASCADE,
  lesson_order INTEGER NOT NULL,
  name VARCHAR(150) NOT NULL,
  name_native VARCHAR(150) NOT NULL,
  category VARCHAR(100) DEFAULT 'Everyday Essentials',
  xp_reward INTEGER DEFAULT 25,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 5. VOCABULARY TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.vocabulary (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  language_id VARCHAR(10) REFERENCES public.languages(id) ON DELETE CASCADE,
  lesson_id VARCHAR(50) REFERENCES public.lessons(id) ON DELETE SET NULL,
  word VARCHAR(150) NOT NULL,
  root_word VARCHAR(150),
  pronunciation VARCHAR(150),
  part_of_speech VARCHAR(50),
  translations JSONB NOT NULL DEFAULT '{}'::jsonb, -- { "en": "Water", "hi": "पानी", "mr": "पाणी", ... }
  example_target TEXT,
  example_translations JSONB DEFAULT '{}'::jsonb,
  audio_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 6. EXERCISES / QUESTIONS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.exercises (
  id VARCHAR(100) PRIMARY KEY, -- e.g., 'hi-greetings-ex-1'
  lesson_id VARCHAR(50) REFERENCES public.lessons(id) ON DELETE CASCADE,
  exercise_order INTEGER NOT NULL,
  exercise_type VARCHAR(50) NOT NULL, -- 'multiple-choice', 'translation', 'listening', 'speaking', 'matching', 'word-bank'
  prompt_key VARCHAR(100), -- Template key for multi-language rendering
  target_word VARCHAR(150),
  correct_answer TEXT NOT NULL,
  xp INTEGER DEFAULT 10,
  options JSONB DEFAULT '[]'::jsonb, -- Options list
  pairs JSONB DEFAULT '[]'::jsonb,   -- Pairs for matching exercises
  audio_phrase TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 7. QUESTION OPTIONS TABLE (Normalized options for advanced queries)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.question_options (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  exercise_id VARCHAR(100) REFERENCES public.exercises(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  option_translation JSONB DEFAULT '{}'::jsonb,
  is_correct BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0
);

-- ==============================================================================
-- 8. PROFILES TABLE (Linked to auth.users)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  preferred_language VARCHAR(10) DEFAULT 'en',
  learning_language VARCHAR(10) DEFAULT NULL,
  goal VARCHAR(50) DEFAULT NULL,
  level VARCHAR(50) DEFAULT 'beginner',
  daily_goal INTEGER DEFAULT 10, -- in minutes or XP
  age_range VARCHAR(20) DEFAULT NULL, -- 'child', 'teen', 'young-adult', 'adult', 'senior'
  assessment_score INTEGER DEFAULT NULL, -- 0-100 from initial placement assessment
  xp INTEGER DEFAULT 0,
  hearts INTEGER DEFAULT 5,
  streak INTEGER DEFAULT 0,
  last_active_date TEXT,
  completed_lessons JSONB DEFAULT '[]'::jsonb,
  vocabulary JSONB DEFAULT '{}'::jsonb,
  achievements JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 9. USER PROGRESS TABLE (Tracks per-lesson progress and unlock states)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id VARCHAR(50),
  unit_id VARCHAR(50),
  lesson_id VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'unlocked', -- 'locked', 'unlocked', 'in_progress', 'completed'
  score INTEGER DEFAULT 0,
  stars INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- ==============================================================================
-- 10. LESSON ATTEMPTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.lesson_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id VARCHAR(50) NOT NULL,
  xp_earned INTEGER DEFAULT 0,
  accuracy NUMERIC(5,2) DEFAULT 100.00,
  is_perfect BOOLEAN DEFAULT false,
  duration_seconds INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 11. EXERCISE ATTEMPTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.exercise_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lesson_attempt_id UUID REFERENCES public.lesson_attempts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  exercise_id VARCHAR(100),
  user_answer TEXT,
  is_correct BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 12. XP TRANSACTIONS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.xp_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  source_type VARCHAR(50) NOT NULL, -- 'lesson_complete', 'streak_bonus', 'achievement', 'practice'
  reference_id VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 13. STREAKS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.streaks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_extended_date TEXT,
  freezes_available INTEGER DEFAULT 2,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 14. DAILY GOALS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.daily_goals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  goal_date TEXT NOT NULL,
  target_minutes INTEGER DEFAULT 10,
  target_xp INTEGER DEFAULT 50,
  earned_xp INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, goal_date)
);

-- ==============================================================================
-- 15. ACHIEVEMENTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.achievements (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  title_native VARCHAR(150),
  description TEXT NOT NULL,
  icon VARCHAR(50) NOT NULL,
  xp_reward INTEGER DEFAULT 50,
  category VARCHAR(50) DEFAULT 'general',
  criteria_type VARCHAR(50) NOT NULL, -- 'first_step', 'streak', 'xp', 'perfect_lesson', 'multilingual'
  criteria_value INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 16. USER ACHIEVEMENTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id VARCHAR(50) REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  progress INTEGER DEFAULT 100,
  UNIQUE(user_id, achievement_id)
);


-- ==============================================================================
-- 18. LEADERBOARD ENTRIES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.leaderboard_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name VARCHAR(100) NOT NULL,
  avatar_url TEXT,
  xp INTEGER DEFAULT 0,
  league VARCHAR(50) DEFAULT 'Bronze', -- 'Bronze', 'Silver', 'Gold', 'Sapphire', 'Ruby', 'Diamond'
  rank INTEGER DEFAULT 1,
  streak INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 19. NOTIFICATIONS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'streak_reminder',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 1. Public Content Tables (Read-only for all users)
DROP POLICY IF EXISTS "Public read languages" ON public.languages;
CREATE POLICY "Public read languages" ON public.languages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read courses" ON public.courses;
CREATE POLICY "Public read courses" ON public.courses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read units" ON public.units;
CREATE POLICY "Public read units" ON public.units FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read lessons" ON public.lessons;
CREATE POLICY "Public read lessons" ON public.lessons FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read vocabulary" ON public.vocabulary;
CREATE POLICY "Public read vocabulary" ON public.vocabulary FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read exercises" ON public.exercises;
CREATE POLICY "Public read exercises" ON public.exercises FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read question_options" ON public.question_options;
CREATE POLICY "Public read question_options" ON public.question_options FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read achievements" ON public.achievements;
CREATE POLICY "Public read achievements" ON public.achievements FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read leaderboard" ON public.leaderboard_entries;
CREATE POLICY "Public read leaderboard" ON public.leaderboard_entries FOR SELECT USING (true);

-- 2. User Specific Tables (Owner access)
-- Profiles
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Public read for leaderboard profiles" ON public.profiles;
CREATE POLICY "Public read for leaderboard profiles" ON public.profiles FOR SELECT USING (true);

-- User Progress
DROP POLICY IF EXISTS "Users can read own progress" ON public.user_progress;
CREATE POLICY "Users can read own progress" ON public.user_progress FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can upsert own progress" ON public.user_progress;
CREATE POLICY "Users can upsert own progress" ON public.user_progress FOR ALL USING (auth.uid() = user_id);

-- Lesson Attempts
DROP POLICY IF EXISTS "Users can read own lesson attempts" ON public.lesson_attempts;
CREATE POLICY "Users can read own lesson attempts" ON public.lesson_attempts FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own lesson attempts" ON public.lesson_attempts;
CREATE POLICY "Users can insert own lesson attempts" ON public.lesson_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Exercise Attempts
DROP POLICY IF EXISTS "Users can read own exercise attempts" ON public.exercise_attempts;
CREATE POLICY "Users can read own exercise attempts" ON public.exercise_attempts FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own exercise attempts" ON public.exercise_attempts;
CREATE POLICY "Users can insert own exercise attempts" ON public.exercise_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- XP Transactions
DROP POLICY IF EXISTS "Users can read own xp transactions" ON public.xp_transactions;
CREATE POLICY "Users can read own xp transactions" ON public.xp_transactions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own xp transactions" ON public.xp_transactions;
CREATE POLICY "Users can insert own xp transactions" ON public.xp_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Streaks
DROP POLICY IF EXISTS "Users can manage own streak" ON public.streaks;
CREATE POLICY "Users can manage own streak" ON public.streaks FOR ALL USING (auth.uid() = user_id);

-- Daily Goals
DROP POLICY IF EXISTS "Users can manage own daily goals" ON public.daily_goals;
CREATE POLICY "Users can manage own daily goals" ON public.daily_goals FOR ALL USING (auth.uid() = user_id);

-- User Achievements
DROP POLICY IF EXISTS "Users can read own achievements" ON public.user_achievements;
CREATE POLICY "Users can read own achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own achievements" ON public.user_achievements;
CREATE POLICY "Users can insert own achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);


-- Leaderboard Entries
DROP POLICY IF EXISTS "Users can update own leaderboard entry" ON public.leaderboard_entries;
CREATE POLICY "Users can update own leaderboard entry" ON public.leaderboard_entries FOR ALL USING (auth.uid() = user_id);

-- Notifications
DROP POLICY IF EXISTS "Users can manage own notifications" ON public.notifications;
CREATE POLICY "Users can manage own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- ==============================================================================
-- TRIGGERS & FUNCTIONS
-- ==============================================================================

-- 1. Auto-create Profile & Streak on New User Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, name, email, preferred_language, learning_language, goal, level, daily_goal, xp, streak, completed_lessons, vocabulary, achievements
  ) VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    'en',
    NULL,
    NULL,
    'beginner',
    10,
    0,
    0,
    '[]'::jsonb,
    '{}'::jsonb,
    '[]'::jsonb
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.streaks (user_id, current_streak, longest_streak, last_extended_date)
  VALUES (new.id, 0, 0, NULL)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_profiles_updated_at ON public.profiles;
CREATE TRIGGER tr_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

DROP TRIGGER IF EXISTS tr_user_progress_updated_at ON public.user_progress;
CREATE TRIGGER tr_user_progress_updated_at
  BEFORE UPDATE ON public.user_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

-- ==============================================================================
-- MIGRATION: Add age_range, assessment_score, learning_plan to existing profiles
-- Run this if you already have the profiles table in production
-- ==============================================================================
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS age_range VARCHAR(20) DEFAULT NULL;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS assessment_score INTEGER DEFAULT NULL;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS learning_plan JSONB DEFAULT NULL;
