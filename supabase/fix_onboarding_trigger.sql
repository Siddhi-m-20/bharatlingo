-- Step 1: Add the goal column if it doesn't exist
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS goal VARCHAR(50) DEFAULT NULL;

-- Step 2: Reset profiles that were auto-assigned learning_language='hi' by the old trigger
-- without the user ever completing onboarding (goal is still null).
UPDATE public.profiles
SET learning_language = NULL
WHERE learning_language = 'hi'
  AND goal IS NULL;

-- Step 3: Update the trigger function so new signups start with NULL values and never crash
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

  BEGIN
    INSERT INTO public.profiles (
      id, name, email, preferred_language, learning_language, goal, level, daily_goal, xp, streak, completed_lessons, vocabulary, achievements
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
      0,
      '[]'::jsonb,
      '{}'::jsonb,
      '[]'::jsonb
    ) ON CONFLICT (id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user profile insert warning: %', SQLERRM;
  END;

  BEGIN
    INSERT INTO public.streaks (user_id, current_streak, longest_streak, last_extended_date)
    VALUES (new.id, 0, 0, NULL)
    ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user streak insert warning: %', SQLERRM;
  END;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_user top-level warning: %', SQLERRM;
  RETURN NEW;
END;
$$;
