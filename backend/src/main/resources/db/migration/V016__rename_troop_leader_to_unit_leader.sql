-- V016: Rename TROOP_LEADER role to UNIT_LEADER and add unit_type field
-- This migration renames the TROOP_LEADER role to UNIT_LEADER across the system
-- and adds a unit_type field for scouts

-- Step 1: Drop the old check constraint and add updated one with UNIT_LEADER
ALTER TABLE users DROP CONSTRAINT IF EXISTS chk_user_role;
ALTER TABLE users ADD CONSTRAINT chk_user_role
    CHECK (role IN ('SCOUT', 'PARENT', 'TROOP_LEADER', 'UNIT_LEADER', 'COUNCIL_ADMIN', 'NATIONAL_ADMIN', 'SYSTEM_ADMIN', 'GLOBAL_SYSTEM_ADMIN'));

-- Step 2: Update existing users with TROOP_LEADER role to UNIT_LEADER
UPDATE users
SET role = 'UNIT_LEADER'
WHERE role = 'TROOP_LEADER';

-- Step 3: Add unit_type column for scouts (if not exists)
-- Unit types: Pack, BSA Troop for Boys, BSA Troop for Girls, Ship, Crew, Family Scouting
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'users'
        AND column_name = 'unit_type'
    ) THEN
        ALTER TABLE users ADD COLUMN unit_type VARCHAR(50);
    END IF;
END $$;

-- Step 4: Update marketing_segments table if it has TROOP_LEADERS segment type
UPDATE marketing_segments
SET segment_type = 'UNIT_LEADERS'
WHERE segment_type = 'TROOP_LEADERS';

-- Step 5: Add index for unit_type for efficient filtering (if not exists)
CREATE INDEX IF NOT EXISTS idx_users_unit_type ON users(unit_type);

-- Log the migration
DO $$
BEGIN
    RAISE NOTICE 'Migration V016 completed: TROOP_LEADER renamed to UNIT_LEADER, unit_type field added';
END $$;
