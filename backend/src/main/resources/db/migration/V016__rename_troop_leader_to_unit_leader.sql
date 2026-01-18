-- V016: Rename TROOP_LEADER role to UNIT_LEADER and add unit_type field
-- This migration renames the TROOP_LEADER role to UNIT_LEADER across the system
-- and adds a unit_type field for scouts
-- Note: Avoiding ALTER TABLE with constraints since campcard_app is not table owner

-- Step 1: Update existing users with TROOP_LEADER role to UNIT_LEADER
UPDATE campcard.users
SET role = 'UNIT_LEADER'
WHERE role = 'TROOP_LEADER';

-- Step 2: Add unit_type column for scouts (if not exists)
-- Unit types: Pack, BSA Troop for Boys, BSA Troop for Girls, Ship, Crew, Family Scouting
-- Note: Using DO block to check if column exists first
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'campcard'
        AND table_name = 'users'
        AND column_name = 'unit_type'
    ) THEN
        -- Add the column without constraint (constraint managed by JPA validation)
        EXECUTE 'ALTER TABLE campcard.users ADD COLUMN unit_type VARCHAR(50)';
    END IF;
END $$;

-- Step 3: Update marketing_segments table if it has TROOP_LEADERS segment type
UPDATE campcard.marketing_segments
SET segment_type = 'UNIT_LEADERS'
WHERE segment_type = 'TROOP_LEADERS';

-- Step 4: Add index for unit_type for efficient filtering (if not exists)
CREATE INDEX IF NOT EXISTS idx_users_unit_type ON campcard.users(unit_type);

-- Log the migration
DO $$
BEGIN
    RAISE NOTICE 'Migration V016 completed: TROOP_LEADER renamed to UNIT_LEADER, unit_type field added';
END $$;
