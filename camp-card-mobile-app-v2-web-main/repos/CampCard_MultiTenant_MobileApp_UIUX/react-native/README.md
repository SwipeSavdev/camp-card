# React Native implementation starter (UI/UX aligned)

This folder is **optional scaffolding** to help your React Native team implement the UI shown in `index.html`.

## Recommended architecture

- Auth stack: `Login`, `Signup`
- App stack (role-based):
 - Customer tabs: Home / Offers / Settings
 - Leader tabs: Home / Share / Scouts / Settings
 - Scout tabs: Home / Share / Settings
- Tenant is derived from the authenticated user (multi-tenant).

## Notes

- Use `theme.ts` for colors/radius/spacing.
- Lockups and logos are provided in `/assets/images/` at the root of this package.
- For gradients, use `expo-linear-gradient` or `react-native-linear-gradient`.

This is a **UI starter** (not a full working app). Wire it into your navigation & data layer as needed.
