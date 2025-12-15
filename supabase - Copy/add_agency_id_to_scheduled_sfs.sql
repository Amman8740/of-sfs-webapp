-- Add agency_id column to scheduled_sfs table to track which agency created the SFS
-- This enables agencies to view their created SFS requests using agency_id filtering

ALTER TABLE scheduled_sfs
ADD COLUMN agency_id UUID REFERENCES auth.users(id) DEFAULT NULL;

-- Create index for faster agency-based filtering
CREATE INDEX IF NOT EXISTS idx_scheduled_sfs_agency_id ON scheduled_sfs(agency_id);

-- Comment on the new column
COMMENT ON COLUMN scheduled_sfs.agency_id IS 'References the agency user who created this SFS (for agency-managed models)';
