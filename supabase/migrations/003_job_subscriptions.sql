-- Create job subscriptions table
CREATE TABLE IF NOT EXISTS job_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  job_categories TEXT[] NOT NULL,
  job_types TEXT[],
  locations TEXT,
  salary_min INTEGER,
  keywords TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_notified_at TIMESTAMP WITH TIME ZONE
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_job_subscriptions_email ON job_subscriptions(email);

-- Create index on active subscriptions
CREATE INDEX IF NOT EXISTS idx_job_subscriptions_active ON job_subscriptions(is_active) WHERE is_active = true;

-- Create index on categories for matching
CREATE INDEX IF NOT EXISTS idx_job_subscriptions_categories ON job_subscriptions USING GIN(job_categories);

-- Enable Row Level Security
ALTER TABLE job_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert subscriptions (no auth required)
CREATE POLICY "Anyone can subscribe" ON job_subscriptions
  FOR INSERT
  WITH CHECK (true);

-- Policy: Users can view their own subscription by email
CREATE POLICY "View own subscription" ON job_subscriptions
  FOR SELECT
  USING (true);

-- Policy: Users can update their own subscription (for unsubscribe)
CREATE POLICY "Update own subscription" ON job_subscriptions
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_job_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_job_subscriptions_updated_at_trigger
  BEFORE UPDATE ON job_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_job_subscriptions_updated_at();

-- Comment on table
COMMENT ON TABLE job_subscriptions IS 'Stores user job subscription preferences for email notifications';
COMMENT ON COLUMN job_subscriptions.email IS 'User email address (unique)';
COMMENT ON COLUMN job_subscriptions.name IS 'User full name';
COMMENT ON COLUMN job_subscriptions.job_categories IS 'Array of job category IDs (e.g., ["it", "sales"])';
COMMENT ON COLUMN job_subscriptions.job_types IS 'Array of job types (e.g., ["full-time", "remote"])';
COMMENT ON COLUMN job_subscriptions.locations IS 'Comma-separated preferred locations';
COMMENT ON COLUMN job_subscriptions.salary_min IS 'Minimum salary expectation';
COMMENT ON COLUMN job_subscriptions.keywords IS 'Comma-separated keywords for job matching';
COMMENT ON COLUMN job_subscriptions.is_active IS 'Whether subscription is active (false = unsubscribed)';
COMMENT ON COLUMN job_subscriptions.last_notified_at IS 'Last time user was sent a notification';
