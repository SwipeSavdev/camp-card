# Camp Card Mobile  Text Truncation & Accessibility Fixes

**Status:** Ready for Implementation
**Effort:** 68 hours (all priorities)
**Files Modified:** 6 screens + 3 components

---

## PHASE 1: QUICK WINS (Text Truncation)  2 hours

### Fix 1: Customer/OffersScreen.tsx

**File:** `src/screens/customer/OffersScreen.tsx`

**Changes:**
- Add `numberOfLines={1}` + `ellipsizeMode="tail"` to title
- Add `numberOfLines={1}` to merchant info
- Add `numberOfLines={2}` to description
- Ensure Card has flex constraints

**Patch:**

```tsx
// BEFORE
function OfferRow({ item, onPress }: { item: OfferListItem; onPress: () => void }) {
 const distance = item.locations?.[0]?.distance_km;

 return (
 <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={{ marginBottom: space.md }}>
 <Card padded>
 <Text style={{ fontSize: 16, fontWeight: '900', color: colors.text }}>{item.title}</Text>
 <Text style={{ marginTop: 4, color: colors.muted }}>
 {item.merchant?.business_name}  {item.category}
 </Text>
 {typeof distance === 'number' ? (
 <Text style={{ marginTop: 4, color: colors.muted, fontSize: 12 }}>{distance.toFixed(1)} km away</Text>
 ) : null}
 <Text style={{ marginTop: 8, color: colors.text }} numberOfLines={2}>
 {item.description}
 </Text>
 {item.can_redeem === false ? (
 <Text style={{ marginTop: 8, color: colors.red600, fontWeight: '800' }}>Subscription required to redeem</Text>
 ) : null}
 </Card>
 </TouchableOpacity>
 );
}

// AFTER
function OfferRow({ item, onPress }: { item: OfferListItem; onPress: () => void }) {
 const distance = item.locations?.[0]?.distance_km;

 return (
 <TouchableOpacity
 onPress={onPress}
 activeOpacity={0.85}
 style={{ marginBottom: space.md }}
 accessible={true}
 accessibilityRole="button"
 accessibilityLabel={`${item.title} from ${item.merchant?.business_name}`}
 accessibilityHint={`Tap to view offer details`}
 >
 <Card padded>
 <Text
 numberOfLines={1}
 ellipsizeMode="tail"
 style={{ fontSize: 16, fontWeight: '900', color: colors.text }}
 >
 {item.title}
 </Text>
 <Text
 numberOfLines={1}
 ellipsizeMode="tail"
 style={{ marginTop: 4, color: colors.muted }}
 >
 {item.merchant?.business_name}  {item.category}
 </Text>
 {typeof distance === 'number' ? (
 <Text
 numberOfLines={1}
 ellipsizeMode="tail"
 style={{ marginTop: 4, color: colors.muted, fontSize: 12 }}
 >
 {distance.toFixed(1)} km away
 </Text>
 ) : null}
 <Text
 numberOfLines={2}
 ellipsizeMode="tail"
 style={{ marginTop: 8, color: colors.text }}
 >
 {item.description}
 </Text>
 {item.can_redeem === false ? (
 <Text
 style={{ marginTop: 8, color: colors.red600, fontWeight: '800' }}
 accessibilityRole="alert"
 >
 Subscription required to redeem
 </Text>
 ) : null}
 </Card>
 </TouchableOpacity>
 );
}
```

**Why:**
- `numberOfLines={1}` prevents title wrapping to 2+ lines
- `ellipsizeMode="tail"` shows "..." at end (not middle)
- Accessibility labels help screen reader users understand button purpose
- Alert role on warning text ensures screen reader announces status

---

### Fix 2: Customer/OfferDetailsScreen.tsx

**File:** `src/screens/customer/OfferDetailsScreen.tsx`

**Patch:**

```tsx
// BEFORE (around line 60)
<View style={{ marginTop: space.lg }}>
 <Card>
 <Text style={{ fontWeight: '900', color: colors.text }}>Details</Text>
 <Text style={{ marginTop: 8, color: colors.text }}>{offer.description}</Text>
 {offer.valid_until ? (
 <Text style={{ marginTop: 10, color: colors.muted, fontSize: 12 }}>
 Valid until: {offer.valid_until}
 </Text>
 ) : null}
 </Card>
</View>

// AFTER
<View style={{ marginTop: space.lg }}>
 <Card>
 <Text style={{ fontWeight: '900', color: colors.text }}>Details</Text>
 <Text
 numberOfLines={6}
 ellipsizeMode="tail"
 style={{ marginTop: 8, color: colors.text }}
 >
 {offer.description}
 </Text>
 {offer.valid_until ? (
 <Text
 numberOfLines={1}
 ellipsizeMode="tail"
 style={{ marginTop: 10, color: colors.muted, fontSize: 12 }}
 >
 Valid until: {offer.valid_until}
 </Text>
 ) : null}
 </Card>
</View>

// BEFORE (around line 72)
<View style={{ marginTop: space.lg }}>
 <Card>
 <Text style={{ fontWeight: '900', color: colors.text }}>Location</Text>
 <Text style={{ marginTop: 8, color: colors.muted }}>
 {offer.locations?.[0]?.address || 'See merchant for participating locations'}
 </Text>
 </Card>
</View>

// AFTER
<View style={{ marginTop: space.lg }}>
 <Card>
 <Text style={{ fontWeight: '900', color: colors.text }}>Location</Text>
 <Text
 numberOfLines={3}
 ellipsizeMode="tail"
 style={{ marginTop: 8, color: colors.muted }}
 >
 {offer.locations?.[0]?.address || 'See merchant for participating locations'}
 </Text>
 </Card>
</View>
```

---

### Fix 3: Leader/ScoutsScreen.tsx

**File:** `src/screens/leader/ScoutsScreen.tsx`

**Patch:**

```tsx
// BEFORE
renderItem={({ item }) => (
 <View style={{ marginBottom: space.md }}>
 <Card>
 <Text style={{ fontWeight: '900', color: colors.text }}>{item.name}</Text>
 <Text style={{ marginTop: 6, color: colors.muted }}>
 Subscriptions: {item.subscriptions}
 </Text>
 </Card>
 </View>
)}

// AFTER
renderItem={({ item }) => (
 <View style={{ marginBottom: space.md }}>
 <Card
 accessible={true}
 accessibilityLabel={`${item.name}, ${item.subscriptions} subscriptions`}
 >
 <Text
 numberOfLines={1}
 ellipsizeMode="tail"
 style={{ fontWeight: '900', color: colors.text }}
 >
 {item.name}
 </Text>
 <Text
 numberOfLines={1}
 style={{ marginTop: 6, color: colors.muted }}
 >
 Subscriptions: {item.subscriptions}
 </Text>
 </Card>
 </View>
)}
```

---

### Fix 4: Customer/HomeScreen.tsx

**File:** `src/screens/customer/HomeScreen.tsx`

**Patch:**

```tsx
// BEFORE (hero section)
<ImageBackground
 source={images.campCardBg}
 imageStyle={{ borderRadius: 24 }}
 style={{ padding: space.lg, borderRadius: 24, overflow: 'hidden' }}
>
 <Text style={{ color: colors.white, fontSize: 20, fontWeight: '900' }}>
 Welcome{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
 </Text>
 <Text style={{ color: 'rgba(255,255,255,0.85)', marginTop: 8 }}>
 Unlock local savings while supporting Scouting.
 </Text>
 <View style={{ marginTop: space.lg, maxWidth: 220 }}>
 <Button label="Browse offers" onPress={() => navigation.navigate('OffersTab')} />
 </View>
</ImageBackground>

// AFTER
<ImageBackground
 source={images.campCardBg}
 imageStyle={{ borderRadius: 24 }}
 style={{ padding: space.lg, borderRadius: 24, overflow: 'hidden' }}
>
 <Text
 numberOfLines={1}
 ellipsizeMode="tail"
 style={{ color: colors.white, fontSize: 20, fontWeight: '900' }}
 >
 Welcome{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
 </Text>
 <Text
 numberOfLines={2}
 ellipsizeMode="tail"
 style={{ color: 'rgba(255,255,255,0.85)', marginTop: 8 }}
 >
 Unlock local savings while supporting Scouting.
 </Text>
 <View style={{ marginTop: space.lg, maxWidth: '80%' }}>
 <Button label="Browse offers" onPress={() => navigation.navigate('OffersTab')} />
 </View>
</ImageBackground>

// BEFORE (council info)
<Card>
 <Text style={{ fontSize: 16, fontWeight: '900', color: colors.text }}>
 Your Council Tenant
 </Text>
 <Text style={{ color: colors.muted, marginTop: 6 }}>
 Council ID: {user?.tenantId || ''}
 </Text>
 <Text style={{ color: colors.muted, marginTop: 6, fontSize: 12 }}>
 This app is multi-tenant. API requests automatically include your tenant when available.
 </Text>
</Card>

// AFTER
<Card>
 <Text style={{ fontSize: 16, fontWeight: '900', color: colors.text }}>
 Your Council Tenant
 </Text>
 <Text
 numberOfLines={1}
 ellipsizeMode="tail"
 style={{ color: colors.muted, marginTop: 6 }}
 >
 Council ID: {user?.tenantId || ''}
 </Text>
 <Text
 numberOfLines={3}
 ellipsizeMode="tail"
 style={{ color: colors.muted, marginTop: 6, fontSize: 12 }}
 >
 This app is multi-tenant. API requests automatically include your tenant when available.
 </Text>
</Card>
```

**Why:**
- Hero section welcome text now truncates at 1 line (respects safe area)
- Description truncates at 2 lines (still readable)
- Button uses `maxWidth: 80%` (responsive, not hardcoded 220px)
- Council info text limits to 3 lines (prevents overflow)

---

### Fix 5: Leader/HomeScreen.tsx

**File:** `src/screens/leader/HomeScreen.tsx`

**Patch:**

```tsx
// BEFORE
<Card>
 <Text style={{ fontWeight: '900', color: colors.text }}>Council Tenant</Text>
 <Text style={{ marginTop: 6, color: colors.muted }}>Council ID: {user?.tenantId || ''}</Text>
</Card>

<Card>
 <Text style={{ fontWeight: '900', color: colors.text }}>At-a-glance</Text>
 <View style={{ marginTop: space.md, gap: 8 }}>
 <Text style={{ color: colors.text }}>Scouts: {metrics.totalScouts}</Text>
 <Text style={{ color: colors.text }}>Subscriptions: {metrics.subscriptions}</Text>
 <Text style={{ color: colors.text }}>
 Estimated fundraising: ${(metrics.estimatedFundraising).toLocaleString()}
 </Text>
 </View>
</Card>

// AFTER
<Card>
 <Text style={{ fontWeight: '900', color: colors.text }}>Council Tenant</Text>
 <Text
 numberOfLines={1}
 ellipsizeMode="tail"
 style={{ marginTop: 6, color: colors.muted }}
 >
 Council ID: {user?.tenantId || ''}
 </Text>
</Card>

<Card>
 <Text style={{ fontWeight: '900', color: colors.text }}>At-a-glance</Text>
 <View style={{ marginTop: space.md, gap: 8 }}>
 <Text
 numberOfLines={1}
 style={{ color: colors.text }}
 >
 Scouts: {metrics.totalScouts}
 </Text>
 <Text
 numberOfLines={1}
 style={{ color: colors.text }}
 >
 Subscriptions: {metrics.subscriptions}
 </Text>
 <Text
 numberOfLines={1}
 ellipsizeMode="tail"
 style={{ color: colors.text }}
 >
 Estimated fundraising: ${(metrics.estimatedFundraising).toLocaleString()}
 </Text>
 </View>
</Card>
```

---

## PHASE 2: ACCESSIBILITY  2 hours

### Fix 6: Components/Button.tsx

**File:** `src/components/Button.tsx`

**Patch:**

```tsx
// BEFORE
<Pressable
 onPress={onPress}
 disabled={disabled || loading}
 style={({ pressed }) => [
 {
 paddingVertical: 14,
 paddingHorizontal: space.md,
 borderRadius: radius.button,
 backgroundColor: bg,
 borderWidth: 1,
 borderColor,
 alignItems: 'center',
 justifyContent: 'center',
 opacity: disabled || loading ? 0.65 : pressed ? 0.9 : 1,
 },
 style,
 ]}
>

// AFTER
<Pressable
 onPress={onPress}
 disabled={disabled || loading}
 accessible={true}
 accessibilityRole="button"
 accessibilityLabel={label}
 accessibilityState={{
 disabled: disabled || loading,
 busy: loading,
 }}
 accessibilityHint={disabled ? 'Button is disabled' : undefined}
 style={({ pressed }) => [
 {
 paddingVertical: 14,
 paddingHorizontal: space.md,
 borderRadius: radius.button,
 backgroundColor: bg,
 borderWidth: 1,
 borderColor,
 alignItems: 'center',
 justifyContent: 'center',
 opacity: disabled || loading ? 0.65 : pressed ? 0.9 : 1,
 minHeight: 44, // Touch target size (WCAG requirement)
 },
 style,
 ]}
>
```

**Why:**
- `accessibilityRole="button"` tells screen readers this is clickable
- `accessibilityLabel={label}` announces button purpose ("Browse offers")
- `accessibilityState` indicates disabled/loading status
- `minHeight: 44` ensures touch target meets WCAG AA standard (44x44 minimum)

---

### Fix 7: Components/Card.tsx

**File:** `src/components/Card.tsx`

**Patch:**

```tsx
// BEFORE
<View
 {...rest}
 style={[
 {
 backgroundColor: colors.white,
 borderRadius: radius.card,
 borderWidth: 1,
 borderColor: colors.gray200,
 ...(shadow.card as any),
 padding: padded ? space.lg : 0,
 },
 style,
 ]}
/>

// AFTER
<View
 {...rest}
 accessible={true}
 accessibilityRole="region"
 style={[
 {
 backgroundColor: colors.white,
 borderRadius: radius.card,
 borderWidth: 1,
 borderColor: colors.gray200,
 ...(shadow.card as any),
 padding: padded ? space.lg : 0,
 flex: 0, // Prevent flex overflow
 },
 style,
 ]}
/>
```

**Why:**
- `accessible={true}` + `accessibilityRole="region"` groups related content
- `flex: 0` prevents card from expanding indefinitely

---

### Fix 8: Components/Input.tsx

**File:** `src/components/Input.tsx`

**Patch:**

```tsx
// BEFORE
<TextInput
 value={value}
 onChangeText={onChangeText}
 placeholder={placeholder}
 placeholderTextColor={colors.muted}
 secureTextEntry={secureTextEntry}
 keyboardType={keyboardType}
 autoCapitalize={autoCapitalize}
 autoCorrect={false}
 style={{
 borderWidth: 1,
 borderColor: error ? colors.red500 : colors.gray200,
 borderRadius: radius.button,
 paddingHorizontal: space.md,
 paddingVertical: 12,
 backgroundColor: colors.white,
 color: colors.text,
 }}
/>

// AFTER
<TextInput
 value={value}
 onChangeText={onChangeText}
 placeholder={placeholder}
 placeholderTextColor={colors.muted}
 secureTextEntry={secureTextEntry}
 keyboardType={keyboardType}
 autoCapitalize={autoCapitalize}
 autoCorrect={false}
 accessible={true}
 accessibilityLabel={label}
 accessibilityHint={error || undefined}
 accessibilityRole="adjustable"
 style={{
 borderWidth: 1,
 borderColor: error ? colors.red500 : colors.gray200,
 borderRadius: radius.button,
 paddingHorizontal: space.md,
 paddingVertical: 12,
 backgroundColor: colors.white,
 color: colors.text,
 minHeight: 44, // Touch target size
 }}
/>
```

---

## PHASE 3: NEW COMPONENTS (Empty/Error States)  2 hours

### New File: Components/EmptyState.tsx

```tsx
import React from 'react';
import { Text, View } from 'react-native';
import { colors, space } from '../theme';

interface EmptyStateProps {
 icon?: string | React.ReactNode;
 title: string;
 description: string;
 action?: {
 label: string;
 onPress: () => void;
 };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
 return (
 <View
 style={{
 alignItems: 'center',
 justifyContent: 'center',
 paddingVertical: space.xl,
 paddingHorizontal: space.lg,
 }}
 accessible={true}
 accessibilityRole="region"
 accessibilityLabel="Empty state"
 >
 {typeof icon === 'string' ? (
 <Text style={{ fontSize: 48 }}>{icon}</Text>
 ) : (
 icon
 )}

 <Text
 style={{
 fontSize: 18,
 fontWeight: '700',
 color: colors.text,
 marginTop: space.md,
 textAlign: 'center',
 }}
 >
 {title}
 </Text>

 <Text
 numberOfLines={3}
 style={{
 fontSize: 14,
 color: colors.muted,
 marginTop: space.sm,
 textAlign: 'center',
 lineHeight: 20,
 }}
 >
 {description}
 </Text>

 {action && (
 <Pressable
 onPress={action.onPress}
 style={{
 marginTop: space.lg,
 paddingHorizontal: space.lg,
 paddingVertical: space.md,
 borderRadius: 14,
 backgroundColor: colors.blue500,
 }}
 accessible={true}
 accessibilityRole="button"
 accessibilityLabel={action.label}
 >
 <Text style={{ color: colors.white, fontWeight: '700' }}>
 {action.label}
 </Text>
 </Pressable>
 )}
 </View>
 );
}
```

---

### New File: Components/ErrorState.tsx

```tsx
import React from 'react';
import { Text, View, Pressable } from 'react-native';
import { colors, space } from '../theme';

interface ErrorStateProps {
 title: string;
 description?: string;
 onRetry: () => void;
}

export function ErrorState({ title, description, onRetry }: ErrorStateProps) {
 return (
 <View
 style={{
 alignItems: 'center',
 justifyContent: 'center',
 paddingVertical: space.xl,
 paddingHorizontal: space.lg,
 }}
 accessible={true}
 accessibilityRole="alert"
 accessibilityLabel="Error"
 >
 <Text style={{ fontSize: 48 }}></Text>

 <Text
 style={{
 fontSize: 18,
 fontWeight: '700',
 color: colors.red600,
 marginTop: space.md,
 textAlign: 'center',
 }}
 >
 {title}
 </Text>

 {description && (
 <Text
 numberOfLines={3}
 style={{
 fontSize: 14,
 color: colors.muted,
 marginTop: space.sm,
 textAlign: 'center',
 }}
 >
 {description}
 </Text>
 )}

 <Pressable
 onPress={onRetry}
 style={{
 marginTop: space.lg,
 paddingHorizontal: space.lg,
 paddingVertical: space.md,
 borderRadius: 14,
 backgroundColor: colors.red500,
 }}
 accessible={true}
 accessibilityRole="button"
 accessibilityLabel="Retry"
 >
 <Text style={{ color: colors.white, fontWeight: '700' }}>Retry</Text>
 </Pressable>
 </View>
 );
}
```

---

### New File: Components/SkeletonCard.tsx

```tsx
import React from 'react';
import { View } from 'react-native';
import { colors, space, radius } from '../theme';

interface SkeletonCardProps {
 lines?: number;
}

export function SkeletonCard({ lines = 3 }: SkeletonCardProps) {
 return (
 <View
 style={{
 backgroundColor: colors.white,
 borderRadius: radius.card,
 borderWidth: 1,
 borderColor: colors.gray200,
 padding: space.lg,
 marginBottom: space.md,
 }}
 >
 {/* Title skeleton */}
 <View
 style={{
 height: 16,
 backgroundColor: colors.gray200,
 borderRadius: 8,
 width: '70%',
 }}
 />

 {/* Subtitle skeleton */}
 <View
 style={{
 height: 12,
 backgroundColor: colors.gray100,
 borderRadius: 6,
 marginTop: space.sm,
 width: '50%',
 }}
 />

 {/* Content skeleton lines */}
 {Array(lines)
 .fill(0)
 .map((_, i) => (
 <View
 key={i}
 style={{
 height: 12,
 backgroundColor: colors.gray100,
 borderRadius: 6,
 marginTop: space.xs,
 width: i === lines - 1 ? '40%' : '100%',
 }}
 />
 ))}
 </View>
 );
}
```

---

## PHASE 4: Integration in Screens  2 hours

### Update OffersScreen.tsx with Empty/Error States

```tsx
// Add imports
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { SkeletonCard } from '../../components/SkeletonCard';

// In FlatList:
<FlatList
 contentContainerStyle={{ padding: space.lg }}
 data={data ?? []}
 keyExtractor={item => String(item.id)}
 refreshing={isLoading}
 onRefresh={refetch}
 renderItem={({ item }) => (
 <OfferRow item={item} onPress={() => navigation.navigate('OfferDetails', { offerId: item.id })} />
 )}
 ListEmptyComponent={
 !isLoading ? (
 <EmptyState
 icon=""
 title="No offers yet"
 description="Check back soon for deals in your area."
 />
 ) : null
 }
 // NEW: Add error state
 ListErrorComponent={
 error && !isLoading ? (
 <ErrorState
 title="Failed to load offers"
 description={error.message}
 onRetry={refetch}
 />
 ) : null
 }
/>

// Show skeleton loaders while loading
{isLoading && !data ? (
 <View style={{ padding: space.lg }}>
 {Array(3)
 .fill(0)
 .map((_, i) => (
 <SkeletonCard key={i} lines={3} />
 ))}
 </View>
) : null}
```

---

## TESTING CHECKLIST

### Text Truncation Tests

```
[ ] Long offer title (100+ chars) truncates with ellipsis
[ ] Merchant name (3+ words) fits in 1 line
[ ] Description (200+ chars) wraps at 2 lines max
[ ] Location address (multi-line) truncates after 3 lines
[ ] All text readable (no overlap, no clipping)
[ ] Hero welcome text truncates at 1 line
[ ] Scout names truncate without breaking layout
```

### Accessibility Tests (VoiceOver)

```
[ ] Offer card announces: "[Title] from [Merchant]"
[ ] Button announces: "Browse offers, button" + disabled status
[ ] Empty state announces: "No offers yet, Region"
[ ] Error state announces: " Failed to load, Alert"
[ ] Subscription warning announces: "Subscription required, Alert"
[ ] All buttons have focus indicators (purple ring)
[ ] Tab navigation works left-to-right, top-to-bottom
```

### Responsive Tests

```
[ ] iPhone SE (375px): All text fits without overflow
[ ] iPhone 12 (390px): Proper spacing and alignment
[ ] iPad (820px): Layout scales correctly
[ ] Landscape mode: Text doesn't overlap
[ ] 150% font scale (iOS accessibility): No layout breaks
[ ] Touch targets remain 44x44 on all screen sizes
```

### Device Tests

```
[ ] iPhone 11 (iOS 15)
[ ] iPhone 14 Pro (iOS 17)
[ ] iPad Air (iOS 17)
[ ] Android with TalkBack enabled
[ ] Android with 150% font size
[ ] Android dark mode enabled
```

---

## IMPLEMENTATION ORDER

### Day 1 (Fixes 15):
1. Update OffersScreen  Text truncation + accessibility
2. Update OfferDetailsScreen  Description + location truncation
3. Update ScoutsScreen  Scout name truncation
4. Update HomeScreen (customer)  Hero + council info
5. Update HomeScreen (leader)  Council + metrics

### Day 2 (Components):
6. Create EmptyState component
7. Create ErrorState component
8. Create SkeletonCard component
9. Update Button component (accessibility)
10. Update Card component (accessibility)
11. Update Input component (accessibility)

### Day 3 (Integration):
12. Integrate EmptyState + ErrorState in OffersScreen
13. Test all screens on multiple devices
14. VoiceOver testing (iOS)
15. TalkBack testing (Android)
16. Responsive design verification

---

## ACCEPTANCE CRITERIA

 **Text Truncation**
- All single-line titles use `numberOfLines={1}` + `ellipsizeMode="tail"`
- All descriptions use `numberOfLines={2}` + `ellipsizeMode="tail"`
- No text extends beyond container boundary
- Ellipsis appears correctly for overflowing text

 **Accessibility (WCAG 2.1 AA)**
- All buttons have `accessibilityLabel` + `accessibilityRole`
- Color contrast 4.5:1 (normal text) 3:1 (large text)
- Touch targets 44x44px
- Focus indicators visible (2px purple ring)
- Screen reader announces all interactive elements

 **Responsive**
- Works on iPhone SE (375px) to iPad Pro (1024px)
- 100%, 125%, 150% font scales work without layout breaks
- Landscape orientation supported
- Safe area padding applied

 **Performance**
- OffersScreen FlatList renders 25 items smoothly
- No jank during scroll on low-end devices
- Skeleton loaders appear immediately on network delay

---

**Status:** Ready for implementation
**Estimated Duration:** 68 hours
**Review Gate:** Code review + QA sign-off (accessibility + responsive tests)
