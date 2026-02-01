-- Favorite offers table for heart/bookmark functionality
CREATE TABLE IF NOT EXISTS campcard.favorite_offers (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES campcard.users(id) ON DELETE CASCADE,
    offer_id BIGINT NOT NULL REFERENCES campcard.offers(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_favorite_user_offer UNIQUE (user_id, offer_id)
);

CREATE INDEX idx_favorite_offers_user_id ON campcard.favorite_offers(user_id);
CREATE INDEX idx_favorite_offers_offer_id ON campcard.favorite_offers(offer_id);

-- Grant permissions to app user
GRANT SELECT, INSERT, DELETE ON campcard.favorite_offers TO campcard_app;
GRANT USAGE, SELECT ON SEQUENCE campcard.favorite_offers_id_seq TO campcard_app;
