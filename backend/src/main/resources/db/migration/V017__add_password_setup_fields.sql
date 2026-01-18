-- V017: Add password setup fields for admin-created users
-- When an admin creates a user, they need to set their own password after email verification

ALTER TABLE campcard.users ADD COLUMN IF NOT EXISTS password_setup_required BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE campcard.users ADD COLUMN IF NOT EXISTS password_setup_token VARCHAR(255);
ALTER TABLE campcard.users ADD COLUMN IF NOT EXISTS password_setup_expires_at TIMESTAMP;

-- Index for looking up users by password setup token
CREATE INDEX IF NOT EXISTS idx_users_password_setup_token ON campcard.users(password_setup_token) WHERE password_setup_token IS NOT NULL;

COMMENT ON COLUMN campcard.users.password_setup_required IS 'True if user was created by admin and needs to set their own password';
COMMENT ON COLUMN campcard.users.password_setup_token IS 'Token for password setup flow, used after email verification';
COMMENT ON COLUMN campcard.users.password_setup_expires_at IS 'Expiration timestamp for password setup token';
