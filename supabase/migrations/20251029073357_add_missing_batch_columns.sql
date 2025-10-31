-- Add missing columns to batches table
ALTER TABLE batches
  ADD COLUMN IF NOT EXISTS product_type TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS quantity TEXT NOT NULL DEFAULT '0',
  ADD COLUMN IF NOT EXISTS harvest_date DATE NOT NULL DEFAULT CURRENT_DATE;

-- Remove defaults after adding columns
ALTER TABLE batches
  ALTER COLUMN product_type DROP DEFAULT,
  ALTER COLUMN quantity DROP DEFAULT,
  ALTER COLUMN harvest_date DROP DEFAULT;