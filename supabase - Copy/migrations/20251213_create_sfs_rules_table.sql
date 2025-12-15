-- Create sfs_rules table to store user-specific SFS rules
CREATE TABLE IF NOT EXISTS sfs_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID NOT NULL UNIQUE REFERENCES models(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Rule settings
  max_sfs_per_day INTEGER DEFAULT 3,
  content_allowed TEXT[] DEFAULT ARRAY['Fully Explicit', 'Topless', 'SFW Only'],
  pin_content TEXT DEFAULT 'Accept All',
  mass_dm BOOLEAN DEFAULT false,
  fan_count TEXT DEFAULT '80%',
  content_type TEXT DEFAULT 'Topless',
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_sfs_rules_model_id ON sfs_rules(model_id);
CREATE INDEX IF NOT EXISTS idx_sfs_rules_user_id ON sfs_rules(user_id);

-- Enable RLS
ALTER TABLE sfs_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only view/update their own rules
CREATE POLICY "Users can view own SFS rules" ON sfs_rules
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own SFS rules" ON sfs_rules
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own SFS rules" ON sfs_rules
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_sfs_rules_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sfs_rules_update_timestamp
  BEFORE UPDATE ON sfs_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_sfs_rules_timestamp();
