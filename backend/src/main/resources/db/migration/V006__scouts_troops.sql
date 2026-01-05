-- Create troops table
CREATE TABLE troops (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    troop_number VARCHAR(50) NOT NULL UNIQUE,
    council_id BIGINT NOT NULL REFERENCES councils(id) ON DELETE CASCADE,
    troop_name VARCHAR(255),
    troop_type VARCHAR(50) NOT NULL,
    charter_organization VARCHAR(255),
    meeting_location VARCHAR(255),
    meeting_day VARCHAR(50),
    meeting_time VARCHAR(50),
    scoutmaster_id UUID REFERENCES users(id),
    scoutmaster_name VARCHAR(255),
    scoutmaster_email VARCHAR(255),
    scoutmaster_phone VARCHAR(20),
    assistant_scoutmaster_id UUID REFERENCES users(id),
    total_scouts INTEGER NOT NULL DEFAULT 0,
    active_scouts INTEGER NOT NULL DEFAULT 0,
    total_sales DECIMAL(10, 2) NOT NULL DEFAULT 0,
    cards_sold INTEGER NOT NULL DEFAULT 0,
    goal_amount DECIMAL(10, 2),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create scouts table
CREATE TABLE scouts (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    troop_id BIGINT NOT NULL REFERENCES troops(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    birth_date DATE,
    bsa_member_id VARCHAR(50) UNIQUE,
    rank VARCHAR(50) NOT NULL DEFAULT 'SCOUT',
    join_date DATE,
    parent_name VARCHAR(255),
    parent_email VARCHAR(255),
    parent_phone VARCHAR(20),
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    cards_sold INTEGER NOT NULL DEFAULT 0,
    total_sales DECIMAL(10, 2) NOT NULL DEFAULT 0,
    sales_goal DECIMAL(10, 2),
    commission_earned DECIMAL(10, 2) NOT NULL DEFAULT 0,
    top_seller BOOLEAN NOT NULL DEFAULT FALSE,
    awards_earned INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    profile_image_url VARCHAR(500),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for troops
CREATE INDEX idx_troops_council_id ON troops(council_id);
CREATE INDEX idx_troops_troop_number ON troops(troop_number);
CREATE INDEX idx_troops_status ON troops(status);
CREATE INDEX idx_troops_troop_type ON troops(troop_type);
CREATE INDEX idx_troops_scoutmaster_id ON troops(scoutmaster_id);
CREATE INDEX idx_troops_total_sales ON troops(total_sales DESC);
CREATE INDEX idx_troops_created_at ON troops(created_at);

-- Indexes for scouts
CREATE INDEX idx_scouts_user_id ON scouts(user_id);
CREATE INDEX idx_scouts_troop_id ON scouts(troop_id);
CREATE INDEX idx_scouts_bsa_member_id ON scouts(bsa_member_id);
CREATE INDEX idx_scouts_status ON scouts(status);
CREATE INDEX idx_scouts_rank ON scouts(rank);
CREATE INDEX idx_scouts_total_sales ON scouts(total_sales DESC);
CREATE INDEX idx_scouts_top_seller ON scouts(top_seller);
CREATE INDEX idx_scouts_name ON scouts(last_name, first_name);
CREATE INDEX idx_scouts_created_at ON scouts(created_at);

-- Trigger to update troops.updated_at
CREATE OR REPLACE FUNCTION update_troops_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER troops_updated_at_trigger
BEFORE UPDATE ON troops
FOR EACH ROW
EXECUTE FUNCTION update_troops_updated_at();

-- Trigger to update scouts.updated_at
CREATE OR REPLACE FUNCTION update_scouts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER scouts_updated_at_trigger
BEFORE UPDATE ON scouts
FOR EACH ROW
EXECUTE FUNCTION update_scouts_updated_at();

-- Ensure unique user_id (one scout profile per user)
CREATE UNIQUE INDEX idx_scouts_user_id_unique ON scouts(user_id);
