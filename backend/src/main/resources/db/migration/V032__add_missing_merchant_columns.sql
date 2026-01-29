-- V032: Add missing columns to merchants table
-- Required by Merchant entity

-- Add approved_by column (UUID without FK for flexibility)
ALTER TABLE campcard.merchants ADD COLUMN IF NOT EXISTS approved_by UUID;

-- Copy data from approved_by_user_id to approved_by if approved_by_user_id exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'campcard'
        AND table_name = 'merchants'
        AND column_name = 'approved_by_user_id'
    ) THEN
        UPDATE campcard.merchants
        SET approved_by = approved_by_user_id
        WHERE approved_by IS NULL AND approved_by_user_id IS NOT NULL;
    END IF;
END $$;
