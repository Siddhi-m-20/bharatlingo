-- Add durable application state that was previously only represented in localStorage.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS has_completed_assessment BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS gems INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS language_progress JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS legendary_completed JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS active_quests JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS completed_stories JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS learner_stats JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;

CREATE TABLE IF NOT EXISTS public.learning_activity (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  activity_date TEXT NOT NULL,
  exercises_completed INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  session_duration_seconds INTEGER DEFAULT 0,
  language_id VARCHAR(10),
  session_type VARCHAR(50) DEFAULT 'lesson',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, activity_date, session_type)
);

ALTER TABLE public.learning_activity ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own learning activity" ON public.learning_activity;
CREATE POLICY "Users can read own learning activity" ON public.learning_activity FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can upsert own learning activity" ON public.learning_activity;
CREATE POLICY "Users can upsert own learning activity" ON public.learning_activity FOR ALL USING (auth.uid() = user_id);