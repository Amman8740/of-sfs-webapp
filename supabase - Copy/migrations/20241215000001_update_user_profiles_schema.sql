-- Update user_profiles table to include additional fields for agency and creator details

-- Add new columns for agency details
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS number_of_creators TEXT,
ADD COLUMN IF NOT EXISTS onlyfans_link TEXT,
ADD COLUMN IF NOT EXISTS platforms TEXT[];

-- Update the profile_data JSONB column structure to be more flexible
-- We'll keep the existing structure but also support the new fields

-- Create an index on the new columns for better query performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_number_of_creators ON user_profiles(number_of_creators);
CREATE INDEX IF NOT EXISTS idx_user_profiles_platforms ON user_profiles USING GIN(platforms);

-- Add comments for documentation
COMMENT ON COLUMN user_profiles.number_of_creators IS 'Number of creators for agency accounts (e.g., "1-5", "6-10", "10-30", etc.)';
COMMENT ON COLUMN user_profiles.onlyfans_link IS 'OnlyFans account link for creator accounts';
COMMENT ON COLUMN user_profiles.platforms IS 'Array of platforms the user is active on (e.g., ["OnlyFans", "Fansly", "ManyVids"])';
