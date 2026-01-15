-- V014: Payment Devices for Merchant Onboarding
-- This creates the payment device/equipment management system

-- ============================================================================
-- PAYMENT DEVICES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS payment_devices (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),

    -- Device Assignment
    merchant_id BIGINT REFERENCES merchants(id) ON DELETE SET NULL,
    merchant_location_id BIGINT REFERENCES merchant_locations(id) ON DELETE SET NULL,

    -- Device Information
    manufacturer VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    serial_number VARCHAR(100) NOT NULL UNIQUE,

    -- Device Details (from device catalog)
    category VARCHAR(200),
    platform VARCHAR(200),
    deployment_type VARCHAR(100),
    integration_type VARCHAR(200),

    -- Configuration
    device_name VARCHAR(200),
    location_description VARCHAR(500),

    -- SDK/API Integration Details
    sdk_type VARCHAR(100),
    sdk_version VARCHAR(50),
    api_endpoint VARCHAR(500),
    terminal_id VARCHAR(100),
    merchant_terminal_id VARCHAR(100),

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    activation_status VARCHAR(20) DEFAULT 'NOT_ACTIVATED',

    -- Onboarding Checklist (JSON array of completed requirements)
    onboarding_checklist JSONB DEFAULT '[]'::jsonb,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    onboarding_completed_at TIMESTAMP,

    -- Certification
    pci_compliant BOOLEAN DEFAULT FALSE,
    emv_certified BOOLEAN DEFAULT FALSE,
    contactless_enabled BOOLEAN DEFAULT FALSE,

    -- Support Information
    support_contact VARCHAR(200),
    support_phone VARCHAR(50),
    support_url VARCHAR(500),
    documentation_url VARCHAR(500),

    -- Audit
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP,

    -- Constraints
    CONSTRAINT payment_devices_status_check CHECK (status IN ('PENDING', 'ACTIVE', 'INACTIVE', 'MAINTENANCE', 'DECOMMISSIONED')),
    CONSTRAINT payment_devices_activation_check CHECK (activation_status IN ('NOT_ACTIVATED', 'PENDING_ACTIVATION', 'ACTIVATED', 'ACTIVATION_FAILED'))
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_payment_devices_merchant_id ON payment_devices(merchant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_payment_devices_merchant_location_id ON payment_devices(merchant_location_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_payment_devices_manufacturer ON payment_devices(manufacturer) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_payment_devices_status ON payment_devices(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_payment_devices_serial ON payment_devices(serial_number);

-- ============================================================================
-- DEVICE ONBOARDING REQUIREMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS device_onboarding_requirements (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),

    -- Device Reference
    payment_device_id BIGINT NOT NULL REFERENCES payment_devices(id) ON DELETE CASCADE,

    -- Requirement Details
    requirement_name VARCHAR(200) NOT NULL,
    requirement_description TEXT,
    requirement_category VARCHAR(100), -- CONNECTIVITY, SECURITY, CERTIFICATION, HARDWARE, SOFTWARE

    -- Status
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    completed_by UUID, -- User who marked it complete

    -- Notes
    notes TEXT,

    -- Order for display
    display_order INTEGER DEFAULT 0,

    -- Audit
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_device_requirements_device_id ON device_onboarding_requirements(payment_device_id);

-- ============================================================================
-- DEVICE SDK CONFIGURATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS device_sdk_configurations (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),

    -- Device Reference
    payment_device_id BIGINT NOT NULL REFERENCES payment_devices(id) ON DELETE CASCADE,

    -- SDK Information
    sdk_name VARCHAR(100) NOT NULL,
    sdk_provider VARCHAR(100),
    sdk_version VARCHAR(50),

    -- Configuration (encrypted in production)
    api_key VARCHAR(500),
    api_secret VARCHAR(500),
    merchant_id VARCHAR(100),
    terminal_id VARCHAR(100),

    -- Endpoints
    production_endpoint VARCHAR(500),
    sandbox_endpoint VARCHAR(500),
    webhook_url VARCHAR(500),

    -- Settings
    is_sandbox BOOLEAN DEFAULT TRUE,
    timeout_seconds INTEGER DEFAULT 30,
    retry_attempts INTEGER DEFAULT 3,

    -- Features Enabled
    features_enabled JSONB DEFAULT '{}'::jsonb,

    -- Status
    status VARCHAR(20) DEFAULT 'CONFIGURED',
    last_connection_at TIMESTAMP,
    last_connection_status VARCHAR(50),

    -- Audit
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_device_sdk_config_device_id ON device_sdk_configurations(payment_device_id);

-- ============================================================================
-- DEVICE ACTIVITY LOG TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS device_activity_log (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),

    -- Device Reference
    payment_device_id BIGINT NOT NULL REFERENCES payment_devices(id) ON DELETE CASCADE,

    -- Activity Information
    activity_type VARCHAR(50) NOT NULL, -- CREATED, ACTIVATED, DEACTIVATED, TRANSACTION, ERROR, MAINTENANCE
    activity_description TEXT,

    -- User who performed the action (if applicable)
    performed_by UUID,

    -- Additional data
    metadata JSONB DEFAULT '{}'::jsonb,

    -- Timestamp
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_device_activity_device_id ON device_activity_log(payment_device_id);
CREATE INDEX IF NOT EXISTS idx_device_activity_type ON device_activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_device_activity_created_at ON device_activity_log(created_at);

-- ============================================================================
-- SEED DEVICE CATALOG DATA (Reference data for manufacturers/models)
-- ============================================================================
-- This is reference data stored in the application code (DeviceCatalog class)
-- but we can seed some test devices for existing merchants

INSERT INTO payment_devices (uuid, merchant_id, manufacturer, model, serial_number, category, platform, deployment_type, integration_type, device_name, status, activation_status, pci_compliant, emv_certified, contactless_enabled, documentation_url)
SELECT
    gen_random_uuid(),
    m.id,
    'Verifone',
    'M400',
    'VF-M400-' || LPAD(m.id::text, 4, '0'),
    'Multimedia multilane device / PIN pad',
    'Verifone Engage family (platform)',
    'Attended lane checkout',
    'Semi-integrated to POS; lane mounting options',
    m.business_name || ' - Main Terminal',
    'ACTIVE',
    'ACTIVATED',
    true,
    true,
    true,
    'https://www.verifone.com/en/us/countertop-s-pin-pads-multilane/verifone-m400'
FROM merchants m
WHERE m.status = 'APPROVED' AND m.deleted_at IS NULL
AND NOT EXISTS (SELECT 1 FROM payment_devices pd WHERE pd.merchant_id = m.id)
ON CONFLICT DO NOTHING;

-- Add onboarding requirements for seeded devices
INSERT INTO device_onboarding_requirements (uuid, payment_device_id, requirement_name, requirement_description, requirement_category, is_completed, display_order)
SELECT
    gen_random_uuid(),
    pd.id,
    req.name,
    req.description,
    req.category,
    true, -- Mark as completed for seeded devices
    req.display_order
FROM payment_devices pd
CROSS JOIN (
    VALUES
        ('Verifone Engage SDK Integration', 'Install and configure Verifone Engage platform SDK', 'SOFTWARE', 1),
        ('Network Connectivity', 'Ethernet or USB connectivity to POS established', 'CONNECTIVITY', 2),
        ('PCI PTS 5.x Compliance', 'Device PCI PTS compliance validated', 'CERTIFICATION', 3),
        ('EMV Configuration', 'EMV L1/L2 certification verified', 'CERTIFICATION', 4),
        ('Key Injection', 'Secure encryption keys injected', 'SECURITY', 5)
) AS req(name, description, category, display_order)
WHERE pd.manufacturer = 'Verifone' AND pd.model = 'M400'
AND NOT EXISTS (
    SELECT 1 FROM device_onboarding_requirements dor
    WHERE dor.payment_device_id = pd.id AND dor.requirement_name = req.name
)
ON CONFLICT DO NOTHING;
