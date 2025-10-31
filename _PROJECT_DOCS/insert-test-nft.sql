-- Insert test NFT for verification
-- Run this in Supabase SQL Editor

INSERT INTO public.batches (
  hedera_token_id,
  hedera_serial_number,
  batch_number,
  product_type,
  quantity,
  location,
  harvest_date,
  status,
  tokenized_at,
  certifications,
  hcs_transaction_ids
) VALUES (
  '0.0.7161809',
  1,
  'BATCH-TEST-001',
  'AgriTrust Certificate',
  1000,
  'Farm A, Region X',
  '2025-01-30',
  'verified',
  NOW(),
  ARRAY['Organic', 'Fair Trade'],
  ARRAY['0.0.7127337@1761837780.708140277']
)
ON CONFLICT (hedera_token_id, hedera_serial_number) 
DO UPDATE SET
  batch_number = EXCLUDED.batch_number,
  product_type = EXCLUDED.product_type,
  quantity = EXCLUDED.quantity,
  location = EXCLUDED.location,
  harvest_date = EXCLUDED.harvest_date,
  status = EXCLUDED.status,
  tokenized_at = EXCLUDED.tokenized_at,
  certifications = EXCLUDED.certifications,
  hcs_transaction_ids = EXCLUDED.hcs_transaction_ids;

-- Verify insertion
SELECT 
  id,
  hedera_token_id,
  hedera_serial_number,
  batch_number,
  product_type,
  status,
  tokenized_at
FROM public.batches
WHERE hedera_token_id = '0.0.7161809' AND hedera_serial_number = 1;
