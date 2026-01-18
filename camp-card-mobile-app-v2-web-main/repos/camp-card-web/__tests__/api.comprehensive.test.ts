/**
 * Comprehensive API Tests
 *
 * Tests all API methods in lib/api.ts including:
 * - Auth operations (forgotPassword, resetPassword, verifyEmail)
 * - User CRUD operations
 * - Scout operations (getByTroop, unassigned, assign/remove)
 * - Organization CRUD operations
 * - Troop CRUD operations
 * - Merchant CRUD operations with locations
 * - Offer CRUD operations
 * - Camp Card CRUD operations
 * - Category operations
 * - Feature Flag operations
 * - Health check
 * - AI Marketing Campaign operations
 * - Dashboard/Analytics operations
 */

import { api, ApiError } from '../lib/api';
import {
  createMockSession,
  createMockUser,
  createMockCouncil,
  createMockTroop,
  createMockMerchant,
  createMockOffer,
  createMockCampaign,
  createMockFeatureFlag,
  mockFetchSuccess,
  mockFetch204,
  mockFetchError,
  mockFetchNetworkError,
} from '../lib/testHelpers';

// Suppress console logs/errors during tests
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ApiError', () => {
  it('creates an error with status and message', () => {
    const error = new ApiError(404, 'Not Found');
    expect(error.status).toBe(404);
    expect(error.message).toBe('Not Found');
    expect(error.name).toBe('ApiError');
    expect(error).toBeInstanceOf(Error);
  });

  it('can be caught as an Error', () => {
    const error = new ApiError(500, 'Internal Server Error');
    try {
      throw error;
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
      expect(e).toBeInstanceOf(ApiError);
      expect((e as ApiError).status).toBe(500);
    }
  });

  it('preserves stack trace', () => {
    const error = new ApiError(401, 'Unauthorized');
    expect(error.stack).toBeDefined();
  });
});

describe('Auth API', () => {
  describe('forgotPassword', () => {
    it('should send forgot password request successfully', async () => {
      mockFetchSuccess({ message: 'Email sent' });
      const result = await api.forgotPassword('test@test.com');
      expect(result).toEqual({ message: 'Email sent' });
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/forgot-password'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'test@test.com' }),
        })
      );
    });

    it('should throw error on failure', async () => {
      mockFetchError(400, 'Invalid email');
      await expect(api.forgotPassword('invalid')).rejects.toThrow(ApiError);
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      mockFetchSuccess({ message: 'Password reset' });
      const result = await api.resetPassword('token123', 'newPassword');
      expect(result).toEqual({ message: 'Password reset' });
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/reset-password'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ token: 'token123', newPassword: 'newPassword' }),
        })
      );
    });

    it('should throw error on invalid token', async () => {
      mockFetchError(400, 'Invalid token');
      await expect(api.resetPassword('invalid', 'pass')).rejects.toThrow(ApiError);
    });
  });

  describe('verifyEmail', () => {
    it('should verify email successfully', async () => {
      mockFetchSuccess({ message: 'Email verified' });
      const result = await api.verifyEmail('token123');
      expect(result).toEqual({ message: 'Email verified' });
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/verify-email?token=token123'),
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('should encode special characters in token', async () => {
      mockFetchSuccess({ message: 'Verified' });
      await api.verifyEmail('token+special&chars');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('token%2Bspecial%26chars'),
        expect.anything()
      );
    });
  });
});

describe('Users API', () => {
  const session = createMockSession();

  describe('getUsers', () => {
    it('should fetch users successfully', async () => {
      const users = [createMockUser(), createMockUser({ id: '2', email: 'user2@test.com' })];
      mockFetchSuccess({ content: users });
      const result = await api.getUsers(session);
      expect(result.content).toHaveLength(2);
    });

    it('should handle different response formats', async () => {
      mockFetchSuccess({ users: [createMockUser()] });
      const result = await api.getUsers(session);
      expect(result.content).toHaveLength(1);
    });

    it('should return empty array on error', async () => {
      mockFetchError(500, 'Server error');
      const result = await api.getUsers(session);
      expect(result.content).toEqual([]);
    });
  });

  describe('getUserById', () => {
    it('should fetch user by ID', async () => {
      const user = createMockUser({ id: '123' });
      mockFetchSuccess(user);
      const result = await api.getUserById('123', session);
      expect(result).toEqual(user);
    });

    it('should return null on error', async () => {
      mockFetchError(404, 'Not found');
      const result = await api.getUserById('999', session);
      expect(result).toBeNull();
    });
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      const userData = { email: 'new@test.com', name: 'New User', role: 'SCOUT' };
      const createdUser = { ...userData, id: '1' };
      mockFetchSuccess(createdUser);
      const result = await api.createUser(userData, session);
      expect(result).toEqual(createdUser);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/users'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(userData),
        })
      );
    });

    it('should throw error on duplicate email', async () => {
      mockFetchError(409, 'Email already exists');
      await expect(api.createUser({ email: 'dup@test.com' }, session)).rejects.toThrow(ApiError);
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const updateData = { name: 'Updated Name' };
      mockFetchSuccess({ id: '1', ...updateData });
      const result = await api.updateUser('1', updateData, session);
      expect(result.name).toBe('Updated Name');
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      mockFetch204();
      await expect(api.deleteUser('1', session)).resolves.not.toThrow();
    });
  });
});

describe('Scouts API', () => {
  const session = createMockSession();

  describe('getScoutsByTroop', () => {
    it('should fetch scouts by troop ID', async () => {
      const scouts = [
        createMockUser({ id: '1', role: 'SCOUT' }),
        createMockUser({ id: '2', role: 'SCOUT' }),
      ];
      mockFetchSuccess({ content: scouts });
      const result = await api.getScoutsByTroop('troop1', session);
      expect(result.content).toHaveLength(2);
    });
  });

  describe('getUnassignedScouts', () => {
    it('should fetch unassigned scouts', async () => {
      mockFetchSuccess([createMockUser({ role: 'SCOUT' })]);
      const result = await api.getUnassignedScouts(undefined, session);
      expect(result.content).toHaveLength(1);
    });

    it('should filter by council ID', async () => {
      mockFetchSuccess([]);
      await api.getUnassignedScouts('council1', session);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('councilId=council1'),
        expect.anything()
      );
    });
  });

  describe('assignScoutToTroop', () => {
    it('should assign scout to troop', async () => {
      mockFetchSuccess({ success: true });
      const result = await api.assignScoutToTroop('user1', 'troop1', session);
      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/user1/assign-troop/troop1'),
        expect.objectContaining({ method: 'PATCH' })
      );
    });
  });

  describe('removeScoutFromTroop', () => {
    it('should remove scout from troop', async () => {
      mockFetch204();
      await expect(api.removeScoutFromTroop('user1', session)).resolves.not.toThrow();
    });
  });
});

describe('Organizations API', () => {
  const session = createMockSession();

  describe('getOrganizations', () => {
    it('should fetch organizations', async () => {
      mockFetchSuccess({ content: [createMockCouncil()] });
      const result = await api.getOrganizations(session);
      expect(result.content).toHaveLength(1);
    });
  });

  describe('createOrganization', () => {
    it('should create organization', async () => {
      const orgData = createMockCouncil();
      mockFetchSuccess(orgData);
      const result = await api.createOrganization(orgData, session);
      expect(result.name).toBe('Test Council');
    });
  });

  describe('updateOrganization', () => {
    it('should update organization', async () => {
      mockFetchSuccess({ id: '1', name: 'Updated Council' });
      const result = await api.updateOrganization('1', { name: 'Updated Council' }, session);
      expect(result.name).toBe('Updated Council');
    });
  });

  describe('deleteOrganization', () => {
    it('should delete organization', async () => {
      mockFetch204();
      await expect(api.deleteOrganization('1', session)).resolves.not.toThrow();
    });
  });
});

describe('Troops API', () => {
  const session = createMockSession();

  describe('getTroops', () => {
    it('should fetch troops', async () => {
      mockFetchSuccess({ content: [createMockTroop()] });
      const result = await api.getTroops(session);
      expect(result.content).toHaveLength(1);
    });
  });

  describe('createTroop', () => {
    it('should create troop', async () => {
      const troopData = createMockTroop();
      mockFetchSuccess(troopData);
      const result = await api.createTroop(troopData, session);
      expect(result.troopNumber).toBe('T001');
    });
  });

  describe('updateTroop', () => {
    it('should update troop', async () => {
      mockFetchSuccess({ id: '1', troopNumber: 'T002' });
      const result = await api.updateTroop('1', { troopNumber: 'T002' }, session);
      expect(result.troopNumber).toBe('T002');
    });
  });

  describe('deleteTroop', () => {
    it('should delete troop', async () => {
      mockFetch204();
      await expect(api.deleteTroop('1', session)).resolves.not.toThrow();
    });
  });
});

describe('Merchants API', () => {
  const session = createMockSession();

  describe('getMerchants', () => {
    it('should fetch merchants', async () => {
      mockFetchSuccess({ merchants: [createMockMerchant()] });
      const result = await api.getMerchants(session);
      expect(result.merchants).toHaveLength(1);
    });
  });

  describe('createMerchant', () => {
    it('should create merchant', async () => {
      const merchantData = createMockMerchant();
      mockFetchSuccess(merchantData);
      const result = await api.createMerchant(merchantData, session);
      expect(result.businessName).toBe('Test Merchant');
    });
  });

  describe('updateMerchant', () => {
    it('should update merchant', async () => {
      mockFetchSuccess({ id: '1', businessName: 'Updated Merchant' });
      const result = await api.updateMerchant('1', { businessName: 'Updated Merchant' }, session);
      expect(result.businessName).toBe('Updated Merchant');
    });
  });

  describe('updateMerchantStatus', () => {
    it('should update merchant status', async () => {
      mockFetchSuccess({ id: '1', status: 'INACTIVE' });
      const result = await api.updateMerchantStatus('1', 'INACTIVE', session);
      expect(result.status).toBe('INACTIVE');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/merchants/1/status?status=INACTIVE'),
        expect.objectContaining({ method: 'PATCH' })
      );
    });
  });

  describe('deleteMerchant', () => {
    it('should delete merchant', async () => {
      mockFetch204();
      const result = await api.deleteMerchant('1', session);
      expect(result.success).toBe(true);
    });
  });
});

describe('Merchant Locations API', () => {
  const session = createMockSession();

  describe('createMerchantLocation', () => {
    it('should create merchant location', async () => {
      const locationData = { address: '123 Main St', lat: 40.7128, lng: -74.006 };
      mockFetchSuccess({ id: '1', ...locationData });
      const result = await api.createMerchantLocation('merchant1', locationData, session);
      expect(result.address).toBe('123 Main St');
    });
  });

  describe('getMerchantLocations', () => {
    it('should fetch merchant locations', async () => {
      mockFetchSuccess({ locations: [{ id: '1', address: '123 Main St' }] });
      const result = await api.getMerchantLocations('merchant1', session);
      expect(result).toHaveLength(1);
    });
  });

  describe('deleteMerchantLocation', () => {
    it('should delete merchant location', async () => {
      mockFetch204();
      const result = await api.deleteMerchantLocation('merchant1', 'loc1', session);
      expect(result.success).toBe(true);
    });
  });
});

describe('Offers API', () => {
  const session = createMockSession();

  describe('getOffers', () => {
    it('should fetch offers', async () => {
      mockFetchSuccess({ data: [createMockOffer()] });
      const result = await api.getOffers(session);
      expect(result.data).toHaveLength(1);
    });

    it('should handle content response format', async () => {
      mockFetchSuccess({ content: [createMockOffer()] });
      const result = await api.getOffers(session);
      expect(result.content).toHaveLength(1);
    });
  });

  describe('createOffer', () => {
    it('should create offer', async () => {
      const offerData = createMockOffer();
      mockFetchSuccess(offerData);
      const result = await api.createOffer(offerData, session);
      expect(result.title).toBe('Test Offer');
    });
  });

  describe('updateOffer', () => {
    it('should update offer', async () => {
      mockFetchSuccess({ id: '1', title: 'Updated Offer' });
      const result = await api.updateOffer('1', { title: 'Updated Offer' }, session);
      expect(result.title).toBe('Updated Offer');
    });
  });

  describe('deleteOffer', () => {
    it('should delete offer', async () => {
      mockFetch204();
      const result = await api.deleteOffer('1', session);
      expect(result.success).toBe(true);
    });
  });

  describe('activateOffer', () => {
    it('should activate offer', async () => {
      mockFetchSuccess({ id: '1', status: 'ACTIVE' });
      const result = await api.activateOffer('1', session);
      expect(result.status).toBe('ACTIVE');
    });
  });
});

describe('Camp Cards API', () => {
  const session = createMockSession();

  describe('getCards', () => {
    it('should fetch cards', async () => {
      mockFetchSuccess({ content: [{ id: '1', cardNumber: 'CC-1234-5678-9012' }] });
      const result = await api.getCards(session);
      expect(result.content).toHaveLength(1);
    });
  });

  describe('createCard', () => {
    it('should create card', async () => {
      mockFetchSuccess({ id: '1', cardNumber: 'CC-1234-5678-9012' });
      const result = await api.createCard({ userId: '1' }, session);
      expect(result.cardNumber).toBe('CC-1234-5678-9012');
    });
  });

  describe('updateCard', () => {
    it('should update card', async () => {
      mockFetchSuccess({ id: '1', status: 'INACTIVE' });
      const result = await api.updateCard('1', { status: 'INACTIVE' }, session);
      expect(result.status).toBe('INACTIVE');
    });
  });

  describe('deleteCard', () => {
    it('should delete card', async () => {
      mockFetch204();
      const result = await api.deleteCard('1', session);
      expect(result.success).toBe(true);
    });
  });
});

describe('Categories API', () => {
  const session = createMockSession();

  describe('getCategories', () => {
    it('should fetch categories', async () => {
      mockFetchSuccess({ content: [{ id: '1', name: 'Restaurant' }] });
      const result = await api.getCategories(session);
      expect(result.content).toHaveLength(1);
    });
  });

  describe('getCategoryById', () => {
    it('should fetch category by ID', async () => {
      mockFetchSuccess({ id: '1', name: 'Restaurant' });
      const result = await api.getCategoryById('1', session);
      expect(result?.name).toBe('Restaurant');
    });
  });
});

describe('Feature Flags API', () => {
  const session = createMockSession();

  describe('getFeatureFlags', () => {
    it('should fetch feature flags', async () => {
      mockFetchSuccess({ data: [createMockFeatureFlag()] });
      const result = await api.getFeatureFlags(undefined, session);
      expect(result.data).toHaveLength(1);
    });

    it('should pass query string', async () => {
      mockFetchSuccess({ data: [] });
      await api.getFeatureFlags('?enabled=true', session);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/feature-flags?enabled=true'),
        expect.anything()
      );
    });
  });

  describe('createFeatureFlag', () => {
    it('should create feature flag', async () => {
      const flagData = createMockFeatureFlag();
      mockFetchSuccess(flagData);
      const result = await api.createFeatureFlag(flagData, session);
      expect(result.key).toBe('test_feature');
    });
  });

  describe('updateFeatureFlag', () => {
    it('should update feature flag', async () => {
      mockFetchSuccess({ id: '1', enabled: false });
      const result = await api.updateFeatureFlag('1', { enabled: false }, session);
      expect(result.enabled).toBe(false);
    });
  });

  describe('deleteFeatureFlag', () => {
    it('should delete feature flag', async () => {
      mockFetch204();
      await expect(api.deleteFeatureFlag('1', session)).resolves.not.toThrow();
    });
  });

  describe('getFeatureFlagAuditLog', () => {
    it('should fetch audit log', async () => {
      mockFetchSuccess({ data: [{ id: '1', action: 'CREATED' }] });
      const result = await api.getFeatureFlagAuditLog('1', session);
      expect(result).toHaveLength(1);
    });
  });
});

describe('Health Check API', () => {
  describe('getHealth', () => {
    it('should return health status', async () => {
      mockFetchSuccess({ status: 'UP', components: {} });
      const result = await api.getHealth();
      expect(result.status).toBe('UP');
    });

    it('should return error status on failure', async () => {
      mockFetchError(500, 'Service down');
      const result = await api.getHealth();
      expect(result.status).toBe('error');
    });
  });
});

describe('AI Marketing Campaigns API', () => {
  const session = createMockSession();

  describe('getCampaigns', () => {
    it('should fetch campaigns', async () => {
      mockFetchSuccess({ content: [createMockCampaign()] });
      const result = await api.getCampaigns(undefined, session);
      expect(result.content).toHaveLength(1);
    });

    it('should pass query parameters', async () => {
      mockFetchSuccess({ content: [] });
      await api.getCampaigns({ status: 'ACTIVE', type: 'EMAIL', page: 0, size: 10 }, session);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringMatching(/status=ACTIVE.*type=EMAIL/),
        expect.anything()
      );
    });
  });

  describe('createCampaign', () => {
    it('should create campaign', async () => {
      const campaignData = createMockCampaign();
      mockFetchSuccess(campaignData);
      const result = await api.createCampaign(campaignData, session);
      expect(result.name).toBe('Test Campaign');
    });
  });

  describe('updateCampaignStatus', () => {
    it('should update campaign status', async () => {
      mockFetchSuccess({ id: '1', status: 'ACTIVE' });
      const result = await api.updateCampaignStatus('1', 'ACTIVE', session);
      expect(result.status).toBe('ACTIVE');
    });
  });

  describe('deleteCampaign', () => {
    it('should delete campaign', async () => {
      mockFetch204();
      await expect(api.deleteCampaign('1', session)).resolves.not.toThrow();
    });
  });

  describe('generateAIContent', () => {
    it('should generate AI content', async () => {
      const aiRequest = { prompt: 'Create a fundraising email' };
      mockFetchSuccess({ content: 'Generated content here' });
      const result = await api.generateAIContent(aiRequest, session);
      expect(result.content).toBe('Generated content here');
    });
  });

  describe('generateAIVariations', () => {
    it('should generate AI variations', async () => {
      mockFetchSuccess({ variations: ['v1', 'v2', 'v3'] });
      const result = await api.generateAIVariations({ content: 'base' }, 3, session);
      expect(result.variations).toHaveLength(3);
    });
  });

  describe('saveCampaign', () => {
    it('should save campaign as draft', async () => {
      mockFetchSuccess({ id: '1', name: 'Saved Campaign' });
      const result = await api.saveCampaign({ name: 'Saved Campaign' }, session);
      expect(result.name).toBe('Saved Campaign');
    });
  });

  describe('createCampaignFromSaved', () => {
    it('should create campaign from saved', async () => {
      mockFetchSuccess({ id: 'new1', status: 'DRAFT' });
      const result = await api.createCampaignFromSaved('saved1', session);
      expect(result.id).toBe('new1');
    });
  });
});

describe('Dashboard/Analytics API', () => {
  const session = createMockSession();

  describe('getDashboard', () => {
    it('should fetch dashboard data', async () => {
      mockFetchSuccess({ totalUsers: 100, totalSales: 5000 });
      const result = await api.getDashboard(session);
      expect(result?.totalUsers).toBe(100);
    });

    it('should return null on error', async () => {
      mockFetchError(500, 'Error');
      const result = await api.getDashboard(session);
      expect(result).toBeNull();
    });
  });

  describe('getDashboardSummary', () => {
    it('should fetch dashboard summary', async () => {
      mockFetchSuccess({ activeCampaigns: 5, pendingApprovals: 3 });
      const result = await api.getDashboardSummary(session);
      expect(result?.activeCampaigns).toBe(5);
    });
  });

  describe('getTroopSales', () => {
    it('should fetch troop sales', async () => {
      mockFetchSuccess([{ troopId: '1', totalSales: 1000 }]);
      const result = await api.getTroopSales(session);
      expect(result).toHaveLength(1);
    });
  });

  describe('getScoutSales', () => {
    it('should fetch scout sales', async () => {
      mockFetchSuccess([{ scoutId: '1', sales: 50 }]);
      const result = await api.getScoutSales(session);
      expect(result).toHaveLength(1);
    });
  });

  describe('getScoutReferrals', () => {
    it('should fetch scout referrals', async () => {
      mockFetchSuccess([{ scoutId: '1', referrals: 10 }]);
      const result = await api.getScoutReferrals(session);
      expect(result).toHaveLength(1);
    });
  });

  describe('getSalesTrend', () => {
    it('should fetch sales trend', async () => {
      mockFetchSuccess([{ date: '2026-01-01', sales: 100 }]);
      const result = await api.getSalesTrend(session);
      expect(result).toHaveLength(1);
    });
  });
});

describe('API Error Handling', () => {
  const session = createMockSession();

  it('should handle network errors gracefully', async () => {
    mockFetchNetworkError();
    await expect(api.forgotPassword('test@test.com')).rejects.toThrow('Network error');
  });

  it('should handle 401 Unauthorized', async () => {
    mockFetchError(401, 'Unauthorized');
    await expect(api.createUser({}, session)).rejects.toThrow(ApiError);
  });

  it('should handle 403 Forbidden', async () => {
    mockFetchError(403, 'Forbidden');
    await expect(api.deleteUser('1', session)).rejects.toThrow(ApiError);
  });

  it('should handle 404 Not Found', async () => {
    mockFetchError(404, 'Not Found');
    const result = await api.getUserById('999', session);
    expect(result).toBeNull();
  });

  it('should handle 500 Server Error', async () => {
    mockFetchError(500, 'Internal Server Error');
    await expect(api.createMerchant({}, session)).rejects.toThrow(ApiError);
  });
});

describe('API Headers', () => {
  it('should include Authorization header when session has token', async () => {
    const session = createMockSession({ accessToken: 'test-token-123' });
    mockFetchSuccess({ content: [] });
    await api.getUsers(session);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token-123',
        }),
      })
    );
  });

  it('should include Content-Type header', async () => {
    mockFetchSuccess({});
    await api.getHealth();
    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      })
    );
  });

  it('should include cache control headers', async () => {
    mockFetchSuccess({});
    await api.getHealth();
    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        }),
      })
    );
  });

  it('should include user ID header when available', async () => {
    const session = createMockSession({ id: 'user-123' });
    mockFetchSuccess({ content: [] });
    await api.getUsers(session);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'X-User-Id': 'user-123',
        }),
      })
    );
  });

  it('should include council ID header when available', async () => {
    const session = createMockSession({ councilId: 'council-456' });
    mockFetchSuccess({ content: [] });
    await api.getUsers(session);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'X-Council-Id': 'council-456',
        }),
      })
    );
  });
});

describe('API Cache Busting', () => {
  it('should add cache buster query parameter', async () => {
    mockFetchSuccess({});
    await api.getHealth();
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringMatching(/_t=\d+/),
      expect.anything()
    );
  });

  it('should append to existing query parameters', async () => {
    const session = createMockSession();
    mockFetchSuccess({ data: [] });
    await api.getFeatureFlags('?enabled=true', session);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringMatching(/enabled=true.*_t=\d+/),
      expect.anything()
    );
  });
});
