# Information Architecture & Navigation

## Global

- **Tenant (Council):** Central Florida Council (multi-tenant ready)
- **One authentication:** Single sign-in + sign-up; role comes from permissions

## Customer app (React Native)

Bottom tabs:
1. **Home**
2. **Offers**
3. **Settings**

Key screens:
- Home
 - Hero / value proposition
 - Quick actions: Browse offers, Find stores
 - Featured offers
- Offers
 - Offer list + filters (category, near me)
 - Offer card pattern: title, meta, chip, primary CTA
- Settings
 - Profile management
 - Notifications (Geo notifications toggle)
 - Tenant / council section (view/switch)

## Troop Leader app (React Native)

Bottom tabs:
1. **Home**
2. **Share**
3. **Scouts**
4. **Settings**

Key screens:
- Home (Dashboard)
 - Funds raised
 - Camp Cards sold
 - Goal progress bar
 - Quick actions to Share and Scouts
- Share link
 - Copy + Share CTA
 - QR code block (placeholder here; integrate real QR in production)
- Scouts management
 - List of Scouts with cards + funds
 - Add Scout (prototype uses a prompt; production uses an add flow)
- Settings / Profile
 - Profile, troop info
 - Export/report tools

## Scout app (React Native)

Bottom tabs:
1. **Home**
2. **Share**
3. **Settings**

Key screens:
- Home
 - Funds raised
 - Camp Cards sold
 - Goal progress
 - Quick share CTA
- Share link
 - Copy + Share CTA
 - QR block placeholder
- Settings / Profile
 - Profile, goal

## Component patterns

- **Hero Card:** navy radial gradient, lockup image, 2 key stats, optional progress
- **Stat Card:** label + big value (consistent typography)
- **Offer Card:** title + meta + chip + right-aligned CTA
- **Settings Row:** label + description + action or toggle
- **Bottom Tab Bar:** rounded, elevated, red active state

