-- V024: Recreate device_tokens and notifications tables with UUID user_id
--
-- Both tables are empty, so we can safely drop and recreate them with the correct schema.
-- This avoids the ownership permission issues with ALTER TABLE.

-- Drop existing tables (they're empty)
DROP TABLE IF EXISTS campcard.device_tokens CASCADE;
DROP TABLE IF EXISTS campcard.notifications CASCADE;

-- Recreate device_tokens with UUID user_id
CREATE TABLE campcard.device_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    token VARCHAR(512) NOT NULL UNIQUE,
    device_type VARCHAR(20) NOT NULL,
    device_model VARCHAR(50),
    os_version VARCHAR(20),
    app_version VARCHAR(20),
    endpoint_arn VARCHAR(512),
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP
);

-- Recreate notifications with UUID user_id
CREATE TABLE campcard.notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    title VARCHAR(100) NOT NULL,
    body TEXT NOT NULL,
    type VARCHAR(50),
    data TEXT,
    image_url VARCHAR(500),
    sent BOOLEAN NOT NULL DEFAULT false,
    read BOOLEAN NOT NULL DEFAULT false,
    sent_at TIMESTAMP,
    read_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_device_tokens_user_id ON campcard.device_tokens(user_id);
CREATE INDEX idx_device_tokens_token ON campcard.device_tokens(token);
CREATE INDEX idx_device_tokens_active ON campcard.device_tokens(active) WHERE active = true;
CREATE INDEX idx_device_tokens_endpoint_arn ON campcard.device_tokens(endpoint_arn) WHERE endpoint_arn IS NOT NULL;

CREATE INDEX idx_notifications_user_id ON campcard.notifications(user_id);
CREATE INDEX idx_notifications_created_at ON campcard.notifications(created_at);
CREATE INDEX idx_notifications_read ON campcard.notifications(read) WHERE read = false;
CREATE INDEX idx_notifications_sent ON campcard.notifications(sent) WHERE sent = false;

-- Add comments
COMMENT ON COLUMN campcard.device_tokens.user_id IS 'Reference to users.id (UUID)';
COMMENT ON COLUMN campcard.device_tokens.endpoint_arn IS 'AWS SNS platform endpoint ARN for push notifications';
COMMENT ON COLUMN campcard.notifications.user_id IS 'Reference to users.id (UUID)';
