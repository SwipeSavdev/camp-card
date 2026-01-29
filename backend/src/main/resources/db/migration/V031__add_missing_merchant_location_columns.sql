-- V031: Add missing columns to merchant_locations table
-- Required by MerchantLocation entity

-- Add uuid column (entity expects it to be NOT NULL and UNIQUE)
ALTER TABLE campcard.merchant_locations ADD COLUMN IF NOT EXISTS uuid UUID UNIQUE DEFAULT gen_random_uuid();

-- Add country column with default 'USA'
ALTER TABLE campcard.merchant_locations ADD COLUMN IF NOT EXISTS country VARCHAR(50) DEFAULT 'USA';

-- Add deleted_at for soft deletes
ALTER TABLE campcard.merchant_locations ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- Backfill uuid for any existing rows without uuid
UPDATE campcard.merchant_locations SET uuid = gen_random_uuid() WHERE uuid IS NULL;

-- Now make uuid NOT NULL
ALTER TABLE campcard.merchant_locations ALTER COLUMN uuid SET NOT NULL;

-- Create index for soft delete queries
CREATE INDEX IF NOT EXISTS idx_merchant_locations_deleted_at ON campcard.merchant_locations(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_merchant_locations_uuid ON campcard.merchant_locations(uuid);
