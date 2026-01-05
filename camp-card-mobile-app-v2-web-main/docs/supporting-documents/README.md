# camp-card-mobile-app-v2 (multi-repo bundle)

This folder is a **multi-repository architecture** version of the original `camp-card-mobile-app-v2` monorepo.

## Repos

All core applications are separated into their own repo folders:

- `repos/camp-card-mobile`  React Native / Expo app (multi-tenant, role-based)
- `repos/camp-card-web`  Next.js web app
- `repos/camp-card-backend`  Backend API (existing scaffold)
- `repos/camp-card-infrastructure`  Terraform / IaC
- `repos/camp-card-docs`  Documentation
- `repos/CampCard_MultiTenant_MobileApp_UIUX`  UI/UX kit (reference)

## VS Code workspaces

Open any of these in VS Code:

- `workspaces/camp-card-mobile.code-workspace`
- `workspaces/camp-card-web.code-workspace`
- `workspaces/camp-card-backend.code-workspace`
- `workspaces/camp-card-infrastructure.code-workspace`
- `workspaces/camp-card-docs.code-workspace`
- `workspaces/camp-card-all.code-workspace` (multi-root workspace)

## Notes

- `node_modules`, `.next`, and other build artifacts were removed from this bundle to keep it lightweight.
- If you need to run an app, install dependencies inside that repo folder.
