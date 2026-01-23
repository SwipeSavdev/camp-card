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
import { COLORS } from '../../config/constants';
import { AuthStackParamList } from '../../navigation/RootNavigator';

type SignupScreenRouteProp = RouteProp<AuthStackParamList, 'Signup'>;

export default function SignupScreen() {
  const route = useRoute<SignupScreenRouteProp>();
  const selectedPlan = route.params?.selectedPlan;
  const paymentCompleted = route.params?.paymentCompleted;
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

  const handleSignup = async () => {
    // Validation
    if (!firstName || !lastName || !email || !password) {
      Alert.alert('Error', 'Please fill in all required fields');
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
        phone: phone ? phone.trim() : undefined,
        role: 'PARENT' as const, // Default to customer role for mobile signups
      };

      // Include subscription plan if payment was completed
      if (selectedPlan && paymentCompleted) {
        signupData.subscriptionPlanId = selectedPlan.id;
      }

      await signup(signupData);

      // If signup succeeds, we're automatically logged in
      // The auth store handles the navigation
    } catch (error: any) {
      console.error('Signup error:', error);
      Alert.alert(
        'Signup Failed',
        error.response?.data?.message || 
        error.message || 
        'Unable to create account. The backend server may not be running.'
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.text} />
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
            <Text style={styles.title}>
              {paymentCompleted ? 'Complete Your Account' : 'Create Account'}
            </Text>
            <Text style={styles.subtitle}>
              {paymentCompleted ? 'One more step to activate your subscription' : 'Join BSA Camp Card'}
            </Text>
          </View>

          {/* Selected Plan Banner */}
          {selectedPlan && paymentCompleted && (
            <View style={styles.planBanner}>
              <View style={styles.planBannerIcon}>
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              </View>
              <View style={styles.planBannerContent}>
                <Text style={styles.planBannerTitle}>Payment Successful</Text>
                <Text style={styles.planBannerText}>
                  {selectedPlan.name} - ${(selectedPlan.priceCents / 100).toFixed(2)}/{selectedPlan.billingInterval === 'ANNUAL' ? 'year' : 'month'}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Ionicons
                name="person-outline"
                size={20}
                color={COLORS.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="First Name"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons
                name="person-outline"
                size={20}
                color={COLORS.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Last Name"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={COLORS.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons
                name="call-outline"
                size={20}
                color={COLORS.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Phone (optional)"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoComplete="tel"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={COLORS.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="password-new"
                editable={!isLoading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={COLORS.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={COLORS.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                editable={!isLoading}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={COLORS.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.passwordHint}>
              Password must be at least 8 characters
            </Text>
          </View>
        </ScrollView>

        {/* Bottom: CTA always visible */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={[styles.signupButton, isLoading && styles.signupButtonDisabled]}
            onPress={handleSignup}
            disabled={isLoading}
          >
            <Text style={styles.signupButtonText}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Sign In</Text>
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
    backgroundColor: COLORS.background,
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
    paddingHorizontal: 20,
    paddingBottom: 12,
    paddingTop: 6,
  },
  headerTextContainer: {
    alignItems: 'center',
    marginBottom: 4,
  },
  headerTextAboveForm: {
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 0,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
    marginBottom: 0,
  },
  form: {
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 0,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 480,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: 15,
    color: COLORS.text,
  },
  eyeIcon: {
    padding: 4,
  },
  passwordHint: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: -8,
    marginBottom: 8,
    marginLeft: 4,
  },
  signupButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
  },
  signupButtonDisabled: {
    opacity: 0.6,
  },
  signupButtonText: {
    color: COLORS.surface,
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingBottom: 0,
    marginTop: 10,
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  loginLink: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  planBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  planBannerIcon: {
    marginRight: 10,
  },
  planBannerContent: {
    flex: 1,
  },
  planBannerTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 2,
  },
  planBannerText: {
    fontSize: 12,
    color: '#388E3C',
  },
});
