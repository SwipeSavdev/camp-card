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
  TouchableWithoutFeedback,
  Keyboard,
  Image,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../config/ThemeContext';
import { analyticsService } from '../../services/analyticsService';
import {
  isBiometricEnabled,
  authenticateWithBiometrics,
  checkBiometricAvailability,
  getBiometricTypeName,
} from '../../services/biometricsService';

// App icon for login screen
const APP_ICON = require('../../../assets/appicon_1024.jpg');

/**
 * Login Screen
 * Handles user authentication
 */
export default function LoginScreen() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [biometricAvailable, setBiometricAvailable] = React.useState(false);
  const [biometricEnabled, setBiometricEnabled] = React.useState(false);
  const [biometricType, setBiometricType] = React.useState('Biometric');
  const [biometricLoading, setBiometricLoading] = React.useState(false);

  const navigation = useNavigation();
  const { login, loginWithBiometric, isLoading } = useAuthStore();
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const logoSize = Math.min(220, Math.round(width * 0.6));

  // Check if biometric authentication is available and enabled
  React.useEffect(() => {
    checkBiometric();
  }, []);

  const checkBiometric = async () => {
    try {
      const capability = await checkBiometricAvailability();
      setBiometricAvailable(capability.available);
      if (capability.biometryType) {
        setBiometricType(getBiometricTypeName(capability.biometryType));
      }

      const enabled = await isBiometricEnabled();
      setBiometricEnabled(enabled);
    } catch (error) {
      console.error('Error checking biometric:', error);
    }
  };

  const handleBiometricLogin = async () => {
    setBiometricLoading(true);
    try {
      const result = await authenticateWithBiometrics();

      if (result.success && result.credentials) {
        // Use stored refresh token for re-authentication
        await loginWithBiometric(result.credentials.refreshToken);
        analyticsService.trackAction('login', { method: 'biometric' });
      } else {
        Alert.alert('Authentication Failed', result.error || 'Biometric authentication failed');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to authenticate with biometrics');
    } finally {
      setBiometricLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    try {
      await login(email.trim(), password);
      analyticsService.trackAction('login', { method: 'email' });
    } catch (error: any) {
      // Provide more specific error messages for debugging
      let errorMessage = 'Invalid email or password';

      if (error.response?.data?.error || error.response?.data?.message) {
        // Server returned an error message
        errorMessage = error.response.data.error || error.response.data.message;
      } else if (error.code === 'ERR_NETWORK' || error.message?.includes('Network')) {
        // Network error - can't reach the server
        errorMessage = 'Cannot connect to server. Please check your network connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      console.log('Login error details:', {
        code: error.code,
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      Alert.alert('Login Failed', errorMessage);
    }
  };


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.content}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* App Icon */}
            <View style={styles.logoContainer}>
              <Image source={APP_ICON} style={[styles.appIcon, { width: logoSize, height: logoSize }]} />
            </View>

            {/* Form */}
            <View style={styles.form}>
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
                  autoCorrect={false}
                  editable={!isLoading}
                  textContentType="emailAddress"
                  accessibilityLabel="Email address"
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
                  autoComplete="password"
                  autoCorrect={false}
                  autoCapitalize="none"
                  editable={!isLoading}
                  textContentType="password"
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

              <TouchableOpacity
                style={[styles.loginButton, { backgroundColor: theme.colors.primary }, isLoading && styles.loginButtonDisabled]}
                onPress={handleLogin}
                disabled={isLoading}
                accessibilityLabel={isLoading ? 'Signing in' : 'Sign in'}
                accessibilityRole="button"
              >
                <Text style={[styles.loginButtonText, { color: theme.colors.surface }]}>
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Text>
              </TouchableOpacity>

              {/* Biometric Login Button */}
              {biometricAvailable && biometricEnabled && (
                <TouchableOpacity
                  style={[styles.biometricButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary }]}
                  onPress={handleBiometricLogin}
                  disabled={biometricLoading || isLoading}
                  accessibilityLabel={`Sign in with ${biometricType}`}
                  accessibilityRole="button"
                >
                  {biometricLoading ? (
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                  ) : (
                    <>
                      <Ionicons name="finger-print" size={24} color={theme.colors.primary} />
                      <Text style={[styles.biometricButtonText, { color: theme.colors.primary }]}>
                        Sign in with {biometricType}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={() => navigation.navigate('ForgotPassword')}
                accessibilityLabel="Forgot password"
                accessibilityRole="button"
              >
                <Text style={[styles.forgotPasswordText, { color: theme.colors.primary }]}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>Don't have an account? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Signup')}
                accessibilityLabel="Sign up"
                accessibilityRole="button"
              >
                <Text style={[styles.signupLink, { color: theme.colors.primary }]}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 132,
    justifyContent: 'flex-start',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  appIcon: {
    resizeMode: 'contain',
    borderRadius: 24,
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
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
  loginButton: {
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    height: 52,
    marginTop: 12,
    borderWidth: 1,
    gap: 8,
  },
  biometricButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: 16,
  },
  forgotPasswordText: {
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
  },
  signupLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});
