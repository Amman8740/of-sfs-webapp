-- Update user_type constraint to use 'creator' instead of 'client'
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_user_type_check;
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_user_type_check 
  CHECK (user_type IN ('agency', 'creator'));
