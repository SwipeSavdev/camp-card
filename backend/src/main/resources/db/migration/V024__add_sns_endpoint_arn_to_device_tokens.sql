-- Add SNS endpoint ARN field to device_tokens table for AWS SNS push notifications
-- This stores the AWS SNS platform endpoint ARN for each device token
-- Also migrate user_id from BIGINT to UUID to match users table

-- Add endpoint_arn column
ALTER TABLE campcard.device_tokens
ADD COLUMN IF NOT EXISTS endpoint_arn VARCHAR(512);

-- Change user_id from BIGINT to UUID (to match users.id type)
-- First drop the existing column and recreate with correct type
ALTER TABLE campcard.device_tokens
ALTER COLUMN user_id TYPE UUID USING user_id::text::uuid;

-- Change notifications table user_id from BIGINT to UUID as well
ALTER TABLE campcard.notifications
ALTER COLUMN user_id TYPE UUID USING user_id::text::uuid;

-- Create index for faster lookups by endpoint ARN
CREATE INDEX IF NOT EXISTS idx_device_tokens_endpoint_arn
ON campcard.device_tokens(endpoint_arn)
WHERE endpoint_arn IS NOT NULL;

COMMENT ON COLUMN campcard.device_tokens.endpoint_arn IS 'AWS SNS platform endpoint ARN for push notifications';
COMMENT ON COLUMN campcard.device_tokens.user_id IS 'Reference to users.id (UUID)';
COMMENT ON COLUMN campcard.notifications.user_id IS 'Reference to users.id (UUID)';
