-- V014: Add Card Numbers
-- Adds unique card_number fields to users, scouts, and subscriptions tables
-- Card numbers are generated in format: CC-XXXX-XXXX-XXXX

-- ============================================================================
-- ADD card_number TO USERS TABLE
-- Every user gets a card number (Parents, Scouts, Troop Leaders, etc.)
-- ============================================================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS card_number VARCHAR(20) UNIQUE;

-- Create index for fast lookups by card number
CREATE INDEX IF NOT EXISTS idx_users_card_number ON users(card_number);

-- ============================================================================
-- ADD card_number TO SCOUTS TABLE
-- Scout-specific card number (may differ from user card number)
-- ============================================================================
ALTER TABLE scouts ADD COLUMN IF NOT EXISTS card_number VARCHAR(20) UNIQUE;

-- Create index for fast lookups by card number
CREATE INDEX IF NOT EXISTS idx_scouts_card_number ON scouts(card_number);

-- ============================================================================
-- ADD card_number TO SUBSCRIPTIONS TABLE
-- Subscription-based card number (tied to active subscription)
-- ============================================================================
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS card_number VARCHAR(20) UNIQUE;

-- Create index for fast lookups by card number
CREATE INDEX IF NOT EXISTS idx_subscriptions_card_number ON subscriptions(card_number);

-- ============================================================================
-- FUNCTION TO GENERATE CARD NUMBER
-- Format: CC-XXXX-XXXX-XXXX where X is alphanumeric
-- ============================================================================
CREATE OR REPLACE FUNCTION generate_card_number()
RETURNS VARCHAR(20) AS $$
DECLARE
    new_card_number VARCHAR(20);
    exists_count INTEGER;
BEGIN
    LOOP
        -- Generate random alphanumeric card number
        -- Format: CC-XXXX-XXXX-XXXX
        new_card_number := 'CC-' ||
            UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 4)) || '-' ||
            UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 5 FOR 4)) || '-' ||
            UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 9 FOR 4));

        -- Check if this card number already exists in any table
        SELECT COUNT(*) INTO exists_count
        FROM (
            SELECT card_number FROM users WHERE card_number = new_card_number
            UNION ALL
            SELECT card_number FROM scouts WHERE card_number = new_card_number
            UNION ALL
            SELECT card_number FROM subscriptions WHERE card_number = new_card_number
        ) AS all_cards;

        -- If unique, exit loop
        EXIT WHEN exists_count = 0;
    END LOOP;

    RETURN new_card_number;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGER TO AUTO-GENERATE CARD NUMBER ON USER INSERT
-- ============================================================================
CREATE OR REPLACE FUNCTION auto_generate_user_card_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.card_number IS NULL THEN
        NEW.card_number := generate_card_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_card_number_trigger ON users;
CREATE TRIGGER users_card_number_trigger
BEFORE INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION auto_generate_user_card_number();

-- ============================================================================
-- TRIGGER TO AUTO-GENERATE CARD NUMBER ON SCOUT INSERT
-- ============================================================================
CREATE OR REPLACE FUNCTION auto_generate_scout_card_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.card_number IS NULL THEN
        NEW.card_number := generate_card_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS scouts_card_number_trigger ON scouts;
CREATE TRIGGER scouts_card_number_trigger
BEFORE INSERT ON scouts
FOR EACH ROW
EXECUTE FUNCTION auto_generate_scout_card_number();

-- ============================================================================
-- TRIGGER TO AUTO-GENERATE CARD NUMBER ON SUBSCRIPTION INSERT
-- ============================================================================
CREATE OR REPLACE FUNCTION auto_generate_subscription_card_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.card_number IS NULL THEN
        NEW.card_number := generate_card_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS subscriptions_card_number_trigger ON subscriptions;
CREATE TRIGGER subscriptions_card_number_trigger
BEFORE INSERT ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION auto_generate_subscription_card_number();

-- ============================================================================
-- BACKFILL EXISTING RECORDS WITH CARD NUMBERS
-- ============================================================================

-- Backfill users
UPDATE users
SET card_number = generate_card_number()
WHERE card_number IS NULL;

-- Backfill scouts
UPDATE scouts
SET card_number = generate_card_number()
WHERE card_number IS NULL;

-- Backfill subscriptions
UPDATE subscriptions
SET card_number = generate_card_number()
WHERE card_number IS NULL;

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON COLUMN users.card_number IS 'Unique card number for user identification (format: CC-XXXX-XXXX-XXXX)';
COMMENT ON COLUMN scouts.card_number IS 'Unique card number for scout identification (format: CC-XXXX-XXXX-XXXX)';
COMMENT ON COLUMN subscriptions.card_number IS 'Unique card number tied to subscription (format: CC-XXXX-XXXX-XXXX)';
COMMENT ON FUNCTION generate_card_number() IS 'Generates unique card number in format CC-XXXX-XXXX-XXXX';
