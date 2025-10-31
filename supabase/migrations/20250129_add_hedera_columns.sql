-- Add Hedera and verification columns to batches table
ALTER TABLE batches
  ADD COLUMN IF NOT EXISTS hedera_token_id TEXT,
  ADD COLUMN IF NOT EXISTS hedera_serial_number TEXT,
  ADD COLUMN IF NOT EXISTS tokenized_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS hcs_transaction_ids TEXT[],
  ADD COLUMN IF NOT EXISTS ai_provenance_summary TEXT,
  ADD COLUMN IF NOT EXISTS certifications TEXT[],
  ADD COLUMN IF NOT EXISTS batch_number TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_batches_hedera_token ON batches(hedera_token_id, hedera_serial_number);
