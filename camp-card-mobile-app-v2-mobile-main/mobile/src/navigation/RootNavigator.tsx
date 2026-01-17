import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useAuthStore } from '../store/authStore';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import EmailVerificationScreen from '../screens/auth/EmailVerificationScreen';

// Main Screens
import HomeScreen from '../screens/home/HomeScreen';
import OffersScreen from '../screens/offers/OffersScreen';
import OfferDetailScreen from '../screens/offers/OfferDetailScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

// Scout Screens
import ScoutDashboardScreen from '../screens/scout/ScoutDashboardScreen';
import SubscriptionScreen from '../screens/scout/SubscriptionScreen';
import ReferralScreen from '../screens/scout/ReferralScreen';

// Troop Leader Screens
import TroopLeaderDashboardScreen from '../screens/troopLeader/TroopLeaderDashboardScreen';
import ManageScoutsScreen from '../screens/troopLeader/ManageScoutsScreen';
import TroopStatsScreen from '../screens/troopLeader/TroopStatsScreen';
import InviteScoutsScreen from '../screens/troopLeader/InviteScoutsScreen';
import SelectScoutForSubscriptionScreen from '../screens/troopLeader/SelectScoutForSubscriptionScreen';

// Additional Screens
import MerchantsScreen from '../screens/MerchantsScreen';
import MerchantDetailScreen from '../screens/MerchantDetailScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import RedemptionSuccessScreen from '../screens/RedemptionSuccessScreen';
import ShareOfferScreen from '../screens/ShareOfferScreen';
import QRScannerScreen from '../screens/QRScannerScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import ChangePasswordScreen from '../screens/profile/ChangePasswordScreen';
import PrivacyPolicyScreen from '../screens/profile/PrivacyPolicyScreen';
import TermsOfServiceScreen from '../screens/profile/TermsOfServiceScreen';
import HelpSupportScreen from '../screens/profile/HelpSupportScreen';
import WalletScreen from '../screens/wallet/WalletScreen';
import RedemptionHistoryScreen from '../screens/wallet/RedemptionHistoryScreen';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
  EmailVerification: { token: string };
};

export type OffersStackParamList = {
  OffersList: undefined;
  OfferDetail: { offerId: string };
};

// Scout Types
export type ScoutTabParamList = {
  Home: undefined;
  Wallet: undefined;
  QRCode: undefined;
  Profile: undefined;
};

export type ScoutStackParamList = {
  ScoutTabs: undefined;
  Merchants: undefined;
  MerchantDetail: { merchantId: number };
  Notifications: undefined;
  Subscription: undefined;
  Referral: undefined;
  ViewOffers: undefined;
  OfferDetail: { offerId: number };
  QRScanner: undefined;
  ShareOffer: { offer: any };
  RedemptionSuccess: { redemption: any; offer: any };
  RedemptionHistory: undefined;
  Settings: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
  HelpSupport: undefined;
};

// Troop Leader Types
export type TroopLeaderTabParamList = {
  Home: undefined;
  Offers: undefined;
  Dashboard: undefined;
  Scouts: undefined;
  Profile: undefined;
};

export type TroopLeaderStackParamList = {
  TroopLeaderTabs: undefined;
  Merchants: undefined;
  MerchantDetail: { merchantId: number };
  OfferDetail: { offerId: number };
  Notifications: undefined;
  ManageScouts: undefined;
  TroopStats: undefined;
  InviteScouts: undefined;
  Subscription: undefined;
  SelectScoutForSubscription: { planId: string };
  QRScanner: undefined;
  ShareOffer: { offer: any };
  RedemptionSuccess: { redemption: any; offer: any };
  RedemptionHistory: undefined;
  Settings: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
  HelpSupport: undefined;
};

// Customer/Parent Types
export type CustomerTabParamList = {
  Home: undefined;
  Wallet: undefined;
  Offers: undefined;
  Merchants: undefined;
  Profile: undefined;
};

export type CustomerStackParamList = {
  CustomerTabs: undefined;
  MerchantDetail: { merchantId: number };
  OfferDetail: { offerId: number };
  Notifications: undefined;
  Subscription: undefined;
  Referral: undefined;
  QRScanner: undefined;
  ShareOffer: { offer: any };
  RedemptionSuccess: { redemption: any; offer: any };
  RedemptionHistory: undefined;
  Settings: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
  HelpSupport: undefined;
};

// ============================================================================
// CREATE NAVIGATORS
// ============================================================================

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const OffersStack = createNativeStackNavigator<OffersStackParamList>();

// Scout navigators
const ScoutTab = createBottomTabNavigator<ScoutTabParamList>();
const ScoutStack = createNativeStackNavigator<ScoutStackParamList>();

// Troop Leader navigators
const TroopLeaderTab = createBottomTabNavigator<TroopLeaderTabParamList>();
const TroopLeaderStack = createNativeStackNavigator<TroopLeaderStackParamList>();

// Customer/Parent navigators
const CustomerTab = createBottomTabNavigator<CustomerTabParamList>();
const CustomerStack = createNativeStackNavigator<CustomerStackParamList>();

// ============================================================================
// SHARED NAVIGATORS
// ============================================================================

function AuthNavigator() {
  return (
    <AuthStack.Navigator id="AuthStack" screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <AuthStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <AuthStack.Screen name="EmailVerification" component={EmailVerificationScreen} />
    </AuthStack.Navigator>
  );
}

function OffersNavigator() {
  return (
    <OffersStack.Navigator id="OffersStack">
      <OffersStack.Screen
        name="OffersList"
        component={OffersScreen}
        options={{ headerShown: false }}
      />
      <OffersStack.Screen
        name="OfferDetail"
        component={OfferDetailScreen}
        options={{ title: 'Offer Details' }}
      />
    </OffersStack.Navigator>
  );
}

// ============================================================================
// SCOUT NAVIGATION (Red Theme)
// Tabs: Home, My Cards, Profile
// Scouts have view-only access to offers via My Cards screen
// ============================================================================

function ScoutTabNavigator() {
  return (
    <ScoutTab.Navigator
      id="ScoutTabs"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            Home: focused ? 'home' : 'home-outline',
            Wallet: focused ? 'wallet' : 'wallet-outline',
            QRCode: focused ? 'qr-code' : 'qr-code-outline',
            Profile: focused ? 'person' : 'person-outline',
          };
          return <Ionicons name={icons[route.name] || 'ellipse'} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#CE1126', // BSA Red
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <ScoutTab.Screen name="Home" component={HomeScreen} />
      <ScoutTab.Screen name="Wallet" component={WalletScreen} options={{ tabBarLabel: 'My Card' }} />
      <ScoutTab.Screen name="QRCode" component={ScoutDashboardScreen} options={{ tabBarLabel: 'QR Code' }} />
      <ScoutTab.Screen name="Profile" component={ProfileScreen} />
    </ScoutTab.Navigator>
  );
}

function ScoutMainNavigator() {
  return (
    <ScoutStack.Navigator id="ScoutMain" screenOptions={{ headerShown: false }}>
      <ScoutStack.Screen name="ScoutTabs" component={ScoutTabNavigator} />
      <ScoutStack.Group screenOptions={{ presentation: 'modal' }}>
        <ScoutStack.Screen name="Merchants" component={MerchantsScreen} options={{ headerShown: true, title: 'All Merchants' }} />
        <ScoutStack.Screen name="MerchantDetail" component={MerchantDetailScreen} options={{ headerShown: true, title: 'Merchant Details' }} />
        <ScoutStack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: true, title: 'Notifications' }} />
        <ScoutStack.Screen name="Subscription" component={SubscriptionScreen} options={{ headerShown: true, title: 'Subscription' }} />
        <ScoutStack.Screen name="Referral" component={ReferralScreen} options={{ headerShown: true, title: 'Referrals' }} />
        <ScoutStack.Screen name="ViewOffers" component={OffersScreen} options={{ headerShown: true, title: 'Available Offers' }} />
        <ScoutStack.Screen name="OfferDetail" component={OfferDetailScreen} options={{ headerShown: false }} />
        <ScoutStack.Screen name="RedemptionHistory" component={RedemptionHistoryScreen} options={{ headerShown: false }} />
        <ScoutStack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
        <ScoutStack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: false }} />
        <ScoutStack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ headerShown: false }} />
        <ScoutStack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ headerShown: false }} />
        <ScoutStack.Screen name="TermsOfService" component={TermsOfServiceScreen} options={{ headerShown: false }} />
        <ScoutStack.Screen name="HelpSupport" component={HelpSupportScreen} options={{ headerShown: false }} />
      </ScoutStack.Group>
      <ScoutStack.Group screenOptions={{ presentation: 'fullScreenModal' }}>
        <ScoutStack.Screen name="QRScanner" component={QRScannerScreen} options={{ headerShown: true, title: 'My QR Code' }} />
        <ScoutStack.Screen name="ShareOffer" component={ShareOfferScreen} options={{ headerShown: true, title: 'Share Offer' }} />
        <ScoutStack.Screen name="RedemptionSuccess" component={RedemptionSuccessScreen} options={{ headerShown: false }} />
      </ScoutStack.Group>
    </ScoutStack.Navigator>
  );
}

// ============================================================================
// TROOP LEADER NAVIGATION (Blue Theme)
// Tabs: Home, Offers (only if subscribed), Troop Dashboard, Scouts, Profile
// ============================================================================

function TroopLeaderTabNavigator() {
  const { user } = useAuthStore();
  const hasActiveSubscription = user?.subscriptionStatus === 'active';

  // Debug log in development
  if (__DEV__) {
    console.log('TroopLeader subscription check:', {
      subscriptionStatus: user?.subscriptionStatus,
      hasActiveSubscription,
    });
  }

  return (
    <TroopLeaderTab.Navigator
      id="TroopLeaderTabs"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            Home: focused ? 'home' : 'home-outline',
            Offers: focused ? 'pricetag' : 'pricetag-outline',
            Dashboard: focused ? 'stats-chart' : 'stats-chart-outline',
            Scouts: focused ? 'people' : 'people-outline',
            Profile: focused ? 'person' : 'person-outline',
          };
          return <Ionicons name={icons[route.name] || 'ellipse'} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#003F87', // BSA Blue
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <TroopLeaderTab.Screen name="Home" component={HomeScreen} />
      {hasActiveSubscription && (
        <TroopLeaderTab.Screen name="Offers" component={OffersNavigator} />
      )}
      <TroopLeaderTab.Screen name="Dashboard" component={TroopLeaderDashboardScreen} options={{ tabBarLabel: 'Troop' }} />
      <TroopLeaderTab.Screen name="Scouts" component={ManageScoutsScreen} options={{ tabBarLabel: 'Scouts' }} />
      <TroopLeaderTab.Screen name="Profile" component={ProfileScreen} />
    </TroopLeaderTab.Navigator>
  );
}

function TroopLeaderMainNavigator() {
  return (
    <TroopLeaderStack.Navigator id="TroopLeaderMain" screenOptions={{ headerShown: false }}>
      <TroopLeaderStack.Screen name="TroopLeaderTabs" component={TroopLeaderTabNavigator} />
      <TroopLeaderStack.Group screenOptions={{ presentation: 'modal' }}>
        <TroopLeaderStack.Screen name="Merchants" component={MerchantsScreen} options={{ headerShown: true, title: 'All Merchants' }} />
        <TroopLeaderStack.Screen name="MerchantDetail" component={MerchantDetailScreen} options={{ headerShown: true, title: 'Merchant Details' }} />
        <TroopLeaderStack.Screen name="OfferDetail" component={OfferDetailScreen} options={{ headerShown: false }} />
        <TroopLeaderStack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: true, title: 'Notifications' }} />
        <TroopLeaderStack.Screen name="ManageScouts" component={ManageScoutsScreen} options={{ headerShown: true, title: 'Manage Scouts' }} />
        <TroopLeaderStack.Screen name="TroopStats" component={TroopStatsScreen} options={{ headerShown: true, title: 'Troop Statistics' }} />
        <TroopLeaderStack.Screen name="InviteScouts" component={InviteScoutsScreen} options={{ headerShown: true, title: 'Invite Scouts' }} />
        <TroopLeaderStack.Screen name="Subscription" component={SubscriptionScreen} options={{ headerShown: true, title: 'Subscription' }} />
        <TroopLeaderStack.Screen name="SelectScoutForSubscription" component={SelectScoutForSubscriptionScreen} options={{ headerShown: false, title: 'Select Scout' }} />
        <TroopLeaderStack.Screen name="RedemptionHistory" component={RedemptionHistoryScreen} options={{ headerShown: false }} />
        <TroopLeaderStack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
        <TroopLeaderStack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: false }} />
        <TroopLeaderStack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ headerShown: false }} />
        <TroopLeaderStack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ headerShown: false }} />
        <TroopLeaderStack.Screen name="TermsOfService" component={TermsOfServiceScreen} options={{ headerShown: false }} />
        <TroopLeaderStack.Screen name="HelpSupport" component={HelpSupportScreen} options={{ headerShown: false }} />
      </TroopLeaderStack.Group>
      <TroopLeaderStack.Group screenOptions={{ presentation: 'fullScreenModal' }}>
        <TroopLeaderStack.Screen name="QRScanner" component={QRScannerScreen} options={{ headerShown: true, title: 'My QR Code' }} />
        <TroopLeaderStack.Screen name="ShareOffer" component={ShareOfferScreen} options={{ headerShown: true, title: 'Share Offer' }} />
        <TroopLeaderStack.Screen name="RedemptionSuccess" component={RedemptionSuccessScreen} options={{ headerShown: false }} />
      </TroopLeaderStack.Group>
    </TroopLeaderStack.Navigator>
  );
}

// ============================================================================
// CUSTOMER/PARENT NAVIGATION (Gold Theme)
// Tabs: Home, Offers, Merchants, Profile
// Simpler navigation - no scout management features
// ============================================================================

function CustomerTabNavigator() {
  return (
    <CustomerTab.Navigator
      id="CustomerTabs"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            Home: focused ? 'home' : 'home-outline',
            Wallet: focused ? 'wallet' : 'wallet-outline',
            Offers: focused ? 'pricetag' : 'pricetag-outline',
            Merchants: focused ? 'storefront' : 'storefront-outline',
            Profile: focused ? 'person' : 'person-outline',
          };
          return <Ionicons name={icons[route.name] || 'ellipse'} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FFD700', // Gold
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <CustomerTab.Screen name="Home" component={HomeScreen} />
      <CustomerTab.Screen name="Wallet" component={WalletScreen} options={{ tabBarLabel: 'My Card' }} />
      <CustomerTab.Screen name="Offers" component={OffersNavigator} />
      <CustomerTab.Screen name="Merchants" component={MerchantsScreen} options={{ tabBarLabel: 'Merchants' }} />
      <CustomerTab.Screen name="Profile" component={ProfileScreen} />
    </CustomerTab.Navigator>
  );
}

function CustomerMainNavigator() {
  return (
    <CustomerStack.Navigator id="CustomerMain" screenOptions={{ headerShown: false }}>
      <CustomerStack.Screen name="CustomerTabs" component={CustomerTabNavigator} />
      <CustomerStack.Group screenOptions={{ presentation: 'modal' }}>
        <CustomerStack.Screen name="MerchantDetail" component={MerchantDetailScreen} options={{ headerShown: true, title: 'Merchant Details' }} />
        <CustomerStack.Screen name="OfferDetail" component={OfferDetailScreen} options={{ headerShown: false }} />
        <CustomerStack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: true, title: 'Notifications' }} />
        <CustomerStack.Screen name="Subscription" component={SubscriptionScreen} options={{ headerShown: true, title: 'Subscription' }} />
        <CustomerStack.Screen name="Referral" component={ReferralScreen} options={{ headerShown: false }} />
        <CustomerStack.Screen name="RedemptionHistory" component={RedemptionHistoryScreen} options={{ headerShown: false }} />
        <CustomerStack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
        <CustomerStack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: false }} />
        <CustomerStack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ headerShown: false }} />
        <CustomerStack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ headerShown: false }} />
        <CustomerStack.Screen name="TermsOfService" component={TermsOfServiceScreen} options={{ headerShown: false }} />
        <CustomerStack.Screen name="HelpSupport" component={HelpSupportScreen} options={{ headerShown: false }} />
      </CustomerStack.Group>
      <CustomerStack.Group screenOptions={{ presentation: 'fullScreenModal' }}>
        <CustomerStack.Screen name="QRScanner" component={QRScannerScreen} options={{ headerShown: true, title: 'My QR Code' }} />
        <CustomerStack.Screen name="ShareOffer" component={ShareOfferScreen} options={{ headerShown: true, title: 'Share Offer' }} />
        <CustomerStack.Screen name="RedemptionSuccess" component={RedemptionSuccessScreen} options={{ headerShown: false }} />
      </CustomerStack.Group>
    </CustomerStack.Navigator>
  );
}

// ============================================================================
// ROOT NAVIGATOR - RBAC Entry Point
// ============================================================================

export default function RootNavigator() {
  const { isAuthenticated, user } = useAuthStore();
  const userRole = user?.role;

  // Not authenticated - show login/signup
  if (!isAuthenticated) {
    return <AuthNavigator />;
  }

  // Role-based navigation
  switch (userRole) {
    case 'TROOP_LEADER':
      // Blue theme - Troop management features
      return <TroopLeaderMainNavigator />;

    case 'SCOUT':
      // Red theme - Scout features (cards, subscriptions, referrals)
      return <ScoutMainNavigator />;

    case 'PARENT':
      // Gold theme - Customer/Parent features (browse offers, merchants)
      return <CustomerMainNavigator />;

    default:
      // Default to customer view for unknown roles
      return <CustomerMainNavigator />;
  }
}
