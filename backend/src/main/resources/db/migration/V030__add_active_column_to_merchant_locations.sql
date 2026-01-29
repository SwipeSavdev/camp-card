-- V030: Add active column to merchant_locations table
-- Required by MerchantLocation entity

ALTER TABLE campcard.merchant_locations ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true;

-- Create index for active location queries
CREATE INDEX IF NOT EXISTS idx_merchant_locations_active ON campcard.merchant_locations(merchant_id, active) WHERE active = true;
