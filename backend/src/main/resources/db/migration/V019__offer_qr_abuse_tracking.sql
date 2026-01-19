-- V019: Add QR code scan tracking for anti-abuse detection
--
-- NOTE: Due to RDS permissions, the following table alterations must be run manually by DBA:
--
-- 1. Users table (for abuse tracking):
--   ALTER TABLE campcard.users ADD COLUMN IF NOT EXISTS abuse_flag_count INTEGER DEFAULT 0;
--   ALTER TABLE campcard.users ADD COLUMN IF NOT EXISTS abuse_flagged_at TIMESTAMP;
--   ALTER TABLE campcard.users ADD COLUMN IF NOT EXISTS abuse_flag_reason TEXT;
--
-- 2. Offer redemptions table (for QR tracking):
--   ALTER TABLE campcard.offer_redemptions ADD COLUMN IF NOT EXISTS redemption_token VARCHAR(64);
--   ALTER TABLE campcard.offer_redemptions ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMP;
--   ALTER TABLE campcard.offer_redemptions ADD COLUMN IF NOT EXISTS scan_count INTEGER DEFAULT 0;
--   ALTER TABLE campcard.offer_redemptions ADD COLUMN IF NOT EXISTS last_scanned_at TIMESTAMP;
--   ALTER TABLE campcard.offer_redemptions ADD COLUMN IF NOT EXISTS last_scan_device_fingerprint VARCHAR(255);
--   ALTER TABLE campcard.offer_redemptions ADD COLUMN IF NOT EXISTS flagged_for_abuse BOOLEAN DEFAULT FALSE;
--   ALTER TABLE campcard.offer_redemptions ADD COLUMN IF NOT EXISTS abuse_flag_reason TEXT;
--   CREATE INDEX IF NOT EXISTS idx_offer_redemptions_redemption_token ON campcard.offer_redemptions(redemption_token);
--   CREATE INDEX IF NOT EXISTS idx_offer_redemptions_flagged_for_abuse ON campcard.offer_redemptions(flagged_for_abuse) WHERE flagged_for_abuse = TRUE;

-- Create offer_scan_attempts table for tracking QR scans
-- This table is owned by campcard_app so we can create it directly
CREATE TABLE IF NOT EXISTS campcard.offer_scan_attempts (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,

    -- Core references
    offer_id BIGINT NOT NULL REFERENCES campcard.offers(id),
    user_id UUID NOT NULL REFERENCES campcard.users(id),
    redemption_id BIGINT REFERENCES campcard.offer_redemptions(id),

    -- Token for QR code (unique per user+offer combination per period)
    redemption_token VARCHAR(64) NOT NULL,

    -- Scan metadata
    scanned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    device_fingerprint VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,

    -- Location data (optional)
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),

    -- Result tracking
    scan_result VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    -- PENDING, SUCCESS, ALREADY_REDEEMED, EXPIRED, INVALID, FLAGGED

    was_successful BOOLEAN DEFAULT FALSE,
    failure_reason TEXT,

    -- Abuse detection flags
    is_suspicious BOOLEAN DEFAULT FALSE,
    suspicious_reason TEXT,

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for efficient querying on new table
CREATE INDEX IF NOT EXISTS idx_offer_scan_attempts_offer_id ON campcard.offer_scan_attempts(offer_id);
CREATE INDEX IF NOT EXISTS idx_offer_scan_attempts_user_id ON campcard.offer_scan_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_offer_scan_attempts_redemption_token ON campcard.offer_scan_attempts(redemption_token);
CREATE INDEX IF NOT EXISTS idx_offer_scan_attempts_scanned_at ON campcard.offer_scan_attempts(scanned_at);
CREATE INDEX IF NOT EXISTS idx_offer_scan_attempts_scan_result ON campcard.offer_scan_attempts(scan_result);
CREATE INDEX IF NOT EXISTS idx_offer_scan_attempts_is_suspicious ON campcard.offer_scan_attempts(is_suspicious) WHERE is_suspicious = TRUE;

COMMENT ON TABLE campcard.offer_scan_attempts IS 'Tracks all QR code scan attempts for anti-abuse detection';
COMMENT ON COLUMN campcard.offer_scan_attempts.redemption_token IS 'Unique HMAC-signed token embedded in QR code';
COMMENT ON COLUMN campcard.offer_scan_attempts.device_fingerprint IS 'Hash of device characteristics for duplicate detection';
COMMENT ON COLUMN campcard.offer_scan_attempts.is_suspicious IS 'Flag set when scan patterns indicate potential abuse';
