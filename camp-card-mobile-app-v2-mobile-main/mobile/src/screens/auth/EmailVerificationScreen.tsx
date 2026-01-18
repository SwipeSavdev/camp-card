import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { apiClient } from '../../services/apiClient';
import { COLORS } from '../../config/constants';

const CAMP_CARD_LOGO = require('../../../assets/campcard_lockup_left.png');

type EmailVerificationRouteProp = RouteProp<{ params: { token: string } }, 'params'>;

export default function EmailVerificationScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<'success' | 'error' | 'loading'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const navigation = useNavigation();
  const route = useRoute<EmailVerificationRouteProp>();
  const { width } = useWindowDimensions();
  const logoSize = Math.min(180, Math.round(width * 0.5));

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
      const message = error.response?.data?.message || 'Verification failed. The link may have expired.';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || verificationStatus === 'loading') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Image source={CAMP_CARD_LOGO} style={[styles.logoImage, { width: logoSize, height: logoSize * 0.4 }]} />
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
          <Text style={styles.loadingText}>Verifying your email...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (verificationStatus === 'success') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Image source={CAMP_CARD_LOGO} style={[styles.logoImage, { width: logoSize, height: logoSize * 0.4 }]} />
          <View style={styles.successIconContainer}>
            <Ionicons name="checkmark-circle" size={80} color={COLORS.success} />
          </View>
          <Text style={styles.successTitle}>Email Verified!</Text>
          <Text style={styles.successMessage}>
            Your email has been successfully verified. You can now access all features of the BSA Camp Card app.
          </Text>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => navigation.navigate('Login' as never)}
          >
            <Text style={styles.continueButtonText}>Continue to App</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centerContainer}>
        <Image source={CAMP_CARD_LOGO} style={[styles.logoImage, { width: logoSize, height: logoSize * 0.4 }]} />
        <View style={styles.errorIconContainer}>
          <Ionicons name="alert-circle" size={80} color={COLORS.error} />
        </View>
        <Text style={styles.errorTitle}>Verification Failed</Text>
        <Text style={styles.errorMessage}>{errorMessage}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setIsLoading(true);
            setVerificationStatus('loading');
            verifyEmail();
          }}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('Login' as never)}
        >
          <Text style={styles.backButtonText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logoImage: {
    resizeMode: 'contain',
    marginBottom: 32,
  },
  loader: {
    marginTop: 24,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  successIconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: `${COLORS.success}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  continueButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 48,
    paddingVertical: 16,
    minWidth: 200,
  },
  continueButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorIconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: `${COLORS.error}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 48,
    paddingVertical: 16,
    minWidth: 200,
    marginBottom: 12,
  },
  retryButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  backButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  backButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
