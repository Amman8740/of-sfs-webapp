-- Create models table
CREATE TABLE IF NOT EXISTS models (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Basic model information
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    display_picture_url TEXT,
    
    -- Social media links
    onlyfans_link TEXT,
    telegram_link TEXT,
    
    -- Model stats (from the stats card image)
    username TEXT,
    price DECIMAL(10,2), -- e.g., $200/mon
    fan_count INTEGER DEFAULT 0,
    payout_percentage DECIMAL(5,2) DEFAULT 0.00,
    subscription_type TEXT DEFAULT 'Paid' CHECK (subscription_type IN ('Paid', 'Free', 'Trial')),
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Paused', 'Suspended')),
    language TEXT DEFAULT 'English',
    timezone TEXT DEFAULT 'GMT+5',
    
    -- Verification and dates
    verification_date TIMESTAMP WITH TIME ZONE,
    is_verified BOOLEAN DEFAULT false,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_models_user_id ON models(user_id);
CREATE INDEX IF NOT EXISTS idx_models_status ON models(status);
CREATE INDEX IF NOT EXISTS idx_models_username ON models(username);
CREATE INDEX IF NOT EXISTS idx_models_created_at ON models(created_at);

-- Enable Row Level Security
ALTER TABLE models ENABLE ROW LEVEL SECURITY;

-- Create RLS policies - Allow public access to all models
CREATE POLICY "Allow public read access to all models" ON models
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to models" ON models
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to models" ON models
    FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access to models" ON models
    FOR DELETE USING (true);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_models_updated_at 
    BEFORE UPDATE ON models 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
