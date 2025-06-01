/*
  # Fix Profiles Table and RLS Policies

  1. Changes
    - Add INSERT policy for profiles table
    - Add trigger for profile creation on signup
    - Add function for profile management
    - Add function for GDPR data handling

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Ensure proper data isolation
*/

-- Add INSERT policy for profiles
CREATE POLICY "Enable insert for authenticated users only"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = uid);

-- Create trigger function for profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (uid, em, cdt, udt, gdp)
  VALUES (
    new.id,
    new.email,
    now(),
    now(),
    false
  );
  RETURN new;
END;
$$;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function for profile updates
CREATE OR REPLACE FUNCTION public.update_profile(
  p_fn text DEFAULT NULL,
  p_ln text DEFAULT NULL,
  p_bio text DEFAULT NULL,
  p_img text DEFAULT NULL,
  p_ph text DEFAULT NULL,
  p_loc text DEFAULT NULL,
  p_set jsonb DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_profile profiles;
BEGIN
  UPDATE public.profiles
  SET
    fn = COALESCE(p_fn, fn),
    ln = COALESCE(p_ln, ln),
    bio = COALESCE(p_bio, bio),
    img = COALESCE(p_img, img),
    ph = COALESCE(p_ph, ph),
    loc = COALESCE(p_loc, loc),
    set = COALESCE(p_set, set),
    udt = now()
  WHERE uid = auth.uid()
  RETURNING * INTO v_profile;

  RETURN json_build_object(
    'id', v_profile.id,
    'updated_at', v_profile.udt
  );
END;
$$;

-- Create function for GDPR consent
CREATE OR REPLACE FUNCTION public.update_gdpr_consent(
  p_consent boolean,
  p_ip text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_profile profiles;
BEGIN
  -- Update profile
  UPDATE public.profiles
  SET
    gdp = p_consent,
    gdl = CASE WHEN p_consent THEN now() ELSE NULL END
  WHERE uid = auth.uid()
  RETURNING * INTO v_profile;

  -- Log consent
  INSERT INTO public.consent_logs (uid, typ, dat, ip)
  VALUES (
    auth.uid(),
    'gdpr_consent',
    json_build_object(
      'consent', p_consent,
      'timestamp', now()
    ),
    p_ip
  );

  RETURN json_build_object(
    'id', v_profile.id,
    'gdpr_consent', v_profile.gdp,
    'consent_date', v_profile.gdl
  );
END;
$$;