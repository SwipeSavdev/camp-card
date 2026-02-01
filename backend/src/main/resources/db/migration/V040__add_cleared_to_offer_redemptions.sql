-- Add cleared column to offer_redemptions for perpetual lifetime tracking
-- When offers are replenished, redemptions are marked cleared=true instead of deleted
-- Analytics queries count ALL redemptions; availability checks only count cleared=false

SET search_path TO campcard;

ALTER TABLE offer_redemptions ADD COLUMN cleared BOOLEAN NOT NULL DEFAULT FALSE;

-- Index for efficient availability lookups (non-cleared redemptions per user+offer)
CREATE INDEX idx_offer_redemptions_user_offer_cleared
    ON offer_redemptions (user_id, offer_id, cleared)
    WHERE cleared = false;
