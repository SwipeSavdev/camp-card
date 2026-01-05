-- V007: Seed Test Users for Development
-- All users have password: Password123
-- BCrypt hash with cost 12

-- ============================================================================
-- TEST USERS (matches new schema with UUID id, phone_number, is_active)
-- ============================================================================
INSERT INTO users (id, email, password_hash, first_name, last_name, phone_number, role, is_active, email_verified, referral_code, created_at, updated_at) VALUES
-- National Admins
(gen_random_uuid(), 'admin@campcard.org', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X.0W5g8h6v7YQXMK.', 'Sarah', 'Johnson', '555-0001', 'NATIONAL_ADMIN', true, true, 'ADMIN001', NOW(), NOW()),
(gen_random_uuid(), 'mike.admin@campcard.org', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X.0W5g8h6v7YQXMK.', 'Mike', 'Thompson', '555-0002', 'NATIONAL_ADMIN', true, true, 'ADMIN002', NOW(), NOW()),

-- Council Admins
(gen_random_uuid(), 'john.smith@nycbsa.org', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X.0W5g8h6v7YQXMK.', 'John', 'Smith', '212-555-0101', 'COUNCIL_ADMIN', true, true, 'CADM0001', NOW(), NOW()),
(gen_random_uuid(), 'lisa.garcia@labsa.org', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X.0W5g8h6v7YQXMK.', 'Lisa', 'Garcia', '213-555-0201', 'COUNCIL_ADMIN', true, true, 'CADM0002', NOW(), NOW()),
(gen_random_uuid(), 'robert.chen@chicagobsa.org', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X.0W5g8h6v7YQXMK.', 'Robert', 'Chen', '312-555-0301', 'COUNCIL_ADMIN', true, true, 'CADM0003', NOW(), NOW()),

-- Troop Leaders
(gen_random_uuid(), 'david.wilson@troop101.org', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X.0W5g8h6v7YQXMK.', 'David', 'Wilson', '212-555-1101', 'TROOP_LEADER', true, true, 'TLDR0001', NOW(), NOW()),
(gen_random_uuid(), 'maria.rodriguez@troop201.org', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X.0W5g8h6v7YQXMK.', 'Maria', 'Rodriguez', '213-555-2101', 'TROOP_LEADER', true, true, 'TLDR0002', NOW(), NOW()),

-- Parents
(gen_random_uuid(), 'james.anderson@email.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X.0W5g8h6v7YQXMK.', 'James', 'Anderson', '212-555-3001', 'PARENT', true, true, 'PRNT0001', NOW(), NOW()),
(gen_random_uuid(), 'jennifer.martinez@email.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X.0W5g8h6v7YQXMK.', 'Jennifer', 'Martinez', '213-555-3002', 'PARENT', true, true, 'PRNT0002', NOW(), NOW()),

-- Scouts
(gen_random_uuid(), 'ethan.anderson@email.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X.0W5g8h6v7YQXMK.', 'Ethan', 'Anderson', '212-555-4001', 'SCOUT', true, true, 'SCOT0001', NOW(), NOW()),
(gen_random_uuid(), 'sophia.martinez@email.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X.0W5g8h6v7YQXMK.', 'Sophia', 'Martinez', '213-555-4002', 'SCOUT', true, true, 'SCOT0002', NOW(), NOW()),
(gen_random_uuid(), 'noah.taylor@email.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X.0W5g8h6v7YQXMK.', 'Noah', 'Taylor', '212-555-4003', 'SCOUT', true, true, 'SCOT0003', NOW(), NOW());
