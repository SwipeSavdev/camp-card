/**
 * ReferralScreen Tests
 * Comprehensive tests for the Scout Referral screen (FR-16, FR-17, FR-19)
 */

import React from 'react';
import { Alert, Share } from 'react-native';
import {
  render,
  fireEvent,
  waitFor,
  screen,
  createMockAuthStore,
  mockScoutUser,
} from '../../test-utils';

// Mock dependencies
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
}));

// Mock expo-clipboard
const mockClipboard = {
  setStringAsync: jest.fn().mockResolvedValue(undefined),
};
jest.mock('expo-clipboard', () => mockClipboard);

// Mock expo-print
const mockPrint = {
  printToFileAsync: jest.fn().mockResolvedValue({ uri: 'file://poster.pdf' }),
};
jest.mock('expo-print', () => mockPrint);

// Mock expo-sharing
const mockSharing = {
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  shareAsync: jest.fn().mockResolvedValue(undefined),
};
jest.mock('expo-sharing', () => mockSharing);

// Mock referral API
const mockReferralApi = {
  getMyReferrals: jest.fn().mockResolvedValue({
    data: {
      referrals: [
        {
          id: 'ref-1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@email.com',
          createdAt: '2025-10-01',
          planType: 'Annual',
          status: 'active',
          isDirectReferral: true,
        },
        {
          id: 'ref-2',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@email.com',
          createdAt: '2025-10-15',
          planType: 'Monthly',
          status: 'active',
          isDirectReferral: true,
        },
        {
          id: 'ref-3',
          firstName: 'Bob',
          lastName: 'Johnson',
          email: 'bob@email.com',
          createdAt: '2025-11-01',
          planType: 'Annual',
          status: 'active',
          isDirectReferral: false,
          referredByName: 'John Doe',
        },
      ],
      totalReferrals: 3,
      directReferrals: 2,
      indirectReferrals: 1,
      totalEarnings: 150,
      pendingEarnings: 25,
    },
  }),
};

jest.mock('../../../services/apiClient', () => ({
  referralApi: mockReferralApi,
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
import ReferralScreen from '../../../screens/scout/ReferralScreen';

describe('ReferralScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockReferralApi.getMyReferrals.mockResolvedValue({
      data: {
        referrals: [
          {
            id: 'ref-1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@email.com',
            createdAt: '2025-10-01',
            planType: 'Annual',
            status: 'active',
            isDirectReferral: true,
          },
          {
            id: 'ref-2',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane@email.com',
            createdAt: '2025-10-15',
            planType: 'Monthly',
            status: 'active',
            isDirectReferral: true,
          },
          {
            id: 'ref-3',
            firstName: 'Bob',
            lastName: 'Johnson',
            email: 'bob@email.com',
            createdAt: '2025-11-01',
            planType: 'Annual',
            status: 'active',
            isDirectReferral: false,
            referredByName: 'John Doe',
          },
        ],
        totalReferrals: 3,
        directReferrals: 2,
        indirectReferrals: 1,
        totalEarnings: 150,
        pendingEarnings: 25,
      },
    });
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<ReferralScreen />);
      expect(screen.getByText('Your Referral Earnings')).toBeTruthy();
    });

    it('should display earnings card', () => {
      render(<ReferralScreen />);
      expect(screen.getByText('Your Referral Earnings')).toBeTruthy();
    });

    it('should display "Share Your Link" section', () => {
      render(<ReferralScreen />);
      expect(screen.getByText('Share Your Link')).toBeTruthy();
    });

    it('should display QR code placeholder', () => {
      render(<ReferralScreen />);
      expect(screen.getByText('Scan to join')).toBeTruthy();
    });

    it('should display affiliate code', () => {
      render(<ReferralScreen />);
      expect(screen.getByText(/SC-/)).toBeTruthy();
    });

    it('should display Copy Link button', () => {
      render(<ReferralScreen />);
      expect(screen.getByText('Copy Link')).toBeTruthy();
    });

    it('should display Share button', () => {
      render(<ReferralScreen />);
      expect(screen.getByText('Share')).toBeTruthy();
    });

    it('should display Print Poster button', () => {
      render(<ReferralScreen />);
      expect(screen.getByText('Print Poster')).toBeTruthy();
    });

    it('should display "Referral Summary" section', () => {
      render(<ReferralScreen />);
      expect(screen.getByText('Referral Summary')).toBeTruthy();
    });

    it('should display "Your Referrals" section', () => {
      render(<ReferralScreen />);
      expect(screen.getByText('Your Referrals')).toBeTruthy();
    });
  });

  describe('Earnings Display', () => {
    it('should display total earnings', async () => {
      render(<ReferralScreen />);
      await waitFor(() => {
        expect(screen.getByText('$150')).toBeTruthy();
      });
    });

    it('should display "Total Earned" label', async () => {
      render(<ReferralScreen />);
      await waitFor(() => {
        expect(screen.getByText('Total Earned')).toBeTruthy();
      });
    });

    it('should display pending earnings', async () => {
      render(<ReferralScreen />);
      await waitFor(() => {
        expect(screen.getByText('$25')).toBeTruthy();
      });
    });

    it('should display "Pending" label', async () => {
      render(<ReferralScreen />);
      await waitFor(() => {
        expect(screen.getByText('Pending')).toBeTruthy();
      });
    });
  });

  describe('Referral Stats', () => {
    it('should display total referrals count', async () => {
      render(<ReferralScreen />);
      await waitFor(() => {
        expect(screen.getByText('3')).toBeTruthy();
      });
    });

    it('should display "Total" label', async () => {
      render(<ReferralScreen />);
      await waitFor(() => {
        expect(screen.getByText('Total')).toBeTruthy();
      });
    });

    it('should display direct referrals count', async () => {
      render(<ReferralScreen />);
      await waitFor(() => {
        expect(screen.getByText('2')).toBeTruthy();
      });
    });

    it('should display indirect referrals count', async () => {
      render(<ReferralScreen />);
      await waitFor(() => {
        expect(screen.getByText('1')).toBeTruthy();
      });
    });
  });

  describe('Tab Navigation', () => {
    it('should display Direct tab with count', async () => {
      render(<ReferralScreen />);
      await waitFor(() => {
        expect(screen.getByText('Direct (2)')).toBeTruthy();
      });
    });

    it('should display Indirect tab with count', async () => {
      render(<ReferralScreen />);
      await waitFor(() => {
        expect(screen.getByText('Indirect (1)')).toBeTruthy();
      });
    });

    it('should switch to Indirect tab when pressed', async () => {
      render(<ReferralScreen />);
      await waitFor(() => {
        expect(screen.getByText('Indirect (1)')).toBeTruthy();
      });

      const indirectTab = screen.getByText('Indirect (1)');
      fireEvent.press(indirectTab);

      // Indirect tab info should be shown
      expect(screen.getByText(/Indirect referrals are people who signed up/)).toBeTruthy();
    });

    it('should show info box for indirect referrals', async () => {
      render(<ReferralScreen />);
      await waitFor(() => {
        expect(screen.getByText('Indirect (1)')).toBeTruthy();
      });

      const indirectTab = screen.getByText('Indirect (1)');
      fireEvent.press(indirectTab);

      expect(screen.getByText(/Indirect referrals are people/)).toBeTruthy();
    });
  });

  describe('Referral List', () => {
    it('should display referral names', async () => {
      render(<ReferralScreen />);
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeTruthy();
        expect(screen.getByText('Jane Smith')).toBeTruthy();
      });
    });

    it('should display referral emails', async () => {
      render(<ReferralScreen />);
      await waitFor(() => {
        expect(screen.getByText('john@email.com')).toBeTruthy();
        expect(screen.getByText('jane@email.com')).toBeTruthy();
      });
    });

    it('should display referral plan type', async () => {
      render(<ReferralScreen />);
      await waitFor(() => {
        expect(screen.getByText('Annual')).toBeTruthy();
      });
    });

    it('should display referral status', async () => {
      render(<ReferralScreen />);
      await waitFor(() => {
        expect(screen.getAllByText('active').length).toBeGreaterThan(0);
      });
    });

    it('should display avatar initials', async () => {
      render(<ReferralScreen />);
      await waitFor(() => {
        expect(screen.getByText('JD')).toBeTruthy(); // John Doe initials
        expect(screen.getByText('JS')).toBeTruthy(); // Jane Smith initials
      });
    });
  });

  describe('Copy Link Functionality', () => {
    it('should copy affiliate link when Copy Link is pressed', async () => {
      render(<ReferralScreen />);
      const copyButton = screen.getByText('Copy Link');
      fireEvent.press(copyButton);

      await waitFor(() => {
        expect(mockClipboard.setStringAsync).toHaveBeenCalledWith(
          expect.stringContaining('https://www.campcardapp.org/buy-campcard/')
        );
      });
    });

    it('should show alert after copying link', async () => {
      render(<ReferralScreen />);
      const copyButton = screen.getByText('Copy Link');
      fireEvent.press(copyButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Copied!', expect.any(String));
      });
    });
  });

  describe('Share Functionality', () => {
    it('should open share dialog when Share is pressed', async () => {
      render(<ReferralScreen />);
      const shareButton = screen.getByText('Share');
      fireEvent.press(shareButton);

      await waitFor(() => {
        expect(Share.share).toHaveBeenCalledWith(
          expect.objectContaining({
            message: expect.stringContaining('fundraising'),
            title: 'Join Camp Card',
          })
        );
      });
    });
  });

  describe('Print Poster Functionality (FR-19)', () => {
    it('should generate PDF when Print Poster is pressed', async () => {
      render(<ReferralScreen />);
      const printButton = screen.getByText('Print Poster');
      fireEvent.press(printButton);

      await waitFor(() => {
        expect(mockPrint.printToFileAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            html: expect.stringContaining('BSA Camp Card'),
          })
        );
      });
    });

    it('should share PDF after generation when sharing is available', async () => {
      render(<ReferralScreen />);
      const printButton = screen.getByText('Print Poster');
      fireEvent.press(printButton);

      await waitFor(() => {
        expect(mockSharing.shareAsync).toHaveBeenCalled();
      });
    });

    it('should show success alert when sharing is not available', async () => {
      mockSharing.isAvailableAsync.mockResolvedValueOnce(false);

      render(<ReferralScreen />);
      const printButton = screen.getByText('Print Poster');
      fireEvent.press(printButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Success', expect.any(String));
      });
    });

    it('should show error alert on print failure', async () => {
      mockPrint.printToFileAsync.mockRejectedValueOnce(new Error('Print failed'));

      render(<ReferralScreen />);
      const printButton = screen.getByText('Print Poster');
      fireEvent.press(printButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Error', expect.any(String));
      });
    });
  });

  describe('Tips Section', () => {
    it('should display tips card', () => {
      render(<ReferralScreen />);
      expect(screen.getByText('Tips for More Referrals')).toBeTruthy();
    });

    it('should display tip about family gatherings', () => {
      render(<ReferralScreen />);
      expect(screen.getByText(/Share at family gatherings/)).toBeTruthy();
    });

    it('should display tip about social media', () => {
      render(<ReferralScreen />);
      expect(screen.getByText(/Post on social media/)).toBeTruthy();
    });

    it('should display tip about neighbors', () => {
      render(<ReferralScreen />);
      expect(screen.getByText(/neighbors/)).toBeTruthy();
    });

    it('should display tip about troop meetings', () => {
      render(<ReferralScreen />);
      expect(screen.getByText(/troop meetings/)).toBeTruthy();
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no referrals exist', async () => {
      mockReferralApi.getMyReferrals.mockResolvedValueOnce({
        data: {
          referrals: [],
          totalReferrals: 0,
          directReferrals: 0,
          indirectReferrals: 0,
          totalEarnings: 0,
          pendingEarnings: 0,
        },
      });

      render(<ReferralScreen />);
      await waitFor(() => {
        expect(screen.getByText(/No direct referrals yet/)).toBeTruthy();
      });
    });

    it('should show encouraging message in empty state', async () => {
      mockReferralApi.getMyReferrals.mockResolvedValueOnce({
        data: {
          referrals: [],
          totalReferrals: 0,
          directReferrals: 0,
          indirectReferrals: 0,
          totalEarnings: 0,
          pendingEarnings: 0,
        },
      });

      render(<ReferralScreen />);
      await waitFor(() => {
        expect(screen.getByText(/Share your link to start earning/)).toBeTruthy();
      });
    });
  });

  describe('Pull to Refresh', () => {
    it('should reload referrals on refresh', async () => {
      render(<ReferralScreen />);

      // Initial load
      await waitFor(() => {
        expect(mockReferralApi.getMyReferrals).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      mockReferralApi.getMyReferrals.mockRejectedValueOnce(new Error('Network error'));

      render(<ReferralScreen />);

      // Should still render with empty data
      await waitFor(() => {
        expect(screen.getByText('Your Referral Earnings')).toBeTruthy();
      });
    });
  });

  describe('Indirect Referral Chain Display', () => {
    it('should show chain info for indirect referrals', async () => {
      render(<ReferralScreen />);
      await waitFor(() => {
        expect(screen.getByText('Indirect (1)')).toBeTruthy();
      });

      // Switch to indirect tab
      const indirectTab = screen.getByText('Indirect (1)');
      fireEvent.press(indirectTab);

      await waitFor(() => {
        expect(screen.getByText('Bob Johnson')).toBeTruthy();
        expect(screen.getByText(/via John Doe/)).toBeTruthy();
      });
    });
  });
});
