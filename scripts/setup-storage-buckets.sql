-- Create storage buckets for lessons (if they don't exist)
INSERT INTO storage.buckets (id, name, owner, public) 
VALUES 
  ('lesson-videos', 'lesson-videos', null, true),
  ('lesson-pdfs', 'lesson-pdfs', null, true)
ON CONFLICT (id) DO NOTHING;

-- Set bucket policies for public access
CREATE POLICY "Allow public read access to lesson videos"
ON storage.objects FOR SELECT USING (bucket_id = 'lesson-videos');

CREATE POLICY "Allow authenticated users to upload lesson videos"
ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'lesson-videos' 
  AND (SELECT auth.uid() IS NOT NULL)
);

CREATE POLICY "Allow public read access to lesson pdfs"
ON storage.objects FOR SELECT USING (bucket_id = 'lesson-pdfs');

CREATE POLICY "Allow authenticated users to upload lesson pdfs"
ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'lesson-pdfs' 
  AND (SELECT auth.uid() IS NOT NULL)
);
