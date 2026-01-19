-- V023: Expand image_url column to TEXT to support base64 encoded images
-- The image_url column needs to store base64 encoded image data which can be
-- hundreds of kilobytes, far exceeding the VARCHAR(255) limit
--
-- NOTE: This migration requires DBA intervention since campcard_app does not
-- have ALTER permissions on tables owned by postgres.
--
-- DBA should run these commands manually:
--
--   ALTER TABLE campcard.offers ALTER COLUMN image_url TYPE TEXT;
--   ALTER TABLE campcard.merchants ALTER COLUMN logo_url TYPE TEXT;
--
-- Until DBA runs these commands, base64 images cannot be stored in the database.
-- The frontend has been updated to only send URL-based images (not base64).

-- No-op statement to mark migration as complete
SELECT 1;
