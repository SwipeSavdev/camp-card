# 🔧 Shop Savvy POS (Omni-Channel) — Scaffolding Notes

This folder references the shared scaffolding in `../k6`, `../playwright`, `../jest`, and `../junit`.

## What to customize
- Base URLs
- Auth strategy (service user, test realm, API keys)
- Endpoint paths for create/read/sync verify
- Seed/reset commands
- Sync verification logic

## Suggested file placements
- k6: `testing/load/k6/`
- Playwright: `testing/e2e/playwright/`
- Jest: `src/__tests__/` or `__tests__/`
- JUnit: `src/test/java/`
