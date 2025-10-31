-- Insertion d'un batch de test pour verify-batch
-- Exécuter dans Supabase SQL Editor

-- Vérifier si le batch existe déjà
SELECT * FROM public.batches 
WHERE hedera_token_id = '0.0.7160982' 
  AND hedera_serial_number = 1;

-- Si le batch n'existe pas, l'insérer
INSERT INTO public.batches (
  hedera_token_id,
  hedera_serial_number,
  batch_number,
  product_type,
  quantity,
  location,
  harvest_date,
  status,
  hcs_transaction_ids,
  created_at,
  tokenized_at
) VALUES (
  '0.0.7160982',
  1,
  'BATCH-TEST-001',
  'Organic Tomatoes',
  '500 kg',
  'Farm A, Region X',
  '2025-01-15',
  'verified',
  ARRAY['0.0.123@1234567890.123456789', '0.0.123@1234567891.123456789'],
  NOW(),
  NOW()
)
ON CONFLICT (hedera_token_id, hedera_serial_number) 
DO UPDATE SET
  batch_number = EXCLUDED.batch_number,
  product_type = EXCLUDED.product_type,
  quantity = EXCLUDED.quantity,
  location = EXCLUDED.location,
  harvest_date = EXCLUDED.harvest_date,
  status = EXCLUDED.status,
  hcs_transaction_ids = EXCLUDED.hcs_transaction_ids;

-- Vérifier l'insertion
SELECT 
  id,
  hedera_token_id,
  hedera_serial_number,
  batch_number,
  product_type,
  status,
  created_at
FROM public.batches 
WHERE hedera_token_id = '0.0.7160982' 
  AND hedera_serial_number = 1;

-- Optionnel: Insérer des messages HCS de test
INSERT INTO public.hcs_timeline (
  transaction_id,
  topic_id,
  message,
  timestamp,
  event_type
) VALUES 
(
  '0.0.123@1234567890.123456789',
  '0.0.123',
  '{"event":"harvest","location":"Farm A","date":"2025-01-15"}',
  NOW() - INTERVAL '2 days',
  'harvest'
),
(
  '0.0.123@1234567891.123456789',
  '0.0.123',
  '{"event":"quality_check","status":"passed","inspector":"John Doe"}',
  NOW() - INTERVAL '1 day',
  'quality_check'
)
ON CONFLICT (transaction_id) DO NOTHING;

-- Vérifier les messages HCS
SELECT * FROM public.hcs_timeline 
WHERE transaction_id IN (
  '0.0.123@1234567890.123456789',
  '0.0.123@1234567891.123456789'
);
