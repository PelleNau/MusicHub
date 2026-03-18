
-- Create storage bucket for manuals
INSERT INTO storage.buckets (id, name, public)
VALUES ('manuals', 'manuals', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload manuals
CREATE POLICY "Authenticated users can upload manuals"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'manuals');

-- Allow anyone to read manuals (public bucket)
CREATE POLICY "Anyone can read manuals"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'manuals');

-- Allow authenticated users to delete their manuals
CREATE POLICY "Authenticated users can delete manuals"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'manuals');
