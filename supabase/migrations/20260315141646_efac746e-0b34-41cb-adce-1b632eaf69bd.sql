
-- Create public bucket for AI-generated amp illustrations
INSERT INTO storage.buckets (id, name, public)
VALUES ('amp-illustrations', 'amp-illustrations', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "Public read amp-illustrations"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'amp-illustrations');

-- Allow service role to insert (edge function uses service role)
CREATE POLICY "Service role insert amp-illustrations"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'amp-illustrations');
