-- V023: Create offer_images table for storing base64 encoded images
-- This is a workaround for the offers.image_url VARCHAR(255) limitation.
-- The separate table allows campcard_app to store large base64 image data
-- without needing DBA intervention to alter the offers table.

-- Create offer_images table (if not exists - may have been created manually)
CREATE TABLE IF NOT EXISTS campcard.offer_images (
    id BIGSERIAL PRIMARY KEY,
    offer_id BIGINT NOT NULL,
    image_data TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_offer_images_offer FOREIGN KEY (offer_id)
        REFERENCES campcard.offers(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_offer_images_offer_id ON campcard.offer_images(offer_id);
