-- V028.1: Add deleted_at column to offers table for soft delete support
-- Runs after V028, before V029 (which references deleted_at)

-- Add deleted_at column for soft deletes
ALTER TABLE campcard.offers ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- Create index for efficient soft delete queries
CREATE INDEX IF NOT EXISTS idx_offers_deleted_at ON campcard.offers(deleted_at) WHERE deleted_at IS NULL;
