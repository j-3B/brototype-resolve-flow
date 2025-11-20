-- Create storage bucket for complaint attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('complaint-attachments', 'complaint-attachments', false);

-- RLS policies for storage bucket
-- Students can upload files to their own complaints
CREATE POLICY "Students can upload complaint attachments"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'complaint-attachments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can view attachments for complaints they have access to
CREATE POLICY "Users can view complaint attachments"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'complaint-attachments'
  AND (
    -- Owner can view their own
    auth.uid()::text = (storage.foldername(name))[1]
    OR
    -- Staff and superadmin can view all
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('staff', 'superadmin')
    )
  )
);

-- Users can delete their own attachments (before complaint is submitted)
CREATE POLICY "Users can delete own complaint attachments"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'complaint-attachments'
  AND auth.uid()::text = (storage.foldername(name))[1]
);