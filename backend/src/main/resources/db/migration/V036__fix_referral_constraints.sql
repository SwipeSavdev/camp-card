-- ============================================================================
-- V036: Fix referral constraints for subscription purchase flow
-- ============================================================================
-- 1. Drop UNIQUE constraint on referral_code — the same scout/referral code
--    can generate multiple referral records (one per referred user).
-- 2. Update status CHECK to include 'COMPLETED' (used by Java entity enum).
-- 3. Add 'notes' column if missing (used by Referral entity).
-- ============================================================================

-- Drop the unique constraint on referral_code
-- The constraint name follows PostgreSQL naming: {table}_{column}_key
ALTER TABLE referrals DROP CONSTRAINT IF EXISTS referrals_referral_code_key;

-- Drop the unique index if it exists separately
DROP INDEX IF EXISTS referrals_referral_code_key;

-- Update status CHECK to include COMPLETED (Java entity uses this value)
ALTER TABLE referrals DROP CONSTRAINT IF EXISTS chk_referral_status;
ALTER TABLE referrals ADD CONSTRAINT chk_referral_status
    CHECK (status IN ('PENDING', 'CLICKED', 'SIGNED_UP', 'SUBSCRIBED', 'COMPLETED', 'REWARDED', 'EXPIRED', 'CANCELLED'));

-- Add notes column if it doesn't exist (Referral entity maps this field)
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS notes TEXT;
