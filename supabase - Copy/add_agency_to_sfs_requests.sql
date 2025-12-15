-- Add agency_id column to sfs_requests table
-- This allows agencies to receive SFS collaboration requests

ALTER TABLE sfs_requests
ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for performance when querying by agency_id
CREATE INDEX IF NOT EXISTS idx_sfs_requests_agency_id ON sfs_requests(agency_id);

-- Update RLS policy to allow agencies to view requests sent to them
ALTER TABLE sfs_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their own sfs_requests" ON sfs_requests;
DROP POLICY IF EXISTS "Users can create sfs_requests" ON sfs_requests;
DROP POLICY IF EXISTS "Users can update their own sfs_requests" ON sfs_requests;

-- Policy for SELECT: Users can view sfs_requests they created or received
CREATE POLICY "Users can view sfs_requests they created or received"
ON sfs_requests
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND (
    -- Creator sent this request
    user_id = auth.uid()
    OR
    -- This request was sent to them (onlyfans_profile_id's owner is this user)
    (SELECT user_id FROM onlyfans_profiles WHERE id = onlyfans_profile_id) = auth.uid()
    OR
    -- This request was sent to their agency
    agency_id = auth.uid()
  )
);

-- Policy for INSERT: Authenticated users can create requests
CREATE POLICY "Authenticated users can create sfs_requests"
ON sfs_requests
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Policy for UPDATE: Users can update requests they created or received
CREATE POLICY "Users can update sfs_requests they created or received"
ON sfs_requests
FOR UPDATE
USING (
  auth.uid() IS NOT NULL
  AND (
    user_id = auth.uid()
    OR (SELECT user_id FROM onlyfans_profiles WHERE id = onlyfans_profile_id) = auth.uid()
    OR agency_id = auth.uid()
  )
)
WITH CHECK (
  auth.uid() IS NOT NULL
  AND (
    user_id = auth.uid()
    OR (SELECT user_id FROM onlyfans_profiles WHERE id = onlyfans_profile_id) = auth.uid()
    OR agency_id = auth.uid()
  )
);

-- Service role policy (for API endpoints)
CREATE POLICY "Service role can access all sfs_requests"
ON sfs_requests
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

