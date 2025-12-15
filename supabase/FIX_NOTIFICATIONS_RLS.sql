-- Fix notifications table CHECK constraint and RLS policies

-- Step 1: Drop existing CHECK constraint if it exists
ALTER TABLE notifications 
DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Step 2: Add new CHECK constraint with all valid notification types
ALTER TABLE notifications
ADD CONSTRAINT notifications_type_check 
CHECK (type IN ('info', 'success', 'warning', 'error', 'sfs_request', 'smart_match', 'scheduled_sfs', 'analytics'));

-- Step 3: Add missing columns if they don't exist
ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS action_url TEXT,
ADD COLUMN IF NOT EXISTS related_entity_id TEXT,
ADD COLUMN IF NOT EXISTS related_entity_type TEXT,
ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE;

-- Step 4: Drop existing RLS policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Service role can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;

-- Step 5: Enable RLS if not already enabled
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Step 6: Create new RLS policies

-- Policy for SELECT: Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
ON notifications
FOR SELECT
USING (user_id = auth.uid());

-- Policy for INSERT: Service role can create notifications for any user
CREATE POLICY "Service role can insert notifications"
ON notifications
FOR INSERT
WITH CHECK (true);

-- Policy for UPDATE: Users can update their own notifications
CREATE POLICY "Users can update their own notifications"
ON notifications
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Policy for DELETE: Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications"
ON notifications
FOR DELETE
USING (user_id = auth.uid());
