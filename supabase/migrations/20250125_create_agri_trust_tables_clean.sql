-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anon read access to batches" ON batches;
DROP POLICY IF EXISTS "Deny anon write access to batches" ON batches;
DROP POLICY IF EXISTS "Deny anon update access to batches" ON batches;
DROP POLICY IF EXISTS "Deny anon delete access to batches" ON batches;
DROP POLICY IF EXISTS "Allow service role full access to batches" ON batches;

DROP POLICY IF EXISTS "Allow anon read access to tokens" ON tokens;
DROP POLICY IF EXISTS "Deny anon write access to tokens" ON tokens;
DROP POLICY IF EXISTS "Deny anon update access to tokens" ON tokens;
DROP POLICY IF EXISTS "Deny anon delete access to tokens" ON tokens;
DROP POLICY IF EXISTS "Allow service role full access to tokens" ON tokens;

DROP POLICY IF EXISTS "Allow anon read access to verifications" ON verifications;
DROP POLICY IF EXISTS "Deny anon write access to verifications" ON verifications;
DROP POLICY IF EXISTS "Deny anon update access to verifications" ON verifications;
DROP POLICY IF EXISTS "Deny anon delete access to verifications" ON verifications;
DROP POLICY IF EXISTS "Allow service role full access to verifications" ON verifications;

-- Create batches table
CREATE TABLE IF NOT EXISTS batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_name TEXT NOT NULL,
  location TEXT NOT NULL,
  photo_url TEXT NOT NULL,
  hcs_tx_id TEXT NOT NULL,
  ai_analysis JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create tokens table
CREATE TABLE IF NOT EXISTS tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id TEXT NOT NULL,
  serial_number TEXT NOT NULL,
  hcs_tx_ids TEXT[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(token_id, serial_number)
);

-- Create verifications table
CREATE TABLE IF NOT EXISTS verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id TEXT NOT NULL,
  serial_number TEXT NOT NULL,
  trace JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(token_id, serial_number)
);

-- Enable Row Level Security
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;

-- Batches policies
CREATE POLICY "Allow anon read access to batches"
  ON batches FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Deny anon write access to batches"
  ON batches FOR INSERT
  TO anon
  WITH CHECK (false);

CREATE POLICY "Deny anon update access to batches"
  ON batches FOR UPDATE
  TO anon
  USING (false)
  WITH CHECK (false);

CREATE POLICY "Deny anon delete access to batches"
  ON batches FOR DELETE
  TO anon
  USING (false);

CREATE POLICY "Allow service role full access to batches"
  ON batches FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Tokens policies
CREATE POLICY "Allow anon read access to tokens"
  ON tokens FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Deny anon write access to tokens"
  ON tokens FOR INSERT
  TO anon
  WITH CHECK (false);

CREATE POLICY "Deny anon update access to tokens"
  ON tokens FOR UPDATE
  TO anon
  USING (false)
  WITH CHECK (false);

CREATE POLICY "Deny anon delete access to tokens"
  ON tokens FOR DELETE
  TO anon
  USING (false);

CREATE POLICY "Allow service role full access to tokens"
  ON tokens FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Verifications policies
CREATE POLICY "Allow anon read access to verifications"
  ON verifications FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Deny anon write access to verifications"
  ON verifications FOR INSERT
  TO anon
  WITH CHECK (false);

CREATE POLICY "Deny anon update access to verifications"
  ON verifications FOR UPDATE
  TO anon
  USING (false)
  WITH CHECK (false);

CREATE POLICY "Deny anon delete access to verifications"
  ON verifications FOR DELETE
  TO anon
  USING (false);

CREATE POLICY "Allow service role full access to verifications"
  ON verifications FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_batches_hcs_tx_id ON batches(hcs_tx_id);
CREATE INDEX IF NOT EXISTS idx_tokens_token_id_serial ON tokens(token_id, serial_number);
CREATE INDEX IF NOT EXISTS idx_verifications_token_id_serial ON verifications(token_id, serial_number);
