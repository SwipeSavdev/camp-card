-- V020: Fix redemption_token column length
-- The base64-encoded HMAC tokens are longer than 64 characters (typically ~108 chars)

ALTER TABLE campcard.offer_scan_attempts
    ALTER COLUMN redemption_token TYPE VARCHAR(255);

COMMENT ON COLUMN campcard.offer_scan_attempts.redemption_token IS 'Base64-encoded HMAC-signed token embedded in QR code (up to 255 chars)';
