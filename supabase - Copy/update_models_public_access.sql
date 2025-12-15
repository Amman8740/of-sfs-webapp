-- Run this SQL in your Supabase SQL Editor to update the models table for public access

-- Make user_id nullable
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

-- Insert sample models for testing
INSERT INTO models (
    name,
    email,
    display_picture_url,
    onlyfans_link,
    telegram_link,
    username,
    price,
    fan_count,
    payout_percentage,
    subscription_type,
    status,
    language,
    timezone,
    is_verified,
    verification_date
) VALUES 
(
    'Elena Petrova',
    'elena.petrova@example.com',
    'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    'https://onlyfans.com/elena_petrova',
    'https://t.me/elena_petrova',
    'elena_petrova',
    200.00,
    8310,
    70.00,
    'Paid',
    'Active',
    'English',
    'GMT+5',
    true,
    '2025-11-05T10:30:00Z'
),
(
    'Liam O''Connell',
    'liam.oconnell@example.com',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    'https://onlyfans.com/liam_oconnell',
    'https://t.me/liam_oconnell',
    'liam_oconnell',
    150.00,
    7821,
    75.00,
    'Paid',
    'Active',
    'English',
    'GMT+0',
    true,
    '2025-08-03T14:20:00Z'
);
