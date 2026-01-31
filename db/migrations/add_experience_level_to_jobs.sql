-- Migration: Add experience_level column to jobs table
-- Date: 2026-01-31
-- Description: Add experience level field to support filtering by career level

-- Add experience_level column
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS experience_level TEXT;

-- Add check constraint for valid experience levels
ALTER TABLE jobs
ADD CONSTRAINT valid_experience_level 
CHECK (experience_level IN ('Entry Level', 'Mid Level', 'Senior Level', 'Lead', 'Executive') OR experience_level IS NULL);

-- Create index for filtering
CREATE INDEX IF NOT EXISTS idx_jobs_experience_level 
ON jobs(experience_level) 
WHERE experience_level IS NOT NULL;

-- Add comment
COMMENT ON COLUMN jobs.experience_level IS 'Career level required for the position: Entry Level, Mid Level, Senior Level, Lead, or Executive';

-- Update existing jobs to have NULL experience_level (can be populated later)
-- No data update needed as this is a new optional column

-- Verify migration
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'jobs' 
AND column_name = 'experience_level';
