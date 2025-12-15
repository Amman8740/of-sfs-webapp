-- MySQL schema for only_profiles table
-- This table stores OnlyFans profile data with SFS availability and content slot information

CREATE TABLE only_profiles (
    id UUID DEFAULT (UUID()) PRIMARY KEY,
    user_id UUID NOT NULL,
    
    -- Profile information
    username VARCHAR(255) NOT NULL,
    creator_name VARCHAR(255),
    profile_pic_url TEXT,
    
    -- Fan and engagement data
    fans INT DEFAULT 0,
    
    -- SFS settings
    sfs_available BOOLEAN DEFAULT TRUE,
    sfs_availability_time VARCHAR(100), -- e.g., "2:00 PM - 5:00 PM", "Morning", "Evening"
    
    -- Content slots
    content_slots_available INT DEFAULT 0, -- Number of available slots
    content_slots_info JSON DEFAULT '[]', -- Detailed slot information
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    KEY idx_user_id (user_id),
    KEY idx_username (username),
    KEY idx_sfs_available (sfs_available),
    CONSTRAINT unique_user_profile UNIQUE(user_id, username)
);

-- Add this to your existing models table if not present
-- ALTER TABLE models ADD COLUMN only_profile_id UUID REFERENCES only_profiles(id);
