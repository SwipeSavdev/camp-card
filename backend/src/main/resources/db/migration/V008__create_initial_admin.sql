-- V008: Create Initial Admin User (Production)
-- This migration creates a single admin user for production
-- The password should be changed immediately after first login
-- Default password: ChangeMe123! (BCrypt hash below)

-- Only insert if no admin exists
INSERT INTO users (id, email, password_hash, first_name, last_name, phone_number, role, is_active, email_verified, referral_code, created_at, updated_at)
SELECT
    gen_random_uuid(),
    'admin@campcard.org',
    '$2a$12$81cpmeAleU8eznVF5ON4wubWEt8aSySKtr4m4PAhVZxi.t4Ynf02u',  -- Password123!
    'System',
    'Administrator',
    '000-000-0000',
    'NATIONAL_ADMIN',
    true,
    true,
    'SYSADMIN',
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE role = 'NATIONAL_ADMIN'
);
