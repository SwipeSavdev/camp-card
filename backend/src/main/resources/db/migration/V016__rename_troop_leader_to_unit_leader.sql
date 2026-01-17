-- V016: Rename TROOP_LEADER role to UNIT_LEADER
-- This migration renames the TROOP_LEADER role to UNIT_LEADER across the system
-- Note: The unit_type column must be added manually by a database admin (requires table ownership)
-- Run as superuser: ALTER TABLE campcard.users ADD COLUMN IF NOT EXISTS unit_type VARCHAR(50);
--                   CREATE INDEX IF NOT EXISTS idx_users_unit_type ON campcard.users(unit_type);

-- Step 1: Update existing users with TROOP_LEADER role to UNIT_LEADER
UPDATE campcard.users
SET role = 'UNIT_LEADER'
WHERE role = 'TROOP_LEADER';

-- Step 2: Update marketing_segments table if it has TROOP_LEADERS segment type
UPDATE campcard.marketing_segments
SET segment_type = 'UNIT_LEADERS'
WHERE segment_type = 'TROOP_LEADERS';

-- Log the migration
DO $$
BEGIN
    RAISE NOTICE 'Migration V016 completed: TROOP_LEADER renamed to UNIT_LEADER';
    RAISE NOTICE 'NOTE: Run as DB admin: ALTER TABLE campcard.users ADD COLUMN IF NOT EXISTS unit_type VARCHAR(50);';
END $$;
