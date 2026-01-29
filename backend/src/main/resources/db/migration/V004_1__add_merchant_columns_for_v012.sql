-- V004.1: Add columns required by V012 seed data
-- Runs after V004, before V005

-- Add council_id column for merchant-council association
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS council_id BIGINT;

-- Add contact information columns required by V012 INSERT
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS contact_name VARCHAR(200);
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS contact_email VARCHAR(100);

-- Add business hours column
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS business_hours TEXT;

-- Add soft delete column
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- Make business_email nullable and add default so V012 INSERT works
-- V012 doesn't include business_email in its INSERT statement
ALTER TABLE merchants ALTER COLUMN business_email DROP NOT NULL;
ALTER TABLE merchants ALTER COLUMN business_email SET DEFAULT 'noemail@placeholder.com';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_merchants_council_id ON merchants(council_id);
CREATE INDEX IF NOT EXISTS idx_merchants_deleted_at ON merchants(deleted_at);
