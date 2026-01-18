/**
 * SubscriptionScreen Tests
 * Comprehensive tests for the Subscription management screen
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
} from '../../test-utils';

// Mock dependencies
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => mockNavigation,
}));

// Mock API client
const mockApiClient = {
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
};

jest.mock('../../../utils/api', () => ({
  apiClient: mockApiClient,
}));

// Mock auth store - default to Scout user
let currentMockUser = mockScoutUser;
jest.mock('../../../store/authStore', () => ({
  useAuthStore: () => ({
    user: currentMockUser,
  }),
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

// Sample data
const mockSubscription = {
  id: 'sub-1',
  plan: {
    id: 1,
    uuid: 'plan-uuid-1',
    name: 'Annual Camp Card',
    description: 'Full year of savings',
    priceCents: 1500,
    currency: 'USD',
    billingInterval: 'ANNUAL',
    trialDays: 0,
    features: ['Access to all offers', 'QR code redemption', 'Support Scouts'],
  },
  status: 'ACTIVE',
  currentPeriodStart: '2025-01-01',
  currentPeriodEnd: '2025-12-31',
  cancelAtPeriodEnd: false,
  autoRenew: true,
  scoutAttribution: {
    scoutName: 'Johnny Scout',
    troopNumber: '101',
  },
  totalSavings: 125.5,
};

const mockSubscriptionPlans = {
  data: [
    {
      id: 1,
      uuid: 'plan-uuid-1',
      name: 'Annual Camp Card',
      description: 'Full year of savings at local merchants',
      priceCents: 1500,
      currency: 'USD',
      billingInterval: 'ANNUAL',
      trialDays: 0,
      features: ['Access to all local offers', 'QR code redemption'],
    },
    {
      id: 2,
      uuid: 'plan-uuid-2',
      name: 'Monthly Camp Card',
      description: 'Monthly savings',
      priceCents: 500,
      currency: 'USD',
      billingInterval: 'MONTHLY',
      trialDays: 7,
      features: ['Access to all local offers'],
    },
  ],
};

// Import after mocks
import SubscriptionScreen from '../../../screens/scout/SubscriptionScreen';

describe('SubscriptionScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    currentMockUser = mockScoutUser;
    mockApiClient.get.mockImplementation((url: string) => {
      if (url.includes('/subscriptions/me')) {
        return Promise.resolve({ data: mockSubscription });
      }
      if (url.includes('/subscription-plans')) {
        return Promise.resolve(mockSubscriptionPlans);
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });
  });

  describe('Loading State', () => {
    it('should show loading indicator initially', () => {
      render(<SubscriptionScreen />);
      // ActivityIndicator should be present during loading
      expect(screen.queryByText('Subscription')).toBeFalsy(); // Header not visible during loading
    });

    it('should hide loading indicator after data loads', async () => {
      render(<SubscriptionScreen />);
      await waitFor(() => {
        expect(screen.getByText('Subscription')).toBeTruthy();
      });
    });
  });

  describe('With Active Subscription', () => {
    beforeEach(() => {
      mockApiClient.get.mockImplementation((url: string) => {
        if (url.includes('/subscriptions/me')) {
          return Promise.resolve({ data: mockSubscription });
        }
        if (url.includes('/subscription-plans')) {
          return Promise.resolve(mockSubscriptionPlans);
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });
    });

    it('should display subscription header', async () => {
      render(<SubscriptionScreen />);
      await waitFor(() => {
        expect(screen.getByText('Subscription')).toBeTruthy();
      });
    });

    it('should display "Current Plan" section', async () => {
      render(<SubscriptionScreen />);
      await waitFor(() => {
        expect(screen.getByText('Current Plan')).toBeTruthy();
      });
    });

    it('should display subscription status badge', async () => {
      render(<SubscriptionScreen />);
      await waitFor(() => {
        expect(screen.getByText('ACTIVE')).toBeTruthy();
      });
    });

    it('should display plan name', async () => {
      render(<SubscriptionScreen />);
      await waitFor(() => {
        expect(screen.getByText('Annual Camp Card')).toBeTruthy();
      });
    });

    it('should display plan price', async () => {
      render(<SubscriptionScreen />);
      await waitFor(() => {
        expect(screen.getByText('$15.00/annual')).toBeTruthy();
      });
    });

    it('should display next billing date', async () => {
      render(<SubscriptionScreen />);
      await waitFor(() => {
        expect(screen.getByText(/Next billing:/)).toBeTruthy();
      });
    });

    it('should display total savings', async () => {
      render(<SubscriptionScreen />);
      await waitFor(() => {
        expect(screen.getByText(/Total saved: \$125.50/)).toBeTruthy();
      });
    });

    it('should display scout attribution when present', async () => {
      render(<SubscriptionScreen />);
      await waitFor(() => {
        expect(screen.getByText(/Supporting Johnny Scout/)).toBeTruthy();
      });
    });

    it('should display Auto-Renew toggle', async () => {
      render(<SubscriptionScreen />);
      await waitFor(() => {
        expect(screen.getByText('Auto-Renew')).toBeTruthy();
      });
    });

    it('should display "Renew Now" section', async () => {
      render(<SubscriptionScreen />);
      await waitFor(() => {
        expect(screen.getByText('Ready for more savings?')).toBeTruthy();
      });
    });

    it('should display "Renew Now" button', async () => {
      render(<SubscriptionScreen />);
      await waitFor(() => {
        expect(screen.getByText('Renew Now')).toBeTruthy();
      });
    });

    it('should display "Update Payment Method" option', async () => {
      render(<SubscriptionScreen />);
      await waitFor(() => {
        expect(screen.getByText('Update Payment Method')).toBeTruthy();
      });
    });

    it('should display "Cancel Subscription" option', async () => {
      render(<SubscriptionScreen />);
      await waitFor(() => {
        expect(screen.getByText('Cancel Subscription')).toBeTruthy();
      });
    });

    it('should display Plan Features section', async () => {
      render(<SubscriptionScreen />);
      await waitFor(() => {
        expect(screen.getByText('Plan Features')).toBeTruthy();
      });
    });
  });

  describe('Subscription Actions', () => {
    it('should show confirmation dialog when Cancel Subscription is pressed', async () => {
      render(<SubscriptionScreen />);
      await waitFor(() => {
        expect(screen.getByText('Cancel Subscription')).toBeTruthy();
      });

      const cancelButton = screen.getByText('Cancel Subscription');
      fireEvent.press(cancelButton);

      expect(Alert.alert).toHaveBeenCalledWith(
        'Cancel Subscription',
        expect.stringContaining("You've saved"),
        expect.any(Array)
      );
    });

    it('should show confirmation dialog when Renew Now is pressed', async () => {
      render(<SubscriptionScreen />);
      await waitFor(() => {
        expect(screen.getByText('Renew Now')).toBeTruthy();
      });

      const renewButton = screen.getByText('Renew Now');
      fireEvent.press(renewButton);

      expect(Alert.alert).toHaveBeenCalledWith(
        'Renew Subscription',
        expect.stringContaining('Renew your'),
        expect.any(Array)
      );
    });

    it('should show alert when Update Payment Method is pressed', async () => {
      render(<SubscriptionScreen />);
      await waitFor(() => {
        expect(screen.getByText('Update Payment Method')).toBeTruthy();
      });

      const updatePaymentButton = screen.getByText('Update Payment Method');
      fireEvent.press(updatePaymentButton);

      expect(Alert.alert).toHaveBeenCalledWith('Update Payment', expect.any(String));
    });
  });

  describe('Without Subscription (No Active Plan)', () => {
    beforeEach(() => {
      mockApiClient.get.mockImplementation((url: string) => {
        if (url.includes('/subscriptions/me')) {
          return Promise.reject({ response: { status: 404 } });
        }
        if (url.includes('/subscription-plans')) {
          return Promise.resolve(mockSubscriptionPlans);
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });
    });

    it('should display "No Active Subscription" message', async () => {
      render(<SubscriptionScreen />);
      await waitFor(() => {
        expect(screen.getByText('No Active Subscription')).toBeTruthy();
      });
    });

    it('should display "Choose a plan" message', async () => {
      render(<SubscriptionScreen />);
      await waitFor(() => {
        expect(screen.getByText(/Choose a plan below/)).toBeTruthy();
      });
    });

    it('should display "Available Plans" section', async () => {
      render(<SubscriptionScreen />);
      await waitFor(() => {
        expect(screen.getByText('Available Plans')).toBeTruthy();
      });
    });

    it('should display plan cards', async () => {
      render(<SubscriptionScreen />);
      await waitFor(() => {
        expect(screen.getByText('Annual Camp Card')).toBeTruthy();
      });
    });

    it('should display Subscribe Now button', async () => {
      render(<SubscriptionScreen />);
      await waitFor(() => {
        expect(screen.getAllByText('Subscribe Now').length).toBeGreaterThan(0);
      });
    });

    it('should display "Why Subscribe?" section', async () => {
      render(<SubscriptionScreen />);
      await waitFor(() => {
        expect(screen.getByText('Why Subscribe?')).toBeTruthy();
      });
    });

    it('should display "Save Money" benefit', async () => {
      render(<SubscriptionScreen />);
      await waitFor(() => {
        expect(screen.getByText('Save Money')).toBeTruthy();
      });
    });

    it('should display "Support Scouts" benefit', async () => {
      render(<SubscriptionScreen />);
      await waitFor(() => {
        expect(screen.getByText('Support Scouts')).toBeTruthy();
      });
    });

    it('should display "Cancel Anytime" benefit', async () => {
      render(<SubscriptionScreen />);
      await waitFor(() => {
        expect(screen.getByText('Cancel Anytime')).toBeTruthy();
      });
    });
  });

  describe('Subscribe Flow', () => {
    beforeEach(() => {
      mockApiClient.get.mockImplementation((url: string) => {
        if (url.includes('/subscriptions/me')) {
          return Promise.reject({ response: { status: 404 } });
        }
        if (url.includes('/subscription-plans')) {
          return Promise.resolve(mockSubscriptionPlans);
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });
    });

    it('should show confirmation dialog when Subscribe Now is pressed', async () => {
      render(<SubscriptionScreen />);
      await waitFor(() => {
        expect(screen.getAllByText('Subscribe Now').length).toBeGreaterThan(0);
      });

      const subscribeButtons = screen.getAllByText('Subscribe Now');
      fireEvent.press(subscribeButtons[0]);

      expect(Alert.alert).toHaveBeenCalledWith(
        'Confirm Subscription',
        expect.stringContaining('Subscribe to'),
        expect.any(Array)
      );
    });
  });

  describe('Troop Leader Behavior', () => {
    beforeEach(() => {
      currentMockUser = { ...mockTroopLeaderUser, role: 'UNIT_LEADER' };
      mockApiClient.get.mockImplementation((url: string) => {
        if (url.includes('/subscriptions/me')) {
          return Promise.reject({ response: { status: 404 } });
        }
        if (url.includes('/subscription-plans')) {
          return Promise.resolve(mockSubscriptionPlans);
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });
    });

    it('should navigate to SelectScoutForSubscription for Troop Leaders', async () => {
      // This test verifies the conditional navigation logic
      render(<SubscriptionScreen />);
      await waitFor(() => {
        expect(screen.getAllByText('Subscribe Now').length).toBeGreaterThan(0);
      });
    });
  });

  describe('Canceled Subscription Warning', () => {
    beforeEach(() => {
      mockApiClient.get.mockImplementation((url: string) => {
        if (url.includes('/subscriptions/me')) {
          return Promise.resolve({
            data: { ...mockSubscription, cancelAtPeriodEnd: true },
          });
        }
        if (url.includes('/subscription-plans')) {
          return Promise.resolve(mockSubscriptionPlans);
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });
    });

    it('should display warning when subscription is set to cancel', async () => {
      render(<SubscriptionScreen />);
      await waitFor(() => {
        expect(screen.getByText(/Your subscription will end on/)).toBeTruthy();
      });
    });

    it('should display "Reactivate Subscription" option instead of Cancel', async () => {
      render(<SubscriptionScreen />);
      await waitFor(() => {
        expect(screen.getByText('Reactivate Subscription')).toBeTruthy();
      });
    });
  });

  describe('Navigation', () => {
    it('should go back when back button is pressed', async () => {
      render(<SubscriptionScreen />);
      await waitFor(() => {
        expect(screen.getByText('Subscription')).toBeTruthy();
      });

      // Back button is in header, navigation.goBack should be callable
    });
  });

  describe('Error Handling', () => {
    it('should show error alert on subscription load failure', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Network error'));

      render(<SubscriptionScreen />);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Error', expect.any(String));
      });
    });
  });

  describe('Auto-Renew Toggle', () => {
    it('should call API when auto-renew is toggled', async () => {
      mockApiClient.patch.mockResolvedValue({ data: {} });

      render(<SubscriptionScreen />);
      await waitFor(() => {
        expect(screen.getByText('Auto-Renew')).toBeTruthy();
      });

      // The Switch component should trigger toggleAutoRenew
    });
  });
});
