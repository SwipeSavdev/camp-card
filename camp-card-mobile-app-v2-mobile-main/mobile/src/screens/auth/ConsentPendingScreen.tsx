import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
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
import { useTheme } from '../../config/ThemeContext';

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
  const { theme } = useTheme();

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
      const message = error.response?.data?.error || error.response?.data?.message || 'Failed to send email. Please try again.';
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
      const message = error.response?.data?.error || error.response?.data?.message || 'Failed to update parent info. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setIsUpdating(false);
    }
  }, [newParentEmail, newParentName]);

  // Render denied/revoked state
  if (consentStatus === 'DENIED' || consentStatus === 'REVOKED') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.centerContainer}>
            <View style={[styles.deniedIconContainer, { backgroundColor: `${theme.colors.error}15` }]}>
              <Ionicons name="close-circle" size={80} color={theme.colors.error} />
            </View>

            <Text style={[styles.title, { color: theme.colors.text }]}>Access Restricted</Text>

            <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
              Your parent or guardian has not approved your Camp Card account.
            </Text>

            <View style={[styles.infoCard, { backgroundColor: `${theme.colors.primary}10` }]}>
              <Ionicons name="information-circle" size={24} color={theme.colors.primary} style={styles.infoIcon} />
              <Text style={[styles.infoText, { color: theme.colors.text }]}>
                If you think this is a mistake, please talk to your parent or guardian. They can change their decision at any time.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={logout}
              accessibilityLabel="Sign out"
              accessibilityRole="button"
            >
              <Text style={[styles.secondaryButtonText, { color: theme.colors.textSecondary }]}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Render pending state
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.centerContainer}>
            <View style={[styles.pendingIconContainer, { backgroundColor: `${theme.colors.warning}15` }]}>
              <Ionicons name="time" size={80} color={theme.colors.warning} />
            </View>

            <Text style={[styles.title, { color: theme.colors.text }]}>Waiting for Parent Approval</Text>

            <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
              We've sent an email to your parent or guardian asking them to approve your Camp Card account.
            </Text>

            <View style={[styles.stepsCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Text style={[styles.stepsTitle, { color: theme.colors.text }]}>What happens next?</Text>
              <View style={styles.step}>
                <View style={[styles.stepNumber, { backgroundColor: theme.colors.primary }]}>
                  <Text style={[styles.stepNumberText, { color: theme.colors.surface }]}>1</Text>
                </View>
                <Text style={[styles.stepText, { color: theme.colors.text }]}>Your parent receives our email</Text>
              </View>
              <View style={styles.step}>
                <View style={[styles.stepNumber, { backgroundColor: theme.colors.primary }]}>
                  <Text style={[styles.stepNumberText, { color: theme.colors.surface }]}>2</Text>
                </View>
                <Text style={[styles.stepText, { color: theme.colors.text }]}>They click to review and approve</Text>
              </View>
              <View style={styles.step}>
                <View style={[styles.stepNumber, { backgroundColor: theme.colors.primary }]}>
                  <Text style={[styles.stepNumberText, { color: theme.colors.surface }]}>3</Text>
                </View>
                <Text style={[styles.stepText, { color: theme.colors.text }]}>You get full access to Camp Card!</Text>
              </View>
            </View>

            {!showUpdateEmail ? (
              <>
                <TouchableOpacity
                  style={[styles.primaryButton, { backgroundColor: theme.colors.primary }, isResending && styles.buttonDisabled]}
                  onPress={handleResendEmail}
                  disabled={isResending}
                  accessibilityLabel={isResending ? 'Resending email' : 'Resend email to parent'}
                  accessibilityRole="button"
                >
                  {isResending ? (
                    <ActivityIndicator color={theme.colors.surface} />
                  ) : (
                    <>
                      <Ionicons name="mail" size={20} color={theme.colors.surface} style={styles.buttonIcon} />
                      <Text style={[styles.primaryButtonText, { color: theme.colors.surface }]}>Resend Email to Parent</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.linkButton}
                  onPress={() => setShowUpdateEmail(true)}
                  accessibilityLabel="Update parent email"
                  accessibilityRole="button"
                >
                  <Text style={[styles.linkButtonText, { color: theme.colors.primary }]}>Wrong parent email? Update it here</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={[styles.updateEmailCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <Text style={[styles.updateEmailTitle, { color: theme.colors.text }]}>Update Parent Information</Text>

                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Parent's Full Name</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
                    placeholder="e.g., John Smith"
                    value={newParentName}
                    onChangeText={setNewParentName}
                    autoCapitalize="words"
                    placeholderTextColor={theme.colors.textSecondary}
                    accessibilityLabel="Parent's full name"
                    accessibilityRole="none"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Parent's Email</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
                    placeholder="e.g., parent@email.com"
                    value={newParentEmail}
                    onChangeText={setNewParentEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholderTextColor={theme.colors.textSecondary}
                    accessibilityLabel="Parent's email address"
                    accessibilityRole="none"
                  />
                </View>

                <TouchableOpacity
                  style={[styles.primaryButton, { backgroundColor: theme.colors.primary }, isUpdating && styles.buttonDisabled]}
                  onPress={handleUpdateParent}
                  disabled={isUpdating}
                  accessibilityLabel={isUpdating ? 'Sending to new email' : 'Send to new email'}
                  accessibilityRole="button"
                >
                  {isUpdating ? (
                    <ActivityIndicator color={theme.colors.surface} />
                  ) : (
                    <Text style={[styles.primaryButtonText, { color: theme.colors.surface }]}>Send to New Email</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.linkButton}
                  onPress={() => {
                    setShowUpdateEmail(false);
                    setNewParentEmail('');
                    setNewParentName('');
                  }}
                  accessibilityLabel="Cancel"
                  accessibilityRole="button"
                >
                  <Text style={[styles.linkButtonText, { color: theme.colors.primary }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={logout}
              accessibilityLabel="Sign out"
              accessibilityRole="button"
            >
              <Text style={[styles.secondaryButtonText, { color: theme.colors.textSecondary }]}>Sign Out</Text>
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
  pendingIconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  deniedIconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  stepsCard: {
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 24,
    borderWidth: 1,
  },
  stepsTitle: {
    fontSize: 16,
    fontWeight: '600',
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
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepText: {
    fontSize: 15,
    flex: 1,
  },
  infoCard: {
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
    flex: 1,
    lineHeight: 20,
  },
  primaryButton: {
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
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  linkButton: {
    paddingVertical: 8,
  },
  linkButtonText: {
    fontSize: 14,
    textAlign: 'center',
  },
  updateEmailCard: {
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 16,
    borderWidth: 1,
  },
  updateEmailTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
  },
});
