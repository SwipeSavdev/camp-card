// Profile Screen with Settings and Navigation

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootNavigation } from '../../types/navigation';
import { useAuthStore } from '../../store/authStore';
import { COLORS } from '../../config/constants';
import { useTheme } from '../../config/ThemeContext';
import { useIAP } from '../../hooks/useIAP';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const navigation = useNavigation<RootNavigation>();
  const { theme } = useTheme();
  const { colors } = theme;

  // IAP hook for restore purchases
  const { restorePurchases } = useIAP({
    autoInit: true,
    userId: user?.id,
    onPurchaseComplete: () => {
      Alert.alert('Restored', 'Your purchases have been restored successfully.');
    },
    onPurchaseError: (error) => {
      Alert.alert('Restore Failed', error);
    },
  });

  const handleRestorePurchases = async () => {
    setIsRestoring(true);
    try {
      await restorePurchases();
    } catch (error: any) {
      Alert.alert('Restore Failed', error.message || 'Could not restore purchases. Please try again.');
    } finally {
      setIsRestoring(false);
    }
  };

  // Filter menu items based on user role (Unit Leaders don't have referrals)
  const allMenuItems = [
    {
      icon: 'wallet-outline',
      title: 'My Cards',
      subtitle: 'View and manage your Camp Cards',
      onPress: () => navigation.navigate('CardInventory'),
      showFor: ['SCOUT', 'PARENT', 'UNIT_LEADER'],
    },
    {
      icon: 'card-outline',
      title: 'Subscription',
      subtitle: 'Manage your subscription',
      onPress: () => navigation.navigate('Subscription'),
      showFor: ['SCOUT', 'PARENT', 'UNIT_LEADER'],
    },
    {
      icon: 'people-outline',
      title: 'Referrals',
      subtitle: 'Share and earn rewards',
      onPress: () => navigation.navigate('Referral'),
      showFor: ['SCOUT'], // Only for Scouts
    },
    {
      icon: 'notifications-outline',
      title: 'Notifications',
      subtitle: 'Manage notifications',
      onPress: () => navigation.navigate('Notifications'),
      showFor: ['SCOUT', 'PARENT', 'UNIT_LEADER'],
    },
  ];

  const menuItems = allMenuItems.filter(item =>
    item.showFor.includes(user?.role || 'SCOUT')
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.content}>
        {/* User Info Header */}
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <View style={[styles.avatarContainer, { backgroundColor: colors.primary }]}>
            <Ionicons name="person" size={48} color={colors.surface} />
          </View>
          <Text style={[styles.name, { color: colors.text }]}>{user?.firstName} {user?.lastName}</Text>
          <Text style={[styles.email, { color: colors.textSecondary }]}>{user?.email}</Text>
        </View>

        {/* Menu Items */}
        <View style={[styles.menuSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuItem, { borderBottomColor: colors.border }]}
              onPress={item.onPress}
              accessibilityLabel={item.title}
              accessibilityRole="button"
            >
              <View style={[styles.menuIconContainer, { backgroundColor: colors.background }]}>
                <Ionicons name={item.icon as any} size={24} color={colors.primary} />
              </View>
              <View style={styles.menuContent}>
                <Text style={[styles.menuTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Account Section */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Account</Text>

          <TouchableOpacity
              style={[styles.menuItem, { borderBottomColor: colors.border }]}
              onPress={handleRestorePurchases}
              disabled={isRestoring}
              accessibilityLabel="Restore Purchases"
              accessibilityRole="button"
            >
              <View style={[styles.menuIconContainer, { backgroundColor: colors.background }]}>
                <Ionicons name="refresh-outline" size={24} color={colors.primary} />
              </View>
              <View style={styles.menuContent}>
                <Text style={[styles.menuTitle, { color: colors.text }]}>Restore Purchases</Text>
                <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>Restore previous in-app purchases</Text>
              </View>
              {isRestoring ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              )}
            </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            onPress={() => navigation.navigate('Settings')}
            accessibilityLabel="Settings"
            accessibilityRole="button"
          >
            <View style={[styles.menuIconContainer, { backgroundColor: colors.background }]}>
              <Ionicons name="settings-outline" size={24} color={colors.textSecondary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuTitle, { color: colors.text }]}>Settings</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            onPress={() => navigation.navigate('HelpSupport')}
            accessibilityLabel="Help and Support"
            accessibilityRole="button"
          >
            <View style={[styles.menuIconContainer, { backgroundColor: colors.background }]}>
              <Ionicons name="help-circle-outline" size={24} color={colors.textSecondary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuTitle, { color: colors.text }]}>Help & Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { borderColor: colors.error, backgroundColor: colors.surface }, isLoggingOut && styles.logoutButtonDisabled]}
          onPress={async () => {
            if (isLoggingOut) return;

            Alert.alert(
              'Logout',
              'Are you sure you want to logout?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Logout',
                  style: 'destructive',
                  onPress: () => {
                    setIsLoggingOut(true);
                    logout().catch((error) => {
                      console.error('Logout failed:', error);
                      setIsLoggingOut(false);
                    });
                  },
                },
              ]
            );
          }}
          disabled={isLoggingOut}
          accessibilityLabel={isLoggingOut ? 'Logging out' : 'Logout'}
          accessibilityRole="button"
        >
          {isLoggingOut ? (
            <ActivityIndicator size="small" color={colors.error} />
          ) : (
            <Ionicons name="log-out-outline" size={20} color={colors.error} />
          )}
          <Text style={[styles.logoutText, { color: colors.error }]}>{isLoggingOut ? 'Logging out...' : 'Logout'}</Text>
        </TouchableOpacity>

        <Text style={[styles.version, { color: colors.textSecondary }]}>Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  menuSection: {
    backgroundColor: COLORS.surface,
    marginTop: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  section: {
    marginTop: 16,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 24,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.error,
    backgroundColor: COLORS.surface,
  },
  logoutText: {
    color: COLORS.error,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  logoutButtonDisabled: {
    opacity: 0.6,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 32,
  },
});
