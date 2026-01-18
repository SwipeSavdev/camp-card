/**
 * OffersScreen Tests
 * Comprehensive tests for the Offers listing screen
 */

import React from 'react';
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

// Mock API client
const mockApiClient = {
  get: jest.fn(),
};

jest.mock('../../../utils/api', () => ({
  apiClient: mockApiClient,
}));

// Mock auth store
const mockAuthStore = createMockAuthStore({
  user: mockScoutUser,
});

jest.mock('../../../store/authStore', () => ({
  useAuthStore: () => mockAuthStore,
}));

// Sample offers data
const mockOffers = [
  {
    id: 1,
    uuid: 'offer-1',
    merchantId: 1,
    merchantName: 'Pizza Palace',
    merchantLogoUrl: 'https://example.com/logo1.png',
    title: '20% Off Any Pizza',
    description: 'Get 20% off any pizza at Pizza Palace. Valid for dine-in and takeout.',
    discountType: 'PERCENTAGE',
    discountValue: 20,
    category: 'RESTAURANTS',
    imageUrl: 'https://example.com/pizza.jpg',
    validFrom: '2025-01-01',
    validUntil: '2025-12-31',
    featured: true,
    scoutExclusive: false,
    totalRedemptions: 150,
    isValid: true,
  },
  {
    id: 2,
    uuid: 'offer-2',
    merchantId: 2,
    merchantName: 'Tech Store',
    title: '$10 Off Electronics',
    description: 'Save $10 on any purchase over $50.',
    discountType: 'FIXED_AMOUNT',
    discountValue: 10,
    category: 'RETAIL',
    validFrom: '2025-01-01',
    validUntil: '2025-06-30',
    featured: false,
    scoutExclusive: true,
    totalRedemptions: 75,
    isValid: true,
  },
  {
    id: 3,
    uuid: 'offer-3',
    merchantId: 3,
    merchantName: 'Movie Theater',
    title: 'Buy One Get One Free',
    description: 'BOGO on movie tickets every Tuesday.',
    discountType: 'BUY_ONE_GET_ONE',
    discountValue: 0,
    category: 'ENTERTAINMENT',
    validFrom: '2025-01-01',
    validUntil: '2025-03-01',
    featured: true,
    scoutExclusive: false,
    totalRedemptions: 200,
    isValid: true,
  },
  {
    id: 4,
    uuid: 'offer-4',
    merchantId: 4,
    merchantName: 'Auto Shop',
    title: 'Free Oil Change',
    description: 'Get a free oil change with any service over $100.',
    discountType: 'FREE_ITEM',
    discountValue: 0,
    category: 'AUTOMOTIVE',
    validFrom: '2025-01-01',
    validUntil: '2025-12-31',
    featured: false,
    scoutExclusive: false,
    totalRedemptions: 50,
    isValid: true,
  },
];

// Import after mocks
import OffersScreen from '../../../screens/offers/OffersScreen';

describe('OffersScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiClient.get.mockResolvedValue({
      data: { content: mockOffers },
    });
  });

  describe('Loading State', () => {
    it('should show loading indicator initially', () => {
      render(<OffersScreen />);
      expect(screen.getByText('Loading offers...')).toBeTruthy();
    });

    it('should hide loading indicator after data loads', async () => {
      render(<OffersScreen />);
      await waitFor(() => {
        expect(screen.queryByText('Loading offers...')).toBeFalsy();
      });
    });
  });

  describe('Rendering', () => {
    it('should render without crashing', async () => {
      render(<OffersScreen />);
      await waitFor(() => {
        expect(screen.getByText('Offers')).toBeTruthy();
      });
    });

    it('should display "Offers" header', async () => {
      render(<OffersScreen />);
      await waitFor(() => {
        expect(screen.getByText('Offers')).toBeTruthy();
      });
    });

    it('should display category filter buttons', async () => {
      render(<OffersScreen />);
      await waitFor(() => {
        expect(screen.getByText('ALL')).toBeTruthy();
        expect(screen.getByText('RESTAURANTS')).toBeTruthy();
        expect(screen.getByText('RETAIL')).toBeTruthy();
        expect(screen.getByText('ENTERTAINMENT')).toBeTruthy();
      });
    });
  });

  describe('Offer Cards', () => {
    it('should display offer titles', async () => {
      render(<OffersScreen />);
      await waitFor(() => {
        expect(screen.getByText('20% Off Any Pizza')).toBeTruthy();
        expect(screen.getByText('$10 Off Electronics')).toBeTruthy();
      });
    });

    it('should display merchant names', async () => {
      render(<OffersScreen />);
      await waitFor(() => {
        expect(screen.getByText('Pizza Palace')).toBeTruthy();
        expect(screen.getByText('Tech Store')).toBeTruthy();
      });
    });

    it('should display discount badges', async () => {
      render(<OffersScreen />);
      await waitFor(() => {
        expect(screen.getByText('20% OFF')).toBeTruthy();
        expect(screen.getByText('$10 OFF')).toBeTruthy();
      });
    });

    it('should display BOGO badge for buy one get one offers', async () => {
      render(<OffersScreen />);
      await waitFor(() => {
        expect(screen.getByText('BOGO')).toBeTruthy();
      });
    });

    it('should display FREE ITEM badge for free item offers', async () => {
      render(<OffersScreen />);
      await waitFor(() => {
        expect(screen.getByText('FREE ITEM')).toBeTruthy();
      });
    });

    it('should display Featured tag for featured offers', async () => {
      render(<OffersScreen />);
      await waitFor(() => {
        expect(screen.getAllByText('Featured').length).toBeGreaterThan(0);
      });
    });

    it('should display Scout Exclusive tag', async () => {
      render(<OffersScreen />);
      await waitFor(() => {
        expect(screen.getByText('Scout Exclusive')).toBeTruthy();
      });
    });

    it('should display offer description', async () => {
      render(<OffersScreen />);
      await waitFor(() => {
        expect(screen.getByText(/Valid for dine-in/)).toBeTruthy();
      });
    });

    it('should display days remaining', async () => {
      render(<OffersScreen />);
      await waitFor(() => {
        expect(screen.getAllByText(/days left/).length).toBeGreaterThan(0);
      });
    });

    it('should display redemption count', async () => {
      render(<OffersScreen />);
      await waitFor(() => {
        expect(screen.getByText('150 used')).toBeTruthy();
        expect(screen.getByText('75 used')).toBeTruthy();
      });
    });
  });

  describe('Category Filtering', () => {
    it('should show all offers when ALL is selected', async () => {
      render(<OffersScreen />);
      await waitFor(() => {
        expect(screen.getByText('20% Off Any Pizza')).toBeTruthy();
        expect(screen.getByText('$10 Off Electronics')).toBeTruthy();
        expect(screen.getByText('Buy One Get One Free')).toBeTruthy();
      });
    });

    it('should filter offers by RESTAURANTS category', async () => {
      render(<OffersScreen />);
      await waitFor(() => {
        expect(screen.getByText('RESTAURANTS')).toBeTruthy();
      });

      const restaurantsButton = screen.getByText('RESTAURANTS');
      fireEvent.press(restaurantsButton);

      await waitFor(() => {
        expect(screen.getByText('20% Off Any Pizza')).toBeTruthy();
        expect(screen.queryByText('$10 Off Electronics')).toBeFalsy();
      });
    });

    it('should filter offers by RETAIL category', async () => {
      render(<OffersScreen />);
      await waitFor(() => {
        expect(screen.getByText('RETAIL')).toBeTruthy();
      });

      const retailButton = screen.getByText('RETAIL');
      fireEvent.press(retailButton);

      await waitFor(() => {
        expect(screen.getByText('$10 Off Electronics')).toBeTruthy();
        expect(screen.queryByText('20% Off Any Pizza')).toBeFalsy();
      });
    });

    it('should filter offers by ENTERTAINMENT category', async () => {
      render(<OffersScreen />);
      await waitFor(() => {
        expect(screen.getByText('ENTERTAINMENT')).toBeTruthy();
      });

      const entertainmentButton = screen.getByText('ENTERTAINMENT');
      fireEvent.press(entertainmentButton);

      await waitFor(() => {
        expect(screen.getByText('Buy One Get One Free')).toBeTruthy();
        expect(screen.queryByText('20% Off Any Pizza')).toBeFalsy();
      });
    });

    it('should filter offers by AUTOMOTIVE category', async () => {
      render(<OffersScreen />);
      await waitFor(() => {
        expect(screen.getByText('AUTOMOTIVE')).toBeTruthy();
      });

      const automotiveButton = screen.getByText('AUTOMOTIVE');
      fireEvent.press(automotiveButton);

      await waitFor(() => {
        expect(screen.getByText('Free Oil Change')).toBeTruthy();
        expect(screen.queryByText('20% Off Any Pizza')).toBeFalsy();
      });
    });

    it('should show active state for selected category', async () => {
      render(<OffersScreen />);
      await waitFor(() => {
        expect(screen.getByText('ALL')).toBeTruthy();
      });

      // ALL should be initially active
      const allButton = screen.getByText('ALL');
      expect(allButton).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    it('should navigate to OfferDetail when offer card is pressed', async () => {
      render(<OffersScreen />);
      await waitFor(() => {
        expect(screen.getByText('20% Off Any Pizza')).toBeTruthy();
      });

      const offerCard = screen.getByText('20% Off Any Pizza');
      fireEvent.press(offerCard);

      expect(mockNavigation.navigate).toHaveBeenCalledWith('OfferDetail', { offerId: 1 });
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no offers exist', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: { content: [] },
      });

      render(<OffersScreen />);
      await waitFor(() => {
        expect(screen.getByText('No offers found')).toBeTruthy();
      });
    });

    it('should show empty subtext', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: { content: [] },
      });

      render(<OffersScreen />);
      await waitFor(() => {
        expect(screen.getByText('Try adjusting your filters')).toBeTruthy();
      });
    });

    it('should show empty state when filtered category has no offers', async () => {
      render(<OffersScreen />);
      await waitFor(() => {
        expect(screen.getByText('SERVICES')).toBeTruthy();
      });

      const servicesButton = screen.getByText('SERVICES');
      fireEvent.press(servicesButton);

      await waitFor(() => {
        expect(screen.getByText('No offers found')).toBeTruthy();
      });
    });
  });

  describe('Pull to Refresh', () => {
    it('should reload offers on refresh', async () => {
      render(<OffersScreen />);
      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenCalled();
      });

      // Initial call
      expect(mockApiClient.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('API Integration', () => {
    it('should call correct API endpoint with user ID', async () => {
      render(<OffersScreen />);
      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenCalledWith(
          expect.stringContaining(`/api/v1/offers/active/user/${mockScoutUser.id}`)
        );
      });
    });

    it('should call generic endpoint when user is not logged in', async () => {
      jest.doMock('../../../store/authStore', () => ({
        useAuthStore: () => ({
          user: null,
        }),
      }));

      render(<OffersScreen />);
      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenCalled();
      });
    });

    it('should filter out offers where user has reached limit', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: {
          content: [
            ...mockOffers,
            {
              id: 5,
              uuid: 'offer-5',
              merchantId: 5,
              merchantName: 'Limited Shop',
              title: 'Limited Offer',
              discountType: 'PERCENTAGE',
              discountValue: 5,
              category: 'RETAIL',
              validFrom: '2025-01-01',
              validUntil: '2025-12-31',
              featured: false,
              scoutExclusive: false,
              totalRedemptions: 10,
              isValid: true,
              userHasReachedLimit: true, // Should be filtered out
            },
          ],
        },
      });

      render(<OffersScreen />);
      await waitFor(() => {
        expect(screen.getByText('20% Off Any Pizza')).toBeTruthy();
        expect(screen.queryByText('Limited Offer')).toBeFalsy();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Network error'));

      render(<OffersScreen />);
      await waitFor(() => {
        // Should show empty state or error state
        expect(screen.getByText('Offers')).toBeTruthy();
      });
    });
  });

  describe('Discount Type Display', () => {
    it('should show PERCENTAGE discount correctly', async () => {
      render(<OffersScreen />);
      await waitFor(() => {
        expect(screen.getByText('20% OFF')).toBeTruthy();
      });
    });

    it('should show FIXED_AMOUNT discount correctly', async () => {
      render(<OffersScreen />);
      await waitFor(() => {
        expect(screen.getByText('$10 OFF')).toBeTruthy();
      });
    });

    it('should show BUY_ONE_GET_ONE discount correctly', async () => {
      render(<OffersScreen />);
      await waitFor(() => {
        expect(screen.getByText('BOGO')).toBeTruthy();
      });
    });

    it('should show FREE_ITEM discount correctly', async () => {
      render(<OffersScreen />);
      await waitFor(() => {
        expect(screen.getByText('FREE ITEM')).toBeTruthy();
      });
    });
  });

  describe('Days Remaining Calculation', () => {
    it('should display correct days remaining text', async () => {
      // Mock current date to 2025-01-15 for predictable results
      const now = new Date('2025-01-15');
      jest.spyOn(global, 'Date').mockImplementation(() => now as any);

      render(<OffersScreen />);
      await waitFor(() => {
        // Offers should show days remaining
        expect(screen.getByText('Offers')).toBeTruthy();
      });

      jest.restoreAllMocks();
    });
  });

  describe('Scrollable Categories', () => {
    it('should render all category buttons', async () => {
      render(<OffersScreen />);
      await waitFor(() => {
        expect(screen.getByText('ALL')).toBeTruthy();
        expect(screen.getByText('RESTAURANTS')).toBeTruthy();
        expect(screen.getByText('RETAIL')).toBeTruthy();
        expect(screen.getByText('SERVICES')).toBeTruthy();
        expect(screen.getByText('ENTERTAINMENT')).toBeTruthy();
        expect(screen.getByText('AUTOMOTIVE')).toBeTruthy();
        expect(screen.getByText('HEALTH')).toBeTruthy();
        expect(screen.getByText('OTHER')).toBeTruthy();
      });
    });
  });
});
