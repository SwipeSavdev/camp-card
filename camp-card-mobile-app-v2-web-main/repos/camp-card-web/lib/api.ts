import { Session } from 'next-auth';

// API Base URL - must include /api/v1 suffix
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7010/api/v1';

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {},
  session?: Session | null,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    Pragma: 'no-cache',
  };

  if (options.headers && typeof options.headers === 'object' && !(options.headers instanceof Headers)) {
    Object.assign(headers, options.headers as Record<string, string>);
  }

  // Get accessToken and user info from session
  const accessToken = (session?.user as any)?.accessToken || (session as any)?.accessToken;
  const userId = (session?.user as any)?.id || session?.user?.id;
  const councilId = (session?.user as any)?.councilId;

  // Debug logging
  console.log('[API] Session:', session ? 'present' : 'null');
  console.log('[API] AccessToken:', accessToken ? `${accessToken.substring(0, 20)}...` : 'null');
  console.log('[API] Endpoint:', endpoint);

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  } else {
    console.warn('[API] No access token available for request to:', endpoint);
  }

  // Add user and council headers for endpoints that require them
  if (userId) {
    headers['X-User-Id'] = userId;
  }
  if (councilId) {
    headers['X-Council-Id'] = councilId;
  }

  // Add cache-busting query parameter for GET requests
  const cacheBuster = `_t=${Date.now()}`;
  const urlWithCacheBuster = endpoint.includes('?')
    ? `${endpoint}&${cacheBuster}`
    : `${endpoint}?${cacheBuster}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(`${API_BASE_URL}${urlWithCacheBuster}`, {
      ...options,
      headers,
      signal: controller.signal,
      cache: 'no-store',
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new ApiError(response.status, `API Error: ${response.status}`);
    }

    // Handle 204 No Content responses (common for DELETE operations)
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return {} as T;
    }

    // Try to parse JSON, but handle empty responses gracefully
    const text = await response.text();
    if (!text || text.trim() === '') {
      return {} as T;
    }

    try {
      return JSON.parse(text);
    } catch {
      // If JSON parsing fails, return empty object
      return {} as T;
    }
  } catch (error) {
    // If the request fails (timeout, network error, etc), throw to trigger fallback
    throw error;
  }
}

export const api = {
  // ============ AUTH ============
  forgotPassword: async (email: string) => {
    try {
      return await apiCall<any>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    } catch (error) {
      console.error('Failed to send forgot password email:', error);
      throw error;
    }
  },

  resetPassword: async (token: string, newPassword: string) => {
    try {
      return await apiCall<any>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
      });
    } catch (error) {
      console.error('Failed to reset password:', error);
      throw error;
    }
  },

  verifyEmail: async (token: string) => {
    try {
      return await apiCall<any>('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });
    } catch (error) {
      console.error('Failed to verify email:', error);
      throw error;
    }
  },

  // ============ USERS ============
  getUsers: async (session?: Session | null) => {
    try {
      // Request all users with a large page size to avoid pagination issues
      const result = await apiCall<any>('/users?size=1000', {}, session);
      return {
        content: result.content || result.users || result || [],
      };
    } catch (error) {
      console.error('Failed to fetch users from API:', error);
      return { content: [] };
    }
  },

  getUserById: async (id: string, session?: Session | null) => {
    try {
      return await apiCall<any>(`/users/${id}`, {}, session);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      return null;
    }
  },

  createUser: async (data: any, session?: Session | null) => {
    try {
      return await apiCall<any>('/users', {
        method: 'POST',
        body: JSON.stringify(data),
      }, session);
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  },

  updateUser: async (id: string, data: any, session?: Session | null) => {
    try {
      return await apiCall<any>(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }, session);
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  },

  deleteUser: async (id: string, session?: Session | null) => {
    try {
      return await apiCall<any>(`/users/${id}`, {
        method: 'DELETE',
      }, session);
    } catch (error) {
      console.error('Failed to delete user:', error);
      throw error;
    }
  },

  // ============ SCOUTS ============
  getScoutsByTroop: async (troopId: string, session?: Session | null) => {
    try {
      const result = await apiCall<any>(`/users/troop/${troopId}/scouts`, {}, session);
      return {
        content: result.content || result || [],
      };
    } catch (error) {
      console.error('Failed to fetch scouts by troop:', error);
      return { content: [] };
    }
  },

  getUnassignedScouts: async (councilId?: string, session?: Session | null) => {
    try {
      const url = councilId ? `/users/scouts/unassigned?councilId=${councilId}` : '/users/scouts/unassigned';
      const result = await apiCall<any>(url, {}, session);
      return {
        content: result.content || result || [],
      };
    } catch (error) {
      console.error('Failed to fetch unassigned scouts:', error);
      return { content: [] };
    }
  },

  assignScoutToTroop: async (userId: string, troopId: string, session?: Session | null) => {
    try {
      return await apiCall<any>(`/users/${userId}/assign-troop/${troopId}`, {
        method: 'PATCH',
      }, session);
    } catch (error) {
      console.error('Failed to assign scout to troop:', error);
      throw error;
    }
  },

  removeScoutFromTroop: async (userId: string, session?: Session | null) => {
    try {
      return await apiCall<any>(`/users/${userId}/troop`, {
        method: 'DELETE',
      }, session);
    } catch (error) {
      console.error('Failed to remove scout from troop:', error);
      throw error;
    }
  },

  // ============ ORGANIZATIONS ============
  getOrganizations: async (session?: Session | null) => {
    try {
      const result = await apiCall<any>('/organizations', {}, session);
      return {
        content: result.content || result.organizations || result || [],
      };
    } catch (error) {
      console.error('Failed to fetch organizations from API:', error);
      return { content: [] };
    }
  },

  getOrganizationById: async (id: string, session?: Session | null) => {
    try {
      return await apiCall<any>(`/organizations/${id}`, {}, session);
    } catch (error) {
      console.error('Failed to fetch organization:', error);
      return null;
    }
  },

  createOrganization: async (data: any, session?: Session | null) => {
    try {
      return await apiCall<any>('/organizations', {
        method: 'POST',
        body: JSON.stringify(data),
      }, session);
    } catch (error) {
      console.error('Failed to create organization:', error);
      throw error;
    }
  },

  updateOrganization: async (id: string, data: any, session?: Session | null) => {
    try {
      return await apiCall<any>(`/organizations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }, session);
    } catch (error) {
      console.error('Failed to update organization:', error);
      throw error;
    }
  },

  deleteOrganization: async (id: string, session?: Session | null) => {
    try {
      return await apiCall<any>(`/organizations/${id}`, {
        method: 'DELETE',
      }, session);
    } catch (error) {
      console.error('Failed to delete organization:', error);
      throw error;
    }
  },

  // ============ TROOPS ============
  getTroops: async (session?: Session | null) => {
    try {
      const result = await apiCall<any>('/troops', {}, session);
      return {
        content: result.content || result.troops || result || [],
      };
    } catch (error) {
      console.error('Failed to fetch troops from API:', error);
      return { content: [] };
    }
  },

  getTroopById: async (id: string, session?: Session | null) => {
    try {
      return await apiCall<any>(`/troops/${id}`, {}, session);
    } catch (error) {
      console.error('Failed to fetch troop:', error);
      return null;
    }
  },

  createTroop: async (data: any, session?: Session | null) => {
    try {
      return await apiCall<any>('/troops', {
        method: 'POST',
        body: JSON.stringify(data),
      }, session);
    } catch (error) {
      console.error('Failed to create troop:', error);
      throw error;
    }
  },

  updateTroop: async (id: string, data: any, session?: Session | null) => {
    try {
      return await apiCall<any>(`/troops/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }, session);
    } catch (error) {
      console.error('Failed to update troop:', error);
      throw error;
    }
  },

  deleteTroop: async (id: string, session?: Session | null) => {
    try {
      return await apiCall<any>(`/troops/${id}`, {
        method: 'DELETE',
      }, session);
    } catch (error) {
      console.error('Failed to delete troop:', error);
      throw error;
    }
  },

  // ============ MERCHANTS ============
  getMerchants: async (session?: Session | null) => {
    try {
      const result = await apiCall<any>('/merchants', {}, session);
      console.log('[API] getMerchants success:', result);
      // Backend returns { merchants: [...], total: N }
      const merchants = result.merchants || result.content || result || [];
      console.log('[API] getMerchants result merchants:', merchants);
      return {
        merchants,
        content: merchants,
      };
    } catch (error) {
      console.error('[API] Failed to fetch merchants from API:', error);
      return { merchants: [], content: [] };
    }
  },

  getMerchantById: async (id: string, session?: Session | null) => {
    try {
      return await apiCall<any>(`/merchants/${id}`, {}, session);
    } catch (error) {
      console.error('Failed to fetch merchant:', error);
      return null;
    }
  },

  createMerchant: async (data: any, session?: Session | null) => {
    try {
      console.log('[API] createMerchant request:', data);
      const result = await apiCall<any>('/merchants', {
        method: 'POST',
        body: JSON.stringify(data),
      }, session);
      console.log('[API] createMerchant response:', result);
      return result;
    } catch (error) {
      console.error('[API] Failed to create merchant:', error);
      throw error;
    }
  },

  updateMerchant: async (id: string, data: any, session?: Session | null) => {
    try {
      console.log('[API] updateMerchant request:', { id, data });
      const result = await apiCall<any>(`/merchants/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }, session);
      console.log('[API] updateMerchant response:', result);
      return result;
    } catch (error) {
      console.error('[API] Failed to update merchant:', error);
      throw error;
    }
  },

  updateMerchantStatus: async (id: string, status: string, session?: Session | null) => {
    try {
      console.log('[API] updateMerchantStatus request:', { id, status });
      const result = await apiCall<any>(`/merchants/${id}/status?status=${status}`, {
        method: 'PATCH',
      }, session);
      console.log('[API] updateMerchantStatus response:', result);
      return result;
    } catch (error) {
      console.error('[API] Failed to update merchant status:', error);
      throw error;
    }
  },

  deleteMerchant: async (id: string, session?: Session | null) => {
    try {
      await apiCall<any>(`/merchants/${id}`, {
        method: 'DELETE',
      }, session);
      return { success: true };
    } catch (error) {
      console.error('Failed to delete merchant:', error);
      throw error;
    }
  },

  // ============ MERCHANT LOCATIONS ============
  createMerchantLocation: async (merchantId: string, data: any, session?: Session | null) => {
    try {
      console.log('[API] createMerchantLocation request:', { merchantId, data });
      const result = await apiCall<any>(`/merchants/${merchantId}/locations`, {
        method: 'POST',
        body: JSON.stringify(data),
      }, session);
      console.log('[API] createMerchantLocation response:', result);
      return result;
    } catch (error) {
      console.error('[API] Failed to create merchant location:', error);
      throw error;
    }
  },

  getMerchantLocations: async (merchantId: string, session?: Session | null) => {
    try {
      const result = await apiCall<any>(`/merchants/${merchantId}/locations`, {}, session);
      return result.locations || result.content || result || [];
    } catch (error) {
      console.error('Failed to fetch merchant locations:', error);
      return [];
    }
  },

  deleteMerchantLocation: async (merchantId: string, locationId: string, session?: Session | null) => {
    try {
      await apiCall<any>(`/merchants/${merchantId}/locations/${locationId}`, {
        method: 'DELETE',
      }, session);
      return { success: true };
    } catch (error) {
      console.error('Failed to delete merchant location:', error);
      throw error;
    }
  },

  // ============ OFFERS ============
  getOffers: async (session?: Session | null) => {
    try {
      const result = await apiCall<any>('/offers', {}, session);
      console.log('[API] getOffers success:', result);
      // Handle both response formats: { data: [...] } from backend and { content: [...] } from mock
      const offers = result.data || result.content || result || [];
      console.log('[API] getOffers result data:', offers);
      return {
        data: offers,
        content: offers,
      };
    } catch (error) {
      console.error('[API] Failed to fetch offers from API:', error);
      return { data: [], content: [] };
    }
  },

  getOfferById: async (id: string, session?: Session | null) => {
    try {
      return await apiCall<any>(`/offers/${id}`, {}, session);
    } catch (error) {
      console.error('Failed to fetch offer:', error);
      return null;
    }
  },

  createOffer: async (data: any, session?: Session | null) => {
    try {
      return await apiCall<any>('/offers', {
        method: 'POST',
        body: JSON.stringify(data),
      }, session);
    } catch (error) {
      console.error('Failed to create offer:', error);
      throw error;
    }
  },

  updateOffer: async (id: string, data: any, session?: Session | null) => {
    try {
      return await apiCall<any>(`/offers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }, session);
    } catch (error) {
      console.error('Failed to update offer:', error);
      throw error;
    }
  },

  deleteOffer: async (id: string, session?: Session | null) => {
    try {
      await apiCall<any>(`/offers/${id}`, {
        method: 'DELETE',
      }, session);
      return { success: true };
    } catch (error) {
      console.error('Failed to delete offer:', error);
      throw error;
    }
  },

  activateOffer: async (id: string, session?: Session | null) => {
    try {
      return await apiCall<any>(`/offers/${id}/activate`, {
        method: 'POST',
      }, session);
    } catch (error) {
      console.error('Failed to activate offer:', error);
      throw error;
    }
  },

  // ============ CAMP CARDS ============
  getCards: async (session?: Session | null) => {
    try {
      const result = await apiCall<any>('/camp-cards', {}, session);
      return {
        content: result.content || result.cards || result || [],
      };
    } catch (error) {
      console.error('Failed to fetch cards from API:', error);
      return { content: [] };
    }
  },

  getCardById: async (id: string, session?: Session | null) => {
    try {
      return await apiCall<any>(`/camp-cards/${id}`, {}, session);
    } catch (error) {
      console.error('Failed to fetch card:', error);
      return null;
    }
  },

  createCard: async (data: any, session?: Session | null) => {
    try {
      return await apiCall<any>('/camp-cards', {
        method: 'POST',
        body: JSON.stringify(data),
      }, session);
    } catch (error) {
      console.error('Failed to create card:', error);
      throw error;
    }
  },

  updateCard: async (id: string, data: any, session?: Session | null) => {
    try {
      return await apiCall<any>(`/camp-cards/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }, session);
    } catch (error) {
      console.error('Failed to update card:', error);
      throw error;
    }
  },

  deleteCard: async (id: string, session?: Session | null) => {
    try {
      await apiCall<any>(`/camp-cards/${id}`, {
        method: 'DELETE',
      }, session);
      return { success: true };
    } catch (error) {
      console.error('Failed to delete card:', error);
      throw error;
    }
  },

  // ============ CATEGORIES ============
  getCategories: async (session?: Session | null) => {
    try {
      const result = await apiCall<any>('/categories', {}, session);
      return {
        content: result.content || result.categories || result || [],
      };
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      return { content: [] };
    }
  },

  getCategoryById: async (id: string, session?: Session | null) => {
    try {
      return await apiCall<any>(`/categories/${id}`, {}, session);
    } catch (error) {
      console.error('Failed to fetch category:', error);
      return null;
    }
  },

  // ============ FEATURE FLAGS ============
  getFeatureFlags: async (queryString?: string, session?: Session | null) => {
    try {
      return await apiCall<any>(`/feature-flags${queryString || ''}`, {}, session);
    } catch (error) {
      console.error('Failed to fetch feature flags:', error);
      return { data: [] };
    }
  },

  getFeatureFlag: async (id: string, session?: Session | null) => {
    try {
      return await apiCall<any>(`/feature-flags/${id}`, {}, session);
    } catch (error) {
      console.error('Failed to fetch feature flag:', error);
      return null;
    }
  },

  createFeatureFlag: async (data: any, session?: Session | null) => {
    try {
      return await apiCall<any>('/feature-flags', {
        method: 'POST',
        body: JSON.stringify(data),
      }, session);
    } catch (error) {
      console.error('Failed to create feature flag:', error);
      throw error;
    }
  },

  updateFeatureFlag: async (id: string, data: any, session?: Session | null) => {
    try {
      return await apiCall<any>(`/feature-flags/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }, session);
    } catch (error) {
      console.error('Failed to update feature flag:', error);
      throw error;
    }
  },

  deleteFeatureFlag: async (id: string, session?: Session | null) => {
    try {
      return await apiCall<any>(`/feature-flags/${id}`, {
        method: 'DELETE',
      }, session);
    } catch (error) {
      console.error('Failed to delete feature flag:', error);
      throw error;
    }
  },

  getFeatureFlagAuditLog: async (id: string, session?: Session | null) => {
    try {
      const response = await apiCall<any>(`/feature-flags/${id}/audit-log`, {}, session);
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch audit log:', error);
      return [];
    }
  },

  // ============ HEALTH CHECK ============
  getHealth: async () => {
    try {
      return await apiCall<any>('/health');
    } catch (error) {
      console.error('Failed to check health:', error);
      return { status: 'error' };
    }
  },

  // ============ AI MARKETING CAMPAIGNS ============
  getCampaigns: async (params?: { status?: string; type?: string; search?: string; page?: number; size?: number }, session?: Session | null) => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append('status', params.status);
      if (params?.type) queryParams.append('type', params.type);
      if (params?.search) queryParams.append('search', params.search);
      if (params?.page !== undefined) queryParams.append('page', String(params.page));
      if (params?.size !== undefined) queryParams.append('size', String(params.size));
      const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
      return await apiCall<any>(`/campaigns${query}`, {}, session);
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
      return { content: [], totalElements: 0, totalPages: 0 };
    }
  },

  getCampaignById: async (id: string, session?: Session | null) => {
    try {
      return await apiCall<any>(`/campaigns/${id}`, {}, session);
    } catch (error) {
      console.error('Failed to fetch campaign:', error);
      return null;
    }
  },

  createCampaign: async (data: any, session?: Session | null) => {
    try {
      return await apiCall<any>('/campaigns', {
        method: 'POST',
        body: JSON.stringify(data),
      }, session);
    } catch (error) {
      console.error('Failed to create campaign:', error);
      throw error;
    }
  },

  updateCampaign: async (id: string, data: any, session?: Session | null) => {
    try {
      return await apiCall<any>(`/campaigns/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }, session);
    } catch (error) {
      console.error('Failed to update campaign:', error);
      throw error;
    }
  },

  updateCampaignStatus: async (id: string, status: string, session?: Session | null) => {
    try {
      return await apiCall<any>(`/campaigns/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }, session);
    } catch (error) {
      console.error('Failed to update campaign status:', error);
      throw error;
    }
  },

  deleteCampaign: async (id: string, session?: Session | null) => {
    try {
      return await apiCall<any>(`/campaigns/${id}`, {
        method: 'DELETE',
      }, session);
    } catch (error) {
      console.error('Failed to delete campaign:', error);
      throw error;
    }
  },

  // Saved Campaigns
  getSavedCampaigns: async (params?: { saveType?: string; search?: string }, session?: Session | null) => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.saveType) queryParams.append('saveType', params.saveType);
      if (params?.search) queryParams.append('search', params.search);
      const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
      return await apiCall<any>(`/campaigns/saved${query}`, {}, session);
    } catch (error) {
      console.error('Failed to fetch saved campaigns:', error);
      return { content: [] };
    }
  },

  saveCampaign: async (data: any, session?: Session | null) => {
    try {
      return await apiCall<any>('/campaigns/saved', {
        method: 'POST',
        body: JSON.stringify(data),
      }, session);
    } catch (error) {
      console.error('Failed to save campaign:', error);
      throw error;
    }
  },

  updateSavedCampaign: async (id: string, data: any, session?: Session | null) => {
    try {
      return await apiCall<any>(`/campaigns/saved/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }, session);
    } catch (error) {
      console.error('Failed to update saved campaign:', error);
      throw error;
    }
  },

  deleteSavedCampaign: async (id: string, session?: Session | null) => {
    try {
      return await apiCall<any>(`/campaigns/saved/${id}`, {
        method: 'DELETE',
      }, session);
    } catch (error) {
      console.error('Failed to delete saved campaign:', error);
      throw error;
    }
  },

  createCampaignFromSaved: async (savedId: string, session?: Session | null) => {
    try {
      return await apiCall<any>(`/campaigns/saved/${savedId}/create`, {
        method: 'POST',
      }, session);
    } catch (error) {
      console.error('Failed to create campaign from saved:', error);
      throw error;
    }
  },

  // AI Content Generation
  generateAIContent: async (data: any, session?: Session | null) => {
    try {
      return await apiCall<any>('/campaigns/ai/generate', {
        method: 'POST',
        body: JSON.stringify(data),
      }, session);
    } catch (error) {
      console.error('Failed to generate AI content:', error);
      throw error;
    }
  },

  generateAIVariations: async (data: any, numVariations: number = 3, session?: Session | null) => {
    try {
      return await apiCall<any>(`/campaigns/ai/generate/variations?numVariations=${numVariations}`, {
        method: 'POST',
        body: JSON.stringify(data),
      }, session);
    } catch (error) {
      console.error('Failed to generate AI variations:', error);
      throw error;
    }
  },

  modifyAIContent: async (data: any, session?: Session | null) => {
    try {
      return await apiCall<any>('/campaigns/ai/modify', {
        method: 'POST',
        body: JSON.stringify(data),
      }, session);
    } catch (error) {
      console.error('Failed to modify AI content:', error);
      throw error;
    }
  },

  optimizeContent: async (data: any, session?: Session | null) => {
    try {
      return await apiCall<any>('/campaigns/ai/optimize', {
        method: 'POST',
        body: JSON.stringify(data),
      }, session);
    } catch (error) {
      console.error('Failed to optimize content:', error);
      throw error;
    }
  },

  suggestCampaign: async (data: any, session?: Session | null) => {
    try {
      return await apiCall<any>('/campaigns/ai/suggest', {
        method: 'POST',
        body: JSON.stringify(data),
      }, session);
    } catch (error) {
      console.error('Failed to suggest campaign:', error);
      throw error;
    }
  },

  analyzeSegment: async (segmentId: string, session?: Session | null) => {
    try {
      return await apiCall<any>(`/campaigns/ai/analyze/segment/${segmentId}`, {}, session);
    } catch (error) {
      console.error('Failed to analyze segment:', error);
      throw error;
    }
  },

  predictCampaignPerformance: async (campaignId: string, session?: Session | null) => {
    try {
      return await apiCall<any>(`/campaigns/${campaignId}/ai/predict`, {}, session);
    } catch (error) {
      console.error('Failed to predict campaign performance:', error);
      throw error;
    }
  },

  executeAIAgentTask: async (data: any, session?: Session | null) => {
    try {
      return await apiCall<any>('/campaigns/ai/agent/task', {
        method: 'POST',
        body: JSON.stringify(data),
      }, session);
    } catch (error) {
      console.error('Failed to execute AI agent task:', error);
      throw error;
    }
  },

  // Segments
  getMarketingSegments: async (session?: Session | null) => {
    try {
      return await apiCall<any>('/campaigns/segments', {}, session);
    } catch (error) {
      console.error('Failed to fetch segments:', error);
      return [];
    }
  },

  // ============ DASHBOARD / ANALYTICS ============
  getDashboard: async (session?: Session | null) => {
    try {
      return await apiCall<any>('/dashboard', {}, session);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      return null;
    }
  },

  getDashboardSummary: async (session?: Session | null) => {
    try {
      return await apiCall<any>('/dashboard/summary', {}, session);
    } catch (error) {
      console.error('Failed to fetch dashboard summary:', error);
      return null;
    }
  },

  getTroopSales: async (session?: Session | null) => {
    try {
      return await apiCall<any>('/dashboard/troop-sales', {}, session);
    } catch (error) {
      console.error('Failed to fetch troop sales:', error);
      return [];
    }
  },

  getTroopRecruiting: async (session?: Session | null) => {
    try {
      return await apiCall<any>('/dashboard/troop-recruiting', {}, session);
    } catch (error) {
      console.error('Failed to fetch troop recruiting:', error);
      return [];
    }
  },

  getScoutSales: async (session?: Session | null) => {
    try {
      return await apiCall<any>('/dashboard/scout-sales', {}, session);
    } catch (error) {
      console.error('Failed to fetch scout sales:', error);
      return [];
    }
  },

  getScoutReferrals: async (session?: Session | null) => {
    try {
      return await apiCall<any>('/dashboard/scout-referrals', {}, session);
    } catch (error) {
      console.error('Failed to fetch scout referrals:', error);
      return [];
    }
  },

  getCustomerReferrals: async (session?: Session | null) => {
    try {
      return await apiCall<any>('/dashboard/customer-referrals', {}, session);
    } catch (error) {
      console.error('Failed to fetch customer referrals:', error);
      return [];
    }
  },

  getSalesTrend: async (session?: Session | null) => {
    try {
      return await apiCall<any>('/dashboard/sales-trend', {}, session);
    } catch (error) {
      console.error('Failed to fetch sales trend:', error);
      return [];
    }
  },
};
