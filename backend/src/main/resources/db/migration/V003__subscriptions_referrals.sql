-- V003: Subscriptions and Referrals
-- Subscription management and referral tracking

-- ============================================================================
-- SUBSCRIPTION PLANS TABLE
-- ============================================================================
CREATE TABLE subscription_plans (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    billing_period VARCHAR(20) NOT NULL DEFAULT 'MONTHLY',
    stripe_price_id VARCHAR(255) UNIQUE,
    features JSONB,
    max_offers INTEGER,
    max_redemptions_per_month INTEGER,
    includes_analytics BOOLEAN NOT NULL DEFAULT FALSE,
    includes_api_access BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE subscription_plans ADD CONSTRAINT chk_billing_period
    CHECK (billing_period IN ('MONTHLY', 'QUARTERLY', 'ANNUAL'));

CREATE INDEX idx_subscription_plans_is_active ON subscription_plans(is_active);
CREATE INDEX idx_subscription_plans_stripe_price_id ON subscription_plans(stripe_price_id);

-- ============================================================================
-- SUBSCRIPTIONS TABLE
-- ============================================================================
CREATE TABLE subscriptions (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    council_id BIGINT REFERENCES councils(id) ON DELETE SET NULL,
    plan_id BIGINT NOT NULL REFERENCES subscription_plans(id),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    stripe_subscription_id VARCHAR(255) UNIQUE,
    stripe_customer_id VARCHAR(255),
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
    canceled_at TIMESTAMP,
    cancel_reason TEXT,
    trial_start TIMESTAMP,
    trial_end TIMESTAMP,
    referral_code VARCHAR(50),
    referred_by_user_id UUID REFERENCES users(id),
    root_scout_id UUID REFERENCES users(id),
    referral_depth INTEGER NOT NULL DEFAULT 0,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE subscriptions ADD CONSTRAINT chk_subscription_status
    CHECK (status IN ('PENDING', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'SUSPENDED', 'TRIAL', 'EXPIRED'));

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_council_id ON subscriptions(council_id);
CREATE INDEX idx_subscriptions_plan_id ON subscriptions(plan_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_referral_code ON subscriptions(referral_code);
CREATE INDEX idx_subscriptions_referred_by ON subscriptions(referred_by_user_id);
CREATE INDEX idx_subscriptions_root_scout_id ON subscriptions(root_scout_id);
CREATE INDEX idx_subscriptions_current_period_end ON subscriptions(current_period_end);

-- Trigger to update subscriptions.updated_at
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subscriptions_updated_at_trigger
BEFORE UPDATE ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_subscriptions_updated_at();

-- ============================================================================
-- REFERRALS TABLE
-- ============================================================================
CREATE TABLE referrals (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referred_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    referral_code VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    click_count INTEGER NOT NULL DEFAULT 0,
    reward_amount DECIMAL(10, 2),
    reward_type VARCHAR(50),
    reward_claimed BOOLEAN NOT NULL DEFAULT FALSE,
    reward_claimed_at TIMESTAMP,
    subscription_id BIGINT REFERENCES subscriptions(id) ON DELETE SET NULL,
    depth INTEGER NOT NULL DEFAULT 0,
    expires_at TIMESTAMP,
    completed_at TIMESTAMP,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE referrals ADD CONSTRAINT chk_referral_status
    CHECK (status IN ('PENDING', 'CLICKED', 'SIGNED_UP', 'SUBSCRIBED', 'REWARDED', 'EXPIRED', 'CANCELLED'));

ALTER TABLE referrals ADD CONSTRAINT chk_reward_type
    CHECK (reward_type IS NULL OR reward_type IN ('CASH', 'CREDIT', 'DISCOUNT', 'FREE_MONTH', 'MERCHANDISE'));

CREATE INDEX idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX idx_referrals_referred_user_id ON referrals(referred_user_id);
CREATE INDEX idx_referrals_referral_code ON referrals(referral_code);
CREATE INDEX idx_referrals_status ON referrals(status);
CREATE INDEX idx_referrals_subscription_id ON referrals(subscription_id);
CREATE INDEX idx_referrals_expires_at ON referrals(expires_at);
CREATE INDEX idx_referrals_created_at ON referrals(created_at);

-- Trigger to update referrals.updated_at
CREATE OR REPLACE FUNCTION update_referrals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER referrals_updated_at_trigger
BEFORE UPDATE ON referrals
FOR EACH ROW
EXECUTE FUNCTION update_referrals_updated_at();

-- ============================================================================
-- REFERRAL CLICKS TRACKING TABLE
-- ============================================================================
CREATE TABLE referral_clicks (
    id BIGSERIAL PRIMARY KEY,
    referral_id BIGINT NOT NULL REFERENCES referrals(id) ON DELETE CASCADE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    referer VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_referral_clicks_referral_id ON referral_clicks(referral_id);
CREATE INDEX idx_referral_clicks_ip_address ON referral_clicks(ip_address);
CREATE INDEX idx_referral_clicks_created_at ON referral_clicks(created_at);

-- ============================================================================
-- NOTIFICATIONS TABLE
-- ============================================================================
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    channel VARCHAR(20) NOT NULL DEFAULT 'PUSH',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    read_at TIMESTAMP,
    sent_at TIMESTAMP,
    failed_at TIMESTAMP,
    failure_reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE notifications ADD CONSTRAINT chk_notification_type
    CHECK (type IN ('OFFER', 'REDEMPTION', 'SUBSCRIPTION', 'REFERRAL', 'ACHIEVEMENT', 'SYSTEM', 'REMINDER', 'PAYMENT'));

ALTER TABLE notifications ADD CONSTRAINT chk_notification_channel
    CHECK (channel IN ('PUSH', 'EMAIL', 'SMS', 'IN_APP'));

ALTER TABLE notifications ADD CONSTRAINT chk_notification_status
    CHECK (status IN ('PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED'));

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_channel ON notifications(channel);
CREATE INDEX idx_notifications_read_at ON notifications(read_at);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
