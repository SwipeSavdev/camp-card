#  BSA Camp Card - Web Portal

**Next.js admin and council management dashboard**

![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)

> **Note:** This is a standalone repository within a multi-repository architecture. Each component (backend, mobile, web) is an independent repository with its own dependencies and build process.

---

## Overview

Web portal for administrators, council staff, and troop leaders featuring:
- Real-time dashboards at all organizational levels
-  Merchant and offer management (CRUD)
-  Troop roster management
-  POS claim link generation for offline sales
- Revenue analytics and reporting (CSV/PDF export)
- Campaign tracking and performance metrics
-  User and role management (RBAC)

**User Roles:**
- National Admin (cross-council access)
- Council Admin (council-scoped access)
- Troop Leader (troop-scoped access)

---

## Quick Start

### Prerequisites

- Node.js 20 LTS
- npm 10+

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env.local

# Edit configuration
vim .env.local
```

### 3. Run Development Server

```bash
# Start dev server with hot reload
npm run dev

# Open browser
open http://localhost:3000
```

### 4. Build for Production

```bash
# Build optimized production bundle
npm run build

# Start production server
npm start
```

---

##  Project Structure

```
web/
 app/ # Next.js App Router
  (auth)/ # Authentication routes (no layout)
   login/
    page.tsx
   register/
    page.tsx
   forgot-password/
   page.tsx
  (dashboard)/ # Dashboard routes (with sidebar)
   layout.tsx # Dashboard layout
   overview/
    page.tsx
   troops/
    page.tsx
    [id]/
    page.tsx
   scouts/
    page.tsx
   merchants/
    page.tsx
    new/
    [id]/
   offers/
    page.tsx
    new/
   subscriptions/
    page.tsx
   reports/
    page.tsx
   settings/
   page.tsx
  api/ # API routes (Next.js API)
   auth/
    [...nextauth]/
    route.ts
   export/
   route.ts
  layout.tsx # Root layout
  page.tsx # Home page (redirects to dashboard)
  error.tsx
 components/ # React components
  ui/ # Base UI components
   Button.tsx
   Card.tsx
   Input.tsx
   Table.tsx
   Dialog.tsx
   ...
  dashboard/
   Sidebar.tsx
   Header.tsx
   StatCard.tsx
   RevenueChart.tsx
  forms/
   MerchantForm.tsx
   OfferForm.tsx
   TroopForm.tsx
  tables/
  TroopsTable.tsx
  MerchantsTable.tsx
  SubscriptionsTable.tsx
 lib/ # Utilities & helpers
  api.ts # API client
  auth.ts # Auth helpers
  utils.ts # Utility functions
  validation.ts # Form validation schemas
 store/ # Zustand state management
  authStore.ts
  dashboardStore.ts
  uiStore.ts
 styles/
  globals.css # Global styles + Tailwind
 types/
  api.types.ts
  models.types.ts
  next-auth.d.ts
 public/ # Static assets
  images/
  icons/
 .env.example
 .gitignore
 next.config.js
 tailwind.config.js
 tsconfig.json
 package.json
 README.md
```

---

##  Configuration

### Environment Variables

```bash
# API
NEXT_PUBLIC_API_URL=http://localhost:8080/v1

# Authentication (NextAuth.js)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-min-32-chars

# Stripe
STRIPE_SECRET_KEY=sk_test_51234567890abcdef

# AWS (for PDF generation, etc.)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0
```

### NextAuth Configuration

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions = {
 providers: [
 CredentialsProvider({
 name: 'Credentials',
 credentials: {
 email: { label: "Email", type: "email" },
 password: { label: "Password", type: "password" }
 },
 async authorize(credentials) {
 // Call backend API
 const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
 method: 'POST',
 body: JSON.stringify(credentials),
 headers: { "Content-Type": "application/json" }
 });
 const user = await res.json();
 if (res.ok && user) return user;
 return null;
 }
 })
 ],
 session: {
 strategy: 'jwt',
 },
 pages: {
 signIn: '/login',
 },
};
```

---

## Testing

### Unit Tests (Jest)

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### E2E Tests (Playwright)

```bash
# Install Playwright browsers
npx playwright install

# Run E2E tests
npm run e2e

# Run with UI mode
npm run e2e:ui

# Run specific test
npx playwright test tests/dashboard.spec.ts
```

### Manual Testing Checklist

- [ ] Login/logout flow
- [ ] Dashboard data loading (all roles)
- [ ] Merchant CRUD operations
- [ ] Offer CRUD operations
- [ ] Troop roster management
- [ ] POS claim link generation
- [ ] CSV export functionality
- [ ] PDF report generation
- [ ] Search and filtering
- [ ] Pagination

---

## Design System

### Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
 theme: {
 extend: {
 colors: {
 primary: {
 navy: {
 900: '#000C2F',
 700: '#05244A',
 },
 blue: {
 500: '#0A4384',
 },
 },
 accent: {
 red: {
 500: '#D9012C',
 600: '#B01427',
 },
 },
 },
 spacing: {
 'xs': '8px',
 'sm': '12px',
 'md': '16px',
 'lg': '24px',
 'xl': '32px',
 '2xl': '48px',
 },
 borderRadius: {
 'button': '14px',
 'card': '24px',
 },
 },
 },
};
```

### Component Usage

```tsx
import { Button, Card } from '@/components/ui';

<Button variant="primary" size="lg">
 Create Merchant
</Button>

<Card className="p-md">
 <h2 className="text-primary-navy-900">Dashboard</h2>
</Card>
```

---

## Features

### 1. Dashboards

**National Admin:**
- Cross-council performance comparison
- System health metrics
- User activity logs

**Council Admin:**
- Revenue trends (daily, weekly, monthly)
- Top-performing troops
- Merchant participation rate
- Customer acquisition funnel

**Troop Leader:**
- Troop roster with Scout performance
- POS claim link generation
- Fundraising progress vs. goal
- Recent activity feed

### 2. Merchant Management

- Create/edit/delete merchants
- Approve pending registrations
- Manage locations (multi-location merchants)
- Upload logos

### 3. Offer Management

- Create/edit/delete offers
- Set validity dates
- Category assignment
- Online vs. in-store targeting

### 4. Reports & Export

- Revenue reports (CSV, PDF)
- Subscription reports
- Redemption reports
- Custom date ranges
- Scheduled reports (email delivery)

### 5. POS Integration

- Generate claim links for offline sales
- View unclaimed links
- Resend claim links via email/SMS
- Void expired links

---

##  Deployment

### Build for Production

```bash
# Build optimized bundle
npm run build

# Test production build locally
npm start
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Deploy to AWS (S3 + CloudFront)

```bash
# Build static export
npm run build
npm run export

# Upload to S3
aws s3 sync out/ s3://campcard-web-prod

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
 --distribution-id E1234567890 \
 --paths "/*"
```

### Deploy to EC2 (PM2)

```bash
# Build production bundle
npm run build

# Start with PM2
pm2 start npm --name "campcard-web" -- start
pm2 save
pm2 startup
```

---

##  Security

### Authentication

- JWT-based session via NextAuth.js
- HTTP-only cookies
- CSRF protection
- Session expiry (15 min access token)

### Authorization

- Role-based access control (RBAC)
- Route protection via middleware
- API route authorization

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
 const token = request.cookies.get('next-auth.session-token');
 if (!token && !request.nextUrl.pathname.startsWith('/login')) {
 return NextResponse.redirect(new URL('/login', request.url));
 }
}
```

### Content Security Policy

```javascript
// next.config.js
const securityHeaders = [
 {
 key: 'X-DNS-Prefetch-Control',
 value: 'on'
 },
 {
 key: 'X-Frame-Options',
 value: 'DENY'
 },
 {
 key: 'X-Content-Type-Options',
 value: 'nosniff'
 },
 {
 key: 'Referrer-Policy',
 value: 'origin-when-cross-origin'
 },
];
```

---

## Performance

### Optimization Techniques

- Server-side rendering (SSR) for initial load
- Static site generation (SSG) for static pages
- Image optimization via `next/image`
- Code splitting & lazy loading
- Redis caching for dashboard data

### Lighthouse Scores Target

- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 100

---

##  Contributing

### Code Style

- **TypeScript:** Strict mode enabled
- **Linting:** ESLint + Airbnb style
- **Formatting:** Prettier

```bash
# Run linter
npm run lint

# Fix auto-fixable issues
npm run lint:fix
```

### Commit Convention

```
feat(dashboard): add revenue trend chart

Implements dashboard visualization for council admin.

Closes #345
```

---

##  Support

**Documentation:** See `/docs` in main repository
**Issues:** GitHub Issues
**Slack:** #web-dev
**Email:** web-team@campcard.org

---

##  License

**UNLICENSED** - Proprietary
Copyright  2025 Boy Scouts of America
