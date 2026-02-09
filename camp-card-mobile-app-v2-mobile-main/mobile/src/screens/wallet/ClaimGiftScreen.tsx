// ClaimGiftScreen - Allows recipients to claim gifted Camp Cards
// Handles both authenticated users and new user registration

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../config/constants';
import { useTheme } from '../../config/ThemeContext';
import { cardsApi, authApi } from '../../services/apiClient';
import { useAuthStore } from '../../store/authStore';

type ClaimGiftRouteParams = {
  ClaimGift: { token: string };
};

interface GiftDetails {
  cardNumber: string;
  senderName: string;
  senderEmail: string;
  message?: string;
  expiresAt: string;
  status: string;
}

export default function ClaimGiftScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<ClaimGiftRouteParams, 'ClaimGift'>>();
  const { token } = route.params;
  const { isAuthenticated, user, login } = useAuthStore();
  const { theme } = useTheme();
  const { colors } = theme;

  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [giftDetails, setGiftDetails] = useState<GiftDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  // New user registration form
  const [showRegistration, setShowRegistration] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  useEffect(() => {
    fetchGiftDetails();
  }, [token]);

  const fetchGiftDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await cardsApi.getGiftDetails(token);
      setGiftDetails(response.data);
    } catch (err: any) {
      console.error('Error fetching gift details:', err);
      if (err.response?.status === 404) {
        setError('This gift link is invalid or has already been claimed.');
      } else if (err.response?.status === 410) {
        setError('This gift has expired and can no longer be claimed.');
      } else {
        setError('Unable to load gift details. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClaimAsAuthenticated = async () => {
    if (!isAuthenticated) {
      setShowRegistration(true);
      return;
    }

    try {
      setClaiming(true);
      await cardsApi.claimGift(token);
      Alert.alert(
        'Card Claimed!',
        'The Camp Card has been added to your wallet. You can now use it to redeem offers!',
        [
          {
            text: 'View My Cards',
            onPress: () => navigation.navigate('CardInventory' as never),
          },
        ]
      );
    } catch (err: any) {
      console.error('Error claiming gift:', err);
      Alert.alert(
        'Claim Failed',
        err.response?.data?.error || err.response?.data?.message || 'Unable to claim the gift. Please try again.'
      );
    } finally {
      setClaiming(false);
    }
  };

  const handleClaimAsNewUser = async () => {
    // Validate form
    if (!email || !password || !firstName || !lastName) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Weak Password', 'Password must be at least 8 characters long.');
      return;
    }

    try {
      setClaiming(true);

      // Register and claim in one step
      await cardsApi.claimGift(token, {
        email,
        password,
        firstName,
        lastName,
      });

      // Log the user in
      await login(email, password);

      Alert.alert(
        'Welcome to Camp Card!',
        'Your account has been created and the gifted card is now in your wallet.',
        [
          {
            text: 'View My Cards',
            onPress: () => navigation.navigate('CardInventory' as never),
          },
        ]
      );
    } catch (err: any) {
      console.error('Error claiming gift as new user:', err);
      Alert.alert(
        'Registration Failed',
        err.response?.data?.error || err.response?.data?.message || 'Unable to create account. Please try again.'
      );
    } finally {
      setClaiming(false);
    }
  };

  const formatExpiryDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDaysUntilExpiry = (dateString: string) => {
    const expiryDate = new Date(dateString);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading gift details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>Unable to Load Gift</Text>
          <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={fetchGiftDetails}
            accessibilityLabel="Try Again"
            accessibilityRole="button"
          >
            <Text style={[styles.retryButtonText, { color: colors.surface }]}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!giftDetails) {
    return null;
  }

  const daysLeft = getDaysUntilExpiry(giftDetails.expiresAt);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.giftIconContainer, { backgroundColor: colors.success }]}>
              <Ionicons name="gift" size={48} color={colors.surface} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>You've Received a Gift!</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {giftDetails.senderName} sent you a Camp Card
            </Text>
          </View>

          {/* Gift Details Card */}
          <View style={[styles.giftCard, { backgroundColor: colors.surface }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardLabel, { color: colors.primary }]}>CAMP CARD</Text>
              <Text style={[styles.cardNumber, { color: colors.text }]}>{giftDetails.cardNumber}</Text>
            </View>

            {giftDetails.message && (
              <View style={[styles.messageContainer, { backgroundColor: colors.background }]}>
                <Ionicons name="chatbubble-outline" size={20} color={colors.textSecondary} />
                <Text style={[styles.messageText, { color: colors.text }]}>"{giftDetails.message}"</Text>
              </View>
            )}

            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>From</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{giftDetails.senderName}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Expires</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{formatExpiryDate(giftDetails.expiresAt)}</Text>
              </View>
            </View>

            {daysLeft <= 30 && (
              <View style={[styles.expiryWarning, { backgroundColor: colors.warning + '15' }, daysLeft <= 7 && { backgroundColor: colors.error + '15' }]}>
                <Ionicons
                  name="time-outline"
                  size={16}
                  color={daysLeft <= 7 ? colors.error : colors.warning}
                />
                <Text style={[styles.expiryWarningText, { color: colors.warning }, daysLeft <= 7 && { color: colors.error }]}>
                  {daysLeft} days until this card expires
                </Text>
              </View>
            )}
          </View>

          {/* Action Section */}
          {!showRegistration ? (
            <View style={styles.actionSection}>
              {isAuthenticated ? (
                <>
                  <Text style={[styles.actionText, { color: colors.textSecondary }]}>
                    Claim this card to add it to your wallet and start saving!
                  </Text>
                  <TouchableOpacity
                    style={[styles.claimButton, { backgroundColor: colors.success }, claiming && styles.claimButtonDisabled]}
                    onPress={handleClaimAsAuthenticated}
                    disabled={claiming}
                    accessibilityLabel="Claim Card"
                    accessibilityRole="button"
                  >
                    {claiming ? (
                      <ActivityIndicator size="small" color={colors.surface} />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle" size={24} color={colors.surface} />
                        <Text style={[styles.claimButtonText, { color: colors.surface }]}>Claim Card</Text>
                      </>
                    )}
                  </TouchableOpacity>
                  <Text style={[styles.loggedInAs, { color: colors.textSecondary }]}>
                    Logged in as {user?.email}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={[styles.actionText, { color: colors.textSecondary }]}>
                    Create an account or log in to claim your gift card.
                  </Text>
                  <TouchableOpacity
                    style={[styles.claimButton, { backgroundColor: colors.success }]}
                    onPress={() => setShowRegistration(true)}
                    accessibilityLabel="Create Account"
                    accessibilityRole="button"
                  >
                    <Ionicons name="person-add" size={24} color={colors.surface} />
                    <Text style={[styles.claimButtonText, { color: colors.surface }]}>Create Account</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.loginButton}
                    onPress={() => navigation.navigate('Login' as never)}
                    accessibilityLabel="Log In"
                    accessibilityRole="button"
                  >
                    <Text style={[styles.loginButtonText, { color: colors.primary }]}>Already have an account? Log In</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          ) : (
            <View style={styles.registrationForm}>
              <Text style={[styles.formTitle, { color: colors.text }]}>Create Your Account</Text>

              <View style={styles.inputRow}>
                <View style={[styles.inputContainer, styles.halfInput]}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>First Name</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="John"
                    placeholderTextColor={colors.textSecondary}
                    autoCapitalize="words"
                  />
                </View>
                <View style={[styles.inputContainer, styles.halfInput]}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Last Name</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Smith"
                    placeholderTextColor={colors.textSecondary}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Email</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Password</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="At least 8 characters"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Confirm Password</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm your password"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity
                style={[styles.claimButton, { backgroundColor: colors.success }, claiming && styles.claimButtonDisabled]}
                onPress={handleClaimAsNewUser}
                disabled={claiming}
                accessibilityLabel="Create Account and Claim"
                accessibilityRole="button"
              >
                {claiming ? (
                  <ActivityIndicator size="small" color={colors.surface} />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={24} color={colors.surface} />
                    <Text style={[styles.claimButtonText, { color: colors.surface }]}>Create Account & Claim</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setShowRegistration(false)}
                accessibilityLabel="Go back"
                accessibilityRole="button"
              >
                <Text style={[styles.backButtonText, { color: colors.textSecondary }]}>Back</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Info Section */}
          <View style={[styles.infoSection, { backgroundColor: colors.surface }]}>
            <Text style={[styles.infoTitle, { color: colors.text }]}>What is Camp Card?</Text>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              Camp Card gives you access to exclusive discounts at local merchants while
              supporting Scout fundraising. Use your card to save money on dining,
              entertainment, services, and more!
            </Text>
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
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 16,
  },
  errorMessage: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  giftIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  giftCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    marginBottom: 16,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    letterSpacing: 1,
  },
  cardNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  messageText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    fontStyle: 'italic',
    marginLeft: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  expiryWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  expiryWarningUrgent: {
    backgroundColor: '#F8D7DA',
  },
  expiryWarningText: {
    fontSize: 14,
    color: '#856404',
    marginLeft: 8,
  },
  expiryWarningTextUrgent: {
    color: COLORS.error,
  },
  actionSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  actionText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  claimButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.success,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
  },
  claimButtonDisabled: {
    opacity: 0.6,
  },
  claimButtonText: {
    color: COLORS.surface,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  loggedInAs: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 12,
  },
  loginButton: {
    marginTop: 16,
    padding: 12,
  },
  loginButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  registrationForm: {
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputContainer: {
    marginBottom: 16,
  },
  halfInput: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  backButton: {
    alignItems: 'center',
    padding: 12,
    marginTop: 8,
  },
  backButtonText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  infoSection: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});
