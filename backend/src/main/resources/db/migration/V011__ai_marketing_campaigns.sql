-- V011: AI Marketing Campaigns
-- Campaign management, segments, and AI-powered content generation

-- ============================================================================
-- MARKETING SEGMENTS TABLE
-- User segments for targeted campaigns
-- ============================================================================
CREATE TABLE marketing_segments (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    council_id BIGINT REFERENCES councils(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    segment_type VARCHAR(50) NOT NULL,
    rules JSONB NOT NULL DEFAULT '{}',
    user_count INTEGER NOT NULL DEFAULT 0,
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_computed_at TIMESTAMP,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE marketing_segments ADD CONSTRAINT chk_segment_type
    CHECK (segment_type IN ('BEHAVIORAL', 'DEMOGRAPHIC', 'GEOGRAPHIC', 'TRANSACTIONAL', 'CUSTOM', 'AI_GENERATED'));

CREATE INDEX idx_marketing_segments_council_id ON marketing_segments(council_id);
CREATE INDEX idx_marketing_segments_segment_type ON marketing_segments(segment_type);
CREATE INDEX idx_marketing_segments_is_active ON marketing_segments(is_active);
CREATE INDEX idx_marketing_segments_is_system ON marketing_segments(is_system);

-- ============================================================================
-- MARKETING CAMPAIGNS TABLE
-- Core campaign management with AI support
-- ============================================================================
CREATE TABLE marketing_campaigns (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    council_id BIGINT REFERENCES councils(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    campaign_type VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',

    -- Content
    subject_line VARCHAR(255),
    content_html TEXT,
    content_text TEXT,
    content_json JSONB,

    -- AI-generated content
    ai_generated BOOLEAN NOT NULL DEFAULT FALSE,
    ai_prompt TEXT,
    ai_model VARCHAR(100),
    ai_generation_metadata JSONB,

    -- Targeting
    segment_id BIGINT REFERENCES marketing_segments(id) ON DELETE SET NULL,
    target_audience JSONB,
    estimated_reach INTEGER,

    -- Channels
    channels VARCHAR(100)[] NOT NULL DEFAULT ARRAY['PUSH'],

    -- Scheduling
    scheduled_at TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,

    -- Settings
    enable_geofencing BOOLEAN NOT NULL DEFAULT FALSE,
    enable_gamification BOOLEAN NOT NULL DEFAULT FALSE,
    enable_ai_optimization BOOLEAN NOT NULL DEFAULT TRUE,

    -- Associated entities
    merchant_id BIGINT REFERENCES merchants(id) ON DELETE SET NULL,
    offer_id BIGINT REFERENCES offers(id) ON DELETE SET NULL,

    -- Metadata
    tags VARCHAR(50)[],
    metadata JSONB,

    -- Audit
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE marketing_campaigns ADD CONSTRAINT chk_campaign_type
    CHECK (campaign_type IN ('REACTIVATION', 'LOYALTY_BOOST', 'WEEKEND_SPECIAL', 'CATEGORY_PROMO',
                              'LOCATION_BASED', 'NEW_USER_WELCOME', 'SEASONAL', 'FLASH_SALE',
                              'REFERRAL_BOOST', 'CUSTOM'));

ALTER TABLE marketing_campaigns ADD CONSTRAINT chk_campaign_status
    CHECK (status IN ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SCHEDULED', 'SENDING',
                      'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED', 'FAILED'));

CREATE INDEX idx_campaigns_council_id ON marketing_campaigns(council_id);
CREATE INDEX idx_campaigns_campaign_type ON marketing_campaigns(campaign_type);
CREATE INDEX idx_campaigns_status ON marketing_campaigns(status);
CREATE INDEX idx_campaigns_segment_id ON marketing_campaigns(segment_id);
CREATE INDEX idx_campaigns_merchant_id ON marketing_campaigns(merchant_id);
CREATE INDEX idx_campaigns_scheduled_at ON marketing_campaigns(scheduled_at);
CREATE INDEX idx_campaigns_created_by ON marketing_campaigns(created_by);
CREATE INDEX idx_campaigns_created_at ON marketing_campaigns(created_at);

-- ============================================================================
-- CAMPAIGN METRICS TABLE
-- Track campaign performance over time
-- ============================================================================
CREATE TABLE campaign_metrics (
    id BIGSERIAL PRIMARY KEY,
    campaign_id BIGINT NOT NULL REFERENCES marketing_campaigns(id) ON DELETE CASCADE,

    -- Delivery metrics
    messages_sent INTEGER NOT NULL DEFAULT 0,
    messages_delivered INTEGER NOT NULL DEFAULT 0,
    messages_failed INTEGER NOT NULL DEFAULT 0,

    -- Engagement metrics
    opens INTEGER NOT NULL DEFAULT 0,
    unique_opens INTEGER NOT NULL DEFAULT 0,
    clicks INTEGER NOT NULL DEFAULT 0,
    unique_clicks INTEGER NOT NULL DEFAULT 0,

    -- Conversion metrics
    conversions INTEGER NOT NULL DEFAULT 0,
    revenue_generated DECIMAL(12, 2) NOT NULL DEFAULT 0.00,

    -- Unsubscribe/spam
    unsubscribes INTEGER NOT NULL DEFAULT 0,
    spam_reports INTEGER NOT NULL DEFAULT 0,

    -- Computed rates (updated periodically)
    open_rate DECIMAL(5, 2),
    click_rate DECIMAL(5, 2),
    conversion_rate DECIMAL(5, 2),
    roi_percentage DECIMAL(8, 2),

    -- Time-series data point
    recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Snapshot type
    snapshot_type VARCHAR(20) NOT NULL DEFAULT 'HOURLY'
);

ALTER TABLE campaign_metrics ADD CONSTRAINT chk_snapshot_type
    CHECK (snapshot_type IN ('REALTIME', 'HOURLY', 'DAILY', 'FINAL'));

CREATE INDEX idx_campaign_metrics_campaign_id ON campaign_metrics(campaign_id);
CREATE INDEX idx_campaign_metrics_recorded_at ON campaign_metrics(recorded_at);
CREATE INDEX idx_campaign_metrics_snapshot_type ON campaign_metrics(snapshot_type);

-- ============================================================================
-- CAMPAIGN RECIPIENTS TABLE
-- Track individual message delivery
-- ============================================================================
CREATE TABLE campaign_recipients (
    id BIGSERIAL PRIMARY KEY,
    campaign_id BIGINT NOT NULL REFERENCES marketing_campaigns(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    channel VARCHAR(20) NOT NULL,

    -- Delivery status
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    failed_at TIMESTAMP,
    failure_reason TEXT,

    -- Engagement
    opened_at TIMESTAMP,
    clicked_at TIMESTAMP,
    converted_at TIMESTAMP,
    conversion_value DECIMAL(10, 2),

    -- Tracking
    external_message_id VARCHAR(255),
    metadata JSONB,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE campaign_recipients ADD CONSTRAINT chk_recipient_channel
    CHECK (channel IN ('PUSH', 'EMAIL', 'SMS', 'IN_APP'));

ALTER TABLE campaign_recipients ADD CONSTRAINT chk_recipient_status
    CHECK (status IN ('PENDING', 'QUEUED', 'SENT', 'DELIVERED', 'OPENED', 'CLICKED',
                      'CONVERTED', 'BOUNCED', 'FAILED', 'UNSUBSCRIBED'));

CREATE UNIQUE INDEX idx_campaign_recipients_unique ON campaign_recipients(campaign_id, user_id, channel);
CREATE INDEX idx_campaign_recipients_campaign_id ON campaign_recipients(campaign_id);
CREATE INDEX idx_campaign_recipients_user_id ON campaign_recipients(user_id);
CREATE INDEX idx_campaign_recipients_status ON campaign_recipients(status);
CREATE INDEX idx_campaign_recipients_sent_at ON campaign_recipients(sent_at);

-- ============================================================================
-- AI CONTENT TEMPLATES TABLE
-- Reusable AI-generated content templates
-- ============================================================================
CREATE TABLE ai_content_templates (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    council_id BIGINT REFERENCES councils(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template_type VARCHAR(50) NOT NULL,

    -- Template content
    prompt_template TEXT NOT NULL,
    variables JSONB NOT NULL DEFAULT '[]',
    sample_output TEXT,

    -- AI settings
    ai_model VARCHAR(100) NOT NULL DEFAULT 'claude-3-sonnet',
    temperature DECIMAL(3, 2) NOT NULL DEFAULT 0.7,
    max_tokens INTEGER NOT NULL DEFAULT 500,

    -- Usage
    use_count INTEGER NOT NULL DEFAULT 0,
    last_used_at TIMESTAMP,

    -- Status
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_system BOOLEAN NOT NULL DEFAULT FALSE,

    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE ai_content_templates ADD CONSTRAINT chk_template_type
    CHECK (template_type IN ('EMAIL_SUBJECT', 'EMAIL_BODY', 'PUSH_NOTIFICATION', 'SMS',
                              'IN_APP_MESSAGE', 'SOCIAL_POST', 'FULL_CAMPAIGN'));

CREATE INDEX idx_ai_templates_council_id ON ai_content_templates(council_id);
CREATE INDEX idx_ai_templates_template_type ON ai_content_templates(template_type);
CREATE INDEX idx_ai_templates_is_active ON ai_content_templates(is_active);

-- ============================================================================
-- SAVED CAMPAIGNS TABLE (User-saved drafts and templates)
-- ============================================================================
CREATE TABLE saved_campaigns (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    council_id BIGINT REFERENCES councils(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Campaign configuration snapshot
    campaign_config JSONB NOT NULL,

    -- Type
    save_type VARCHAR(20) NOT NULL DEFAULT 'DRAFT',

    -- From existing campaign
    source_campaign_id BIGINT REFERENCES marketing_campaigns(id) ON DELETE SET NULL,

    -- Status
    is_favorite BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE saved_campaigns ADD CONSTRAINT chk_save_type
    CHECK (save_type IN ('DRAFT', 'TEMPLATE', 'FAVORITE', 'ARCHIVED'));

CREATE INDEX idx_saved_campaigns_user_id ON saved_campaigns(user_id);
CREATE INDEX idx_saved_campaigns_council_id ON saved_campaigns(council_id);
CREATE INDEX idx_saved_campaigns_save_type ON saved_campaigns(save_type);
CREATE INDEX idx_saved_campaigns_is_favorite ON saved_campaigns(is_favorite);

-- ============================================================================
-- SEGMENT USERS TABLE (Many-to-many for segment membership)
-- ============================================================================
CREATE TABLE segment_users (
    segment_id BIGINT NOT NULL REFERENCES marketing_segments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score DECIMAL(5, 2),
    added_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (segment_id, user_id)
);

CREATE INDEX idx_segment_users_segment_id ON segment_users(segment_id);
CREATE INDEX idx_segment_users_user_id ON segment_users(user_id);

-- ============================================================================
-- UPDATE TRIGGERS
-- ============================================================================
CREATE OR REPLACE FUNCTION update_marketing_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER marketing_segments_updated_at_trigger
BEFORE UPDATE ON marketing_segments
FOR EACH ROW EXECUTE FUNCTION update_marketing_updated_at();

CREATE TRIGGER marketing_campaigns_updated_at_trigger
BEFORE UPDATE ON marketing_campaigns
FOR EACH ROW EXECUTE FUNCTION update_marketing_updated_at();

CREATE TRIGGER ai_content_templates_updated_at_trigger
BEFORE UPDATE ON ai_content_templates
FOR EACH ROW EXECUTE FUNCTION update_marketing_updated_at();

CREATE TRIGGER saved_campaigns_updated_at_trigger
BEFORE UPDATE ON saved_campaigns
FOR EACH ROW EXECUTE FUNCTION update_marketing_updated_at();

-- ============================================================================
-- SEED DEFAULT SEGMENTS
-- ============================================================================
INSERT INTO marketing_segments (name, description, segment_type, rules, is_system, is_active) VALUES
('Dormant Users', 'Users with no activity in the last 30 days', 'BEHAVIORAL',
 '{"condition": "last_activity_days", "operator": ">", "value": 30}', TRUE, TRUE),
('At Risk', 'Users showing declining engagement patterns', 'BEHAVIORAL',
 '{"condition": "engagement_trend", "operator": "=", "value": "declining"}', TRUE, TRUE),
('Loyal Users', 'Users with high engagement scores', 'BEHAVIORAL',
 '{"condition": "engagement_score", "operator": ">=", "value": 80}', TRUE, TRUE),
('New Users', 'Users who joined in the last 7 days', 'BEHAVIORAL',
 '{"condition": "account_age_days", "operator": "<=", "value": 7}', TRUE, TRUE),
('High Value', 'Users in the top spending percentile', 'TRANSACTIONAL',
 '{"condition": "total_spend_percentile", "operator": ">=", "value": 90}', TRUE, TRUE),
('Deal Seekers', 'Users who primarily respond to discount offers', 'BEHAVIORAL',
 '{"condition": "discount_response_rate", "operator": ">=", "value": 0.7}', TRUE, TRUE);

-- ============================================================================
-- SEED DEFAULT AI TEMPLATES
-- ============================================================================
INSERT INTO ai_content_templates (name, description, template_type, prompt_template, variables, is_system) VALUES
('Reactivation Email', 'Bring back inactive users', 'EMAIL_BODY',
 'Write a friendly email to bring back a user who hasn''t used our Camp Card app in {{days_inactive}} days.
  Their name is {{user_name}}. Mention {{offer_count}} new offers available.
  Keep it concise, warm, and include a clear call-to-action.',
 '[{"name": "days_inactive", "type": "number"}, {"name": "user_name", "type": "string"}, {"name": "offer_count", "type": "number"}]',
 TRUE),
('Weekend Special Push', 'Weekend promotion notification', 'PUSH_NOTIFICATION',
 'Create a short, engaging push notification for a weekend special offer.
  The offer is: {{offer_description}}. Discount: {{discount_percent}}% off.
  Make it urgent and exciting. Max 100 characters.',
 '[{"name": "offer_description", "type": "string"}, {"name": "discount_percent", "type": "number"}]',
 TRUE),
('New User Welcome', 'Onboarding message for new users', 'IN_APP_MESSAGE',
 'Write a warm welcome message for a new Camp Card user named {{user_name}}.
  They joined via {{signup_source}}. Highlight the {{top_benefit}} benefit.
  Keep it friendly and encouraging.',
 '[{"name": "user_name", "type": "string"}, {"name": "signup_source", "type": "string"}, {"name": "top_benefit", "type": "string"}]',
 TRUE),
('Loyalty Boost SMS', 'Reward loyal users via SMS', 'SMS',
 'Create a brief SMS (max 160 chars) thanking a loyal user for their {{redemption_count}} redemptions.
  Offer them {{bonus_reward}} as a thank you.',
 '[{"name": "redemption_count", "type": "number"}, {"name": "bonus_reward", "type": "string"}]',
 TRUE);
