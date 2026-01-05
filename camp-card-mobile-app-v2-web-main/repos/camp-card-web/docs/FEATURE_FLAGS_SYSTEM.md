# Feature Flag System - Camp Card Admin Portal

**Status:** Implementation Ready
**Created:** December 2025
**Scope:** Admin-only feature toggle system for mobile app experience
**Access Control:** SYSTEM_ADMIN and COUNCIL_ADMIN only

---

## 1. OVERVIEW

### Purpose
Enable system administrators to toggle mobile app features on/off without code deployment, supporting both global and per-council scoping with Redis caching for real-time propagation.

### Key Requirements
- **Admin-Only Access:** SYSTEM_ADMIN and COUNCIL_ADMIN roles only
- **Mobile-Only Control:** Toggles affect only mobile app experience
- **Scoped Flags:** Global (all councils) or per-council basis
- **Real-Time Updates:** Redis cache invalidation within 1 minute
- **Audit Logging:** Track all flag changes (who, what, when)
- **No Code Deploy:** Change flags live via admin UI

---

## 2. DATA MODEL

### 2.1 PostgreSQL Schema

```sql
-- Feature Flags Table
CREATE TABLE feature_flags (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

 -- Flag Identity
 key VARCHAR(50) UNIQUE NOT NULL, -- e.g., "geo_offers", "customer_referrals"
 name VARCHAR(100) NOT NULL, -- Display name in admin UI
 description TEXT, -- What this flag controls

 -- Flag Configuration
 enabled BOOLEAN NOT NULL DEFAULT false, -- Is feature active?
 scope VARCHAR(20) NOT NULL, -- 'GLOBAL' or 'PER_COUNCIL'
 council_id UUID, -- NULL for GLOBAL, set for PER_COUNCIL

 -- Metadata
 category VARCHAR(50), -- e.g., 'offers', 'referrals', 'notifications'
 tags JSONB, -- ["beta", "experimental"]

 -- Audit
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 created_by UUID, -- User who created flag
 updated_by UUID, -- User who last updated flag

 -- Indexes
 CONSTRAINT fk_council FOREIGN KEY (council_id) REFERENCES councils(id) ON DELETE CASCADE,
 CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES users(id),
 CONSTRAINT fk_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
);

CREATE INDEX idx_feature_flags_key ON feature_flags(key);
CREATE INDEX idx_feature_flags_council ON feature_flags(council_id);
CREATE INDEX idx_feature_flags_scope ON feature_flags(scope);
CREATE INDEX idx_feature_flags_category ON feature_flags(category);

-- Audit Trail Table
CREATE TABLE feature_flag_audit_log (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 flag_id UUID NOT NULL,

 -- Change Details
 action VARCHAR(20) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE'
 old_value JSONB, -- Previous flag state
 new_value JSONB, -- New flag state

 -- Who & When
 changed_by UUID NOT NULL, -- User who made change
 changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

 -- Tracking
 ip_address INET,
 user_agent TEXT,

 CONSTRAINT fk_flag FOREIGN KEY (flag_id) REFERENCES feature_flags(id) ON DELETE CASCADE,
 CONSTRAINT fk_user FOREIGN KEY (changed_by) REFERENCES users(id)
);

CREATE INDEX idx_audit_flag ON feature_flag_audit_log(flag_id);
CREATE INDEX idx_audit_changed_by ON feature_flag_audit_log(changed_by);
CREATE INDEX idx_audit_changed_at ON feature_flag_audit_log(changed_at);
```

---

## 3. BACKEND API SPECIFICATIONS

### 3.1 Feature Flag Endpoints

**Base Path:** `/api/v1/feature-flags`

#### 3.1.1 List Feature Flags
```http
GET /api/v1/feature-flags?scope=GLOBAL&council_id=<uuid>&category=offers
```

**Auth:** SYSTEM_ADMIN (sees all), COUNCIL_ADMIN (sees own council + global)

**Query Parameters:**
- `scope`: `GLOBAL` | `PER_COUNCIL` (optional)
- `council_id`: Filter by council (optional)
- `category`: `offers`, `referrals`, `notifications`, `geo` (optional)
- `page`: Pagination offset (default: 0)
- `limit`: Results per page (default: 20, max: 100)

**Response:**
```json
{
 "data": [
 {
 "id": "550e8400-e29b-41d4-a716-446655440000",
 "key": "geo_offers",
 "name": "Geo-Targeted Offers",
 "description": "Show location-based discount offers when customers enter merchant geofences",
 "enabled": true,
 "scope": "GLOBAL",
 "council_id": null,
 "category": "offers",
 "tags": ["production", "critical"],
 "created_at": "2025-12-01T10:00:00Z",
 "updated_at": "2025-12-23T14:30:00Z",
 "created_by": {
 "id": "user-123",
 "email": "admin@national.org",
 "name": "System Admin"
 },
 "updated_by": {
 "id": "user-456",
 "email": "admin@council.org",
 "name": "Council Admin"
 }
 }
 ],
 "pagination": {
 "total": 42,
 "page": 0,
 "limit": 20,
 "has_more": true
 }
}
```

#### 3.1.2 Get Single Feature Flag
```http
GET /api/v1/feature-flags/{flag_id}
```

**Response:** Single flag object (same as list item)

#### 3.1.3 Create Feature Flag
```http
POST /api/v1/feature-flags
Content-Type: application/json

{
 "key": "new_feature_xyz",
 "name": "Feature XYZ",
 "description": "Description of what this feature does",
 "enabled": false,
 "scope": "GLOBAL",
 "council_id": null,
 "category": "offers",
 "tags": ["beta", "experimental"]
}
```

**Auth:** SYSTEM_ADMIN only

**Validation:**
- `key`: Must be unique, alphanumeric + underscores, 5-50 chars
- `scope`: GLOBAL or PER_COUNCIL (if PER_COUNCIL, council_id required)
- `category`: Must be from allowed list

**Response:** 201 Created with flag object

#### 3.1.4 Update Feature Flag
```http
PUT /api/v1/feature-flags/{flag_id}
Content-Type: application/json

{
 "enabled": true,
 "name": "Updated Name",
 "description": "Updated description"
}
```

**Auth:** SYSTEM_ADMIN (any flag), COUNCIL_ADMIN (own council flags only)

**Restrictions:**
- Cannot change `key` (immutable identifier)
- Cannot change `scope` after creation
- COUNCIL_ADMIN cannot modify GLOBAL flags

**Response:** 200 OK with updated flag object

#### 3.1.5 Delete Feature Flag
```http
DELETE /api/v1/feature-flags/{flag_id}
```

**Auth:** SYSTEM_ADMIN only

**Response:** 204 No Content

**Note:** Soft-delete recommended; set `enabled: false` for audit trail preservation

#### 3.1.6 Get Audit Log
```http
GET /api/v1/feature-flags/{flag_id}/audit-log?limit=50
```

**Auth:** SYSTEM_ADMIN and COUNCIL_ADMIN (own council only)

**Response:**
```json
{
 "data": [
 {
 "id": "audit-123",
 "flag_id": "550e8400-e29b-41d4-a716-446655440000",
 "action": "UPDATE",
 "old_value": {
 "enabled": false,
 "name": "Geo Offers"
 },
 "new_value": {
 "enabled": true,
 "name": "Geo-Targeted Offers"
 },
 "changed_by": {
 "id": "user-456",
 "email": "admin@council.org",
 "name": "Council Admin"
 },
 "changed_at": "2025-12-23T14:30:00Z",
 "ip_address": "192.168.1.1"
 }
 ],
 "pagination": { "total": 15, "page": 0 }
}
```

---

### 3.2 Mobile Client Endpoints

#### 3.2.1 Get Feature Flags for Mobile
```http
GET /api/v1/feature-flags/mobile/evaluate?council_id=<uuid>
Authorization: Bearer {mobile_jwt}
```

**Purpose:** Mobile app calls this on startup to cache feature flags

**Auth:** Any authenticated user (returns only flags relevant to their council)

**Response:**
```json
{
 "flags": {
 "geo_offers": true,
 "customer_referrals": true,
 "multi_offer_redemption": false,
 "loyalty_rewards": true
 },
 "cache_ttl": 3600, // Seconds until mobile should refresh
 "last_updated": "2025-12-23T14:30:00Z"
}
```

**Caching:**
- Redis TTL: 1 minute (admin UI changes propagate within 60 seconds)
- Mobile cache TTL: 1 hour (user devices cache locally, fetch every app launch)

---

## 4. ADMIN PORTAL UI

### 4.1 Feature Flags Page Structure

**Route:** `/app/feature-flags`

**Layout:**
```

 Feature Flags Management [+New] 

 Filters: 
 [Scope: All ] [Category: All ] [Status: All ] 

 KEY  NAME  SCOPE  STATUS 

 geo_offers  Geo Offers GLOBAL   Active 
 customer_ref...  Customer Ref.. PER_C   Off 
 multi_offer_red  Multi-Offer GLOBAL   Active 

```

### 4.2 Components

#### 4.2.1 Feature Flag List Table
- Columns: Key, Name, Scope, Status, Council (if applicable), Last Updated, Actions
- Inline toggle: Enable/Disable button with confirmation
- Click row: Expand to detail view
- Filters: Scope, Category, Status
- Search: By key or name
- Pagination: 20 per page

#### 4.2.2 Detail Modal
- View full flag details
- Edit name, description, tags
- Toggle enabled/disabled with confirmation
- View change history (audit log)
- Delete button (SYSTEM_ADMIN only)

#### 4.2.3 Create Flag Modal
- Form fields: Key, Name, Description, Scope, Council (if PER_COUNCIL), Category, Tags
- Validation: Key must be unique
- Submit creates flag in disabled state by default

#### 4.2.4 Audit Log Section
- Timeline of all changes to flag
- Who made the change, what changed, when
- IP address and user agent logged
- Filter by date range
- Export to CSV

### 4.3 Access Control
- **SYSTEM_ADMIN:** Full access (create, read, update, delete, any flag)
- **COUNCIL_ADMIN:** Read/update own council flags, see GLOBAL flags but can't modify
- **Other roles:** No access (redirect to 403)

---

## 5. DEFAULT FEATURE FLAGS

### 5.1 Initial Flag Registry

| Key | Name | Description | Scope | Category | Default |
|-----|------|-------------|-------|----------|---------|
| `geo_offers` | Geo-Targeted Offers | Show offers when customers enter merchant geofences | GLOBAL | offers | true |
| `customer_referrals` | Customer Referrals | Enable customer-to-customer referral rewards | GLOBAL | referrals | true |
| `multi_offer_redemption` | Multi-Offer Redemption | Allow customers to redeem multiple offers in single transaction | GLOBAL | offers | false |
| `loyalty_rewards` | Loyalty Rewards | Show loyalty points and rewards tier system | GLOBAL | referrals | true |
| `scout_leaderboard` | Scout Leaderboard | Display scout sales rankings and competitions | GLOBAL | referrals | true |
| `push_notifications` | Push Notifications | Enable push notifications for offers and updates | GLOBAL | notifications | true |
| `email_marketing` | Email Marketing | Enable marketing email campaigns | GLOBAL | notifications | true |
| `campaign_mode` | Campaign Mode | Enable time-limited campaign features | PER_COUNCIL | campaigns | false |
| `advanced_analytics` | Advanced Analytics | Show detailed analytics dashboards | GLOBAL | analytics | false |
| `beta_ui_redesign` | Beta UI Redesign | Show new mobile UI design (beta) | GLOBAL | ui | false |

---

## 6. IMPLEMENTATION PHASES

### Phase 1: Backend (Week 1)
- [ ] Create PostgreSQL schema (feature_flags, audit_log tables)
- [ ] Implement JPA/Hibernate entities
- [ ] Create REST controllers (CRUD endpoints)
- [ ] Implement role-based authorization (@PreAuthorize)
- [ ] Add audit logging interceptor
- [ ] Setup Redis caching
- [ ] Write unit/integration tests

### Phase 2: Admin Portal (Week 2)
- [ ] Create `/app/feature-flags/page.tsx` (list view)
- [ ] Build FeatureFlagTable component
- [ ] Implement FeatureFlagModal component (detail/edit)
- [ ] Add CreateFlagModal component
- [ ] Implement AuditLogViewer component
- [ ] Wire up API calls in `lib/api.ts`
- [ ] Add role-based access checks
- [ ] Style with Tailwind CSS

### Phase 3: Mobile Integration (Week 2-3)
- [ ] Create `/api/v1/feature-flags/mobile/evaluate` endpoint
- [ ] Implement mobile client hook (`useFeatureFlag`)
- [ ] Add flag evaluation logic
- [ ] Setup local caching (React Query)
- [ ] Add conditional feature rendering
- [ ] Implement fallback behavior

### Phase 4: Testing & Docs (Week 3)
- [ ] E2E tests for admin UI workflows
- [ ] Integration tests for flag evaluation
- [ ] Load testing for Redis caching
- [ ] Write developer documentation
- [ ] Create runbook for flag management

---

## 7. SECURITY CONSIDERATIONS

### 7.1 Authentication & Authorization
- **Backend:** All endpoints require valid JWT with role validation
- **Admin UI:** Route guards check user role before rendering
- **Mobile:** Uses same JWT authentication, different endpoint

### 7.2 Audit Trail
- Every flag change logged to `feature_flag_audit_log`
- Includes: user_id, IP address, user_agent, old/new values
- Immutable audit log (no delete capability)

### 7.3 Rate Limiting
- Admin endpoint: 100 requests/hour per user
- Mobile endpoint: No rate limit (widely called on app startup)

### 7.4 Data Validation
- Flag keys: Alphanumeric + underscore only, 5-50 chars
- Scope/category: Validated against allowed enum values
- COUNCIL_ADMIN scope restrictions enforced server-side

---

## 8. CACHING STRATEGY

### 8.1 Redis Keys
- `feature_flag::{flag_key}`  Flag enabled/disabled status (TTL: 1 min)
- `feature_flags:council::{council_id}`  All flags for council (TTL: 1 min)
- `feature_flags:all`  All global flags (TTL: 1 min)

### 8.2 Cache Invalidation
- On flag update: Invalidate related keys (flag + council/global)
- On flag delete: Invalidate immediately
- TTL: 1 minute for Redis cache

### 8.3 Mobile Caching
- Mobile app caches flags locally (AsyncStorage / SharedPreferences)
- Refresh TTL: 1 hour (every app launch)
- Fallback: Use cached value if API unavailable

---

## 9. MONITORING & ALERTS

### 9.1 Metrics
- Flag evaluation latency (< 10ms target)
- Cache hit rate (target: > 95%)
- Audit log growth rate
- Feature flag update frequency

### 9.2 Alerts
- Flag update failure
- Cache invalidation delay (> 1 min)
- Audit log write failure
- Suspicious flag changes (bulk updates)

---

## 10. MIGRATION & DEPLOYMENT

### 10.1 Database Migration
```bash
# Using Flyway/Liquibase
migration/
 V1__Create_feature_flags_schema.sql
 V2__Create_audit_log_table.sql
 V3__Insert_default_flags.sql
```

### 10.2 Deployment Checklist
- [ ] Database migrations applied
- [ ] Backend services deployed
- [ ] Redis cluster configured
- [ ] Admin portal deployed
- [ ] Mobile clients updated
- [ ] Monitoring/alerting configured
- [ ] Documentation updated

---

## 11. API EXAMPLES

### 11.1 Java Spring Boot Implementation

```java
@RestController
@RequestMapping("/api/v1/feature-flags")
@RequiredArgsConstructor
@Transactional
public class FeatureFlagController {

 private final FeatureFlagService service;
 private final FeatureFlagAuditService auditService;

 @GetMapping
 @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'COUNCIL_ADMIN')")
 public ResponseEntity<?> listFlags(
 @RequestParam(required = false) String scope,
 @RequestParam(required = false) UUID councilId,
 @RequestParam(required = false) String category,
 @RequestParam(defaultValue = "0") int page,
 @RequestParam(defaultValue = "20") int limit
 ) {
 List<FeatureFlag> flags = service.listFlags(scope, councilId, category, page, limit);
 return ResponseEntity.ok(flags);
 }

 @PostMapping
 @PreAuthorize("hasRole('SYSTEM_ADMIN')")
 public ResponseEntity<?> createFlag(@Valid @RequestBody CreateFlagRequest request) {
 FeatureFlag flag = service.createFlag(request);
 auditService.logCreate(flag, getCurrentUser());
 return ResponseEntity.status(201).body(flag);
 }

 @PutMapping("/{flagId}")
 @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'COUNCIL_ADMIN')")
 public ResponseEntity<?> updateFlag(
 @PathVariable UUID flagId,
 @Valid @RequestBody UpdateFlagRequest request
 ) {
 FeatureFlag oldFlag = service.getFlag(flagId);
 FeatureFlag updatedFlag = service.updateFlag(flagId, request);
 auditService.logUpdate(oldFlag, updatedFlag, getCurrentUser());
 return ResponseEntity.ok(updatedFlag);
 }

 @GetMapping("/mobile/evaluate")
 @PreAuthorize("isAuthenticated()")
 public ResponseEntity<?> evaluateForMobile(
 @RequestParam(required = false) UUID councilId
 ) {
 Map<String, Boolean> flags = service.evaluateForMobile(councilId);
 return ResponseEntity.ok(Map.of(
 "flags", flags,
 "cache_ttl", 3600,
 "last_updated", Instant.now()
 ));
 }
}
```

---

## 12. NEXT STEPS

1. **Create backend schema & services**
2. **Implement REST controllers**
3. **Build admin portal pages & components**
4. **Create mobile client integration**
5. **Write comprehensive tests**
6. **Deploy to staging for QA**
7. **Monitor for issues & optimize**

---

**Document Status:** Implementation-Ready
**Last Updated:** December 2025
**Owner:** Engineering Team
