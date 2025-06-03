/*
  # User Roles and Registration Schema

  1. New Tables
    - `user_roles` - Store user role assignments
    - `employer_profiles` - Company and employer details
    - `employee_profiles` - Employee professional details
    - `mentor_profiles` - Mentor expertise and availability
    - `job_postings` - Job opportunities posted by employers
    - `job_applications` - Employee applications to jobs
    - `mentorship_sessions` - Scheduled mentorship sessions
    - `activity_logs` - Audit trail for user actions

  2. Security
    - Enable RLS on all tables
    - Role-specific access policies
    - Audit logging triggers
*/

-- User roles table
CREATE TABLE user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('employer', 'employee', 'mentor')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Employer profiles
CREATE TABLE employer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  industry text NOT NULL,
  company_size int NOT NULL,
  website text,
  location text,
  description text,
  contact_email text NOT NULL,
  contact_phone text,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Employee profiles
CREATE TABLE employee_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  experience_years int NOT NULL,
  education_level text NOT NULL,
  skills text[] NOT NULL,
  resume_url text,
  linkedin_url text,
  availability text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Mentor profiles
CREATE TABLE mentor_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  expertise_areas text[] NOT NULL,
  experience_years int NOT NULL,
  certifications text[],
  hourly_rate decimal,
  availability jsonb,
  max_mentees int DEFAULT 5,
  bio text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Job postings
CREATE TABLE job_postings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id uuid REFERENCES employer_profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  requirements text[] NOT NULL,
  location text NOT NULL,
  salary_range jsonb,
  employment_type text NOT NULL,
  status text DEFAULT 'open' CHECK (status IN ('open', 'closed', 'draft')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Job applications
CREATE TABLE job_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES job_postings(id) ON DELETE CASCADE,
  applicant_id uuid REFERENCES employee_profiles(id) ON DELETE CASCADE,
  cover_letter text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Mentorship sessions
CREATE TABLE mentorship_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id uuid REFERENCES mentor_profiles(id) ON DELETE CASCADE,
  mentee_id uuid REFERENCES employee_profiles(id) ON DELETE CASCADE,
  scheduled_at timestamptz NOT NULL,
  duration interval NOT NULL,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Activity logs
CREATE TABLE activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  metadata jsonb,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorship_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- User roles policies
CREATE POLICY "Users can view own roles"
  ON user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Employer profile policies
CREATE POLICY "Employers can manage own profile"
  ON employer_profiles FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Public can view verified employer profiles"
  ON employer_profiles FOR SELECT
  TO public
  USING (verified = true);

-- Employee profile policies
CREATE POLICY "Employees can manage own profile"
  ON employee_profiles FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Employers can view employee profiles"
  ON employee_profiles FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'employer'
  ));

-- Mentor profile policies
CREATE POLICY "Mentors can manage own profile"
  ON mentor_profiles FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Public can view mentor profiles"
  ON mentor_profiles FOR SELECT
  TO public
  USING (true);

-- Job posting policies
CREATE POLICY "Employers can manage own job postings"
  ON job_postings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employer_profiles
      WHERE employer_profiles.id = job_postings.employer_id
      AND employer_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Public can view open jobs"
  ON job_postings FOR SELECT
  TO public
  USING (status = 'open');

-- Job application policies
CREATE POLICY "Employees can manage own applications"
  ON job_applications FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employee_profiles
      WHERE employee_profiles.id = job_applications.applicant_id
      AND employee_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Employers can view applications for their jobs"
  ON job_applications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM job_postings
      JOIN employer_profiles ON employer_profiles.id = job_postings.employer_id
      WHERE job_postings.id = job_applications.job_id
      AND employer_profiles.user_id = auth.uid()
    )
  );

-- Mentorship session policies
CREATE POLICY "Mentors can manage own sessions"
  ON mentorship_sessions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM mentor_profiles
      WHERE mentor_profiles.id = mentorship_sessions.mentor_id
      AND mentor_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Mentees can view own sessions"
  ON mentorship_sessions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employee_profiles
      WHERE employee_profiles.id = mentorship_sessions.mentee_id
      AND employee_profiles.user_id = auth.uid()
    )
  );

-- Activity log policies
CREATE POLICY "Users can view own activity logs"
  ON activity_logs FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Create audit trigger function
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO activity_logs (
    user_id,
    action,
    entity_type,
    entity_id,
    metadata
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    NEW.id,
    jsonb_build_object(
      'old_data', CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
      'new_data', CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW) ELSE NULL END
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add audit triggers
CREATE TRIGGER log_employer_profiles
  AFTER INSERT OR UPDATE OR DELETE ON employer_profiles
  FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_employee_profiles
  AFTER INSERT OR UPDATE OR DELETE ON employee_profiles
  FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_mentor_profiles
  AFTER INSERT OR UPDATE OR DELETE ON mentor_profiles
  FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_job_postings
  AFTER INSERT OR UPDATE OR DELETE ON job_postings
  FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_job_applications
  AFTER INSERT OR UPDATE OR DELETE ON job_applications
  FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_mentorship_sessions
  AFTER INSERT OR UPDATE OR DELETE ON mentorship_sessions
  FOR EACH ROW EXECUTE FUNCTION log_activity();