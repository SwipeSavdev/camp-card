import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  useWindowDimensions,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useAuthStore } from '../../store/authStore';
import { consentApi } from '../../services/apiClient';
import { COLORS } from '../../config/constants';

const CAMP_CARD_LOGO = require('../../../assets/campcard_lockup_left.png');

/**
 * ConsentPendingScreen
 *
 * Shown to minors who have logged in but parental consent is still pending.
 * Allows them to:
 * - See their consent status
 * - Resend the consent request email to their parent
 * - Update the parent email if needed
 */
export default function ConsentPendingScreen() {
  const { user, logout } = useAuthStore();
  const { width } = useWindowDimensions();
  const logoSize = Math.min(180, Math.round(width * 0.5));

  const [isResending, setIsResending] = useState(false);
  const [showUpdateEmail, setShowUpdateEmail] = useState(false);
  const [newParentEmail, setNewParentEmail] = useState('');
  const [newParentName, setNewParentName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const consentStatus = user?.consentStatus || 'PENDING';

  // Resend consent request email
  const handleResendEmail = useCallback(async () => {
    setIsResending(true);
    try {
      await consentApi.resendConsentRequest();
      Alert.alert(
        'Email Sent!',
        "We've sent a new consent request email to your parent. Ask them to check their inbox!",
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to send email. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setIsResending(false);
    }
  }, []);

  // Update parent email and resend
  const handleUpdateParent = useCallback(async () => {
    if (!newParentEmail.trim() || !newParentName.trim()) {
      Alert.alert('Missing Information', 'Please enter both parent name and email.');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newParentEmail.trim())) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setIsUpdating(true);
    try {
      await consentApi.updateParentAndResend(newParentEmail.trim(), newParentName.trim());
      Alert.alert(
        'Success!',
        `We've sent a consent request to ${newParentEmail}. Ask them to check their inbox!`,
        [{ text: 'OK', onPress: () => setShowUpdateEmail(false) }]
      );
      setNewParentEmail('');
      setNewParentName('');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update parent info. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setIsUpdating(false);
    }
  }, [newParentEmail, newParentName]);

  // Render denied/revoked state
  if (consentStatus === 'DENIED' || consentStatus === 'REVOKED') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.centerContainer}>
            <Image source={CAMP_CARD_LOGO} style={[styles.logoImage, { width: logoSize, height: logoSize * 0.4 }]} />

            <View style={styles.deniedIconContainer}>
              <Ionicons name="close-circle" size={80} color={COLORS.error} />
            </View>

            <Text style={styles.title}>Access Restricted</Text>

            <Text style={styles.message}>
              Your parent or guardian has not approved your Camp Card account.
            </Text>

            <View style={styles.infoCard}>
              <Ionicons name="information-circle" size={24} color={COLORS.primary} style={styles.infoIcon} />
              <Text style={styles.infoText}>
                If you think this is a mistake, please talk to your parent or guardian. They can change their decision at any time.
              </Text>
            </View>

            <TouchableOpacity style={styles.secondaryButton} onPress={logout}>
              <Text style={styles.secondaryButtonText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Render pending state
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.centerContainer}>
            <Image source={CAMP_CARD_LOGO} style={[styles.logoImage, { width: logoSize, height: logoSize * 0.4 }]} />

            <View style={styles.pendingIconContainer}>
              <Ionicons name="time" size={80} color={COLORS.warning} />
            </View>

            <Text style={styles.title}>Waiting for Parent Approval</Text>

            <Text style={styles.message}>
              We've sent an email to your parent or guardian asking them to approve your Camp Card account.
            </Text>

            <View style={styles.stepsCard}>
              <Text style={styles.stepsTitle}>What happens next?</Text>
              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <Text style={styles.stepText}>Your parent receives our email</Text>
              </View>
              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <Text style={styles.stepText}>They click to review and approve</Text>
              </View>
              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <Text style={styles.stepText}>You get full access to Camp Card!</Text>
              </View>
            </View>

            {!showUpdateEmail ? (
              <>
                <TouchableOpacity
                  style={[styles.primaryButton, isResending && styles.buttonDisabled]}
                  onPress={handleResendEmail}
                  disabled={isResending}
                >
                  {isResending ? (
                    <ActivityIndicator color={COLORS.surface} />
                  ) : (
                    <>
                      <Ionicons name="mail" size={20} color={COLORS.surface} style={styles.buttonIcon} />
                      <Text style={styles.primaryButtonText}>Resend Email to Parent</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.linkButton}
                  onPress={() => setShowUpdateEmail(true)}
                >
                  <Text style={styles.linkButtonText}>Wrong parent email? Update it here</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.updateEmailCard}>
                <Text style={styles.updateEmailTitle}>Update Parent Information</Text>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Parent's Full Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., John Smith"
                    value={newParentName}
                    onChangeText={setNewParentName}
                    autoCapitalize="words"
                    placeholderTextColor={COLORS.textSecondary}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Parent's Email</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., parent@email.com"
                    value={newParentEmail}
                    onChangeText={setNewParentEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholderTextColor={COLORS.textSecondary}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.primaryButton, isUpdating && styles.buttonDisabled]}
                  onPress={handleUpdateParent}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <ActivityIndicator color={COLORS.surface} />
                  ) : (
                    <Text style={styles.primaryButtonText}>Send to New Email</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.linkButton}
                  onPress={() => {
                    setShowUpdateEmail(false);
                    setNewParentEmail('');
                    setNewParentName('');
                  }}
                >
                  <Text style={styles.linkButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity style={styles.secondaryButton} onPress={logout}>
              <Text style={styles.secondaryButtonText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logoImage: {
    resizeMode: 'contain',
    marginBottom: 24,
  },
  pendingIconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: `${COLORS.warning}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  deniedIconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: `${COLORS.error}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  stepsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stepsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepText: {
    fontSize: 15,
    color: COLORS.text,
    flex: 1,
  },
  infoCard: {
    backgroundColor: `${COLORS.primary}10`,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    width: '100%',
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonIcon: {
    marginRight: 8,
  },
  primaryButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    marginTop: 8,
  },
  secondaryButtonText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  linkButton: {
    paddingVertical: 8,
  },
  linkButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    textAlign: 'center',
  },
  updateEmailCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  updateEmailTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});
