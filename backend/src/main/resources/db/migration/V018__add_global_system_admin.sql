-- V018: Add Global System Admin user for SwipeSavvy support
-- This user has full system access across all councils
-- Email: support@swipesavvy.com
-- Password: Valipay2@23!$!
-- BCrypt hash generated with strength 12 (matching SecurityConfig.java)

INSERT INTO campcard.users (
    id,
    email,
    password_hash,
    first_name,
    last_name,
    role,
    is_active,
    email_verified,
    referral_code,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'support@swipesavvy.com',
    '$2a$12$ltzjPqEB660OiOQ12nmPUOzEyx5JinNCWmWu6NTNwU0cL7g43XyHu',
    'SwipeSavvy',
    'Support',
    'GLOBAL_SYSTEM_ADMIN',
    true,
    true,
    'SWIPE001',
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    role = 'GLOBAL_SYSTEM_ADMIN',
    password_hash = '$2a$12$ltzjPqEB660OiOQ12nmPUOzEyx5JinNCWmWu6NTNwU0cL7g43XyHu',
    is_active = true,
    email_verified = true,
    updated_at = NOW();
