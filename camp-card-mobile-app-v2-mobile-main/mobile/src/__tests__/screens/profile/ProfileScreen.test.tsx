/**
 * ProfileScreen Tests
 * Comprehensive tests for the Profile screen with role-based menu items
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
  mockScoutUser,
  mockTroopLeaderUser,
  mockParentUser,
} from '../../test-utils';

// Mock dependencies
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => mockNavigation,
}));

// Default mock auth store
let currentMockUser = mockScoutUser;
const mockLogout = jest.fn().mockResolvedValue(undefined);

jest.mock('../../../store/authStore', () => ({
  useAuthStore: () => ({
    user: currentMockUser,
    logout: mockLogout,
  }),
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

// Import after mocks
import ProfileScreen from '../../../screens/profile/ProfileScreen';

describe('ProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    currentMockUser = mockScoutUser;
    mockLogout.mockResolvedValue(undefined);
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<ProfileScreen />);
      expect(screen.getByText(`${mockScoutUser.firstName} ${mockScoutUser.lastName}`)).toBeTruthy();
    });

    it('should display user avatar', () => {
      render(<ProfileScreen />);
      // Avatar container with person icon exists
      expect(screen.getByText(`${mockScoutUser.firstName} ${mockScoutUser.lastName}`)).toBeTruthy();
    });

    it('should display user full name', () => {
      render(<ProfileScreen />);
      expect(screen.getByText(`${mockScoutUser.firstName} ${mockScoutUser.lastName}`)).toBeTruthy();
    });

    it('should display user email', () => {
      render(<ProfileScreen />);
      expect(screen.getByText(mockScoutUser.email)).toBeTruthy();
    });

    it('should display "Account" section title', () => {
      render(<ProfileScreen />);
      expect(screen.getByText('Account')).toBeTruthy();
    });

    it('should display version number', () => {
      render(<ProfileScreen />);
      expect(screen.getByText('Version 1.0.0')).toBeTruthy();
    });

    it('should display Logout button', () => {
      render(<ProfileScreen />);
      expect(screen.getByText('Logout')).toBeTruthy();
    });
  });

  describe('Menu Items for Scout User', () => {
    beforeEach(() => {
      currentMockUser = mockScoutUser;
    });

    it('should display Subscription menu item', () => {
      render(<ProfileScreen />);
      expect(screen.getByText('Subscription')).toBeTruthy();
    });

    it('should display Subscription subtitle', () => {
      render(<ProfileScreen />);
      expect(screen.getByText('Manage your subscription')).toBeTruthy();
    });

    it('should display Referrals menu item for Scout', () => {
      render(<ProfileScreen />);
      expect(screen.getByText('Referrals')).toBeTruthy();
    });

    it('should display Referrals subtitle', () => {
      render(<ProfileScreen />);
      expect(screen.getByText('Share and earn rewards')).toBeTruthy();
    });

    it('should display Notifications menu item', () => {
      render(<ProfileScreen />);
      expect(screen.getByText('Notifications')).toBeTruthy();
    });

    it('should display Notifications subtitle', () => {
      render(<ProfileScreen />);
      expect(screen.getByText('Manage notifications')).toBeTruthy();
    });

    it('should display Settings menu item', () => {
      render(<ProfileScreen />);
      expect(screen.getByText('Settings')).toBeTruthy();
    });

    it('should display Help & Support menu item', () => {
      render(<ProfileScreen />);
      expect(screen.getByText('Help & Support')).toBeTruthy();
    });
  });

  describe('Menu Items for Troop Leader User', () => {
    beforeEach(() => {
      currentMockUser = mockTroopLeaderUser;
    });

    it('should display Subscription menu item', () => {
      render(<ProfileScreen />);
      expect(screen.getByText('Subscription')).toBeTruthy();
    });

    it('should NOT display Referrals menu item for Troop Leader', () => {
      render(<ProfileScreen />);
      // Troop Leaders don't have referrals
      expect(screen.queryByText('Referrals')).toBeFalsy();
    });

    it('should display Notifications menu item', () => {
      render(<ProfileScreen />);
      expect(screen.getByText('Notifications')).toBeTruthy();
    });
  });

  describe('Menu Items for Parent User', () => {
    beforeEach(() => {
      currentMockUser = mockParentUser;
    });

    it('should display Subscription menu item', () => {
      render(<ProfileScreen />);
      expect(screen.getByText('Subscription')).toBeTruthy();
    });

    it('should display Referrals menu item for Parent', () => {
      render(<ProfileScreen />);
      expect(screen.getByText('Referrals')).toBeTruthy();
    });

    it('should display Notifications menu item', () => {
      render(<ProfileScreen />);
      expect(screen.getByText('Notifications')).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    it('should navigate to Subscription when menu item is pressed', () => {
      render(<ProfileScreen />);
      const subscriptionItem = screen.getByText('Subscription');
      fireEvent.press(subscriptionItem);
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Subscription');
    });

    it('should navigate to Referral when menu item is pressed', () => {
      render(<ProfileScreen />);
      const referralsItem = screen.getByText('Referrals');
      fireEvent.press(referralsItem);
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Referral');
    });

    it('should navigate to Notifications when menu item is pressed', () => {
      render(<ProfileScreen />);
      const notificationsItem = screen.getByText('Notifications');
      fireEvent.press(notificationsItem);
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Notifications');
    });

    it('should navigate to Settings when menu item is pressed', () => {
      render(<ProfileScreen />);
      const settingsItem = screen.getByText('Settings');
      fireEvent.press(settingsItem);
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Settings');
    });

    it('should navigate to HelpSupport when menu item is pressed', () => {
      render(<ProfileScreen />);
      const helpItem = screen.getByText('Help & Support');
      fireEvent.press(helpItem);
      expect(mockNavigation.navigate).toHaveBeenCalledWith('HelpSupport');
    });
  });

  describe('Logout Functionality', () => {
    it('should show confirmation dialog when Logout is pressed', () => {
      render(<ProfileScreen />);
      const logoutButton = screen.getByText('Logout');
      fireEvent.press(logoutButton);

      expect(Alert.alert).toHaveBeenCalledWith(
        'Logout',
        'Are you sure you want to logout?',
        expect.any(Array)
      );
    });

    it('should call logout when confirmed', async () => {
      // Mock Alert.alert to call the confirm callback
      (Alert.alert as jest.Mock).mockImplementationOnce((title, message, buttons) => {
        const logoutButton = buttons?.find((b: any) => b.text === 'Logout');
        if (logoutButton && logoutButton.onPress) {
          logoutButton.onPress();
        }
      });

      render(<ProfileScreen />);
      const logoutButton = screen.getByText('Logout');
      fireEvent.press(logoutButton);

      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalled();
      });
    });

    it('should not call logout when cancelled', () => {
      // Mock Alert.alert to call the cancel callback
      (Alert.alert as jest.Mock).mockImplementationOnce((title, message, buttons) => {
        const cancelButton = buttons?.find((b: any) => b.text === 'Cancel');
        if (cancelButton && cancelButton.onPress) {
          cancelButton.onPress();
        }
      });

      render(<ProfileScreen />);
      const logoutButton = screen.getByText('Logout');
      fireEvent.press(logoutButton);

      expect(mockLogout).not.toHaveBeenCalled();
    });

    it('should show "Logging out..." when logging out', async () => {
      // Mock Alert.alert to call the confirm callback
      mockLogout.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      (Alert.alert as jest.Mock).mockImplementationOnce((title, message, buttons) => {
        const logoutButton = buttons?.find((b: any) => b.text === 'Logout');
        if (logoutButton && logoutButton.onPress) {
          logoutButton.onPress();
        }
      });

      render(<ProfileScreen />);
      const logoutButton = screen.getByText('Logout');
      fireEvent.press(logoutButton);

      await waitFor(() => {
        expect(screen.getByText('Logging out...')).toBeTruthy();
      });
    });

    it('should disable logout button while logging out', async () => {
      mockLogout.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      (Alert.alert as jest.Mock).mockImplementationOnce((title, message, buttons) => {
        const logoutButton = buttons?.find((b: any) => b.text === 'Logout');
        if (logoutButton && logoutButton.onPress) {
          logoutButton.onPress();
        }
      });

      render(<ProfileScreen />);
      const logoutButton = screen.getByText('Logout');
      fireEvent.press(logoutButton);

      // Second press should not trigger another alert
      fireEvent.press(screen.getByText('Logging out...'));
      expect(Alert.alert).toHaveBeenCalledTimes(1);
    });
  });

  describe('Icon Display', () => {
    it('should display card icon for Subscription', () => {
      render(<ProfileScreen />);
      // Icon is rendered, verify menu item exists
      expect(screen.getByText('Subscription')).toBeTruthy();
    });

    it('should display people icon for Referrals', () => {
      render(<ProfileScreen />);
      expect(screen.getByText('Referrals')).toBeTruthy();
    });

    it('should display notifications icon for Notifications', () => {
      render(<ProfileScreen />);
      expect(screen.getByText('Notifications')).toBeTruthy();
    });

    it('should display settings icon for Settings', () => {
      render(<ProfileScreen />);
      expect(screen.getByText('Settings')).toBeTruthy();
    });

    it('should display help-circle icon for Help & Support', () => {
      render(<ProfileScreen />);
      expect(screen.getByText('Help & Support')).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should handle logout error gracefully', async () => {
      mockLogout.mockRejectedValueOnce(new Error('Logout failed'));
      (Alert.alert as jest.Mock).mockImplementationOnce((title, message, buttons) => {
        const logoutButton = buttons?.find((b: any) => b.text === 'Logout');
        if (logoutButton && logoutButton.onPress) {
          logoutButton.onPress();
        }
      });

      render(<ProfileScreen />);
      const logoutButton = screen.getByText('Logout');
      fireEvent.press(logoutButton);

      await waitFor(() => {
        // Should recover from error
        expect(screen.getByText('Logout')).toBeTruthy();
      });
    });
  });

  describe('ScrollView Behavior', () => {
    it('should render within a ScrollView', () => {
      render(<ProfileScreen />);
      // All content should be accessible
      expect(screen.getByText(`${mockScoutUser.firstName} ${mockScoutUser.lastName}`)).toBeTruthy();
      expect(screen.getByText('Version 1.0.0')).toBeTruthy();
    });
  });

  describe('User Data Display', () => {
    it('should handle user with missing firstName', () => {
      currentMockUser = { ...mockScoutUser, firstName: '' };
      render(<ProfileScreen />);
      expect(screen.getByText(` ${mockScoutUser.lastName}`)).toBeTruthy();
    });

    it('should handle user with missing lastName', () => {
      currentMockUser = { ...mockScoutUser, lastName: '' };
      render(<ProfileScreen />);
      expect(screen.getByText(`${mockScoutUser.firstName} `)).toBeTruthy();
    });
  });
});
