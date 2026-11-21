-- BharatLingo Security Fix Migration
-- Remove unrestricted public access to profiles table
-- Create secure leaderboard view with minimal data

-- Drop the overly permissive public read policy on profiles
DROP POLICY IF EXISTS "Public read for leaderboard profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public read profiles" ON public.profiles;

-- Create a secure view for leaderboard with minimal public information
CREATE OR REPLACE VIEW public.leaderboard_public 
WITH (security_invoker = true) AS
SELECT 
  p.id,
  p.name,
  p.avatar_url,
  p.xp,
  p.streak,
  p.level
FROM public.profiles p
WHERE p.xp IS NOT NULL;

-- Grant select on the view to anon and authenticated users
GRANT SELECT ON public.leaderboard_public TO anon;
GRANT SELECT ON public.leaderboard_public TO authenticated;

-- Ensure RLS is still enabled on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
