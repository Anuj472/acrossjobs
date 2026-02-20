-- Add slug column to jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create unique index on slug for fast lookups and uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS idx_jobs_slug ON jobs(slug) WHERE slug IS NOT NULL;

-- Create index for faster slug queries
CREATE INDEX IF NOT EXISTS idx_jobs_slug_active ON jobs(slug, is_active) WHERE slug IS NOT NULL;

-- Add comment to explain the slug column
COMMENT ON COLUMN jobs.slug IS 'SEO-friendly URL slug generated from job title';

-- Create function to generate slug from title
CREATE OR REPLACE FUNCTION generate_job_slug(job_title TEXT, job_id UUID)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  short_id TEXT;
BEGIN
  -- Convert title to slug format
  base_slug := LOWER(TRIM(job_title));
  base_slug := REGEXP_REPLACE(base_slug, '&', 'and', 'g');
  base_slug := REGEXP_REPLACE(base_slug, '[^a-z0-9]+', '-', 'g');
  base_slug := REGEXP_REPLACE(base_slug, '^-+|-+$', '', 'g');
  base_slug := SUBSTRING(base_slug, 1, 100);
  base_slug := REGEXP_REPLACE(base_slug, '-+$', '', 'g');
  
  -- Append short ID for uniqueness
  short_id := SPLIT_PART(job_id::TEXT, '-', 1);
  
  RETURN base_slug || '-' || short_id;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create trigger to auto-generate slug on insert if not provided
CREATE OR REPLACE FUNCTION auto_generate_job_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_job_slug(NEW.title, NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new jobs
DROP TRIGGER IF EXISTS trigger_auto_generate_job_slug ON jobs;
CREATE TRIGGER trigger_auto_generate_job_slug
  BEFORE INSERT ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_job_slug();

-- Create trigger to regenerate slug when title changes
CREATE OR REPLACE FUNCTION update_job_slug_on_title_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.title != OLD.title THEN
    NEW.slug := generate_job_slug(NEW.title, NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_job_slug ON jobs;
CREATE TRIGGER trigger_update_job_slug
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  WHEN (OLD.title IS DISTINCT FROM NEW.title)
  EXECUTE FUNCTION update_job_slug_on_title_change();

-- Generate slugs for existing jobs
-- This will be run manually or via migration script
-- UPDATE jobs SET slug = generate_job_slug(title, id) WHERE slug IS NULL OR slug = '';
