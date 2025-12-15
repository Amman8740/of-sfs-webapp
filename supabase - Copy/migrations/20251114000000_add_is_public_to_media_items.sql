-- Add is_public column to media_items table
ALTER TABLE media_items ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- Add comment to the column
COMMENT ON COLUMN media_items.is_public IS 'Whether the media item is publicly visible';