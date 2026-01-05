import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useAuthStore } from '../store/authStore';
import { colors } from '../uiux/theme';

// Reuse existing auth screens (keeps your API wiring intact)
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import ForgotPassword from '../uiux/screens/ForgotPassword';

// UI/UX kit screens (role-based) - Customer
import CustomerHome from '../uiux/screens/customer/Home';
import CustomerDashboard from '../uiux/screens/customer/Dashboard';
import CustomerWallet from '../uiux/screens/customer/Wallet';
import CustomerOffers from '../uiux/screens/customer/Offers';
import CustomerSettings from '../uiux/screens/customer/Settings';

// UI/UX kit screens (role-based) - Leader
import LeaderHome from '../uiux/screens/leader/Home';
import LeaderScouts from '../uiux/screens/leader/Scouts';
import LeaderShare from '../uiux/screens/leader/Share';
import LeaderSettings from '../uiux/screens/leader/Settings';

// UI/UX kit screens (role-based) - Scout
import ScoutHome from '../uiux/screens/scout/Home';
import ScoutShare from '../uiux/screens/scout/Share';
import ScoutSettings from '../uiux/screens/scout/Settings';

// Redemption screen
import RedemptionCodeScreen from '../screens/customer/RedemptionCodeScreen';

// Referral screen
import ReferralHistoryScreen from '../screens/customer/ReferralHistoryScreen';

type AuthStackParamList = {
 Login: undefined;
 Signup: undefined;
 ForgotPassword: undefined;
};

type AppStackParamList = {
 Main: undefined;
 RedemptionCode: {
 redemption: any;
 };
 ReferralHistory: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();
const Tabs = createBottomTabNavigator();

function AuthNavigator() {
 return (
 <AuthStack.Navigator id="AuthStack" screenOptions={{ headerShown: false }}>
 <AuthStack.Screen name="Login" component={LoginScreen} />
 <AuthStack.Screen name="Signup" component={SignupScreen} />
 <AuthStack.Screen name="ForgotPassword" component={ForgotPassword} />
 </AuthStack.Navigator>
 );
}

function CustomerTabs() {
 return (
 <Tabs.Navigator
 id="CustomerTabs"
 screenOptions={({ route }) => ({
 headerShown: false,
 tabBarActiveTintColor: colors.red500,
 tabBarInactiveTintColor: colors.muted,
 tabBarIcon: ({ color, size }) => {
 const map: Record<string, keyof typeof Ionicons.glyphMap> = {
 Home: 'home-outline',
 Dashboard: 'speedometer-outline',
 Wallet: 'wallet-outline',
 Offers: 'pricetags-outline',
 Settings: 'settings-outline',
 };
 const iconName = map[route.name] ?? 'ellipse-outline';
 return <Ionicons name={iconName} size={size} color={color} />;
 },
 })}
 >
 <Tabs.Screen name="Home" component={CustomerHome} />
 <Tabs.Screen name="Dashboard" component={CustomerDashboard} />
 <Tabs.Screen name="Wallet" component={CustomerWallet} />
 <Tabs.Screen name="Offers" component={CustomerOffers} />
 <Tabs.Screen name="Settings" component={CustomerSettings} />
 </Tabs.Navigator>
 );
}

function LeaderTabs() {
 return (
 <Tabs.Navigator
 id="LeaderTabs"
 screenOptions={({ route }) => ({
 headerShown: false,
 tabBarActiveTintColor: colors.red500,
 tabBarInactiveTintColor: colors.muted,
 tabBarIcon: ({ color, size }) => {
 const map: Record<string, keyof typeof Ionicons.glyphMap> = {
 Dashboard: 'speedometer-outline',
 Scouts: 'people-outline',
 Share: 'share-social-outline',
 Settings: 'settings-outline',
 };
 const iconName = map[route.name] ?? 'ellipse-outline';
 return <Ionicons name={iconName} size={size} color={color} />;
 },
 })}
 >
 <Tabs.Screen name="Dashboard" component={LeaderHome} />
 <Tabs.Screen name="Scouts" component={LeaderScouts} />
 <Tabs.Screen name="Share" component={LeaderShare} />
 <Tabs.Screen name="Settings" component={LeaderSettings} />
 </Tabs.Navigator>
 );
}

function ScoutTabs() {
 return (
 <Tabs.Navigator
 id="ScoutTabs"
 screenOptions={({ route }) => ({
 headerShown: false,
 tabBarActiveTintColor: colors.red500,
 tabBarInactiveTintColor: colors.muted,
 tabBarIcon: ({ color, size }) => {
 const map: Record<string, keyof typeof Ionicons.glyphMap> = {
 Dashboard: 'speedometer-outline',
 Share: 'share-social-outline',
 Settings: 'settings-outline',
 };
 const iconName = map[route.name] ?? 'ellipse-outline';
 return <Ionicons name={iconName} size={size} color={color} />;
 },
 })}
 >
 <Tabs.Screen name="Dashboard" component={ScoutHome} />
 <Tabs.Screen name="Share" component={ScoutShare} />
 <Tabs.Screen name="Settings" component={ScoutSettings} />
 </Tabs.Navigator>
 );
}

function RoleTabs() {
 const user = useAuthStore((s) => s.user);

 if (!user) return <CustomerTabs />;

 if (user.role === 'leader') return <LeaderTabs />;
 if (user.role === 'scout') return <ScoutTabs />;

 // Default: customer/parent experience
 return <CustomerTabs />;
}

function AppNavigator() {
 return (
 <AppStack.Navigator id="RootStack" screenOptions={{ headerShown: false }}>
 <AppStack.Screen name="Main" component={RoleTabs} />
 <AppStack.Screen
 name="RedemptionCode"
 component={RedemptionCodeScreen}
 options={{
 gestureEnabled: true,
 headerShown: false,
 }}
 />
 <AppStack.Screen
 name="ReferralHistory"
 component={ReferralHistoryScreen}
 options={{
 gestureEnabled: true,
 headerShown: false,
 }}
 />
 </AppStack.Navigator>
 );
}

export default function RootNavigator() {
 const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
 return isAuthenticated ? <AppNavigator /> : <AuthNavigator />;
}
