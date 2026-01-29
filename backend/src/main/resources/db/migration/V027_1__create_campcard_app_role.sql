-- V027.1: Create campcard_app role if it doesn't exist
-- Runs after V027, before V028
-- V028 has GRANT statements that require this role to exist

DO $$
BEGIN
    -- Create role if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'campcard_app') THEN
        -- Create the role (no login, just for permission grouping)
        CREATE ROLE campcard_app NOLOGIN;
        RAISE NOTICE 'Created role campcard_app';
    END IF;
END $$;
