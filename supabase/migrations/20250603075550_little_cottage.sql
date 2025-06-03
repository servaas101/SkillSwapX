/*
  # Auth Events Table

  1. New Tables
    - `auth_events`: Tracks authentication events and user sessions
      - `id` (uuid, primary key): Unique identifier
      - `user_id` (uuid): Reference to auth.users
      - `event_type` (text): Type of auth event
      - `ip_address` (text): User's IP address
      - `user_agent` (text): Browser/client info
      - `metadata` (jsonb): Additional event data
      - `created_at` (timestamptz): Event timestamp

  2. Security
    - Enable RLS on auth_events table
    - Add policy for users to view their own events
    - Add policy for users to insert their own events

  3. Performance
    - Add index on user_id for faster lookups
*/

-- Create auth_events table
CREATE TABLE IF NOT EXISTS auth_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE auth_events ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own auth events"
  ON auth_events
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own auth events"
  ON auth_events
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_auth_events_user_id ON auth_events(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_events_created_at ON auth_events(created_at);

-- Add helpful comments
COMMENT ON TABLE auth_events IS 'Tracks authentication events and user sessions';
COMMENT ON COLUMN auth_events.event_type IS 'Type of authentication event (login, logout, etc)';
COMMENT ON COLUMN auth_events.metadata IS 'Additional event-specific data in JSON format';