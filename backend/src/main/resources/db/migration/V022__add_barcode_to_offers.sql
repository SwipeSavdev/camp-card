-- V022: Add optional barcode field to offers table for one-time use offer tracking
-- This allows merchants to associate a barcode with offers for tracking purposes

ALTER TABLE campcard.offers ADD COLUMN IF NOT EXISTS barcode VARCHAR(255);

-- Add index for barcode lookups
CREATE INDEX IF NOT EXISTS idx_offers_barcode ON campcard.offers(barcode) WHERE barcode IS NOT NULL;
