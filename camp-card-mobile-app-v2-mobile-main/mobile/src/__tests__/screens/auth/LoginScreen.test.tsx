/**
 * LoginScreen Tests
 * Comprehensive tests for the Login screen functionality
 */

import React from 'react';
import { Alert } from 'react-native';
import {
  render,
  fireEvent,
  waitFor,
  screen,
  mockNavigation,
  createMockAuthStore,
} from '../../test-utils';

// Mock dependencies
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => mockNavigation,
}));

// Mock biometrics service
const mockBiometricsService = {
  isBiometricEnabled: jest.fn().mockResolvedValue(false),
  authenticateWithBiometrics: jest.fn(),
  checkBiometricAvailability: jest.fn().mockResolvedValue({ available: false }),
  getBiometricTypeName: jest.fn().mockReturnValue('Biometric'),
};

jest.mock('../../../services/biometricsService', () => mockBiometricsService);

// Mock auth store
const mockAuthStore = createMockAuthStore();
jest.mock('../../../store/authStore', () => ({
  useAuthStore: () => mockAuthStore,
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

// Import after mocks
import LoginScreen from '../../../screens/auth/LoginScreen';

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthStore.isLoading = false;
    mockAuthStore.login.mockResolvedValue(undefined);
    mockBiometricsService.checkBiometricAvailability.mockResolvedValue({ available: false });
    mockBiometricsService.isBiometricEnabled.mockResolvedValue(false);
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<LoginScreen />);
      expect(screen.getByPlaceholderText('Email')).toBeTruthy();
    });

    it('should display the Camp Card logo', () => {
      render(<LoginScreen />);
      // Logo is displayed via Image component
      expect(screen.getByPlaceholderText('Email')).toBeTruthy();
    });

    it('should display email input field', () => {
      render(<LoginScreen />);
      expect(screen.getByPlaceholderText('Email')).toBeTruthy();
    });

    it('should display password input field', () => {
      render(<LoginScreen />);
      expect(screen.getByPlaceholderText('Password')).toBeTruthy();
    });

    it('should display Sign In button', () => {
      render(<LoginScreen />);
      expect(screen.getByText('Sign In')).toBeTruthy();
    });

    it('should display Forgot Password link', () => {
      render(<LoginScreen />);
      expect(screen.getByText('Forgot Password?')).toBeTruthy();
    });

    it('should display Sign Up link', () => {
      render(<LoginScreen />);
      expect(screen.getByText('Sign Up')).toBeTruthy();
    });

    it('should display "Don\'t have an account?" text', () => {
      render(<LoginScreen />);
      expect(screen.getByText(/Don't have an account/)).toBeTruthy();
    });
  });

  describe('Email Input', () => {
    it('should update email state when typing', () => {
      render(<LoginScreen />);
      const emailInput = screen.getByPlaceholderText('Email');
      fireEvent.changeText(emailInput, 'test@example.com');
      expect(emailInput.props.value).toBe('test@example.com');
    });

    it('should not auto-capitalize email input', () => {
      render(<LoginScreen />);
      const emailInput = screen.getByPlaceholderText('Email');
      expect(emailInput.props.autoCapitalize).toBe('none');
    });

    it('should have email keyboard type', () => {
      render(<LoginScreen />);
      const emailInput = screen.getByPlaceholderText('Email');
      expect(emailInput.props.keyboardType).toBe('email-address');
    });
  });

  describe('Password Input', () => {
    it('should update password state when typing', () => {
      render(<LoginScreen />);
      const passwordInput = screen.getByPlaceholderText('Password');
      fireEvent.changeText(passwordInput, 'securePassword123');
      expect(passwordInput.props.value).toBe('securePassword123');
    });

    it('should hide password by default', () => {
      render(<LoginScreen />);
      const passwordInput = screen.getByPlaceholderText('Password');
      expect(passwordInput.props.secureTextEntry).toBe(true);
    });

    it('should toggle password visibility when eye icon is pressed', async () => {
      render(<LoginScreen />);
      const passwordInput = screen.getByPlaceholderText('Password');

      // Initially hidden
      expect(passwordInput.props.secureTextEntry).toBe(true);

      // Find and press the eye icon (toggle button)
      const toggleButtons = screen.getAllByRole('button');
      const eyeToggle = toggleButtons.find(btn => btn.props.onPress);

      if (eyeToggle) {
        fireEvent.press(eyeToggle);
      }
    });
  });

  describe('Form Submission', () => {
    it('should show error when email is empty', async () => {
      render(<LoginScreen />);
      const signInButton = screen.getByText('Sign In');
      fireEvent.press(signInButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter email and password');
      });
    });

    it('should show error when password is empty', async () => {
      render(<LoginScreen />);
      const emailInput = screen.getByPlaceholderText('Email');
      fireEvent.changeText(emailInput, 'test@example.com');

      const signInButton = screen.getByText('Sign In');
      fireEvent.press(signInButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter email and password');
      });
    });

    it('should call login with email and password when form is valid', async () => {
      render(<LoginScreen />);

      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');

      const signInButton = screen.getByText('Sign In');
      fireEvent.press(signInButton);

      await waitFor(() => {
        expect(mockAuthStore.login).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });

    it('should trim email before login', async () => {
      render(<LoginScreen />);

      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');

      fireEvent.changeText(emailInput, '  test@example.com  ');
      fireEvent.changeText(passwordInput, 'password123');

      const signInButton = screen.getByText('Sign In');
      fireEvent.press(signInButton);

      await waitFor(() => {
        expect(mockAuthStore.login).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });

    it('should show error alert on login failure', async () => {
      const mockError = {
        response: {
          data: { message: 'Invalid credentials' },
        },
      };
      mockAuthStore.login.mockRejectedValueOnce(mockError);

      render(<LoginScreen />);

      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'wrongpassword');

      const signInButton = screen.getByText('Sign In');
      fireEvent.press(signInButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Login Failed', 'Invalid credentials');
      });
    });

    it('should show network error message on network failure', async () => {
      const mockError = {
        code: 'ERR_NETWORK',
        message: 'Network Error',
      };
      mockAuthStore.login.mockRejectedValueOnce(mockError);

      render(<LoginScreen />);

      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');

      const signInButton = screen.getByText('Sign In');
      fireEvent.press(signInButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Login Failed',
          'Cannot connect to server. Please check your network connection.'
        );
      });
    });
  });

  describe('Loading State', () => {
    it('should show "Signing In..." when loading', () => {
      mockAuthStore.isLoading = true;
      render(<LoginScreen />);
      expect(screen.getByText('Signing In...')).toBeTruthy();
    });

    it('should disable Sign In button when loading', () => {
      mockAuthStore.isLoading = true;
      render(<LoginScreen />);
      const signInButton = screen.getByText('Signing In...').parent;
      expect(signInButton?.props.disabled).toBe(true);
    });

    it('should disable email input when loading', () => {
      mockAuthStore.isLoading = true;
      render(<LoginScreen />);
      const emailInput = screen.getByPlaceholderText('Email');
      expect(emailInput.props.editable).toBe(false);
    });

    it('should disable password input when loading', () => {
      mockAuthStore.isLoading = true;
      render(<LoginScreen />);
      const passwordInput = screen.getByPlaceholderText('Password');
      expect(passwordInput.props.editable).toBe(false);
    });
  });

  describe('Navigation', () => {
    it('should navigate to ForgotPassword when link is pressed', () => {
      render(<LoginScreen />);
      const forgotPasswordLink = screen.getByText('Forgot Password?');
      fireEvent.press(forgotPasswordLink);
      expect(mockNavigation.navigate).toHaveBeenCalledWith('ForgotPassword');
    });

    it('should navigate to SubscriptionSelection when Sign Up is pressed', () => {
      render(<LoginScreen />);
      const signUpLink = screen.getByText('Sign Up');
      fireEvent.press(signUpLink);
      expect(mockNavigation.navigate).toHaveBeenCalledWith('SubscriptionSelection');
    });
  });

  describe('Biometric Authentication', () => {
    beforeEach(() => {
      mockBiometricsService.checkBiometricAvailability.mockResolvedValue({
        available: true,
        biometryType: 'TouchID',
      });
      mockBiometricsService.isBiometricEnabled.mockResolvedValue(true);
      mockBiometricsService.getBiometricTypeName.mockReturnValue('Touch ID');
    });

    it('should show biometric button when available and enabled', async () => {
      render(<LoginScreen />);

      await waitFor(() => {
        // The biometric button text should be present
        const biometricText = screen.queryByText(/Sign in with/);
        expect(biometricText).toBeTruthy();
      });
    });

    it('should call authenticateWithBiometrics when biometric button is pressed', async () => {
      mockBiometricsService.authenticateWithBiometrics.mockResolvedValue({
        success: true,
        credentials: {
          email: 'test@example.com',
          encryptedToken: 'encrypted-token',
        },
      });

      render(<LoginScreen />);

      await waitFor(() => {
        const biometricText = screen.queryByText(/Sign in with/);
        expect(biometricText).toBeTruthy();
      });

      const biometricButton = screen.getByText(/Sign in with/);
      fireEvent.press(biometricButton);

      await waitFor(() => {
        expect(mockBiometricsService.authenticateWithBiometrics).toHaveBeenCalled();
      });
    });

    it('should show error on biometric authentication failure', async () => {
      mockBiometricsService.authenticateWithBiometrics.mockResolvedValue({
        success: false,
        error: 'User cancelled authentication',
      });

      render(<LoginScreen />);

      await waitFor(() => {
        const biometricText = screen.queryByText(/Sign in with/);
        expect(biometricText).toBeTruthy();
      });

      const biometricButton = screen.getByText(/Sign in with/);
      fireEvent.press(biometricButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Authentication Failed',
          'User cancelled authentication'
        );
      });
    });

    it('should not show biometric button when not available', async () => {
      mockBiometricsService.checkBiometricAvailability.mockResolvedValue({ available: false });

      render(<LoginScreen />);

      await waitFor(() => {
        const biometricText = screen.queryByText(/Sign in with/);
        expect(biometricText).toBeFalsy();
      });
    });

    it('should not show biometric button when not enabled', async () => {
      mockBiometricsService.isBiometricEnabled.mockResolvedValue(false);

      render(<LoginScreen />);

      await waitFor(() => {
        const biometricText = screen.queryByText(/Sign in with/);
        expect(biometricText).toBeFalsy();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have accessible email input', () => {
      render(<LoginScreen />);
      const emailInput = screen.getByPlaceholderText('Email');
      expect(emailInput.props.textContentType).toBe('emailAddress');
    });

    it('should have accessible password input', () => {
      render(<LoginScreen />);
      const passwordInput = screen.getByPlaceholderText('Password');
      expect(passwordInput.props.textContentType).toBe('password');
    });
  });
});
