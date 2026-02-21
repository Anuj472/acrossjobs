-- Add slug column to jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Create index for faster slug lookups
CREATE INDEX IF NOT EXISTS idx_jobs_slug ON jobs(slug);

-- Create function to auto-generate unique slugs with company name
CREATE OR REPLACE FUNCTION generate_unique_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  new_slug TEXT;
  counter INTEGER := 1;
  company_name TEXT;
BEGIN
  -- Only generate slug if title exists and slug is null
  IF NEW.title IS NOT NULL AND (NEW.slug IS NULL OR NEW.slug = '') THEN
    -- Fetch company name
    SELECT name INTO company_name FROM companies WHERE id = NEW.company_id;
    
    -- Generate base slug from title and company name
    IF company_name IS NOT NULL THEN
      base_slug := regexp_replace(lower(NEW.title || ' ' || company_name), '[^a-z0-9]+', '-', 'g');
    ELSE
      base_slug := regexp_replace(lower(NEW.title), '[^a-z0-9]+', '-', 'g');
    END IF;
    
    base_slug := trim(both '-' from regexp_replace(base_slug, '-+', '-', 'g'));
    base_slug := substring(base_slug, 1, 100);
    base_slug := trim(trailing '-' from base_slug);
    
    new_slug := base_slug;
    
    -- Ensure uniqueness by appending counter if needed
    WHILE EXISTS (
      SELECT 1 FROM jobs 
      WHERE slug = new_slug 
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    ) LOOP
      counter := counter + 1;
      new_slug := base_slug || '-' || counter;
    END LOOP;
    
    NEW.slug := new_slug;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS trg_jobs_slug ON jobs;

-- Create trigger to auto-generate slug on insert/update
CREATE TRIGGER trg_jobs_slug
  BEFORE INSERT OR UPDATE OF title ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION generate_unique_slug();

-- Add comment
COMMENT ON COLUMN jobs.slug IS 'SEO-friendly URL slug generated from job title and company name';
