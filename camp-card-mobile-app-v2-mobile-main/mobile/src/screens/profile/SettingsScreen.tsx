// Settings Screen - App preferences and account settings

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../config/constants';
import { useAuthStore } from '../../store/authStore';

interface SettingItem {
  icon: string;
  title: string;
  subtitle?: string;
  type: 'toggle' | 'link' | 'action';
  value?: boolean;
  onToggle?: (value: boolean) => void;
  onPress?: () => void;
}

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { user } = useAuthStore();

  // Settings state
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [offerAlerts, setOfferAlerts] = useState(true);
  const [locationServices, setLocationServices] = useState(true);
  const [biometricLogin, setBiometricLogin] = useState(false);

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Account Deletion Requested',
              'Your account deletion request has been submitted. You will receive a confirmation email within 24 hours.'
            );
          },
        },
      ]
    );
  };

  const notificationSettings: SettingItem[] = [
    {
      icon: 'notifications',
      title: 'Push Notifications',
      subtitle: 'Receive push notifications on your device',
      type: 'toggle',
      value: pushNotifications,
      onToggle: setPushNotifications,
    },
    {
      icon: 'mail',
      title: 'Email Notifications',
      subtitle: 'Receive updates via email',
      type: 'toggle',
      value: emailNotifications,
      onToggle: setEmailNotifications,
    },
    {
      icon: 'pricetag',
      title: 'Offer Alerts',
      subtitle: 'Get notified about new offers nearby',
      type: 'toggle',
      value: offerAlerts,
      onToggle: setOfferAlerts,
    },
  ];

  const privacySettings: SettingItem[] = [
    {
      icon: 'location',
      title: 'Location Services',
      subtitle: 'Allow app to access your location',
      type: 'toggle',
      value: locationServices,
      onToggle: setLocationServices,
    },
    {
      icon: 'finger-print',
      title: 'Biometric Login',
      subtitle: 'Use Face ID or fingerprint to login',
      type: 'toggle',
      value: biometricLogin,
      onToggle: setBiometricLogin,
    },
  ];

  const accountSettings: SettingItem[] = [
    {
      icon: 'person',
      title: 'Edit Profile',
      subtitle: 'Update your personal information',
      type: 'link',
      onPress: () => Alert.alert('Coming Soon', 'Profile editing will be available soon.'),
    },
    {
      icon: 'lock-closed',
      title: 'Change Password',
      subtitle: 'Update your account password',
      type: 'link',
      onPress: () => Alert.alert('Coming Soon', 'Password change will be available soon.'),
    },
    {
      icon: 'shield-checkmark',
      title: 'Privacy Policy',
      type: 'link',
      onPress: () => Alert.alert('Privacy Policy', 'Our privacy policy can be found at https://campcard.org/privacy'),
    },
    {
      icon: 'document-text',
      title: 'Terms of Service',
      type: 'link',
      onPress: () => Alert.alert('Terms of Service', 'Our terms of service can be found at https://campcard.org/terms'),
    },
  ];

  const renderSettingItem = (item: SettingItem, index: number, isLast: boolean) => (
    <TouchableOpacity
      key={index}
      style={[styles.settingItem, isLast && styles.settingItemLast]}
      onPress={item.type === 'link' || item.type === 'action' ? item.onPress : undefined}
      activeOpacity={item.type === 'toggle' ? 1 : 0.7}
    >
      <View style={styles.settingIconContainer}>
        <Ionicons name={item.icon as any} size={22} color={COLORS.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{item.title}</Text>
        {item.subtitle && (
          <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
        )}
      </View>
      {item.type === 'toggle' && (
        <Switch
          value={item.value}
          onValueChange={item.onToggle}
          trackColor={{ false: '#E0E0E0', true: COLORS.primary + '60' }}
          thumbColor={item.value ? COLORS.primary : '#F4F4F4'}
        />
      )}
      {item.type === 'link' && (
        <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.sectionContent}>
            {notificationSettings.map((item, index) =>
              renderSettingItem(item, index, index === notificationSettings.length - 1)
            )}
          </View>
        </View>

        {/* Privacy & Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & Security</Text>
          <View style={styles.sectionContent}>
            {privacySettings.map((item, index) =>
              renderSettingItem(item, index, index === privacySettings.length - 1)
            )}
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.sectionContent}>
            {accountSettings.map((item, index) =>
              renderSettingItem(item, index, index === accountSettings.length - 1)
            )}
          </View>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.sectionContent}>
            <View style={[styles.settingItem, styles.settingItemLast]}>
              <View style={styles.settingIconContainer}>
                <Ionicons name="information-circle" size={22} color={COLORS.primary} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>App Version</Text>
                <Text style={styles.settingSubtitle}>1.0.0 (Build 1)</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: COLORS.error }]}>Danger Zone</Text>
          <View style={styles.sectionContent}>
            <TouchableOpacity
              style={[styles.settingItem, styles.settingItemLast, styles.dangerItem]}
              onPress={handleDeleteAccount}
            >
              <View style={[styles.settingIconContainer, styles.dangerIconContainer]}>
                <Ionicons name="trash" size={22} color={COLORS.error} />
              </View>
              <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, { color: COLORS.error }]}>
                  Delete Account
                </Text>
                <Text style={styles.settingSubtitle}>
                  Permanently delete your account and data
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionContent: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingItemLast: {
    borderBottomWidth: 0,
  },
  settingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  settingSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  dangerItem: {
    backgroundColor: COLORS.error + '08',
  },
  dangerIconContainer: {
    backgroundColor: COLORS.error + '15',
  },
  bottomSpacer: {
    height: 40,
  },
});
