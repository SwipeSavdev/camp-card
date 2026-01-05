# Camp Card Mobile App  UX Improvement Roadmap

**Status:** Prioritized Feature Backlog
**Planning Horizon:** Q1 2026 (12 weeks)
**Owned By:** Product Design + Frontend Engineering

---

## OVERVIEW

This roadmap prioritizes 12 UX improvements across 4 major app sections (Offers, Offer Details, Leader Dashboard, Scout Experience). Each improvement includes:

- **Impact Score** (15): Expected user benefit & business impact
- **Effort Score** (15): Engineering complexity & time investment
- **Ratio** (Impact/Effort): Priority scoring (higher = better ROI)
- **Design Details**: Mockup description, interaction flow
- **Implementation Notes**: Components, API requirements, design tokens

---

## PRIORITY MATRIX

```
Effort 
Impact 
 | 1 (Easy) | 2 (Simple) | 3 (Medium) | 4 (Hard) | 5 (Complex) |
--------|-----------------|-----------------|-----------------|-----------------|-----------------|
5 | **P1** Filters | **P2** Distance | **P5** Share | Category Icons | Personalization |
(High) | [5.0 ratio] | Sort [2.5 ratio]| [2.5 ratio] | [1.25 ratio] | [1.0 ratio] |
--------|-----------------|-----------------|-----------------|-----------------|-----------------|
4 | Status Badge | Empty States | **P3** Map | **P8** Rewards | Merchant Pages |
 | [4.0 ratio] | [2.0 ratio] | [1.33 ratio] | [0.5 ratio] | [0.4 ratio] |
--------|-----------------|-----------------|-----------------|-----------------|-----------------|
3 | Progress Ring | Tooltip Hints | Social Proof | Gift Cards | Analytics |
 | [3.0 ratio] | [1.5 ratio] | [1.0 ratio] | [0.38 ratio] | [0.3 ratio] |
--------|-----------------|-----------------|-----------------|-----------------|-----------------|
2 | Loading States | Undo/Redo | Multi-language | Voice Search | AR Try-On |
(Low) | [2.0 ratio] | [0.67 ratio] | [0.67 ratio] | [0.25 ratio] | [0.2 ratio] |
--------|-----------------|-----------------|-----------------|-----------------|-----------------|
```

**Legend:**
- **P1P8**: Top 8 priorities (recommended 12-week sprint plan)
- **Ratio**: Impact / Effort (higher is better ROI)
- Non-bolded: Lower priority, defer to Q2+

---

## PHASE 1: QUICK WINS (Weeks 12)

### P1: Add Filter & Sort UI to Offers List

**Impact Score:** 5/5 (Users find relevant offers 3x faster)
**Effort Score:** 1/5 (Simple horizontal scroll component)
**Ratio:** 5.0

**Problem:**
Users must scroll through all offers to find specific categories or nearby deals.

**Solution:**
Horizontal filter bar with categories + sort dropdown.

**Design:**
```

 [All] [Food] [Retail] [Entertainment] 
 
 Sort: Distance  

```

**Implementation:**
```tsx
// Component: FilterBar.tsx
interface FilterBarProps {
 categories: string[];
 selectedCategory: string;
 onCategoryChange: (cat: string) => void;
 sortBy: 'distance' | 'newest' | 'title';
 onSortChange: (sort: typeof sortBy) => void;
}

export function FilterBar({
 categories,
 selectedCategory,
 onCategoryChange,
 sortBy,
 onSortChange,
}: FilterBarProps) {
 return (
 <View>
 {/* Horizontal category pills */}
 <ScrollView horizontal showsHorizontalScrollIndicator={false}>
 <View style={{ flexDirection: 'row', gap: space.sm, paddingHorizontal: space.lg }}>
 {categories.map(cat => (
 <Pressable
 key={cat}
 onPress={() => onCategoryChange(cat)}
 style={{
 paddingHorizontal: space.md,
 paddingVertical: space.sm,
 borderRadius: radius.md,
 backgroundColor: selectedCategory === cat ? colors.blue500 : colors.white,
 borderWidth: selectedCategory === cat ? 0 : 1,
 borderColor: colors.gray200,
 }}
 accessible={true}
 accessibilityRole="button"
 accessibilityLabel={`Filter by ${cat}`}
 accessibilityState={{ selected: selectedCategory === cat }}
 >
 <Text
 style={{
 color: selectedCategory === cat ? colors.white : colors.text,
 fontWeight: selectedCategory === cat ? '700' : '500',
 }}
 >
 {cat}
 </Text>
 </Pressable>
 ))}
 </View>
 </ScrollView>

 {/* Sort dropdown */}
 <View style={{ paddingHorizontal: space.lg, marginTop: space.md }}>
 <Pressable
 onPress={() => {/* Show sort menu */}}
 style={{
 flexDirection: 'row',
 alignItems: 'center',
 paddingHorizontal: space.md,
 paddingVertical: space.sm,
 borderRadius: radius.md,
 borderWidth: 1,
 borderColor: colors.gray200,
 }}
 accessible={true}
 accessibilityRole="button"
 accessibilityLabel={`Sort by ${sortBy}`}
 >
 <Text style={{ flex: 1, color: colors.text }}>
 Sort: {sortBy === 'distance' ? 'Nearest' : sortBy === 'newest' ? 'Newest' : 'Title'}
 </Text>
 <Text></Text>
 </Pressable>
 </View>
 </View>
 );
}
```

**Backend Required:**
- `GET /offers?category={name}&sort=distance|newest|title`

**Data Flow:**
```
OffersScreen
  useState: selectedCategory, sortBy
  useQuery: offers (depends on category, sort)
  FilterBar  triggers category/sort change  refetch
```

**Estimated Time:** 23 hours
**Testing:** Filter logic, sort order accuracy, accessibility

---

### P2: Add Distance Sorting & "Near Me" Indicator

**Impact Score:** 4/5 (Geo-proximity is highly valuable for redemption)
**Effort Score:** 2/5 (Uses device location + backend distance calc)
**Ratio:** 2.5

**Problem:**
Offers shown in arbitrary order; users can't find nearby merchants.

**Solution:**
Sort by distance (closest first); show "Near you" badge for offers within 5km.

**Design:**
```

  Restaurant Name [NEAR YOU] 
 Restaurant  Food 
  0.8 km away 
 Great lunch specials for scouts 

```

**Implementation:**
```tsx
// In OfferRow component
const isNearby = distance && distance < 5;

<Text style={{
 marginTop: space.xs,
 color: colors.blue500,
 fontWeight: '700',
 fontSize: 12,
}}>
 {isNearby && ' NEAR YOU  '}
 {distance?.toFixed(1)} km away
</Text>

// In FilterBar sort dropdown
<Pressable
 onPress={() => onSortChange('distance')}
 style={{
 paddingVertical: space.sm,
 paddingHorizontal: space.md,
 backgroundColor: sortBy === 'distance' ? colors.blue100 : colors.white,
 }}
>
 <Text style={{ color: colors.text }}>
 Nearest first ( Closest)
 </Text>
</Pressable>
```

**Backend Required:**
- Include `locations[0].distance_km` in offer response
- `GET /offers?sort=distance` endpoint

**Permission Required:**
```tsx
import * as Location from 'expo-location';

useEffect(() => {
 (async () => {
 let { status } = await Location.requestForegroundPermissionsAsync();
 if (status !== 'granted') return;
 let location = await Location.getCurrentPositionAsync({});
 // Pass latitude/longitude to backend for distance calculation
 })();
}, []);
```

**Estimated Time:** 34 hours
**Testing:** Geolocation accuracy, distance sorting, permission flow

---

### P3: Add Location Map Preview to Offer Details

**Impact Score:** 5/5 (Redemption friction drops significantly with map)
**Effort Score:** 3/5 (Requires `react-native-maps` integration)
**Ratio:** 1.33

**Problem:**
Offer text address is unclear; users don't know exactly where to go.

**Solution:**
Show interactive map with merchant pin + address + "Open in Maps" button.

**Design:**
```

 [ MAP with merchant pin ] 

  123 Main St, Springfield, IL 
 
 [Open in Maps] [Copy Address] 

```

**Implementation:**
```tsx
import MapView, { Marker } from 'react-native-maps';
import * as Linking from 'expo-linking';

<Card padded={false} style={{ overflow: 'hidden' }}>
 {offer.locations?.[0]?.latitude && (
 <MapView
 style={{ height: 200, width: '100%' }}
 initialRegion={{
 latitude: offer.locations[0].latitude,
 longitude: offer.locations[0].longitude,
 latitudeDelta: 0.05,
 longitudeDelta: 0.05,
 }}
 zoomEnabled={true}
 scrollEnabled={true}
 >
 <Marker
 coordinate={{
 latitude: offer.locations[0].latitude,
 longitude: offer.locations[0].longitude,
 }}
 title={offer.merchant?.business_name}
 pinColor={colors.red500}
 onPress={() => {
 // Handle marker tap
 }}
 />
 </MapView>
 )}

 <View style={{ padding: space.lg }}>
 <Text style={{ fontWeight: '900', marginBottom: space.sm }}>
 Redeem Here
 </Text>
 <Text
 numberOfLines={2}
 ellipsizeMode="tail"
 style={{ color: colors.muted, marginBottom: space.md }}
 >
 {offer.locations[0]?.address}
 </Text>

 <View style={{ gap: space.md }}>
 <Button
 label=" Open in Maps"
 onPress={() => {
 const url = `http://maps.apple.com/?address=${encodeURIComponent(
 offer.locations[0].address
 )}`;
 Linking.openURL(url);
 }}
 />
 <Button
 label=" Copy Address"
 variant="secondary"
 onPress={() => {
 Clipboard.setString(offer.locations[0].address);
 // Show toast notification
 }}
 />
 </View>
 </View>
</Card>
```

**Installation:**
```bash
npx expo install react-native-maps
```

**Backend Required:**
- Ensure `locations[0].latitude` & `locations[0].longitude` in offer response

**Estimated Time:** 45 hours
**Testing:** Map rendering, marker placement, deep-linking to Apple/Google Maps

---

## PHASE 2: CORE FEATURES (Weeks 36)

### P4: Add Social Sharing & Save-for-Later

**Impact Score:** 4/5 (Viral word-of-mouth growth; daily active offers)
**Effort Score:** 2/5 (Native Share API + Zustand store)
**Ratio:** 2.0

**Problem:**
No way for users to share offers with friends or save favorites.

**Solution:**
"Share" button (native share menu) + heart icon to save offers to Favorites tab.

**Design:**
```

 Offer Details 

 
 [ Share with Friends] [ Save] 
 
 Shares to Messages, Email, etc. 

```

**Implementation:**
```tsx
import { Share } from 'react-native';

// Zustand store for saved offers
import { create } from 'zustand';

interface SavedOffersStore {
 savedOfferIds: string[];
 toggleSaveOffer: (offerId: string) => void;
 isSaved: (offerId: string) => boolean;
}

export const useSavedOffersStore = create<SavedOffersStore>((set, get) => ({
 savedOfferIds: [],
 toggleSaveOffer: (offerId: string) => {
 const { savedOfferIds } = get();
 if (savedOfferIds.includes(offerId)) {
 set({ savedOfferIds: savedOfferIds.filter(id => id !== offerId) });
 } else {
 set({ savedOfferIds: [...savedOfferIds, offerId] });
 }
 },
 isSaved: (offerId: string) => {
 return get().savedOfferIds.includes(offerId);
 },
}));

// In OfferDetailsScreen
const { savedOfferIds, toggleSaveOffer } = useSavedOffersStore();
const isSaved = savedOfferIds.includes(String(offer.id));

<View style={{ flexDirection: 'row', gap: space.md }}>
 <Button
 label=" Share with Friends"
 onPress={async () => {
 try {
 const appStoreLink = 'https://apps.apple.com/app/campcard';
 const playStoreLink = 'https://play.google.com/store/apps/details?id=com.campcard';

 await Share.share({
 message: `Check out this offer: ${offer.title} from ${offer.merchant?.business_name}. ${offer.description}\n\nDownload Camp Card:\nios: ${appStoreLink}\nandroid: ${playStoreLink}`,
 url: appStoreLink, // iOS
 title: offer.title,
 });
 } catch (e) {
 console.error('Share failed:', e);
 }
 }}
 style={{ flex: 1 }}
 />

 <Pressable
 onPress={() => toggleSaveOffer(String(offer.id))}
 style={{
 width: 44,
 height: 44,
 alignItems: 'center',
 justifyContent: 'center',
 borderRadius: radius.lg,
 borderWidth: 1,
 borderColor: isSaved ? colors.red500 : colors.gray200,
 backgroundColor: isSaved ? colors.red100 : colors.white,
 }}
 accessible={true}
 accessibilityRole="button"
 accessibilityLabel={isSaved ? 'Remove from favorites' : 'Save to favorites'}
 >
 <Text style={{ fontSize: 20 }}>
 {isSaved ? '' : ''}
 </Text>
 </Pressable>
</View>

// New Favorites tab in navigation
// Shows all savedOfferIds
```

**Storage:**
```tsx
// Persist to AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

useEffect(() => {
 (async () => {
 const saved = await AsyncStorage.getItem('savedOffers');
 if (saved) {
 set({ savedOfferIds: JSON.parse(saved) });
 }
 })();
}, []);

// On save/unsave
useEffect(() => {
 AsyncStorage.setItem('savedOffers', JSON.stringify(savedOfferIds));
}, [savedOfferIds]);
```

**Estimated Time:** 34 hours
**Testing:** Share to various apps, favorites persistence, accessibility

---

### P5: Add Merchant Spotlight & Personalization

**Impact Score:** 4/5 (Increases click-through rate by ~25%; merchant partnerships)
**Effort Score:** 3/5 (Hero image carousel + API integration)
**Ratio:** 1.33

**Problem:**
Home screen shows generic welcome; no discovery of new merchants.

**Solution:**
Featured merchant spotlight with hero image + quick offer browse.

**Design:**
```

 
   Spotlight: Best Pizza Co. 
  5 offers available today 
  [Browse 5 Offers] [Show More] 
 

```

**Implementation:**
```tsx
import { FlatList } from 'react-native';

// In HomeScreen
const { data: spotlightMerchants } = useQuery({
 queryKey: ['merchants', 'featured'],
 queryFn: async () => {
 const res = await fetch('/api/v1/merchants/featured?limit=5');
 return res.json();
 },
});

// Carousel of spotlight merchants
<FlatList
 horizontal
 pagingEnabled
 scrollEventThrottle={16}
 data={spotlightMerchants}
 renderItem={({ item: merchant }) => (
 <View style={{ width: screenWidth, paddingHorizontal: space.lg }}>
 <Card padded={false} style={{ overflow: 'hidden' }}>
 <ImageBackground
 source={{ uri: merchant.logo_url || merchant.hero_image_url }}
 style={{
 height: 200,
 justifyContent: 'flex-end',
 padding: space.lg,
 }}
 imageStyle={{ opacity: 0.6 }}
 >
 <View style={{ backgroundColor: 'rgba(0, 12, 47, 0.7)', padding: space.md, borderRadius: radius.lg }}>
 <Text numberOfLines={1} style={{ color: colors.white, fontSize: 18, fontWeight: '900' }}>
 {merchant.business_name}
 </Text>
 <Text style={{ color: 'rgba(255, 255, 255, 0.85)', marginTop: space.xs, fontSize: 14 }}>
 {merchant.offers_count} offers available
 </Text>
 </View>
 </ImageBackground>

 <View style={{ padding: space.lg, gap: space.sm }}>
 <Button
 label={`Browse ${merchant.offers_count} offers`}
 onPress={() => navigation.navigate('OffersByMerchant', { merchantId: merchant.id })}
 />
 </View>
 </Card>
 </View>
 )}
 keyExtractor={item => String(item.id)}
/>
```

**Backend Required:**
- `GET /merchants/featured?limit=5` (curated by admin)
- Merchant model includes: `logo_url`, `hero_image_url`, `offers_count`

**Estimated Time:** 45 hours
**Testing:** Image loading, carousel swipe, navigation to merchant offers

---

### P6: Add Progress Ring & Activity Feed to Leader Dashboard

**Impact Score:** 4/5 (Gamification increases engagement by ~30%)
**Effort Score:** 2/5 (Uses `react-native-progress` + mock data)
**Ratio:** 2.0

**Problem:**
Leader dashboard shows static "At-a-glance" metrics; no engagement/motivation.

**Solution:**
Visual progress ring toward fundraising goal + real-time activity feed.

**Design:**
```

 [] 
 45/100 Subscriptions 
 Estimated Raised: $5,400 

 Recent Activity 
  Emily J. sold subscription 
 2 mins ago 
  Alex P. joined the troop 
 15 mins ago 

```

**Implementation:**
```tsx
import ProgressCircle from 'react-native-progress/Circle';

// In LeaderHomeScreen
const { data: metrics } = useQuery({
 queryKey: ['metrics', 'troop', user.id],
 queryFn: async () => {
 const res = await fetch(`/api/v1/troops/${user.id}/metrics`);
 return res.json();
 },
 refetchInterval: 30000, // Refetch every 30 seconds
});

const { data: activities } = useQuery({
 queryKey: ['activities', 'troop', user.id],
 queryFn: async () => {
 const res = await fetch(`/api/v1/troops/${user.id}/activities?limit=10`);
 return res.json();
 },
 refetchInterval: 10000, // Live updates
});

<Card>
 <View style={{ alignItems: 'center', marginBottom: space.lg }}>
 <ProgressCircle
 size={160}
 thickness={12}
 progress={metrics.subscriptionsSold / metrics.subscriptionsGoal}
 color={colors.blue500}
 unfilledColor={colors.gray200}
 borderWidth={0}
 />
 <Text style={{ marginTop: space.lg, fontSize: 18, fontWeight: '900' }}>
 {metrics.subscriptionsSold}/{metrics.subscriptionsGoal} Subscriptions
 </Text>
 <Text style={{ color: colors.muted, marginTop: space.xs }}>
 {Math.round((metrics.subscriptionsSold / metrics.subscriptionsGoal) * 100)}% of goal
 </Text>
 <Text style={{ color: colors.green600, marginTop: space.md, fontWeight: '700', fontSize: 16 }}>
 ${(metrics.estimatedFundraising).toLocaleString()} raised
 </Text>
 </View>
</Card>

// Activity feed
<Card>
 <Text style={{ fontSize: 16, fontWeight: '900', marginBottom: space.md }}>
 Recent Activity
 </Text>
 <FlatList
 data={activities}
 scrollEnabled={false}
 renderItem={({ item }) => (
 <View style={{ flexDirection: 'row', marginBottom: space.md, gap: space.md }}>
 <View
 style={{
 width: 40,
 height: 40,
 borderRadius: 20,
 backgroundColor: colors.blue100,
 alignItems: 'center',
 justifyContent: 'center',
 }}
 >
 <Text style={{ fontSize: 18 }}>
 {item.type === 'subscription_sold' ? '' : item.type === 'scout_joined' ? '' : ''}
 </Text>
 </View>
 <View style={{ flex: 1 }}>
 <Text numberOfLines={1} style={{ fontWeight: '700' }}>
 {item.actor.name}
 </Text>
 <Text numberOfLines={2} style={{ color: colors.muted, fontSize: 14, marginTop: 4 }}>
 {item.description}
 </Text>
 <Text style={{ color: colors.gray400, fontSize: 12, marginTop: 4 }}>
 {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
 </Text>
 </View>
 </View>
 )}
 keyExtractor={item => item.id}
 />
</Card>
```

**Backend Required:**
- `GET /troops/{troopId}/metrics` (subscriptions, revenue, goal)
- `GET /troops/{troopId}/activities?limit=10` (activity feed with timestamps)

**Estimated Time:** 34 hours
**Testing:** Metric accuracy, activity feed real-time updates, accessibility

---

## PHASE 3: ADVANCED FEATURES (Weeks 712)

### P7: Add Scout Leaderboard & Gamification

**Impact Score:** 4/5 (Friendly competition increases engagement by ~40%)
**Effort Score:** 2/5 (Ranked list + badges)
**Ratio:** 2.0

**Problem:**
Scouts have no visibility into peer performance; no gamification incentive.

**Solution:**
Monthly leaderboard with badges ( Gold,  Silver,  Bronze) and milestone rewards.

**Design:**
```

 Scout Leaderboard (This Month) 

  Emily J. 45 subscriptions 
 $5,400 raised 
  Alex P. 32 subscriptions 
 $3,840 raised 
  Sam R. 28 subscriptions 
 $3,360 raised 

 Milestone Badges: 
  10 Subscriptions (complete) 
  25 Subscriptions (3 left) 
  50 Subscriptions (22 left) 

```

**Implementation:**
```tsx
interface ScoutRanking {
 rank: number;
 scout: { id: string; name: string; avatar?: string };
 subscriptions: number;
 revenue: number;
 badges: string[];
}

function ScoutLeaderboard({ scouts, period = 'month' }: {
 scouts: ScoutRanking[];
 period: 'week' | 'month' | 'allTime';
}) {
 return (
 <Card>
 <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: space.lg }}>
 <Text style={{ fontWeight: '900', fontSize: 18 }}> Top Scouts ({period})</Text>
 <Pressable
 onPress={() => {/* Navigate to full leaderboard */}}
 accessible={true}
 accessibilityRole="button"
 accessibilityLabel="View full leaderboard"
 >
 <Text style={{ color: colors.blue500, fontWeight: '700' }}>View all </Text>
 </Pressable>
 </View>

 {scouts.slice(0, 3).map((scout, index) => (
 <View
 key={scout.scout.id}
 style={{
 flexDirection: 'row',
 alignItems: 'center',
 marginBottom: space.md,
 paddingBottom: space.md,
 borderBottomWidth: index < 2 ? 1 : 0,
 borderColor: colors.gray200,
 }}
 >
 {/* Medal */}
 <View
 style={{
 width: 36,
 height: 36,
 borderRadius: 18,
 backgroundColor: index === 0 ? '#FCD34D' : index === 1 ? '#D4D4D8' : '#A89968',
 alignItems: 'center',
 justifyContent: 'center',
 marginRight: space.md,
 }}
 >
 <Text style={{ fontSize: 16, fontWeight: '900' }}>
 {index === 0 ? '' : index === 1 ? '' : ''}
 </Text>
 </View>

 {/* Scout info */}
 <View style={{ flex: 1 }}>
 <Text numberOfLines={1} style={{ fontWeight: '700', color: colors.text }}>
 {scout.scout.name}
 </Text>
 <Text style={{ color: colors.muted, fontSize: 12 }}>
 {scout.subscriptions} subscriptions
 </Text>
 </View>

 {/* Revenue */}
 <Text style={{ fontWeight: '900', color: colors.green600, fontSize: 16 }}>
 ${scout.revenue.toLocaleString()}
 </Text>
 </View>
 ))}

 {/* Milestone badges */}
 <View style={{ marginTop: space.lg, paddingTop: space.lg, borderTopWidth: 1, borderColor: colors.gray200 }}>
 <Text style={{ fontWeight: '900', marginBottom: space.md }}>Milestone Badges</Text>
 <View style={{ flexDirection: 'row', gap: space.md, flexWrap: 'wrap' }}>
 {[10, 25, 50].map(threshold => {
 const mySubscriptions = scouts.find(s => s.scout.id === user.id)?.subscriptions || 0;
 const isComplete = mySubscriptions >= threshold;
 const progress = Math.min(mySubscriptions / threshold, 1);

 return (
 <View
 key={threshold}
 style={{
 width: '31%',
 paddingHorizontal: space.sm,
 paddingVertical: space.md,
 borderRadius: radius.md,
 backgroundColor: isComplete ? colors.green100 : colors.gray100,
 borderWidth: 1,
 borderColor: isComplete ? colors.green300 : colors.gray300,
 alignItems: 'center',
 }}
 >
 <Text style={{ fontSize: 20 }}>{isComplete ? '' : ''}</Text>
 <Text style={{ marginTop: space.xs, fontSize: 12, fontWeight: '700', color: colors.text }}>
 {threshold}
 </Text>
 <Text style={{ fontSize: 10, color: colors.muted, marginTop: 2 }}>
 {isComplete ? 'Earned!' : `${threshold - mySubscriptions} to go`}
 </Text>
 </View>
 );
 })}
 </View>
 </View>
 </Card>
 );
}
```

**Backend Required:**
- `GET /troops/{troopId}/scouts/leaderboard?period=month|week|allTime`
- Response includes: `rank, scout, subscriptions, revenue, badges`

**Estimated Time:** 45 hours
**Testing:** Ranking accuracy, badge unlock logic, accessibility

---

### P8: Add "Save Scout" Referral Attribution

**Impact Score:** 4/5 (Drives customer-to-customer referral growth)
**Effort Score:** 2/5 (Deep-linking + unique referral codes)
**Ratio:** 2.0

**Problem:**
Users can't attribute new customers to specific Scouts; loss of referral credit.

**Solution:**
Unique Scout referral link (QR + shareable URL) that auto-registers referrer on signup.

**Design:**
```

 Share Your Scout Link 

 [ QR Code Image ] 
 
 campcard.app/join/emily-smith 
 
 [ Copy] [ Share] [ Refresh] 

```

**Implementation:**
```tsx
import { Share } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

// In ScoutShareScreen
const { user } = useAuthStore();
const referralCode = `${user.id}-${Date.now().toString(36)}`;
const referralUrl = `https://campcard.app/join/${referralCode}`;

const { data: referralStats } = useQuery({
 queryKey: ['referral-stats', referralCode],
 queryFn: async () => {
 const res = await fetch(`/api/v1/scouts/${user.id}/referral-stats`);
 return res.json();
 },
});

<Card>
 <Text style={{ fontWeight: '900', marginBottom: space.md }}>Share Your Scout Link</Text>

 <View style={{ alignItems: 'center', marginVertical: space.lg }}>
 <QRCode
 value={referralUrl}
 size={200}
 color={colors.navy900}
 backgroundColor={colors.white}
 />
 </View>

 <Text
 numberOfLines={1}
 ellipsizeMode="tail"
 style={{ textAlign: 'center', color: colors.blue500, marginBottom: space.md }}
 >
 {referralUrl}
 </Text>

 <View style={{ flexDirection: 'row', gap: space.sm }}>
 <Button
 label=" Copy Link"
 variant="secondary"
 onPress={() => {
 Clipboard.setString(referralUrl);
 Alert.alert('Link copied!');
 }}
 style={{ flex: 1 }}
 />
 <Button
 label=" Share"
 onPress={async () => {
 await Share.share({
 message: `Join my Scout fundraising campaign with Camp Card! Tap the link to signup and help me reach my goal:\n\n${referralUrl}`,
 });
 }}
 style={{ flex: 1 }}
 />
 </View>

 {/* Referral stats */}
 <View style={{ marginTop: space.lg, paddingTop: space.lg, borderTopWidth: 1, borderColor: colors.gray200 }}>
 <Text style={{ fontWeight: '900', marginBottom: space.md }}>Referrals</Text>
 <View style={{ gap: space.sm }}>
 <Text style={{ color: colors.text }}> {referralStats?.totalReferrals || 0} signups</Text>
 <Text style={{ color: colors.text }}> {referralStats?.activeSubscriptions || 0} subscriptions</Text>
 <Text style={{ color: colors.green600, fontWeight: '700' }}>
 ${(referralStats?.referralBonus || 0).toLocaleString()} bonus earned
 </Text>
 </View>
 </View>
</Card>
```

**Backend Required:**
- Generate unique referral code on user creation
- `GET /scouts/{scoutId}/referral-stats`
- On signup: parse `?ref=` query param, attribute new user to referrer

**Deep Linking:**
```json
{
 "plugins": ["expo-router"],
 "intentFilters": [
 {
 "action": "VIEW",
 "data": { "scheme": "https", "host": "campcard.app", "pathPrefix": "/join/" },
 "category": ["BROWSABLE", "DEFAULT"]
 }
 ]
}
```

**Estimated Time:** 56 hours
**Testing:** QR code generation, deep-linking, referral attribution, bonus calculation

---

## SUPPORTING IMPROVEMENTS (Weeks 812)

### Additional Features (Lower Priority)

**P9: Category Icons & Visual Polish** (Effort: 2/5, Impact: 3/5)
- Add category icons ( Food,  Retail, Entertainment)
- Color-code categories per badges system

**P10: Empty & Loading States** (Effort: 2/5, Impact: 3/5)
- Skeleton loaders for offer lists
- Contextual empty state messages ("No Food offers near you")

**P11: Tooltip Hints** (Effort: 2/5, Impact: 2/5)
- Help bubbles for first-time users
- Explain "subscription required" with link to upgrade

**P12: Undo/Redo for Favorites** (Effort: 3/5, Impact: 2/5)
- Toast notification "Added to Favorites" with undo button
- Improves perceived responsiveness

---

## IMPLEMENTATION SCHEDULE

```
Week 12: P1 (Filter/Sort) + P2 (Distance Sort)
 
Week 34: P3 (Maps) + P4 (Share & Save)
 
Week 56: P5 (Merchant Spotlight) + P6 (Progress Ring)
 
Week 78: P7 (Leaderboard) + P8 (Referral Attribution)
 
Week 910: P9P12 (Polish & Edge Cases)
 
Week 1112: Testing, Bug Fixes, Performance Optimization
```

---

## SUCCESS METRICS

**User Engagement:**
- Daily Active Users (DAU) +25% after Leaderboard (P7)
- Offer click-through rate +30% after Filters (P1)
- Social shares +50% after Share button (P4)

**Acquisition:**
- Referral signups +40% after Referral Link (P8)
- Viral coefficient increases from 1.2  1.5

**Retention:**
- 7-day retention +15% after Save-for-Later (P4)
- Monthly active users (MAU) +35% after gamification (P7)

**Business Impact:**
- Average offer redemptions/user +20% after Maps (P3)
- Merchant partnerships +5 new merchants (via Spotlight P5)
- Scout fundraising per troop +$500/month (via Leaderboard P7)

---

## DESIGN SYSTEM SUPPORT

All features leverage existing design tokens:
- `colors.{red,blue,green,yellow}{500,600}` for badges + status
- `typography.{h2,h3,body,bodySmall}` for hierarchy
- `space.{sm,md,lg,xl}` for consistent spacing
- `radius.{md,lg,card}` for consistent roundness
- `componentStates.{button,card,badge}` for interactions
- `a11y.{minTouchTarget,focusRing,contrast}` for accessibility

---

## RISKS & MITIGATIONS

| Risk | Mitigation |
|------|-----------|
| Map rendering performance on low-end devices | Lazy load map, disable animations in low-memory mode |
| Geolocation accuracy variations | Validate with backend, show uncertainty radius on map |
| User confusion about referral codes | Add in-app tutorial, contextual help bubbles |
| Leaderboard privacy concerns | Show only names/cities, respect privacy preferences |
| Gamification feature adoption | A/B test leaderboard visibility, gather UX feedback |

---

**Status:** Ready for sprint planning
**Product Owner:** [Name]
**Engineering Lead:** [Name]
**Design Lead:** [Name]

Last updated: 2025-12-27
