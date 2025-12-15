-- Seed data for models table
-- Note: This will only work if you have a user in the auth.users table
-- You may need to replace the user_id with an actual user ID from your auth.users table

-- First, let's get a user ID (you'll need to replace this with an actual user ID)
-- For now, we'll use a placeholder that you can replace

-- Insert sample models
INSERT INTO models (
    user_id,
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
    -- Replace this with an actual user ID from auth.users
    (SELECT id FROM auth.users LIMIT 1),
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
    -- Replace this with an actual user ID from auth.users
    (SELECT id FROM auth.users LIMIT 1),
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
