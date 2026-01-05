-- V001__Create_feature_flags_schema.sql
-- Migration for Feature Flags System
-- Created: December 2025

-- =============================================
-- Feature Flags Table
-- =============================================
CREATE TABLE IF NOT EXISTS feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Flag Identity
    key VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Flag Configuration
    enabled BOOLEAN NOT NULL DEFAULT false,
    scope VARCHAR(20) NOT NULL CHECK (scope IN ('GLOBAL', 'PER_COUNCIL')),
    council_id UUID,
    
    -- Metadata
    category VARCHAR(50),
    tags JSONB,
    
    -- Audit
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    
    -- Constraints
    CONSTRAINT fk_council FOREIGN KEY (council_id) REFERENCES councils(id) ON DELETE CASCADE,
    CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_feature_flags_key ON feature_flags(key);
CREATE INDEX IF NOT EXISTS idx_feature_flags_council ON feature_flags(council_id);
CREATE INDEX IF NOT EXISTS idx_feature_flags_scope ON feature_flags(scope);
CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled ON feature_flags(enabled);
CREATE INDEX IF NOT EXISTS idx_feature_flags_category ON feature_flags(category);

-- =============================================
-- Feature Flag Audit Log Table
-- =============================================
CREATE TABLE IF NOT EXISTS feature_flag_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Reference
    flag_id UUID NOT NULL,
    
    -- Change Details
    action VARCHAR(20) NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE')),
    old_value JSONB,
    new_value JSONB,
    
    -- Who & When
    changed_by UUID NOT NULL,
    changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Tracking
    ip_address INET,
    user_agent TEXT,
    
    -- Constraints
    CONSTRAINT fk_flag FOREIGN KEY (flag_id) REFERENCES feature_flags(id) ON DELETE CASCADE,
    CONSTRAINT fk_user FOREIGN KEY (changed_by) REFERENCES users(id)
);

-- Indexes for audit log queries
CREATE INDEX IF NOT EXISTS idx_audit_flag ON feature_flag_audit_log(flag_id);
CREATE INDEX IF NOT EXISTS idx_audit_changed_by ON feature_flag_audit_log(changed_by);
CREATE INDEX IF NOT EXISTS idx_audit_changed_at ON feature_flag_audit_log(changed_at);
CREATE INDEX IF NOT EXISTS idx_audit_action ON feature_flag_audit_log(action);

-- =============================================
-- Insert Default Feature Flags
-- =============================================
INSERT INTO feature_flags (key, name, description, enabled, scope, category, tags, created_by, updated_by)
VALUES
    ('geo_offers', 'Geo-Targeted Offers', 'Show location-based discount offers when customers enter merchant geofences', true, 'GLOBAL', 'offers', '["production", "critical"]', NULL, NULL),
    ('customer_referrals', 'Customer Referrals', 'Enable customer-to-customer referral rewards', true, 'GLOBAL', 'referrals', '["production"]', NULL, NULL),
    ('multi_offer_redemption', 'Multi-Offer Redemption', 'Allow customers to redeem multiple offers in single transaction', false, 'GLOBAL', 'offers', '["beta"]', NULL, NULL),
    ('loyalty_rewards', 'Loyalty Rewards', 'Show loyalty points and rewards tier system', true, 'GLOBAL', 'referrals', '["production"]', NULL, NULL),
    ('scout_leaderboard', 'Scout Leaderboard', 'Display scout sales rankings and competitions', true, 'GLOBAL', 'referrals', '["production"]', NULL, NULL),
    ('push_notifications', 'Push Notifications', 'Enable push notifications for offers and updates', true, 'GLOBAL', 'notifications', '["production"]', NULL, NULL),
    ('email_marketing', 'Email Marketing', 'Enable marketing email campaigns', true, 'GLOBAL', 'notifications', '["production"]', NULL, NULL),
    ('campaign_mode', 'Campaign Mode', 'Enable time-limited campaign features', false, 'PER_COUNCIL', 'campaigns', '["experimental"]', NULL, NULL),
    ('advanced_analytics', 'Advanced Analytics', 'Show detailed analytics dashboards', false, 'GLOBAL', 'analytics', '["beta"]', NULL, NULL),
    ('beta_ui_redesign', 'Beta UI Redesign', 'Show new mobile UI design (beta)', false, 'GLOBAL', 'ui', '["beta", "experimental"]', NULL, NULL)
ON CONFLICT (key) DO NOTHING;
