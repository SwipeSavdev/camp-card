import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';

// SecureStore keys
const BIOMETRIC_ENABLED_KEY = 'biometric_auth_enabled';
const BIOMETRIC_CREDENTIALS_KEY = 'biometric_credentials';

export type BiometryType = 'FaceID' | 'TouchID' | 'Fingerprint' | 'Iris' | null;

export interface BiometricCapability {
  available: boolean;
  biometryType: BiometryType;
  error?: string;
}

export interface BiometricCredentials {
  email: string;
  refreshToken: string;  // Store refresh token for re-authentication
}

/**
 * Map Expo authentication types to friendly biometry types
 */
const mapAuthenticationType = (types: LocalAuthentication.AuthenticationType[]): BiometryType => {
  if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
    return 'FaceID';
  }
  if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
    return 'TouchID';
  }
  if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
    return 'Iris';
  }
  return null;
};

/**
 * Check if biometric authentication is available on this device
 */
export const checkBiometricAvailability = async (): Promise<BiometricCapability> => {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

    const available = hasHardware && isEnrolled;
    const biometryType = mapAuthenticationType(supportedTypes);

    return {
      available,
      biometryType,
    };
  } catch (error: any) {
    console.error('Error checking biometric availability:', error);
    return {
      available: false,
      biometryType: null,
      error: error.message,
    };
  }
};

/**
 * Get user-friendly name for biometric type
 */
export const getBiometricTypeName = (biometryType: BiometryType): string => {
  switch (biometryType) {
    case 'FaceID':
      return 'Face ID';
    case 'TouchID':
      return 'Touch ID';
    case 'Fingerprint':
      return 'Fingerprint';
    case 'Iris':
      return 'Iris Scanner';
    default:
      return 'Biometric Login';
  }
};

/**
 * Check if biometric authentication is currently enabled
 */
export const isBiometricEnabled = async (): Promise<boolean> => {
  try {
    const enabled = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
    return enabled === 'true';
  } catch (error) {
    console.error('Error checking biometric enabled status:', error);
    return false;
  }
};

/**
 * Enable biometric authentication
 * Stores user credentials securely for biometric login
 */
export const enableBiometricAuth = async (
  email: string,
  refreshToken: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Check if biometrics are available
    const capability = await checkBiometricAvailability();

    if (!capability.available) {
      return {
        success: false,
        error: 'Biometric authentication is not available on this device',
      };
    }

    // Prompt for biometric authentication to verify user identity
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: `Enable ${getBiometricTypeName(capability.biometryType)}`,
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    });

    if (!result.success) {
      return {
        success: false,
        error: 'Biometric authentication was cancelled',
      };
    }

    // Store credentials securely (refresh token for re-authentication)
    const credentials: BiometricCredentials = {
      email,
      refreshToken,
    };

    await SecureStore.setItemAsync(
      BIOMETRIC_CREDENTIALS_KEY,
      JSON.stringify(credentials)
    );
    await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, 'true');

    return { success: true };
  } catch (error: any) {
    console.error('Error enabling biometric auth:', error);
    return {
      success: false,
      error: error.message || 'Failed to enable biometric authentication',
    };
  }
};

/**
 * Disable biometric authentication
 * Removes stored credentials
 */
export const disableBiometricAuth = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    await SecureStore.deleteItemAsync(BIOMETRIC_CREDENTIALS_KEY);
    await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);

    return { success: true };
  } catch (error: any) {
    console.error('Error disabling biometric auth:', error);
    return {
      success: false,
      error: error.message || 'Failed to disable biometric authentication',
    };
  }
};

/**
 * Authenticate user with biometrics
 * Returns stored credentials if authentication succeeds
 */
export const authenticateWithBiometrics = async (): Promise<{
  success: boolean;
  credentials?: BiometricCredentials;
  error?: string;
}> => {
  try {
    // Check if biometric auth is enabled
    const enabled = await isBiometricEnabled();
    if (!enabled) {
      return {
        success: false,
        error: 'Biometric authentication is not enabled',
      };
    }

    // Check biometric availability
    const capability = await checkBiometricAvailability();
    if (!capability.available) {
      return {
        success: false,
        error: 'Biometric authentication is not available',
      };
    }

    // Prompt for biometric authentication
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: `Sign in with ${getBiometricTypeName(capability.biometryType)}`,
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    });

    if (!result.success) {
      return {
        success: false,
        error: 'Biometric authentication was cancelled or failed',
      };
    }

    // Retrieve stored credentials
    const credentialsJson = await SecureStore.getItemAsync(BIOMETRIC_CREDENTIALS_KEY);
    if (!credentialsJson) {
      return {
        success: false,
        error: 'No stored credentials found',
      };
    }

    const credentials: BiometricCredentials = JSON.parse(credentialsJson);

    return {
      success: true,
      credentials,
    };
  } catch (error: any) {
    console.error('Error authenticating with biometrics:', error);
    return {
      success: false,
      error: error.message || 'Biometric authentication failed',
    };
  }
};

/**
 * Update stored biometric credentials
 * Useful when tokens are refreshed
 */
export const updateBiometricCredentials = async (
  email: string,
  refreshToken: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const enabled = await isBiometricEnabled();
    if (!enabled) {
      return { success: true }; // No-op if biometrics not enabled
    }

    const credentials: BiometricCredentials = {
      email,
      refreshToken,
    };

    await SecureStore.setItemAsync(
      BIOMETRIC_CREDENTIALS_KEY,
      JSON.stringify(credentials)
    );

    return { success: true };
  } catch (error: any) {
    console.error('Error updating biometric credentials:', error);
    return {
      success: false,
      error: error.message || 'Failed to update credentials',
    };
  }
};

/**
 * Show biometric setup prompt to user
 */
export const promptBiometricSetup = async (
  onEnable: () => Promise<void>
): Promise<void> => {
  const capability = await checkBiometricAvailability();

  if (!capability.available) {
    Alert.alert(
      'Not Available',
      'Biometric authentication is not available on this device.',
      [{ text: 'OK' }]
    );
    return;
  }

  Alert.alert(
    `Enable ${getBiometricTypeName(capability.biometryType)}?`,
    `Would you like to enable ${getBiometricTypeName(capability.biometryType)} for quick and secure login?`,
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Enable',
        onPress: onEnable,
      },
    ]
  );
};
