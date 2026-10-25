-- ==============================================================================
-- BHARATLINGO FIX: "Database error saving new user"
-- ==============================================================================
-- Why this error occurs:
-- In Supabase, calling `supabase.auth.signUp()` creates a record in `auth.users`.
-- This immediately fires the trigger `on_auth_user_created` which calls `handle_new_user()`.
-- If `handle_new_user()` fails (e.g. missing column like `goal`, missing `streaks` table,
-- or an RLS restriction), PostgreSQL rolls back the entire transaction.
-- Supabase GoTrue Auth then returns:
--   "Database error saving new user" (HTTP 500)
--
-- This script fixes the issue completely and permanently:
-- 1. Ensures all modern profile columns exist with safe defaults.
-- 2. Ensures the `streaks` table exists.
-- 3. Configures `handle_new_user()` with `SECURITY DEFINER SET search_path = public`.
-- 4. Wraps all inserts inside `EXCEPTION WHEN OTHERS THEN` blocks so the trigger
--    NEVER aborts user creation in `auth.users`.
-- ==============================================================================

-- 1. Enable UUID extension if not already present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Ensure profiles table and all expected columns exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Learner',
  email TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  bio TEXT DEFAULT '',
  preferred_language VARCHAR(10) DEFAULT 'en',
  learning_language VARCHAR(10) DEFAULT NULL,
  goal VARCHAR(50) DEFAULT NULL,
  level VARCHAR(50) DEFAULT 'beginner',
  daily_goal INTEGER DEFAULT 10,
  age_range VARCHAR(20) DEFAULT NULL,
  assessment_score INTEGER DEFAULT NULL,
  has_completed_assessment BOOLEAN DEFAULT false,
  learning_plan JSONB DEFAULT NULL,
  xp INTEGER DEFAULT 0,
  gems INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  last_active_date TEXT,
  completed_lessons JSONB DEFAULT '[]'::jsonb,
  vocabulary JSONB DEFAULT '{}'::jsonb,
  achievements JSONB DEFAULT '[]'::jsonb,
  language_progress JSONB DEFAULT '{}'::jsonb,
  legendary_completed JSONB DEFAULT '[]'::jsonb,
  active_quests JSONB DEFAULT NULL,
  completed_stories JSONB DEFAULT '[]'::jsonb,
  learner_stats JSONB DEFAULT '{}'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure individual columns exist if profiles was previously created with an older schema
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT 'Learner';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT NOT NULL DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(10) DEFAULT 'en';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS learning_language VARCHAR(10) DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS goal VARCHAR(50) DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS level VARCHAR(50) DEFAULT 'beginner';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS daily_goal INTEGER DEFAULT 10;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS age_range VARCHAR(20) DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS assessment_score INTEGER DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS has_completed_assessment BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS learning_plan JSONB DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gems INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_active_date TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS completed_lessons JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS vocabulary JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS achievements JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS language_progress JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS legendary_completed JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS active_quests JSONB DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS completed_stories JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS learner_stats JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;

-- 3. Ensure streaks table exists
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

-- 4. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;

-- 5. Establish safe RLS policies for profiles & streaks
DROP POLICY IF EXISTS "Public read profiles" ON public.profiles;
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can manage own streak" ON public.streaks;
CREATE POLICY "Users can manage own streak" ON public.streaks FOR ALL USING (auth.uid() = user_id);

-- 6. Bulletproof handle_new_user trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  raw_user_name TEXT;
BEGIN
  raw_user_name := COALESCE(
    NULLIF(TRIM(new.raw_user_meta_data->>'name'), ''),
    split_part(COALESCE(new.email, 'learner@bharatlingo.com'), '@', 1),
    'Learner'
  );

  -- 6a. Insert profile safely
  BEGIN
    INSERT INTO public.profiles (
      id,
      name,
      email,
      preferred_language,
      learning_language,
      goal,
      level,
      daily_goal,
      xp,
      gems,
      streak,
      completed_lessons,
      vocabulary,
      achievements
    ) VALUES (
      new.id,
      raw_user_name,
      COALESCE(new.email, ''),
      'en',
      NULL,
      NULL,
      'beginner',
      10,
      0,
      100,
      0,
      '[]'::jsonb,
      '{}'::jsonb,
      '[]'::jsonb
    )
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      email = EXCLUDED.email;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user: Failed to insert profile for user %: %', new.id, SQLERRM;
  END;

  -- 6b. Insert streak safely
  BEGIN
    INSERT INTO public.streaks (user_id, current_streak, longest_streak, last_extended_date)
    VALUES (new.id, 0, 0, NULL)
    ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user: Failed to insert streak for user %: %', new.id, SQLERRM;
  END;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never let any trigger failure prevent user registration in auth.users!
  RAISE WARNING 'handle_new_user top-level exception for user %: %', new.id, SQLERRM;
  RETURN NEW;
END;
$$;

-- 7. Rebind trigger cleanly to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. Ensure proper grants for all Supabase roles
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON TABLE public.profiles TO postgres, authenticated, service_role;
GRANT SELECT ON TABLE public.profiles TO anon;
GRANT ALL ON TABLE public.streaks TO postgres, authenticated, service_role;
