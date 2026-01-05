-- Create offers table
CREATE TABLE offers (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    merchant_id BIGINT NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    discount_type VARCHAR(50) NOT NULL,
    discount_value DECIMAL(10, 2),
    min_purchase_amount DECIMAL(10, 2),
    max_discount_amount DECIMAL(10, 2),
    category VARCHAR(50),
    terms TEXT,
    image_url VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    valid_from TIMESTAMP NOT NULL,
    valid_until TIMESTAMP NOT NULL,
    usage_limit INTEGER,
    usage_limit_per_user INTEGER,
    total_redemptions INTEGER NOT NULL DEFAULT 0,
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    scout_exclusive BOOLEAN NOT NULL DEFAULT FALSE,
    requires_qr_verification BOOLEAN NOT NULL DEFAULT TRUE,
    location_specific BOOLEAN NOT NULL DEFAULT FALSE,
    merchant_location_id BIGINT REFERENCES merchant_locations(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create offer_redemptions table
CREATE TABLE offer_redemptions (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    offer_id BIGINT NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    merchant_id BIGINT NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    merchant_location_id BIGINT REFERENCES merchant_locations(id) ON DELETE SET NULL,
    purchase_amount DECIMAL(10, 2),
    discount_amount DECIMAL(10, 2) NOT NULL,
    final_amount DECIMAL(10, 2),
    verification_code VARCHAR(50) UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    redeemed_at TIMESTAMP,
    verified_at TIMESTAMP,
    verified_by_user_id UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for offers
CREATE INDEX idx_offers_merchant_id ON offers(merchant_id);
CREATE INDEX idx_offers_category ON offers(category);
CREATE INDEX idx_offers_status ON offers(status);
CREATE INDEX idx_offers_featured ON offers(featured);
CREATE INDEX idx_offers_scout_exclusive ON offers(scout_exclusive);
CREATE INDEX idx_offers_valid_dates ON offers(valid_from, valid_until);
CREATE INDEX idx_offers_created_at ON offers(created_at);
CREATE INDEX idx_offers_uuid ON offers(uuid);

-- Indexes for offer_redemptions
CREATE INDEX idx_offer_redemptions_offer_id ON offer_redemptions(offer_id);
CREATE INDEX idx_offer_redemptions_user_id ON offer_redemptions(user_id);
CREATE INDEX idx_offer_redemptions_merchant_id ON offer_redemptions(merchant_id);
CREATE INDEX idx_offer_redemptions_status ON offer_redemptions(status);
CREATE INDEX idx_offer_redemptions_verification_code ON offer_redemptions(verification_code);
CREATE INDEX idx_offer_redemptions_created_at ON offer_redemptions(created_at);

-- Trigger to update offers.updated_at
CREATE OR REPLACE FUNCTION update_offers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER offers_updated_at_trigger
BEFORE UPDATE ON offers
FOR EACH ROW
EXECUTE FUNCTION update_offers_updated_at();
