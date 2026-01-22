-- ============================================================================
-- V028: Council Payment Gateway Configuration
-- ============================================================================
-- Enables each council to have its own Authorize.net gateway configuration
-- for processing payments. Credentials are encrypted at rest.
-- ============================================================================

-- Create enum type for gateway types (extensible for future payment providers)
CREATE TYPE campcard.gateway_type AS ENUM ('AUTHORIZE_NET');

-- Create enum type for gateway environment
CREATE TYPE campcard.gateway_environment AS ENUM ('SANDBOX', 'PRODUCTION');

-- Create the council_payment_configs table
CREATE TABLE campcard.council_payment_configs (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    council_id BIGINT NOT NULL REFERENCES campcard.councils(id) ON DELETE CASCADE,
    gateway_type campcard.gateway_type NOT NULL DEFAULT 'AUTHORIZE_NET',

    -- Encrypted credentials (AES-256-GCM encrypted, Base64 encoded)
    api_login_id_encrypted VARCHAR(512) NOT NULL,
    transaction_key_encrypted VARCHAR(512) NOT NULL,

    -- Gateway environment
    environment campcard.gateway_environment NOT NULL DEFAULT 'SANDBOX',

    -- Status flags
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    last_verified_at TIMESTAMP,

    -- Audit fields
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT REFERENCES campcard.users(id),
    updated_by BIGINT REFERENCES campcard.users(id),

    -- Ensure one active config per council per gateway type
    CONSTRAINT uk_council_gateway UNIQUE (council_id, gateway_type)
);

-- Create indexes for common queries
CREATE INDEX idx_council_payment_configs_council_id ON campcard.council_payment_configs(council_id);
CREATE INDEX idx_council_payment_configs_active ON campcard.council_payment_configs(council_id, is_active) WHERE is_active = true;

-- Add comments for documentation
COMMENT ON TABLE campcard.council_payment_configs IS 'Stores encrypted payment gateway credentials for each council';
COMMENT ON COLUMN campcard.council_payment_configs.api_login_id_encrypted IS 'AES-256-GCM encrypted Authorize.net API Login ID';
COMMENT ON COLUMN campcard.council_payment_configs.transaction_key_encrypted IS 'AES-256-GCM encrypted Authorize.net Transaction Key';
COMMENT ON COLUMN campcard.council_payment_configs.is_verified IS 'True if credentials have been successfully tested against the gateway';

-- Grant permissions to application user
GRANT SELECT, INSERT, UPDATE, DELETE ON campcard.council_payment_configs TO campcard_app;
GRANT USAGE, SELECT ON SEQUENCE campcard.council_payment_configs_id_seq TO campcard_app;
