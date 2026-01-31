-- ============================================================================
-- V037: Create mobile_module_configs table
-- Stores feature flag configuration for the mobile application.
-- Each row represents a toggleable module with its enabled/disabled state.
-- ============================================================================

CREATE TABLE IF NOT EXISTS mobile_module_configs (
    id              BIGSERIAL       PRIMARY KEY,
    module_id       VARCHAR(100)    NOT NULL UNIQUE,
    name            VARCHAR(255)    NOT NULL,
    description     TEXT,
    category        VARCHAR(50)     NOT NULL DEFAULT 'features',
    enabled         BOOLEAN         NOT NULL DEFAULT true,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- Seed default modules
INSERT INTO mobile_module_configs (module_id, name, description, category, enabled) VALUES
    ('user_auth',           'User Authentication',    'Email/password login and account management',           'auth',        true),
    ('biometric_login',     'Biometric Login',        'Fingerprint and face recognition authentication',       'auth',        true),
    ('push_notifications',  'Push Notifications',     'Real-time push notifications for offers and updates',   'engagement',  true),
    ('loyalty_points',      'Loyalty Points',         'Earn and redeem loyalty points on purchases',            'engagement',  true),
    ('dark_mode',           'Dark Mode',              'Dark theme option for the mobile app',                   'ux',          false),
    ('offer_redemption',    'Offer Redemption',       'Scan and redeem merchant offers',                        'features',    true),
    ('scout_management',    'Scout Management',       'Scout recruiting and management features',               'features',    true),
    ('social_sharing',      'Social Sharing',         'Share offers on social media platforms',                  'engagement',  false),
    ('offline_mode',        'Offline Mode',           'Access cached data without internet connection',          'ux',          false),
    ('advanced_analytics',  'Advanced Analytics',     'User behavior tracking and analytics dashboard',          'features',    true)
ON CONFLICT (module_id) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_mobile_module_configs_module_id ON mobile_module_configs (module_id);
CREATE INDEX IF NOT EXISTS idx_mobile_module_configs_category ON mobile_module_configs (category);
