# Camp Card  MultiTenant Mobile App UI/UX Prototype

This package contains a **mobile-first, responsive HTML prototype** for a **multi-tenant Camp Card app** with one login and three role experiences:

- **Customer**
 - Login / Sign up
 - Home
 - Discount Offers
 - Settings (Profile, Geo Notifications)
- **Troop Leader**
 - Home (Funds Raised, Camp Cards Sold, Goal)
 - Share Link
 - Scouts Management
 - Settings / Profile
- **Scout**
 - Home (Funds Raised, Camp Cards Sold, Goal)
 - Share Link
 - Settings / Profile

## Open the prototype

1. Unzip the folder
2. Open `index.html` in a browser (Chrome/Edge/Safari)

> Tip: On desktop, the UI is shown inside a phone preview. It is still fully responsive.

## Demo shortcuts

- Press **1**  Customer
- Press **2**  Troop Leader
- Press **3**  Scout
- Click the **role pill** in the header to cycle roles.

## Assets

`assets/images/` includes the Camp Card lockups, council mark, background, app icon, and reference landing page designs from earlier in the chat.

## Implementation notes for React Native teams

This prototype is intended as a **UI/UX reference**. For React Native implementation:

- Use the design tokens in `css/brand-tokens.css` (colors, radius, shadows).
- Treat the card surfaces as rounded containers with subtle shadow.
- Keep role-based navigation:
 - Customer: **Home / Offers / Settings**
 - Leader: **Home / Share / Scouts / Settings**
 - Scout: **Home / Share / Settings**
- Multi-tenant: tenant (council) should come from the authenticated user and be shown in the header + settings.

## Files

- `index.html`  the prototype (all screens included)
- `css/app.css`  component styling + layout
- `css/brand-tokens.css`  palette & tokens
- `js/app.js`  routing, sample data, interactions
