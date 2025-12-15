-- Fix RLS policies for scheduled_sfs table
-- This ensures agencies and creators can properly access their own records

-- Step 1: Check if RLS is enabled
ALTER TABLE scheduled_sfs ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop any existing problematic policies
DROP POLICY IF EXISTS "Users can view their own scheduled_sfs" ON scheduled_sfs;
DROP POLICY IF EXISTS "Users can create scheduled_sfs" ON scheduled_sfs;
DROP POLICY IF EXISTS "Users can update their own scheduled_sfs" ON scheduled_sfs;
DROP POLICY IF EXISTS "Users can delete their own scheduled_sfs" ON scheduled_sfs;
DROP POLICY IF EXISTS "Allow service role full access" ON scheduled_sfs;
DROP POLICY IF EXISTS "Agencies can view their scheduled_sfs" ON scheduled_sfs;
DROP POLICY IF EXISTS "Creators can view their scheduled_sfs" ON scheduled_sfs;

-- Step 3: Create new comprehensive RLS policies

-- Policy 1: Service role can do everything (for API endpoints with service role client)
CREATE POLICY "Service role can access all scheduled_sfs"
ON scheduled_sfs
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Policy 2: SELECT - Creators can see their own SFS (where user_id matches)
CREATE POLICY "Creators can view their own scheduled_sfs"
ON scheduled_sfs
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND (
    -- Creator viewing their own SFS
    user_id = auth.uid()
    OR
    -- User viewing SFS where they are the model (model_id = auth.uid())
    model_id = auth.uid()
  )
);

-- Policy 3: SELECT - Agencies can see their SFS (where agency_id matches)
CREATE POLICY "Agencies can view their scheduled_sfs"
ON scheduled_sfs
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND agency_id = auth.uid()
);

-- Policy 4: INSERT - Anyone authenticated can insert (will be restricted at API level)
CREATE POLICY "Authenticated users can create scheduled_sfs"
ON scheduled_sfs
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Policy 5: UPDATE - Creators/Agencies can update their own
CREATE POLICY "Users can update their own scheduled_sfs"
ON scheduled_sfs
FOR UPDATE
USING (
  auth.uid() IS NOT NULL
  AND (
    user_id = auth.uid()
    OR agency_id = auth.uid()
  )
)
WITH CHECK (
  auth.uid() IS NOT NULL
  AND (
    user_id = auth.uid()
    OR agency_id = auth.uid()
  )
);

-- Policy 6: DELETE - Creators/Agencies can delete their own
CREATE POLICY "Users can delete their own scheduled_sfs"
ON scheduled_sfs
FOR DELETE
USING (
  auth.uid() IS NOT NULL
  AND (
    user_id = auth.uid()
    OR agency_id = auth.uid()
  )
);

-- Step 4: Verify the table structure has agency_id column
-- This should already exist from migration add_agency_id_to_scheduled_sfs.sql
-- If not, add it:
ALTER TABLE scheduled_sfs
ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_scheduled_sfs_agency_id ON scheduled_sfs(agency_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_sfs_user_id ON scheduled_sfs(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_sfs_model_id ON scheduled_sfs(model_id);

-- Step 5: Verify data integrity
-- Check if any records have both user_id and agency_id set (shouldn't happen)
-- SELECT id, user_id, agency_id FROM scheduled_sfs WHERE user_id IS NOT NULL AND agency_id IS NOT NULL;

-- This ensures:
-- 1. Service role (API endpoints) can always access data via service role client
-- 2. Regular authenticated users can see their own records based on role
-- 3. Creators see: their own SFS (user_id) + SFS sent to them (model_id)
-- 4. Agencies see: their own SFS (agency_id)

