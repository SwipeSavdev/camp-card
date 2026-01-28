-- V029: Extend offer expiration dates to December 31, 2026
-- All offers that have expired (valid_until in the past) need to be extended
-- to allow redemptions in 2026

-- Extend all offers with past expiration dates to December 31, 2026
UPDATE offers
SET valid_until = '2026-12-31 23:59:59'
WHERE valid_until < NOW();

-- Reactivate offers that were auto-expired but should still be valid
-- (Only those that were EXPIRED, not PAUSED or DELETED by admin)
UPDATE offers
SET status = 'ACTIVE'
WHERE status = 'EXPIRED'
  AND valid_until >= NOW()
  AND deleted_at IS NULL;

-- Log the update for audit purposes
-- Note: This is informational only; actual logging depends on your setup
