# BSA Camp Card Digitalization Program
## Build Specification — Part 7: UX/UI & Design System Integration

**Document Version:** 1.0  
**Date:** December 23, 2025  
**Status:** Implementation-Ready

---

## 1. DESIGN SYSTEM OVERVIEW

### 1.1 Design Token Architecture

**Token Hierarchy:**
```
Design Tokens (JSON/CSS)
    ↓
Platform Theme Objects (React Native StyleSheet, CSS Modules)
    ↓
Component Styles (Button, Card, Input, etc.)
    ↓
Screen Layouts (Dashboard, Offer List, etc.)
```

**Token Categories:**
1. **Colors** — Brand palette (Navy, Blue, Red), semantic colors (success, warning, error)
2. **Spacing** — 8pt grid system (xs: 8, sm: 12, md: 16, lg: 24, xl: 32, 2xl: 48)
3. **Typography** — Font sizes, weights, line heights
4. **Border Radius** — Button, card, chip rounding
5. **Shadows** — Card elevation, floating elements
6. **Gradients** — Primary radial gradient (Navy → Blue)

### 1.2 Cross-Platform Strategy

**React Native (Mobile):**
- Design tokens → JavaScript theme object
- StyleSheet.create() for component styles
- Shared theme context via React Context API

**Next.js (Web):**
- Design tokens → CSS custom properties (variables)
- CSS Modules or Styled Components for scoping
- Shared :root CSS file imported globally

**Shared Components:**
- Build component library with **React Native Web** for maximum code reuse
- Or maintain separate mobile/web components using same design tokens

---

## 2. DESIGN TOKENS — COMPLETE SPECIFICATION

### 2.1 Color Palette

**Primary Colors:**
```css
/* Navy Shades */
--cc-navy900: #000C2F;  /* Darkest, text on light bg */
--cc-navy800: #041933;
--cc-navy700: #05244A;  /* Secondary text, borders */
--cc-navy600: #0B3566;
--cc-navy500: #133D72;

/* Blue Shades */
--cc-blue600: #094076;
--cc-blue500: #0A4384;  /* Primary brand blue */
--cc-blue400: #3B5C82;  /* Muted blue, secondary text */
--cc-blue300: #5A7BA0;
--cc-blue200: #8EAACC;
--cc-blue100: #C4D7EB;

/* Red Shades */
--cc-red600: #B01427;   /* Darker red, hover states */
--cc-red500: #D9012C;   /* Primary CTA red */
--cc-red400: #E33250;
--cc-red300: #ED6580;
--cc-red200: #F799AE;
--cc-red100: #FBCCD7;

/* Highlight */
--cc-highlight: #3B5C82; /* Same as blue-400 */
```

**Neutral Colors:**
```css
--cc-white: #FFFFFF;
--cc-gray50: #F9FAFB;
--cc-gray100: #F3F4F6;
--cc-gray200: #E5E7EB;
--cc-gray300: #D1D5DB;
--cc-gray400: #9CA3AF;
--cc-gray500: #6B7280;
--cc-gray600: #4B5563;
--cc-gray700: #374151;
--cc-gray800: #1F2937;
--cc-gray900: #111827;
--cc-black: #000000;
```

**Semantic Colors:**
```css
/* Success (Green) */
--cc-success-light: #D1FAE5;
--cc-success: #10B981;
--cc-success-dark: #065F46;

/* Warning (Yellow) */
--cc-warning-light: #FEF3C7;
--cc-warning: #F59E0B;
--cc-warning-dark: #92400E;

/* Error (Red) */
--cc-error-light: #FEE2E2;
--cc-error: #EF4444;
--cc-error-dark: #991B1B;

/* Info (Blue) */
--cc-info-light: #DBEAFE;
--cc-info: #3B82F6;
--cc-info-dark: #1E40AF;
```

### 2.2 Spacing Scale (8pt Grid)

```css
--cc-space-0: 0px;
--cc-space-xs: 8px;
--cc-space-sm: 12px;
--cc-space-md: 16px;
--cc-space-lg: 24px;
--cc-space-xl: 32px;
--cc-space-2xl: 48px;
--cc-space-3xl: 64px;
--cc-space-4xl: 96px;
```

**Usage Guidelines:**
- **xs (8px):** Icon padding, chip spacing
- **sm (12px):** Form input padding (vertical)
- **md (16px):** Card padding, section spacing
- **lg (24px):** Screen margins, large card padding
- **xl (32px):** Section dividers
- **2xl (48px):** Page-level vertical spacing

### 2.3 Typography

**Font Family:**
```css
--cc-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 
                  'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 
                  'Fira Sans', 'Droid Sans', 'Helvetica Neue', 
                  sans-serif;
```

**Font Sizes:**
```css
--cc-text-xs: 12px;
--cc-text-sm: 14px;
--cc-text-base: 16px;
--cc-text-lg: 18px;
--cc-text-xl: 20px;
--cc-text-2xl: 24px;
--cc-text-3xl: 32px;
--cc-text-4xl: 44px;
```

**Font Weights:**
```css
--cc-font-normal: 400;
--cc-font-medium: 500;
--cc-font-semibold: 600;
--cc-font-bold: 700;
```

**Line Heights:**
```css
--cc-leading-tight: 1.25;
--cc-leading-normal: 1.5;
--cc-leading-relaxed: 1.75;
```

**Typography Scale:**
```css
/* Headings */
--cc-h1-size: 44px;
--cc-h1-weight: 700;
--cc-h1-line-height: 1.2;

--cc-h2-size: 32px;
--cc-h2-weight: 700;
--cc-h2-line-height: 1.25;

--cc-h3-size: 24px;
--cc-h3-weight: 600;
--cc-h3-line-height: 1.3;

--cc-h4-size: 20px;
--cc-h4-weight: 600;
--cc-h4-line-height: 1.4;

/* Body */
--cc-body-size: 16px;
--cc-body-weight: 400;
--cc-body-line-height: 1.5;

--cc-body-large-size: 18px;
--cc-body-large-weight: 400;
--cc-body-large-line-height: 1.6;

--cc-body-small-size: 14px;
--cc-body-small-weight: 400;
--cc-body-small-line-height: 1.5;

/* Caption */
--cc-caption-size: 12px;
--cc-caption-weight: 400;
--cc-caption-line-height: 1.4;
```

### 2.4 Border Radius

```css
--cc-radius-sm: 4px;    /* Input borders, small chips */
--cc-radius-md: 8px;    /* Badges, tags */
--cc-radius-lg: 14px;   /* Buttons */
--cc-radius-xl: 24px;   /* Cards */
--cc-radius-full: 999px; /* Pills, chips, avatars */
```

### 2.5 Shadows

```css
/* Card Shadow */
--cc-shadow-card: 0px 8px 24px rgba(0, 12, 47, 0.12),
                  0px 2px 8px rgba(0, 12, 47, 0.08);

/* Floating Shadow (modals, dropdowns) */
--cc-shadow-floating: 0px 16px 48px rgba(0, 12, 47, 0.2),
                      0px 4px 16px rgba(0, 12, 47, 0.12);

/* Button Shadow (subtle) */
--cc-shadow-button: 0px 2px 4px rgba(0, 12, 47, 0.1);

/* Input Focus Shadow */
--cc-shadow-focus: 0 0 0 3px rgba(10, 67, 132, 0.2);
```

### 2.6 Gradients

**Primary Radial Gradient:**
```css
--cc-gradient-primary: radial-gradient(
  circle at 35% 45%,
  #3B5C82 0%,
  #000C2F 100%
);
```

**Linear Gradient (CTA):**
```css
--cc-gradient-cta: linear-gradient(
  135deg,
  #D9012C 0%,
  #B01427 100%
);
```

---

## 3. COMPONENT LIBRARY

### 3.1 Button Component

**Variants:**
1. **Primary** — Red background, white text (main CTA)
2. **Secondary** — Navy outline, navy text (secondary actions)
3. **Ghost** — Transparent, blue text (tertiary actions)
4. **Danger** — Red background (destructive actions)

**Sizes:**
- **Small** — Height 32px, padding 8px 16px, font 14px
- **Medium** — Height 44px, padding 12px 24px, font 16px (default)
- **Large** — Height 56px, padding 16px 32px, font 18px

**React Native Example:**
```jsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { theme } from '../styles/theme';

const Button = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'medium', 
  disabled = false,
  loading = false,
  fullWidth = false
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        disabled && styles.disabled
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? theme.colors.white : theme.colors.blue500} />
      ) : (
        <Text style={[styles.text, styles[`text_${variant}`]]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  
  // Variants
  primary: {
    backgroundColor: theme.colors.red500,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.navy700,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: theme.colors.error,
  },
  
  // Sizes
  small: {
    height: 32,
    paddingHorizontal: theme.spacing.md,
  },
  medium: {
    height: 44,
    paddingHorizontal: theme.spacing.lg,
  },
  large: {
    height: 56,
    paddingHorizontal: theme.spacing.xl,
  },
  
  // Text styles
  text: {
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.fontBold,
  },
  text_primary: {
    color: theme.colors.white,
    fontSize: 16,
  },
  text_secondary: {
    color: theme.colors.navy900,
    fontSize: 16,
  },
  text_ghost: {
    color: theme.colors.blue500,
    fontSize: 16,
  },
  text_danger: {
    color: theme.colors.white,
    fontSize: 16,
  },
  
  // States
  disabled: {
    opacity: 0.5,
  },
  fullWidth: {
    width: '100%',
  },
});

export default Button;
```

**Web (CSS) Example:**
```css
.cc-button {
  font-family: var(--cc-font-family);
  font-weight: var(--cc-font-bold);
  border-radius: var(--cc-radius-lg);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.cc-button:hover {
  transform: translateY(-1px);
  box-shadow: var(--cc-shadow-button);
}

.cc-button:active {
  transform: translateY(0);
}

.cc-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Variants */
.cc-button-primary {
  background: var(--cc-red500);
  color: var(--cc-white);
}

.cc-button-primary:hover {
  background: var(--cc-red600);
}

.cc-button-secondary {
  background: transparent;
  color: var(--cc-navy900);
  border: 2px solid var(--cc-navy700);
}

.cc-button-secondary:hover {
  background: var(--cc-gray50);
}

.cc-button-ghost {
  background: transparent;
  color: var(--cc-blue500);
}

.cc-button-ghost:hover {
  background: var(--cc-blue100);
}

/* Sizes */
.cc-button-small {
  height: 32px;
  padding: 0 var(--cc-space-md);
  font-size: var(--cc-text-sm);
}

.cc-button-medium {
  height: 44px;
  padding: 0 var(--cc-space-lg);
  font-size: var(--cc-text-base);
}

.cc-button-large {
  height: 56px;
  padding: 0 var(--cc-space-xl);
  font-size: var(--cc-text-lg);
}

.cc-button-full-width {
  width: 100%;
}
```

### 3.2 Card Component

**Variants:**
1. **Default** — White background, standard shadow
2. **Elevated** — White background, floating shadow (modals)
3. **Gradient** — Primary gradient background (hero cards)

**React Native Example:**
```jsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';

const Card = ({ children, variant = 'default', padding = 'md', style }) => {
  return (
    <View style={[
      styles.card,
      styles[variant],
      styles[`padding_${padding}`],
      style
    ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.white,
  },
  
  default: {
    shadowColor: theme.colors.navy900,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 4, // Android
  },
  
  elevated: {
    shadowColor: theme.colors.navy900,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 48,
    elevation: 8,
  },
  
  gradient: {
    backgroundColor: theme.colors.navy900, // Fallback
    // Use LinearGradient component for actual gradient
  },
  
  padding_sm: {
    padding: theme.spacing.sm,
  },
  padding_md: {
    padding: theme.spacing.md,
  },
  padding_lg: {
    padding: theme.spacing.lg,
  },
  padding_xl: {
    padding: theme.spacing.xl,
  },
});

export default Card;
```

### 3.3 Input Component

**Types:**
- Text, Email, Phone, Password, Number
- TextArea (multiline)

**States:**
- Default, Focus, Error, Disabled

**React Native Example:**
```jsx
import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';

const Input = ({ 
  label, 
  placeholder, 
  value, 
  onChangeText, 
  error,
  disabled,
  multiline = false,
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <TextInput
        style={[
          styles.input,
          multiline && styles.multiline,
          isFocused && styles.inputFocused,
          error && styles.inputError,
          disabled && styles.inputDisabled,
        ]}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.gray400}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        editable={!disabled}
        multiline={multiline}
        {...props}
      />
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  
  label: {
    fontSize: theme.typography.textSm,
    fontWeight: theme.typography.fontMedium,
    color: theme.colors.navy900,
    marginBottom: theme.spacing.xs,
  },
  
  input: {
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.textBase,
    color: theme.colors.navy900,
    backgroundColor: theme.colors.white,
    borderWidth: 2,
    borderColor: theme.colors.gray300,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    minHeight: 44,
  },
  
  multiline: {
    minHeight: 120,
    paddingTop: theme.spacing.sm,
    textAlignVertical: 'top',
  },
  
  inputFocused: {
    borderColor: theme.colors.blue500,
    // Shadow equivalent to --cc-shadow-focus
    shadowColor: theme.colors.blue500,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  
  inputError: {
    borderColor: theme.colors.error,
  },
  
  inputDisabled: {
    backgroundColor: theme.colors.gray100,
    color: theme.colors.gray500,
  },
  
  errorText: {
    fontSize: theme.typography.textXs,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
});

export default Input;
```

### 3.4 Badge/Chip Component

**Use Cases:**
- Status indicators (Active, Pending, Expired)
- Tags (categories, labels)
- Count badges (notifications)

**React Native Example:**
```jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';

const Badge = ({ label, variant = 'default', size = 'medium' }) => {
  return (
    <View style={[styles.badge, styles[variant], styles[size]]}>
      <Text style={[styles.text, styles[`text_${variant}`]]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  
  // Variants
  default: {
    backgroundColor: theme.colors.gray200,
  },
  success: {
    backgroundColor: theme.colors.successLight,
  },
  warning: {
    backgroundColor: theme.colors.warningLight,
  },
  error: {
    backgroundColor: theme.colors.errorLight,
  },
  info: {
    backgroundColor: theme.colors.infoLight,
  },
  
  // Sizes
  small: {
    paddingHorizontal: theme.spacing.xs,
  },
  medium: {
    paddingHorizontal: theme.spacing.sm,
  },
  large: {
    paddingHorizontal: theme.spacing.md,
  },
  
  // Text
  text: {
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.fontMedium,
    fontSize: theme.typography.textXs,
  },
  text_default: {
    color: theme.colors.gray700,
  },
  text_success: {
    color: theme.colors.successDark,
  },
  text_warning: {
    color: theme.colors.warningDark,
  },
  text_error: {
    color: theme.colors.errorDark,
  },
  text_info: {
    color: theme.colors.infoDark,
  },
});

export default Badge;
```

### 3.5 Progress Bar Component

**React Native Example:**
```jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';

const ProgressBar = ({ progress, label, showPercentage = true }) => {
  const percentage = Math.min(Math.max(progress, 0), 100);
  
  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {showPercentage && (
            <Text style={styles.percentage}>{percentage.toFixed(0)}%</Text>
          )}
        </View>
      )}
      
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percentage}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  
  label: {
    fontSize: theme.typography.textSm,
    color: theme.colors.navy900,
    fontWeight: theme.typography.fontMedium,
  },
  
  percentage: {
    fontSize: theme.typography.textSm,
    color: theme.colors.blue400,
    fontWeight: theme.typography.fontBold,
  },
  
  track: {
    height: 12,
    backgroundColor: theme.colors.gray200,
    borderRadius: theme.radius.full,
    overflow: 'hidden',
  },
  
  fill: {
    height: '100%',
    backgroundColor: theme.colors.red500,
    borderRadius: theme.radius.full,
  },
});

export default ProgressBar;
```

---

## 4. AGE-APPROPRIATE UX (AGES 5–14)

### 4.1 Design Principles for Youth

**1. Simplicity Over Sophistication**
- Max 3 primary actions per screen
- One clear goal per view
- Avoid nested navigation (max 2 levels deep)

**2. Large, Clear Touch Targets**
- Minimum 44x44 points (iOS), 48x48 dp (Android)
- Ample spacing between interactive elements (min 12px)
- Avoid small text links; use button components

**3. Visual Language**
- Use icons + text labels (never icon-only)
- Emojis for emotional connection (🎉, 🏆, 🎯)
- Progress indicators (bars, percentages) for motivation
- Color-coded feedback (green = good, red = error)

**4. Reading Level: Grades 3–5**
- Short sentences (max 15 words)
- Active voice ("You raised $240!" vs. "Funds have been raised")
- Avoid jargon ("People who signed up" vs. "Subscribers")
- Positive, encouraging tone

**5. Gamification**
- Badges/achievements (first sale, 10 sales, 50 sales)
- Leaderboard (opt-in, troop-only)
- Streak tracking (days active)
- Visual milestones (progress bars to goals)

**6. Immediate Feedback**
- Success animations (confetti, checkmarks)
- Tactile feedback (haptics on button press)
- Toast notifications for key events ("Sarah signed up!")

### 4.2 Scout Dashboard — Age-Appropriate Patterns

**Navigation:**
```
┌─────────────────────────────────────────┐
│  ← Back     My Dashboard          🏆    │  ← Large back button, clear title
├─────────────────────────────────────────┤
│  [Dashboard] [Offers] [Settings]        │  ← Tab bar (3 max tabs)
└─────────────────────────────────────────┘
```

**Metric Display:**
```jsx
// Good: Clear, visual, encouraging
<Card>
  <Icon>🎯</Icon>
  <BigNumber>$240</BigNumber>
  <Label>You Raised This Much!</Label>
  <ProgressBar progress={80} label="Goal: $300" />
  <Message>Great job! You're almost there! 🎉</Message>
</Card>

// Bad: Dense, confusing
<Table>
  <Row>
    <Cell>Fundraising Total</Cell>
    <Cell>$240.00</Cell>
  </Row>
  <Row>
    <Cell>Conversion Rate</Cell>
    <Cell>42.5%</Cell>
  </Row>
</Table>
```

**Action Buttons:**
```jsx
// Good: Large, clear, single action
<Button 
  title="📤 Share My Link" 
  size="large" 
  variant="primary"
  fullWidth
/>

// Bad: Small, ambiguous
<Link href="/share">Share</Link>
```

### 4.3 Error States & Empty States

**Error Messages (Age-Appropriate):**
```jsx
// Good
<ErrorView>
  <Icon>😕</Icon>
  <Heading>Oops! Something went wrong</Heading>
  <Message>We couldn't load your stats right now. Try again?</Message>
  <Button title="Try Again" onPress={retry} />
</ErrorView>

// Bad
<Alert severity="error">
  HTTP 500: Internal Server Error. Contact system administrator.
</Alert>
```

**Empty States:**
```jsx
// Good: Encouraging, actionable
<EmptyState>
  <Icon>🚀</Icon>
  <Heading>Ready to start?</Heading>
  <Message>Share your link to get your first sign-up!</Message>
  <Button title="Share Now" variant="primary" />
</EmptyState>

// Bad: Discouraging
<EmptyState>
  <Message>No data available.</Message>
</EmptyState>
```

### 4.4 Parent/Guardian Oversight

**Scout Account Access:**
- Scout does NOT have login credentials
- Parent accesses Scout dashboard via:
  1. Troop leader sends parent invitation email
  2. Parent creates account (email + password)
  3. Parent dashboard shows linked Scout(s)
  4. Parent can view Scout progress, print posters, update contact info

**Parent Dashboard View:**
```
┌─────────────────────────────────────────┐
│  ← Back     My Scouts              ⚙️   │
├─────────────────────────────────────────┤
│                                         │
│  👦 Emily R. (Troop 101)                │
│  ┌───────────────────────────────────┐ │
│  │  $240 Raised  |  20 Sign-ups      │ │
│  │  [View Dashboard] [Print Posters] │ │
│  └───────────────────────────────────┘ │
│                                         │
│  👧 Jake M. (Troop 101)                 │
│  ┌───────────────────────────────────┐ │
│  │  $180 Raised  |  15 Sign-ups      │ │
│  │  [View Dashboard] [Print Posters] │ │
│  └───────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

---

## 5. RESPONSIVE DESIGN

### 5.1 Breakpoints

```css
/* Mobile First Approach */
--cc-breakpoint-xs: 0px;      /* Small phones */
--cc-breakpoint-sm: 375px;    /* Standard phones */
--cc-breakpoint-md: 768px;    /* Tablets */
--cc-breakpoint-lg: 1024px;   /* Small desktops */
--cc-breakpoint-xl: 1280px;   /* Large desktops */
--cc-breakpoint-2xl: 1536px;  /* Extra large */
```

### 5.2 Layout Patterns

**Mobile (< 768px):**
- Single-column layout
- Full-width cards
- Stacked navigation (hamburger menu)
- Bottom tab bar (3–5 tabs max)

**Tablet (768px – 1024px):**
- Two-column layout for dashboards
- Side navigation drawer (persistent or collapsible)
- Cards in 2-column grid

**Desktop (> 1024px):**
- Multi-column layout (sidebar + main + optional right panel)
- Persistent side navigation
- Cards in 3-column grid
- Hover states enabled

**React Native (Mobile Only):**
- Use `Dimensions.get('window').width` for dynamic sizing
- Or `useWindowDimensions()` hook
- React Native Paper or NativeBase for responsive grids

### 5.3 Responsive Typography

```css
/* Mobile */
h1 { font-size: 32px; }
h2 { font-size: 24px; }
body { font-size: 16px; }

/* Tablet */
@media (min-width: 768px) {
  h1 { font-size: 38px; }
  h2 { font-size: 28px; }
  body { font-size: 16px; }
}

/* Desktop */
@media (min-width: 1024px) {
  h1 { font-size: 44px; }
  h2 { font-size: 32px; }
  body { font-size: 16px; }
}
```

---

## 6. ACCESSIBILITY (WCAG 2.1 AA)

### 6.1 Color Contrast Requirements

**Text Contrast:**
- Normal text (< 18px): **4.5:1** minimum
- Large text (≥ 18px or ≥ 14px bold): **3:1** minimum
- UI components (buttons, icons): **3:1** minimum

**Compliant Combinations:**
| Foreground | Background | Ratio | Pass |
|------------|------------|-------|------|
| `--cc-navy900` | `--cc-white` | 18.5:1 | ✅ AAA |
| `--cc-blue500` | `--cc-white` | 7.2:1 | ✅ AAA |
| `--cc-red500` | `--cc-white` | 5.8:1 | ✅ AA |
| `--cc-white` | `--cc-red500` | 5.8:1 | ✅ AA |
| `--cc-gray400` | `--cc-white` | 2.9:1 | ❌ Fail (use for borders only) |

**Audit Process:**
- Use **WebAIM Contrast Checker** or **Figma plugins**
- Test all text/background combinations
- Adjust shades if needed (e.g., darken `--cc-blue400` for small text)

### 6.2 Keyboard Navigation

**Requirements:**
- All interactive elements focusable via Tab key
- Logical tab order (top-to-bottom, left-to-right)
- Skip links ("Skip to main content")
- Focus indicators visible (2px outline, high contrast)

**Focus Styles:**
```css
.cc-button:focus-visible,
.cc-input:focus-visible,
.cc-link:focus-visible {
  outline: 2px solid var(--cc-blue500);
  outline-offset: 2px;
}

/* Never remove focus outlines without providing alternative */
button:focus {
  outline: none; /* ❌ Bad */
}

button:focus-visible {
  outline: 2px solid var(--cc-blue500); /* ✅ Good */
}
```

### 6.3 Screen Reader Support

**Semantic HTML:**
```html
<!-- ✅ Good: Proper heading hierarchy -->
<h1>Scout Dashboard</h1>
<section aria-labelledby="fundraising-section">
  <h2 id="fundraising-section">Your Fundraising</h2>
  <p>Total Raised: $240</p>
</section>

<!-- ❌ Bad: Div soup -->
<div class="title">Scout Dashboard</div>
<div class="section">
  <div class="subtitle">Your Fundraising</div>
  <div>Total Raised: $240</div>
</div>
```

**ARIA Labels:**
```jsx
// Icon-only buttons need labels
<Button 
  onPress={handleShare}
  aria-label="Share your referral link"
>
  <Icon name="share" />
</Button>

// Charts need text alternatives
<LineChart 
  data={revenueData} 
  accessibilityLabel="Revenue increased from $2,000 in Week 1 to $3,500 in Week 4, a 75% increase"
/>

// Progress bars
<ProgressBar 
  progress={80} 
  aria-valuenow={80}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label="80% of fundraising goal reached"
/>
```

**React Native Accessibility:**
```jsx
<TouchableOpacity
  accessible={true}
  accessibilityLabel="Share your link"
  accessibilityHint="Opens sharing menu to send your referral link"
  accessibilityRole="button"
  onPress={handleShare}
>
  <Icon name="share" />
</TouchableOpacity>
```

### 6.4 Motion & Animation

**Respect `prefers-reduced-motion`:**
```css
/* Default: Smooth animations */
.cc-button {
  transition: transform 0.2s ease;
}

.cc-button:hover {
  transform: translateY(-2px);
}

/* Reduced motion: Disable animations */
@media (prefers-reduced-motion: reduce) {
  .cc-button {
    transition: none;
  }
  
  .cc-button:hover {
    transform: none;
  }
}
```

**React Native:**
```jsx
import { useReducedMotion } from 'react-native';

const MyComponent = () => {
  const reducedMotion = useReducedMotion();
  
  return (
    <Animated.View
      style={{
        transform: [
          {
            scale: reducedMotion ? 1 : animatedValue
          }
        ]
      }}
    />
  );
};
```

### 6.5 Form Accessibility

**Labels & Instructions:**
```jsx
<View>
  <Text style={styles.label} nativeID="email-label">
    Email Address
  </Text>
  <Text style={styles.hint} nativeID="email-hint">
    We'll send your subscription details here
  </Text>
  <TextInput
    accessibilityLabelledBy="email-label"
    accessibilityDescribedBy="email-hint"
    keyboardType="email-address"
    autoComplete="email"
  />
</View>
```

**Error Handling:**
```jsx
<View>
  <TextInput
    value={email}
    onChangeText={setEmail}
    accessibilityLabel="Email Address"
    accessibilityInvalid={!!emailError}
    accessibilityErrorMessage={emailError}
  />
  {emailError && (
    <Text style={styles.error} role="alert">
      {emailError}
    </Text>
  )}
</View>
```

---

## 7. THEME OBJECT (REACT NATIVE)

### 7.1 Complete Theme Export

**File: `/src/styles/theme.js`**
```javascript
export const theme = {
  colors: {
    // Primary
    navy900: '#000C2F',
    navy800: '#041933',
    navy700: '#05244A',
    navy600: '#0B3566',
    navy500: '#133D72',
    blue600: '#094076',
    blue500: '#0A4384',
    blue400: '#3B5C82',
    blue300: '#5A7BA0',
    blue200: '#8EAACC',
    blue100: '#C4D7EB',
    red600: '#B01427',
    red500: '#D9012C',
    red400: '#E33250',
    red300: '#ED6580',
    red200: '#F799AE',
    red100: '#FBCCD7',
    highlight: '#3B5C82',
    
    // Neutrals
    white: '#FFFFFF',
    black: '#000000',
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray600: '#4B5563',
    gray700: '#374151',
    gray800: '#1F2937',
    gray900: '#111827',
    
    // Semantic
    successLight: '#D1FAE5',
    success: '#10B981',
    successDark: '#065F46',
    warningLight: '#FEF3C7',
    warning: '#F59E0B',
    warningDark: '#92400E',
    errorLight: '#FEE2E2',
    error: '#EF4444',
    errorDark: '#991B1B',
    infoLight: '#DBEAFE',
    info: '#3B82F6',
    infoDark: '#1E40AF',
  },
  
  spacing: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
    '4xl': 96,
  },
  
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    
    // Sizes
    textXs: 12,
    textSm: 14,
    textBase: 16,
    textLg: 18,
    textXl: 20,
    text2xl: 24,
    text3xl: 32,
    text4xl: 44,
    
    // Weights
    fontNormal: '400',
    fontMedium: '500',
    fontSemibold: '600',
    fontBold: '700',
    
    // Line Heights
    leadingTight: 1.25,
    leadingNormal: 1.5,
    leadingRelaxed: 1.75,
  },
  
  radius: {
    sm: 4,
    md: 8,
    lg: 14,
    xl: 24,
    full: 999,
  },
  
  shadows: {
    card: {
      shadowColor: '#000C2F',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 24,
      elevation: 4, // Android
    },
    floating: {
      shadowColor: '#000C2F',
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.2,
      shadowRadius: 48,
      elevation: 8,
    },
    button: {
      shadowColor: '#000C2F',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
  },
};
```

### 7.2 Theme Context Provider

**File: `/src/context/ThemeContext.jsx`**
```jsx
import React, { createContext, useContext } from 'react';
import { theme as defaultTheme } from '../styles/theme';

const ThemeContext = createContext(defaultTheme);

export const ThemeProvider = ({ children, theme = defaultTheme }) => {
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return theme;
};
```

**Usage in Component:**
```jsx
import { useTheme } from '../context/ThemeContext';

const MyComponent = () => {
  const theme = useTheme();
  
  return (
    <View style={{ backgroundColor: theme.colors.navy900 }}>
      <Text style={{ color: theme.colors.white }}>
        Hello World
      </Text>
    </View>
  );
};
```

---

## 8. CSS CUSTOM PROPERTIES (WEB)

### 8.1 Global Stylesheet

**File: `/styles/tokens.css`**
```css
:root {
  /* Colors - Primary */
  --cc-navy900: #000C2F;
  --cc-navy800: #041933;
  --cc-navy700: #05244A;
  --cc-navy600: #0B3566;
  --cc-navy500: #133D72;
  --cc-blue600: #094076;
  --cc-blue500: #0A4384;
  --cc-blue400: #3B5C82;
  --cc-blue300: #5A7BA0;
  --cc-blue200: #8EAACC;
  --cc-blue100: #C4D7EB;
  --cc-red600: #B01427;
  --cc-red500: #D9012C;
  --cc-red400: #E33250;
  --cc-red300: #ED6580;
  --cc-red200: #F799AE;
  --cc-red100: #FBCCD7;
  --cc-highlight: #3B5C82;
  
  /* Colors - Neutrals */
  --cc-white: #FFFFFF;
  --cc-black: #000000;
  --cc-gray50: #F9FAFB;
  --cc-gray100: #F3F4F6;
  --cc-gray200: #E5E7EB;
  --cc-gray300: #D1D5DB;
  --cc-gray400: #9CA3AF;
  --cc-gray500: #6B7280;
  --cc-gray600: #4B5563;
  --cc-gray700: #374151;
  --cc-gray800: #1F2937;
  --cc-gray900: #111827;
  
  /* Colors - Semantic */
  --cc-success-light: #D1FAE5;
  --cc-success: #10B981;
  --cc-success-dark: #065F46;
  --cc-warning-light: #FEF3C7;
  --cc-warning: #F59E0B;
  --cc-warning-dark: #92400E;
  --cc-error-light: #FEE2E2;
  --cc-error: #EF4444;
  --cc-error-dark: #991B1B;
  --cc-info-light: #DBEAFE;
  --cc-info: #3B82F6;
  --cc-info-dark: #1E40AF;
  
  /* Spacing */
  --cc-space-xs: 8px;
  --cc-space-sm: 12px;
  --cc-space-md: 16px;
  --cc-space-lg: 24px;
  --cc-space-xl: 32px;
  --cc-space-2xl: 48px;
  --cc-space-3xl: 64px;
  --cc-space-4xl: 96px;
  
  /* Typography */
  --cc-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 
                    'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 
                    'Fira Sans', 'Droid Sans', 'Helvetica Neue', 
                    sans-serif;
  --cc-text-xs: 12px;
  --cc-text-sm: 14px;
  --cc-text-base: 16px;
  --cc-text-lg: 18px;
  --cc-text-xl: 20px;
  --cc-text-2xl: 24px;
  --cc-text-3xl: 32px;
  --cc-text-4xl: 44px;
  
  --cc-font-normal: 400;
  --cc-font-medium: 500;
  --cc-font-semibold: 600;
  --cc-font-bold: 700;
  
  --cc-leading-tight: 1.25;
  --cc-leading-normal: 1.5;
  --cc-leading-relaxed: 1.75;
  
  /* Border Radius */
  --cc-radius-sm: 4px;
  --cc-radius-md: 8px;
  --cc-radius-lg: 14px;
  --cc-radius-xl: 24px;
  --cc-radius-full: 999px;
  
  /* Shadows */
  --cc-shadow-card: 0px 8px 24px rgba(0, 12, 47, 0.12),
                    0px 2px 8px rgba(0, 12, 47, 0.08);
  --cc-shadow-floating: 0px 16px 48px rgba(0, 12, 47, 0.2),
                        0px 4px 16px rgba(0, 12, 47, 0.12);
  --cc-shadow-button: 0px 2px 4px rgba(0, 12, 47, 0.1);
  --cc-shadow-focus: 0 0 0 3px rgba(10, 67, 132, 0.2);
  
  /* Gradients */
  --cc-gradient-primary: radial-gradient(
    circle at 35% 45%,
    #3B5C82 0%,
    #000C2F 100%
  );
  --cc-gradient-cta: linear-gradient(
    135deg,
    #D9012C 0%,
    #B01427 100%
  );
}

/* Global Resets */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--cc-font-family);
  font-size: var(--cc-text-base);
  line-height: var(--cc-leading-normal);
  color: var(--cc-navy900);
  background-color: var(--cc-gray50);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

h1, h2, h3, h4, h5, h6 {
  font-weight: var(--cc-font-bold);
  line-height: var(--cc-leading-tight);
}
```

### 8.2 Next.js Integration

**File: `/pages/_app.jsx`**
```jsx
import '../styles/tokens.css';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
```

---

## 9. ANIMATION & MICRO-INTERACTIONS

### 9.1 Animation Principles

1. **Purpose:** Every animation should serve a purpose (feedback, guidance, delight)
2. **Duration:** 200–300ms for most interactions (fast enough to feel responsive)
3. **Easing:** Use ease-out for exits, ease-in for entrances, ease-in-out for transitions
4. **Respect Preferences:** Honor `prefers-reduced-motion`

### 9.2 Common Animations

**Button Press (React Native):**
```jsx
import { TouchableOpacity, Animated } from 'react-native';

const AnimatedButton = ({ onPress, children }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };
  
  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};
```

**Success Toast (Slide-in from bottom):**
```jsx
import { Animated } from 'react-native';

const Toast = ({ message, visible }) => {
  const slideAnim = useRef(new Animated.Value(100)).current;
  
  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
      
      setTimeout(() => {
        Animated.timing(slideAnim, {
          toValue: 100,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }, 3000);
    }
  }, [visible]);
  
  return (
    <Animated.View
      style={{
        transform: [{ translateY: slideAnim }],
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
      }}
    >
      <Card>
        <Text>{message}</Text>
      </Card>
    </Animated.View>
  );
};
```

**Loading Spinner:**
```jsx
import { ActivityIndicator } from 'react-native';
import { theme } from '../styles/theme';

const LoadingSpinner = ({ size = 'large', color = theme.colors.blue500 }) => {
  return <ActivityIndicator size={size} color={color} />;
};
```

---

## 10. ICON SYSTEM

### 10.1 Recommended Libraries

**React Native:**
- **react-native-vector-icons** (includes Font Awesome, Material Icons, Ionicons)
- Or **@expo/vector-icons** (if using Expo)

**Next.js (Web):**
- **react-icons** (includes Font Awesome, Material, Feather, etc.)
- Or **heroicons** (Tailwind's icon set)

### 10.2 Icon Usage Guidelines

**Sizes:**
- Small: 16px (inline with text)
- Medium: 24px (buttons, nav)
- Large: 32px (feature icons)
- XLarge: 48px+ (hero sections, empty states)

**Colors:**
- Inherit text color by default
- Use semantic colors for status (success green, error red)
- Ensure 3:1 contrast with background

**Accessibility:**
- Decorative icons: `aria-hidden="true"`
- Meaningful icons: Add `aria-label` or adjacent text

**Example (React Native):**
```jsx
import Icon from 'react-native-vector-icons/Ionicons';

<Icon 
  name="checkmark-circle" 
  size={24} 
  color={theme.colors.success} 
  accessibilityLabel="Success"
/>
```

---

## 11. FORM VALIDATION PATTERNS

### 11.1 Real-Time Validation

**Validate on Blur (Best Practice):**
```jsx
const [email, setEmail] = useState('');
const [emailError, setEmailError] = useState('');

const validateEmail = (value) => {
  if (!value) {
    return 'Email is required';
  }
  if (!/\S+@\S+\.\S+/.test(value)) {
    return 'Please enter a valid email';
  }
  return '';
};

const handleEmailBlur = () => {
  setEmailError(validateEmail(email));
};

<Input
  label="Email"
  value={email}
  onChangeText={setEmail}
  onBlur={handleEmailBlur}
  error={emailError}
  keyboardType="email-address"
  autoComplete="email"
/>
```

### 11.2 Form Submission

**Disable Submit Until Valid:**
```jsx
const [formValid, setFormValid] = useState(false);

useEffect(() => {
  const isValid = 
    email && !emailError &&
    password && !passwordError;
  setFormValid(isValid);
}, [email, emailError, password, passwordError]);

<Button
  title="Sign In"
  onPress={handleSubmit}
  disabled={!formValid}
  loading={isSubmitting}
/>
```

### 11.3 Server-Side Errors

**Display API Errors:**
```jsx
const [apiError, setApiError] = useState('');

const handleSubmit = async () => {
  setApiError('');
  try {
    await api.login(email, password);
  } catch (error) {
    if (error.response?.status === 401) {
      setApiError('Invalid email or password');
    } else {
      setApiError('Something went wrong. Please try again.');
    }
  }
};

{apiError && (
  <Alert variant="error" role="alert">
    {apiError}
  </Alert>
)}
```

---

## 12. SUMMARY & IMPLEMENTATION CHECKLIST

### 12.1 Design System Deliverables

- [x] Complete design token specification (colors, spacing, typography, etc.)
- [x] React Native theme object
- [x] CSS custom properties (web)
- [x] Component library (Button, Card, Input, Badge, ProgressBar)
- [x] Age-appropriate UX guidelines (ages 5–14)
- [x] Accessibility requirements (WCAG 2.1 AA)
- [x] Responsive design patterns
- [x] Animation & micro-interaction patterns
- [x] Form validation best practices

### 12.2 Implementation Checklist

**Phase 1: Foundation**
- [ ] Create `/src/styles/theme.js` (React Native)
- [ ] Create `/styles/tokens.css` (Next.js)
- [ ] Set up ThemeProvider context (React Native)
- [ ] Import global styles in `_app.jsx` (Next.js)

**Phase 2: Core Components**
- [ ] Build Button component (all variants, sizes)
- [ ] Build Card component
- [ ] Build Input component (text, email, password, textarea)
- [ ] Build Badge component
- [ ] Build ProgressBar component
- [ ] Build Toast/Alert component

**Phase 3: Composite Components**
- [ ] Build Scout Dashboard cards (fundraising, stats, leaderboard)
- [ ] Build Offer Card (merchant, discount, distance)
- [ ] Build Navigation components (tab bar, header)
- [ ] Build Form components (login, signup, claim link)

**Phase 4: Accessibility Audit**
- [ ] Test color contrast (all text/background combinations)
- [ ] Test keyboard navigation (web)
- [ ] Test screen reader support (VoiceOver, TalkBack)
- [ ] Add ARIA labels to all interactive elements
- [ ] Test with `prefers-reduced-motion`

**Phase 5: Responsive Testing**
- [ ] Test on iPhone SE (small screen)
- [ ] Test on iPhone 14 Pro (standard)
- [ ] Test on iPad (tablet)
- [ ] Test on desktop (1024px, 1280px, 1920px)
- [ ] Test dark mode support (optional, future)

### 12.3 Design QA Checklist

**Visual Consistency:**
- [ ] All buttons use design tokens (no hardcoded colors)
- [ ] Spacing follows 8pt grid
- [ ] Typography matches scale (no random font sizes)
- [ ] Border radius consistent across components
- [ ] Shadows applied correctly (card, floating, button)

**Age-Appropriate UX (Scout Dashboard):**
- [ ] Touch targets ≥ 44x44 points
- [ ] Simple language (grade 3–5 reading level)
- [ ] Icons always paired with text labels
- [ ] Error messages friendly and actionable
- [ ] Success feedback immediate (animations, toasts)

**Performance:**
- [ ] No unnecessary re-renders (use React.memo, useMemo)
- [ ] Images optimized (WebP format, lazy loading)
- [ ] Animations use `useNativeDriver` (React Native)
- [ ] CSS animations use `transform` and `opacity` (GPU-accelerated)

---

## 13. DESIGN HANDOFF ASSETS

### 13.1 Figma Deliverables (Recommended)

**Structure:**
```
Camp Card Design System (Figma File)
├── 📄 Cover Page (project overview, stakeholders)
├── 🎨 Tokens
│   ├── Color Palette (swatches with hex codes)
│   ├── Typography Scale (text styles)
│   ├── Spacing Grid (8pt visual guide)
│   ├── Shadows (component examples)
│   └── Border Radius (component examples)
├── 🧩 Components
│   ├── Buttons (all variants, states, sizes)
│   ├── Cards (default, elevated, gradient)
│   ├── Inputs (text, error, disabled)
│   ├── Badges (all semantic colors)
│   └── Icons (curated set)
├── 📱 Mobile Screens
│   ├── Scout Dashboard (annotated)
│   ├── Offer List
│   ├── Offer Detail
│   ├── Redemption Flow
│   └── Settings
├── 💻 Web Screens
│   ├── Troop Leader Dashboard
│   ├── Council Admin Dashboard
│   └── Customer Dashboard
└── ♿ Accessibility Notes
    ├── Color Contrast Table
    ├── Focus State Examples
    └── Screen Reader Labels
```

### 13.2 Developer Handoff

**Include in Handoff:**
1. **Token JSON file** (exportable from Figma via plugins)
2. **Component specs** (dimensions, spacing, states)
3. **Redlines** (spacing measurements, font sizes)
4. **Asset exports** (logos, icons in SVG, PNG @1x @2x @3x)
5. **Prototype links** (interactive Figma prototypes for flows)

**Handoff Tools:**
- **Figma Dev Mode** (inspect, export code snippets)
- **Zeplin** (alternative)
- **Storybook** (for component library documentation)

---

**END OF PART 7**

**Next:** Part 8 — Security, Privacy & Youth Protections
