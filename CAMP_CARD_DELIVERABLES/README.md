# 📦 CAMP_CARD — Execution Pack

Complete execution package for Camp Card Fundraising Platform development and testing.

## Overview

Camp Card is a BSA (Boy Scouts of America) fundraising digitalization platform with:
- **Backend**: Java 21 / Spring Boot 3.2 REST API
- **Web Portal**: Next.js 14.1 Admin Dashboard
- **Mobile App**: React Native 0.81 / Expo 54

**Production URL**: https://bsa.swipesavvy.com
**GitHub**: https://github.com/SwipeSavdev/camp-card

## Contents

### 01-agent-prompts/
Agent-specific runnable prompts for multi-agent workflows.

**Entry Point**: `01-agent-prompts/CAMP_CARD/AGENT_PROMPTS.md`

Includes prompts for:
- Agent A: Architecture & Sync Auditor
- Agent B: Backend Unit Test Factory
- Agent C: Frontend Unit Test Factory
- Agent D: Integration & Component Testing Engineer
- Agent E: Contract Testing Engineer
- Agent F: E2E Workflow Engineer
- Agent G: Load & Peak Engineer
- Agent H: QA Gatekeeper

### 02-repo-mapped-plans/
Detailed execution plan mapped to actual repository structure.

**Entry Point**: `02-repo-mapped-plans/CAMP_CARD/REPO_MAPPED_EXECUTION_PLAN.md`

Includes:
- Repository inventory
- API endpoint inventory
- User roles (RBAC)
- Database schema
- Environment variables
- Risk areas
- Test commands

### 03-test-scaffolding/
Test templates and harnesses for all test types.

**Contents**:
- `k6/` - Load testing with k6 (smoke, load, stress scenarios)
- `playwright/` - E2E testing with Playwright
- `jest/` - Frontend unit testing with Jest
- `junit/` - Backend testing with JUnit 5 + Testcontainers

### 04-mcp-kb/
Living knowledge base with auto-sync capabilities.

**Contents**:
- `KB_SPEC.md` - KB structure and goals
- `kb-sync.js` - Sync script
- `kb-config.example.json` - Configuration template
- `kb-runbook.md` - How to run
- `generated/` - Generated KB indexes

## Quick Start

### Run Load Tests
```bash
cd 03-test-scaffolding/k6
export BASE_URL=https://bsa.swipesavvy.com/api/v1
k6 run scenarios.js
```

### Run E2E Tests
```bash
cd 03-test-scaffolding/playwright
npm install
npx playwright test
```

### Sync Knowledge Base
```bash
cd 04-mcp-kb
cp kb-config.example.json kb-config.json
node kb-sync.js --config ./kb-config.json
```

## Test Credentials

| User | Email | Password | Role |
|------|-------|----------|------|
| Admin | admin@campcard.org | Password123 | NATIONAL_ADMIN |
| Test | test@campcard.org | Password123 | SCOUT |

## Environment Variables

### Backend
```bash
SPRING_PROFILES_ACTIVE=aws
DB_HOST=camp-card-db.cn00u2kgkr3j.us-east-2.rds.amazonaws.com
DB_PORT=5432
DB_NAME=campcard
JWT_SECRET=<secret>
REDIS_HOST=campcard-redis
TOGETHER_AI_API_KEY=<secret>
```

### Frontend
```bash
NEXT_PUBLIC_API_URL=https://bsa.swipesavvy.com/api/v1
NEXTAUTH_URL=https://bsa.swipesavvy.com
NEXTAUTH_SECRET=<secret>
```

## Related Documentation

- **CLAUDE.md** (project root) - Main project documentation
- **Backend Swagger**: http://localhost:7010/swagger-ui.html
- **Deployment Guide**: See CLAUDE.md AWS Deployment section

## Version

Last updated: 2026-01-16
