// Camp Card  React Native Theme (tokens from brand-tokens.css/json)
// Use as a single source of truth for colors/radius/spacing across roles.

export const colors = {
 navy900: "#000C2F",
 navy800: "#01153A",
 navy700: "#05244A",
 navy600: "#0F2F55",
 blue500: "#0A4384",
 blue400: "#294A6F",
 blue200: "#E0EFFE",
 blue50: "#F0F6FF",
 highlight: "#3B5C82",
 white: "#FFFFFF",
 red500: "#D9012C",
 red600: "#B01427",
 green500: "#00B86B",
 green400: "#39D98A",
 gray50: "#F4F6FA",
 gray100: "#EBF0FA",
 gray200: "#D8E0EC",
 gray300: "#C5D1E0",
 text: "#000C2F",
 muted: "rgba(0,12,47,0.65)",
 // Alias for convenience
 primary: "#D9012C",
};

export const radius = {
 card: 24,
 button: 14,
 pill: 20,
 xl: 28,
 lg: 20,
 md: 16,
 sm: 12,
};

export const space = {
 xs: 4,
 sm: 8,
 md: 12,
 lg: 16,
 xl: 24,
};

export const shadow = {
 card: {
 shadowColor: "#000C2F",
 shadowOpacity: 0.18,
 shadowRadius: 18,
 shadowOffset: { width: 0, height: 10 },
 elevation: 6, // Android
 },
};

// Motion tokens for animations
export const motion = {
 fast: 200, // Toggles, quick interactions
 normal: 300, // Standard transitions, button presses
 slow: 600, // Card flips, modals, significant layout changes
 easing: {
 ease_in_out: "cubic-bezier(0.4, 0, 0.2, 1)",
 ease_out: "cubic-bezier(0, 0, 0.2, 1)",
 ease_in: "cubic-bezier(0.4, 0, 1, 1)",
 },
};

// Gradient suggestion (use expo-linear-gradient or react-native-linear-gradient)
export const gradients = {
 hero: ["#3B5C82", "#000C2F"],
};

// Asset references (copy the /assets/images files into your RN project)
export const images = {
 appIcon: "assets/images/appicon_1024.png",
 councilLogo: "assets/images/council_logo.png",
 campCardLockup: "assets/images/campcard_lockup.png",
 campCardBg: "assets/images/campcard_bg.png",
};
