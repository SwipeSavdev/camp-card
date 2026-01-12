import Constants from 'expo-constants';

// API Configuration
// Default port 7010 matches the backend Spring Boot server
// AWS EC2 backend for production
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || 'http://18.190.69.205:7010';

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
  background: '#F5F5F5',
  surface: '#FFFFFF',
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
