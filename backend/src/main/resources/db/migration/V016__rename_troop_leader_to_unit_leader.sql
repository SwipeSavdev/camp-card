-- V016: Rename TROOP_LEADER role to UNIT_LEADER and add unit_type field
-- This migration renames the TROOP_LEADER role to UNIT_LEADER across the system
-- and adds a unit_type field for scouts

-- Step 1: Update existing users with TROOP_LEADER role to UNIT_LEADER
UPDATE campcard.users
SET role = 'UNIT_LEADER'
WHERE role = 'TROOP_LEADER';

-- Step 2: Update the role CHECK constraint
ALTER TABLE campcard.users
DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE campcard.users
ADD CONSTRAINT users_role_check
CHECK (role IN ('SCOUT', 'PARENT', 'UNIT_LEADER', 'COUNCIL_ADMIN', 'NATIONAL_ADMIN'));

-- Step 3: Add unit_type column for scouts
-- Unit types: Pack, BSA Troop for Boys, BSA Troop for Girls, Ship, Crew, Family Scouting
ALTER TABLE campcard.users
ADD COLUMN IF NOT EXISTS unit_type VARCHAR(50);

-- Add check constraint for unit_type values
ALTER TABLE campcard.users
ADD CONSTRAINT users_unit_type_check
CHECK (unit_type IS NULL OR unit_type IN (
    'PACK',
    'BSA_TROOP_BOYS',
    'BSA_TROOP_GIRLS',
    'SHIP',
    'CREW',
    'FAMILY_SCOUTING'
));

-- Step 4: Update marketing_segments table if it has TROOP_LEADERS segment type
UPDATE campcard.marketing_segments
SET segment_type = 'UNIT_LEADERS'
WHERE segment_type = 'TROOP_LEADERS';

-- Step 5: Update the segment_type check constraint if it exists
DO $$
BEGIN
    -- Drop existing constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'marketing_segments_segment_type_check'
        AND table_schema = 'campcard'
    ) THEN
        ALTER TABLE campcard.marketing_segments
        DROP CONSTRAINT marketing_segments_segment_type_check;
    END IF;

    -- Add updated constraint with UNIT_LEADERS instead of TROOP_LEADERS
    ALTER TABLE campcard.marketing_segments
    ADD CONSTRAINT marketing_segments_segment_type_check
    CHECK (segment_type IN ('ALL_USERS', 'ACTIVE_SUBSCRIBERS', 'INACTIVE_USERS',
                            'NEW_USERS', 'SCOUTS', 'PARENTS', 'UNIT_LEADERS'));
EXCEPTION
    WHEN undefined_table THEN
        -- Table doesn't exist, skip
        NULL;
END $$;

-- Add index for unit_type for efficient filtering
CREATE INDEX IF NOT EXISTS idx_users_unit_type ON campcard.users(unit_type);

-- Log the migration
DO $$
BEGIN
    RAISE NOTICE 'Migration V016 completed: TROOP_LEADER renamed to UNIT_LEADER, unit_type field added';
END $$;
