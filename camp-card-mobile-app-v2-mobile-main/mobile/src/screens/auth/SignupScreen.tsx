// Build v1.0.3 (22) - Fixed planId type mismatch
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../config/ThemeContext';
import { AuthStackParamList } from '../../navigation/RootNavigator';
import { cardsApi } from '../../services/apiClient';

type SignupScreenRouteProp = RouteProp<AuthStackParamList, 'Signup'>;

export default function SignupScreen() {
  const route = useRoute<SignupScreenRouteProp>();
  const selectedPlan = route.params?.selectedPlan;
  const paymentCompleted = route.params?.paymentCompleted;
  const quantity = route.params?.quantity || 1;
  const scoutCode = route.params?.scoutCode;
  const transactionId = route.params?.transactionId;
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const navigation = useNavigation();
  const { signup, isLoading } = useAuthStore();
  const { theme } = useTheme();

  const handleSignup = async () => {
    // Validation
    if (!firstName || !lastName || !email || !phone || !password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Phone validation (at least 10 digits)
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number (at least 10 digits)');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    try {
      // Call the signup API
      const signupData: any = {
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        role: 'PARENT' as const, // Default to customer role for mobile signups
      };

      // Include subscription plan if payment was completed
      if (selectedPlan && paymentCompleted) {
        signupData.subscriptionPlanId = selectedPlan.id;
      }

      await signup(signupData);

      // If payment was completed, purchase the cards now that user is authenticated
      if (paymentCompleted && transactionId) {
        try {
          console.log('Purchasing cards with transaction:', transactionId);
          await cardsApi.purchaseCards({
            quantity: quantity,
            planId: selectedPlan?.id?.toString(),
            scoutCode: scoutCode,
            paymentToken: transactionId,
            email: email.trim(),
            firstName: firstName.trim(),
            lastName: lastName.trim(),
          });
          console.log('Cards purchased successfully');
        } catch (cardError: any) {
          console.error('Card purchase error:', cardError);
          // Show warning but don't fail signup - payment was already successful
          Alert.alert(
            'Card Activation Issue',
            'Your account was created and payment received, but there was an issue activating your cards. Please contact support with your transaction ID: ' + transactionId
          );
        }
      }

      // If signup succeeds, we're automatically logged in
      // The auth store handles the navigation
    } catch (error: any) {
      console.error('Signup error:', error);
      const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message;
      Alert.alert(
        'Signup Failed',
        errorMsg || 'Unable to create account. Please try again.'
      );
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* 3 vertical sections: Top (fixed) / Middle (flex) / Bottom (fixed) */}
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        // Keep CTA tappable; adjust if you have a header/nav bar on iOS
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 24}
      >
        {/* Top: Header with back button */}
        <View style={styles.topSection}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Middle: Header text + Form */}
        <ScrollView
          style={styles.middleSection}
          contentContainerStyle={styles.middleSectionContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* moved here so it stays visible above the form */}
          <View style={[styles.headerTextContainer, styles.headerTextAboveForm]}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {paymentCompleted ? 'Complete Your Account' : 'Create Account'}
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              {paymentCompleted ? 'One more step to activate your subscription' : 'Join BSA Camp Card'}
            </Text>
          </View>

          {/* Selected Plan Banner */}
          {selectedPlan && paymentCompleted && (
            <View style={[styles.planBanner, { backgroundColor: `${theme.colors.success}15`, borderColor: `${theme.colors.success}30` }]}>
              <View style={styles.planBannerIcon}>
                <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
              </View>
              <View style={styles.planBannerContent}>
                <Text style={[styles.planBannerTitle, { color: theme.colors.success }]}>Payment Successful</Text>
                <Text style={[styles.planBannerText, { color: theme.colors.success }]}>
                  {selectedPlan.name} - $14.99/{selectedPlan.billingInterval === 'ANNUAL' ? 'year' : 'month'}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.form}>
            <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Ionicons
                name="person-outline"
                size={20}
                color={theme.colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder="First Name"
                placeholderTextColor={theme.colors.textSecondary}
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
                editable={!isLoading}
                accessibilityLabel="First name"
                accessibilityRole="none"
              />
            </View>

            <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Ionicons
                name="person-outline"
                size={20}
                color={theme.colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder="Last Name"
                placeholderTextColor={theme.colors.textSecondary}
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
                editable={!isLoading}
                accessibilityLabel="Last name"
                accessibilityRole="none"
              />
            </View>

            <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={theme.colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder="Email"
                placeholderTextColor={theme.colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                editable={!isLoading}
                accessibilityLabel="Email address"
                accessibilityRole="none"
              />
            </View>

            <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Ionicons
                name="call-outline"
                size={20}
                color={theme.colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder="Phone Number"
                placeholderTextColor={theme.colors.textSecondary}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoComplete="tel"
                editable={!isLoading}
                accessibilityLabel="Phone number"
                accessibilityRole="none"
              />
            </View>

            <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={theme.colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder="Password"
                placeholderTextColor={theme.colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="password-new"
                editable={!isLoading}
                accessibilityLabel="Password"
                accessibilityRole="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                accessibilityRole="button"
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={theme.colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder="Confirm Password"
                placeholderTextColor={theme.colors.textSecondary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                editable={!isLoading}
                accessibilityLabel="Confirm password"
                accessibilityRole="none"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
                accessibilityLabel={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                accessibilityRole="button"
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <Text style={[styles.passwordHint, { color: theme.colors.textSecondary }]}>
              Password must be at least 8 characters
            </Text>
          </View>
        </ScrollView>

        {/* Bottom: CTA always visible */}
        <View style={[styles.bottomSection, { borderTopColor: theme.colors.border }]}>
          <TouchableOpacity
            style={[styles.signupButton, { backgroundColor: theme.colors.primary }, isLoading && styles.signupButtonDisabled]}
            onPress={handleSignup}
            disabled={isLoading}
            accessibilityLabel={isLoading ? 'Creating account' : 'Create account'}
            accessibilityRole="button"
          >
            <Text style={[styles.signupButtonText, { color: theme.colors.surface }]}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>Already have an account? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              accessibilityLabel="Sign in"
              accessibilityRole="button"
            >
              <Text style={[styles.loginLink, { color: theme.colors.primary }]}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  topSection: {
    paddingTop: 4,
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
  },
  backButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
  },
  middleSection: {
    flex: 1,
  },
  middleSectionContent: {
    paddingTop: 8,
    paddingBottom: 16,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  headerTextContainer: {
    alignItems: 'center',
    marginBottom: 6,
  },
  headerTextAboveForm: {
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 0,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 6,
    marginBottom: 0,
  },
  form: {
    paddingHorizontal: 24,
    paddingTop: 0,
    paddingBottom: 0,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 520,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 4,
  },
  passwordHint: {
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
    marginLeft: 4,
  },
  signupButton: {
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
  },
  signupButtonDisabled: {
    opacity: 0.6,
  },
  signupButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingBottom: 0,
    marginTop: 12,
  },
  footerText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  planBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  planBannerIcon: {
    marginRight: 12,
  },
  planBannerContent: {
    flex: 1,
  },
  planBannerTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  planBannerText: {
    fontSize: 13,
  },
});
