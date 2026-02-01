-- Customer payment profiles for Authorize.net CIM (stored payment methods for auto-renew)
CREATE TABLE IF NOT EXISTS campcard.customer_payment_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES campcard.users(id) ON DELETE CASCADE,
    authorize_customer_profile_id VARCHAR(64) NOT NULL,
    authorize_payment_profile_id VARCHAR(64) NOT NULL,
    card_last_four VARCHAR(4),
    card_type VARCHAR(32),
    expiration_month INTEGER,
    expiration_year INTEGER,
    is_default BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_payment_profile UNIQUE (user_id, authorize_payment_profile_id)
);

CREATE INDEX idx_customer_payment_profiles_user_id ON campcard.customer_payment_profiles(user_id);

-- Grant permissions to app user
GRANT SELECT, INSERT, UPDATE, DELETE ON campcard.customer_payment_profiles TO campcard_app;
GRANT USAGE, SELECT ON SEQUENCE campcard.customer_payment_profiles_id_seq TO campcard_app;
