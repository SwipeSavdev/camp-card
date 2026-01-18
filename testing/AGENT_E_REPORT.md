# Agent E Report: Contract Testing Engineer

**Project:** Camp Card Fundraising Platform
**Agent:** Agent E - Contract Testing Engineer
**Date:** January 2026
**Status:** Complete

## Executive Summary

Created comprehensive API contract tests validating request/response schemas, RBAC enforcement, error handling, and enum value compliance. Tests extend the Testcontainers integration test infrastructure from Agent D.

## Infrastructure Created

### 1. AbstractContractTest Base Class

**Location:** `backend/src/test/java/com/bsa/campcard/contract/AbstractContractTest.java`

| Feature | Implementation |
|---------|----------------|
| Base Class | Extends AbstractIntegrationTest |
| MockMvc | Auto-configured for API testing |
| ObjectMapper | For JSON serialization |
| Helper Methods | GET, POST, PUT, DELETE, PATCH requests |
| Auth Helpers | Token extraction from responses |

**Key Methods:**
```java
getRequest(String url)                    // Unauthenticated GET
getRequest(String url, String token)      // Authenticated GET
postRequest(String url, Object body)      // Unauthenticated POST
postRequest(String url, Object body, String token)  // Authenticated POST
putRequest(String url, Object body, String token)   // Authenticated PUT
deleteRequest(String url, String token)   // Authenticated DELETE
patchRequest(String url, Object body, String token) // Authenticated PATCH
extractToken(MvcResult result)            // Extract JWT from response
```

## Contract Tests Created

### AuthContractTest

**Location:** `backend/src/test/java/com/bsa/campcard/contract/AuthContractTest.java`
**Test Count:** 18 tests

| Endpoint | Tests | Validations |
|----------|-------|-------------|
| POST /auth/login | 5 | Response schema, required fields, email format, 401 for invalid |
| POST /auth/register | 4 | Response schema, required fields, password min length, 409 duplicate |
| POST /auth/refresh | 2 | Token refresh, required field |
| GET /auth/me | 2 | Profile schema, 401 without token |
| POST /auth/forgot-password | 3 | Success message, security (no email enumeration) |
| POST /auth/change-password | 1 | 401 without auth |
| POST /auth/logout | 1 | 204 on success |

**AuthResponse Schema Validated:**
```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "tokenType": "Bearer",
  "expiresIn": "number",
  "user": {
    "id": "uuid",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "enum",
    "emailVerified": "boolean"
  }
}
```

### UserContractTest

**Location:** `backend/src/test/java/com/bsa/campcard/contract/UserContractTest.java`
**Test Count:** 15 tests

| Endpoint | Tests | Validations |
|----------|-------|-------------|
| GET /users | 4 | Pagination schema, size param, 401, 403 |
| GET /users/{id} | 2 | User schema, 404 |
| POST /users | 2 | Create user, 403 for non-admin |
| PUT /users/{id} | 2 | Update user, 404 |
| DELETE /users/{id} | 3 | Delete user, 404, 403 |
| GET /users/search | 2 | Search results, required param |
| UserRole enum | 1 | All 5 valid roles accepted |

**Pagination Schema Validated:**
```json
{
  "content": [],
  "pageable": {},
  "totalElements": "number",
  "totalPages": "number",
  "size": "number",
  "number": "number"
}
```

**UserRole Enum Values Tested:**
- NATIONAL_ADMIN
- COUNCIL_ADMIN
- UNIT_LEADER
- PARENT
- SCOUT

### CouncilContractTest

**Location:** `backend/src/test/java/com/bsa/campcard/contract/CouncilContractTest.java`
**Test Count:** 14 tests

| Endpoint | Tests | Validations |
|----------|-------|-------------|
| GET /councils | 5 | Pagination, search, status filter, region filter |
| GET /councils/{id} | 3 | By ID, UUID, council number |
| POST /councils | 3 | Create, validation, 403 |
| PUT /councils/{id} | 1 | Update |
| DELETE /councils/{id} | 2 | Delete, 403 |
| GET /councils/stats | 1 | Stats schema |
| CouncilStatus enum | 1 | All 4 valid statuses |

**CouncilStatus Enum Values Tested:**
- ACTIVE
- INACTIVE
- SUSPENDED
- TRIAL

### ErrorResponseContractTest

**Location:** `backend/src/test/java/com/bsa/campcard/contract/ErrorResponseContractTest.java`
**Test Count:** 14 tests

| Error Code | Tests | Scenarios |
|------------|-------|-----------|
| 400 Bad Request | 3 | Missing fields, invalid email, malformed JSON |
| 401 Unauthorized | 4 | No token, invalid token, malformed token, wrong credentials |
| 403 Forbidden | 3 | Non-admin access, create without permission, delete without permission |
| 404 Not Found | 3 | Non-existent user, council by ID, council by UUID |
| 409 Conflict | 1 | Duplicate email registration |
| 415 Unsupported Media Type | 1 | Wrong content type |
| Response Headers | 2 | JSON content type verification |

## Test Commands

```bash
# Run all contract tests
cd backend
./mvnw test -Dtest=*ContractTest

# Run specific contract test
./mvnw test -Dtest=AuthContractTest
./mvnw test -Dtest=UserContractTest
./mvnw test -Dtest=CouncilContractTest
./mvnw test -Dtest=ErrorResponseContractTest

# Run contract tests with verbose output
./mvnw test -Dtest=*ContractTest -X
```

## Files Created

| File | Lines | Purpose |
|------|-------|---------|
| AbstractContractTest.java | 118 | Base test class with helpers |
| AuthContractTest.java | 355 | Auth API contracts |
| UserContractTest.java | 380 | User API contracts |
| CouncilContractTest.java | 290 | Council API contracts |
| ErrorResponseContractTest.java | 255 | Error response contracts |
| **Total** | **~1,398** | |

## Coverage Summary

| API Area | Tests | Status |
|----------|-------|--------|
| Authentication | 18 | ✓ Complete |
| Users | 15 | ✓ Complete |
| Councils | 14 | ✓ Complete |
| Error Responses | 14 | ✓ Complete |
| **Total** | **61** | |

## Schema Compliance Verified

### Request Schemas
- LoginRequest: email (required, valid format), password (required)
- RegisterRequest: email, password (min 8 chars), firstName, lastName (all required)
- RefreshTokenRequest: refreshToken (required)
- CouncilRequest: councilNumber, name, region (all required)
- UserCreateRequest: 10 fields including role enum validation
- UserUpdateRequest: 7 fields for partial updates

### Response Schemas
- AuthResponse: accessToken, refreshToken, tokenType, expiresIn, user object
- UserResponse: id, email, firstName, lastName, role, isActive, emailVerified, timestamps
- CouncilResponse: id, uuid, councilNumber, name, region, status, statistics
- Page<T>: content array, pageable, totalElements, totalPages, size, number

### Enum Validation
- UserRole: NATIONAL_ADMIN, COUNCIL_ADMIN, UNIT_LEADER, PARENT, SCOUT
- CouncilStatus: ACTIVE, INACTIVE, SUSPENDED, TRIAL

## RBAC Contract Tests

| Endpoint | NATIONAL_ADMIN | COUNCIL_ADMIN | UNIT_LEADER | PARENT | SCOUT |
|----------|----------------|---------------|-------------|--------|-------|
| GET /users | ✓ | ✗ | ✗ | ✗ | ✗ |
| POST /users | ✓ | ✓ | ✗ | ✗ | ✗ |
| DELETE /users | ✓ | ✗ | ✗ | ✗ | ✗ |
| POST /councils | ✓ | ✓ | ✗ | ✗ | ✗ |
| DELETE /councils | ✓ | ✗ | ✗ | ✗ | ✗ |

## OpenAPI Integration

The existing project configuration includes:
- `springdoc-openapi-starter-webmvc-ui` version 2.3.0
- OpenAPI configuration in `org.bsa.campcard.config.OpenApiConfig`
- Swagger UI at `http://localhost:7010/swagger-ui.html`
- OpenAPI spec at `http://localhost:7010/v3/api-docs`

Controllers already annotated with:
- `@Tag` for API grouping
- `@Operation` for endpoint descriptions
- `@ApiResponse` for response documentation
- `@Parameter` for parameter descriptions
- `@SecurityRequirement` for auth requirements

## Recommendations

1. **Add OpenAPI Spec Export**: Configure automatic export of OpenAPI YAML to `backend/src/main/resources/openapi.yaml`

2. **Consumer-Driven Contracts**: Consider Pact or Spring Cloud Contract for frontend-backend contract testing

3. **Expand Coverage**: Add contract tests for:
   - Merchant endpoints
   - Offer endpoints
   - Subscription endpoints
   - Campaign endpoints

4. **Schema Validation**: Add JSON Schema validation using `json-schema-validator` library

5. **Breaking Change Detection**: Integrate OpenAPI diff tools in CI/CD to detect API changes

## Dependencies Used

All dependencies pre-configured in `pom.xml`:

| Dependency | Version | Purpose |
|------------|---------|---------|
| Spring Boot Test | 3.2.x | Test framework |
| MockMvc | 6.x | API testing |
| Testcontainers | 1.19.3 | Database isolation |
| springdoc-openapi | 2.3.0 | OpenAPI generation |
| AssertJ | 3.x | Fluent assertions |

## Next Steps (Remaining Agent Tasks)

1. **Agent F - E2E Tests**: Playwright golden path tests
2. **Agent G - Load Tests**: k6 performance scenarios
3. **Agent H - CI/CD Gating**: GitHub Actions pipeline
