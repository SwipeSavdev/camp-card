# Camp Card Mobile App - Development Quick Start

**Project:** Camp Card Multi-Tenant Mobile Application
**Variant:** Variant B (Non-Payment Digital Card)
**Status:** Development Started (Sprint 1.1)
**Last Updated:** December 26, 2025

---

## Quick Navigation

- **Full MVP Spec:** [MVP_COMPLETE_REQUIREMENTS.md](./MVP_COMPLETE_REQUIREMENTS.md)
- **Development Tasks:** [MVP_DEVELOPMENT_TASKS.md](./MVP_DEVELOPMENT_TASKS.md)
- **Current Sprint:** [SPRINT_1_1_DEVELOPMENT_GUIDE.md](./SPRINT_1_1_DEVELOPMENT_GUIDE.md)
- **Final Summary:** [MVP_FINAL_SUMMARY.md](./MVP_FINAL_SUMMARY.md)

---

## Get Started in 5 Minutes

### 1. Clone & Install

```bash
# Navigate to project root, then:
cd repos/camp-card-mobile

# Install dependencies
npm install

# Install pods (if developing for iOS)
cd ios && pod install && cd ..
```

### 2. Configure Environment

```bash
# Check .env file exists with API base URL
cat .env
# Should contain: EXPO_PUBLIC_API_BASE_URL=http://localhost:8080

# For local testing, set mock auth flag
echo "EXPO_PUBLIC_ENABLE_MOCK_AUTH=true" >> .env
```

### 3. Start Development Server

```bash
# Terminal 1: Start Expo dev server
npm start

# Then press 'a' for Android or 'i' for iOS simulator
# Or scan QR code with Expo Go app
```

### 4. Run Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- src/__tests__/store/authStore.test.ts

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### 5. Login

Use mock credentials to test:
- **Customer:** `customer@example.com` / `password123`
- **Scout Parent:** `scout@example.com` / `password123`
- **Troop Leader:** `leader@example.com` / `password123`

(Only works if `EXPO_PUBLIC_ENABLE_MOCK_AUTH=true`)

---

##  Project Structure

```
camp-card-mobile/
 src/
  components/ # Reusable UI components
   Button.tsx
   Input.tsx
   Card.tsx
   Typography.tsx
  config/ # App configuration
   env.ts
  hooks/ # Custom React hooks
   useFeatureFlag.ts
   useQuery.ts
  navigation/ # React Navigation
   RootNavigator.tsx
  screens/ # Screen components
   auth/
    LoginScreen.tsx
    SignupScreen.tsx
   customer/
   Home.tsx
   Offers.tsx
   Settings.tsx
  services/ # API & backend services
   apiClient.ts # Axios instance with interceptors
   offersService.ts
   redemptionService.ts
  store/ # Zustand state management
   authStore.ts # Auth state & JWT handling
  theme/ # Design tokens
   index.ts # Colors, spacing, shadows
  types/ # TypeScript definitions
   roles.ts # Role types & mappers
  uiux/ # UI/UX kit screens
   screens/ # Pre-built screens by role
    customer/
    leader/
    scout/
   theme.ts
   roles.ts
  utils/ # Utility functions
   validation.ts
   formatting.ts
   api.ts
  __tests__/ # Test files (mirror src structure)
   store/
    authStore.test.ts
   screens/
    auth.test.tsx
   services/
   apiClient.test.ts
  App.tsx # Root component
  index.js # Entry point
 .env # Environment variables
 package.json # Dependencies
 tsconfig.json # TypeScript config
 jest.config.js # Test configuration
 metro.config.js # Metro bundler config
 app.json # Expo config
```

---

##  Key Technologies

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **UI Framework** | React Native + Expo | Cross-platform mobile |
| **Navigation** | React Navigation v7 | Tab + Stack navigation |
| **State Management** | Zustand | Lightweight auth + app state |
| **Data Fetching** | React Query v5 + Axios | Server state + caching |
| **Form Handling** | React Hook Form | Form validation |
| **Styling** | Design Tokens (CSS-in-JS) | Consistent theming |
| **Type Safety** | TypeScript (strict) | Type checking |
| **Testing** | Jest + React Testing Library | Unit + integration tests |
| **Auth** | JWT + Expo SecureStore | Secure token storage |
| **QR Code** | react-native-qrcode-svg | QR generation |
| **Biometric** | react-native-biometrics | Face/Touch ID login |
| **Analytics** | Firebase Analytics | Event tracking |
| **Push Notifications** | Expo Notifications | In-app + remote notifications |

---

##  Authentication Flow

```

 LoginScreen 

  (email, password)
 

 useAuthStore.login() 

 POST /auth/login (apiClient) 
 + JWT interceptor (Bearer token)

  success
 

 saveAuth() to SecureStore 
 + fallback to AsyncStorage 
 store: { 
 user: User, 
 accessToken: string, 
 refreshToken: string, 
 expiresIn: number 
 } 

 
 

 RootNavigator routes to 
 AppNavigator (authenticated) 

 
 

 RoleTabs switches based on: 
 user.role = 'customer' 
 OR 'scout' 
 OR 'leader' 

```

### Token Refresh on 401

```
API Request (with accessToken)
 
  401 Response
 
 
 Interceptor detects 401
 
 
 Check if already retried
 
  Yes  Logout + reject
 
  No  Attempt refresh
 
 
 POST /auth/refresh (with refreshToken)
 
  Success  Update accessToken
  Retry original request
 
  Failure  Logout + reject
```

---

## Current Sprint Status

### Sprint 1.1: Authentication & Navigation (Week 1)

**Completed ():**
- [x] Enhanced authStore with SecureStore integration
- [x] JWT token storage (Keychain with AsyncStorage fallback)
- [x] API client interceptors for Bearer token + refresh
- [x] Role-based navigation (CustomerTabs, LeaderTabs, ScoutTabs)
- [x] LoginScreen with validation
- [x] SignupScreen with validation
- [x] Unit tests (authStore, screens, apiClient)
- [x] Design system tokens defined

**In Progress ():**
- Design system component verification
- Integration test suite
- Manual testing & QA

**Not Started ():**
- Offer browsing feature (Sprint 1.2)
- Customer dashboard (Sprint 1.3)
- Full testing & accessibility (Sprint 1.4)

**Time:** 12-16 hours completed / 26-34 hours total
**Owner:** Frontend Engineering Team

---

## Testing Commands

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- authStore.test.ts

# Watch mode (auto-rerun on changes)
npm run test:watch

# Coverage report
npm run test:coverage

# Type checking
npm run type-check

# Linting
npm run lint

# Fix lint issues
npm run lint:fix
```

---

## Testing on Devices

### iOS Simulator
```bash
npm run ios
# Then select simulator from menu
# Or: npm ios -- --simulator "iPhone 14 Pro"
```

### Android Emulator
```bash
npm run android
# Requires Android SDK setup
```

### Physical Device (via Expo Go)
```bash
npm start
# Scan QR code with Expo Go app (App Store / Play Store)
```

### Build for Production
```bash
# iOS
npm run prebuild # Generates ios/ folder
npm run ios -- --configuration Release

# Android
npm run prebuild # Generates android/ folder
npm run android -- --mode release
```

---

## Environment Variables

**Create `.env` file in project root:**

```env
# API Configuration
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080
EXPO_PUBLIC_API_TIMEOUT_MS=10000

# Feature Flags (Development)
EXPO_PUBLIC_ENABLE_MOCK_AUTH=true
EXPO_PUBLIC_LOG_LEVEL=debug

# Stripe (Phase 3 - Payment)
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx

# Firebase (Analytics & Messaging)
EXPO_PUBLIC_FIREBASE_PROJECT_ID=campcard-app
EXPO_PUBLIC_FIREBASE_API_KEY=xxx

# Feature Toggles
EXPO_PUBLIC_ENABLE_BIOMETRIC_AUTH=false
EXPO_PUBLIC_ENABLE_DEEP_LINKING=true
```

---

## Debugging

### React Native Debugger
```bash
# Install globally
npm install -g react-native-debugger

# Open debugger
open "rndebugger://set-debugger-loc?host=localhost&port=8081"

# Enable in app:
# View  Toggle Inspector (Cmd+D on iOS)
```

### Console Logs
```typescript
// React Native console
console.log('Message');
console.warn('Warning');
console.error('Error');

// Redux DevTools (if using)
// Check Zustand state: useAuthStore.getState()
```

### Common Issues

**Issue:** "Module not found" error
```bash
# Solution: Clear cache & reinstall
npm run clean:node
npm install
npm start
```

**Issue:** Pod install fails (iOS)
```bash
# Solution: Clear pod cache
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

**Issue:** Authentication not working
```bash
# Check:
# 1. EXPO_PUBLIC_ENABLE_MOCK_AUTH=true (for testing)
# 2. API base URL correct in .env
# 3. Backend /auth/login endpoint running
# 4. Check useAuthStore.getState() in console
```

---

## Documentation

- **Architecture:** `docs/PART-03-ARCHITECTURE.md` (in backend repo)
- **API Specs:** `docs/PART-05-API-SPECIFICATIONS.md`
- **Data Model:** `docs/PART-04-DATA-MODEL.md`
- **UX Design:** `docs/PART-07-UX-DESIGN-SYSTEM.md`
- **Security:** `docs/PART-08-SECURITY-PRIVACY.md`

---

## Next Steps

1. **Today:** Setup development environment, run tests
2. **Tomorrow:** Complete Sprint 1.1 integration tests
3. **This Week:** Manual testing & QA
4. **Next Week:** Start Sprint 1.2 (Offer Browsing)

---

##  Team & Contacts

- **Frontend Lead:** [Your Name] - Architecture, reviews
- **Frontend Engineer #1:** [Name] - Sprint 1.1 Auth
- **Frontend Engineer #2:** [Name] - Sprint 1.1 Navigation
- **Frontend Engineer #3:** [Name] - Sprint 1.1 Design System
- **QA Engineer:** [Name] - Testing & accessibility
- **Product Manager:** [Name] - Requirements & sign-off

---

## Verification Checklist

Before proceeding, verify:

```bash
# 1. Dependencies installed
npm list

# 2. TypeScript compiles
npm run type-check

# 3. Tests pass
npm test -- --coverage

# 4. Linting passes
npm run lint

# 5. App starts
npm start
# Press 'a' for Android or 'i' for iOS, then quit (Ctrl+C)
```

---

**Happy coding! **

For detailed Sprint 1.1 work, see [SPRINT_1_1_DEVELOPMENT_GUIDE.md](./SPRINT_1_1_DEVELOPMENT_GUIDE.md)
