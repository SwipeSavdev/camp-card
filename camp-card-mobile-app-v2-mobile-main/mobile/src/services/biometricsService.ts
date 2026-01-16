import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';

const rnBiometrics = new ReactNativeBiometrics({ allowDeviceCredentials: true });

// SecureStore keys
const BIOMETRIC_ENABLED_KEY = 'biometric_auth_enabled';
const BIOMETRIC_CREDENTIALS_KEY = 'biometric_credentials';

export interface BiometricCapability {
  available: boolean;
  biometryType: BiometryTypes | null;
  error?: string;
}

export interface BiometricCredentials {
  email: string;
  encryptedToken: string;
}

/**
 * Check if biometric authentication is available on this device
 */
export const checkBiometricAvailability = async (): Promise<BiometricCapability> => {
  try {
    const { available, biometryType } = await rnBiometrics.isSensorAvailable();

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
export const getBiometricTypeName = (biometryType: BiometryTypes | null): string => {
  switch (biometryType) {
    case BiometryTypes.FaceID:
      return 'Face ID';
    case BiometryTypes.TouchID:
      return 'Touch ID';
    case BiometryTypes.Biometrics:
      return 'Biometric Authentication';
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
  accessToken: string
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

    // Create a biometric signature to verify user identity
    const { success } = await rnBiometrics.simplePrompt({
      promptMessage: `Enable ${getBiometricTypeName(capability.biometryType)}`,
      cancelButtonText: 'Cancel',
    });

    if (!success) {
      return {
        success: false,
        error: 'Biometric authentication was cancelled',
      };
    }

    // Store credentials securely
    const credentials: BiometricCredentials = {
      email,
      encryptedToken: accessToken, // In production, this should be additionally encrypted
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
    const { success } = await rnBiometrics.simplePrompt({
      promptMessage: `Sign in with ${getBiometricTypeName(capability.biometryType)}`,
      cancelButtonText: 'Cancel',
    });

    if (!success) {
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
  accessToken: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const enabled = await isBiometricEnabled();
    if (!enabled) {
      return { success: true }; // No-op if biometrics not enabled
    }

    const credentials: BiometricCredentials = {
      email,
      encryptedToken: accessToken,
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
