-- Add creator information columns to agency_join_requests table
ALTER TABLE agency_join_requests
ADD COLUMN IF NOT EXISTS creator_name TEXT,
ADD COLUMN IF NOT EXISTS creator_email TEXT,
ADD COLUMN IF NOT EXISTS creator_username TEXT,
ADD COLUMN IF NOT EXISTS creator_avatar_url TEXT;

-- Create index on creator_email for faster lookups
CREATE INDEX IF NOT EXISTS idx_agency_join_requests_creator_email ON agency_join_requests(creator_email);
