-- Migration: Add AI analysis fields to batches and verifications tables
-- Idempotent: Safe to run multiple times

-- Add ai_analysis JSONB column to batches table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'batches' AND column_name = 'ai_analysis'
  ) THEN
    ALTER TABLE batches ADD COLUMN ai_analysis JSONB DEFAULT NULL;
    COMMENT ON COLUMN batches.ai_analysis IS 'AI-generated image analysis: caption, anomalies, confidence, tags, generatedAt, ms';
  END IF;
END $$;

-- Ensure verifications.trace column exists and is JSONB
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'verifications' AND column_name = 'trace'
  ) THEN
    ALTER TABLE verifications ADD COLUMN trace JSONB DEFAULT '{}';
    COMMENT ON COLUMN verifications.trace IS 'Complete trace data including HCS timeline and AI provenance summary';
  END IF;
END $$;

-- Create index on ai_analysis for faster queries
CREATE INDEX IF NOT EXISTS idx_batches_ai_analysis ON batches USING GIN (ai_analysis);

-- Create index on trace for faster queries
CREATE INDEX IF NOT EXISTS idx_verifications_trace ON verifications USING GIN (trace);

-- Add comment explaining the AI data structure
COMMENT ON TABLE batches IS 'Agricultural batches with optional AI analysis in ai_analysis field';
COMMENT ON TABLE verifications IS 'NFT verification data with HCS timeline and AI provenance in trace field';
