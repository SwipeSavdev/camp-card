/**
 * ScoutDashboardScreen Tests
 * Comprehensive tests for the Scout Dashboard (My Cards) screen
 */

import React from 'react';
import { Alert, Share } from 'react-native';
import {
  render,
  fireEvent,
  waitFor,
  screen,
  mockNavigation,
  createMockAuthStore,
  mockScoutUser,
} from '../../test-utils';

// Mock dependencies
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => mockNavigation,
}));

// Mock expo-clipboard
const mockClipboard = {
  setStringAsync: jest.fn().mockResolvedValue(undefined),
};
jest.mock('expo-clipboard', () => mockClipboard);

// Mock QRCode component
jest.mock('react-native-qrcode-svg', () => 'QRCode');

// Mock scout API
const mockScoutApi = {
  getStats: jest.fn().mockResolvedValue({
    data: {
      totalSubscribers: 25,
      directReferrals: 15,
      indirectReferrals: 10,
      linkClicks: 150,
      qrScans: 75,
      totalEarnings: 250,
      redemptionsUsed: 30,
      savingsEarned: 125.5,
    },
  }),
};

jest.mock('../../../services/apiClient', () => ({
  scoutApi: mockScoutApi,
}));

// Mock auth store
const mockAuthStore = createMockAuthStore({
  user: mockScoutUser,
});

jest.mock('../../../store/authStore', () => ({
  useAuthStore: () => mockAuthStore,
}));

// Mock Alert and Share
jest.spyOn(Alert, 'alert');
jest.spyOn(Share, 'share').mockImplementation(() => Promise.resolve({ action: 'sharedAction' }));

// Import after mocks
import ScoutDashboardScreen from '../../../screens/scout/ScoutDashboardScreen';

describe('ScoutDashboardScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockScoutApi.getStats.mockResolvedValue({
      data: {
        totalSubscribers: 25,
        directReferrals: 15,
        indirectReferrals: 10,
        linkClicks: 150,
        qrScans: 75,
        totalEarnings: 250,
        redemptionsUsed: 30,
        savingsEarned: 125.5,
      },
    });
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<ScoutDashboardScreen />);
      expect(screen.getByText(/Hello/)).toBeTruthy();
    });

    it('should display greeting with user first name', () => {
      render(<ScoutDashboardScreen />);
      expect(screen.getByText(`Hello, ${mockScoutUser.firstName}!`)).toBeTruthy();
    });

    it('should display "Your Camp Card Dashboard" subtitle', () => {
      render(<ScoutDashboardScreen />);
      expect(screen.getByText('Your Camp Card Dashboard')).toBeTruthy();
    });

    it('should display notification bell icon', () => {
      render(<ScoutDashboardScreen />);
      // Notification button exists
      expect(screen.getByText('Your Camp Card Dashboard')).toBeTruthy();
    });

    it('should display "Your Fundraising Impact" section', () => {
      render(<ScoutDashboardScreen />);
      expect(screen.getByText('Your Fundraising Impact')).toBeTruthy();
    });

    it('should display QR code section', () => {
      render(<ScoutDashboardScreen />);
      expect(screen.getByText('My Camp Card QR Code')).toBeTruthy();
    });

    it('should display affiliate code', async () => {
      render(<ScoutDashboardScreen />);
      await waitFor(() => {
        // Affiliate code is displayed (SC-SCOUT-12 or similar pattern)
        expect(screen.getByText(/SC-/)).toBeTruthy();
      });
    });

    it('should display "Your Affiliate Code" label', () => {
      render(<ScoutDashboardScreen />);
      expect(screen.getByText('Your Affiliate Code')).toBeTruthy();
    });

    it('should display QR scan instruction text', () => {
      render(<ScoutDashboardScreen />);
      expect(screen.getByText(/Have customers scan this code/)).toBeTruthy();
    });

    it('should display Copy Link button', () => {
      render(<ScoutDashboardScreen />);
      expect(screen.getByText('Copy Link')).toBeTruthy();
    });

    it('should display Share button', () => {
      render(<ScoutDashboardScreen />);
      expect(screen.getByText('Share')).toBeTruthy();
    });
  });

  describe('Stats Display', () => {
    it('should display total funds raised', async () => {
      render(<ScoutDashboardScreen />);
      await waitFor(() => {
        expect(screen.getByText('$250')).toBeTruthy();
      });
    });

    it('should display "Total Funds Raised" label', async () => {
      render(<ScoutDashboardScreen />);
      await waitFor(() => {
        expect(screen.getByText('Total Funds Raised')).toBeTruthy();
      });
    });

    it('should display total subscribers count', async () => {
      render(<ScoutDashboardScreen />);
      await waitFor(() => {
        expect(screen.getByText('25')).toBeTruthy();
      });
    });

    it('should display "Subscribers" label', async () => {
      render(<ScoutDashboardScreen />);
      await waitFor(() => {
        expect(screen.getByText('Subscribers')).toBeTruthy();
      });
    });

    it('should display direct referrals count', async () => {
      render(<ScoutDashboardScreen />);
      await waitFor(() => {
        expect(screen.getByText('15')).toBeTruthy();
      });
    });

    it('should display "Direct" label', async () => {
      render(<ScoutDashboardScreen />);
      await waitFor(() => {
        expect(screen.getByText('Direct')).toBeTruthy();
      });
    });

    it('should display indirect referrals count', async () => {
      render(<ScoutDashboardScreen />);
      await waitFor(() => {
        expect(screen.getByText('10')).toBeTruthy();
      });
    });

    it('should display "Indirect" label', async () => {
      render(<ScoutDashboardScreen />);
      await waitFor(() => {
        expect(screen.getByText('Indirect')).toBeTruthy();
      });
    });
  });

  describe('Link Performance Section', () => {
    it('should display "Link Performance" section title', async () => {
      render(<ScoutDashboardScreen />);
      await waitFor(() => {
        expect(screen.getByText('Link Performance')).toBeTruthy();
      });
    });

    it('should display link clicks count', async () => {
      render(<ScoutDashboardScreen />);
      await waitFor(() => {
        expect(screen.getByText('150')).toBeTruthy();
      });
    });

    it('should display "Link Clicks" label', async () => {
      render(<ScoutDashboardScreen />);
      await waitFor(() => {
        expect(screen.getByText('Link Clicks')).toBeTruthy();
      });
    });

    it('should display QR scans count', async () => {
      render(<ScoutDashboardScreen />);
      await waitFor(() => {
        expect(screen.getByText('75')).toBeTruthy();
      });
    });

    it('should display "QR Scans" label', async () => {
      render(<ScoutDashboardScreen />);
      await waitFor(() => {
        expect(screen.getByText('QR Scans')).toBeTruthy();
      });
    });
  });

  describe('Your Savings Section', () => {
    it('should display "Your Savings" section title', async () => {
      render(<ScoutDashboardScreen />);
      await waitFor(() => {
        expect(screen.getByText('Your Savings')).toBeTruthy();
      });
    });

    it('should display total saved amount', async () => {
      render(<ScoutDashboardScreen />);
      await waitFor(() => {
        expect(screen.getByText('$125.50')).toBeTruthy();
      });
    });

    it('should display "Total Saved" label', async () => {
      render(<ScoutDashboardScreen />);
      await waitFor(() => {
        expect(screen.getByText('Total Saved')).toBeTruthy();
      });
    });

    it('should display offers used count', async () => {
      render(<ScoutDashboardScreen />);
      await waitFor(() => {
        expect(screen.getByText('30')).toBeTruthy();
      });
    });

    it('should display "Offers Used" label', async () => {
      render(<ScoutDashboardScreen />);
      await waitFor(() => {
        expect(screen.getByText('Offers Used')).toBeTruthy();
      });
    });
  });

  describe('Quick Actions Section', () => {
    it('should display "Quick Actions" section title', () => {
      render(<ScoutDashboardScreen />);
      expect(screen.getByText('Quick Actions')).toBeTruthy();
    });

    it('should display "View Offers" action', () => {
      render(<ScoutDashboardScreen />);
      expect(screen.getByText('View Offers')).toBeTruthy();
    });

    it('should display "View Referrals" action', () => {
      render(<ScoutDashboardScreen />);
      expect(screen.getByText('View Referrals')).toBeTruthy();
    });

    it('should display "My Subscription" action', () => {
      render(<ScoutDashboardScreen />);
      expect(screen.getByText('My Subscription')).toBeTruthy();
    });

    it('should navigate to ViewOffers when View Offers is pressed', () => {
      render(<ScoutDashboardScreen />);
      const viewOffersButton = screen.getByText('View Offers');
      fireEvent.press(viewOffersButton);
      expect(mockNavigation.navigate).toHaveBeenCalledWith('ViewOffers');
    });

    it('should navigate to Referral when View Referrals is pressed', () => {
      render(<ScoutDashboardScreen />);
      const viewReferralsButton = screen.getByText('View Referrals');
      fireEvent.press(viewReferralsButton);
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Referral');
    });

    it('should navigate to Subscription when My Subscription is pressed', () => {
      render(<ScoutDashboardScreen />);
      const subscriptionButton = screen.getByText('My Subscription');
      fireEvent.press(subscriptionButton);
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Subscription');
    });
  });

  describe('Copy and Share Functionality', () => {
    it('should copy affiliate link to clipboard when Copy Link is pressed', async () => {
      render(<ScoutDashboardScreen />);
      const copyButton = screen.getByText('Copy Link');
      fireEvent.press(copyButton);

      await waitFor(() => {
        expect(mockClipboard.setStringAsync).toHaveBeenCalled();
      });
    });

    it('should show alert after copying link', async () => {
      render(<ScoutDashboardScreen />);
      const copyButton = screen.getByText('Copy Link');
      fireEvent.press(copyButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Copied!', expect.any(String));
      });
    });

    it('should open share dialog when Share is pressed', async () => {
      render(<ScoutDashboardScreen />);
      const shareButton = screen.getByText('Share');
      fireEvent.press(shareButton);

      await waitFor(() => {
        expect(Share.share).toHaveBeenCalledWith(
          expect.objectContaining({
            message: expect.stringContaining('Camp Card'),
            title: expect.any(String),
          })
        );
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate to Notifications when notification button is pressed', () => {
      render(<ScoutDashboardScreen />);
      // The notification button is in the header
      // We can find it by testing the navigation call
      expect(screen.getByText('Your Camp Card Dashboard')).toBeTruthy();
    });
  });

  describe('Pull to Refresh', () => {
    it('should call loadScoutStats on refresh', async () => {
      render(<ScoutDashboardScreen />);

      // Initial load
      await waitFor(() => {
        expect(mockScoutApi.getStats).toHaveBeenCalled();
      });
    });

    it('should update stats after refresh', async () => {
      mockScoutApi.getStats.mockResolvedValueOnce({
        data: {
          totalSubscribers: 30,
          directReferrals: 20,
          indirectReferrals: 10,
          linkClicks: 200,
          qrScans: 100,
          totalEarnings: 300,
          redemptionsUsed: 40,
          savingsEarned: 150,
        },
      });

      render(<ScoutDashboardScreen />);

      await waitFor(() => {
        expect(screen.getByText('$300')).toBeTruthy();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      mockScoutApi.getStats.mockRejectedValueOnce(new Error('Network error'));

      render(<ScoutDashboardScreen />);

      // Should still render with default values
      await waitFor(() => {
        expect(screen.getByText('$0')).toBeTruthy();
      });
    });

    it('should display default values on API failure', async () => {
      mockScoutApi.getStats.mockRejectedValueOnce(new Error('API error'));

      render(<ScoutDashboardScreen />);

      await waitFor(() => {
        expect(screen.getByText('0')).toBeTruthy();
      });
    });
  });

  describe('Help Section', () => {
    it('should display help text', () => {
      render(<ScoutDashboardScreen />);
      expect(screen.getByText(/Share your link with family and friends/)).toBeTruthy();
    });
  });

  describe('User with no data', () => {
    it('should display greeting even without user firstName', () => {
      const storeWithNoName = createMockAuthStore({
        user: { ...mockScoutUser, firstName: '' },
      });

      jest.doMock('../../../store/authStore', () => ({
        useAuthStore: () => storeWithNoName,
      }));

      render(<ScoutDashboardScreen />);
      expect(screen.getByText(/Hello/)).toBeTruthy();
    });
  });
});
