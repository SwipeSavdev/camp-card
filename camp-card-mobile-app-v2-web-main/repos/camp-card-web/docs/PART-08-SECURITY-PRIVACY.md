# BSA Camp Card Digitalization Program
## Build Specification  Part 8: Security, Privacy & Youth Protections

**Document Version:** 1.0
**Date:** December 23, 2025
**Status:** Implementation-Ready

---

## 1. SECURITY OVERVIEW

### 1.1 Security Posture

**Threat Model:**
- **Assets:** Scout PII (minimal), customer payment data, merchant business data, subscription revenue
- **Threat Actors:** External attackers, malicious insiders, compromised third-party integrations
- **Attack Vectors:** API exploitation, SQL injection, XSS, CSRF, credential stuffing, tenant isolation breaches
- **Impact:** Data breach, financial loss, reputational damage, regulatory fines, loss of youth trust

**Security Principles:**
1. **Defense in Depth:** Multiple layers of security controls
2. **Least Privilege:** Minimize access rights for users, services, and processes
3. **Zero Trust:** Verify every request, assume breach
4. **Data Minimization:** Collect only essential data (especially for Scouts)
5. **Encryption Everywhere:** Data at rest, in transit, and in use
6. **Audit Everything:** Comprehensive logging for accountability

### 1.2 Compliance Requirements

| Regulation | Applicability | Key Requirements |
|------------|---------------|------------------|
| **COPPA** (Children's Online Privacy Protection Act) | Scouts ages 5-14 | Parental consent, minimal data collection, no behavioral advertising |
| **GDPR** (General Data Protection Regulation) | EU customers/councils | Right to access, erasure, portability, consent management |
| **CCPA** (California Consumer Privacy Act) | California residents | Data disclosure, opt-out of sale, deletion requests |
| **PCI DSS** (Payment Card Industry) | Credit card processing | Tokenization, no card storage, secure transmission |
| **SOC 2 Type II** | Enterprise customers | Security, availability, confidentiality controls |

---

## 2. OWASP TOP 10 MITIGATION

### 2.1 A01: Broken Access Control

**Threats:**
- Horizontal privilege escalation (customer accessing another customer's data)
- Vertical privilege escalation (customer accessing admin functions)
- **Multi-tenant isolation breach** (Council A accessing Council B data)

**Mitigations:**

**1. Row-Level Security (RLS) in PostgreSQL:**
```sql
-- Enable RLS on all multi-tenant tables
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own council's data
CREATE POLICY tenant_isolation_policy ON subscriptions
 USING (council_id = current_setting('app.current_council_id')::uuid);

-- Application sets council_id from JWT on every connection
SET app.current_council_id = '550e8400-e29b-41d4-a716-446655440000';
```

**2. JWT Claims Validation:**
```java
@Service
public class TenantContextService {

 public void setTenantContext(JwtAuthenticationToken auth) {
 Map<String, Object> claims = auth.getTokenAttributes();

 String councilId = (String) claims.get("council_id");
 String role = (String) claims.get("role");

 // Validate council_id is present for non-SYSTEM_ADMIN
 if (!"SYSTEM_ADMIN".equals(role) && councilId == null) {
 throw new AccessDeniedException("Missing tenant context");
 }

 // Store in thread-local context
 TenantContext.setCouncilId(councilId);
 TenantContext.setRole(role);
 }

 @PreAuthorize("hasRole('COUNCIL_ADMIN') and @tenantAuth.hasAccess(#councilId)")
 public void updateCouncil(String councilId, CouncilUpdateRequest request) {
 // Business logic
 }
}
```

**3. Authorization Checks:**
```java
@Component("tenantAuth")
public class TenantAuthorizationService {

 public boolean hasAccess(String resourceCouncilId) {
 String userCouncilId = TenantContext.getCouncilId();
 String role = TenantContext.getRole();

 // SYSTEM_ADMIN can access any council
 if ("SYSTEM_ADMIN".equals(role)) {
 return true;
 }

 // Other roles: council_id must match
 return resourceCouncilId.equals(userCouncilId);
 }

 public boolean canAccessScout(String scoutId) {
 Scout scout = scoutRepository.findById(scoutId)
 .orElseThrow(() -> new NotFoundException("Scout not found"));

 return hasAccess(scout.getCouncilId());
 }
}
```

**4. API Gateway Enforcement:**
```yaml
# ALB Request Routing Rules
- path: /api/councils/{councilId}/*
 authorization:
 - extract councilId from path
 - validate JWT claim council_id matches {councilId}
 - reject if mismatch (403 Forbidden)
```

**Test Cases:**
- [ ] Verify Council A admin cannot GET `/api/councils/{councilB}/troops`
- [ ] Verify customer cannot POST `/api/admin/merchants`
- [ ] Verify Scout parent cannot access another Scout's dashboard
- [ ] Verify SYSTEM_ADMIN can access all councils

---

### 2.2 A02: Cryptographic Failures

**Threats:**
- Exposure of Scout PII (names, parent emails)
- Exposure of customer payment data
- Exposure of JWT secrets, API keys, database credentials

**Mitigations:**

**1. Encryption at Rest:**
```yaml
# RDS PostgreSQL
- Storage: Encrypted with AWS KMS (AES-256)
- Key: Customer-managed CMK with rotation enabled
- Backups: Encrypted with same CMK

# ElastiCache Redis
- Encryption: At-rest enabled
- Auth Token: Required for all connections

# S3 (for file uploads, exports)
- Default Encryption: SSE-S3 (AES-256)
- Sensitive exports: SSE-KMS with customer CMK
```

**2. Encryption in Transit:**
```yaml
# All HTTP traffic: TLS 1.3 only
- ALB Listener: HTTPS (443) with ACM certificate
- Minimum TLS Version: 1.3
- Cipher Suites: TLS_AES_128_GCM_SHA256, TLS_AES_256_GCM_SHA384

# Internal traffic (ALB  EC2):
- Option 1: End-to-end TLS (Spring Boot HTTPS)
- Option 2: Private VPC subnet (no internet route), HTTP acceptable

# Database connections:
- PostgreSQL: require_ssl=true, sslmode=verify-full
- Redis: TLS enabled, auth token required

# Kafka (MSK):
- Encryption: TLS in-transit
- Authentication: IAM or SASL/SCRAM
```

**3. Secrets Management:**
```java
@Configuration
public class SecretsConfig {

 @Bean
 public DataSource dataSource() {
 // Retrieve DB credentials from Secrets Manager
 SecretsManagerClient client = SecretsManagerClient.create();

 GetSecretValueRequest request = GetSecretValueRequest.builder()
 .secretId("prod/campcard/db-credentials")
 .build();

 GetSecretValueResponse response = client.getSecretValue(request);
 String secretJson = response.secretString();

 DbCredentials creds = parseCredentials(secretJson);

 HikariConfig config = new HikariConfig();
 config.setJdbcUrl(creds.getUrl());
 config.setUsername(creds.getUsername());
 config.setPassword(creds.getPassword());
 config.addDataSourceProperty("ssl", "true");

 return new HikariDataSource(config);
 }
}
```

**4. Credential Rotation:**
```yaml
# AWS Secrets Manager Rotation
- DB Master Password: Rotate every 90 days
- Redis Auth Token: Rotate every 90 days
- JWT Signing Key: Rotate every 180 days (with grace period)
- API Keys (third-party): Manual rotation annually

# Rotation Lambda
- Trigger: EventBridge schedule (every 90 days)
- Function: Update secret, update RDS password, restart API instances
- Rollback: If health check fails, revert to previous secret
```

**5. Password Hashing:**
```java
@Service
public class PasswordService {
 private final PasswordEncoder encoder = new BCryptPasswordEncoder(12);

 public String hashPassword(String plaintext) {
 // BCrypt with cost factor 12 (2^12 iterations)
 return encoder.encode(plaintext);
 }

 public boolean verifyPassword(String plaintext, String hashed) {
 return encoder.matches(plaintext, hashed);
 }
}
```

**6. Sensitive Data Redaction (Logs):**
```java
@Slf4j
public class AuditLogger {

 public void logPiiAccess(String userId, String scoutId, String field) {
 // Log PII access without exposing actual values
 log.info("PII_ACCESS user={} scout={} field={} timestamp={}",
 userId,
 scoutId,
 field,
 Instant.now());
 }

 public void logPayment(Payment payment) {
 // Redact sensitive fields
 log.info("PAYMENT_CREATED id={} amount={} status={} last4={}",
 payment.getId(),
 payment.getAmountCents(),
 payment.getStatus(),
 payment.getCardLast4()); // Only last 4 digits
 }
}
```

**Test Cases:**
- [ ] Verify RDS snapshots are encrypted
- [ ] Verify Redis AUTH required (connection fails without token)
- [ ] Verify TLS 1.2 connections rejected (only 1.3 allowed)
- [ ] Verify logs do not contain plaintext passwords, full credit card numbers

---

### 2.3 A03: Injection (SQL, NoSQL, Command)

**Threats:**
- SQL injection via user inputs (email, name, search queries)
- Command injection in report generation, file exports

**Mitigations:**

**1. Parameterized Queries (JPA/Hibernate):**
```java
@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {

 // Safe: JPA Query Methods (auto-parameterized)
 List<Subscription> findByCouncilIdAndStatus(UUID councilId, SubscriptionStatus status);

 // Safe: JPQL with named parameters
 @Query("SELECT s FROM Subscription s WHERE s.councilId = :councilId AND s.customerEmail LIKE :email")
 List<Subscription> searchByEmail(@Param("councilId") UUID councilId, @Param("email") String email);

 // NEVER: String concatenation
 // @Query("SELECT s FROM Subscription s WHERE s.email = '" + email + "'") // VULNERABLE!
}
```

**2. Input Validation:**
```java
@RestController
@Validated
public class SubscriptionController {

 @PostMapping("/subscriptions")
 public ResponseEntity<Subscription> create(@Valid @RequestBody CreateSubscriptionRequest request) {
 // @Valid triggers JSR-303 validation
 return ResponseEntity.ok(subscriptionService.create(request));
 }
}

@Data
public class CreateSubscriptionRequest {
 @NotBlank(message = "Email is required")
 @Email(message = "Invalid email format")
 @Size(max = 255)
 private String email;

 @NotNull
 @Pattern(regexp = "^[a-zA-Z0-9-]{8}$", message = "Invalid referral code format")
 private String referralCode;

 @NotNull
 @Positive
 private Long planId;
}
```

**3. Whitelist Validation (File Exports):**
```java
public class ReportService {
 private static final Set<String> ALLOWED_FORMATS = Set.of("CSV", "PDF", "XLSX");
 private static final Pattern SAFE_FILENAME = Pattern.compile("^[a-zA-Z0-9_-]+$");

 public byte[] generateReport(String councilId, String format, String filename) {
 // Validate format
 if (!ALLOWED_FORMATS.contains(format.toUpperCase())) {
 throw new ValidationException("Invalid format: " + format);
 }

 // Validate filename (no path traversal)
 if (!SAFE_FILENAME.matcher(filename).matches()) {
 throw new ValidationException("Invalid filename");
 }

 // Safe to proceed
 return switch (format.toUpperCase()) {
 case "CSV" -> generateCsv(councilId, filename);
 case "PDF" -> generatePdf(councilId, filename);
 case "XLSX" -> generateExcel(councilId, filename);
 default -> throw new IllegalStateException();
 };
 }
}
```

**4. Prevent Command Injection:**
```java
// NEVER: Shell execution with user input
Runtime.getRuntime().exec("convert " + userFilename + " output.pdf"); // VULNERABLE!

// Use library APIs instead
import com.itextpdf.text.Document;
import com.itextpdf.text.pdf.PdfWriter;

public byte[] convertToPdf(InputStream input) {
 // Use library API, not shell commands
 Document document = new Document();
 ByteArrayOutputStream output = new ByteArrayOutputStream();
 PdfWriter.getInstance(document, output);
 // ... conversion logic
 return output.toByteArray();
}
```

**Test Cases:**
- [ ] SQL injection: Submit `email=' OR '1'='1`  Should fail validation
- [ ] Path traversal: Submit `filename=../../etc/passwd`  Should reject
- [ ] Command injection: Submit `format=CSV; rm -rf /`  Should fail whitelist
- [ ] XSS in search: Submit `<script>alert('xss')</script>`  Should be escaped in output

---

### 2.4 A04: Insecure Design

**Threats:**
- Insufficient anti-fraud controls (referral click spam, fake sign-ups)
- Missing rate limiting (account enumeration, brute force)
- POS claim token reuse/interception

**Mitigations:**

**1. Rate Limiting (Redis Token Bucket):**
```java
@Component
public class RateLimiter {
 @Autowired
 private RedisTemplate<String, String> redis;

 public boolean allowRequest(String userId, String action, int maxRequests, Duration window) {
 String key = "rate_limit:" + action + ":" + userId;

 Long current = redis.opsForValue().increment(key);

 if (current == 1) {
 // First request: Set TTL
 redis.expire(key, window);
 }

 return current <= maxRequests;
 }
}

@RestController
public class AuthController {
 @Autowired
 private RateLimiter rateLimiter;

 @PostMapping("/auth/login")
 public ResponseEntity<?> login(@RequestBody LoginRequest request, HttpServletRequest httpRequest) {
 String ipAddress = httpRequest.getRemoteAddr();

 // Rate limit: 5 login attempts per IP per 15 minutes
 if (!rateLimiter.allowRequest(ipAddress, "login", 5, Duration.ofMinutes(15))) {
 return ResponseEntity.status(429).body("Too many login attempts. Try again later.");
 }

 // Proceed with authentication
 return authService.login(request);
 }
}
```

**2. Anti-Fraud: Referral Click Spam Prevention:**
```java
@Service
public class ReferralService {

 public void trackClick(String referralCode, String ipAddress, String userAgent) {
 // Check if same IP clicked this link in last 24 hours
 String dedupeKey = "click_dedupe:" + referralCode + ":" + ipAddress;

 if (redis.opsForValue().get(dedupeKey) != null) {
 // Duplicate click: Record but don't count toward metrics
 log.warn("DUPLICATE_CLICK referral={} ip={}", referralCode, ipAddress);
 return;
 }

 // Record click
 referralEventRepository.save(new ReferralEvent(referralCode, ipAddress, userAgent));

 // Set dedupe window
 redis.opsForValue().set(dedupeKey, "1", Duration.ofHours(24));
 }
}
```

**3. POS Claim Token Security:**
```java
@Service
public class EntitlementService {

 public String generateClaimToken() {
 // Cryptographically secure random token
 SecureRandom random = new SecureRandom();
 byte[] bytes = new byte[16];
 random.nextBytes(bytes);

 String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);

 // Format: CLM-XXXXXXXX (URL-safe, 11 chars after prefix)
 return "CLM-" + token.substring(0, 11).toUpperCase();
 }

 public void claimEntitlement(String claimToken, String customerEmail) {
 Entitlement ent = entitlementRepository.findByClaimToken(claimToken)
 .orElseThrow(() -> new NotFoundException("Invalid claim token"));

 // Validate not expired
 if (ent.getExpiresAt().isBefore(Instant.now())) {
 throw new BusinessException("Claim token expired");
 }

 // Validate not already claimed
 if (ent.getStatus() == EntitlementStatus.CLAIMED) {
 throw new BusinessException("Claim token already used");
 }

 // One-time use: Mark as claimed
 ent.setStatus(EntitlementStatus.CLAIMED);
 ent.setClaimedAt(Instant.now());
 ent.setCustomerEmail(customerEmail);
 entitlementRepository.save(ent);

 // Create subscription
 subscriptionService.createFromEntitlement(ent);
 }
}
```

**4. Captcha for Public Endpoints:**
```java
@PostMapping("/pos/entitlements/{claimToken}/claim")
public ResponseEntity<?> claimEntitlement(
 @PathVariable String claimToken,
 @RequestBody ClaimRequest request) {

 // Verify reCAPTCHA v3 token
 if (!captchaService.verify(request.getCaptchaToken(), "claim_entitlement")) {
 return ResponseEntity.status(400).body("Captcha verification failed");
 }

 entitlementService.claimEntitlement(claimToken, request.getEmail());
 return ResponseEntity.ok().build();
}
```

**Test Cases:**
- [ ] Login rate limit: 6th attempt within 15 min returns HTTP 429
- [ ] Referral click spam: Same IP clicking 100x only counts as 1 click
- [ ] Claim token reuse: 2nd claim attempt returns 400 error
- [ ] Expired claim token: Claim after 7 days returns 400 error

---

### 2.5 A05: Security Misconfiguration

**Threats:**
- Default credentials left unchanged
- Unnecessary services exposed (SSH, database ports)
- Debug mode enabled in production
- Verbose error messages leaking system details

**Mitigations:**

**1. Infrastructure Hardening:**
```yaml
# Security Groups (least privilege)
ALB-SG:
 Inbound:
 - Port 443 (HTTPS) from 0.0.0.0/0
 Outbound:
 - Port 8080 (HTTP) to API-Instance-SG

API-Instance-SG:
 Inbound:
 - Port 8080 from ALB-SG only
 - Port 22 (SSH) from Bastion-SG only (emergency access)
 Outbound:
 - Port 5432 to RDS-SG
 - Port 6379 to Redis-SG
 - Port 9092 to MSK-SG
 - Port 443 to 0.0.0.0/0 (AWS APIs, external APIs)

RDS-SG:
 Inbound:
 - Port 5432 from API-Instance-SG only
 Outbound:
 - None

# IMDSv2 Enforcement (EC2 instances)
- HttpTokens: required
- HttpPutResponseHopLimit: 1
```

**2. Application Configuration:**
```yaml
# application-prod.yml (Spring Boot)
spring:
 profiles:
 active: prod

 # Disable debug mode
 devtools:
 enabled: false

 # Disable H2 console
 h2:
 console:
 enabled: false

 # Restrict actuator endpoints
 management:
 endpoints:
 web:
 exposure:
 include: health,metrics
 base-path: /actuator
 endpoint:
 health:
 show-details: never # Don't leak internal details

 # Secure headers
 mvc:
 throw-exception-if-no-handler-found: true

 # Disable stack traces in error responses
 server:
 error:
 include-stacktrace: never
 include-message: never
```

**3. HTTP Security Headers:**
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

 @Bean
 public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
 http.headers(headers -> headers
 .contentSecurityPolicy(csp -> csp
 .policyDirectives("default-src 'self'; script-src 'self' 'unsafe-inline' https://www.google.com/recaptcha/; img-src 'self' data: https:; style-src 'self' 'unsafe-inline';"))
 .xssProtection(xss -> xss.headerValue(XXssProtectionHeaderWriter.HeaderValue.ENABLED_MODE_BLOCK))
 .frameOptions(frame -> frame.deny())
 .httpStrictTransportSecurity(hsts -> hsts
 .maxAgeInSeconds(31536000)
 .includeSubDomains(true)
 .preload(true))
 .referrerPolicy(referrer -> referrer.policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
 .permissionsPolicy(permissions -> permissions
 .policy("geolocation=(self), microphone=(), camera=()"))
 );

 return http.build();
 }
}
```

**4. Error Handling (No Information Leakage):**
```java
@ControllerAdvice
public class GlobalExceptionHandler {

 @ExceptionHandler(Exception.class)
 public ResponseEntity<ErrorResponse> handleGenericException(Exception ex) {
 // Log full exception server-side
 log.error("Unexpected error", ex);

 // Return generic message to client (don't leak stack traces)
 ErrorResponse error = new ErrorResponse(
 "INTERNAL_ERROR",
 "An unexpected error occurred. Please try again later.",
 UUID.randomUUID().toString() // Request ID for support
 );

 return ResponseEntity.status(500).body(error);
 }

 @ExceptionHandler(ValidationException.class)
 public ResponseEntity<ErrorResponse> handleValidationException(ValidationException ex) {
 // Safe to expose validation errors
 ErrorResponse error = new ErrorResponse(
 "VALIDATION_ERROR",
 ex.getMessage(),
 null
 );

 return ResponseEntity.status(400).body(error);
 }
}
```

**Test Cases:**
- [ ] Verify SSH port 22 not accessible from internet
- [ ] Verify RDS port 5432 not accessible from internet
- [ ] Verify `/actuator/env` returns 404 (not exposed)
- [ ] Verify error responses don't contain stack traces
- [ ] Verify security headers present (HSTS, CSP, X-Frame-Options)

---

### 2.6 A06: Vulnerable and Outdated Components

**Mitigations:**

**1. Dependency Scanning (Maven):**
```xml
<!-- pom.xml -->
<build>
 <plugins>
 <!-- OWASP Dependency Check -->
 <plugin>
 <groupId>org.owasp</groupId>
 <artifactId>dependency-check-maven</artifactId>
 <version>8.4.0</version>
 <executions>
 <execution>
 <goals>
 <goal>check</goal>
 </goals>
 </execution>
 </executions>
 <configuration>
 <failBuildOnCVSS>7</failBuildOnCVSS> <!-- Fail on High/Critical -->
 </configuration>
 </plugin>
 </plugins>
</build>
```

**2. Automated Updates (Dependabot):**
```yaml
# .github/dependabot.yml
version: 2
updates:
 - package-ecosystem: "maven"
 directory: "/"
 schedule:
 interval: "weekly"
 open-pull-requests-limit: 10

 - package-ecosystem: "npm"
 directory: "/web"
 schedule:
 interval: "weekly"
```

**3. Base Image Updates (Docker):**
```dockerfile
# Use official, minimal base images with regular updates
FROM eclipse-temurin:21-jre-alpine

# Update packages on build
RUN apk update && apk upgrade && rm -rf /var/cache/apk/*

# Run as non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

COPY target/campcard-api.jar /app.jar
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

**4. Patch Management Process:**
- **Weekly:** Automated Dependabot PRs for minor/patch updates
- **Monthly:** Review and apply non-critical CVE patches
- **Immediate:** Emergency patches for critical CVEs (CVSS  9.0)

**Test Cases:**
- [ ] Run `mvn dependency-check:check`  No High/Critical vulnerabilities
- [ ] Run `npm audit`  No High/Critical vulnerabilities
- [ ] Verify all Docker base images < 30 days old

---

### 2.7 A07: Identification and Authentication Failures

**Mitigations:**

**1. Strong Password Policy:**
```java
@Service
public class PasswordValidator {

 private static final int MIN_LENGTH = 12;
 private static final Pattern UPPERCASE = Pattern.compile("[A-Z]");
 private static final Pattern LOWERCASE = Pattern.compile("[a-z]");
 private static final Pattern DIGIT = Pattern.compile("[0-9]");
 private static final Pattern SPECIAL = Pattern.compile("[^A-Za-z0-9]");

 public void validate(String password) {
 List<String> errors = new ArrayList<>();

 if (password.length() < MIN_LENGTH) {
 errors.add("Password must be at least 12 characters");
 }
 if (!UPPERCASE.matcher(password).find()) {
 errors.add("Password must contain uppercase letter");
 }
 if (!LOWERCASE.matcher(password).find()) {
 errors.add("Password must contain lowercase letter");
 }
 if (!DIGIT.matcher(password).find()) {
 errors.add("Password must contain digit");
 }
 if (!SPECIAL.matcher(password).find()) {
 errors.add("Password must contain special character");
 }

 // Check against common password list (Have I Been Pwned API)
 if (isCompromisedPassword(password)) {
 errors.add("Password has been exposed in a data breach");
 }

 if (!errors.isEmpty()) {
 throw new ValidationException(String.join("; ", errors));
 }
 }
}
```

**2. Multi-Factor Authentication (MFA) - Optional but Recommended:**
```java
@Service
public class MfaService {

 public String generateTotpSecret(String userId) {
 // Generate TOTP secret (Time-based One-Time Password)
 String secret = new String(Base32.encode(generateRandomBytes(20)));

 // Store secret encrypted
 userRepository.updateMfaSecret(userId, encryptSecret(secret));

 return secret; // Return to user for QR code setup
 }

 public boolean verifyTotpCode(String userId, String code) {
 User user = userRepository.findById(userId).orElseThrow();
 String secret = decryptSecret(user.getMfaSecret());

 // Verify TOTP code (allows 1 time step for clock skew)
 return TotpUtil.verifyCode(secret, code);
 }
}
```

**3. Session Management:**
```yaml
# JWT Configuration
jwt:
 access-token-ttl: 15m # Short-lived access token
 refresh-token-ttl: 7d # Longer refresh token
 signing-algorithm: RS256 # Asymmetric (public/private key)

# Session Invalidation
- On logout: Blacklist JWT in Redis (until expiry)
- On password change: Invalidate all user sessions
- On suspicious activity: Force re-authentication
```

**4. Account Lockout (Brute Force Protection):**
```java
@Service
public class AccountLockoutService {

 public void recordFailedLogin(String email) {
 String key = "failed_login:" + email;
 Long attempts = redis.opsForValue().increment(key);

 if (attempts == 1) {
 redis.expire(key, Duration.ofMinutes(15));
 }

 if (attempts >= 5) {
 // Lock account for 15 minutes
 userRepository.lockAccount(email, Duration.ofMinutes(15));
 log.warn("ACCOUNT_LOCKED email={} attempts={}", email, attempts);
 }
 }

 public void recordSuccessfulLogin(String email) {
 // Reset failed login counter
 redis.delete("failed_login:" + email);
 }
}
```

**Test Cases:**
- [ ] Weak password rejected (e.g., "password123")
- [ ] Compromised password rejected (via HIBP API)
- [ ] 5 failed logins  Account locked for 15 min
- [ ] JWT with expired timestamp rejected
- [ ] Revoked JWT (blacklisted) rejected

---

### 2.8 A08: Software and Data Integrity Failures

**Mitigations:**

**1. Code Signing (CI/CD Pipeline):**
```yaml
# CodePipeline  CodeBuild
- Fetch source from GitHub (verified commit signature)
- Run Maven build
- Generate artifact checksum (SHA-256)
- Store artifact + checksum in S3
- CodeDeploy verifies checksum before deployment
```

**2. Dependency Integrity (Maven):**
```xml
<!-- Use Maven Central (HTTPS only) -->
<repositories>
 <repository>
 <id>central</id>
 <url>https://repo.maven.apache.org/maven2</url>
 </repository>
</repositories>

<!-- Lock dependency versions -->
<dependencyManagement>
 <dependencies>
 <dependency>
 <groupId>org.springframework.boot</groupId>
 <artifactId>spring-boot-dependencies</artifactId>
 <version>3.2.0</version>
 <type>pom</type>
 <scope>import</scope>
 </dependency>
 </dependencies>
</dependencyManagement>
```

**3. Webhook Signature Verification:**
```java
@Service
public class WebhookService {

 @Value("${stripe.webhook.secret}")
 private String webhookSecret;

 public void handleStripeWebhook(String payload, String signature) {
 // Verify HMAC signature
 String computedSignature = computeHmacSha256(payload, webhookSecret);

 if (!MessageDigest.isEqual(signature.getBytes(), computedSignature.getBytes())) {
 throw new SecurityException("Invalid webhook signature");
 }

 // Process webhook
 processPayload(payload);
 }

 private String computeHmacSha256(String data, String key) {
 try {
 Mac mac = Mac.getInstance("HmacSHA256");
 mac.init(new SecretKeySpec(key.getBytes(), "HmacSHA256"));
 byte[] hash = mac.doFinal(data.getBytes());
 return Hex.encodeHexString(hash);
 } catch (Exception e) {
 throw new RuntimeException("HMAC computation failed", e);
 }
 }
}
```

**Test Cases:**
- [ ] Deploy artifact with tampered checksum  Deployment fails
- [ ] Send webhook with invalid signature  HTTP 401
- [ ] Verify Maven dependencies downloaded over HTTPS only

---

### 2.9 A09: Security Logging and Monitoring Failures

**Mitigations:**

**1. Structured Logging (JSON):**
```java
@Slf4j
@Component
public class SecurityEventLogger {

 public void logAuthSuccess(String userId, String ipAddress) {
 Map<String, Object> event = Map.of(
 "event_type", "AUTH_SUCCESS",
 "user_id", userId,
 "ip_address", ipAddress,
 "timestamp", Instant.now().toString()
 );
 log.info("SECURITY_EVENT {}", toJson(event));
 }

 public void logAuthFailure(String email, String ipAddress, String reason) {
 Map<String, Object> event = Map.of(
 "event_type", "AUTH_FAILURE",
 "email", email,
 "ip_address", ipAddress,
 "reason", reason,
 "timestamp", Instant.now().toString()
 );
 log.warn("SECURITY_EVENT {}", toJson(event));
 }

 public void logPiiAccess(String userId, String scoutId, String field) {
 Map<String, Object> event = Map.of(
 "event_type", "PII_ACCESS",
 "user_id", userId,
 "scout_id", scoutId,
 "field", field,
 "timestamp", Instant.now().toString()
 );
 log.info("SECURITY_EVENT {}", toJson(event));

 // Also write to audit table
 auditLogRepository.save(new AuditLog(userId, "PII_ACCESS", scoutId, field));
 }
}
```

**2. CloudWatch Alarms:**
```yaml
# Critical Security Alerts
- Alarm: FailedLoginSpike
 Metric: Count of AUTH_FAILURE events
 Threshold: > 50 in 5 minutes
 Action: SNS topic  PagerDuty

- Alarm: UnauthorizedAccessAttempt
 Metric: Count of HTTP 403 responses
 Threshold: > 100 in 5 minutes
 Action: SNS topic  Security team

- Alarm: PiiAccessAnomaly
 Metric: Count of PII_ACCESS events per user
 Threshold: > 1000 in 1 hour (potential data exfiltration)
 Action: SNS topic  Security team + auto-disable user

- Alarm: RdsConnectionSpike
 Metric: DatabaseConnections
 Threshold: > 450 (90% of max)
 Action: SNS topic  On-call SRE
```

**3. Log Retention & Immutability:**
```yaml
# CloudWatch Logs
- Retention: 90 days (application logs)
- Retention: 365 days (audit logs, security events)
- Export to S3: After 90 days (Glacier for long-term storage)

# Audit Table (PostgreSQL)
- Partition: Monthly partitions (audit_log_2025_12, audit_log_2026_01, etc.)
- Retention: 7 years (compliance requirement)
- Immutable: No UPDATE or DELETE allowed (INSERT-only, append-only)
```

**Test Cases:**
- [ ] Verify login attempts logged (success + failure)
- [ ] Verify PII access logged to audit table
- [ ] Trigger 403 spike  CloudWatch alarm fires
- [ ] Verify audit logs cannot be deleted (permission denied)

---

### 2.10 A10: Server-Side Request Forgery (SSRF)

**Mitigations:**

**1. URL Validation (Webhook Callbacks):**
```java
@Service
public class WebhookCallbackService {

 private static final Set<String> ALLOWED_HOSTS = Set.of(
 "webhook.stripe.com",
 "api.merchantpartner.com"
 );

 public void sendWebhook(String callbackUrl, String payload) {
 // Parse URL
 URL url;
 try {
 url = new URL(callbackUrl);
 } catch (MalformedURLException e) {
 throw new ValidationException("Invalid callback URL");
 }

 // Validate host against whitelist
 if (!ALLOWED_HOSTS.contains(url.getHost())) {
 throw new SecurityException("Callback URL host not allowed: " + url.getHost());
 }

 // Validate protocol (HTTPS only)
 if (!"https".equals(url.getProtocol())) {
 throw new SecurityException("Only HTTPS callbacks allowed");
 }

 // Send request
 httpClient.post(url, payload);
 }
}
```

**2. Network-Level Protection:**
```yaml
# EC2 Instance Outbound Rules
API-Instance-SG:
 Outbound:
 - Port 5432 to RDS-SG (database)
 - Port 6379 to Redis-SG (cache)
 - Port 443 to 0.0.0.0/0 (external APIs)
 - DENY to 169.254.169.254/32 (AWS metadata service, use IMDSv2 only)
 - DENY to 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16 (internal networks)
```

**Test Cases:**
- [ ] Callback to `http://169.254.169.254/latest/meta-data/`  Rejected
- [ ] Callback to `http://localhost:5432`  Rejected
- [ ] Callback to non-whitelisted host  Rejected

---

## 3. YOUTH DATA PROTECTION (COPPA COMPLIANCE)

### 3.1 COPPA Requirements

**Applicability:** Scouts under age 13
**Key Requirements:**
1. Parental consent before collecting child PII
2. Minimize data collection (only what's necessary)
3. No behavioral advertising or profiling of children
4. Secure data handling
5. Parental access and deletion rights

### 3.2 Data Minimization (Scouts)

**Scout Data Collected:**
```sql
CREATE TABLE scouts (
 id UUID PRIMARY KEY,
 council_id UUID NOT NULL,
 troop_id UUID NOT NULL,

 -- Minimal PII (COPPA-compliant)
 first_name VARCHAR(50) NOT NULL, -- First name only (no last name)
 grade_level INT, -- Optional, for age verification
 parent_email VARCHAR(255) NOT NULL, -- Parent contact (consent)
 parent_phone VARCHAR(20), -- Optional, for POS delivery

 -- Fundraising data
 referral_code VARCHAR(8) UNIQUE NOT NULL,

 -- NO sensitive data (no DOB, SSN, full address, photos)

 created_at TIMESTAMPTZ DEFAULT NOW(),
 updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Data NOT Collected:**
- Last name (use first + last initial for display)
- Date of birth (only grade level)
- Full address (troop address used for geo)
- Photo/profile image
- Email address (Scout does not have login)
- Password (Scout does not have login)
- Browsing behavior, IP addresses

### 3.3 Parental Consent Flow

**Scout Registration (Troop Leader Initiated):**
1. Troop leader adds Scout to roster (minimal info: first name, grade, parent email)
2. System sends **parental consent email**:
 - Explain program purpose
 - List data collected
 - Request explicit consent
 - Provide opt-out link
3. Parent clicks "I Consent" link  Scout account activated
4. Parent can access Scout dashboard (view-only)
5. Parent can request data deletion at any time

**Consent Email Template:**
```
Subject: Parental Consent Required - BSA Camp Card Program

Dear Parent/Guardian,

Your Scout, [First Name], has been enrolled in the Camp Card fundraising
program by Troop Leader [Leader Name].

WHAT WE COLLECT:
- Scout's first name
- Your email address
- Grade level (optional)

HOW WE USE IT:
- Track fundraising progress
- Attribute subscription sales to your Scout
- Send you updates about their progress

YOUR RIGHTS:
- View your Scout's data at any time
- Request deletion of data
- Opt out of the program

To provide consent, click here: [Consent Link]
To opt out, click here: [Opt-Out Link]

Questions? Contact us at privacy@campcard.org
```

### 3.4 Parental Access & Deletion

**Parent Dashboard Access:**
```java
@GetMapping("/parents/scouts/{scoutId}")
@PreAuthorize("@parentAuth.isParentOf(#scoutId)")
public ResponseEntity<ScoutDataResponse> getScoutData(@PathVariable String scoutId) {
 Scout scout = scoutRepository.findById(scoutId).orElseThrow();

 // Return all data in human-readable format
 return ResponseEntity.ok(new ScoutDataResponse(
 scout.getFirstName(),
 scout.getGradeLevel(),
 scout.getParentEmail(),
 scout.getReferralCode(),
 scout.getTotalRaised(),
 scout.getDirectSignups(),
 scout.getIndirectSignups()
 ));
}

@DeleteMapping("/parents/scouts/{scoutId}")
@PreAuthorize("@parentAuth.isParentOf(#scoutId)")
public ResponseEntity<?> deleteScoutData(@PathVariable String scoutId) {
 // Soft delete: Anonymize PII, retain fundraising totals for troop reporting
 Scout scout = scoutRepository.findById(scoutId).orElseThrow();
 scout.setFirstName("Deleted Scout");
 scout.setParentEmail("deleted@privacy.local");
 scout.setParentPhone(null);
 scout.setStatus(ScoutStatus.DELETED);
 scoutRepository.save(scout);

 // Notify troop leader
 notificationService.sendEmail(scout.getTroopLeader().getEmail(),
 "Scout data deletion request processed for [Scout ID]");

 return ResponseEntity.noContent().build();
}
```

**Test Cases:**
- [ ] Scout added without parent consent  Account inactive, no dashboard access
- [ ] Parent consents  Scout account activated
- [ ] Parent requests deletion  PII anonymized, fundraising totals retained
- [ ] Parent can view all Scout data via dashboard

---

## 4. PRIVACY REGULATIONS (GDPR, CCPA)

### 4.1 GDPR Compliance (EU Customers/Councils)

**Key Requirements:**
1. **Lawful Basis:** Consent or contract performance
2. **Right to Access:** Customers can download all their data
3. **Right to Erasure:** Customers can delete their account
4. **Right to Portability:** Export data in machine-readable format
5. **Right to Rectification:** Customers can update incorrect data
6. **Data Processing Agreement (DPA):** With councils as data controllers

**Implementation:**

**Data Export (GDPR Article 15 - Right to Access):**
```java
@GetMapping("/customers/me/export")
public ResponseEntity<Resource> exportMyData(Authentication auth) {
 String customerId = auth.getName();

 // Gather all customer data
 Customer customer = customerRepository.findById(customerId).orElseThrow();
 List<Subscription> subscriptions = subscriptionRepository.findByCustomerId(customerId);
 List<Payment> payments = paymentRepository.findByCustomerId(customerId);
 List<Redemption> redemptions = redemptionRepository.findByCustomerId(customerId);

 // Generate JSON export
 Map<String, Object> export = Map.of(
 "customer", customer,
 "subscriptions", subscriptions,
 "payments", payments,
 "redemptions", redemptions,
 "export_date", Instant.now().toString()
 );

 String json = objectMapper.writeValueAsString(export);

 // Return as downloadable file
 ByteArrayResource resource = new ByteArrayResource(json.getBytes());
 return ResponseEntity.ok()
 .header("Content-Disposition", "attachment; filename=my-data-export.json")
 .contentType(MediaType.APPLICATION_JSON)
 .body(resource);
}
```

**Account Deletion (GDPR Article 17 - Right to Erasure):**
```java
@DeleteMapping("/customers/me")
public ResponseEntity<?> deleteMyAccount(Authentication auth) {
 String customerId = auth.getName();

 // Cancel active subscriptions
 subscriptionService.cancelAllSubscriptions(customerId);

 // Anonymize PII (retain transaction records for accounting)
 Customer customer = customerRepository.findById(customerId).orElseThrow();
 customer.setEmail("deleted-" + UUID.randomUUID() + "@privacy.local");
 customer.setFirstName("Deleted");
 customer.setLastName("User");
 customer.setPhone(null);
 customer.setStatus(CustomerStatus.DELETED);
 customerRepository.save(customer);

 // Blacklist JWT
 jwtBlacklistService.blacklist(auth.getCredentials().toString());

 return ResponseEntity.noContent().build();
}
```

### 4.2 CCPA Compliance (California Residents)

**Key Requirements:**
1. **Right to Know:** What data is collected and how it's used
2. **Right to Delete:** Request deletion of personal information
3. **Right to Opt-Out:** Of data "sale" (not applicable - no data selling)
4. **Non-Discrimination:** Cannot deny service for exercising rights

**Privacy Policy Disclosure:**
```
CALIFORNIA RESIDENTS - YOUR PRIVACY RIGHTS

We collect the following categories of personal information:
- Identifiers (name, email, phone)
- Commercial information (subscription history, payments)
- Geolocation data (approximate location for nearby offers)

We DO NOT sell your personal information to third parties.

You have the right to:
- Request disclosure of data collected
- Request deletion of your data
- Opt-out of data sales (N/A - we don't sell data)

To exercise your rights, email privacy@campcard.org or call 1-800-XXX-XXXX.
```

**Test Cases:**
- [ ] Customer requests data export  JSON file with all data provided
- [ ] Customer requests deletion  Account anonymized within 30 days
- [ ] Privacy policy accessible, includes CCPA disclosures

---

## 5. PAYMENT SECURITY (PCI DSS)

### 5.1 PCI DSS Compliance Strategy

**Approach:** **Outsource to Stripe (SAQ A compliance)**
- Camp Card never touches credit card data
- All payment processing via Stripe Checkout or Stripe Elements
- Stripe is PCI DSS Level 1 certified

**SAQ A Requirements:**
1. Use certified payment processor (Stripe )
2. No card data storage on our servers
3. Secure transmission to processor (HTTPS )
4. Regular security scans

### 5.2 Payment Flow (PCI-Compliant)

**Subscription Purchase:**
```javascript
// Mobile App (React Native)
import { CardField, useStripe } from '@stripe/stripe-react-native';

const SubscriptionScreen = () => {
 const { confirmPayment } = useStripe();

 const handleSubscribe = async () => {
 // 1. Create payment intent on server (returns client_secret)
 const { clientSecret } = await api.post('/subscriptions', {
 plan_id: selectedPlan.id,
 referral_code: referralCode
 });

 // 2. Confirm payment with Stripe (card data never touches our server)
 const { error, paymentIntent } = await confirmPayment(clientSecret, {
 paymentMethodType: 'Card',
 });

 if (error) {
 Alert.alert('Payment failed', error.message);
 } else {
 Alert.alert('Success', 'Subscription activated!');
 }
 };

 return (
 <View>
 <CardField
 postalCodeEnabled={true}
 onCardChange={(cardDetails) => {
 // Card data handled by Stripe SDK only
 }}
 />
 <Button title="Subscribe" onPress={handleSubscribe} />
 </View>
 );
};
```

**Server Side (No Card Data):**
```java
@PostMapping("/subscriptions")
public ResponseEntity<CreateSubscriptionResponse> create(@RequestBody CreateSubscriptionRequest req) {
 // Create Stripe PaymentIntent (Stripe handles card processing)
 PaymentIntent paymentIntent = stripeService.createPaymentIntent(
 req.getPlanId(),
 req.getReferralCode()
 );

 // Return client_secret to mobile app (Stripe confirms payment)
 return ResponseEntity.ok(new CreateSubscriptionResponse(
 paymentIntent.getClientSecret()
 ));
}

// Stripe webhook confirms payment success
@PostMapping("/webhooks/stripe")
public ResponseEntity<?> handleStripeWebhook(@RequestBody String payload,
 @RequestHeader("Stripe-Signature") String signature) {
 Event event = stripeService.verifyWebhook(payload, signature);

 if ("payment_intent.succeeded".equals(event.getType())) {
 PaymentIntent intent = (PaymentIntent) event.getDataObjectDeserializer().getObject().get();

 // Activate subscription (payment confirmed by Stripe)
 subscriptionService.activateSubscription(intent.getMetadata().get("subscription_id"));
 }

 return ResponseEntity.ok().build();
}
```

**Data Stored:**
```sql
CREATE TABLE payments (
 id UUID PRIMARY KEY,
 subscription_id UUID NOT NULL,
 amount_cents BIGINT NOT NULL,
 currency VARCHAR(3) DEFAULT 'USD',

 -- Stripe identifiers (not card data)
 stripe_payment_intent_id VARCHAR(255),
 stripe_payment_method_id VARCHAR(255),

 -- Card metadata (last 4 digits, brand - safe to store)
 card_last4 VARCHAR(4),
 card_brand VARCHAR(20), -- e.g., "visa", "mastercard"

 -- NO full card numbers, CVV, expiration dates

 status VARCHAR(20), -- succeeded, failed, refunded
 created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Test Cases:**
- [ ] Verify no full card numbers in database
- [ ] Verify no card data in application logs
- [ ] Verify Stripe webhook signature validated
- [ ] Verify HTTPS enforced for all payment endpoints

---

## 6. PENETRATION TESTING & SECURITY AUDITS

### 6.1 Penetration Testing Schedule

**Pre-Launch:**
- External penetration test (by certified firm)
- Internal vulnerability scan

**Post-Launch:**
- Quarterly external penetration tests
- Monthly automated vulnerability scans (OWASP ZAP, Burp Suite)
- Annual third-party security audit (SOC 2 Type II)

### 6.2 Scope of Penetration Testing

**In-Scope:**
- Public-facing APIs (authentication, subscriptions, offers, redemptions)
- Admin portal (privilege escalation, IDOR)
- Multi-tenant isolation (cross-council data access)
- POS integration (claim token security)
- Mobile apps (reverse engineering, local storage inspection)

**Out-of-Scope:**
- Social engineering (phishing attacks on users)
- Physical security (data center access)
- Denial of Service (DDoS) attacks

### 6.3 Vulnerability Remediation SLA

| Severity | Example | Remediation Timeline |
|----------|---------|---------------------|
| **Critical** | SQL injection, RCE, auth bypass | 24 hours |
| **High** | XSS, CSRF, tenant isolation breach | 7 days |
| **Medium** | Information disclosure, missing headers | 30 days |
| **Low** | Verbose error messages, outdated libraries | 90 days |

---

## 7. INCIDENT RESPONSE PLAN

### 7.1 Incident Classification

| Level | Definition | Examples |
|-------|------------|----------|
| **P0** | Data breach, system-wide outage | PII exposure, payment system down |
| **P1** | Security vulnerability exploited | Active XSS attack, unauthorized access |
| **P2** | Potential security issue detected | Unusual login patterns, failed auth spike |
| **P3** | Non-critical security finding | Outdated dependency, missing security header |

### 7.2 Response Procedures

**P0/P1 Incident Response:**
1. **Detect & Triage** (5 min)
 - CloudWatch alarm triggers
 - On-call engineer paged
 - Initial assessment of impact

2. **Contain** (30 min)
 - Isolate affected systems (e.g., disable compromised user, block IP)
 - Stop data exfiltration (revoke API keys, rotate secrets)

3. **Investigate** (2 hours)
 - Analyze logs (CloudWatch, audit table)
 - Identify root cause
 - Determine scope (# of users affected)

4. **Remediate** (4 hours)
 - Deploy fix (emergency deployment process)
 - Validate fix in production
 - Re-enable affected services

5. **Notify** (24 hours)
 - Notify affected users (email)
 - Notify councils (if Scout data impacted)
 - Notify regulators (if required by GDPR/CCPA - within 72 hours)

6. **Post-Mortem** (1 week)
 - Document timeline
 - Identify prevention measures
 - Update runbooks

### 7.3 Breach Notification Requirements

**GDPR:** Notify supervisory authority within 72 hours if breach likely results in risk to individuals
**CCPA:** Notify California AG without unreasonable delay
**Internal Policy:** Notify all affected customers within 7 days

---

## 8. SECURITY TRAINING & AWARENESS

### 8.1 Developer Training

**Onboarding (New Engineers):**
- OWASP Top 10 overview
- Secure coding guidelines (input validation, parameterized queries)
- Multi-tenant security best practices
- Youth data handling (COPPA requirements)

**Ongoing (Quarterly):**
- Security brown bags (case studies, recent CVEs)
- Simulated phishing exercises
- Code review best practices

### 8.2 Admin Training

**Council/Troop Admins:**
- Password security (use password managers, enable MFA)
- Recognizing phishing attempts
- Youth data privacy (minimal sharing, secure communication)
- Incident reporting (suspicious activity)

---

## 9. SUMMARY & SECURITY CHECKLIST

### 9.1 Pre-Launch Security Checklist

**Infrastructure:**
- [ ] RDS encryption at rest enabled (KMS)
- [ ] Redis encryption at rest + in-transit enabled
- [ ] TLS 1.3 enforced on ALB
- [ ] Security groups follow least privilege
- [ ] IMDSv2 enforced on EC2 instances
- [ ] Secrets Manager rotation configured (90 days)

**Application:**
- [ ] All API endpoints require authentication (except public claim link)
- [ ] Row-Level Security (RLS) enabled on all multi-tenant tables
- [ ] JWT validation on every request
- [ ] Input validation on all user inputs
- [ ] SQL injection testing passed
- [ ] XSS testing passed
- [ ] CSRF tokens on state-changing operations
- [ ] Rate limiting configured (Redis)
- [ ] Password policy enforced (12+ chars, complexity)
- [ ] Account lockout after 5 failed logins

**Privacy:**
- [ ] Privacy policy published (COPPA, GDPR, CCPA compliant)
- [ ] Parental consent flow implemented for Scouts
- [ ] Data export endpoint functional (GDPR compliance)
- [ ] Account deletion endpoint functional
- [ ] Scout data minimized (no DOB, SSN, photos)

**Compliance:**
- [ ] PCI DSS SAQ A completed (Stripe integration)
- [ ] OWASP Dependency Check passing (no High/Critical CVEs)
- [ ] Security headers configured (HSTS, CSP, X-Frame-Options)
- [ ] Error messages sanitized (no stack traces)
- [ ] Audit logging to immutable table

**Monitoring:**
- [ ] CloudWatch alarms configured (failed logins, 403s, PII access)
- [ ] PagerDuty integration tested
- [ ] Log retention policies set (90 days application, 365 days audit)
- [ ] Security event dashboard created

**Testing:**
- [ ] External penetration test completed
- [ ] Multi-tenant isolation verified (cross-council access blocked)
- [ ] Youth data protections verified (parental consent required)
- [ ] Payment security verified (no card data stored)

### 9.2 Ongoing Security Tasks

**Weekly:**
- Review Dependabot PRs (dependency updates)
- Review CloudWatch security alarms

**Monthly:**
- Run automated vulnerability scan (OWASP ZAP)
- Review audit logs for anomalies
- Rotate non-critical secrets

**Quarterly:**
- External penetration test
- Security training for team
- Review and update incident response plan

**Annually:**
- SOC 2 Type II audit
- Full security architecture review
- Update privacy policy (regulatory changes)

---

**END OF PART 8**

**Next:** Part 9  Implementation Plan & Rollout
