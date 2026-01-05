# PgAdmin Setup Guide for CampCard

## Installed Components

- **PostgreSQL 18**: Running on port 5432
- **PgAdmin 4**: Installed in `/Applications/pgAdmin 4.app`
- **Database**: campcard_db (to be created)
- **User**: campcard (to be created)

## Getting Started with PgAdmin

### Step 1: Launch PgAdmin

```bash
open -a "pgAdmin 4"
```

Or find it in your Applications folder.

### Step 2: Create a New Server Connection

1. **Open PgAdmin 4** (first launch may take a moment)
2. **Set Master Password** (if asked) - this is for PgAdmin itself, choose any password
3. **Right-click on "Servers"** in the left panel
4. **Select "Register"  "Server..."**

### Step 3: Configure Connection

**General Tab:**
- **Name**: CampCard Local
- **Description**: CampCard Development Database

**Connection Tab:**
- **Host name/address**: localhost
- **Port**: 5432
- **Maintenance database**: postgres
- **Username**: postgres
- **Password**: [The password you set during PostgreSQL installation]
 - If you don't remember, it might be empty or "postgres"
- **Save password**:  (checked)

### Step 4: Test Connection

Click "Save" - if the connection is successful, you'll see "CampCard Local" appear in the Servers list.

## Creating the Database

### Method 1: Using PgAdmin UI

1. Expand "CampCard Local" server
2. Right-click on "Databases"
3. Select "Create"  "Database..."
4. **Database name**: campcard_db
5. **Owner**: postgres (for now)
6. Click "Save"

### Method 2: Using SQL Query Tool

1. Right-click on "PostgreSQL 18" under your server
2. Select "Query Tool"
3. Paste and execute this SQL:

```sql
-- Create database
CREATE DATABASE campcard_db;

-- Create user
CREATE USER campcard WITH PASSWORD 'campcard123';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE campcard_db TO campcard;

-- Set owner
ALTER DATABASE campcard_db OWNER TO campcard;

-- Connect to campcard_db
\c campcard_db

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO campcard;
```

### Method 3: Using Terminal

```bash
export PATH="/Library/PostgreSQL/18/bin:$PATH"

# You'll be prompted for the postgres password
psql -U postgres -h localhost << 'EOF'
CREATE DATABASE campcard_db;
CREATE USER campcard WITH PASSWORD 'campcard123';
GRANT ALL PRIVILEGES ON DATABASE campcard_db TO campcard;
ALTER DATABASE campcard_db OWNER TO campcard;
\q
EOF
```

##  Backend Configuration

Update your backend application.yml to use PostgreSQL:

**File**: `backend/src/main/resources/application.yml`

```yaml
spring:
 datasource:
 url: jdbc:postgresql://localhost:5432/campcard_db
 username: campcard
 password: campcard123
 driver-class-name: org.postgresql.Driver

 jpa:
 database: POSTGRESQL
 hibernate:
 ddl-auto: validate # Use Flyway for migrations
 show-sql: true
 properties:
 hibernate:
 dialect: org.hibernate.dialect.PostgreSQLDialect
 format_sql: true

 flyway:
 enabled: true
 locations: classpath:db/migration
 baseline-on-migrate: true
```

##  Running Migrations

The database migrations are located in:
```
backend/src/main/resources/db/migration/
 V001__initial_schema.sql
 V002__seed_data.sql
 V003__referrals_and_notifications.sql
```

These will run automatically when you start the backend with PostgreSQL configured.

##  Connecting from Mobile App

The mobile app should already be configured to connect to:
```
http://localhost:8080/api/v1
```

No changes needed on the mobile side.

## Testing the Setup

### 1. Start Backend with PostgreSQL

```bash
cd backend
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"
mvn spring-boot:run
```

### 2. Verify in PgAdmin

1. Open PgAdmin
2. Navigate to: CampCard Local  Databases  campcard_db  Schemas  public  Tables
3. You should see tables created by Flyway migrations

### 3. Test from Mobile App

Use the "Test Database Connection" button on the Login screen.

##  Viewing Data in PgAdmin

### View Tables
1. Expand: campcard_db  Schemas  public  Tables
2. Right-click a table (e.g., "users")
3. Select "View/Edit Data"  "All Rows"

### Run Custom Queries
1. Right-click on "campcard_db"
2. Select "Query Tool"
3. Example queries:

```sql
-- View all users
SELECT * FROM users;

-- View recent offers
SELECT * FROM offers ORDER BY created_at DESC LIMIT 10;

-- View merchants
SELECT * FROM merchants;

-- View user activity
SELECT u.email, COUNT(r.id) as redemptions
FROM users u
LEFT JOIN redemptions r ON u.id = r.user_id
GROUP BY u.id, u.email;
```

## Database Credentials

**For PgAdmin Connection:**
- Host: localhost
- Port: 5432
- Database: postgres (initial connection)
- Username: postgres
- Password: [Set during PostgreSQL installation]

**For Application:**
- Database: campcard_db
- Username: campcard
- Password: campcard123

##  Troubleshooting

### Can't Connect to PostgreSQL

Check if PostgreSQL is running:
```bash
ps aux | grep postgres
```

Start if needed:
```bash
sudo -u postgres /Library/PostgreSQL/18/bin/pg_ctl -D /Library/PostgreSQL/18/data start
```

### Password Authentication Failed

If you don't know the postgres password:
1. Edit `/Library/PostgreSQL/18/data/pg_hba.conf`
2. Change `md5` to `trust` for local connections
3. Restart PostgreSQL
4. Connect and set new password:
 ```sql
 ALTER USER postgres WITH PASSWORD 'newpassword';
 ```
5. Change pg_hba.conf back to `md5`
6. Restart PostgreSQL

### Database Already Exists

If you see "database already exists" error:
```sql
DROP DATABASE campcard_db;
CREATE DATABASE campcard_db;
```

### Permission Issues

Grant all necessary permissions:
```sql
\c campcard_db
GRANT ALL ON SCHEMA public TO campcard;
GRANT ALL ON ALL TABLES IN SCHEMA public TO campcard;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO campcard;
```

##  Accessing PgAdmin via Browser

PgAdmin may also be accessible at:
```
http://127.0.0.1:5050
```

Or through the desktop app.

## Useful PgAdmin Features

- **Backup Database**: Right-click database  Backup
- **Restore Database**: Right-click database  Restore
- **Export Data**: Right-click table  Import/Export
- **ER Diagram**: Tools  ERD Tool (view relationships)
- **Performance**: Dashboard shows activity and stats
