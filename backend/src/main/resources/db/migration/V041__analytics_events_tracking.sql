-- V041: Analytics events tracking table for comprehensive user behavior analytics
-- Tracks screen views, sessions, feature usage, search queries, and conversion events

CREATE TABLE IF NOT EXISTS campcard.analytics_events (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID,
    session_id VARCHAR(64),
    event_type VARCHAR(50) NOT NULL,
    event_name VARCHAR(100) NOT NULL,
    screen_name VARCHAR(100),
    properties JSONB DEFAULT '{}',
    device_type VARCHAR(20),
    device_model VARCHAR(100),
    os_version VARCHAR(30),
    app_version VARCHAR(20),
    ip_address VARCHAR(45),
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_analytics_events_user_id ON campcard.analytics_events(user_id);
CREATE INDEX idx_analytics_events_event_type ON campcard.analytics_events(event_type);
CREATE INDEX idx_analytics_events_event_name ON campcard.analytics_events(event_name);
CREATE INDEX idx_analytics_events_session_id ON campcard.analytics_events(session_id);
CREATE INDEX idx_analytics_events_created_at ON campcard.analytics_events(created_at);
CREATE INDEX idx_analytics_events_screen_name ON campcard.analytics_events(screen_name);

-- Grant access to the app user
GRANT SELECT, INSERT ON campcard.analytics_events TO campcard_app;
GRANT USAGE, SELECT ON SEQUENCE campcard.analytics_events_id_seq TO campcard_app;
