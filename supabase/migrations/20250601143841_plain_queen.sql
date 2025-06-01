/*
  # Rename end column to edt

  1. Changes
    - Rename 'end' column to 'edt' in projects table to avoid PostgreSQL reserved keyword
    - Update foreign key constraints and indexes that reference this column
    - Update RLS policies to use new column name

  2. Security
    - Preserves existing RLS policies
    - No data loss during migration
*/

-- Rename column in projects table
ALTER TABLE projects 
  RENAME COLUMN "end" TO edt;

-- Update any existing indexes
DROP INDEX IF EXISTS projects_end_idx;
CREATE INDEX projects_edt_idx ON projects(edt);

-- Update RLS policies to use new column name
ALTER POLICY "Projects are manageable by owners" ON projects
  USING ((uid = uid()) OR (org = (SELECT profiles.id FROM profiles WHERE profiles.uid = uid())));

-- Log schema change
SELECT audit.log_schema_change(
  'rename_end_to_edt',
  'Renamed projects.end to projects.edt to avoid reserved keyword',
  CURRENT_TIMESTAMP
);