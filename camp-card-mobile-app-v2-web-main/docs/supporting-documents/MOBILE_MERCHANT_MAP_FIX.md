# Mobile App - Merchant Map & Offers Integration

**Status:** Complete - Connected to Backend API
**Date:** December 27, 2025

---

## What Was Fixed

### Issue 1: Merchant Map Not Showing
**Solution:** Created new **MerchantsMapScreen** with:
- Geolocation integration
- Radius-based filtering (5, 10, 15, 20 km)
- Category filtering (DINING, AUTO, ENTERTAINMENT)
- Map integration (tap to open Google Maps)
- Real-time location tracking

### Issue 2: Web Portal Offers Not Showing in Mobile App
**Solution:**
- Mobile app now connects to backend `/offers` API endpoint
- OffersScreen configured to fetch from backend
- Real-time data sync with backend
- Displays all offers created in web portal

---

## New Screen: Nearby Offers Map

### Location
`repos/camp-card-mobile/src/screens/customer/MerchantsMapScreen.tsx`

### Features

#### 1. **Location Detection**
- Requests user permission (iOS/Android)
- Gets current user location
- Falls back to Orlando (28.54, -81.38) for demo

#### 2. **Search Radius**
- 5 km, 10 km, 15 km, 20 km options
- Real-time filtering by distance
- Location-aware distance calculation

#### 3. **Category Filtering**
- All (no filter)
- DINING
- AUTO
- ENTERTAINMENT

#### 4. **Merchant Display**
- Merchant name
- Location name
- Distance from user
- Tap to open in Google Maps

#### 5. **Map Integration**
- Tap merchant  Opens Google Maps
- Shows location with coordinates
- Easy directions navigation

---

##  Services Created

### File: `merchantsService.ts`
```typescript
// Get all merchants
getMerchants(): Promise<Merchant[]>

// Get merchant by ID
getMerchant(id: number): Promise<Merchant | null>

// Get nearby offers (with geolocation)
getNearbyOffers(
 latitude: number,
 longitude: number,
 radiusKm?: number,
 category?: string
): Promise<NearbyOffersResponse>

// Get merchant locations
getMerchantLocations(merchantId: number): Promise<MerchantLocation[]>
```

---

##  Navigation Integration

### Customer Tab Bar Updated
**New Tab:** "Map" (with map icon)

**Updated Tab Order:**
1. Dashboard (speedometer)
2. Wallet (wallet)
3. **Map (map)**  NEW
4. Redeem (qr-code)
5. Offers (pricetags)
6. Settings (settings)

### Type Definitions Added
```typescript
export type CustomerTabParamList = {
 Dashboard: undefined;
 Wallet: undefined;
 Map: undefined; //  NEW
 Redemption: undefined;
 Offers: undefined;
 Settings: { role: 'customer' };
};
```

---

##  Backend API Endpoints Used

### 1. Nearby Offers (Geolocation)
```
GET /merchants/nearby?latitude=X&longitude=Y&radius_km=Z&category=CAT
```

**Response:**
```json
{
 "offers": [
 {
 "merchant_name": "Pizza Palace",
 "location_name": "Downtown Location",
 "distance_km": 0.2,
 "map_url": "https://maps.google.com/?q=28.538300,-81.379200"
 }
 ],
 "total": 1,
 "user_latitude": 28.54,
 "user_longitude": -81.38,
 "search_radius_km": 10.0
}
```

### 2. All Offers
```
GET /offers
```

**Used by:** OffersScreen
**Returns:** All offers created in web portal

### 3. Merchants
```
GET /merchants
GET /merchants/{id}
GET /merchants/{id}/locations
```

---

## UI Components Used

- `Card` - Merchant/offer display card
- `EmptyState` - No results message
- `ErrorState` - Error handling
- `Ionicons` - Icons (map, warning, etc.)
- React Native `FlatList` - Scrollable list
- React Native `Location` (expo-location) - GPS

---

## Permissions Required

### iOS
- Location permission (always/while using)

### Android
- `ACCESS_FINE_LOCATION` permission

**Request Flow:**
1. App requests permission
2. User grants/denies
3. If denied, shows warning with fallback location
4. Works either way (demo location available)

---

## Current Test Data

### Test Customer
- **Name:** Emily Rodriguez
- **Email:** emily.rodriguez@campcard.com
- **Password:** Valipay2@23!$!
- **Card:** CARD-322278
- **Balance:** $250.00
- **Loyalty Points:** 1500

### Test Merchants
1. **Pizza Palace** (DINING)
 - Location: Downtown, Orlando
 - Offer: 20% off

2. **AutoCare** (AUTO)
 - Location: Service Center
 - Offer: $10 off oil change

3. **Fun Zone** (ENTERTAINMENT)
 - Location: Front Gate
 - Offer: Buy 1 Get 1 50% off

---

## How It Works

1. **User opens Map tab**  Requests location permission
2. **Gets user location**  Uses GPS coordinates
3. **Queries backend**  `/merchants/nearby` endpoint
4. **Displays results**  Shows nearby offers with distances
5. **User taps merchant**  Opens in Google Maps
6. **User can filter**  By radius and category
7. **Real-time updates**  Changes reflect immediately

---

## Testing Checklist

- Location permission request works
- Geolocation calculates distance correctly
- Radius filtering (5-20km) works
- Category filtering works
- Google Maps opens on tap
- No results message displays correctly
- Error handling shows fallback message
- Loading state shows spinner
- Integration with backend `/offers` endpoint
- Web portal offers sync to mobile app

---

## Files Modified/Created

**New Files:**
- `src/services/merchantsService.ts` (109 lines)
- `src/screens/customer/MerchantsMapScreen.tsx` (277 lines)

**Modified Files:**
- `src/navigation/RootNavigator.tsx` (added Map tab)
- `src/screens/customer/WalletScreen.tsx` (added flip card)

---

##  Connected APIs

**Backend Base URL:** `http://localhost:8080`

**Endpoints Connected:**
- `GET /offers` - All offers
- `GET /merchants` - All merchants
- `GET /merchants/{id}` - Merchant details
- `GET /merchants/nearby` - Nearby offers with geolocation
- `GET /merchants/{id}/locations` - Merchant locations

---

## Next Steps

1. **Real-time geofence notifications** - Notify when user enters merchant radius
2. **Advanced map features** - Show merchant markers on map
3. **Filtering persistence** - Remember user's preferred radius/category
4. **Favorites** - Save favorite merchants
5. **Reviews & ratings** - Show merchant ratings
6. **Operating hours** - Display merchant hours
7. **Directions** - Deep link to turn-by-turn navigation

---

**Status:** Ready for Testing
**Backend:** Running on port 8080
**Mobile App:** Connected and synced

