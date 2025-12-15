-- Fix the scheduled_sfs status check constraint to allow approved/rejected
-- This migration adds the missing status values to the constraint

-- Drop the old constraint
ALTER TABLE scheduled_sfs
DROP CONSTRAINT IF EXISTS scheduled_sfs_status_check;

-- Add the new constraint with all valid status values
ALTER TABLE scheduled_sfs
ADD CONSTRAINT scheduled_sfs_status_check
CHECK (status IN ('pending', 'approved', 'rejected', 'scheduled', 'done', 'cancelled', 'flagged'));
