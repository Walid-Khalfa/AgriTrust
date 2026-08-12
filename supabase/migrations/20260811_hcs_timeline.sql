-- hcs_timeline: one row per Hedera Consensus Service message, linked to a batch
CREATE TABLE IF NOT EXISTS hcs_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id TEXT NOT NULL UNIQUE,
  batch_id UUID REFERENCES batches(id) ON DELETE SET NULL,
  timestamp TIMESTAMPTZ,
  event TEXT,
  location TEXT,
  operator TEXT,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE hcs_timeline ENABLE ROW LEVEL SECURITY;

-- Read-only access for public verification
CREATE POLICY "Allow anon read access to hcs_timeline"
  ON hcs_timeline FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Deny anon write access to hcs_timeline"
  ON hcs_timeline FOR INSERT
  TO anon
  WITH CHECK (false);

CREATE POLICY "Deny anon update access to hcs_timeline"
  ON hcs_timeline FOR UPDATE
  TO anon
  USING (false)
  WITH CHECK (false);

CREATE POLICY "Deny anon delete access to hcs_timeline"
  ON hcs_timeline FOR DELETE
  TO anon
  USING (false);

CREATE POLICY "Allow service role full access to hcs_timeline"
  ON hcs_timeline FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_hcs_timeline_batch_id ON hcs_timeline(batch_id);
CREATE INDEX IF NOT EXISTS idx_hcs_timeline_transaction_id ON hcs_timeline(transaction_id);
