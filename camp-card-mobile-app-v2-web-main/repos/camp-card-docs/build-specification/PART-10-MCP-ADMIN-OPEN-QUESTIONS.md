# BSA Camp Card Digitalization Program
## Build Specification  Part 10: MCP Admin Server & Open Questions

**Document Version:** 1.0
**Date:** December 23, 2025
**Status:** Implementation-Ready

---

## 1. MCP ADMIN SERVER OVERVIEW

### 1.1 Introduction to Model Context Protocol (MCP)

**What is MCP?**
The Model Context Protocol is an open standard that enables AI assistants (like Claude, ChatGPT, etc.) to securely connect to external data sources and tools. MCP servers expose a set of "tools" that AI agents can invoke to perform actions or retrieve information.

**Camp Card Use Case:**
The **MCP Admin Server** acts as an AI-powered operations layer, allowing authorized administrators to:
- Query system data using natural language ("How many active subscriptions does Central Florida Council have?")
- Perform administrative tasks ("Create a new merchant for Pizza Palace in Orlando")
- Generate reports ("Export last month's revenue by troop")
- Troubleshoot issues ("Why is Scout #12345's dashboard not updating?")
- Monitor system health ("Show me all failed payments in the last 24 hours")

**Benefits:**
- **Faster Operations:** Natural language queries instead of navigating multiple dashboards
- **Reduced Training Burden:** New admins can ask questions instead of reading documentation
- **Proactive Monitoring:** AI can surface insights ("Council X has 20% higher churn than average")
- **Audit Trail:** All AI actions logged with human approval workflows

---

### 1.2 Architecture

```

 AI Client (Claude Desktop, ChatGPT, Custom UI) 
 - Natural language queries from admin 
 - Displays AI responses + tool results 

  MCP Protocol (JSON-RPC over stdio/HTTP)
 

 MCP Admin Server (Node.js/TypeScript) 
 - Authentication & Authorization (JWT verification) 
 - Tool Registry (20+ admin tools) 
 - PII Redaction Layer 
 - Rate Limiting & Audit Logging 

  REST API calls
 

 Camp Card Backend (Spring Boot API) 
 - Standard REST endpoints 
 - RBAC enforcement (SYSTEM_ADMIN, COUNCIL_ADMIN) 
 - Database queries (PostgreSQL) 

```

**Key Components:**

1. **MCP Server (Node.js):**
 - Exposes tools via MCP protocol
 - Translates natural language intent  API calls
 - Manages authentication (API key or JWT)
 - Logs all tool invocations for audit

2. **Tool Definitions:**
 - JSON schemas defining tool parameters
 - Example: `list_subscriptions(council_id, status, limit)`
 - AI uses tool schemas to determine which tool to call

3. **Security Layer:**
 - All tools require authentication
 - Role-based access (SYSTEM_ADMIN sees all councils, COUNCIL_ADMIN sees own council)
 - PII redaction (Scout last names, customer full emails masked)
 - Rate limiting (max 100 tool calls/hour per user)

4. **Audit Logger:**
 - Every tool invocation logged to `audit.mcp_tool_invocations` table
 - Includes: user_id, tool_name, parameters, response, timestamp
 - Retention: 2 years (compliance)

---

## 2. MCP TOOL CATALOG

### 2.1 Council & Troop Management Tools

**Tool: `get_council_summary`**
```typescript
{
 name: "get_council_summary",
 description: "Retrieve summary metrics for a specific council",
 parameters: {
 type: "object",
 properties: {
 council_id: {
 type: "string",
 description: "UUID of the council"
 }
 },
 required: ["council_id"]
 }
}
```

**Implementation:**
```typescript
async function getCouncilSummary(councilId: string): Promise<CouncilSummary> {
 const response = await api.get(`/councils/${councilId}/dashboard`);

 return {
 name: response.data.name,
 active_customers: response.data.active_customers,
 total_revenue: response.data.total_revenue_cents / 100,
 active_troops: response.data.active_troops,
 active_scouts: response.data.active_scouts,
 churn_rate: response.data.churn_rate
 };
}
```

**Example AI Interaction:**
```
Admin: "How is Central Florida Council performing?"

AI: I'll check the council summary for you.
[Calls get_council_summary(council_id="550e8400-...")]

Central Florida Council has:
- 1,243 active customers
- $37,300 total revenue
- 52 active troops
- 487 active scouts
- 5.2% churn rate

The council is performing well, slightly above the national average for churn.
```

---

**Tool: `list_troops`**
```typescript
{
 name: "list_troops",
 description: "List all troops in a council with performance metrics",
 parameters: {
 type: "object",
 properties: {
 council_id: { type: "string" },
 sort_by: {
 type: "string",
 enum: ["name", "revenue", "scouts"],
 default: "revenue"
 },
 limit: { type: "number", default: 10 }
 },
 required: ["council_id"]
 }
}
```

---

**Tool: `create_troop`**
```typescript
{
 name: "create_troop",
 description: "Create a new troop in a council",
 parameters: {
 type: "object",
 properties: {
 council_id: { type: "string" },
 troop_number: { type: "string" },
 troop_name: { type: "string" },
 leader_email: { type: "string" },
 fundraising_goal_cents: { type: "number" }
 },
 required: ["council_id", "troop_number", "troop_name", "leader_email"]
 }
}
```

**Security Note:** Requires COUNCIL_ADMIN or SYSTEM_ADMIN role.

---

### 2.2 Subscription & Customer Tools

**Tool: `search_subscriptions`**
```typescript
{
 name: "search_subscriptions",
 description: "Search for subscriptions by customer email, status, or date range",
 parameters: {
 type: "object",
 properties: {
 council_id: { type: "string" },
 email: { type: "string", optional: true },
 status: {
 type: "string",
 enum: ["ACTIVE", "SUSPENDED", "CANCELED"],
 optional: true
 },
 created_after: { type: "string", format: "date", optional: true },
 limit: { type: "number", default: 20 }
 },
 required: ["council_id"]
 }
}
```

**Example AI Interaction:**
```
Admin: "Find all suspended subscriptions for Central Florida Council in the last 7 days"

AI: I'll search for suspended subscriptions.
[Calls search_subscriptions(council_id="...", status="SUSPENDED", created_after="2025-12-16")]

Found 12 suspended subscriptions:
1. customer@example.com - Suspended on Dec 18 (payment failed)
2. another@example.com - Suspended on Dec 19 (payment failed)
...

Would you like me to export this list or retry the failed payments?
```

---

**Tool: `retry_failed_payment`**
```typescript
{
 name: "retry_failed_payment",
 description: "Manually retry a failed payment for a subscription",
 parameters: {
 type: "object",
 properties: {
 subscription_id: { type: "string" }
 },
 required: ["subscription_id"]
 }
}
```

**Implementation:**
```typescript
async function retryFailedPayment(subscriptionId: string): Promise<PaymentResult> {
 const response = await api.post(`/subscriptions/${subscriptionId}/retry-payment`);

 await logMcpToolInvocation({
 user_id: currentUser.id,
 tool_name: "retry_failed_payment",
 parameters: { subscription_id: subscriptionId },
 response: response.data,
 timestamp: new Date()
 });

 return response.data;
}
```

---

**Tool: `get_customer_details`**
```typescript
{
 name: "get_customer_details",
 description: "Get detailed information about a customer (with PII redaction)",
 parameters: {
 type: "object",
 properties: {
 customer_id: { type: "string" }
 },
 required: ["customer_id"]
 }
}
```

**PII Redaction:**
```typescript
function redactCustomerPii(customer: Customer): RedactedCustomer {
 return {
 id: customer.id,
 email: maskEmail(customer.email), // "j***@example.com"
 first_name: customer.first_name,
 last_name: customer.last_name.charAt(0) + ".", // "Smith"  "S."
 subscription_status: customer.subscription_status,
 total_redemptions: customer.total_redemptions,
 created_at: customer.created_at
 };
}

function maskEmail(email: string): string {
 const [local, domain] = email.split('@');
 return `${local.charAt(0)}${'*'.repeat(local.length - 1)}@${domain}`;
}
```

---

### 2.3 Scout & Referral Tools

**Tool: `get_scout_performance`**
```typescript
{
 name: "get_scout_performance",
 description: "Get performance metrics for a specific Scout",
 parameters: {
 type: "object",
 properties: {
 scout_id: { type: "string" }
 },
 required: ["scout_id"]
 }
}
```

**Output (PII Redacted):**
```json
{
 "scout_id": "uuid-...",
 "first_name": "Emily",
 "last_initial": "R.",
 "troop_number": "101",
 "total_raised_cents": 69000,
 "direct_signups": 18,
 "indirect_signups": 5,
 "total_signups": 23,
 "conversion_rate": 0.425,
 "rank_in_troop": 2
}
```

---

**Tool: `troubleshoot_referral_attribution`**
```typescript
{
 name: "troubleshoot_referral_attribution",
 description: "Debug why a subscription is not attributed to a Scout",
 parameters: {
 type: "object",
 properties: {
 subscription_id: { type: "string" }
 },
 required: ["subscription_id"]
 }
}
```

**Implementation:**
```typescript
async function troubleshootReferralAttribution(subscriptionId: string) {
 const sub = await db.subscriptions.findById(subscriptionId);

 // Check if referral code was provided
 if (!sub.referral_code) {
 return { issue: "NO_REFERRAL_CODE", message: "Subscription has no referral code" };
 }

 // Check if referral code is valid
 const scout = await db.scouts.findByReferralCode(sub.referral_code);
 if (!scout) {
 return { issue: "INVALID_REFERRAL_CODE", message: `Referral code ${sub.referral_code} not found` };
 }

 // Check if attribution exists
 const attribution = await db.referralAttributions.findBySubscriptionId(subscriptionId);
 if (!attribution) {
 return {
 issue: "MISSING_ATTRIBUTION",
 message: "Attribution record not created. Possible webhook failure.",
 suggested_fix: "Call POST /subscriptions/${subscriptionId}/reattribute"
 };
 }

 return { status: "OK", attribution };
}
```

---

### 2.4 Merchant & Offer Tools

**Tool: `list_pending_merchants`**
```typescript
{
 name: "list_pending_merchants",
 description: "List merchants pending approval for a council",
 parameters: {
 type: "object",
 properties: {
 council_id: { type: "string" }
 },
 required: ["council_id"]
 }
}
```

---

**Tool: `approve_merchant`**
```typescript
{
 name: "approve_merchant",
 description: "Approve a pending merchant registration",
 parameters: {
 type: "object",
 properties: {
 merchant_id: { type: "string" },
 approval_notes: { type: "string", optional: true }
 },
 required: ["merchant_id"]
 }
}
```

**Approval Workflow:**
```typescript
async function approveMerchant(merchantId: string, notes?: string) {
 // Update merchant status
 await api.patch(`/merchants/${merchantId}`, { status: "APPROVED" });

 // Send notification to merchant
 await api.post('/notifications/send', {
 recipient_email: merchant.contact_email,
 template: "merchant_approved",
 data: { merchant_name: merchant.business_name }
 });

 // Log approval in audit trail
 await logMcpToolInvocation({
 user_id: currentUser.id,
 tool_name: "approve_merchant",
 parameters: { merchant_id: merchantId, notes },
 response: { status: "APPROVED" },
 timestamp: new Date()
 });

 return { success: true, message: "Merchant approved and notified" };
}
```

---

**Tool: `create_offer`**
```typescript
{
 name: "create_offer",
 description: "Create a new offer for a merchant",
 parameters: {
 type: "object",
 properties: {
 merchant_id: { type: "string" },
 title: { type: "string" },
 description: { type: "string" },
 discount_type: { type: "string", enum: ["PERCENTAGE", "FIXED_AMOUNT", "BOGO"] },
 discount_value: { type: "number" },
 category: { type: "string" },
 valid_from: { type: "string", format: "date" },
 valid_until: { type: "string", format: "date" }
 },
 required: ["merchant_id", "title", "discount_type", "discount_value"]
 }
}
```

---

### 2.5 Reporting & Analytics Tools

**Tool: `generate_revenue_report`**
```typescript
{
 name: "generate_revenue_report",
 description: "Generate a revenue report for a council or troop",
 parameters: {
 type: "object",
 properties: {
 council_id: { type: "string" },
 troop_id: { type: "string", optional: true },
 start_date: { type: "string", format: "date" },
 end_date: { type: "string", format: "date" },
 format: { type: "string", enum: ["JSON", "CSV", "PDF"], default: "JSON" }
 },
 required: ["council_id", "start_date", "end_date"]
 }
}
```

**Example AI Interaction:**
```
Admin: "Generate a PDF revenue report for Central Florida Council for Q4 2025"

AI: I'll generate that report for you.
[Calls generate_revenue_report(council_id="...", start_date="2025-10-01", end_date="2025-12-31", format="PDF")]

Report generated successfully!
- Total revenue: $112,450
- New customers: 3,542
- Churn: 6.8%

Download link: https://reports.campcard.org/cfc-q4-2025.pdf (expires in 24 hours)
```

---

**Tool: `get_churn_analysis`**
```typescript
{
 name: "get_churn_analysis",
 description: "Analyze churn patterns for a council",
 parameters: {
 type: "object",
 properties: {
 council_id: { type: "string" },
 cohort_month: { type: "string", format: "YYYY-MM", optional: true }
 },
 required: ["council_id"]
 }
}
```

**Output:**
```json
{
 "council_id": "550e8400-...",
 "overall_churn_rate": 0.068,
 "churn_by_cohort": [
 { "month": "2025-10", "churn_rate": 0.052 },
 { "month": "2025-11", "churn_rate": 0.071 },
 { "month": "2025-12", "churn_rate": 0.083 }
 ],
 "top_churn_reasons": [
 { "reason": "payment_failed", "count": 45 },
 { "reason": "no_value", "count": 23 },
 { "reason": "moved_away", "count": 12 }
 ],
 "recommendations": [
 "Payment failure rate is high. Consider adding payment retry reminders.",
 "Customer surveys indicate offer quality concerns. Add more merchant partners."
 ]
}
```

---

### 2.6 System Health & Troubleshooting Tools

**Tool: `get_system_health`**
```typescript
{
 name: "get_system_health",
 description: "Get current system health metrics (API, database, Kafka)",
 parameters: {
 type: "object",
 properties: {}
 }
}
```

**Output:**
```json
{
 "api": {
 "status": "healthy",
 "uptime": 0.998,
 "avg_latency_ms": 125,
 "error_rate": 0.002
 },
 "database": {
 "status": "healthy",
 "connections": 234,
 "cpu_utilization": 0.45,
 "storage_used_gb": 187
 },
 "kafka": {
 "status": "healthy",
 "consumer_lag": 45,
 "topics_healthy": 6
 },
 "redis": {
 "status": "healthy",
 "memory_used_mb": 1024,
 "hit_rate": 0.92
 }
}
```

---

**Tool: `search_error_logs`**
```typescript
{
 name: "search_error_logs",
 description: "Search CloudWatch logs for errors",
 parameters: {
 type: "object",
 properties: {
 log_group: { type: "string", default: "/aws/ec2/campcard-api" },
 severity: { type: "string", enum: ["ERROR", "WARN", "INFO"] },
 search_term: { type: "string", optional: true },
 start_time: { type: "string", format: "datetime" },
 limit: { type: "number", default: 50 }
 },
 required: ["start_time"]
 }
}
```

**Example AI Interaction:**
```
Admin: "Are there any errors in the last hour?"

AI: I'll check the error logs.
[Calls search_error_logs(severity="ERROR", start_time="2025-12-23T13:00:00Z")]

Found 3 errors in the last hour:
1. [13:15] NullPointerException in ReferralService.createAttribution (scout_id was null)
2. [13:42] Stripe webhook signature verification failed (invalid signature)
3. [13:58] Database connection timeout (connection pool exhausted)

The database connection issue is concerning. Would you like me to check the current connection count?
```

---

**Tool: `restart_service`**
```typescript
{
 name: "restart_service",
 description: "Trigger a rolling restart of API instances (requires approval)",
 parameters: {
 type: "object",
 properties: {
 confirmation: {
 type: "boolean",
 description: "Must be true to confirm restart"
 }
 },
 required: ["confirmation"]
 }
}
```

**Security:** This tool requires SYSTEM_ADMIN role + multi-factor authentication.

---

### 2.7 POS & Claim Link Tools

**Tool: `list_pending_claims`**
```typescript
{
 name: "list_pending_claims",
 description: "List all pending (unclaimed) POS claim links",
 parameters: {
 type: "object",
 properties: {
 council_id: { type: "string", optional: true },
 troop_id: { type: "string", optional: true },
 expired: { type: "boolean", default: false }
 }
 }
}
```

---

**Tool: `resend_claim_link`**
```typescript
{
 name: "resend_claim_link",
 description: "Resend a claim link via email or SMS",
 parameters: {
 type: "object",
 properties: {
 entitlement_id: { type: "string" },
 method: { type: "string", enum: ["EMAIL", "SMS"] }
 },
 required: ["entitlement_id", "method"]
 }
}
```

---

**Tool: `void_claim_link`**
```typescript
{
 name: "void_claim_link",
 description: "Void an unclaimed claim link (e.g., if customer didn't receive it)",
 parameters: {
 type: "object",
 properties: {
 entitlement_id: { type: "string" },
 reason: { type: "string" }
 },
 required: ["entitlement_id", "reason"]
 }
}
```

---

## 3. MCP SERVER IMPLEMENTATION

### 3.1 Technology Stack

**Runtime:** Node.js 20 LTS
**Language:** TypeScript 5.x
**MCP SDK:** `@modelcontextprotocol/sdk`
**HTTP Client:** `axios`
**Authentication:** JWT (shared with main API)
**Logging:** Winston (JSON format to CloudWatch)

### 3.2 Project Structure

**Note:** The MCP Admin Server would be deployed as a standalone repository, separate from backend, mobile, and web. In a multi-repository architecture, it would have its own CI/CD pipeline and deployment process.

```
/mcp-admin-server
 /src
  /tools
   council.tools.ts
   subscription.tools.ts
   scout.tools.ts
   merchant.tools.ts
   reporting.tools.ts
   system.tools.ts
  /middleware
   auth.middleware.ts
   rateLimit.middleware.ts
   audit.middleware.ts
  /services
   api.service.ts (calls Spring Boot API)
   pii.service.ts (redaction logic)
   audit.service.ts (logs to database)
  /types
   tools.types.ts
  server.ts (MCP server entry point)
  config.ts
 package.json
 tsconfig.json
 README.md
```

### 3.3 Sample Implementation

**File: `src/server.ts`**
```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
 ListToolsRequestSchema,
 CallToolRequestSchema
} from '@modelcontextprotocol/sdk/types.js';

import { toolRegistry } from './tools/index.js';
import { authMiddleware } from './middleware/auth.middleware.js';
import { auditLogger } from './services/audit.service.js';

const server = new Server(
 {
 name: 'campcard-admin-server',
 version: '1.0.0',
 },
 {
 capabilities: {
 tools: {},
 },
 }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
 return {
 tools: toolRegistry.map(tool => ({
 name: tool.name,
 description: tool.description,
 inputSchema: tool.inputSchema,
 })),
 };
});

// Execute tool
server.setRequestHandler(CallToolRequestSchema, async (request) => {
 const { name, arguments: args } = request.params;

 // Authenticate request
 const user = await authMiddleware(request);

 // Find tool
 const tool = toolRegistry.find(t => t.name === name);
 if (!tool) {
 throw new Error(`Tool not found: ${name}`);
 }

 // Check authorization
 if (tool.requiredRole && !user.roles.includes(tool.requiredRole)) {
 throw new Error(`Insufficient permissions for tool: ${name}`);
 }

 // Execute tool
 const result = await tool.execute(args, user);

 // Log to audit trail
 await auditLogger.log({
 user_id: user.id,
 tool_name: name,
 parameters: args,
 response: result,
 timestamp: new Date(),
 });

 return {
 content: [
 {
 type: 'text',
 text: JSON.stringify(result, null, 2),
 },
 ],
 };
});

// Start server
async function main() {
 const transport = new StdioServerTransport();
 await server.connect(transport);
 console.error('Camp Card MCP Admin Server running on stdio');
}

main().catch(console.error);
```

---

**File: `src/tools/council.tools.ts`**
```typescript
import { Tool } from '../types/tools.types.js';
import { apiService } from '../services/api.service.js';

export const getCouncilSummaryTool: Tool = {
 name: 'get_council_summary',
 description: 'Retrieve summary metrics for a specific council',
 requiredRole: 'COUNCIL_ADMIN',
 inputSchema: {
 type: 'object',
 properties: {
 council_id: {
 type: 'string',
 description: 'UUID of the council',
 },
 },
 required: ['council_id'],
 },
 execute: async (args, user) => {
 // Enforce tenant isolation: council_id must match user's council
 if (user.council_id !== args.council_id && user.role !== 'SYSTEM_ADMIN') {
 throw new Error('Unauthorized: Cannot access other council data');
 }

 const response = await apiService.get(`/councils/${args.council_id}/dashboard`, {
 headers: {
 Authorization: `Bearer ${user.jwt}`,
 },
 });

 return response.data;
 },
};

export const listTroopsTool: Tool = {
 name: 'list_troops',
 description: 'List all troops in a council with performance metrics',
 requiredRole: 'COUNCIL_ADMIN',
 inputSchema: {
 type: 'object',
 properties: {
 council_id: { type: 'string' },
 sort_by: {
 type: 'string',
 enum: ['name', 'revenue', 'scouts'],
 default: 'revenue'
 },
 limit: { type: 'number', default: 10 },
 },
 required: ['council_id'],
 },
 execute: async (args, user) => {
 if (user.council_id !== args.council_id && user.role !== 'SYSTEM_ADMIN') {
 throw new Error('Unauthorized');
 }

 const response = await apiService.get(`/councils/${args.council_id}/troops`, {
 params: {
 sort: args.sort_by,
 limit: args.limit,
 },
 headers: { Authorization: `Bearer ${user.jwt}` },
 });

 return response.data;
 },
};
```

---

**File: `src/services/pii.service.ts`**
```typescript
export class PiiRedactionService {

 maskEmail(email: string): string {
 const [local, domain] = email.split('@');
 if (local.length <= 2) {
 return `${local.charAt(0)}*@${domain}`;
 }
 return `${local.charAt(0)}${'*'.repeat(local.length - 1)}@${domain}`;
 }

 maskLastName(lastName: string): string {
 return `${lastName.charAt(0)}.`;
 }

 redactScout(scout: Scout): RedactedScout {
 return {
 id: scout.id,
 first_name: scout.first_name,
 last_initial: this.maskLastName(scout.last_name || ''),
 troop_id: scout.troop_id,
 referral_code: scout.referral_code,
 total_raised_cents: scout.total_raised_cents,
 // Omit: parent_email, parent_phone
 };
 }

 redactCustomer(customer: Customer): RedactedCustomer {
 return {
 id: customer.id,
 email: this.maskEmail(customer.email),
 first_name: customer.first_name,
 last_initial: this.maskLastName(customer.last_name || ''),
 subscription_status: customer.subscription_status,
 // Omit: phone, full address
 };
 }
}

export const piiRedactionService = new PiiRedactionService();
```

---

### 3.4 Deployment

**Hosting:** AWS Lambda (serverless, pay-per-invocation)
**Trigger:** API Gateway (HTTP endpoint) or direct stdio connection
**Configuration:**
```yaml
# AWS Lambda Function
FunctionName: campcard-mcp-admin-server
Runtime: nodejs20.x
Handler: dist/server.handler
MemorySize: 512
Timeout: 30
Environment:
 API_BASE_URL: https://api.campcard.org
 JWT_SECRET: ${SSM:/campcard/jwt-secret}
 AUDIT_DB_HOST: ${SSM:/campcard/db-host}
```

**Alternative Deployment:** Docker container on ECS Fargate (if long-running WebSocket connections needed)

---

## 4. SECURITY & GOVERNANCE

### 4.1 Authentication

**JWT-Based:**
- MCP server validates JWT issued by main API
- JWT includes: user_id, council_id, role, permissions
- Expired tokens rejected (15-min access token TTL)

**API Key (Alternative):**
- For programmatic access (CI/CD, scripts)
- Scoped to specific tools (e.g., read-only access)
- Rotated every 90 days

### 4.2 Authorization

**Role-Based Access Control (RBAC):**
| Tool | SYSTEM_ADMIN | COUNCIL_ADMIN | TROOP_LEADER |
|------|--------------|---------------|--------------|
| `get_council_summary` |  All councils |  Own council |  |
| `list_troops` |  All councils |  Own council |  |
| `create_troop` |  |  |  |
| `approve_merchant` |  |  |  |
| `restart_service` |  (MFA required) |  |  |
| `search_error_logs` |  |  |  |

### 4.3 Rate Limiting

**Limits:**
- 100 tool calls/hour per user
- 10 tool calls/minute per user
- Burst: 20 calls in 10 seconds

**Implementation (Redis):**
```typescript
async function rateLimitCheck(userId: string): Promise<boolean> {
 const hourKey = `rate_limit:hour:${userId}`;
 const minKey = `rate_limit:min:${userId}`;

 const hourCount = await redis.incr(hourKey);
 if (hourCount === 1) await redis.expire(hourKey, 3600);

 const minCount = await redis.incr(minKey);
 if (minCount === 1) await redis.expire(minKey, 60);

 if (hourCount > 100 || minCount > 10) {
 throw new Error('Rate limit exceeded');
 }

 return true;
}
```

### 4.4 Audit Logging

**All Tool Invocations Logged:**
```sql
CREATE TABLE audit.mcp_tool_invocations (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id UUID NOT NULL REFERENCES users(id),
 tool_name VARCHAR(100) NOT NULL,
 parameters JSONB,
 response JSONB,
 response_time_ms INT,
 error TEXT,
 timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_mcp_tool_user ON audit.mcp_tool_invocations(user_id, timestamp DESC);
CREATE INDEX idx_mcp_tool_name ON audit.mcp_tool_invocations(tool_name, timestamp DESC);
```

**Retention:** 2 years (compliance requirement)

**Alerts:**
- Spike in tool usage (> 50 calls/min)  Security team notified
- Failed authorization attempts (> 10/hour)  Account flagged
- High-privilege tools used (restart_service)  Instant Slack alert

---

## 5. AI ASSISTANT INTEGRATION

### 5.1 Claude Desktop Configuration

**File: `~/Library/Application Support/Claude/claude_desktop_config.json`**
```json
{
 "mcpServers": {
 "campcard-admin": {
 "command": "node",
 "args": [
 "/path/to/mcp-admin-server/dist/server.js"
 ],
 "env": {
 "API_BASE_URL": "https://api.campcard.org",
 "JWT_TOKEN": "your-admin-jwt-token-here"
 }
 }
 }
}
```

**Usage:**
1. Open Claude Desktop
2. Start conversation
3. Claude automatically has access to MCP tools
4. User asks: "How many active subscriptions does Central Florida Council have?"
5. Claude calls `get_council_summary` tool
6. Claude presents results in natural language

---

### 5.2 Custom Admin Dashboard (Optional)

**Web-Based MCP Client:**
- Next.js application with chat interface
- Uses MCP SDK to communicate with server
- Authentication via OAuth (SSO)
- Displays tool results in rich UI (tables, charts)

**Features:**
- Natural language queries in chat
- Suggested prompts (common tasks)
- Tool approval workflow (for destructive actions)
- Export conversation history

**Example UI:**
```

 Camp Card AI Admin Assistant 

 You: Show me all suspended subscriptions in CFC 
 
 AI: I found 12 suspended subscriptions. Here's 
 the breakdown: 
 
  
  Email  Suspended On  
  
  j***@example.com  Dec 18, 2025  
  a***@example.com  Dec 19, 2025  
  
 
 Would you like me to retry the failed 
 payments or export this list? 
 
 [Retry All] [Export CSV] [Show Details] 

```

---

## 6. OPEN QUESTIONS & DECISIONS NEEDED

### 6.1 Product & Business Model

**Q1: Pricing Strategy**
- **Question:** Should annual vs. monthly pricing be fixed ($29.99 vs. $3.99) or council-configurable?
- **Options:**
 - A. Fixed national pricing (simplicity, consistency)
 - B. Council-configurable (flexibility, but complexity)
- **Recommendation:** Start with A (fixed), add B in V2 if councils request it
- **Decision Needed By:** MVP (Week 4)

**Q2: Referral Incentives**
- **Question:** Should Scouts receive rewards/prizes for hitting milestones (e.g., 10 sales, 50 sales)?
- **Options:**
 - A. Digital badges/certificates only (low cost)
 - B. Physical prizes (camping gear, gift cards) funded by councils
 - C. Monetary credit toward camp fees
- **Recommendation:** A for MVP, B as optional council feature in V1
- **Decision Needed By:** MVP (Week 8)

**Q3: Customer Referral Rewards**
- **Question:** Should customers get discounts for referring other customers?
- **Options:**
 - A. No customer referral rewards (keep it simple, Scout-focused)
 - B. $5 off renewal for each referral (viral growth, but impacts revenue)
 - C. Non-monetary rewards (bonus offers, exclusive merchants)
- **Recommendation:** A for MVP/V1, test B in V2 pilot
- **Decision Needed By:** V2 (Week 30)

**Q4: Merchant Revenue Share**
- **Question:** Do merchants pay to participate (listing fee, per-redemption fee)?
- **Options:**
 - A. Free for merchants (attract more partners, councils pay platform costs)
 - B. $99/year listing fee (offset costs)
 - C. $0.25/redemption fee (pay-per-use)
- **Recommendation:** A for MVP/V1 (focus on merchant acquisition), revisit in V2
- **Decision Needed By:** V1 (Week 18)

---

### 6.2 Technical Architecture

**Q5: Database Scaling Strategy**
- **Question:** At what point do we introduce read replicas or switch to distributed database?
- **Options:**
 - A. Single RDS instance until 100,000 customers, then add read replicas
 - B. Read replicas from day 1 (over-engineering for MVP)
 - C. Migrate to Aurora Serverless v2 (auto-scaling, but higher cost)
- **Recommendation:** A (cost-effective, YAGNI principle)
- **Decision Needed By:** V1 (Week 20, before load testing)

**Q6: Real-Time Dashboard Updates**
- **Question:** Use WebSockets for real-time dashboard updates or polling?
- **Options:**
 - A. WebSocket (server push, real-time, complex infrastructure)
 - B. Polling every 30-60 sec (simpler, good enough for most use cases)
 - C. Server-Sent Events (SSE) - middle ground
- **Recommendation:** B for MVP/V1, A in V2 if user feedback demands it
- **Decision Needed By:** MVP (Week 10)

**Q7: Mobile Offline Mode**
- **Question:** Full offline mode with sync or basic caching?
- **Options:**
 - A. Full offline CRUD (complex, requires conflict resolution)
 - B. Read-only offline (cache offers, redemption history)
 - C. No offline mode (require internet)
- **Recommendation:** B for V2, C for MVP/V1
- **Decision Needed By:** V2 (Week 32)

**Q8: Geofencing Backend**
- **Question:** Use device-side geofencing or server-side proximity checks?
- **Options:**
 - A. Device-side (iOS/Android geofence APIs, low server load)
 - B. Server-side (periodic location uploads, more control)
- **Recommendation:** A (lower infrastructure costs, better battery life)
- **Decision Needed By:** V1 (Week 19)

---

### 6.3 Security & Privacy

**Q9: COPPA Compliance - Age Verification**
- **Question:** How do we verify Scouts are under 13 (COPPA requirement)?
- **Options:**
 - A. Troop leader attests Scout age at registration
 - B. Require parent to enter Scout's birthdate (more PII)
 - C. Use grade level as proxy (grades K-8 assume under 13)
- **Recommendation:** C (minimal PII, practical)
- **Decision Needed By:** MVP (Week 6, before troop leader training)

**Q10: Data Retention for Deleted Scouts**
- **Question:** When parent requests Scout data deletion, what do we retain?
- **Options:**
 - A. Hard delete everything (GDPR-compliant, but lose fundraising history)
 - B. Anonymize PII, retain aggregated troop totals (balance privacy + reporting)
 - C. Soft delete with 30-day grace period (allow undo)
- **Recommendation:** B (aligns with GDPR "right to erasure" + business needs)
- **Decision Needed By:** MVP (Week 7, before privacy policy finalized)

**Q11: Multi-Factor Authentication (MFA)**
- **Question:** Require MFA for all admins or optional?
- **Options:**
 - A. Required for SYSTEM_ADMIN only
 - B. Required for SYSTEM_ADMIN + COUNCIL_ADMIN
 - C. Optional for all users (user choice)
- **Recommendation:** A for MVP, B in V1
- **Decision Needed By:** MVP (Week 5)

---

### 6.4 User Experience

**Q12: Scout Dashboard Access**
- **Question:** How do Scouts (ages 5-14) access their dashboard?
- **Options:**
 - A. Parent logs in with their account, views Scout dashboard (current plan)
 - B. Scout has read-only login (email + simple password)
 - C. Public link with token (no login required, less secure)
- **Recommendation:** A (COPPA-compliant, parent oversight)
- **Decision Needed By:** MVP (Week 9, before Scout features built)
- **Validation Needed:** Usability testing with parents + Scouts (ages 10-14)

**Q13: Offer Redemption Validation**
- **Question:** Who validates redemptions - merchant or customer self-reports?
- **Options:**
 - A. Merchant validates (show code, merchant confirms) - prevents fraud
 - B. Customer self-reports (honor system, simpler UX) - higher fraud risk
 - C. Hybrid (self-report for online offers, merchant validates for in-store)
- **Recommendation:** A (prevents abuse, better merchant trust)
- **Decision Needed By:** V1 (Week 21)

**Q14: Redemption Code Expiry**
- **Question:** How long should temporary redemption codes be valid?
- **Options:**
 - A. 10 minutes (current plan, prevents sharing)
 - B. 1 hour (more flexible, but higher fraud risk)
 - C. No expiry (until used once)
- **Recommendation:** A (balance UX + fraud prevention)
- **Decision Needed By:** V1 (Week 22)
- **Validation Needed:** User testing (does 10 min feel rushed?)

---

### 6.5 Operational

**Q15: Customer Support Strategy**
- **Question:** In-house support team or outsource to third-party?
- **Options:**
 - A. In-house (1-2 FTEs, better quality, higher cost)
 - B. Outsource to BSA National support team (leverage existing infrastructure)
 - C. Hybrid (Tier 1 outsourced, Tier 2+ in-house)
- **Recommendation:** C (cost-effective, quality tier-2 support)
- **Decision Needed By:** V1 (Week 24, before beta expansion)

**Q16: Incident Response SLA**
- **Question:** What's the SLA for P0 incidents (e.g., payment system down)?
- **Options:**
 - A. 4-hour response, 24-hour resolution
 - B. 1-hour response, 8-hour resolution (aggressive)
 - C. Best-effort (no formal SLA for MVP)
- **Recommendation:** A for V1+, C for MVP
- **Decision Needed By:** V1 (Week 16, before production launch)

**Q17: Merchant Onboarding Process**
- **Question:** Should merchant registration be self-service or council-initiated?
- **Options:**
 - A. Self-service (merchant applies, council approves)
 - B. Council-initiated only (council recruits merchants directly)
 - C. Both options available
- **Recommendation:** C (flexibility for different council strategies)
- **Decision Needed By:** V1 (Week 17)

---

### 6.6 MCP-Specific Questions

**Q18: AI Tool Approval Workflow**
- **Question:** Should destructive MCP tools (restart_service, delete_merchant) require human approval?
- **Options:**
 - A. Yes, all destructive tools prompt "Are you sure? Type YES to confirm"
 - B. No, trust the admin (faster, but riskier)
 - C. Two-person approval (admin proposes, another admin approves)
- **Recommendation:** A for V2 (when MCP launched)
- **Decision Needed By:** V2 (Week 35)

**Q19: MCP PII Redaction Level**
- **Question:** How much PII should be redacted in MCP tool responses?
- **Options:**
 - A. Full redaction (emails masked, no phone numbers, no addresses)
 - B. Partial redaction (emails masked, but show full name if needed for support)
 - C. No redaction for SYSTEM_ADMIN (full data access)
- **Recommendation:** A for COUNCIL_ADMIN, C for SYSTEM_ADMIN
- **Decision Needed By:** V2 (Week 34)

---

## 7. IMPLEMENTATION ROADMAP FOR MCP SERVER

### 7.1 Phase 1: Core Tools (V2, Weeks 29-32)

**Deliverables:**
- [ ] MCP server scaffolding (Node.js + TypeScript)
- [ ] Authentication middleware (JWT validation)
- [ ] Audit logging service (PostgreSQL integration)
- [ ] 5 core tools implemented:
 - `get_council_summary`
 - `list_subscriptions`
 - `search_subscriptions`
 - `get_scout_performance`
 - `generate_revenue_report`
- [ ] PII redaction service
- [ ] Rate limiting (Redis)

**Testing:**
- Unit tests for each tool (80% coverage)
- Integration tests with live API (staging environment)
- Security audit (penetration testing)

---

### 7.2 Phase 2: Advanced Tools (V2, Weeks 33-36)

**Deliverables:**
- [ ] 10 additional tools:
 - Merchant management (approve, create offer)
 - Troubleshooting (search_error_logs, troubleshoot_referral_attribution)
 - System health (get_system_health)
 - POS tools (list_pending_claims, resend_claim_link)
- [ ] Multi-factor authentication for high-privilege tools
- [ ] Tool approval workflow (destructive actions)

---

### 7.3 Phase 3: AI Integration (V2, Weeks 37-40)

**Deliverables:**
- [ ] Claude Desktop integration (config file, documentation)
- [ ] Custom admin dashboard (Next.js chat UI)
- [ ] Tool usage analytics (which tools used most, by whom)
- [ ] User feedback system (thumbs up/down on AI responses)

---

### 7.4 Phase 4: Optimization & Scaling (V2, Weeks 41-44)

**Deliverables:**
- [ ] Performance optimization (tool response time < 2 sec)
- [ ] Caching layer for expensive queries (Redis)
- [ ] Deployment automation (CI/CD for Lambda)
- [ ] Documentation (admin guide, tool reference)

---

## 8. SUCCESS METRICS FOR MCP SERVER

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Tool Adoption Rate** | 50% of admins use MCP tools weekly | Analytics tracking |
| **Time Saved** | 30% reduction in admin task completion time | User survey (before/after) |
| **Accuracy** | 95% of AI responses correct (no hallucinations) | Manual review of 100 random interactions |
| **User Satisfaction** | 4.5/5.0 rating | In-app feedback |
| **Tool Response Time** | p95 < 2 seconds | CloudWatch metrics |
| **Security Incidents** | 0 unauthorized data access via MCP | Audit log review |

---

## 9. FINAL SUMMARY

### 9.1 Complete Specification Deliverables

**Part 1: Executive Summary**
-  Stakeholder model (5 roles, multi-tenant hierarchy)
-  Success metrics and KPIs
-  Youth safety constraints (COPPA compliance)

**Part 2: User Journeys**
-  End-to-end flows for all 5 stakeholder roles
-  110 functional requirements (P0/P1/P2 prioritized)
-  Critical POS purchase + claim link flow

**Part 3: Architecture**
-  Complete EC2-based infrastructure (VPC, RDS, Redis, Kafka, ALB)
-  CI/CD pipeline (CodePipeline, blue/green deployment)
-  Cost estimation (~$4,700/month production)

**Part 4: Data Model**
-  39 production tables with DDL
-  Referral attribution algorithm (preserves root Scout)
-  Anti-fraud safeguards (depth limits, rate limiting)

**Part 5: API Specifications**
-  41 REST endpoints with request/response schemas
-  6 Kafka topics with event schemas
-  Third-party POS integration APIs

**Part 6: Reporting & Dashboards**
-  Dashboard layouts for all 5 roles
-  Metrics definitions with SQL/API mappings
-  Export/print functionality

**Part 7: UX/UI & Design System**
-  Complete design token specification (colors, spacing, typography)
-  Component library (Button, Card, Input, etc.)
-  Age-appropriate UX patterns (ages 5-14)
-  WCAG 2.1 AA accessibility guidelines

**Part 8: Security, Privacy & Youth Protections**
-  OWASP Top 10 mitigation strategies
-  COPPA, GDPR, CCPA compliance
-  PCI DSS payment security (via Stripe)
-  Penetration testing requirements
-  Incident response plan

**Part 9: Implementation Plan**
-  44-week timeline (MVP  V1  V2)
-  7 epics with detailed user stories
-  Comprehensive testing strategy
-  Three-phase rollout (pilot  beta  GA)
-  Risk management and success metrics

**Part 10: MCP Admin Server & Open Questions**
-  MCP architecture and tool catalog (20+ tools)
-  Security, audit logging, PII redaction
-  AI assistant integration (Claude Desktop)
-  19 open questions with recommendations
-  Implementation roadmap for MCP server

---

### 9.2 Next Steps

**Immediate (Week 1-2):**
1. Review all 10 parts with stakeholders (BSA National, council leads)
2. Prioritize open questions (Q1-Q19) for decision-making
3. Finalize MVP scope (green-light user stories)
4. Assign team roles (hire if needed)

**Short-Term (Week 3-4):**
1. Provision dev/staging AWS infrastructure
2. Set up CI/CD pipeline
3. Create Figma design system file
4. Kickoff sprint planning (first 2-week sprint)

**Medium-Term (Week 5-16):**
1. Execute MVP development (Epics 1-3)
2. Weekly sprint reviews + retrospectives
3. Begin pilot council onboarding preparation
4. Conduct security audits

**Long-Term (Week 17-44):**
1. V1 development (POS integration, geo offers)
2. V2 development (analytics, customer referrals, MCP server)
3. Beta expansion  General availability
4. Post-launch optimization and feature roadmap

---

### 9.3 Critical Success Factors

1. **Youth Safety First:** COPPA compliance non-negotiable, minimal Scout PII collection
2. **Multi-Tenant Isolation:** RLS + authorization checks prevent cross-council data leaks
3. **Referral Attribution Accuracy:** Root Scout preservation is core to fundraising model
4. **POS Integration Reliability:** Claim links must work 99.9% of the time (troop leader trust)
5. **Merchant Quality:** 10+ merchants/council minimum for customer value proposition
6. **Scout Activation Rate:** 60%+ parental consent required for program viability
7. **Customer Retention:** < 8% churn rate needed for sustainable revenue

---

### 9.4 Risk Mitigation Summary

**Technical Risks:**
- Load testing before each launch (MVP, V1, V2)
- Penetration testing (external firm) before V1/V2
- Backup restoration tested monthly

**Product Risks:**
- A/B testing for conversion optimization
- Weekly churn analysis + retention campaigns
- Merchant recruitment playbook

**Operational Risks:**
- Knowledge documentation (architecture, runbooks)
- Monthly AWS cost reviews
- Sprint retrospectives every 2 weeks

---

## 10. CONCLUSION

This **10-part build specification** provides a **complete, implementation-ready blueprint** for the BSA Camp Card Digitalization Program. All critical aspects have been addressed:

 **Product Requirements:** User journeys, functional requirements, dashboards
 **Technical Architecture:** EC2 infrastructure, data model, APIs, security
 **Design System:** Age-appropriate UX, WCAG AA accessibility, responsive patterns
 **Implementation Plan:** 44-week roadmap, epics, user stories, testing strategy
 **Security & Privacy:** OWASP compliance, COPPA/GDPR/CCPA, PCI DSS
 **Rollout Strategy:** Pilot  Beta  GA with success metrics
 **AI Operations:** MCP Admin Server with 20+ tools, audit logging, PII redaction

**The specification is ready for immediate handoff to the engineering team.**

**Remaining Actions:**
1. **Stakeholder sign-off** on scope and timeline
2. **Decision-making** on 19 open questions (prioritize Q1, Q2, Q9, Q12)
3. **Team assembly** (hire/assign 7 FTEs + 3 contractors)
4. **Infrastructure provisioning** (AWS accounts, CI/CD setup)
5. **Sprint 0 kickoff** (January 6, 2026)

**Estimated Total Investment:** $1,127,500 (development) + $726,500/year (operations)
**Estimated ROI:** $1.5M ARR by V2 launch (50,000 customers @ $30 avg)
**Break-Even:** Month 16 (assuming 40% council adoption, 15% conversion rate)

---

**END OF BUILD SPECIFICATION**

*Document prepared by: Virtual Product + Engineering Team*
*Date: December 23, 2025*
*Version: 1.0 (Final)*
