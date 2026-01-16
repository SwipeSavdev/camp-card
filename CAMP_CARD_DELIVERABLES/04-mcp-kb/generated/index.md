# MCP KB – Camp Card Knowledge Base Index

Generated: 2026-01-16

## Overview

This knowledge base contains structured documentation for the Camp Card Fundraising Platform.

## Projects

- **CAMP_CARD**: BSA Camp Card Fundraising Platform
  - Backend: Java 21 / Spring Boot 3.2
  - Web Portal: Next.js 14.1
  - Mobile App: React Native 0.81 / Expo 54

## Quick Links

### Architecture
- [System Map](projects/CAMP_CARD/system-map.md)
- [API Inventory](projects/CAMP_CARD/api-inventory.md)
- [Entity Relationships](projects/CAMP_CARD/entity-relationships.md)

### Testing
- [Test Plan](../../03-test-scaffolding/CAMP_CARD/README.md)
- [k6 Load Tests](../../03-test-scaffolding/k6/scenarios.js)
- [Playwright E2E Tests](../../03-test-scaffolding/playwright/tests/)
- [JUnit Templates](../../03-test-scaffolding/junit/README.md)

### Agent Prompts
- [Agent Prompts](../../01-agent-prompts/CAMP_CARD/AGENT_PROMPTS.md)
- [Execution Plan](../../02-repo-mapped-plans/CAMP_CARD/REPO_MAPPED_EXECUTION_PLAN.md)

## Repository Structure

```
camp-card/
├── backend/                                    # Java Spring Boot API
│   ├── src/main/java/
│   │   ├── org/bsa/campcard/                  # Controllers, Config, Security
│   │   └── com/bsa/campcard/                  # Entities, Services, Repositories
│   └── src/main/resources/
│       └── db/migration/                      # Flyway migrations
├── camp-card-mobile-app-v2-web-main/
│   └── repos/camp-card-web/                   # Next.js Web Portal
│       ├── app/                               # App Router pages
│       ├── lib/                               # API client, utilities
│       └── components/                        # Reusable components
├── camp-card-mobile-app-v2-mobile-main/
│   └── mobile/                                # React Native App
│       ├── src/screens/                       # Screen components
│       ├── src/navigation/                    # Navigation config
│       └── src/services/                      # API services
└── CAMP_CARD_DELIVERABLES/                    # This folder
```

## Key Technologies

| Component | Technology | Version |
|-----------|------------|---------|
| Backend | Java / Spring Boot | 21 / 3.2 |
| Web Frontend | Next.js / React | 14.1 / 18 |
| Mobile | React Native / Expo | 0.81 / 54 |
| Database | PostgreSQL | 16 |
| Cache | Redis | 7 |
| Messaging | Apache Kafka | 3.6 |
| Payments | Authorize.Net | Accept.js |
| AI | Together.AI | API |

## Environment Details

| Environment | URL | Port |
|-------------|-----|------|
| Production | https://bsa.swipesavvy.com | - |
| Backend API | /api/v1/ | 7010 |
| Web Portal | / | 7020 |
| PostgreSQL | RDS | 5432 |
| Redis | EC2 | 6379 |
| Kafka | EC2 | 9092 |

## User Roles

| Role | Description | Access Level |
|------|-------------|--------------|
| NATIONAL_ADMIN | National BSA admin | Full system |
| COUNCIL_ADMIN | Council administrator | Council scope |
| TROOP_LEADER | Troop leader | Troop scope |
| PARENT | Card holder parent | Own data |
| SCOUT | Scout fundraiser | Own data |

## Contact

- GitHub: https://github.com/SwipeSavdev/camp-card
- Production: https://bsa.swipesavvy.com
