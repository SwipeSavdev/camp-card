/**
 * Test Utilities
 *
 * Provides helper functions for testing React components with:
 * - Provider wrappers (SessionProvider, QueryClientProvider)
 * - Mock session factories
 * - Mock data generators
 * - Custom render function
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Session } from 'next-auth';

// ============ MOCK SESSION FACTORY ============

export type UserRole = 'NATIONAL_ADMIN' | 'COUNCIL_ADMIN' | 'UNIT_LEADER' | 'PARENT' | 'SCOUT';

export interface MockUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  councilId?: string;
  troopId?: string;
  accessToken?: string;
}

export const createMockUser = (overrides: Partial<MockUser> = {}): MockUser => ({
  id: '1',
  email: 'test@campcard.org',
  name: 'Test User',
  role: 'NATIONAL_ADMIN',
  councilId: '1',
  accessToken: 'mock-jwt-token-12345',
  ...overrides,
});

export const createMockSession = (userOverrides: Partial<MockUser> = {}): Session => {
  const user = createMockUser(userOverrides);
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      councilId: user.councilId,
      troopId: user.troopId,
      accessToken: user.accessToken,
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  } as Session;
};

// Role-specific session factories
export const createNationalAdminSession = () => createMockSession({ role: 'NATIONAL_ADMIN' });
export const createCouncilAdminSession = () => createMockSession({ role: 'COUNCIL_ADMIN', councilId: '1' });
export const createUnitLeaderSession = () => createMockSession({ role: 'UNIT_LEADER', councilId: '1', troopId: '1' });
export const createParentSession = () => createMockSession({ role: 'PARENT' });
export const createScoutSession = () => createMockSession({ role: 'SCOUT' });

// ============ MOCK DATA GENERATORS ============

export const createMockCouncil = (overrides = {}) => ({
  id: '1',
  councilNumber: 'C001',
  name: 'Test Council',
  region: 'Northeast',
  status: 'ACTIVE',
  createdAt: new Date().toISOString(),
  ...overrides,
});

export const createMockTroop = (overrides = {}) => ({
  id: '1',
  troopNumber: 'T001',
  councilId: '1',
  troopType: 'Boy Scout',
  status: 'ACTIVE',
  createdAt: new Date().toISOString(),
  ...overrides,
});

export const createMockMerchant = (overrides = {}) => ({
  id: '1',
  businessName: 'Test Merchant',
  category: 'Restaurant',
  status: 'ACTIVE',
  councilId: '1',
  contactEmail: 'merchant@test.com',
  phone: '555-0100',
  createdAt: new Date().toISOString(),
  ...overrides,
});

export const createMockOffer = (overrides = {}) => ({
  id: '1',
  merchantId: '1',
  title: 'Test Offer',
  description: '10% off your purchase',
  discountType: 'PERCENTAGE',
  discountValue: 10,
  status: 'ACTIVE',
  validFrom: new Date().toISOString(),
  validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  createdAt: new Date().toISOString(),
  ...overrides,
});

export const createMockSubscription = (overrides = {}) => ({
  id: '1',
  userId: '1',
  planId: '1',
  cardNumber: 'CC-1234-5678-9012',
  status: 'ACTIVE',
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  createdAt: new Date().toISOString(),
  ...overrides,
});

export const createMockCampaign = (overrides = {}) => ({
  id: '1',
  name: 'Test Campaign',
  campaignType: 'EMAIL',
  status: 'DRAFT',
  subject: 'Test Subject',
  content: 'Test content',
  channels: ['EMAIL'],
  createdAt: new Date().toISOString(),
  ...overrides,
});

export const createMockFeatureFlag = (overrides = {}) => ({
  id: '1',
  key: 'test_feature',
  name: 'Test Feature',
  description: 'A test feature flag',
  enabled: true,
  createdAt: new Date().toISOString(),
  ...overrides,
});

// ============ API RESPONSE MOCKS ============

export const createPaginatedResponse = <T,>(content: T[], total?: number) => ({
  content,
  totalElements: total ?? content.length,
  totalPages: Math.ceil((total ?? content.length) / 10),
  size: 10,
  number: 0,
});

export const createSuccessResponse = <T,>(data: T) => ({
  success: true,
  data,
});

export const createErrorResponse = (status: number, message: string) => ({
  success: false,
  status,
  message,
});

// ============ FETCH MOCK HELPERS ============

export const mockFetchSuccess = <T,>(data: T) => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => data,
    text: async () => JSON.stringify(data),
    headers: new Headers({ 'content-length': '100' }),
  });
};

export const mockFetch204 = () => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    status: 204,
    json: async () => ({}),
    text: async () => '',
    headers: new Headers({ 'content-length': '0' }),
  });
};

export const mockFetchError = (status: number, message = 'Error') => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: false,
    status,
    json: async () => ({ error: message }),
    text: async () => JSON.stringify({ error: message }),
    headers: new Headers(),
  });
};

export const mockFetchNetworkError = () => {
  (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
};

// ============ CUSTOM RENDER ============

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  session?: Session | null;
}

const AllProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

export const customRender = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { session: _session, ...renderOptions } = options;
  return render(ui, { wrapper: AllProviders, ...renderOptions });
};

// Re-export everything from @testing-library/react
export * from '@testing-library/react';
export { customRender as render };
