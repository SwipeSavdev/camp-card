-- V010: Schema Security Setup - Verification Only
-- This migration verifies the security configuration for the campcard schema
-- The actual schema setup was performed by a DBA with superuser privileges
-- This migration only performs verification checks that the app user can execute

-- ============================================================================
-- SECURITY MODEL (Reference Documentation)
-- ============================================================================
-- 1. Dedicated 'campcard' schema for all application tables
-- 2. Non-superuser 'campcard_app' role for application access
-- 3. Public schema CREATE privileges revoked
-- 4. Schema owned by postgres, grants given to campcard_app

-- ============================================================================
-- VERIFICATION CHECKS (App user can run these)
-- ============================================================================

-- Verify campcard schema exists and we can access it
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'campcard') THEN
        RAISE EXCEPTION 'campcard schema does not exist';
    END IF;
    RAISE NOTICE 'Verified: campcard schema exists';
END $$;

-- Verify we can see our tables in campcard schema
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'campcard'
    AND table_type = 'BASE TABLE';

    IF table_count = 0 THEN
        RAISE EXCEPTION 'No tables found in campcard schema';
    END IF;
    RAISE NOTICE 'Verified: Found % tables in campcard schema', table_count;
END $$;

-- Verify no application tables in public schema
DO $$
DECLARE
    public_table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO public_table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
    AND table_name NOT IN ('spatial_ref_sys');  -- Exclude PostGIS system tables

    IF public_table_count > 0 THEN
        RAISE WARNING 'Found % application tables in public schema - consider migrating', public_table_count;
    ELSE
        RAISE NOTICE 'Verified: No application tables in public schema';
    END IF;
END $$;