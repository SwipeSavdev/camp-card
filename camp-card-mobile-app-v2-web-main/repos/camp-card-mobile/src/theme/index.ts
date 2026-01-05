// Camp Card MultiTenant Mobile App Theme
// Source: CampCard_MultiTenant_MobileApp_UIUX/react-native/theme.ts
// Keep this file as the single source of truth for colors/radius/spacing across roles.

export const colors = {
 navy900: '#000C2F',
 navy800: '#01153A',
 navy700: '#05244A',
 navy600: '#0F2F55',
 blue500: '#0A4384',
 blue400: '#294A6F',
 highlight: '#3B5C82',
 white: '#FFFFFF',
 red500: '#D9012C',
 red600: '#B01427',
 gray50: '#F4F6FA',
 gray200: '#D8E0EC',
 text: '#000C2F',
 muted: 'rgba(0,12,47,0.65)',
};

export const radius = {
 card: 24,
 button: 14,
 xl: 28,
 lg: 20,
 md: 16,
 sm: 12,
};

export const space = {
 xs: 8,
 sm: 12,
 md: 16,
 lg: 24,
 xl: 32,
};

export const shadow = {
 card: {
 shadowColor: colors.navy900,
 shadowOpacity: 0.18,
 shadowRadius: 18,
 shadowOffset: { width: 0, height: 10 },
 elevation: 6, // Android
 },
};

export const gradients = {
 hero: [colors.highlight, colors.navy900] as const,
};

// Asset references (copy files from CampCard_MultiTenant_MobileApp_UIUX/assets/images)
export const images = {
 appIcon: require('../../assets/images/appicon_1024.png'),
 councilLogo: require('../../assets/images/council_logo.png'),
 campCardLockup: require('../../assets/images/campcard_lockup.png'),
 campCardBg: require('../../assets/images/campcard_bg.png'),
};
