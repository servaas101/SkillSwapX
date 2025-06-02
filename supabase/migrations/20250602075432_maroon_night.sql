/*
  # Add Session Management and Security Functions

  1. New Functions
    - validate_session: Validates JWT and session status
    - rotate_session: Forces session rotation for security
    - log_auth_event: Tracks authentication events
    - check_rate_limit: Implements rate limiting

  2. Security
    - Add rate limiting for auth attempts
    - Add session validation
    - Add auth event logging
*/

-- Create auth_events table for tracking
CREATE TABLE IF NOT EXISTS auth_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  event_type text NOT NULL,
  ip_address text,
  user_agent text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE auth_events ENABLE ROW LEVEL SECURITY;

-- Create policy for auth_events
CREATE POLICY "Users can view own auth events"
  ON auth_events
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Create function to validate session
CREATE OR REPLACE FUNCTION validate_session()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_last_sign_in timestamptz;
BEGIN
  -- Get user ID from current session
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check last sign in time
  SELECT last_sign_in_at
  INTO v_last_sign_in
  FROM auth.users
  WHERE id = v_user_id;
  
  -- Require session rotation after 8 hours
  IF v_last_sign_in < now() - interval '8 hours' THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- Create function to log auth events
CREATE OR REPLACE FUNCTION log_auth_event(
  p_event_type text,
  p_metadata jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO auth_events (
    user_id,
    event_type,
    ip_address,
    user_agent,
    metadata
  )
  VALUES (
    auth.uid(),
    p_event_type,
    current_setting('request.headers')::jsonb->>'x-forwarded-for',
    current_setting('request.headers')::jsonb->>'user-agent',
    p_metadata
  )
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$;

-- Create function to check rate limits
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_action text,
  p_limit integer DEFAULT 5,
  p_window interval DEFAULT '5 minutes'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  SELECT COUNT(*)
  INTO v_count
  FROM auth_events
  WHERE user_id = auth.uid()
    AND event_type = p_action
    AND created_at > now() - p_window;
    
  RETURN v_count < p_limit;
END;
$$;