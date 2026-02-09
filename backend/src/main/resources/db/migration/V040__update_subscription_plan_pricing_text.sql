-- V040: Update subscription plan pricing text from $15 to $14.99
-- This migration updates any subscription plan descriptions that reference the old $15 pricing
-- to reflect the new $14.99 Apple IAP pricing

-- Update description text containing $15 to $14.99
UPDATE campcard.subscription_plans
SET description = REPLACE(description, '$15', '$14.99'),
    updated_at = CURRENT_TIMESTAMP
WHERE description LIKE '%$15%';

-- Update name text containing $15 to $14.99 (if any)
UPDATE campcard.subscription_plans
SET name = REPLACE(name, '$15', '$14.99'),
    updated_at = CURRENT_TIMESTAMP
WHERE name LIKE '%$15%';
