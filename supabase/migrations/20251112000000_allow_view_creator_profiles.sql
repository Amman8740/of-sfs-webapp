-- Allow authenticated users to view all creator profiles for tagging purposes
DROP POLICY IF EXISTS "Authenticated users can view creator profiles" ON public.user_profiles;
CREATE POLICY "Authenticated users can view creator profiles" ON public.user_profiles
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND user_type = 'creator'
  );