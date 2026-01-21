-- V025: Camp Cards Inventory System
-- Enables multi-card purchases, gifting, and offer replenishment
-- All cards expire December 31st of purchase year

-- ============================================================================
-- CARD ORDERS TABLE
-- Tracks multi-card purchase transactions
-- ============================================================================

CREATE TABLE IF NOT EXISTS campcard.card_orders (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,

    -- Purchaser (NULL if purchased before account creation)
    user_id UUID REFERENCES campcard.users(id) ON DELETE SET NULL,

    -- Order details
    quantity INT NOT NULL CHECK (quantity BETWEEN 1 AND 10),
    unit_price_cents INT NOT NULL CHECK (unit_price_cents > 0),
    total_price_cents INT NOT NULL CHECK (total_price_cents > 0),

    -- Payment info
    transaction_id VARCHAR(100),
    payment_status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED')),

    -- Scout attribution
    scout_code VARCHAR(50),
    scout_id UUID REFERENCES campcard.users(id) ON DELETE SET NULL,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for card_orders
CREATE INDEX IF NOT EXISTS idx_card_orders_user_id ON campcard.card_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_card_orders_scout_id ON campcard.card_orders(scout_id);
CREATE INDEX IF NOT EXISTS idx_card_orders_payment_status ON campcard.card_orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_card_orders_created_at ON campcard.card_orders(created_at);

-- ============================================================================
-- CAMP CARDS TABLE
-- Individual card inventory with status tracking
-- ============================================================================

CREATE TABLE IF NOT EXISTS campcard.camp_cards (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    card_number VARCHAR(20) UNIQUE NOT NULL,

    -- Ownership
    owner_user_id UUID REFERENCES campcard.users(id) ON DELETE SET NULL,
    original_purchaser_id UUID REFERENCES campcard.users(id) ON DELETE SET NULL,
    purchase_order_id BIGINT REFERENCES campcard.card_orders(id) ON DELETE SET NULL,
    purchase_transaction_id VARCHAR(100),

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'UNASSIGNED'
        CHECK (status IN ('UNASSIGNED', 'ACTIVE', 'GIFTED', 'REPLACED', 'EXPIRED', 'REVOKED')),

    -- Important dates
    activated_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,  -- Always Dec 31st of purchase year

    -- Gift information
    gifted_at TIMESTAMP WITH TIME ZONE,
    gifted_to_email VARCHAR(255),
    gift_message TEXT,
    gift_claim_token VARCHAR(100) UNIQUE,
    gift_claimed_at TIMESTAMP WITH TIME ZONE,

    -- Scout attribution (preserved even when gifted)
    scout_attribution_id UUID REFERENCES campcard.users(id) ON DELETE SET NULL,
    referral_depth INT DEFAULT 0,

    -- Replenishment tracking
    replaced_by_card_id BIGINT REFERENCES campcard.camp_cards(id) ON DELETE SET NULL,

    -- Usage tracking (denormalized for performance)
    offers_used INT DEFAULT 0,
    total_savings_cents INT DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for camp_cards
CREATE INDEX IF NOT EXISTS idx_camp_cards_owner_user_id ON campcard.camp_cards(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_camp_cards_original_purchaser_id ON campcard.camp_cards(original_purchaser_id);
CREATE INDEX IF NOT EXISTS idx_camp_cards_status ON campcard.camp_cards(status);
CREATE INDEX IF NOT EXISTS idx_camp_cards_expires_at ON campcard.camp_cards(expires_at);
CREATE INDEX IF NOT EXISTS idx_camp_cards_gift_claim_token ON campcard.camp_cards(gift_claim_token);
CREATE INDEX IF NOT EXISTS idx_camp_cards_scout_attribution ON campcard.camp_cards(scout_attribution_id);
CREATE INDEX IF NOT EXISTS idx_camp_cards_purchase_order ON campcard.camp_cards(purchase_order_id);

-- ============================================================================
-- MODIFY OFFER_REDEMPTIONS
-- Link redemptions to specific camp cards
-- NOTE: Requires DBA to grant ownership or run as superuser:
--   ALTER TABLE campcard.offer_redemptions OWNER TO campcard_app;
-- Then uncomment the following:
-- ============================================================================

-- ALTER TABLE campcard.offer_redemptions
-- ADD COLUMN IF NOT EXISTS camp_card_id BIGINT REFERENCES campcard.camp_cards(id) ON DELETE SET NULL;
--
-- CREATE INDEX IF NOT EXISTS idx_offer_redemptions_camp_card_id ON campcard.offer_redemptions(camp_card_id);

-- ============================================================================
-- CARD NOTIFICATION LOG
-- Track which notifications have been sent to avoid duplicates
-- ============================================================================

CREATE TABLE IF NOT EXISTS campcard.card_notification_log (
    id BIGSERIAL PRIMARY KEY,
    camp_card_id BIGINT NOT NULL REFERENCES campcard.camp_cards(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES campcard.users(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Prevent duplicate notifications
    UNIQUE(camp_card_id, notification_type)
);

CREATE INDEX IF NOT EXISTS idx_card_notification_log_user ON campcard.card_notification_log(user_id);
CREATE INDEX IF NOT EXISTS idx_card_notification_log_sent_at ON campcard.card_notification_log(sent_at);

-- ============================================================================
-- MIGRATE EXISTING SUBSCRIPTIONS TO CAMP_CARDS
-- Convert active subscriptions to the new card system
-- ============================================================================

INSERT INTO campcard.camp_cards (
    card_number,
    owner_user_id,
    original_purchaser_id,
    status,
    activated_at,
    expires_at,
    scout_attribution_id,
    referral_depth,
    created_at,
    updated_at
)
SELECT
    s.card_number,
    s.user_id,
    s.user_id,
    'ACTIVE',
    COALESCE(s.current_period_start, s.created_at),
    COALESCE(s.current_period_end,
             (DATE_TRUNC('year', COALESCE(s.created_at, NOW())) + INTERVAL '1 year - 1 day')::TIMESTAMP WITH TIME ZONE),
    s.root_scout_id,
    COALESCE(s.referral_depth, 0),
    COALESCE(s.created_at, NOW()),
    NOW()
FROM campcard.subscriptions s
WHERE s.status = 'ACTIVE'
  AND s.card_number IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM campcard.camp_cards cc WHERE cc.card_number = s.card_number
  );

-- ============================================================================
-- UPDATE EXISTING OFFER_REDEMPTIONS
-- Link existing redemptions to migrated cards
-- NOTE: Run this after DBA grants ownership to campcard_app
-- ============================================================================

-- UPDATE campcard.offer_redemptions r
-- SET camp_card_id = cc.id
-- FROM campcard.camp_cards cc
-- WHERE r.user_id = cc.owner_user_id
--   AND cc.status = 'ACTIVE'
--   AND r.camp_card_id IS NULL;

-- ============================================================================
-- HELPER FUNCTION: Generate unique card number
-- ============================================================================

CREATE OR REPLACE FUNCTION campcard.generate_camp_card_number()
RETURNS VARCHAR(20) AS $$
DECLARE
    new_number VARCHAR(20);
    exists_count INT;
BEGIN
    LOOP
        -- Generate card number in format CC-XXXX-XXXX-XXXX
        new_number := 'CC-' ||
                      UPPER(SUBSTRING(MD5(gen_random_uuid()::text) FROM 1 FOR 4)) || '-' ||
                      UPPER(SUBSTRING(MD5(gen_random_uuid()::text) FROM 1 FOR 4)) || '-' ||
                      UPPER(SUBSTRING(MD5(gen_random_uuid()::text) FROM 1 FOR 4));

        -- Check if it already exists in camp_cards, users, scouts, or subscriptions
        SELECT COUNT(*) INTO exists_count
        FROM (
            SELECT card_number FROM campcard.camp_cards WHERE card_number = new_number
            UNION ALL
            SELECT card_number FROM campcard.users WHERE card_number = new_number
            UNION ALL
            SELECT card_number FROM campcard.scouts WHERE card_number = new_number
            UNION ALL
            SELECT card_number FROM campcard.subscriptions WHERE card_number = new_number
        ) all_cards;

        IF exists_count = 0 THEN
            RETURN new_number;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- HELPER FUNCTION: Get December 31st expiry for current year
-- ============================================================================

CREATE OR REPLACE FUNCTION campcard.get_card_expiry_date()
RETURNS TIMESTAMP WITH TIME ZONE AS $$
BEGIN
    RETURN (DATE_TRUNC('year', NOW()) + INTERVAL '1 year - 1 second')::TIMESTAMP WITH TIME ZONE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGER: Update updated_at timestamp
-- ============================================================================

CREATE OR REPLACE FUNCTION campcard.update_camp_cards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS camp_cards_updated_at ON campcard.camp_cards;
CREATE TRIGGER camp_cards_updated_at
    BEFORE UPDATE ON campcard.camp_cards
    FOR EACH ROW
    EXECUTE FUNCTION campcard.update_camp_cards_updated_at();

DROP TRIGGER IF EXISTS card_orders_updated_at ON campcard.card_orders;
CREATE TRIGGER card_orders_updated_at
    BEFORE UPDATE ON campcard.card_orders
    FOR EACH ROW
    EXECUTE FUNCTION campcard.update_camp_cards_updated_at();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE campcard.camp_cards IS 'Individual camp card inventory with status tracking for multi-card purchases and gifting';
COMMENT ON TABLE campcard.card_orders IS 'Tracks multi-card purchase transactions';
COMMENT ON TABLE campcard.card_notification_log IS 'Prevents duplicate expiry and reminder notifications';

COMMENT ON COLUMN campcard.camp_cards.status IS 'UNASSIGNED=in wallet, ACTIVE=in use, GIFTED=pending claim, REPLACED=replenished, EXPIRED=past Dec 31, REVOKED=admin disabled';
COMMENT ON COLUMN campcard.camp_cards.expires_at IS 'Always December 31st of purchase year';
COMMENT ON COLUMN campcard.camp_cards.scout_attribution_id IS 'Scout who gets credit for this card sale, preserved even when gifted';
COMMENT ON COLUMN campcard.camp_cards.replaced_by_card_id IS 'References the new card when this card was replaced via replenishment';
