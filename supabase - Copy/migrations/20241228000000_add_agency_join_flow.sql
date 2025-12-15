-- Add agency_code column to user_profiles for agencies
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS agency_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS agency_id UUID;

-- Create agency_join_requests table for tracking creator join requests
CREATE TABLE IF NOT EXISTS agency_join_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agency_code TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(agency_id, creator_id)
);

-- Enable RLS on agency_join_requests
ALTER TABLE agency_join_requests ENABLE ROW LEVEL SECURITY;

-- Policies for agency_join_requests
CREATE POLICY "Agencies can view their own join requests" ON agency_join_requests
  FOR SELECT USING (auth.uid() = agency_id);

CREATE POLICY "Creators can view their own join requests" ON agency_join_requests
  FOR SELECT USING (auth.uid() = creator_id);

CREATE POLICY "Creators can insert join requests" ON agency_join_requests
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Agencies can update their join requests" ON agency_join_requests
  FOR UPDATE USING (auth.uid() = agency_id);

-- Create function to update updated_at for agency_join_requests
CREATE OR REPLACE FUNCTION public.update_agency_join_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_agency_join_requests_updated_at ON agency_join_requests;
CREATE TRIGGER update_agency_join_requests_updated_at
  BEFORE UPDATE ON agency_join_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_agency_join_requests_updated_at();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_agency_join_requests_agency_id ON agency_join_requests(agency_id);
CREATE INDEX IF NOT EXISTS idx_agency_join_requests_creator_id ON agency_join_requests(creator_id);
CREATE INDEX IF NOT EXISTS idx_agency_join_requests_status ON agency_join_requests(status);
CREATE INDEX IF NOT EXISTS idx_agency_join_requests_agency_code ON agency_join_requests(agency_code);

-- Create function to generate agency code when agency profile is created
CREATE OR REPLACE FUNCTION public.generate_agency_code()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate code for agencies
  IF NEW.user_type = 'agency' AND NEW.agency_code IS NULL THEN
    NEW.agency_code := UPPER(SUBSTRING(MD5(CAST(NEW.id AS TEXT) || CAST(NOW() AS TEXT)), 1, 8));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for agency code generation
DROP TRIGGER IF EXISTS generate_agency_code_trigger ON user_profiles;
CREATE TRIGGER generate_agency_code_trigger
  BEFORE INSERT OR UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.generate_agency_code();

-- Update user_profiles RLS to allow viewing public agency codes
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Add policy for creators to view agency profiles (to see public info)
CREATE POLICY "Creators can view agency profiles" ON user_profiles
  FOR SELECT USING (user_type = 'agency' OR auth.uid() = id);
