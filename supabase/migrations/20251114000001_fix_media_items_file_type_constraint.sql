-- Fix media_items file_type constraint to allow supported file types
-- First, drop the existing constraint if it exists
ALTER TABLE media_items DROP CONSTRAINT IF EXISTS media_items_file_type_check;

-- Add a new constraint that allows the supported file types
ALTER TABLE media_items ADD CONSTRAINT media_items_file_type_check
CHECK (file_type IN ('image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/avi'));