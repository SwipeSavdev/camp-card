-- V021: Add merchant tracking to offer_scan_attempts for merchant-side abuse detection

-- Add merchant columns to track which merchant performed the scan
ALTER TABLE campcard.offer_scan_attempts
    ADD COLUMN IF NOT EXISTS merchant_id BIGINT REFERENCES campcard.merchants(id),
    ADD COLUMN IF NOT EXISTS merchant_location_id BIGINT REFERENCES campcard.merchant_locations(id);

-- Index for merchant abuse queries
CREATE INDEX IF NOT EXISTS idx_offer_scan_attempts_merchant_id
    ON campcard.offer_scan_attempts(merchant_id);

CREATE INDEX IF NOT EXISTS idx_offer_scan_attempts_merchant_location_id
    ON campcard.offer_scan_attempts(merchant_location_id);

-- Composite index for merchant velocity checks (scans per time period)
CREATE INDEX IF NOT EXISTS idx_offer_scan_attempts_merchant_scanned_at
    ON campcard.offer_scan_attempts(merchant_id, scanned_at DESC);

COMMENT ON COLUMN campcard.offer_scan_attempts.merchant_id IS 'Merchant who performed the scan (for abuse tracking)';
COMMENT ON COLUMN campcard.offer_scan_attempts.merchant_location_id IS 'Specific merchant location where scan occurred';
