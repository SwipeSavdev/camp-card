-- V034: Fix notifications.data column type from jsonb to text

ALTER TABLE campcard.notifications ALTER COLUMN data TYPE TEXT USING data::TEXT;
