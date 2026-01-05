import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useAuthStore } from '../store/authStore';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Main Screens
import HomeScreen from '../screens/home/HomeScreen';
import OffersScreen from '../screens/offers/OffersScreen';
import OfferDetailScreen from '../screens/offers/OfferDetailScreen';
import ScanScreen from '../screens/scan/ScanScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

// Scout Screens
import ScoutDashboardScreen from '../screens/scout/ScoutDashboardScreen';
import SubscriptionScreen from '../screens/scout/SubscriptionScreen';
import ReferralScreen from '../screens/scout/ReferralScreen';

// Additional Screens
import MerchantsScreen from '../screens/MerchantsScreen';
import MerchantDetailScreen from '../screens/MerchantDetailScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import RedemptionSuccessScreen from '../screens/RedemptionSuccessScreen';
import ShareOfferScreen from '../screens/ShareOfferScreen';
import QRScannerScreen from '../screens/QRScannerScreen';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Merchants: undefined;
  MerchantDetail: { merchantId: number };
  Notifications: undefined;
  RedemptionSuccess: { redemption: any; offer: any };
  ShareOffer: { offer: any };
  QRScanner: undefined;
  Subscription: undefined;
  Referral: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Offers: undefined;
  Scan: undefined;
  Scout: undefined;
  Profile: undefined;
};

export type OffersStackParamList = {
  OffersList: undefined;
  OfferDetail: { offerId: string };
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();
const OffersStack = createNativeStackNavigator<OffersStackParamList>();

/**
 * Auth Navigator - Login, Signup, Forgot Password
 */
function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </AuthStack.Navigator>
  );
}

/**
 * Offers Stack Navigator - Offers List & Detail
 */
function OffersNavigator() {
  return (
    <OffersStack.Navigator>
      <OffersStack.Screen
        name="OffersList"
        component={OffersScreen}
        options={{ title: 'Offers Near You' }}
      />
      <OffersStack.Screen
        name="OfferDetail"
        component={OfferDetailScreen}
        options={{ title: 'Offer Details' }}
      />
    </OffersStack.Navigator>
  );
}

/**
 * Main Tab Navigator - Bottom tabs
 */
function MainNavigator() {
  return (
    <MainTab.Navigator
      screenOptions={({ route }: any) => ({
        tabBarIcon: ({ focused, color, size }: any) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Offers') {
            iconName = focused ? 'pricetag' : 'pricetag-outline';
          } else if (route.name === 'Scan') {
            iconName = focused ? 'qr-code' : 'qr-code-outline';
          } else if (route.name === 'Scout') {
            iconName = focused ? 'ribbon' : 'ribbon-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'ellipse';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#CE1126', // BSA Red
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <MainTab.Screen name="Home" component={HomeScreen} />
      <MainTab.Screen name="Offers" component={OffersNavigator} />
      <MainTab.Screen
        name="Scan"
        component={ScanScreen}
        options={{ tabBarLabel: 'Scan QR' }}
      />
      <MainTab.Screen
        name="Scout"
        component={ScoutDashboardScreen}
        options={{ tabBarLabel: 'My Cards' }}
      />
      <MainTab.Screen name="Profile" component={ProfileScreen} />
    </MainTab.Navigator>
  );
}

/**
 * Root Navigator - Handles Auth vs Main flow
 */
export default function RootNavigator() {
  const { isAuthenticated } = useAuthStore();

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <RootStack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        <>
          <RootStack.Screen name="Main" component={MainNavigator} />
          {/* Modal Screens - available from anywhere */}
          <RootStack.Group screenOptions={{ presentation: 'modal' }}>
            <RootStack.Screen 
              name="Merchants" 
              component={MerchantsScreen}
              options={{ headerShown: true, title: 'All Merchants' }}
            />
            <RootStack.Screen 
              name="MerchantDetail" 
              component={MerchantDetailScreen}
              options={{ headerShown: true, title: 'Merchant Details' }}
            />
            <RootStack.Screen 
              name="Notifications" 
              component={NotificationsScreen}
              options={{ headerShown: true, title: 'Notifications' }}
            />
            <RootStack.Screen 
              name="Subscription" 
              component={SubscriptionScreen}
              options={{ headerShown: true, title: 'Subscription' }}
            />
            <RootStack.Screen 
              name="Referral" 
              component={ReferralScreen}
              options={{ headerShown: true, title: 'Referrals' }}
            />
          </RootStack.Group>
          {/* Fullscreen Modal Screens */}
          <RootStack.Group screenOptions={{ presentation: 'fullScreenModal' }}>
            <RootStack.Screen 
              name="QRScanner" 
              component={QRScannerScreen}
              options={{ headerShown: true, title: 'My QR Code' }}
            />
            <RootStack.Screen 
              name="ShareOffer" 
              component={ShareOfferScreen}
              options={{ headerShown: true, title: 'Share Offer' }}
            />
            <RootStack.Screen 
              name="RedemptionSuccess" 
              component={RedemptionSuccessScreen}
              options={{ headerShown: false }}
            />
          </RootStack.Group>
        </>
      )}
    </RootStack.Navigator>
  );
}
