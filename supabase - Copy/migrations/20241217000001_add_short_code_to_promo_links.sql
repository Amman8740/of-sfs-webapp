-- Add short_code column to promo_links table
ALTER TABLE promo_links ADD COLUMN IF NOT EXISTS short_code TEXT UNIQUE;

-- Create index for short_code
CREATE INDEX IF NOT EXISTS idx_promo_links_short_code ON promo_links(short_code);