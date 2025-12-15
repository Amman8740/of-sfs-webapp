-- Add columns to sfs_settings table for time slots and days
ALTER TABLE public.sfs_settings
ADD COLUMN IF NOT EXISTS time_slot_1 TEXT DEFAULT '1:00pm',
ADD COLUMN IF NOT EXISTS time_slot_2 TEXT DEFAULT '2:00pm',
ADD COLUMN IF NOT EXISTS time_slot_3 TEXT DEFAULT '3:00pm',
ADD COLUMN IF NOT EXISTS available_days TEXT[] DEFAULT ARRAY['Tuesday', 'Saturday', 'Sunday'];

-- Create index on available_days for faster querying
CREATE INDEX IF NOT EXISTS idx_sfs_settings_available_days ON public.sfs_settings USING GIN (available_days);

-- Add comment to document the new columns
COMMENT ON COLUMN public.sfs_settings.time_slot_1 IS 'First available time slot for SFS (e.g., 1:00pm)';
COMMENT ON COLUMN public.sfs_settings.time_slot_2 IS 'Second available time slot for SFS (e.g., 2:00pm)';
COMMENT ON COLUMN public.sfs_settings.time_slot_3 IS 'Third available time slot for SFS (e.g., 3:00pm)';
COMMENT ON COLUMN public.sfs_settings.available_days IS 'Array of days available for SFS (e.g., [''Monday'', ''Tuesday''])';
