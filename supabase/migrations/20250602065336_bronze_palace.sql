/*
  # Add GDPR Consent RPC Function

  1. New Functions
    - update_gdpr_consent: Updates user's GDPR consent status and logs the action
      - Parameters:
        - p_consent: boolean - consent status
        - p_ip: text - IP address of the request
      - Returns: JSON with updated consent status

  2. Security
    - Function runs with SECURITY DEFINER
    - Only accessible to authenticated users
    - Automatically logs consent action
*/

CREATE OR REPLACE FUNCTION update_gdpr_consent(
  p_consent boolean,
  p_ip text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile profiles;
BEGIN
  -- Update profile consent status
  UPDATE public.profiles
  SET
    gdp = p_consent,
    gdl = CASE WHEN p_consent THEN now() ELSE NULL END,
    udt = now()
  WHERE uid = auth.uid()
  RETURNING * INTO v_profile;

  -- Log consent action
  INSERT INTO public.consent_logs (
    uid,
    typ,
    dat,
    ip
  ) VALUES (
    auth.uid(),
    'gdpr_consent',
    jsonb_build_object(
      'consent', p_consent,
      'timestamp', now()
    ),
    p_ip
  );

  RETURN jsonb_build_object(
    'id', v_profile.id,
    'gdpr_consent', v_profile.gdp,
    'consent_date', v_profile.gdl
  );
END;
$$;