-- V013: Enhance Campaign Recipients Table
-- Add additional fields required by CampaignDispatchService for:
-- - Unique UUID tracking
-- - Contact info storage
-- - Retry management
-- - Engagement metrics
-- - Geofence triggers

-- ============================================================================
-- ADD UUID COLUMN
-- ============================================================================
ALTER TABLE campaign_recipients
ADD COLUMN IF NOT EXISTS uuid UUID UNIQUE DEFAULT gen_random_uuid();

-- Update existing rows to have UUIDs
UPDATE campaign_recipients SET uuid = gen_random_uuid() WHERE uuid IS NULL;

-- Make uuid NOT NULL after populating
ALTER TABLE campaign_recipients ALTER COLUMN uuid SET NOT NULL;

-- ============================================================================
-- ADD CONTACT INFO AND SCHEDULING
-- ============================================================================
ALTER TABLE campaign_recipients
ADD COLUMN IF NOT EXISTS contact_info VARCHAR(500),
ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP;

-- ============================================================================
-- ADD ERROR TRACKING AND RETRY MANAGEMENT
-- ============================================================================
ALTER TABLE campaign_recipients
ADD COLUMN IF NOT EXISTS error_message TEXT,
ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_retry_at TIMESTAMP;

-- Rename failure_reason to error_message if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'campaign_recipients'
        AND column_name = 'failure_reason'
        AND table_schema = 'campcard'
    ) THEN
        -- Copy data from failure_reason to error_message if both exist
        UPDATE campcard.campaign_recipients
        SET error_message = failure_reason
        WHERE error_message IS NULL AND failure_reason IS NOT NULL;

        -- Drop the old column
        ALTER TABLE campcard.campaign_recipients DROP COLUMN IF EXISTS failure_reason;
    END IF;
END $$;

-- ============================================================================
-- ADD ENGAGEMENT TRACKING
-- ============================================================================
ALTER TABLE campaign_recipients
ADD COLUMN IF NOT EXISTS open_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS click_count INTEGER DEFAULT 0;

-- ============================================================================
-- ADD GEOFENCE TRIGGER FIELDS
-- ============================================================================
ALTER TABLE campaign_recipients
ADD COLUMN IF NOT EXISTS triggered_by_geofence BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS geofence_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS trigger_latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS trigger_longitude DOUBLE PRECISION;

-- ============================================================================
-- ADD UPDATED_AT FOR AUDIT
-- ============================================================================
ALTER TABLE campaign_recipients
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Update existing rows to have updated_at
UPDATE campaign_recipients SET updated_at = CURRENT_TIMESTAMP WHERE updated_at IS NULL;

-- Make updated_at NOT NULL
ALTER TABLE campaign_recipients ALTER COLUMN updated_at SET NOT NULL;

-- ============================================================================
-- UPDATE STATUS CHECK CONSTRAINT
-- Add new statuses: SCHEDULED, SENDING, BOUNCED, SKIPPED
-- ============================================================================
ALTER TABLE campaign_recipients DROP CONSTRAINT IF EXISTS chk_recipient_status;
ALTER TABLE campaign_recipients ADD CONSTRAINT chk_recipient_status
    CHECK (status IN ('PENDING', 'SCHEDULED', 'SENDING', 'QUEUED', 'SENT', 'DELIVERED',
                      'OPENED', 'CLICKED', 'CONVERTED', 'BOUNCED', 'FAILED',
                      'UNSUBSCRIBED', 'SKIPPED'));

-- ============================================================================
-- CREATE INDEXES FOR NEW COLUMNS
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_uuid ON campaign_recipients(uuid);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_retry ON campaign_recipients(retry_count, last_retry_at)
    WHERE status = 'FAILED';
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_geofence ON campaign_recipients(triggered_by_geofence, geofence_id)
    WHERE triggered_by_geofence = TRUE;
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_scheduled ON campaign_recipients(scheduled_at)
    WHERE status = 'SCHEDULED';

-- ============================================================================
-- UPDATE UNIQUE CONSTRAINT TO INCLUDE UUID
-- ============================================================================
-- The existing unique constraint on (campaign_id, user_id, channel) is correct
-- and matches our entity definition - no changes needed

-- ============================================================================
-- CREATE UPDATE TRIGGER FOR updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION update_campaign_recipients_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS campaign_recipients_updated_at_trigger ON campaign_recipients;
CREATE TRIGGER campaign_recipients_updated_at_trigger
BEFORE UPDATE ON campaign_recipients
FOR EACH ROW EXECUTE FUNCTION update_campaign_recipients_updated_at();

-- ============================================================================
-- UPDATE SEGMENT TYPE CONSTRAINT
-- Add new segment types for CampaignDispatchService
-- ============================================================================
ALTER TABLE marketing_segments DROP CONSTRAINT IF EXISTS chk_segment_type;
ALTER TABLE marketing_segments ADD CONSTRAINT chk_segment_type
    CHECK (segment_type IN ('BEHAVIORAL', 'DEMOGRAPHIC', 'GEOGRAPHIC', 'TRANSACTIONAL',
                            'CUSTOM', 'AI_GENERATED', 'ALL_USERS', 'ACTIVE_SUBSCRIBERS',
                            'SCOUTS', 'PARENTS', 'TROOP_LEADERS'));
