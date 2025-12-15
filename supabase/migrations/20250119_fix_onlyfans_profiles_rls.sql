/**
 * Migration: Fix onlyfans_profiles RLS to allow public read access
 * Issue: Smart Match feature needs to read all profiles to find matches
 * Previous RLS policies only allowed users to view their own profiles
 * Solution: Add public read policy while keeping insert/update/delete restricted to own records
 * Date: 2025-01-19
 */

-- Drop the overly restrictive "Users can view own profiles" policy
drop policy if exists "Users can view own profiles" on onlyfans_profiles;

-- Create policy that allows public read access to all profiles
create policy "Public read access to all profiles" 
  on onlyfans_profiles 
  for select 
  using (true);

-- Keep the existing insert, update, delete policies restrictive (users can only modify their own)
-- No need to change them as they already check auth.uid() = user_id

-- Verify the policies are in place
-- Run: SELECT policyname, polcmd, poldef FROM pg_policies WHERE tablename = 'onlyfans_profiles';
