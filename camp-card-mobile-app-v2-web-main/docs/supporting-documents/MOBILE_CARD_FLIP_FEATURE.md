# Mobile App - Camp Card Flip Feature

## Feature: Interactive Flip Card in Wallet

**Location:** Mobile App Wallet Screen
**File:** `repos/camp-card-mobile/src/screens/customer/WalletScreen.tsx`
**Status:** Implemented

---

## Feature Details

### Front of Card (Default View)
- Camp Card Logo
- Beautiful branded background
- **Flip Button** in top-right corner (swap-horizontal icon)

### Back of Card (When Flipped)
- **Cardholder Name:** First Name + Last Name (Emily Rodriguez)
- **Card Number:** 16-digit card number (0000 1264 7961 19)
- **Flip Button** to return to front

---

## Implementation Details

### Animation
- **Smooth 3D flip animation** using React Native `Animated` API
- **Duration:** 600ms (0.6 seconds)
- **Perspective:** Realistic 3D card flip effect
- **Backface visibility:** Hidden for seamless transition

### Button Placement
- **Position:** Top-right corner (12px from edges)
- **Style:** White rounded button with shadow
- **Icon:** Swap horizontal icon (indicates flip action)
- **Size:** 44x44 pixels (touch-friendly)

### Card Data Structure
```javascript
{
 firstName: 'Emily',
 lastName: 'Rodriguez',
 cardNumber: '0000 1264 7961 19'
}
```

---

## Code Changes

### New State Management
```typescript
const [isCardFlipped, setIsCardFlipped] = useState(false);
const flipAnimation = React.useRef(new Animated.Value(0)).current;

const toggleCardFlip = () => {
 Animated.timing(flipAnimation, {
 toValue: isCardFlipped ? 0 : 1,
 duration: 600,
 useNativeDriver: true,
 }).start();
 setIsCardFlipped(!isCardFlipped);
};
```

### Animation Interpolation
```typescript
const frontInterpolate = flipAnimation.interpolate({
 inputRange: [0, 1],
 outputRange: ['0deg', '180deg'],
});

const backInterpolate = flipAnimation.interpolate({
 inputRange: [0, 1],
 outputRange: ['180deg', '360deg'],
});
```

### JSX Structure
```jsx
{/* Front of Card */}
<Animated.View
 style={[
 styles.cardFace,
 styles.cardFront,
 { transform: [{ rotateY: frontInterpolate }] },
 ]}
>
 {/* Card logo content */}
 <TouchableOpacity style={styles.flipButton} onPress={toggleCardFlip}>
 <Ionicons name="swap-horizontal" size={20} color={colors.blue500} />
 </TouchableOpacity>
</Animated.View>

{/* Back of Card */}
<Animated.View
 style={[
 styles.cardFace,
 styles.cardBack,
 { transform: [{ rotateY: backInterpolate }] },
 ]}
>
 <View style={styles.cardBackContent}>
 <View style={styles.cardBackField}>
 <Text style={styles.cardBackLabel}>Cardholder</Text>
 <Text style={styles.cardBackValue}>
 {cardData.firstName} {cardData.lastName}
 </Text>
 </View>
 <View style={styles.cardBackField}>
 <Text style={styles.cardBackLabel}>Card Number</Text>
 <Text style={styles.cardBackValue}>{cardData.cardNumber}</Text>
 </View>
 </View>
 <TouchableOpacity style={styles.flipButton} onPress={toggleCardFlip}>
 <Ionicons name="swap-horizontal" size={20} color={colors.blue500} />
 </TouchableOpacity>
</Animated.View>
```

---

## Styling

### Card Container
- **Height:** 220px
- **Margin:** Large horizontal margins
- **Border Radius:** Large rounded corners
- **Shadow:** Professional drop shadow

### Back Side Styling
- **Background:** White
- **Padding:** Large
- **Border:** Subtle gray border
- **Content:** Vertically centered

### Button Styling
- **Width/Height:** 44x44px (touch target)
- **Background:** Semi-transparent white (0.95 opacity)
- **Border Radius:** Perfect circle (22px)
- **Shadow:** Subtle elevation
- **Elevation:** 4 (Android compatibility)

### Text Styling
- **Label:** Uppercase, small, muted gray, letter spacing
- **Value:** Large, bold, darker text, slight letter spacing
- **Card Number Font:** Monospace (Courier New) for authenticity

---

## User Experience

### User Flow
1. **View wallet screen**  Sees camp card front with logo
2. **Tap flip button**  Card smoothly flips 180
3. **View back side**  Sees cardholder name and card number
4. **Tap flip button again**  Card flips back to front

### Accessibility
- Large touch targets (44x44px minimum)
- Clear visual feedback with smooth animation
- Icon clearly indicates flip action
- Readable text with appropriate contrast

---

##  Integration with Backend

### Current Implementation (Mock Data)
```javascript
const cardData = {
 firstName: 'Emily',
 lastName: 'Rodriguez',
 cardNumber: '0000 1264 7961 19',
};
```

### Future Enhancement
Replace mock data with actual API call:
```typescript
// Fetch from /users/{userId}/wallet endpoint
const response = await fetch(`http://localhost:8080/users/${userId}/wallet`);
const wallet = await response.json();
const card = wallet.cards[0];

const cardData = {
 firstName: card.card_holder_name.split(' ')[0],
 lastName: card.card_holder_name.split(' ')[1],
 cardNumber: formatCardNumber(card.card_number),
};
```

---

## Features Enabled

 Interactive 3D card flip animation
 Display cardholder name on back
 Display card number on back
 Smooth transition effects
 Accessible touch targets
 Professional styling
 Works on iOS and Android

---

## Next Steps

1. **Connect to Backend:** Use Emily's actual wallet data from `/users/{userId}/wallet`
2. **Add Card Security:** Format card number securely (mask last 4 digits if needed)
3. **Add Expiration Date:** Show expiration on card back
4. **Add CVV:** Show masked CVV or security info
5. **Add Card Holder Signature:** Optional decorative element
6. **Implement Card Selection:** If user has multiple cards, allow selection

---

**Status:** Ready for Testing
**Deployed:** Mobile App Wallet Screen
**Device Support:** iOS & Android

