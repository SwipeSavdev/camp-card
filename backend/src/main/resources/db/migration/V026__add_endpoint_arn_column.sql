-- V026: Add endpoint_arn column to device_tokens
-- This is a separate migration from V024 because V024 tried to do multiple ALTER TABLE operations
-- that require table ownership. Adding a column should work without ownership.

-- Note: If this also fails with "must be owner", then the DBA needs to grant ownership:
--   ALTER TABLE campcard.device_tokens OWNER TO campcard_app;

ALTER TABLE campcard.device_tokens
ADD COLUMN IF NOT EXISTS endpoint_arn VARCHAR(512);

COMMENT ON COLUMN campcard.device_tokens.endpoint_arn IS 'AWS SNS platform endpoint ARN for push notifications';
