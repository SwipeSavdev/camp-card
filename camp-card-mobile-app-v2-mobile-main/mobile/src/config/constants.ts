import Constants from 'expo-constants';

// API Configuration
// Production API at api.campcardapp.org
// Falls back to EC2 IP for development
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.campcardapp.org';

// Authorize.net Configuration
export const AUTHORIZENET_PUBLIC_CLIENT_KEY =
  process.env.EXPO_PUBLIC_AUTHORIZENET_PUBLIC_CLIENT_KEY || '';

export const AUTHORIZENET_API_LOGIN_ID =
  process.env.EXPO_PUBLIC_AUTHORIZENET_API_LOGIN_ID || '';

// Google Maps API Key
export const GOOGLE_MAPS_API_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

// Firebase Configuration
export const FIREBASE_CONFIG = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
};

// AWS Location Service Configuration
export const AWS_CONFIG = {
  region: process.env.EXPO_PUBLIC_AWS_REGION || 'us-east-2',
  identityPoolId: process.env.EXPO_PUBLIC_AWS_IDENTITY_POOL_ID || '',
  location: {
    placeIndex: 'campcard-place-index',
    routeCalculator: 'campcard-route-calculator',
    geofenceCollection: 'campcard-geofences',
    tracker: 'campcard-tracker',
    map: 'campcard-map',
  },
};

// Feature Flags
export const FEATURES = {
  ENABLE_CUSTOMER_REFERRALS:
    process.env.EXPO_PUBLIC_ENABLE_CUSTOMER_REFERRALS === 'true',
  ENABLE_PUSH_NOTIFICATIONS:
    process.env.EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS === 'true',
  ENABLE_BIOMETRIC_AUTH:
    process.env.EXPO_PUBLIC_ENABLE_BIOMETRIC_AUTH === 'true',
};

// App Configuration
export const APP_CONFIG = {
  name: Constants.expoConfig?.name || 'BSA Camp Card',
  version: Constants.expoConfig?.version || '1.0.0',
  environment: process.env.EXPO_PUBLIC_ENVIRONMENT || 'development',
};

// BSA Branding Colors
export const COLORS = {
  primary: '#CE1126', // BSA Red
  secondary: '#003F87', // BSA Blue
  accent: '#FFD700', // Gold
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  white: '#FFFFFF',
  navy: '#003F87',
  text: '#212121',
  textSecondary: '#757575',
  border: '#E0E0E0',
};

// Map Configuration
export const MAP_CONFIG = {
  defaultRegion: {
    latitude: 39.8283, // USA center
    longitude: -98.5795,
    latitudeDelta: 40,
    longitudeDelta: 40,
  },
  defaultRadius: 25, // miles
};

// In-App Purchase Product IDs (iOS & Android)
export const IAP_PRODUCTS = {
  SUBSCRIPTION_ANNUAL: 'org.bsa.campcard.subscription.annual',
  SUBSCRIPTION_ANNUAL_SCOUT: 'org.bsa.campcard.subscription.annual.scout',
  CARDS_1: 'org.bsa.campcard.cards.1',
  CARDS_3: 'org.bsa.campcard.cards.3',
  CARDS_5: 'org.bsa.campcard.cards.5',
  CARDS_10: 'org.bsa.campcard.cards.10',
} as const;

export const IAP_SUBSCRIPTION_SKUS = [
  IAP_PRODUCTS.SUBSCRIPTION_ANNUAL,
  IAP_PRODUCTS.SUBSCRIPTION_ANNUAL_SCOUT,
];

export const IAP_CARD_SKUS = [
  IAP_PRODUCTS.CARDS_1,
  IAP_PRODUCTS.CARDS_3,
  IAP_PRODUCTS.CARDS_5,
  IAP_PRODUCTS.CARDS_10,
];

export const IAP_CARD_PRODUCTS = [
  { productId: IAP_PRODUCTS.CARDS_1, quantity: 1, priceCents: 1499 },
  { productId: IAP_PRODUCTS.CARDS_3, quantity: 3, priceCents: 4499 },
  { productId: IAP_PRODUCTS.CARDS_5, quantity: 5, priceCents: 7499 },
  { productId: IAP_PRODUCTS.CARDS_10, quantity: 10, priceCents: 14999 },
] as const;

// Apple IAP pricing (in cents) - for fallback display when StoreKit unavailable
export const IAP_PRICES = {
  SUBSCRIPTION_ANNUAL: 1499, // $14.99/year
  CARDS_1: 1499,             // $14.99
  CARDS_3: 4499,             // $44.99
  CARDS_5: 7499,             // $74.99
  CARDS_10: 14999,           // $149.99
} as const;

// Subscription Plans
export const SUBSCRIPTION_PLANS = {
  BASIC: {
    id: 'basic',
    name: 'Basic Plan',
    price: 10.0,
    features: ['Access to local offers', 'QR code redemption'],
  },
  PREMIUM: {
    id: 'premium',
    name: 'Premium Plan',
    price: 25.0,
    features: [
      'Access to all offers nationwide',
      'Priority customer support',
      'Exclusive partner offers',
      'Referral bonuses',
    ],
  },
};
