-- ============================================================================
-- V035: Alter referral_clicks to support tracking by referral code
-- ============================================================================
-- Currently referral_clicks.referral_id is NOT NULL with FK to referrals(id).
-- But clicks happen BEFORE a referral record exists (visitor clicks link,
-- views buy page — no registration yet). We need to track clicks by the
-- referral/scout code directly.
-- ============================================================================

-- Make referral_id nullable (clicks can exist without a referral record)
ALTER TABLE referral_clicks ALTER COLUMN referral_id DROP NOT NULL;

-- Add referral_code column to track by code
ALTER TABLE referral_clicks ADD COLUMN IF NOT EXISTS referral_code VARCHAR(50);

-- Add source column (link, qr, etc.)
ALTER TABLE referral_clicks ADD COLUMN IF NOT EXISTS source VARCHAR(20);

-- Index on referral_code for fast lookups
CREATE INDEX IF NOT EXISTS idx_referral_clicks_referral_code ON referral_clicks(referral_code);

-- Grant permissions to campcard_app user
GRANT SELECT, INSERT ON referral_clicks TO campcard_app;
