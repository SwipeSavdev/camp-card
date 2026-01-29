-- V033: Align notifications table schema with Notification entity
-- The V024 migration created different column names than the entity expects

-- Add body column (entity expects 'body', DB has 'message')
ALTER TABLE campcard.notifications ADD COLUMN IF NOT EXISTS body TEXT;

-- Copy data from message to body if message exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'campcard'
        AND table_name = 'notifications'
        AND column_name = 'message'
    ) THEN
        UPDATE campcard.notifications SET body = message WHERE body IS NULL;
    END IF;
END $$;

-- Add data column (for deep linking JSON data)
ALTER TABLE campcard.notifications ADD COLUMN IF NOT EXISTS data TEXT;

-- Add image_url column
ALTER TABLE campcard.notifications ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);

-- Add sent column (entity expects 'sent', DB might have different)
ALTER TABLE campcard.notifications ADD COLUMN IF NOT EXISTS sent BOOLEAN NOT NULL DEFAULT false;

-- Add read column (entity expects 'read', DB has 'is_read')
ALTER TABLE campcard.notifications ADD COLUMN IF NOT EXISTS read BOOLEAN NOT NULL DEFAULT false;

-- Copy data from is_read to read if is_read exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'campcard'
        AND table_name = 'notifications'
        AND column_name = 'is_read'
    ) THEN
        UPDATE campcard.notifications SET read = is_read WHERE read IS NULL OR read = false;
    END IF;
END $$;

-- Add sent_at column
ALTER TABLE campcard.notifications ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP;

-- Add read_at column
ALTER TABLE campcard.notifications ADD COLUMN IF NOT EXISTS read_at TIMESTAMP;

-- Make body NOT NULL with a default for existing rows
UPDATE campcard.notifications SET body = 'Notification' WHERE body IS NULL;
ALTER TABLE campcard.notifications ALTER COLUMN body SET NOT NULL;
