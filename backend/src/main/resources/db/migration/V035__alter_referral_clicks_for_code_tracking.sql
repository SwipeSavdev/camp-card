-- ============================================================================
-- V035: Create referral_link_clicks table for tracking link/QR clicks
-- ============================================================================
-- Tracks clicks on referral and scout links BEFORE a referral record exists.
-- Uses a separate table because the existing referral_clicks table is owned
-- by postgres and the campcard_app user cannot ALTER it.
-- ============================================================================

CREATE TABLE IF NOT EXISTS referral_link_clicks (
    id BIGSERIAL PRIMARY KEY,
    referral_code VARCHAR(50) NOT NULL,
    source VARCHAR(20),
    ip_address VARCHAR(45),
    user_agent TEXT,
    referer VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ref_link_clicks_code ON referral_link_clicks(referral_code);
CREATE INDEX IF NOT EXISTS idx_ref_link_clicks_created_at ON referral_link_clicks(created_at);
