INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'models-profile-pictures',
  'models-profile-pictures',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view model profile pictures"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'models-profile-pictures' );

CREATE POLICY "Authenticated users can upload model profile pictures"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'models-profile-pictures'
);

CREATE POLICY "Authenticated users can update model profile pictures"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'models-profile-pictures' )
WITH CHECK ( bucket_id = 'models-profile-pictures' );

CREATE POLICY "Authenticated users can delete model profile pictures"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'models-profile-pictures' );
