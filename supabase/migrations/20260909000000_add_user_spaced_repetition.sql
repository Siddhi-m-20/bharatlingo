-- ==============================================================================
-- Migration: Add user_spaced_repetition table for durable SuperMemo SM-2 state
-- Date: 2026-09-09
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.user_spaced_repetition (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  language_id VARCHAR(10) REFERENCES public.languages(id) ON DELETE CASCADE NOT NULL,
  word VARCHAR(150) NOT NULL,
  translation TEXT NOT NULL DEFAULT '',
  category VARCHAR(100) DEFAULT 'General',
  repetition INTEGER DEFAULT 0,
  interval_days INTEGER DEFAULT 0,
  ease_factor NUMERIC(4,2) DEFAULT 2.50,
  quality INTEGER DEFAULT 0,
  retention_score INTEGER DEFAULT 100,
  history JSONB DEFAULT '[]'::jsonb,
  last_reviewed_at TIMESTAMPTZ,
  next_review_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, language_id, word)
);

-- Optimized index for retrieving due review items per user and language
CREATE INDEX IF NOT EXISTS idx_user_spaced_repetition_due
  ON public.user_spaced_repetition (user_id, language_id, next_review_at);

-- Enable Row Level Security
ALTER TABLE public.user_spaced_repetition ENABLE ROW LEVEL SECURITY;

-- Row Level Security Policies (Strictly scoped to auth.uid())
DROP POLICY IF EXISTS "Users can view own spaced repetition" ON public.user_spaced_repetition;
CREATE POLICY "Users can view own spaced repetition"
  ON public.user_spaced_repetition
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own spaced repetition" ON public.user_spaced_repetition;
CREATE POLICY "Users can insert own spaced repetition"
  ON public.user_spaced_repetition
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own spaced repetition" ON public.user_spaced_repetition;
CREATE POLICY "Users can update own spaced repetition"
  ON public.user_spaced_repetition
  FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own spaced repetition" ON public.user_spaced_repetition;
CREATE POLICY "Users can delete own spaced repetition"
  ON public.user_spaced_repetition
  FOR DELETE
  USING (auth.uid() = user_id);
