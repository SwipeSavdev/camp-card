# BSA Camp Card Digitalization Program
## Build Specification  Part 6: Reporting & Dashboards

**Document Version:** 1.0
**Date:** December 23, 2025
**Status:** Implementation-Ready

---

## 1. DASHBOARD OVERVIEW

### 1.1 Dashboard Matrix

| Dashboard | Primary Users | Access Level | Refresh Rate | Key Goal |
|-----------|--------------|--------------|--------------|----------|
| **Scout Dashboard** | Scouts (via parent), Troop Leaders | Read-only | 1 min cache | Track fundraising progress |
| **Troop Leader Dashboard** | Troop Leaders | Read + limited write | 1 min cache | Manage troop roster, monitor performance |
| **Council Admin Dashboard** | Council Admins | Full CRUD | 5 min cache | Oversee council operations, merchants, campaigns |
| **National Admin Dashboard** | System Admins | Cross-tenant read | 15 min cache | Benchmark councils, system health |
| **Customer Dashboard** | Customers | Read-only | Real-time | Track savings, manage subscription |

### 1.2 Design Principles

1. **Mobile-First:** All dashboards responsive, optimized for phone/tablet
2. **Visual Hierarchy:** Most important metrics prominent (large numbers, color-coded)
3. **Actionable Insights:** Each metric linked to action (e.g., "Print posters" next to low click count)
4. **Age-Appropriate:** Scout dashboard uses simple language, large text, gamification
5. **Real-Time Updates:** Critical metrics (subscription status) real-time; analytics cached
6. **Export/Print:** All dashboards support CSV export, PDF reports, printable posters

---

## 2. SCOUT DASHBOARD (AGES 514)

### 2.1 Target Audience

**Primary:** Scouts ages 514 (via parent/guardian login)
**Secondary:** Troop leaders viewing individual Scout performance

### 2.2 Design Goals

- **Simple Language:** Avoid jargon (e.g., "People who signed up" vs. "Subscribers")
- **Large Text:** Min 18px body, 36px+ for key numbers
- **Visual Feedback:** Progress bars, star ratings, emojis (optional)
- **Gamification:** Badges, leaderboard, streak tracking
- **Encouragement:** Positive messaging ("Great job!", "You're almost at 10!")

### 2.3 UI Layout (Mobile)

```

  Back Scout Dashboard  

 
 Hi Emily!  
 Troop 101 
 
  
  Your Fundraising  
   
  $240  
  Total Raised  
   
   80% of goal ($300)  
  
 
  
  People Who Signed Up  
   
  12 Direct + 8 Shared = 20  
  (You shared) (Friends shared)  
  
 
  
  Your Stats  
   
  47 Link Clicks  
  20 Sign-ups  
  43% Success Rate  
  
 
  
   Your Special Link  
   
  [QR CODE IMAGE]  
   
  campcard.app/s/SCOUT-A3F9X2  
   
  [ Share Link] [ Print]  
  
 
  
  Troop Leaderboard  
   
  1.  Jake M. 23 sign-ups  
  2.  Emily R. 20 sign-ups   
  3.  Sarah P. 18 sign-ups  
  4. Alex K. 15 sign-ups  
  
 
  
   Recent Activity  
   
   Sarah P. signed up!  
  2 hours ago  
   
   Someone clicked your link  
  5 hours ago  
   
   John D. shared your link  
  1 day ago  
  
 
 [ Print All Posters] 
 

```

### 2.4 Metrics Definitions

| Metric | Calculation | Data Source | Purpose |
|--------|-------------|-------------|---------|
| **Total Raised** | `SUM(plan.price_cents) WHERE root_scout_id = scout.id AND status = ACTIVE` | `referral_attributions` + `subscriptions` + `subscription_plans` | Show fundraising impact |
| **Direct Sign-ups** | `COUNT(*) WHERE attribution_depth = 0` | `referral_attributions` | Scouts directly referred |
| **Shared Sign-ups** | `COUNT(*) WHERE attribution_depth > 0` | `referral_attributions` | Viral referrals (customer-to-customer) |
| **Total Sign-ups** | Direct + Shared | Calculated | Overall conversions |
| **Link Clicks** | `COUNT(*) WHERE referral_link.owner_id = scout.id` | `referral_events` | Engagement tracking |
| **Success Rate** | `(Total Sign-ups / Link Clicks) * 100` | Calculated | Conversion efficiency |
| **Leaderboard Rank** | Order by Total Sign-ups DESC within troop | `analytics.scout_performance_daily` | Gamification |

### 2.5 Interactive Elements

**Share Link Button:**
- Triggers native share sheet (mobile) or copy-to-clipboard (web)
- Pre-filled message: "Help me go to camp! Get local deals: [link]"

**Print Posters Button:**
- Generates PDF with Scout's QR code + name
- Templates: 8.5x11 flyer, door hanger, business card
- Opens print dialog or downloads PDF

**Leaderboard:**
- Highlights current Scout's row
- Updates daily (not real-time to reduce pressure)
- Shows top 5 + current Scout if outside top 5

**Recent Activity Feed:**
- Shows last 10 events (sign-ups, clicks, shares)
- Real-time updates via WebSocket or polling (30s interval)
- Customer names shown as "Sarah P." (first name + last initial for privacy)

### 2.6 Design Tokens Usage

**Colors:**
- Primary background: `var(--cc-navy900)` (dark blue gradient)
- Cards: `var(--cc-white)` with `box-shadow: var(--cc-shadow-card)`
- CTA buttons: `var(--cc-red500)` (bright red)
- Success indicators: Green (#4CAF50, add to token set)
- Text: White on dark bg, `var(--cc-navy900)` on light cards

**Typography:**
- Section headers: `font-size: 24px; font-weight: 700;`
- Metric values: `font-size: 48px; font-weight: 700;`
- Labels: `font-size: 16px; font-weight: 400;`
- Body text: `font-size: 18px; line-height: 1.5;`

**Spacing:**
- Card padding: `var(--cc-space-lg)` (24px)
- Between cards: `var(--cc-space-md)` (16px)
- Page margins: `var(--cc-space-md)`

---

## 3. TROOP LEADER DASHBOARD

### 3.1 Target Audience

**Primary:** Adult volunteers managing troop rosters and campaigns

### 3.2 Design Goals

- **Actionable Overview:** Quick access to roster management, POS sales, reporting
- **Performance Insights:** Identify top performers and Scouts needing help
- **Time-Efficient:** Minimal clicks to common actions (add Scout, generate claim link)

### 3.3 UI Layout (Desktop/Tablet)

```

 Camp Card Troop 101 Dashboard Admin  

 
  
  Troop Performance Summary  
   
       
   87   $2,610   15   52%   
   Sign-ups  Raised   Scouts   Goal   
       
   
   52% of $5,000 goal  
  
 
  
  Quick Actions  
   
  [+ Add Scout] [ Sell a Card (POS)] [ Print All]  
  [ View Report] [ Email Troop]  
  
 
  
  Scout Performance [Export CSV] 
   
  Scout  Direct Indirect Total Raised Actions  
    
  Emily R. 18 5 23 $690 [View]  
  Jake M. 14 3 17 $510 [View]  
  Sarah P. 11 2 13 $390 [View]  
  Alex K. 9 1 10 $300 [View]  
  Chris T. 7 0 7 $210 [View]  
  ...  
   
  Showing 5 of 15 [1] 2 3 >  
  
 
  
   Pending POS Claims  
   
  Code Scout Customer Sent Status  
    
  CLM-A3F9X2 Emily R. Amy T. 2h ago   
  CLM-B7K3M9 Jake M. Bob S. 1d ago  
  CLM-C2N8P4 Sarah P. Carol W. 3d ago   
   
   Pending Claimed Expired  
  
 
  
   Campaign Timeline  
   
  Fall Fundraiser 2025  
  Dec 1  Dec 31  
  (Today)  
   
  23 days remaining  
  
 

```

### 3.4 Metrics Definitions

| Metric | Calculation | Purpose |
|--------|-------------|---------|
| **Total Sign-ups** | `SUM(subscriptions) WHERE troop_id = troop.id` | Aggregate troop performance |
| **Total Raised** | `SUM(revenue_cents)` | Fundraising total |
| **Active Scouts** | `COUNT(*) WHERE status = ACTIVE` | Roster size |
| **Goal Progress** | `(Total Raised / Fundraising Goal) * 100` | Campaign tracking |
| **Per-Scout Direct** | Direct referrals per Scout | Individual performance |
| **Per-Scout Indirect** | Indirect referrals per Scout | Viral spread effectiveness |

### 3.5 Interactive Elements

**Sell a Card (POS) Button:**
- Opens modal/drawer:
 - Select Scout (dropdown)
 - Select Plan (Annual, Monthly, etc.)
 - Enter Customer Name (optional)
 - Delivery: SMS/Email/Print
- Calls `POST /pos/entitlements`
- Shows generated claim link + QR code
- Option to print receipt immediately

**Add Scout Button:**
- Opens form:
 - First name, last initial
 - Parent email, phone
 - Grade level (optional)
- Calls `POST /troops/:id/scouts`
- Sends parent notification email

**Export CSV:**
- Downloads `troop-101-performance-2025-12-23.csv`
- Columns: Scout Name, Direct, Indirect, Total, Raised, Conversion Rate

**View Scout Dashboard:**
- Navigates to individual Scout dashboard (read-only for leader)

**Pending Claims Table:**
- Filters: All, Pending, Claimed, Expired
- Click claim code  View details
- Action: Resend SMS/Email, Mark as Paid (if cash/check)

### 3.6 Notifications/Alerts

**Alerts shown in dashboard:**
- "3 Scouts have 0 sign-ups. Send them encouragement!"
-  "Emily R. just reached 20 sign-ups! Congrats!"
-  "Campaign ends in 7 days. Final push!"

---

## 4. COUNCIL ADMIN DASHBOARD

### 4.1 Target Audience

**Primary:** Council staff overseeing operations, merchants, campaigns

### 4.2 Design Goals

- **Executive Overview:** High-level KPIs with drill-down capability
- **Operational Control:** Manage merchants, offers, campaigns, troops
- **Insights-Driven:** Identify trends, top performers, issues

### 4.3 UI Layout (Desktop)

```

 Camp Card Central Florida Council Admin  

 
  
  Executive Summary Last 30 Days   
   
       
   1,243   $37.3K   52   38   147  
  Customers Revenue   Troops  Merchants Offers 
       
   
  Growth: +87 customers (+7.5%)  Churn: 5.2%  
  
 
  
  Revenue Trend  Top Troops  
    
  $40K   1. Troop 101 $2,610  
     2. Troop 42 $2,340  
  $30K     3. Troop 88 $2,100  
      4. Troop 15 $1,950  
  $20K   5. Troop 203 $1,800  
     
  Dec 1  Dec 23  [View All Troops]  
  
 
  
  Offer Performance   Top Merchants  
    
  147 Active Offers  1. Pizza Palace 1,247 redemp.  
  8,432 Redemptions  2. Auto Shop 892 redemp.  
   3. Hair Salon 654 redemp.  
  Top Category:  4. Coffee Shop 543 redemp.  
   Dining (48%)  5. Gas Station 487 redemp.  
    
  [Manage Offers]  [Manage Merchants]  
  
 
  
  Active Campaigns  
   
  Campaign Start End Status  
    
  Fall Fundraiser 2025 Dec 1 Dec 31  Active  
  Holiday Special Dec 15 Dec 25  Active  
   
  [+ Create Campaign]  
  
 
  
  Alerts & Notifications  
   
   3 offers expire in next 7 days  
   2 merchants pending approval  
   Troop 42 nearing fundraising goal ($4,800 / $5,000)  
  
 

```

### 4.4 Metrics Definitions

| Metric | Calculation | Purpose |
|--------|-------------|---------|
| **Active Customers** | `COUNT(*) WHERE subscriptions.status = ACTIVE` | Subscriber base |
| **Total Revenue** | `SUM(payments.amount_cents)` | Financial performance |
| **Active Troops** | `COUNT(*) WHERE troops.status = ACTIVE` | Program reach |
| **Active Merchants** | `COUNT(*) WHERE merchants.status = ACTIVE` | Partner network |
| **Active Offers** | `COUNT(*) WHERE offers.status = ACTIVE AND valid_until >= TODAY` | Current value prop |
| **Growth Rate** | `((New Customers - Churned) / Total) * 100` | Momentum tracking |
| **Churn Rate** | `(Churned / Total) * 100` | Retention health |
| **Redemptions** | `COUNT(*) FROM redemptions` | Offer usage |

### 4.5 Interactive Elements

**Date Range Selector:**
- Presets: Last 7 days, Last 30 days, Last 90 days, All Time
- Custom date picker

**Revenue Trend Chart:**
- Interactive line chart (Chart.js or similar)
- Hover for daily values
- Click to drill down by troop or plan

**Top Troops Table:**
- Click troop  Navigate to troop detail page
- Sortable columns

**Manage Offers/Merchants Buttons:**
- Navigate to full CRUD interfaces

**Create Campaign Button:**
- Opens campaign creation wizard

**Alerts:**
- Clickable (navigate to relevant section)
- Dismissable

### 4.6 Advanced Reports (Separate Views)

**Subscriber Analytics:**
- Cohort retention curves
- New vs. returning customers
- Subscription plan distribution (pie chart)
- Average lifetime value

**Geo Analytics:**
- Heatmap of customer locations (ZIP codes)
- Geofence effectiveness (notifications  redemptions)

**Merchant Performance:**
- Redemptions per merchant
- Average customer value per merchant
- Offer expiration warnings

---

## 5. NATIONAL ADMIN DASHBOARD

### 5.1 Target Audience

**Primary:** National BSA staff overseeing multiple councils

### 5.2 Design Goals

- **Cross-Council Benchmarking:** Compare council performance
- **System Health:** Monitor infrastructure, errors, uptime
- **Strategic Insights:** Identify best practices, expansion opportunities

### 5.3 UI Layout (Desktop)

```

 Camp Card National Dashboard System  

 
  
   System Overview  
   
       
   25   31,450  $943.5K   99.8%   125ms 
  Councils Customers Revenue   Uptime  Latency 
       
  
 
  
  Council Performance [Export CSV]  
   
  Council  Troops Scouts Customers Revenue $/S  
    
  Bay Area 38 312 891 $26.7K $85.67 
  Central Florida 52 487 1,243 $37.3K $76.54 
  Greater NYC 65 623 1,567 $47.0K $75.44 
  Southern California 72 701 1,789 $53.7K $76.60 
  ...  
   
  Showing 5 of 25 [1] 2 3 4 5 >  
  
 
  
  Benchmarks  Growth Trends  
    
  Avg Revenue/Scout:  New Councils:  
  $78.23  +3 this quarter  
    
  Avg Conversion Rate:  Total Customers:  
  18.5%  +2,450 this month  
    
  Avg Churn Rate:  [View Trends Chart]  
  5.8%   
  
 
  
   System Health  
   
  API Uptime: 99.8%  
  Error Rate: 0.12%  
  DB Connections: 234/500  
  Kafka Lag: 45 msgs  
  Avg API Latency: 125ms  
   
  [View CloudWatch] [View Logs]  
  
 
  
   Recent Audit Events  
   
  Timestamp User Action  
    
  2h ago admin@cfc.org Created merchant  
  3h ago leader@ba.org Added scout  
  5h ago admin@nyc.org Updated offer  
   
  [View Full Audit Log]  
  
 

```

### 5.4 Metrics Definitions

| Metric | Calculation | Purpose |
|--------|-------------|---------|
| **Total Councils** | `COUNT(*)` | Program scale |
| **Total Customers** | `SUM(customers) across all councils` | User base |
| **Total Revenue** | `SUM(revenue) across all councils` | Financial health |
| **System Uptime** | `(Uptime minutes / Total minutes) * 100` | Reliability |
| **Avg API Latency** | `p50 response time across all endpoints` | Performance |
| **Revenue per Scout** | `Total Revenue / Total Scouts` | Efficiency benchmark |
| **Avg Conversion Rate** | `AVG(conversion_rate) across councils` | Effectiveness |

### 5.5 Interactive Elements

**Council Performance Table:**
- Sortable by any column
- Click council  Drill down to council dashboard (cross-tenant view)
- Color-coding: Green (above avg), Yellow (at avg), Red (below avg)

**Export CSV:**
- All councils with full metrics
- Filename: `national-council-performance-2025-12-23.csv`

**System Health Indicators:**
- Green : Healthy
- Yellow : Warning (needs attention)
- Red : Critical (page on-call)

**Audit Log:**
- Filterable by council, user, action type, date range
- Export to CSV for compliance

---

## 6. CUSTOMER DASHBOARD

### 6.1 Target Audience

**Primary:** Adult subscribers (customers)

### 6.2 Design Goals

- **Savings Focus:** Highlight value received (ROI)
- **Subscription Management:** Easy access to payment, cancellation
- **Offer Discovery:** Browse nearby deals
- **Scout Support:** Show attribution, encourage sharing

### 6.3 UI Layout (Mobile)

```

  Menu My Account  

 
  
   Your Savings  
   
  $187.50  
  Total Saved This Year  
   
  You paid $29.99, saved 6x that!  
  
 
  
   Your Subscription  
   
  Plan: Annual ($29.99/year)  
  Status: Active  
  Next billing: Dec 23, 2026  
   
  Payment: Visa ****4242  
   
  [Update Payment] [Cancel]  
  
 
  
  Supporting  
   
  Scout: Emily R.  
  Troop: 101  
  Council: Central Florida  
   
  Your subscription helps Emily  
  go to summer camp!   
  
 
  
  Your Usage  
   
  23 Offers Redeemed  
  $187.50 Estimated Savings  
  15 Merchants Visited  
   
  [View History]  
  
 
  
   Refer a Friend  
   
  Share Camp Card and help more  
  Scouts raise funds!  
   
  [Share Your Link]  
   
  (Every friend helps Emily too!)  
  
 
  
   Nearby Offers  
   
   Pizza Palace - 20% off  
  0.8 mi away  
   
   Coffee Shop - Buy 1 Get 1  
  1.2 mi away  
   
  [Browse All Offers]  
  
 

```

### 6.4 Metrics Definitions

| Metric | Calculation | Purpose |
|--------|-------------|---------|
| **Total Saved** | `SUM(redemptions.estimated_value_cents)` | ROI demonstration |
| **Offers Redeemed** | `COUNT(*) FROM redemptions` | Usage frequency |
| **Merchants Visited** | `COUNT(DISTINCT merchant_id) FROM redemptions` | Variety |
| **Subscription Status** | `subscriptions.status` | Account health |
| **Next Billing Date** | `subscriptions.current_period_end` | Renewal transparency |

### 6.5 Interactive Elements

**Update Payment Button:**
- Opens Stripe payment element
- Updates payment method on file

**Cancel Button:**
- Shows retention screen:
 - "You've saved $187.50 this year!"
 - "Your support helps Emily R. go to camp"
 - "Switch to monthly instead?"
- Confirms cancellation (sets `cancel_at_period_end = true`)

**Share Your Link:**
- Generates customer referral link (preserves root Scout)
- Native share sheet or copy-to-clipboard
- Pre-filled message

**View History:**
- Navigates to redemption history page (list view)
- Shows date, merchant, offer, estimated value

---

## 7. DATA VISUALIZATION LIBRARY

### 7.1 Recommended Libraries

**Web (React/Next.js):**
- **Chart.js** or **Recharts**  Line/bar/pie charts (revenue trends, category distribution)
- **React-Table**  Sortable, filterable tables (troop performance, council comparison)
- **Mapbox GL JS**  Geo heatmaps (customer locations, merchant density)

**Mobile (React Native):**
- **Victory Native**  Charts for RN
- **react-native-table-component**  Tables
- **React Native Maps**  Location-based features

### 7.2 Chart Types by Use Case

| Use Case | Chart Type | Example |
|----------|------------|---------|
| Revenue over time | Line chart | Daily/weekly/monthly revenue trend |
| Plan distribution | Pie chart | % Monthly vs. Annual subscribers |
| Top performers | Horizontal bar | Top 10 scouts by revenue |
| Geo distribution | Heatmap | Customer density by ZIP code |
| Conversion funnel | Funnel chart | Link clicks  Sign-ups  Active subs |
| Goal progress | Progress bar | $2,610 / $5,000 (52%) |

---

## 8. EXPORT & PRINT CAPABILITIES

### 8.1 CSV Exports

**Available Exports:**
- Scout performance (troop leader)
- Troop roster (troop leader)
- Council cross-troop comparison (council admin)
- National cross-council comparison (national admin)
- Redemption history (customer)

**Format:**
```csv
Scout Name,Direct Sign-ups,Indirect Sign-ups,Total Sign-ups,Revenue,Conversion Rate
Emily R.,18,5,23,$690,43%
Jake M.,14,3,17,$510,38%
...
```

**Implementation:**
- Client-side CSV generation (JavaScript `csv-stringify` library)
- Or server-side endpoint: `GET /reports/scouts?format=csv`

### 8.2 PDF Reports

**Available PDFs:**
- Scout performance report (monthly/quarterly)
- Troop summary report
- Council executive summary

**Format:**
- Header: Council logo + report title
- Date range
- Metrics summary (tabular)
- Charts (embedded images)
- Footer: "Generated by Camp Card on [date]"

**Implementation:**
- Server-side: **Puppeteer** (headless Chrome) to render HTML  PDF
- Or **jsPDF** client-side library

### 8.3 Printable Posters

**Templates:**
1. **8.5x11 Flyer:** Scout QR code + name + troop + tagline
2. **Door Hanger:** Compact design for door-to-door
3. **Business Card:** 3.5x2 inches, Scout contact info + QR

**Design:**
- Uses design tokens (colors, fonts, spacing)
- Dynamic: Scout name, QR code, troop number populated from data
- Generated as PDF or high-res PNG

**Bulk Print:**
- "Print All Posters" generates PDF with 1 page per Scout (troop leader)

---

## 9. REAL-TIME UPDATES

### 9.1 Update Strategy

| Dashboard | Update Method | Frequency | Rationale |
|-----------|---------------|-----------|-----------|
| **Scout** | Polling + WebSocket (optional) | 30s1min | Show recent activity in near-real-time |
| **Troop Leader** | Polling | 1 min | Performance data cached |
| **Council Admin** | Polling | 5 min | Analytics pre-aggregated |
| **National Admin** | Polling | 15 min | Cross-council rollups expensive |
| **Customer** | Real-time (subscription status) | On-demand | Payment/subscription changes immediate |

### 9.2 WebSocket Events (Optional)

**Event: `scout.subscription_created`**
```json
{
 "event": "scout.subscription_created",
 "scout_id": "scout-uuid",
 "customer_name": "Sarah P.",
 "attribution_type": "INDIRECT",
 "timestamp": "2025-12-23T10:15:30Z"
}
```

**Client Behavior:**
- Increment counters (direct/indirect sign-ups)
- Prepend to activity feed
- Show toast notification: " Sarah P. signed up!"

---

## 10. ACCESSIBILITY (WCAG AA)

### 10.1 Dashboard Requirements

1. **Color Contrast:** Minimum 4.5:1 for text, 3:1 for UI components
2. **Keyboard Navigation:** All interactive elements focusable + operable via keyboard
3. **Screen Reader Support:** Semantic HTML (headings, lists, tables), ARIA labels
4. **Focus Indicators:** Visible focus outlines (design token: `outline: 2px solid var(--cc-blue500)`)
5. **Responsive Text:** Support browser zoom up to 200%
6. **Alt Text:** All charts have text alternatives (e.g., "Line chart showing revenue increased 15% this month")

### 10.2 Scout Dashboard (Age 514) Considerations

- **Reading Level:** 3rd5th grade vocabulary
- **Icons + Text:** Always pair icons with labels (no icon-only buttons)
- **Error Messages:** Simple, friendly language ("Oops! Try again" vs. "HTTP 500 Error")
- **Touch Targets:** Min 44x44px (mobile)

---

## 11. CACHING & PERFORMANCE

### 11.1 Caching Strategy

**Redis Cache Keys:**
- `dashboard:scout:{scout_id}`  TTL 60s
- `dashboard:troop:{troop_id}`  TTL 60s
- `dashboard:council:{council_id}`  TTL 300s
- `offers:council:{council_id}`  TTL 300s

**Cache Invalidation:**
- On subscription creation  Invalidate Scout + Troop + Council dashboards
- On offer update  Invalidate offers cache
- On redemption  Invalidate customer savings cache

**Example (Pseudocode):**
```javascript
async function getScoutDashboard(scoutId) {
 const cacheKey = `dashboard:scout:${scoutId}`;
 const cached = await redis.get(cacheKey);

 if (cached) {
 return JSON.parse(cached);
 }

 const data = await db.query(/* complex aggregation */);
 await redis.setex(cacheKey, 60, JSON.stringify(data));

 return data;
}
```

### 11.2 Performance Targets

| Dashboard | Load Time (p95) | Target |
|-----------|-----------------|--------|
| Scout | < 1s | Fast for kids, low patience |
| Troop Leader | < 2s | Acceptable for desktop/tablet |
| Council Admin | < 3s | Complex analytics tolerable |
| National Admin | < 5s | Cross-tenant queries expensive |
| Customer | < 1s | Mobile-first, critical path |

---

## 12. SAMPLE UI CODE (React + Design Tokens)

### 12.1 Scout Dashboard  Fundraising Card (React)

```jsx
import React from 'react';
import './ScoutDashboard.css'; // Imports design tokens

function FundraisingCard({ totalRaisedCents, goalCents }) {
 const totalRaised = (totalRaisedCents / 100).toFixed(2);
 const goal = (goalCents / 100).toFixed(2);
 const progress = Math.min((totalRaisedCents / goalCents) * 100, 100);

 return (
 <div className="cc-card fundraising-card">
 <div className="card-icon"></div>
 <h2 className="card-title">Your Fundraising</h2>

 <div className="metric-value">${totalRaised}</div>
 <div className="metric-label">Total Raised</div>

 <div className="progress-bar-container">
 <div
 className="progress-bar-fill"
 style={{ width: `${progress}%` }}
 ></div>
 </div>
 <div className="progress-label">
 {progress.toFixed(0)}% of goal (${goal})
 </div>
 </div>
 );
}

export default FundraisingCard;
```

**CSS (using tokens):**
```css
.cc-card {
 background: var(--cc-white);
 border-radius: var(--cc-radius-card);
 padding: var(--cc-space-lg);
 box-shadow: var(--cc-shadow-card);
 margin-bottom: var(--cc-space-md);
}

.fundraising-card {
 text-align: center;
}

.card-icon {
 font-size: 48px;
 margin-bottom: var(--cc-space-sm);
}

.card-title {
 font-size: 20px;
 font-weight: 600;
 color: var(--cc-navy900);
 margin-bottom: var(--cc-space-md);
}

.metric-value {
 font-size: 48px;
 font-weight: 700;
 color: var(--cc-navy900);
 margin-bottom: var(--cc-space-xs);
}

.metric-label {
 font-size: 16px;
 color: var(--cc-blue400);
 margin-bottom: var(--cc-space-lg);
}

.progress-bar-container {
 width: 100%;
 height: 12px;
 background: var(--cc-gray200);
 border-radius: 999px;
 overflow: hidden;
 margin-bottom: var(--cc-space-xs);
}

.progress-bar-fill {
 height: 100%;
 background: linear-gradient(90deg, var(--cc-red500), var(--cc-red600));
 transition: width 0.3s ease;
}

.progress-label {
 font-size: 14px;
 color: var(--cc-blue400);
}
```

---

## 13. SUMMARY

### 13.1 Dashboard Deliverables

| Dashboard | Key Metrics | Key Actions | Priority |
|-----------|-------------|-------------|----------|
| **Scout** | Total raised, sign-ups, conversion rate | Share link, print posters | P0 (MVP) |
| **Troop Leader** | Troop total, per-Scout performance, pending claims | Add Scout, sell card (POS), export | P0 (MVP) |
| **Council Admin** | Customers, revenue, merchants, offers | Manage merchants/offers, create campaigns | P0 (MVP) |
| **National Admin** | Cross-council comparison, system health | View audit logs, export | P2 (V2) |
| **Customer** | Total saved, subscription status | Update payment, cancel, share | P0 (MVP) |

### 13.2 Implementation Checklist

- [ ] Design mockups for all 5 dashboards (Figma)
- [ ] Implement Scout dashboard (mobile-first, age 514 UX)
- [ ] Implement Troop Leader dashboard (responsive)
- [ ] Implement Council Admin dashboard (desktop-optimized)
- [ ] Implement Customer dashboard (mobile-first)
- [ ] Implement National Admin dashboard (V2)
- [ ] Add CSV export functionality
- [ ] Add PDF report generation
- [ ] Add printable poster templates
- [ ] Implement caching layer (Redis)
- [ ] Add real-time updates (polling or WebSocket)
- [ ] WCAG AA accessibility audit
- [ ] Performance testing (load time targets)

---

**END OF PART 6**

**Next:** Part 7  UX/UI & Design System Integration
