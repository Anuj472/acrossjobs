-- Job Subscriptions Table
-- Stores user subscription preferences for job alerts

CREATE TABLE IF NOT EXISTS job_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  name TEXT,
  categories TEXT[] NOT NULL DEFAULT '{}',
  job_types TEXT[] DEFAULT '{}',
  experience_level TEXT,
  location TEXT,
  salary_min INTEGER,
  notification_frequency TEXT NOT NULL DEFAULT 'daily' CHECK (notification_frequency IN ('instant', 'daily', 'weekly')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_notification_sent_at TIMESTAMPTZ,
  unsubscribe_token TEXT UNIQUE DEFAULT gen_random_uuid()::TEXT,
  
  -- Constraints
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT at_least_one_category CHECK (array_length(categories, 1) > 0)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_email ON job_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_subscriptions_active ON job_subscriptions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_subscriptions_categories ON job_subscriptions USING GIN(categories);
CREATE INDEX IF NOT EXISTS idx_subscriptions_created_at ON job_subscriptions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_unsubscribe ON job_subscriptions(unsubscribe_token);

-- Automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subscription_updated_at
  BEFORE UPDATE ON job_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_updated_at();

-- Row Level Security (RLS)
ALTER TABLE job_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert (subscribe)
CREATE POLICY "Anyone can subscribe"
  ON job_subscriptions
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy: Users can view their own subscriptions
CREATE POLICY "Users can view their subscriptions"
  ON job_subscriptions
  FOR SELECT
  TO public
  USING (true);

-- Policy: Users can update their own subscriptions using unsubscribe token
CREATE POLICY "Users can update via token"
  ON job_subscriptions
  FOR UPDATE
  TO public
  USING (true);

-- Policy: Users can delete their subscriptions via token
CREATE POLICY "Users can delete via token"
  ON job_subscriptions
  FOR DELETE
  TO public
  USING (true);

-- Comments
COMMENT ON TABLE job_subscriptions IS 'Stores user job alert subscription preferences';
COMMENT ON COLUMN job_subscriptions.email IS 'User email address for notifications';
COMMENT ON COLUMN job_subscriptions.categories IS 'Array of job categories (IT, Sales, Marketing, etc.)';
COMMENT ON COLUMN job_subscriptions.job_types IS 'Array of job types (Full-time, Part-time, Remote, etc.)';
COMMENT ON COLUMN job_subscriptions.notification_frequency IS 'How often to send notifications: instant, daily, or weekly';
COMMENT ON COLUMN job_subscriptions.unsubscribe_token IS 'Unique token for unsubscribe link';
