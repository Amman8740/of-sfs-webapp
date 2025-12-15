-- Alternative: Remove foreign key constraint and make model_id just a UUID field
-- This gives more flexibility - model_id can be any UUID (user_id, model_id, etc.)

ALTER TABLE public.vault
DROP CONSTRAINT IF EXISTS vault_model_id_fkey;

-- model_id is now just a regular UUID field without constraint
-- It can reference users, models, or other entities as needed
