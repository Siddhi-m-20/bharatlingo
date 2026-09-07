-- ==============================================================================
-- BHARATLINGO MIGRATION: REMOVE HEARTS / ENERGY SYSTEM (PEDAGOGICAL FREEDOM)
-- Philosophy: "No Hearts, No Energy. Learning shouldn't stop because you made a mistake."
-- ==============================================================================

-- 1. Remove hearts column from profiles table
ALTER TABLE IF EXISTS public.profiles
  DROP COLUMN IF EXISTS hearts;

-- 2. Remove hearts_cost from lessons table
ALTER TABLE IF EXISTS public.lessons
  DROP COLUMN IF EXISTS hearts_cost;

-- 3. Remove hearts_lost from lesson_attempts table
ALTER TABLE IF EXISTS public.lesson_attempts
  DROP COLUMN IF EXISTS hearts_lost;

-- 4. Drop hearts table & associated RLS policies
DROP TABLE IF EXISTS public.hearts CASCADE;

-- 5. Update trigger function for new user registrations
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
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
    streak,
    completed_lessons,
    vocabulary,
    achievements
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
