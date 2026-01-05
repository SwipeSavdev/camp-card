-- V000__Create_base_schema.sql
-- Base schema creation for CampCard application
-- Creates core tables: users, councils, troops, and related entities
-- Created: December 2025

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- COUNCILS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS councils (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Council Identity
    name VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(50) UNIQUE,
    description TEXT,
    
    -- Contact Information
    email VARCHAR(255),
    phone VARCHAR(20),
    website VARCHAR(255),
    
    -- Address
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state_province VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    
    -- Organizational
    council_type VARCHAR(50), -- 'BSA', 'GSA', etc.
    region VARCHAR(100),
    
    -- Status & Settings
    is_active BOOLEAN NOT NULL DEFAULT true,
    settings JSONB DEFAULT '{}',
    
    -- Metadata
    logo_url VARCHAR(500),
    timezone VARCHAR(50),
    locale VARCHAR(20),
    
    -- Audit
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

-- Indexes for councils
CREATE INDEX IF NOT EXISTS idx_councils_code ON councils(code);
CREATE INDEX IF NOT EXISTS idx_councils_is_active ON councils(is_active);
CREATE INDEX IF NOT EXISTS idx_councils_name ON councils(name);

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- User Identity
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    
    -- Authentication
    password_hash VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_token_expiry TIMESTAMP,
    
    -- Contact
    phone_number VARCHAR(20),
    
    -- Council Association
    council_id UUID NOT NULL,
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    email_verified BOOLEAN NOT NULL DEFAULT false,
    email_verification_token VARCHAR(255),
    email_verification_token_expiry TIMESTAMP,
    
    -- Profile
    role VARCHAR(50) NOT NULL DEFAULT 'USER', -- USER, ADMIN, COUNCIL_ADMIN, SCOUT, etc.
    profile_image_url VARCHAR(500),
    
    -- Login Tracking
    last_login_at TIMESTAMP,
    login_count INTEGER DEFAULT 0,
    
    -- Audit
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    -- Constraints
    CONSTRAINT fk_users_council FOREIGN KEY (council_id) REFERENCES councils(id) ON DELETE CASCADE,
    CONSTRAINT chk_email_format CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Indexes for users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_council_id ON users(council_id);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- =============================================
-- TROOPS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS troops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Troop Identity
    name VARCHAR(255) NOT NULL,
    troop_number VARCHAR(50),
    
    -- Organization
    council_id UUID NOT NULL,
    unit_type VARCHAR(50), -- 'BOY_SCOUTS', 'GIRL_SCOUTS', 'CUB_SCOUTS', etc.
    age_group VARCHAR(50),
    
    -- Contact
    email VARCHAR(255),
    phone VARCHAR(20),
    
    -- Leadership
    scoutmaster_id UUID,
    assistant_scoutmaster_id UUID,
    
    -- Location
    location VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    founded_year INTEGER,
    
    -- Metadata
    description TEXT,
    meeting_day_time VARCHAR(255),
    meeting_location VARCHAR(255),
    
    -- Audit
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT fk_troops_council FOREIGN KEY (council_id) REFERENCES councils(id) ON DELETE CASCADE,
    CONSTRAINT fk_troops_scoutmaster FOREIGN KEY (scoutmaster_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_troops_assistant FOREIGN KEY (assistant_scoutmaster_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes for troops
CREATE INDEX IF NOT EXISTS idx_troops_council_id ON troops(council_id);
CREATE INDEX IF NOT EXISTS idx_troops_is_active ON troops(is_active);
CREATE INDEX IF NOT EXISTS idx_troops_scoutmaster_id ON troops(scoutmaster_id);

-- =============================================
-- SCOUT_USERS (Many-to-Many Users and Troops)
-- =============================================
CREATE TABLE IF NOT EXISTS scout_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- References
    user_id UUID NOT NULL,
    troop_id UUID NOT NULL,
    
    -- Role in Troop
    scout_rank VARCHAR(100),
    position VARCHAR(100), -- 'SCOUT_LEADER', 'PATROL_LEADER', 'SCOUT', etc.
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    join_date DATE NOT NULL DEFAULT CURRENT_DATE,
    departure_date DATE,
    
    -- Metadata
    notes TEXT,
    
    -- Audit
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT fk_scout_users_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_scout_users_troop FOREIGN KEY (troop_id) REFERENCES troops(id) ON DELETE CASCADE,
    CONSTRAINT unique_user_troop UNIQUE(user_id, troop_id)
);

-- Indexes for scout_users
CREATE INDEX IF NOT EXISTS idx_scout_users_user_id ON scout_users(user_id);
CREATE INDEX IF NOT EXISTS idx_scout_users_troop_id ON scout_users(troop_id);
CREATE INDEX IF NOT EXISTS idx_scout_users_is_active ON scout_users(is_active);

-- =============================================
-- REFERRAL_CODES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS referral_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Code Information
    code VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID NOT NULL,
    
    -- Configuration
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,
    
    -- Validity Period
    valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_until DATE,
    
    -- Metadata
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT fk_referral_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for referral codes
CREATE INDEX IF NOT EXISTS idx_referral_code ON referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_referral_user_id ON referral_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_is_active ON referral_codes(is_active);

-- =============================================
-- AUDIT_LOG TABLE (Generic Audit Trail)
-- =============================================
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Entity Information
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    
    -- Change Details
    action VARCHAR(20) NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],
    
    -- User & Timing
    changed_by UUID,
    changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    
    -- Constraints
    CONSTRAINT fk_audit_user FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes for audit log
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_changed_at ON audit_log(changed_at);
CREATE INDEX IF NOT EXISTS idx_audit_changed_by ON audit_log(changed_by);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_log(action);

-- =============================================
-- NOTIFICATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Recipient
    user_id UUID NOT NULL,
    
    -- Content
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50), -- 'INFO', 'WARNING', 'ALERT', 'PROMOTION', etc.
    
    -- Status
    is_read BOOLEAN NOT NULL DEFAULT false,
    read_at TIMESTAMP,
    
    -- Delivery
    delivery_channels TEXT[], -- 'EMAIL', 'PUSH', 'IN_APP'
    
    -- Metadata
    related_entity_type VARCHAR(50),
    related_entity_id UUID,
    
    -- Timing
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    
    -- Constraints
    CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notification_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notification_created_at ON notifications(created_at);

-- =============================================
-- Add Foreign Key Constraints Back to Users and Councils
-- =============================================
ALTER TABLE councils 
ADD CONSTRAINT fk_councils_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_councils_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;
