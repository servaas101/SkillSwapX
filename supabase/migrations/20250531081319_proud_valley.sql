-- Enable pgcrypto for encryption functions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Compliance log table (clg)
CREATE TABLE compliance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uid UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  typ TEXT NOT NULL, -- compliance type (gdpr, ccpa)
  act TEXT NOT NULL, -- action (consent, delete, export)
  dat JSONB NOT NULL, -- encrypted data
  ip TEXT,
  ts TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Data encryption table (enc)
CREATE TABLE encrypted_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uid UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  typ TEXT NOT NULL, -- data type
  dat TEXT NOT NULL, -- encrypted data
  iv TEXT NOT NULL, -- initialization vector
  exp TIMESTAMP WITH TIME ZONE, -- expiration
  ts TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE compliance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE encrypted_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Compliance logs readable by data owner
CREATE POLICY "Users can view own compliance logs"
  ON compliance_logs FOR SELECT
  TO authenticated
  USING (uid = auth.uid());

-- Encrypted data accessible by owner
CREATE POLICY "Users can access own encrypted data"
  ON encrypted_data FOR SELECT
  TO authenticated
  USING (uid = auth.uid());

-- Functions

-- Log compliance action
CREATE OR REPLACE FUNCTION log_compliance(
  p_typ TEXT,
  p_act TEXT,
  p_dat JSONB,
  p_ip TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO compliance_logs (uid, typ, act, dat, ip)
  VALUES (auth.uid(), p_typ, p_act, p_dat, p_ip)
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Store encrypted data
CREATE OR REPLACE FUNCTION store_encrypted(
  p_typ TEXT,
  p_dat TEXT,
  p_iv TEXT,
  p_exp TIMESTAMP WITH TIME ZONE DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO encrypted_data (uid, typ, dat, iv, exp)
  VALUES (auth.uid(), p_typ, p_dat, p_iv, p_exp)
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cleanup expired data
CREATE OR REPLACE FUNCTION cleanup_expired()
RETURNS void AS $$
BEGIN
  DELETE FROM encrypted_data
  WHERE exp < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;