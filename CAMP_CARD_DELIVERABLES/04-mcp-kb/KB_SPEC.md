# 📚 Living MCP Knowledge Base (KB) – Spec & Sync Workflow

This KB stays in sync with your repos by **regenerating** structured markdown indexes and “source-of-truth” docs on demand (locally or in CI).

## Goals
- Keep **architecture maps**, **API/event contracts**, **runbooks**, **test plans**, and **ADRs** current.
- Generate human-usable docs for engineering + compliance + QA + onboarding.
- Feed MCP tools / LLM agents with consistent, versioned knowledge.

## KB Structure (recommended)
```
mcp-kb/
  index.md
  projects/
    <project>/
      system-map.md
      service-catalog.md
      api-contracts/
      event-contracts/
      adr/
      runbooks/
      testing/
        unit-matrix.md
        e2e-matrix.md
        load-matrix.md
  generated/
    repo-snapshots/
    api-openapi/
    events-schemas/
    test-reports/
```

## Source Inputs
- Repo READMEs and `/docs`
- OpenAPI specs (`openapi.yaml|json`)
- Event schemas (`*.json`, `*.proto`)
- DB migrations (`/migrations`, Flyway)
- CI configs (GitHub Actions)
- Code metadata (package.json, build.gradle, pom.xml)

## “Sync” Definition
A sync run:
1. Crawls repos (configured list)
2. Extracts known doc artifacts + metadata
3. Regenerates indexes and summary docs
4. Writes outputs under `mcp-kb/generated/`
5. Fails CI if required artifacts are missing (optional)

## Required Project Artifacts (CI Gate Optional)
- `system-map.md`
- `service-catalog.md`
- At least one API contract file (OpenAPI/GraphQL)
- At least one event schema (if event-driven)
- `testing/` matrices

## KB Refresh Cadence
- Local: on demand (`npm run kb:sync`)
- CI: on every PR + nightly full sync

---

## Scripts Included
- `kb-sync.js` – Node script to crawl repo folders, find docs/specs, generate indexes
- `kb-config.example.json` – config template
- `kb-runbook.md` – how to run in dev + CI

### Notes
- This pack is repo-agnostic. Point `kb-sync.js` at your workspace root containing multiple repos.
