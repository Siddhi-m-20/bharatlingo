-- Additional security policies for profiles
-- Prevent users from updating sensitive fields directly

-- Create a function to validate profile updates
CREATE OR REPLACE FUNCTION public.validate_profile_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow updates if called by service role
  IF current_setting('request.jwt.claims', true)::json->>'role' = 'service_role' THEN
    RETURN NEW;
  END IF;
  
  -- Prevent users from updating their own XP, gems, streak directly
  IF NEW.xp IS DISTINCT FROM OLD.xp OR NEW.gems IS DISTINCT FROM OLD.gems OR NEW.streak IS DISTINCT FROM OLD.streak THEN
    RAISE EXCEPTION 'Cannot update XP, gems, or streak directly';
  END IF;
  
  -- Prevent changing id
  IF NEW.id != OLD.id THEN
    RAISE EXCEPTION 'Cannot change user ID';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to validate updates
DROP TRIGGER IF EXISTS tr_validate_profile_update ON public.profiles;
CREATE TRIGGER tr_validate_profile_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_profile_update();

-- Create a secure function for updating rewards (for server use)
CREATE OR REPLACE FUNCTION public.update_user_rewards(
  p_user_id UUID,
  p_xp_delta INTEGER DEFAULT 0,
  p_gems_delta INTEGER DEFAULT 0,
  p_streak_update INTEGER DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  -- Only service role should call this
  IF current_setting('request.jwt.claims', true)::json->>'role' != 'service_role' THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  UPDATE public.profiles
  SET 
    xp = COALESCE(xp, 0) + COALESCE(p_xp_delta, 0),
    gems = COALESCE(gems, 0) + COALESCE(p_gems_delta, 0),
    streak = COALESCE(p_streak_update, streak),
    updated_at = NOW()
  WHERE id = p_user_id
  RETURNING json_build_object('id', id, 'xp', xp, 'gems', gems, 'streak', streak) INTO v_result;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
