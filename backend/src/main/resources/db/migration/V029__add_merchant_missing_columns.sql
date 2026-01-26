-- V029: Add missing columns to merchants table to match Merchant.java entity
-- Fixes Bug 3: "Can't change status from pending to approved after adding Merchant"
-- The Merchant entity expects these columns but V004 migration didn't include them

-- Add missing columns
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS council_id BIGINT;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS contact_name VARCHAR(200);
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS contact_email VARCHAR(100);
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS business_hours TEXT;

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_merchants_deleted_at ON merchants(deleted_at);
CREATE INDEX IF NOT EXISTS idx_merchants_council_id ON merchants(council_id);

-- Migrate existing data: copy business_email to contact_email where contact_email is NULL
UPDATE merchants SET contact_email = business_email WHERE contact_email IS NULL;
