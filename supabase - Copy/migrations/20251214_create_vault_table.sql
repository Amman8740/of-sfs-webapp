-- Create vault table for storing media details before publishing
CREATE TABLE IF NOT EXISTS public.vault (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  model_id UUID REFERENCES public.models(id) ON DELETE SET NULL,
  file_url TEXT NOT NULL,
  file_name TEXT,
  file_type TEXT CHECK (file_type IN ('image', 'video')),
  file_size INTEGER,
  thumbnail_url TEXT,
  caption TEXT,
  category TEXT,
  tag_creators TEXT[] DEFAULT ARRAY[]::TEXT[],
  hashtags TEXT[] DEFAULT ARRAY[]::TEXT[],
  notes TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'posted', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on vault table
ALTER TABLE public.vault ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own vault items" ON public.vault
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create vault items" ON public.vault
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vault items" ON public.vault
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vault items" ON public.vault
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for faster queries
CREATE INDEX idx_vault_user_id ON public.vault(user_id);
CREATE INDEX idx_vault_model_id ON public.vault(model_id);
CREATE INDEX idx_vault_status ON public.vault(status);
CREATE INDEX idx_vault_created_at ON public.vault(created_at DESC);
CREATE INDEX idx_vault_category ON public.vault(category);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_vault_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_vault_updated_at ON public.vault;
CREATE TRIGGER update_vault_updated_at
  BEFORE UPDATE ON public.vault
  FOR EACH ROW EXECUTE FUNCTION public.update_vault_updated_at();
