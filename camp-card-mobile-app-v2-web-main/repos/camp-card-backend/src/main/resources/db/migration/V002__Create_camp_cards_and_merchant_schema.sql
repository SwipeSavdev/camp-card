-- V002__Create_camp_cards_and_merchant_schema.sql
-- Camp Cards, Merchants, Offers, and Settings schema
-- Created: December 2025

-- =============================================
-- MERCHANTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS merchants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Business Identity
    business_name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL, -- DINING, AUTO, ENTERTAINMENT, etc.
    description TEXT,
    website_url VARCHAR(500),
    phone_number VARCHAR(20),
    email VARCHAR(255),
    
    -- Branding
    logo_url VARCHAR(500),
    banner_url VARCHAR(500),
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    verified BOOLEAN NOT NULL DEFAULT false,
    
    -- Audit
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    
    CONSTRAINT fk_merchants_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_merchants_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_merchants_category ON merchants(category);
CREATE INDEX IF NOT EXISTS idx_merchants_is_active ON merchants(is_active);
CREATE INDEX IF NOT EXISTS idx_merchants_verified ON merchants(verified);

-- =============================================
-- MERCHANT LOCATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS merchant_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Merchant Association
    merchant_id UUID NOT NULL,
    
    -- Location Details
    name VARCHAR(255) NOT NULL,
    address VARCHAR(500) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state_province VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    
    -- Geolocation
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    radius_km DECIMAL(5, 2) DEFAULT 2.0, -- Geofence radius
    
    -- Hours
    hours_open VARCHAR(10),
    hours_close VARCHAR(10),
    days_open VARCHAR(50), -- MON,TUE,WED,THU,FRI,SAT,SUN
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    -- Audit
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_merchant_locations_merchant FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_merchant_locations_merchant_id ON merchant_locations(merchant_id);
-- Geofencing support - using simple lat/lon indexes instead of PostGIS
CREATE INDEX IF NOT EXISTS idx_merchant_locations_latitude ON merchant_locations(latitude);
CREATE INDEX IF NOT EXISTS idx_merchant_locations_longitude ON merchant_locations(longitude);

-- =============================================
-- CAMP CARDS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS camp_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- User Association
    user_id UUID NOT NULL,
    
    -- Card Information
    card_number VARCHAR(16) NOT NULL UNIQUE,
    card_member_number VARCHAR(20) NOT NULL UNIQUE, -- Display name on wallet
    card_holder_name VARCHAR(255) NOT NULL,
    
    -- Card Status
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, SUSPENDED, EXPIRED, CANCELLED
    is_primary BOOLEAN NOT NULL DEFAULT true,
    
    -- Card Type & Subscription
    card_type VARCHAR(50) NOT NULL DEFAULT 'STANDARD', -- STANDARD, PREMIUM, etc.
    subscription_type VARCHAR(50), -- MONTHLY, ANNUAL, LIFETIME
    subscription_price DECIMAL(10, 2),
    
    -- Dates
    issued_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    activated_at TIMESTAMP,
    
    -- Balance & Points
    current_balance DECIMAL(10, 2) DEFAULT 0.0,
    loyalty_points INTEGER DEFAULT 0,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Audit
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    
    CONSTRAINT fk_camp_cards_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_camp_cards_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_camp_cards_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_camp_cards_user_id ON camp_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_camp_cards_card_number ON camp_cards(card_number);
CREATE INDEX IF NOT EXISTS idx_camp_cards_status ON camp_cards(status);
CREATE INDEX IF NOT EXISTS idx_camp_cards_is_primary ON camp_cards(is_primary);

-- =============================================
-- USER CAMP CARDS JUNCTION TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS user_camp_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    user_id UUID NOT NULL,
    camp_card_id UUID NOT NULL,
    
    -- Card Assignment Details
    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    active_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    active_until TIMESTAMP,
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    CONSTRAINT fk_user_camp_cards_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_camp_cards_camp_card FOREIGN KEY (camp_card_id) REFERENCES camp_cards(id) ON DELETE CASCADE,
    CONSTRAINT unique_user_card UNIQUE(user_id, camp_card_id)
);

CREATE INDEX IF NOT EXISTS idx_user_camp_cards_user_id ON user_camp_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_camp_cards_camp_card_id ON user_camp_cards(camp_card_id);

-- =============================================
-- USER SETTINGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    user_id UUID NOT NULL UNIQUE,
    
    -- Notification Settings
    notifications_enabled BOOLEAN NOT NULL DEFAULT true,
    push_notifications_enabled BOOLEAN NOT NULL DEFAULT true,
    email_notifications_enabled BOOLEAN NOT NULL DEFAULT true,
    sms_notifications_enabled BOOLEAN NOT NULL DEFAULT false,
    
    -- Geolocation Settings
    geolocation_enabled BOOLEAN NOT NULL DEFAULT true,
    notification_radius_km DECIMAL(5, 2) DEFAULT 5.0, -- Default 5km radius
    
    -- Preference Settings
    preferred_categories VARCHAR(500), -- Comma-separated list of categories
    min_discount_percentage INTEGER DEFAULT 0, -- Only notify for offers >= this discount
    
    -- Privacy Settings
    share_location BOOLEAN NOT NULL DEFAULT false,
    marketing_consent BOOLEAN NOT NULL DEFAULT false,
    data_sharing_consent BOOLEAN NOT NULL DEFAULT false,
    
    -- Notification Quiet Hours
    quiet_hours_start VARCHAR(5), -- HH:MM format
    quiet_hours_end VARCHAR(5),
    quiet_hours_enabled BOOLEAN DEFAULT false,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Audit
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_user_settings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- =============================================
-- GEOFENCE NOTIFICATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS geofence_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Relationships
    user_id UUID NOT NULL,
    merchant_location_id UUID NOT NULL,
    offer_id INTEGER,
    
    -- Notification Details
    notification_type VARCHAR(50), -- ENTRY, EXIT, REMINDER
    message TEXT,
    sent_at TIMESTAMP,
    read_at TIMESTAMP,
    
    -- Geolocation Data
    user_latitude DECIMAL(10, 8),
    user_longitude DECIMAL(11, 8),
    distance_km DECIMAL(5, 2),
    
    -- Status
    is_read BOOLEAN NOT NULL DEFAULT false,
    is_sent BOOLEAN NOT NULL DEFAULT false,
    
    -- Audit
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_geofence_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_geofence_notifications_location FOREIGN KEY (merchant_location_id) REFERENCES merchant_locations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_geofence_notifications_user_id ON geofence_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_geofence_notifications_location_id ON geofence_notifications(merchant_location_id);
CREATE INDEX IF NOT EXISTS idx_geofence_notifications_is_read ON geofence_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_geofence_notifications_created_at ON geofence_notifications(created_at);

-- =============================================
-- OFFER REDEMPTIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS offer_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Relationships
    user_id UUID NOT NULL,
    offer_id INTEGER NOT NULL,
    camp_card_id UUID NOT NULL,
    merchant_location_id UUID,
    
    -- Redemption Details
    redemption_code VARCHAR(50) NOT NULL UNIQUE,
    qr_code_data TEXT,
    redemption_amount DECIMAL(10, 2),
    
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, REDEEMED, EXPIRED, CANCELLED
    redeemed_at TIMESTAMP,
    expires_at TIMESTAMP,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Audit
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_offer_redemptions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_offer_redemptions_card FOREIGN KEY (camp_card_id) REFERENCES camp_cards(id) ON DELETE CASCADE,
    CONSTRAINT fk_offer_redemptions_location FOREIGN KEY (merchant_location_id) REFERENCES merchant_locations(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_offer_redemptions_user_id ON offer_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_offer_redemptions_camp_card_id ON offer_redemptions(camp_card_id);
CREATE INDEX IF NOT EXISTS idx_offer_redemptions_status ON offer_redemptions(status);
CREATE INDEX IF NOT EXISTS idx_offer_redemptions_redemption_code ON offer_redemptions(redemption_code);

-- =============================================
-- SAMPLE DATA
-- =============================================

-- Insert default council if not exists
INSERT INTO councils (id, name, code, description)
VALUES (
    '00000000-0000-0000-0000-000000000042'::uuid,
    'Central Florida Council',
    'CFCO',
    'Default council for testing'
) ON CONFLICT DO NOTHING;

-- Create default merchants
INSERT INTO merchants (id, business_name, category, website_url, is_active, verified)
VALUES 
    ('00000000-0000-0000-0000-000000000101'::uuid, 'Pizza Palace', 'DINING', 'https://pizzapalace.com', true, true),
    ('00000000-0000-0000-0000-000000000102'::uuid, 'AutoCare', 'AUTO', 'https://autocare.com', true, true),
    ('00000000-0000-0000-0000-000000000103'::uuid, 'Fun Zone', 'ENTERTAINMENT', 'https://funzone.com', true, true)
ON CONFLICT DO NOTHING;

-- Create merchant locations
INSERT INTO merchant_locations (id, merchant_id, name, address, city, state_province, postal_code, country, latitude, longitude, radius_km, days_open, is_active)
VALUES 
    ('00000000-0000-0000-0000-000000000201'::uuid, '00000000-0000-0000-0000-000000000101'::uuid, 'Downtown', '123 Main St', 'Orlando', 'FL', '32801', 'USA', 28.5383, -81.3792, 2.0, 'MON,TUE,WED,THU,FRI,SAT,SUN', true),
    ('00000000-0000-0000-0000-000000000202'::uuid, '00000000-0000-0000-0000-000000000102'::uuid, 'Main Service', '55 Service Rd', 'Orlando', 'FL', '32805', 'USA', 28.5530, -81.3500, 2.0, 'MON,TUE,WED,THU,FRI,SAT', true),
    ('00000000-0000-0000-0000-000000000203'::uuid, '00000000-0000-0000-0000-000000000103'::uuid, 'Front Gate', '800 Park Ave', 'Orlando', 'FL', '32819', 'USA', 28.6000, -81.5000, 2.0, 'MON,TUE,WED,THU,FRI,SAT,SUN', true)
ON CONFLICT DO NOTHING;
