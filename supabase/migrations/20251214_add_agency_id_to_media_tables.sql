-- Add agency_id column to media_items table
ALTER TABLE public.media_items
ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add agency_id column to vault table
ALTER TABLE public.vault
ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for faster queries by agency_id
CREATE INDEX IF NOT EXISTS idx_media_items_agency_id ON public.media_items(agency_id);
CREATE INDEX IF NOT EXISTS idx_vault_agency_id ON public.vault(agency_id);

-- Comment for documentation
COMMENT ON COLUMN public.media_items.agency_id IS 'Agency ID when media is uploaded by an agency for their models';
COMMENT ON COLUMN public.vault.agency_id IS 'Agency ID when media is saved to vault by an agency for their models';
