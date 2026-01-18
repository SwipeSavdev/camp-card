/**
 * Test Utilities and Mock Setup
 * Provides common testing utilities and mock implementations
 */

import React from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Mock User Types
export interface MockUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'SCOUT' | 'PARENT' | 'UNIT_LEADER' | 'COUNCIL_ADMIN' | 'NATIONAL_ADMIN';
  councilId?: string;
  troopId?: string;
  subscriptionStatus?: 'active' | 'inactive' | 'expired' | 'none';
  subscriptionExpiresAt?: string;
}

// Mock Users for Testing
export const mockScoutUser: MockUser = {
  id: 'scout-123',
  email: 'scout@campcard.org',
  firstName: 'Johnny',
  lastName: 'Scout',
  role: 'SCOUT',
  councilId: 'council-1',
  troopId: 'troop-101',
  subscriptionStatus: 'active',
};

export const mockParentUser: MockUser = {
  id: 'parent-456',
  email: 'parent@campcard.org',
  firstName: 'Jane',
  lastName: 'Parent',
  role: 'PARENT',
  councilId: 'council-1',
  subscriptionStatus: 'active',
};

export const mockTroopLeaderUser: MockUser = {
  id: 'leader-789',
  email: 'leader@campcard.org',
  firstName: 'Tom',
  lastName: 'Leader',
  role: 'UNIT_LEADER',
  councilId: 'council-1',
  troopId: 'troop-101',
  subscriptionStatus: 'active',
};

export const mockAdminUser: MockUser = {
  id: 'admin-000',
  email: 'admin@campcard.org',
  firstName: 'Admin',
  lastName: 'User',
  role: 'NATIONAL_ADMIN',
  subscriptionStatus: 'active',
};

// Mock Auth Store State
export interface MockAuthStoreState {
  user: MockUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: jest.Mock;
  logout: jest.Mock;
  signup: jest.Mock;
  refreshAccessToken: jest.Mock;
  updateUser: jest.Mock;
  initialize: jest.Mock;
  devBypass: jest.Mock;
}

// Create mock auth store
export const createMockAuthStore = (overrides?: Partial<MockAuthStoreState>): MockAuthStoreState => ({
  user: mockScoutUser,
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  isAuthenticated: true,
  isLoading: false,
  login: jest.fn().mockResolvedValue(undefined),
  logout: jest.fn().mockResolvedValue(undefined),
  signup: jest.fn().mockResolvedValue(undefined),
  refreshAccessToken: jest.fn().mockResolvedValue(undefined),
  updateUser: jest.fn(),
  initialize: jest.fn().mockResolvedValue(undefined),
  devBypass: jest.fn(),
  ...overrides,
});

// Mock Navigation
export const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
  setParams: jest.fn(),
  dispatch: jest.fn(),
  isFocused: jest.fn().mockReturnValue(true),
  canGoBack: jest.fn().mockReturnValue(true),
  addListener: jest.fn().mockReturnValue(() => {}),
  removeListener: jest.fn(),
  getParent: jest.fn(),
  getState: jest.fn().mockReturnValue({
    routes: [],
    index: 0,
    key: 'mock-key',
    routeNames: [],
  }),
  setOptions: jest.fn(),
};

// Mock Route
export const mockRoute = {
  key: 'mock-route-key',
  name: 'MockScreen',
  params: {},
};

// Create route with params
export const createMockRoute = <T extends object>(name: string, params?: T) => ({
  key: `${name}-key`,
  name,
  params: params || {},
});

// Wrapper component for tests
interface TestWrapperProps {
  children: React.ReactNode;
}

const TestWrapper: React.FC<TestWrapperProps> = ({ children }) => {
  return (
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 375, height: 812 },
        insets: { top: 44, left: 0, right: 0, bottom: 34 },
      }}
    >
      <NavigationContainer>
        {children}
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

// Custom render function
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: TestWrapper, ...options });

// Re-export everything from testing library
export * from '@testing-library/react-native';
export { customRender as render };

// Mock API Response Helpers
export const mockApiResponse = <T>(data: T, status = 200) => ({
  data,
  status,
  statusText: 'OK',
  headers: {},
  config: {},
});

export const mockApiError = (message: string, status = 400) => {
  const error = new Error(message) as any;
  error.response = {
    data: { message },
    status,
    statusText: status === 400 ? 'Bad Request' : 'Internal Server Error',
  };
  return error;
};

// Mock Subscription Plan
export interface MockSubscriptionPlan {
  id: number;
  uuid: string;
  name: string;
  description: string;
  priceCents: number;
  currency: string;
  billingInterval: 'MONTHLY' | 'ANNUAL';
  trialDays: number;
  features: string[];
}

export const mockSubscriptionPlan: MockSubscriptionPlan = {
  id: 1,
  uuid: 'plan-uuid-1',
  name: 'Annual Camp Card',
  description: 'Full year of savings at local merchants',
  priceCents: 1500,
  currency: 'USD',
  billingInterval: 'ANNUAL',
  trialDays: 0,
  features: [
    'Access to all local offers',
    'QR code for in-store redemption',
    'Support Scout fundraising',
  ],
};

// Mock Offer
export interface MockOffer {
  id: number;
  uuid: string;
  merchantId: number;
  merchantName?: string;
  merchantLogoUrl?: string;
  title: string;
  description: string;
  discountType: string;
  discountValue: number;
  category: string;
  imageUrl?: string;
  validFrom: string;
  validUntil: string;
  featured: boolean;
  scoutExclusive: boolean;
  totalRedemptions: number;
  remainingRedemptions?: number;
  isValid: boolean;
}

export const mockOffer: MockOffer = {
  id: 1,
  uuid: 'offer-uuid-1',
  merchantId: 1,
  merchantName: 'Pizza Palace',
  title: '20% Off Any Pizza',
  description: 'Get 20% off any pizza at Pizza Palace',
  discountType: 'PERCENTAGE',
  discountValue: 20,
  category: 'RESTAURANTS',
  validFrom: '2025-01-01',
  validUntil: '2025-12-31',
  featured: true,
  scoutExclusive: false,
  totalRedemptions: 150,
  isValid: true,
};

// Mock Scout
export interface MockScout {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  subscriptionStatus: 'active' | 'inactive' | 'expired';
  totalSales: number;
  redemptions: number;
  referrals: number;
  joinedDate: string;
}

export const mockScout: MockScout = {
  id: 'scout-1',
  firstName: 'Ethan',
  lastName: 'Anderson',
  email: 'ethan@email.com',
  subscriptionStatus: 'active',
  totalSales: 150,
  redemptions: 12,
  referrals: 5,
  joinedDate: '2025-09-15',
};

// Mock Referral
export interface MockReferral {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  subscriptionDate: string;
  planType: string;
  status: 'active' | 'cancelled' | 'expired';
  isDirectReferral: boolean;
  referredBy?: string;
}

export const mockReferral: MockReferral = {
  id: 'ref-1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@email.com',
  subscriptionDate: '2025-10-01',
  planType: 'Annual',
  status: 'active',
  isDirectReferral: true,
};

// Wait for async operations
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

// Suppress specific console methods for cleaner test output
export const suppressConsole = () => {
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;

  beforeAll(() => {
    console.log = jest.fn();
    console.error = jest.fn();
    console.warn = jest.fn();
  });

  afterAll(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  });
};
