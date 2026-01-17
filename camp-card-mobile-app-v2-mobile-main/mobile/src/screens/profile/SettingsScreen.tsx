// Settings Screen - App preferences and account settings

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../../config/constants';
import { useAuthStore } from '../../store/authStore';
import {
  checkBiometricAvailability,
  getBiometricTypeName,
  isBiometricEnabled,
  enableBiometricAuth,
  disableBiometricAuth,
} from '../../services/biometricsService';

// AsyncStorage keys for settings
const SETTINGS_KEYS = {
  PUSH_NOTIFICATIONS: '@settings_push_notifications',
  EMAIL_NOTIFICATIONS: '@settings_email_notifications',
  OFFER_ALERTS: '@settings_offer_alerts',
  LOCATION_SERVICES: '@settings_location_services',
};

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
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<string>('Biometric Login');
  const [loadingBiometric, setLoadingBiometric] = useState(false);

  // Load settings from storage and check biometrics on mount
  useEffect(() => {
    loadSettings();
    checkBiometrics();
  }, []);

  const loadSettings = async () => {
    try {
      const [pushValue, emailValue, offerValue, locationValue] = await Promise.all([
        AsyncStorage.getItem(SETTINGS_KEYS.PUSH_NOTIFICATIONS),
        AsyncStorage.getItem(SETTINGS_KEYS.EMAIL_NOTIFICATIONS),
        AsyncStorage.getItem(SETTINGS_KEYS.OFFER_ALERTS),
        AsyncStorage.getItem(SETTINGS_KEYS.LOCATION_SERVICES),
      ]);

      // Default to true if not set
      if (pushValue !== null) setPushNotifications(pushValue === 'true');
      if (emailValue !== null) setEmailNotifications(emailValue === 'true');
      if (offerValue !== null) setOfferAlerts(offerValue === 'true');
      if (locationValue !== null) setLocationServices(locationValue === 'true');
    } catch (error) {
      console.log('Failed to load settings:', error);
    }
  };

  const saveSetting = async (key: string, value: boolean) => {
    try {
      await AsyncStorage.setItem(key, value.toString());
    } catch (error) {
      console.log('Failed to save setting:', error);
    }
  };

  const handlePushNotificationsToggle = (value: boolean) => {
    setPushNotifications(value);
    saveSetting(SETTINGS_KEYS.PUSH_NOTIFICATIONS, value);
  };

  const handleEmailNotificationsToggle = (value: boolean) => {
    setEmailNotifications(value);
    saveSetting(SETTINGS_KEYS.EMAIL_NOTIFICATIONS, value);
  };

  const handleOfferAlertsToggle = (value: boolean) => {
    setOfferAlerts(value);
    saveSetting(SETTINGS_KEYS.OFFER_ALERTS, value);
  };

  const handleLocationServicesToggle = (value: boolean) => {
    setLocationServices(value);
    saveSetting(SETTINGS_KEYS.LOCATION_SERVICES, value);
  };

  const checkBiometrics = async () => {
    const capability = await checkBiometricAvailability();
    setBiometricAvailable(capability.available);
    if (capability.biometryType) {
      setBiometricType(getBiometricTypeName(capability.biometryType));
    }

    // Check if biometric is already enabled
    const enabled = await isBiometricEnabled();
    setBiometricLogin(enabled);
  };

  const handleBiometricToggle = async (value: boolean) => {
    if (loadingBiometric) return;

    setLoadingBiometric(true);

    if (value) {
      // Enable biometric auth
      if (!user?.email) {
        Alert.alert('Error', 'User email not found');
        setLoadingBiometric(false);
        return;
      }

      // Get access token from secure storage or auth store
      const accessToken = (user as any).accessToken || '';

      const result = await enableBiometricAuth(user.email, accessToken);

      if (result.success) {
        setBiometricLogin(true);
        Alert.alert(
          'Success',
          `${biometricType} has been enabled. You can now use it to sign in quickly.`
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to enable biometric authentication');
      }
    } else {
      // Disable biometric auth
      Alert.alert(
        `Disable ${biometricType}?`,
        `Are you sure you want to disable ${biometricType}? You'll need to enter your password to sign in.`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setLoadingBiometric(false),
          },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: async () => {
              const result = await disableBiometricAuth();
              if (result.success) {
                setBiometricLogin(false);
                Alert.alert('Success', `${biometricType} has been disabled.`);
              } else {
                Alert.alert('Error', result.error || 'Failed to disable biometric authentication');
              }
              setLoadingBiometric(false);
            },
          },
        ]
      );
      return; // Don't set loading false here, it's handled in alert callbacks
    }

    setLoadingBiometric(false);
  };

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
      onToggle: handlePushNotificationsToggle,
    },
    {
      icon: 'mail',
      title: 'Email Notifications',
      subtitle: 'Receive updates via email',
      type: 'toggle',
      value: emailNotifications,
      onToggle: handleEmailNotificationsToggle,
    },
    {
      icon: 'pricetag',
      title: 'Offer Alerts',
      subtitle: 'Get notified about new offers nearby',
      type: 'toggle',
      value: offerAlerts,
      onToggle: handleOfferAlertsToggle,
    },
  ];

  const privacySettings: SettingItem[] = [
    {
      icon: 'location',
      title: 'Location Services',
      subtitle: 'Allow app to access your location',
      type: 'toggle',
      value: locationServices,
      onToggle: handleLocationServicesToggle,
    },
    {
      icon: 'finger-print' as any,
      title: biometricType,
      subtitle: biometricAvailable
        ? `Use ${biometricType} for quick login`
        : 'Not available on this device',
      type: 'toggle' as const,
      value: biometricLogin,
      onToggle: biometricAvailable ? handleBiometricToggle : undefined,
    },
  ];

  const accountSettings: SettingItem[] = [
    {
      icon: 'person',
      title: 'Edit Profile',
      subtitle: 'Update your personal information',
      type: 'link',
      onPress: () => (navigation as any).navigate('EditProfile'),
    },
    {
      icon: 'lock-closed',
      title: 'Change Password',
      subtitle: 'Update your account password',
      type: 'link',
      onPress: () => (navigation as any).navigate('ChangePassword'),
    },
    {
      icon: 'shield-checkmark',
      title: 'Privacy Policy',
      type: 'link',
      onPress: () => (navigation as any).navigate('PrivacyPolicy'),
    },
    {
      icon: 'document-text',
      title: 'Terms of Service',
      type: 'link',
      onPress: () => (navigation as any).navigate('TermsOfService'),
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
        <>
          {loadingBiometric && item.title === biometricType ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Switch
              value={item.value}
              onValueChange={item.onToggle}
              trackColor={{ false: '#E0E0E0', true: COLORS.primary + '60' }}
              thumbColor={item.value ? COLORS.primary : '#F4F4F4'}
              disabled={(loadingBiometric && item.title === biometricType) || !item.onToggle}
            />
          )}
        </>
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
