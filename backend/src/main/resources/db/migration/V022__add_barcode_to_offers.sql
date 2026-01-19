-- V022: Add optional barcode field to offers table for one-time use offer tracking
-- This allows merchants to associate a barcode with offers for tracking purposes
--
-- NOTE: This migration requires DBA intervention since campcard_app is not the table owner.
-- The barcode column needs to be added manually by the DBA using:
--   ALTER TABLE campcard.offers ADD COLUMN barcode VARCHAR(255);
--   CREATE INDEX idx_offers_barcode ON campcard.offers(barcode) WHERE barcode IS NOT NULL;
--
-- This migration file is a placeholder that does nothing but records the migration as applied.

-- No-op statement to mark migration as complete
SELECT 1;
