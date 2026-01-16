-- Create storage bucket for deal documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'deal-documents',
  'deal-documents',
  false,
  26214400, -- 25MB
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
) ON CONFLICT (id) DO NOTHING;

-- Storage policies for deal documents

-- Allow authenticated users to upload to their deal folders
CREATE POLICY "Users can upload to deal folders"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'deal-documents' AND
  EXISTS (
    SELECT 1 FROM public.deals
    WHERE deals.id::text = (storage.foldername(name))[1]
    AND (
      EXISTS (SELECT 1 FROM public.vendors WHERE vendors.id = deals.vendor_id AND vendors.profile_id = auth.uid())
      OR EXISTS (SELECT 1 FROM public.brokers WHERE brokers.id = deals.broker_id AND brokers.profile_id = auth.uid())
    )
  )
);

-- Allow users to read documents from their deals
CREATE POLICY "Users can read deal documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'deal-documents' AND
  EXISTS (
    SELECT 1 FROM public.deals
    WHERE deals.id::text = (storage.foldername(name))[1]
    AND (
      EXISTS (SELECT 1 FROM public.vendors WHERE vendors.id = deals.vendor_id AND vendors.profile_id = auth.uid())
      OR EXISTS (SELECT 1 FROM public.brokers WHERE brokers.id = deals.broker_id AND brokers.profile_id = auth.uid())
    )
  )
);

-- Allow users to delete their own uploaded documents
CREATE POLICY "Users can delete their deal documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'deal-documents' AND
  EXISTS (
    SELECT 1 FROM public.deals
    WHERE deals.id::text = (storage.foldername(name))[1]
    AND (
      EXISTS (SELECT 1 FROM public.vendors WHERE vendors.id = deals.vendor_id AND vendors.profile_id = auth.uid())
      OR EXISTS (SELECT 1 FROM public.brokers WHERE brokers.id = deals.broker_id AND brokers.profile_id = auth.uid())
    )
  )
);
