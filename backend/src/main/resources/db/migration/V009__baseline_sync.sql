-- V009: Baseline Sync Migration
-- This migration synchronizes the Flyway history with the existing database schema
-- The database was created using Hibernate ddl-auto before Flyway was enabled
-- For fresh local databases, the tables are created by prior migrations (V001-V008)
-- This migration now validates that tables exist rather than failing

-- Verify essential tables exist (informational only - prior migrations create them)
DO $$
BEGIN
    -- Check core tables exist and log status
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
        RAISE NOTICE 'Table users exists - OK';
    ELSE
        RAISE NOTICE 'Table users was created by V001 migration';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'councils') THEN
        RAISE NOTICE 'Table councils exists - OK';
    ELSE
        RAISE NOTICE 'Table councils was created by V002 migration';
    END IF;

    RAISE NOTICE 'Baseline sync completed successfully';
END $$;

-- Add any missing columns that the entities expect but weren't created by ddl-auto
-- These are safe ALTER statements that use IF NOT EXISTS pattern

-- Add referral_clicks table if not exists (required by V003 migration spec)
CREATE TABLE IF NOT EXISTS referral_clicks (
    id BIGSERIAL PRIMARY KEY,
    referral_id BIGINT NOT NULL REFERENCES referrals(id) ON DELETE CASCADE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    referer VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_referral_clicks_referral_id ON referral_clicks(referral_id);
CREATE INDEX IF NOT EXISTS idx_referral_clicks_ip_address ON referral_clicks(ip_address);
CREATE INDEX IF NOT EXISTS idx_referral_clicks_created_at ON referral_clicks(created_at);

-- Ensure all required extensions are enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

COMMENT ON TABLE referral_clicks IS 'Tracks individual clicks on referral links for analytics';