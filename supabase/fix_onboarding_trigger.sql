-- Step 1: Add the goal column if it doesn't exist
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS goal VARCHAR(50) DEFAULT NULL;

-- Step 2: Reset profiles that were auto-assigned learning_language='hi' by the old trigger
-- without the user ever completing onboarding (goal is still null).
UPDATE public.profiles
SET learning_language = NULL
WHERE learning_language = 'hi'
  AND goal IS NULL;

-- Step 3: Update the trigger function so new signups start with NULL values
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, name, email, preferred_language, learning_language, goal, level, daily_goal, xp, streak, hearts, completed_lessons, vocabulary, achievements
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
    5,
    '[]'::jsonb,
    '{}'::jsonb,
    '[]'::jsonb
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.streaks (user_id, current_streak, longest_streak, last_extended_date)
  VALUES (new.id, 0, 0, NULL)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.hearts (user_id, current_hearts, max_hearts)
  VALUES (new.id, 5, 5)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
