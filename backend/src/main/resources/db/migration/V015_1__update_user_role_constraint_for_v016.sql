-- V015.1: Update user role check constraint before V016
-- Runs after V015, before V016
-- V016 needs to update TROOP_LEADER to UNIT_LEADER

-- Drop the old check constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS chk_user_role;

-- Add updated check constraint with all valid roles (including GLOBAL_SYSTEM_ADMIN for V018)
ALTER TABLE users ADD CONSTRAINT chk_user_role
    CHECK (role IN ('SCOUT', 'PARENT', 'TROOP_LEADER', 'UNIT_LEADER', 'COUNCIL_ADMIN', 'NATIONAL_ADMIN', 'SYSTEM_ADMIN', 'GLOBAL_SYSTEM_ADMIN'));
