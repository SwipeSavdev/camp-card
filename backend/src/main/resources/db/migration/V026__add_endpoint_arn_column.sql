-- V026: Placeholder - endpoint_arn column requires DBA intervention
--
-- Adding a column to device_tokens requires table ownership.
-- The table is owned by postgres, not campcard_app.
--
-- DBA needs to run:
--   ALTER TABLE campcard.device_tokens OWNER TO campcard_app;
--
-- Then run:
--   ALTER TABLE campcard.device_tokens ADD COLUMN IF NOT EXISTS endpoint_arn VARCHAR(512);
--
-- For now, this is a placeholder so the app can start.
-- AWS SNS push notifications will not work until the DBA migration is applied.

SELECT 'V026 placeholder - DBA intervention required for endpoint_arn column' AS migration_status;
