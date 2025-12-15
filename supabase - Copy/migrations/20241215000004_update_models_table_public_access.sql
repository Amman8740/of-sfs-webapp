-- Update models table to allow public access
-- This migration updates the existing models table to remove user restrictions

-- Make user_id nullable if it's not already
ALTER TABLE models ALTER COLUMN user_id DROP NOT NULL;

-- Drop existing RLS policies if they exist
DROP POLICY IF EXISTS "Users can view their own models" ON models;
DROP POLICY IF EXISTS "Users can insert their own models" ON models;
DROP POLICY IF EXISTS "Users can update their own models" ON models;
DROP POLICY IF EXISTS "Users can delete their own models" ON models;

-- Create new public access policies
CREATE POLICY "Allow public read access to all models" ON models
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to models" ON models
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to models" ON models
    FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access to models" ON models
    FOR DELETE USING (true);
