-- Create storage bucket for creator profile pictures
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-pictures',
  'profile-pictures',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Public can view profile pictures
CREATE POLICY "Public can view profile pictures"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'profile-pictures' );

-- Authenticated users can upload their own profile pictures
CREATE POLICY "Users can upload their profile pictures"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-pictures'
  AND auth.uid()::text = (string_to_array(name, '/'))[1]
);

-- Users can update their own profile pictures
CREATE POLICY "Users can update their profile pictures"
ON storage.objects FOR UPDATE
TO authenticated
USING ( 
  bucket_id = 'profile-pictures'
  AND auth.uid()::text = (string_to_array(name, '/'))[1]
)
WITH CHECK ( bucket_id = 'profile-pictures' );

-- Users can delete their own profile pictures
CREATE POLICY "Users can delete their profile pictures"
ON storage.objects FOR DELETE
TO authenticated
USING ( 
  bucket_id = 'profile-pictures'
  AND auth.uid()::text = (string_to_array(name, '/'))[1]
);
