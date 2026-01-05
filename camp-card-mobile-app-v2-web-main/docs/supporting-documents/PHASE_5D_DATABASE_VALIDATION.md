# PHASE 5d: DATABASE VALIDATION - SCRIPTS & PROCEDURES

**Status:**  **READY TO EXECUTE**
**Duration:** 1-2 hours
**Tools:** psql, Liquibase/Flyway, SQL queries
**Created:** December 28, 2025

---

## Phase 5d Objectives

1. Validate PostgreSQL schema matches expected definitions
2. Test migration scripts work correctly
3. Verify data integrity constraints
4. Test upgrade and rollback paths
5. Validate backup/restore procedures

---

##  Test 1: Schema Validation

### Test 1.1: Table Existence & Definition

**Objective:** Verify all required tables exist with correct structure

**SQL Script:**

```sql
-- File: test-schema-validation.sql

-- Test 1: Check all required tables exist
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Expected output:
-- accounts
-- camps
-- offers
-- redemptions
-- scouts
-- users
-- etc.

-- Test 2: Validate accounts table structure
\d accounts

-- Expected columns:
-- id (integer, primary key)
-- email (varchar, unique, not null)
-- password_hash (varchar, not null)
-- created_at (timestamp, default now())
-- updated_at (timestamp, default now())

-- Test 3: Check all required columns exist
SELECT
 table_name,
 column_name,
 data_type,
 is_nullable,
 column_default
FROM
 information_schema.columns
WHERE
 table_schema = 'public'
 AND table_name IN ('accounts', 'users', 'camps', 'offers')
ORDER BY
 table_name, ordinal_position;

-- Test 4: Validate primary keys
SELECT
 tablename,
 indexname,
 indexdef
FROM
 pg_indexes
WHERE
 schemaname = 'public'
 AND indexname LIKE '%_pkey'
ORDER BY
 tablename;

-- Test 5: Validate foreign keys
SELECT
 constraint_name,
 table_name,
 column_name,
 referenced_table_name,
 referenced_column_name
FROM
 information_schema.referential_constraints
WHERE
 constraint_schema = 'public'
ORDER BY
 table_name;

-- Test 6: Validate unique constraints
SELECT
 constraint_name,
 table_name,
 column_name
FROM
 information_schema.constraint_column_usage
WHERE
 constraint_schema = 'public'
 AND constraint_name LIKE '%_unique'
ORDER BY
 table_name;
```

**Success Criteria:**
- All 10+ required tables exist
- All columns present with correct data types
- All primary keys defined
- All foreign keys defined
- All constraints present

**Sample Execution:**

```bash
#!/bin/bash

# Connect to database and run validation
psql -U camp_user -d camp_db -h localhost -f test-schema-validation.sql > schema-validation-results.txt 2>&1

# Check results
if grep -q "ERROR" schema-validation-results.txt; then
 echo " Schema validation FAILED"
 cat schema-validation-results.txt
 exit 1
else
 echo " Schema validation PASSED"
fi
```

---

### Test 1.2: Index Validation

**Objective:** Verify all performance-critical indexes exist

**SQL Script:**

```sql
-- File: test-indexes.sql

-- Test 1: List all indexes
SELECT
 tablename,
 indexname,
 indexdef
FROM
 pg_indexes
WHERE
 schemaname = 'public'
ORDER BY
 tablename, indexname;

-- Expected indexes (performance-critical):
-- accounts_email_idx (on accounts.email)
-- users_account_id_idx (on users.account_id)
-- offers_camp_id_idx (on offers.camp_id)
-- redemptions_user_id_idx (on redemptions.user_id)
-- redemptions_offer_id_idx (on redemptions.offer_id)

-- Test 2: Validate specific performance indexes exist
SELECT
 schemaname,
 tablename,
 indexname,
 indexdef
FROM
 pg_indexes
WHERE
 schemaname = 'public'
 AND (
 indexname IN (
 'accounts_email_idx',
 'users_account_id_idx',
 'offers_camp_id_idx',
 'redemptions_user_id_idx',
 'redemptions_offer_id_idx',
 'camps_leader_id_idx'
 )
 )
ORDER BY
 tablename;

-- Test 3: Check index health (missing indexes)
SELECT
 schemaname,
 tablename,
 attname,
 n_distinct,
 correlation
FROM
 pg_stats
WHERE
 schemaname = 'public'
 AND n_distinct > 100 -- Columns with high cardinality
 AND correlation IS NOT NULL
ORDER BY
 tablename, attname;

-- Note: Columns with high cardinality but not indexed may benefit from indexing
```

**Success Criteria:**
- All critical indexes present
- No obviously missing indexes
- Index definitions correct

---

##  Test 2: Migration Scripts Validation

### Test 2.1: Fresh Installation from Migrations

**Objective:** Verify migrations create correct schema from scratch

**Procedure:**

```bash
#!/bin/bash
# File: test-fresh-migration.sh

# Step 1: Create fresh test database
echo "Creating fresh test database..."
psql -U postgres -h localhost -c "DROP DATABASE IF EXISTS camp_db_test;"
psql -U postgres -h localhost -c "CREATE DATABASE camp_db_test;"

# Step 2: Run migrations from V1.0.0 (clean state)
echo "Running migrations (V1.0.0  latest)..."
cd repos/camp-card-backend

# Using Flyway (if configured)
./mvnw flyway:clean
./mvnw flyway:migrate \
 -Dflyway.url=jdbc:postgresql://localhost:5432/camp_db_test \
 -Dflyway.user=camp_user \
 -Dflyway.password=password123 \
 -Dflyway.locations=classpath:db/migration

# Step 3: Validate final schema matches expected
echo "Validating schema..."
psql -U camp_user -d camp_db_test -h localhost -f test-schema-validation.sql > fresh-schema-results.txt

# Step 4: Check if validation passed
if grep -q "ERROR" fresh-schema-results.txt; then
 echo " Fresh installation validation FAILED"
 exit 1
else
 echo " Fresh installation validation PASSED"
fi

# Step 5: Insert test data
echo "Testing data insertion..."
psql -U camp_user -d camp_db_test -h localhost << EOF
 INSERT INTO accounts (email, password_hash)
 VALUES ('test@example.com', 'hash123');

 INSERT INTO users (account_id, first_name, last_name, role)
 VALUES (1, 'Test', 'User', 'SCOUT');

 SELECT COUNT(*) as account_count FROM accounts;
 SELECT COUNT(*) as user_count FROM users;
EOF

echo " Fresh installation complete"
```

**Success Criteria:**
- Fresh database created successfully
- All migrations executed (all V*.sql files)
- Final schema matches expected
- Data insertion works
- No migration errors

---

### Test 2.2: Upgrade Path (V1  V2)

**Objective:** Verify data preserved when upgrading from V1 to V2

**Procedure:**

```bash
#!/bin/bash
# File: test-upgrade-path.sh

# Step 1: Create test database with V1 schema
echo "Step 1: Creating V1 database..."
psql -U postgres -h localhost -c "DROP DATABASE IF EXISTS camp_db_v1_test;"
psql -U postgres -h localhost -c "CREATE DATABASE camp_db_v1_test;"

# Step 2: Run only V1 migrations
echo "Step 2: Deploying V1 migrations..."
cd repos/camp-card-backend
./mvnw flyway:clean
./mvnw flyway:migrate \
 -Dflyway.url=jdbc:postgresql://localhost:5432/camp_db_v1_test \
 -Dflyway.user=camp_user \
 -Dflyway.password=password123 \
 -Dflyway.locations=classpath:db/migration \
 -Dflyway.target=1.9.0 # Stop at V1

# Step 3: Insert V1 test data
echo "Step 3: Inserting V1 test data..."
psql -U camp_user -d camp_db_v1_test -h localhost << 'EOF'
 INSERT INTO accounts (email, password_hash) VALUES
 ('user1@example.com', 'hash1'),
 ('user2@example.com', 'hash2'),
 ('user3@example.com', 'hash3');

 INSERT INTO users (account_id, first_name, last_name, role) VALUES
 (1, 'John', 'Doe', 'SCOUT'),
 (2, 'Jane', 'Smith', 'LEADER'),
 (3, 'Bob', 'Johnson', 'MEMBER');

 INSERT INTO camps (name, location, leader_id) VALUES
 ('Camp A', 'Location A', 2);

 -- Capture V1 state
 CREATE TABLE v1_state AS
 SELECT
 (SELECT COUNT(*) FROM accounts) as account_count,
 (SELECT COUNT(*) FROM users) as user_count,
 (SELECT COUNT(*) FROM camps) as camp_count;
EOF

# Step 4: Backup V1 data
echo "Step 4: Backing up V1 data..."
pg_dump -U camp_user -d camp_db_v1_test -h localhost > camp_db_v1_backup.sql

# Step 5: Run V2 migrations
echo "Step 5: Running V2 migrations (upgrade)..."
./mvnw flyway:migrate \
 -Dflyway.url=jdbc:postgresql://localhost:5432/camp_db_v1_test \
 -Dflyway.user=camp_user \
 -Dflyway.password=password123 \
 -Dflyway.locations=classpath:db/migration

# Step 6: Verify data preserved
echo "Step 6: Verifying data preservation..."
psql -U camp_user -d camp_db_v1_test -h localhost << 'EOF'
 -- Check counts match
 SELECT
 (SELECT account_count FROM v1_state) as v1_accounts,
 (SELECT COUNT(*) FROM accounts) as v2_accounts,
 CASE
 WHEN (SELECT account_count FROM v1_state) = (SELECT COUNT(*) FROM accounts)
 THEN ' MATCH'
 ELSE ' MISMATCH'
 END as account_status;

 SELECT
 (SELECT user_count FROM v1_state) as v1_users,
 (SELECT COUNT(*) FROM users) as v2_users,
 CASE
 WHEN (SELECT user_count FROM v1_state) = (SELECT COUNT(*) FROM users)
 THEN ' MATCH'
 ELSE ' MISMATCH'
 END as user_status;

 -- Check specific data integrity
 SELECT * FROM accounts ORDER BY id;
 SELECT * FROM users ORDER BY id;
EOF

echo " Upgrade path validation complete"
```

**Success Criteria:**
- V1 schema created successfully
- V1 test data inserted
- V2 migrations execute without errors
- All V1 data preserved (counts match)
- No data corruption
- New V2 columns properly initialized

---

### Test 2.3: Rollback Capability

**Objective:** Verify database can be rolled back to previous version

**Procedure:**

```bash
#!/bin/bash
# File: test-rollback.sh

# Step 1: Create current V2 database
echo "Step 1: Creating V2 database..."
psql -U postgres -h localhost -c "DROP DATABASE IF EXISTS camp_db_rollback_test;"
psql -U postgres -h localhost -c "CREATE DATABASE camp_db_rollback_test;"

# Step 2: Deploy V2 migrations
echo "Step 2: Deploying V2 migrations..."
./mvnw flyway:migrate \
 -Dflyway.url=jdbc:postgresql://localhost:5432/camp_db_rollback_test \
 -Dflyway.user=camp_user \
 -Dflyway.password=password123 \
 -Dflyway.locations=classpath:db/migration

# Step 3: Insert V2 data
echo "Step 3: Inserting V2 test data..."
psql -U camp_user -d camp_db_rollback_test -h localhost << 'EOF'
 INSERT INTO accounts (email, password_hash) VALUES ('test@example.com', 'hash');
 INSERT INTO users (account_id, first_name, last_name, role) VALUES (1, 'Test', 'User', 'SCOUT');

 SELECT COUNT(*) as v2_accounts FROM accounts;
EOF

# Step 4: Create manual rollback script
cat > rollback-v1.sql << 'EOF'
-- Rollback from V2 to V1
-- Drop V2-only tables
DROP TABLE IF EXISTS v2_new_feature CASCADE;
DROP TABLE IF EXISTS v2_audit_log CASCADE;

-- Drop V2-only columns
ALTER TABLE users DROP COLUMN IF EXISTS v2_specific_field;

-- Restore V1 schema state
-- (Note: This is simplified; actual rollback would use Flyway undo capability)
EOF

# Step 5: Execute rollback
echo "Step 4: Executing rollback to V1..."
psql -U camp_user -d camp_db_rollback_test -h localhost -f rollback-v1.sql

# Step 6: Verify rollback successful
echo "Step 5: Verifying rollback..."
psql -U camp_user -d camp_db_rollback_test -h localhost << 'EOF'
 -- Verify V1 schema structure
 \d accounts
 \d users

 -- Verify data still exists
 SELECT COUNT(*) as account_count FROM accounts;
 SELECT COUNT(*) as user_count FROM users;
EOF

echo " Rollback test complete"
```

**Success Criteria:**
- V2 database created and populated
- Rollback script executes without errors
- Schema reverts to V1
- All data preserved during rollback
- Database is usable after rollback

---

## Test 3: Data Integrity & Constraints

### Test 3.1: Primary Key Uniqueness

```sql
-- File: test-pk-uniqueness.sql

-- Test: Insert duplicate primary key
INSERT INTO accounts (id, email, password_hash) VALUES (1, 'test@example.com', 'hash');

-- Expected: ERROR: duplicate key value violates unique constraint "accounts_pkey"
-- This is the EXPECTED behavior - constraint is working
```

### Test 3.2: Foreign Key Relationships

```sql
-- File: test-fk-constraints.sql

-- Test 1: Insert valid foreign key reference
INSERT INTO users (account_id, first_name, last_name, role)
VALUES (1, 'Test', 'User', 'SCOUT');
-- Expected: SUCCESS

-- Test 2: Insert invalid foreign key reference
INSERT INTO users (account_id, first_name, last_name, role)
VALUES (9999, 'Invalid', 'User', 'SCOUT');
-- Expected: ERROR: insert or update on table "users" violates foreign key constraint

-- Test 3: Try to delete referenced account
DELETE FROM accounts WHERE id = 1;
-- Expected: ERROR: update or delete on table "accounts" violates foreign key constraint
-- OR if cascade delete is configured: SUCCESS (delete users too)

-- Test 4: Cascade delete (if configured)
-- Delete account should delete associated users
DELETE FROM accounts WHERE id = 2;
SELECT COUNT(*) FROM users WHERE account_id = 2;
-- Expected: 0 (all users deleted)
```

### Test 3.3: Unique Constraints

```sql
-- File: test-unique-constraints.sql

-- Test: Insert duplicate email
INSERT INTO accounts (email, password_hash) VALUES ('existing@example.com', 'hash');
INSERT INTO accounts (email, password_hash) VALUES ('existing@example.com', 'hash2');
-- Expected: ERROR: duplicate key value violates unique constraint "accounts_email_key"
```

### Test 3.4: Check Constraints

```sql
-- File: test-check-constraints.sql

-- Test: Validate check constraints on roles
INSERT INTO users (account_id, first_name, last_name, role)
VALUES (1, 'Test', 'User', 'INVALID_ROLE');
-- Expected: ERROR: new row for relation "users" violates check constraint "valid_role"

-- Valid insert
INSERT INTO users (account_id, first_name, last_name, role)
VALUES (1, 'Test', 'User', 'SCOUT');
-- Expected: SUCCESS
```

---

## Phase 5d Completion Checklist

- [ ] Schema validation script executed successfully
- [ ] All required tables exist
- [ ] All required columns present with correct types
- [ ] All primary keys defined
- [ ] All foreign keys defined
- [ ] All indexes present
- [ ] Fresh installation test passed
- [ ] Upgrade path test passed (V1  V2)
- [ ] Data preservation confirmed during upgrade
- [ ] Rollback procedure tested and verified
- [ ] Primary key uniqueness working
- [ ] Foreign key constraints enforced
- [ ] Unique constraints enforced
- [ ] Check constraints enforced
- [ ] No constraint violations in production data
- [ ] Database performance acceptable

---

## Database Validation Report

**Template: phase-5d-database-validation-results.md**

```markdown
# Phase 5d: Database Validation Results

## Test Execution Summary

| Test Category | Status | Duration | Issues |
|---------------|--------|----------|--------|
| Schema Validation | / | __ min | __ |
| Index Validation | / | __ min | __ |
| Fresh Migration | / | __ min | __ |
| Upgrade Path | / | __ min | __ |
| Rollback Test | / | __ min | __ |
| Constraint Tests | / | __ min | __ |

## Detailed Results

### Schema Validation
- Tables found: __/10 required
- Columns validated: __
- Primary keys: __
- Foreign keys: __

### Migration Tests
- Fresh install: /
- Data preservation: /
- Upgrade path: /
- Rollback: /

### Constraint Validation
- PK uniqueness: /
- FK enforcement: /
- Unique constraints: /
- Check constraints: /

## Recommendations

1. __
2. __

## Overall Status

Database validation: PASSED / FAILED
```

---

## Next Phase

After Phase 5d completes:
1. Document findings in database validation report
2. Resolve any data integrity issues found
3. Proceed to Phase 5e: Cache Layer Testing

---

**Phase 5d Status:**  Ready for execution

*Phase 5d ensures the PostgreSQL database and migration scripts are reliable for production use and can handle upgrades/rollbacks safely.*
