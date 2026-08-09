-- Certificate purchases table
CREATE TABLE IF NOT EXISTS certificate_purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  course_title TEXT NOT NULL,
  certificate_id TEXT NOT NULL UNIQUE,
  score INTEGER NOT NULL,
  grade TEXT NOT NULL,
  full_name TEXT NOT NULL,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  purchase_amount INTEGER NOT NULL DEFAULT 9900,
  payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Certificate download tracking table
CREATE TABLE IF NOT EXISTS certificate_downloads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  certificate_id TEXT NOT NULL REFERENCES certificate_purchases(certificate_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_certificate_purchases_user_id ON certificate_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_certificate_purchases_course_id ON certificate_purchases(course_id);
CREATE INDEX IF NOT EXISTS idx_certificate_purchases_certificate_id ON certificate_purchases(certificate_id);
CREATE INDEX IF NOT EXISTS idx_certificate_downloads_certificate_id ON certificate_downloads(certificate_id);
CREATE INDEX IF NOT EXISTS idx_certificate_downloads_user_id ON certificate_downloads(user_id);

-- Enable RLS
ALTER TABLE certificate_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificate_downloads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for certificate_purchases
CREATE POLICY "Users can view their own certificate purchases"
  ON certificate_purchases FOR SELECT
  USING (auth.uid() = user_id);

-- Client-side INSERT disabled - only Edge Functions can create certificate purchases
-- This prevents fake score exploitation since server validates exam pass status
CREATE POLICY "Users can update their own certificate purchases"
  ON certificate_purchases FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for certificate_downloads
CREATE POLICY "Users can view download history for their certificates"
  ON certificate_downloads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert download records for their certificates"
  ON certificate_downloads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
CREATE TRIGGER update_certificate_purchases_updated_at
  BEFORE UPDATE ON certificate_purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to generate unique certificate ID
CREATE OR REPLACE FUNCTION generate_certificate_id(course_id TEXT, score INTEGER)
RETURNS TEXT AS $$
BEGIN
  RETURN 'LXAI-' || EXTRACT(YEAR FROM NOW())::TEXT || '-' || SUBSTRING(course_id, 1, 4) || '-' || score::TEXT;
END;
$$ LANGUAGE plpgsql;
