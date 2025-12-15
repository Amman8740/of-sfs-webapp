-- Allow agencies to create creator user_profiles for their creators
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Agencies can insert creator profiles for their creators
DROP POLICY IF EXISTS "Agencies can insert creator profiles" ON public.user_profiles;
CREATE POLICY "Agencies can insert creator profiles" ON public.user_profiles
  FOR INSERT WITH CHECK (
    -- Allow users to insert their own profile
    auth.uid() = id
    -- OR allow agencies to insert profiles for creators when agency_id matches
    OR (
      (SELECT user_type FROM public.user_profiles WHERE id = auth.uid()) = 'agency'
      AND user_type = 'creator'
      AND agency_id = auth.uid()
    )
  );

-- Optionally allow agencies to update the agency_id on creator profiles they manage
DROP POLICY IF EXISTS "Agencies can update creator profiles" ON public.user_profiles;
CREATE POLICY "Agencies can update creator profiles" ON public.user_profiles
  FOR UPDATE USING (
    auth.uid() = id
    OR (
      (SELECT user_type FROM public.user_profiles WHERE id = auth.uid()) = 'agency'
      AND agency_id = auth.uid()
    )
  ) WITH CHECK (
    auth.uid() = id
    OR (
      (SELECT user_type FROM public.user_profiles WHERE id = auth.uid()) = 'agency'
      AND agency_id = auth.uid()
    )
  );
