-- V002: Councils Table
-- BSA Council organizational structure

-- ============================================================================
-- COUNCILS TABLE
-- ============================================================================
CREATE TABLE councils (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    council_number VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(50),
    region VARCHAR(50) NOT NULL,
    street_address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(2),
    zip_code VARCHAR(10),
    phone VARCHAR(20),
    email VARCHAR(255),
    website_url VARCHAR(500),
    logo_url VARCHAR(500),
    scout_executive_name VARCHAR(255),
    scout_executive_email VARCHAR(255),
    camp_card_coordinator_name VARCHAR(255),
    camp_card_coordinator_email VARCHAR(255),
    camp_card_coordinator_phone VARCHAR(20),
    total_troops INTEGER NOT NULL DEFAULT 0,
    total_scouts INTEGER NOT NULL DEFAULT 0,
    total_sales DECIMAL(12, 2) NOT NULL DEFAULT 0,
    cards_sold INTEGER NOT NULL DEFAULT 0,
    campaign_start_date DATE,
    campaign_end_date DATE,
    goal_amount DECIMAL(12, 2),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    subscription_tier VARCHAR(50) DEFAULT 'BASIC',
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Council status check
ALTER TABLE councils ADD CONSTRAINT chk_council_status
    CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'TRIAL'));

-- Council subscription tier check
ALTER TABLE councils ADD CONSTRAINT chk_council_subscription_tier
    CHECK (subscription_tier IN ('BASIC', 'STANDARD', 'PREMIUM', 'ENTERPRISE'));

-- Council region check
ALTER TABLE councils ADD CONSTRAINT chk_council_region
    CHECK (region IN ('NORTHEAST', 'SOUTHEAST', 'CENTRAL', 'SOUTHERN', 'WESTERN'));

-- Indexes for councils
CREATE INDEX idx_councils_council_number ON councils(council_number);
CREATE INDEX idx_councils_name ON councils(name);
CREATE INDEX idx_councils_region ON councils(region);
CREATE INDEX idx_councils_status ON councils(status);
CREATE INDEX idx_councils_state ON councils(state);
CREATE INDEX idx_councils_total_sales ON councils(total_sales DESC);
CREATE INDEX idx_councils_uuid ON councils(uuid);

-- Trigger to update councils.updated_at
CREATE OR REPLACE FUNCTION update_councils_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER councils_updated_at_trigger
BEFORE UPDATE ON councils
FOR EACH ROW
EXECUTE FUNCTION update_councils_updated_at();

-- ============================================================================
-- USER-COUNCIL RELATIONSHIP TABLE
-- ============================================================================
CREATE TABLE user_councils (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    council_id BIGINT NOT NULL REFERENCES councils(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, council_id)
);

CREATE INDEX idx_user_councils_user_id ON user_councils(user_id);
CREATE INDEX idx_user_councils_council_id ON user_councils(council_id);
CREATE INDEX idx_user_councils_is_primary ON user_councils(is_primary);
