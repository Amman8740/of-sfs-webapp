-- Create promo_links table
CREATE TABLE IF NOT EXISTS promo_links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    model TEXT NOT NULL,
    promo_name TEXT NOT NULL,
    fans_gained INTEGER DEFAULT 0,
    renewals INTEGER DEFAULT 0,
    revenue_from_renewals DECIMAL(10,2) DEFAULT 0.00,
    spend_to_sub_ratio DECIMAL(10,2) DEFAULT 0.00,
    roi DECIMAL(5,2) DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Paused')),
    url TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_promo_links_user_id ON promo_links(user_id);
CREATE INDEX IF NOT EXISTS idx_promo_links_status ON promo_links(status);
CREATE INDEX IF NOT EXISTS idx_promo_links_created_at ON promo_links(created_at);

-- Enable Row Level Security
ALTER TABLE promo_links ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own promo links" ON promo_links
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own promo links" ON promo_links
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own promo links" ON promo_links
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own promo links" ON promo_links
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_promo_links_updated_at 
    BEFORE UPDATE ON promo_links 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
