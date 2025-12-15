-- Create promo_link_clicks table for tracking clicks
CREATE TABLE IF NOT EXISTS promo_link_clicks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    promo_link_id UUID NOT NULL REFERENCES promo_links(id) ON DELETE CASCADE,
    clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    referrer TEXT
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_promo_link_clicks_promo_link_id ON promo_link_clicks(promo_link_id);
CREATE INDEX IF NOT EXISTS idx_promo_link_clicks_clicked_at ON promo_link_clicks(clicked_at);

-- Enable RLS
ALTER TABLE promo_link_clicks ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own promo link clicks
CREATE POLICY "Users can view clicks for their own promo links" ON promo_link_clicks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM promo_links
            WHERE promo_links.id = promo_link_clicks.promo_link_id
            AND promo_links.user_id = auth.uid()
        )
    );

-- Create RPC function to increment click count
CREATE OR REPLACE FUNCTION increment_click(promo_link_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO promo_link_clicks (promo_link_id)
    VALUES (promo_link_id);
END;
$$;