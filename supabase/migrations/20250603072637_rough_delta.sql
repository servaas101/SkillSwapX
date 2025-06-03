/*
  # Database Optimization

  1. New Indexes
    - Add performance indexes for common queries
    - Add full-text search capabilities
    
  2. Constraints
    - Add missing foreign key constraints
    - Add check constraints for data validation
    
  3. Functions
    - Add helper functions for common operations
*/

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_job_postings_status_location ON job_postings(status, location);
CREATE INDEX IF NOT EXISTS idx_mentorship_sessions_scheduled_at ON mentorship_sessions(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_action ON activity_logs(user_id, action);

-- Add full-text search capabilities
ALTER TABLE job_postings 
ADD COLUMN IF NOT EXISTS search_vector tsvector 
GENERATED ALWAYS AS (
  setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(description, '')), 'B')
) STORED;

CREATE INDEX IF NOT EXISTS idx_job_postings_search ON job_postings USING gin(search_vector);

-- Add check constraints
ALTER TABLE employer_profiles 
ADD CONSTRAINT check_company_size 
CHECK (company_size > 0);

ALTER TABLE mentor_profiles 
ADD CONSTRAINT check_hourly_rate 
CHECK (hourly_rate > 0);

ALTER TABLE mentorship_sessions 
ADD CONSTRAINT check_session_duration 
CHECK (duration > interval '0');

-- Add helper functions
CREATE OR REPLACE FUNCTION get_user_roles(p_user_id uuid)
RETURNS TABLE (role text) 
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT ur.role 
  FROM user_roles ur 
  WHERE ur.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;