-- V009: Baseline Sync Migration
-- This migration synchronizes the Flyway history with the existing database schema
-- The database was created using Hibernate ddl-auto before Flyway was enabled
-- This is a no-op migration that simply establishes the Flyway baseline

-- Verify essential tables exist (will fail if not, preventing corrupted state)
DO $$
BEGIN
    -- Check core tables exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
        RAISE EXCEPTION 'Table users does not exist - cannot baseline';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'councils') THEN
        RAISE EXCEPTION 'Table councils does not exist - cannot baseline';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'merchants') THEN
        RAISE EXCEPTION 'Table merchants does not exist - cannot baseline';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'offers') THEN
        RAISE EXCEPTION 'Table offers does not exist - cannot baseline';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'subscriptions') THEN
        RAISE EXCEPTION 'Table subscriptions does not exist - cannot baseline';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'subscription_plans') THEN
        RAISE EXCEPTION 'Table subscription_plans does not exist - cannot baseline';
    END IF;

    RAISE NOTICE 'Baseline verification passed - all core tables exist';
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