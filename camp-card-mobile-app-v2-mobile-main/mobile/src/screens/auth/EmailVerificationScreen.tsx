import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { apiClient } from '../../services/apiClient';
import { useTheme } from '../../config/ThemeContext';

type EmailVerificationRouteProp = RouteProp<{ params: { token: string } }, 'params'>;

export default function EmailVerificationScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<'success' | 'error' | 'loading'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const navigation = useNavigation();
  const route = useRoute<EmailVerificationRouteProp>();
  const { theme } = useTheme();

  // Get token from route params (from deep link)
  const token = route.params?.token || '';

  useEffect(() => {
    verifyEmail();
  }, []);

  const verifyEmail = async () => {
    if (!token) {
      setVerificationStatus('error');
      setErrorMessage('Invalid verification token. Please check your email for the correct link.');
      setIsLoading(false);
      return;
    }

    try {
      await apiClient.post('/api/v1/auth/verify-email', { token });
      setVerificationStatus('success');
    } catch (error: any) {
      setVerificationStatus('error');
      const message = error.response?.data?.error || error.response?.data?.message || 'Verification failed. The link may have expired.';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || verificationStatus === 'loading') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Verifying your email...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (verificationStatus === 'success') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centerContainer}>
          <View style={[styles.successIconContainer, { backgroundColor: `${theme.colors.success}15` }]}>
            <Ionicons name="checkmark-circle" size={80} color={theme.colors.success} />
          </View>
          <Text style={[styles.successTitle, { color: theme.colors.text }]}>Email Verified!</Text>
          <Text style={[styles.successMessage, { color: theme.colors.textSecondary }]}>
            Your email has been successfully verified. You can now access all features of the BSA Camp Card app.
          </Text>
          <TouchableOpacity
            style={[styles.continueButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation.navigate('Login' as never)}
            accessibilityLabel="Continue to app"
            accessibilityRole="button"
          >
            <Text style={[styles.continueButtonText, { color: theme.colors.surface }]}>Continue to App</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.centerContainer}>
        <View style={[styles.errorIconContainer, { backgroundColor: `${theme.colors.error}15` }]}>
          <Ionicons name="alert-circle" size={80} color={theme.colors.error} />
        </View>
        <Text style={[styles.errorTitle, { color: theme.colors.text }]}>Verification Failed</Text>
        <Text style={[styles.errorMessage, { color: theme.colors.textSecondary }]}>{errorMessage}</Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => {
            setIsLoading(true);
            setVerificationStatus('loading');
            verifyEmail();
          }}
          accessibilityLabel="Try again"
          accessibilityRole="button"
        >
          <Text style={[styles.retryButtonText, { color: theme.colors.surface }]}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('Login' as never)}
          accessibilityLabel="Back to login"
          accessibilityRole="button"
        >
          <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loader: {
    marginTop: 24,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
  },
  successIconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  continueButton: {
    borderRadius: 12,
    paddingHorizontal: 48,
    paddingVertical: 16,
    minWidth: 200,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorIconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  retryButton: {
    borderRadius: 12,
    paddingHorizontal: 48,
    paddingVertical: 16,
    minWidth: 200,
    marginBottom: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  backButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
