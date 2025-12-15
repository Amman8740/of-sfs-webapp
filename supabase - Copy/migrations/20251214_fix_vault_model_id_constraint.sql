-- Fix vault table model_id foreign key constraint
-- Change from referencing models table to user_profiles table
-- This allows storing user ID (owner) instead of model ID

-- Drop the old foreign key constraint
ALTER TABLE public.vault
DROP CONSTRAINT IF EXISTS vault_model_id_fkey;

-- Add new foreign key constraint to user_profiles
ALTER TABLE public.vault
ADD CONSTRAINT vault_model_id_fkey FOREIGN KEY (model_id) 
REFERENCES public.user_profiles(id) ON DELETE SET NULL;
