-- Create merchants table
CREATE TABLE merchants (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    business_name VARCHAR(255) NOT NULL,
    dba_name VARCHAR(255),
    description TEXT,
    category VARCHAR(50) NOT NULL,
    tax_id VARCHAR(50) NOT NULL,
    business_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20),
    website_url VARCHAR(500),
    logo_url VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    terms_accepted BOOLEAN NOT NULL DEFAULT FALSE,
    terms_accepted_at TIMESTAMP,
    approved_at TIMESTAMP,
    approved_by_user_id UUID REFERENCES users(id),
    rejected_at TIMESTAMP,
    rejected_by_user_id UUID REFERENCES users(id),
    rejection_reason TEXT,
    total_offers INTEGER NOT NULL DEFAULT 0,
    active_offers INTEGER NOT NULL DEFAULT 0,
    total_redemptions INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create merchant_locations table
CREATE TABLE merchant_locations (
    id BIGSERIAL PRIMARY KEY,
    merchant_id BIGINT NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    location_name VARCHAR(255) NOT NULL,
    street_address VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(2) NOT NULL,
    zip_code VARCHAR(10) NOT NULL,
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    phone VARCHAR(20),
    hours TEXT,
    primary_location BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for merchants
CREATE INDEX idx_merchants_status ON merchants(status);
CREATE INDEX idx_merchants_category ON merchants(category);
CREATE INDEX idx_merchants_uuid ON merchants(uuid);
CREATE INDEX idx_merchants_business_name ON merchants(business_name);
CREATE INDEX idx_merchants_approved_by ON merchants(approved_by_user_id);
CREATE INDEX idx_merchants_created_at ON merchants(created_at);

-- Indexes for merchant_locations
CREATE INDEX idx_merchant_locations_merchant_id ON merchant_locations(merchant_id);
CREATE INDEX idx_merchant_locations_primary ON merchant_locations(primary_location);
CREATE INDEX idx_merchant_locations_coordinates ON merchant_locations(latitude, longitude);
CREATE INDEX idx_merchant_locations_city_state ON merchant_locations(city, state);

-- Trigger to update merchants.updated_at
CREATE OR REPLACE FUNCTION update_merchants_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER merchants_updated_at_trigger
BEFORE UPDATE ON merchants
FOR EACH ROW
EXECUTE FUNCTION update_merchants_updated_at();

-- Trigger to update merchant_locations.updated_at
CREATE OR REPLACE FUNCTION update_merchant_locations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER merchant_locations_updated_at_trigger
BEFORE UPDATE ON merchant_locations
FOR EACH ROW
EXECUTE FUNCTION update_merchant_locations_updated_at();

-- Ensure only one primary location per merchant
CREATE UNIQUE INDEX idx_merchant_one_primary_location 
ON merchant_locations(merchant_id) 
WHERE primary_location = TRUE;
