-- V019: Add QR code scan tracking for anti-abuse detection
-- This migration adds:
-- 1. offer_scan_attempts table to track every QR scan
-- 2. Abuse flag fields on users table
-- 3. Redemption token field on offer_redemptions for QR verification

-- Add abuse tracking fields to users table
ALTER TABLE campcard.users
ADD COLUMN IF NOT EXISTS abuse_flag_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS abuse_flagged_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS abuse_flag_reason TEXT;

-- Create offer_scan_attempts table for tracking QR scans
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

-- Add redemption token to offer_redemptions for QR verification
ALTER TABLE campcard.offer_redemptions
ADD COLUMN IF NOT EXISTS redemption_token VARCHAR(64),
ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS scan_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_scanned_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS last_scan_device_fingerprint VARCHAR(255),
ADD COLUMN IF NOT EXISTS flagged_for_abuse BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS abuse_flag_reason TEXT;

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_offer_scan_attempts_offer_id ON campcard.offer_scan_attempts(offer_id);
CREATE INDEX IF NOT EXISTS idx_offer_scan_attempts_user_id ON campcard.offer_scan_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_offer_scan_attempts_redemption_token ON campcard.offer_scan_attempts(redemption_token);
CREATE INDEX IF NOT EXISTS idx_offer_scan_attempts_scanned_at ON campcard.offer_scan_attempts(scanned_at);
CREATE INDEX IF NOT EXISTS idx_offer_scan_attempts_scan_result ON campcard.offer_scan_attempts(scan_result);
CREATE INDEX IF NOT EXISTS idx_offer_scan_attempts_is_suspicious ON campcard.offer_scan_attempts(is_suspicious) WHERE is_suspicious = TRUE;

CREATE INDEX IF NOT EXISTS idx_offer_redemptions_redemption_token ON campcard.offer_redemptions(redemption_token);
CREATE INDEX IF NOT EXISTS idx_offer_redemptions_flagged_for_abuse ON campcard.offer_redemptions(flagged_for_abuse) WHERE flagged_for_abuse = TRUE;

CREATE INDEX IF NOT EXISTS idx_users_abuse_flag_count ON campcard.users(abuse_flag_count) WHERE abuse_flag_count > 0;

-- Grant permissions to application user
GRANT SELECT, INSERT, UPDATE ON campcard.offer_scan_attempts TO campcard_app;
GRANT USAGE, SELECT ON SEQUENCE campcard.offer_scan_attempts_id_seq TO campcard_app;

COMMENT ON TABLE campcard.offer_scan_attempts IS 'Tracks all QR code scan attempts for anti-abuse detection';
COMMENT ON COLUMN campcard.offer_scan_attempts.redemption_token IS 'Unique HMAC-signed token embedded in QR code';
COMMENT ON COLUMN campcard.offer_scan_attempts.device_fingerprint IS 'Hash of device characteristics for duplicate detection';
COMMENT ON COLUMN campcard.offer_scan_attempts.is_suspicious IS 'Flag set when scan patterns indicate potential abuse';
COMMENT ON COLUMN campcard.users.abuse_flag_count IS 'Number of times user has been flagged for suspicious activity';
COMMENT ON COLUMN campcard.offer_redemptions.scan_count IS 'Number of times this redemption QR was scanned';
