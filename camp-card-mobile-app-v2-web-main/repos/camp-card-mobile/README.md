# Camp Card Mobile (MultiTenant)

This repo contains the **React Native / Expo** mobile application for Camp Card.

It has been redesigned using the **CampCard_MultiTenant_MobileApp_UIUX** kit and organized around **role-based navigation**:

- **Customer**: Home, Offers, Settings
- **Troop Leader**: Dashboard, Share, Scouts, Settings
- **Scout**: Dashboard, Share, Settings

## Quick start

1. Install deps

```bash
npm install
```

2. Configure environment

The app reads config from Expo `extra` (in `app.json`) and/or environment variables.

- `EXPO_PUBLIC_API_BASE_URL` (or `API_BASE_URL`)  e.g. `http://localhost:8080` (or `/v1` if your backend is versioned)
- `ENABLE_MOCK_AUTH`  `true` to allow offline/demo login without a backend

3. Run

```bash
npm start
```

## Demo / mock auth

If `ENABLE_MOCK_AUTH=true`, the app will allow login even without a backend.

Role selection is inferred from the email:

- `*leader*` => Leader
- `*scout*` => Scout
- otherwise => Customer

## Folder structure

```text
src/
 components/
 config/
 navigation/
 screens/
 auth/
 customer/
 leader/
 scout/
 services/
 store/
 theme/
 types/
```

## VS Code

Open the workspace file:

- `workspaces/camp-card-mobile.code-workspace` (from the multi-repo bundle)
