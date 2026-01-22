-- Add screenshot_url field to payments table for manual payment verification
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS screenshot_url TEXT;

-- Add check constraint to ensure screenshot is only required for manual payments
ALTER TABLE public.payments
ADD CONSTRAINT check_screenshot_for_manual_payments 
CHECK (
  (payment_method IN ('vodafone_cash', 'instapay') AND screenshot_url IS NOT NULL) OR
  (payment_method = 'card')
) NOT VALID;

-- Create storage bucket for payment screenshots if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types, owner, created_at, updated_at)
VALUES (
  'payment-screenshots',
  'payment-screenshots',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp'],
  auth.uid(),
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Set RLS policy for payment screenshots bucket
CREATE POLICY "Users can upload payment screenshots" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'payment-screenshots' AND
    owner = auth.uid()
  );

CREATE POLICY "Users can view their own payment screenshots" ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'payment-screenshots' AND
    owner = auth.uid()
  );

CREATE POLICY "Admins can view all payment screenshots" ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'payment-screenshots' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
