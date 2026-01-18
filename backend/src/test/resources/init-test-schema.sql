-- Initialize test schema for Testcontainers
-- This script runs before Flyway migrations

-- Create the campcard schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS campcard;

-- Grant permissions to the test user
GRANT ALL PRIVILEGES ON SCHEMA campcard TO test_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA campcard TO test_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA campcard TO test_user;

-- Set the default search path to include campcard schema
ALTER USER test_user SET search_path TO campcard, public;
