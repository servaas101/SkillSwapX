-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Badges table (bdg)
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nam TEXT NOT NULL, -- name
  dsc TEXT, -- description
  img TEXT, -- image url
  typ TEXT NOT NULL, -- type (skill, certification, achievement)
  lvl INT DEFAULT 1, -- level
  exp TIMESTAMP WITH TIME ZONE, -- expiration
  cdt TIMESTAMP WITH TIME ZONE DEFAULT now(), -- created date
  udt TIMESTAMP WITH TIME ZONE DEFAULT now(), -- updated date
  met JSONB -- metadata
);

-- User badges table (ubg)
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uid UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bid UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  iss UUID NOT NULL REFERENCES profiles(id), -- issuer
  sta TEXT NOT NULL DEFAULT 'pending', -- status
  prf JSONB, -- proof
  cdt TIMESTAMP WITH TIME ZONE DEFAULT now(),
  udt TIMESTAMP WITH TIME ZONE DEFAULT now(),
  vrf TIMESTAMP WITH TIME ZONE, -- verified date
  exp TIMESTAMP WITH TIME ZONE, -- expiration
  hsh TEXT, -- verification hash
  pub BOOLEAN DEFAULT false, -- public visibility
  UNIQUE(uid, bid)
);

-- Verification records table (vrf)
CREATE TABLE verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ubg UUID NOT NULL REFERENCES user_badges(id) ON DELETE CASCADE,
  vby UUID NOT NULL REFERENCES profiles(id), -- verified by
  typ TEXT NOT NULL, -- verification type
  sta TEXT NOT NULL, -- status
  prf JSONB, -- proof
  cdt TIMESTAMP WITH TIME ZONE DEFAULT now(),
  met JSONB -- metadata
);

-- Anonymous achievement records table (ach)
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hsh TEXT NOT NULL UNIQUE, -- anonymized hash
  typ TEXT NOT NULL, -- achievement type
  lvl INT DEFAULT 1,
  dat JSONB NOT NULL, -- encrypted data
  cdt TIMESTAMP WITH TIME ZONE DEFAULT now(),
  exp TIMESTAMP WITH TIME ZONE -- expiration
);

-- Enable Row Level Security
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Badges are readable by all authenticated users
CREATE POLICY "Badges are readable by all users"
  ON badges FOR SELECT
  TO authenticated
  USING (true);

-- User badges are readable by owner and issuer
CREATE POLICY "User badges are readable by owner and issuer"
  ON user_badges FOR SELECT
  TO authenticated
  USING (
    uid = auth.uid() OR
    iss = (SELECT id FROM profiles WHERE uid = auth.uid())
  );

-- User badges are only insertable by badge issuers
CREATE POLICY "User badges are insertable by issuers"
  ON user_badges FOR INSERT
  TO authenticated
  WITH CHECK (
    iss = (SELECT id FROM profiles WHERE uid = auth.uid())
  );

-- Verifications are readable by badge owner and verifier
CREATE POLICY "Verifications are readable by involved parties"
  ON verifications FOR SELECT
  TO authenticated
  USING (
    vby = (SELECT id FROM profiles WHERE uid = auth.uid()) OR
    EXISTS (
      SELECT 1 FROM user_badges
      WHERE user_badges.id = verifications.ubg
      AND user_badges.uid = auth.uid()
    )
  );

-- Achievements are readable by owner only (via hash)
CREATE POLICY "Achievements are readable by hash owner"
  ON achievements FOR SELECT
  TO authenticated
  USING (
    hsh IN (
      SELECT hsh FROM user_badges
      WHERE uid = auth.uid()
    )
  );

-- Functions

-- Create a new badge
CREATE OR REPLACE FUNCTION create_badge(
  p_nam TEXT,
  p_dsc TEXT,
  p_img TEXT,
  p_typ TEXT,
  p_lvl INT DEFAULT 1,
  p_exp TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_met JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO badges (nam, dsc, img, typ, lvl, exp, met)
  VALUES (p_nam, p_dsc, p_img, p_typ, p_lvl, p_exp, p_met)
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Issue a badge to a user
CREATE OR REPLACE FUNCTION issue_badge(
  p_uid UUID,
  p_bid UUID,
  p_prf JSONB DEFAULT NULL,
  p_exp TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_pub BOOLEAN DEFAULT false
) RETURNS UUID AS $$
DECLARE
  v_id UUID;
  v_iss UUID;
BEGIN
  -- Get issuer profile id
  SELECT id INTO v_iss FROM profiles WHERE uid = auth.uid();
  IF v_iss IS NULL THEN
    RAISE EXCEPTION 'Issuer profile not found';
  END IF;

  -- Create user badge
  INSERT INTO user_badges (uid, bid, iss, prf, exp, pub)
  VALUES (p_uid, p_bid, v_iss, p_prf, p_exp, p_pub)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify a badge
CREATE OR REPLACE FUNCTION verify_badge(
  p_ubg UUID,
  p_typ TEXT,
  p_sta TEXT,
  p_prf JSONB DEFAULT NULL,
  p_met JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_id UUID;
  v_vby UUID;
BEGIN
  -- Get verifier profile id
  SELECT id INTO v_vby FROM profiles WHERE uid = auth.uid();
  IF v_vby IS NULL THEN
    RAISE EXCEPTION 'Verifier profile not found';
  END IF;

  -- Create verification record
  INSERT INTO verifications (ubg, vby, typ, sta, prf, met)
  VALUES (p_ubg, v_vby, p_typ, p_sta, p_prf, p_met)
  RETURNING id INTO v_id;

  -- Update user badge if verified
  IF p_sta = 'verified' THEN
    UPDATE user_badges
    SET sta = 'verified',
        vrf = now()
    WHERE id = p_ubg;
  END IF;

  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create achievement record
CREATE OR REPLACE FUNCTION create_achievement(
  p_typ TEXT,
  p_lvl INT,
  p_dat JSONB,
  p_exp TIMESTAMP WITH TIME ZONE DEFAULT NULL
) RETURNS TEXT AS $$
DECLARE
  v_hsh TEXT;
BEGIN
  -- Generate unique hash
  v_hsh := encode(digest(auth.uid()::text || clock_timestamp()::text, 'sha256'), 'hex');

  -- Create achievement record
  INSERT INTO achievements (hsh, typ, lvl, dat, exp)
  VALUES (v_hsh, p_typ, p_lvl, p_dat, p_exp);

  RETURN v_hsh;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.udt = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER badges_updated_at
  BEFORE UPDATE ON badges
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER user_badges_updated_at
  BEFORE UPDATE ON user_badges
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();