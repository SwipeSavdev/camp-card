#!/bin/bash

# CampCard Database Setup Script
# This script creates the database and user for CampCard application

echo "=========================================="
echo "CampCard Database Setup"
echo "=========================================="
echo ""

# Set PostgreSQL path
export PATH="/Library/PostgreSQL/18/bin:$PATH"

echo "Creating database and user..."
echo "You'll be prompted for the PostgreSQL 'postgres' user password."
echo ""

# Create database setup SQL
cat > /tmp/campcard_setup.sql << 'EOF'
-- Drop existing database if it exists (optional - comment out if you want to keep data)
-- DROP DATABASE IF EXISTS campcard_db;
-- DROP USER IF EXISTS campcard;

-- Create database
CREATE DATABASE campcard_db
 WITH
 ENCODING = 'UTF8'
 LC_COLLATE = 'en_US.UTF-8'
 LC_CTYPE = 'en_US.UTF-8'
 TEMPLATE = template0;

-- Create user
CREATE USER campcard WITH
 PASSWORD 'campcard123'
 CREATEDB;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE campcard_db TO campcard;
ALTER DATABASE campcard_db OWNER TO campcard;

-- Connect to the new database
\c campcard_db

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO campcard;
GRANT ALL ON ALL TABLES IN SCHEMA public TO campcard;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO campcard;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO campcard;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO campcard;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO campcard;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO campcard;

-- Show databases
\l

-- Show users
\du
EOF

# Execute the setup script
psql -U postgres -h localhost -f /tmp/campcard_setup.sql

if [ $? -eq 0 ]; then
 echo ""
 echo "=========================================="
 echo " Database setup completed successfully!"
 echo "=========================================="
 echo ""
 echo "Database Details:"
 echo " Host: localhost"
 echo " Port: 5432"
 echo " Database: campcard_db"
 echo " Username: campcard"
 echo " Password: campcard123"
 echo ""
 echo "PgAdmin Connection Info:"
 echo " 1. Open PgAdmin 4"
 echo " 2. Register Server with these details:"
 echo " - Name: CampCard Local"
 echo " - Host: localhost"
 echo " - Port: 5432"
 echo " - Database: postgres (or campcard_db)"
 echo " - Username: campcard (or postgres)"
 echo " - Password: campcard123 (or your postgres password)"
 echo ""
else
 echo ""
 echo "=========================================="
 echo " Database setup failed!"
 echo "=========================================="
 echo ""
 echo "Common issues:"
 echo " 1. PostgreSQL not running - check with: ps aux | grep postgres"
 echo " 2. Wrong postgres password"
 echo " 3. Database/user already exists"
 echo ""
 echo "Try connecting manually:"
 echo " psql -U postgres -h localhost"
 echo ""
fi

# Clean up
rm -f /tmp/campcard_setup.sql
