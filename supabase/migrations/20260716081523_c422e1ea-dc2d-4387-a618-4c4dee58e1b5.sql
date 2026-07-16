-- Add photos gallery column to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS photos text[] NOT NULL DEFAULT '{}';

-- Storage RLS policies for profile-photos bucket (bucket created via tool)
-- Public read
CREATE POLICY "Profile photos are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile-photos');

-- Users can upload only into their own folder: {user_id}/...
CREATE POLICY "Users upload own profile photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'profile-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users update own profile photos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'profile-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users delete own profile photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'profile-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );