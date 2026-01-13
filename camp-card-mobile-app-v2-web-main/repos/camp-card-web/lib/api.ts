import { Session } from 'next-auth';
import { mockUsers, mockCouncils, mockTroops, mockMerchants, mockOffers, mockCards } from './mockData';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7010/api/v1';
const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:7010';

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
 baseUrl: string = API_BASE_URL,
): Promise<T> {
 const headers: Record<string, string> = {
 'Content-Type': 'application/json',
 };

 if (options.headers && typeof options.headers === 'object' && !(options.headers instanceof Headers)) {
 Object.assign(headers, options.headers as Record<string, string>);
 }

 if (session?.user && 'accessToken' in session.user) {
 const token = (session.user as any).accessToken;
 console.log('[API] Adding auth token:', token ? `${token.substring(0, 20)}...` : 'null');
 headers.Authorization = `Bearer ${token}`;
 } else {
 console.warn('[API] No session or accessToken found. Session:', session);
 }

 try {
 const controller = new AbortController();
 const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

 const response = await fetch(`${baseUrl}${endpoint}`, {
 ...options,
 headers,
 signal: controller.signal,
 });

 clearTimeout(timeoutId);

 if (!response.ok) {
 throw new ApiError(response.status, `API Error: ${response.status}`);
 }

 return response.json();
 } catch (error) {
 // If the request fails (timeout, network error, etc), throw to trigger fallback
 throw error;
 }
}

export const api = {
 // ============ USERS ============
 getUsers: async (session?: Session | null) => {
 const result = await apiCall<any>('/users', {}, session);
 const users = result.content || result.users || result || [];

 // Map backend role to frontend role
 const roleMapping: Record<string, string> = {
 'NATIONAL_ADMIN': 'super_admin',
 'SYSTEM_ADMIN': 'system_admin',
 'COUNCIL_ADMIN': 'council',
 'TROOP_LEADER': 'troop_leader',
 'SCOUT': 'scout',
 'PARENT': 'customer',
 };

 // Transform backend response to include 'name' field and map role
 const transformedUsers = Array.isArray(users) ? users.map((user: any) => ({
 id: user.id,
 name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
 email: user.email,
 role: roleMapping[user.role] || 'scout',
 status: user.isActive ? 'active' : 'inactive',
 firstName: user.firstName,
 lastName: user.lastName,
 isActive: user.isActive,
 })) : [];

 return {
 content: transformedUsers
 };
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
 console.log('[API] createUser request:', data);
 const result = await apiCall<any>('/users', {
 method: 'POST',
 body: JSON.stringify(data),
 }, session);
 console.log('[API] createUser response:', result);
 return result;
 } catch (error) {
 console.error('[API] Failed to create user:', error);
 // Re-throw the error instead of silently falling back to mock data
 throw error;
 }
 },

 updateUser: async (id: string, data: any, session?: Session | null) => {
 console.log('[API] updateUser request:', id, data);
 const result = await apiCall<any>(`/users/${id}`, {
 method: 'PUT',
 body: JSON.stringify(data),
 }, session);
 console.log('[API] updateUser response:', result);
 return result;
 },

 deleteUser: async (id: string, session?: Session | null) => {
 console.log('[API] deleteUser request:', id);
 const result = await apiCall<any>(`/users/${id}`, {
 method: 'DELETE',
 }, session);
 console.log('[API] deleteUser response:', result);
 return result;
 },

 // ============ ORGANIZATIONS ============
 getOrganizations: async (session?: Session | null) => {
 console.log('[API] Fetching councils from /api/v1/councils');
 const result = await apiCall<any>('/councils', {}, session);
 console.log('[API] Councils response:', result);
 return {
 content: result.content || result.councils || result || []
 };
 },

 getOrganizationById: async (id: string, session?: Session | null) => {
 return await apiCall<any>(`/councils/${id}`, {}, session);
 },

 createOrganization: async (data: any, session?: Session | null) => {
 console.log('[API] Creating council:', data);
 const result = await apiCall<any>('/councils', {
 method: 'POST',
 body: JSON.stringify(data),
 }, session);
 console.log('[API] Council created:', result);
 return result;
 },

 updateOrganization: async (id: string, data: any, session?: Session | null) => {
 console.log('[API] Updating council:', id, data);
 const result = await apiCall<any>(`/councils/${id}`, {
 method: 'PUT',
 body: JSON.stringify(data),
 }, session);
 console.log('[API] Council updated:', result);
 return result;
 },

 deleteOrganization: async (id: string, session?: Session | null) => {
 console.log('[API] Deleting council:', id);
 const result = await apiCall<any>(`/councils/${id}`, {
 method: 'DELETE',
 }, session);
 console.log('[API] Organization deleted:', result);
 return result;
 },

 // ============ TROOPS ============
 getTroops: async (session?: Session | null) => {
 console.log('[API] Fetching troops');
 const result = await apiCall<any>('/api/troops', {}, session, API_BASE);
 console.log('[API] Troops response:', result);
 return {
 content: result.content || result.troops || result || []
 };
 },

 getTroopById: async (id: string, session?: Session | null) => {
 try {
 return await apiCall<any>(`/api/troops/${id}`, {}, session, API_BASE);
 } catch (error) {
 console.error('Failed to fetch troop:', error);
 return null;
 }
 },

 createTroop: async (data: any, session?: Session | null) => {
 console.log('[API] Creating troop:', data);
 const result = await apiCall<any>('/api/troops', {
 method: 'POST',
 body: JSON.stringify(data),
 }, session, API_BASE);
 console.log('[API] Troop created:', result);
 return result;
 },

 updateTroop: async (id: string, data: any, session?: Session | null) => {
 console.log('[API] Updating troop:', id, data);
 const result = await apiCall<any>(`/api/troops/${id}`, {
 method: 'PUT',
 body: JSON.stringify(data),
 }, session, API_BASE);
 console.log('[API] Troop updated:', result);
 return result;
 },

 deleteTroop: async (id: string, session?: Session | null) => {
 console.log('[API] Deleting troop:', id);
 const result = await apiCall<any>(`/api/troops/${id}`, {
 method: 'DELETE',
 }, session, API_BASE);
 console.log('[API] Troop deleted:', result);
 return result;
 },

 // ============ MERCHANTS ============
 getMerchants: async (session?: Session | null) => {
 const result = await apiCall<any>('/merchants', {}, session);
 console.log('[API] getMerchants success:', result);
 // Backend returns { merchants: [...], total: N }
 const merchants = result.merchants || result.content || result || [];
 console.log('[API] getMerchants result merchants:', merchants);
 return {
 merchants: merchants,
 content: merchants
 };
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
 console.log('[API] createMerchant request:', data);
 const result = await apiCall<any>('/merchants', {
 method: 'POST',
 body: JSON.stringify(data),
 }, session);
 console.log('[API] createMerchant response:', result);
 return result;
 },

 updateMerchant: async (id: string, data: any, session?: Session | null) => {
 console.log('[API] updateMerchant request:', { id, data });
 const result = await apiCall<any>(`/merchants/${id}`, {
 method: 'PUT',
 body: JSON.stringify(data),
 }, session);
 console.log('[API] updateMerchant response:', result);
 return result;
 },

 deleteMerchant: async (id: string, session?: Session | null) => {
 await apiCall<any>(`/merchants/${id}`, {
 method: 'DELETE',
 }, session);
 return { success: true };
 },

 // ============ OFFERS ============
 getOffers: async (session?: Session | null) => {
 const result = await apiCall<any>('/api/offers', {}, session, API_BASE);
 console.log('[API] getOffers success:', result);
 // Handle both response formats: { data: [...] } from backend and { content: [...] } from mock
 const offers = result.data || result.content || result || [];
 console.log('[API] getOffers result data:', offers);
 return {
 data: offers,
 content: offers
 };
 },

 getOfferById: async (id: string, session?: Session | null) => {
 try {
 return await apiCall<any>(`/api/offers/${id}`, {}, session, API_BASE);
 } catch (error) {
 console.error('Failed to fetch offer:', error);
 return null;
 }
 },

 createOffer: async (data: any, session?: Session | null) => {
 return await apiCall<any>('/api/offers', {
 method: 'POST',
 body: JSON.stringify(data),
 }, session, API_BASE);
 },

 updateOffer: async (id: string, data: any, session?: Session | null) => {
 return await apiCall<any>(`/api/offers/${id}`, {
 method: 'PUT',
 body: JSON.stringify(data),
 }, session, API_BASE);
 },

 deleteOffer: async (id: string, session?: Session | null) => {
 return await apiCall<any>(`/api/offers/${id}`, {
 method: 'DELETE',
 }, session, API_BASE);
 },

 activateOffer: async (id: string, session?: Session | null) => {
 return await apiCall<any>(`/api/offers/${id}/activate`, {
 method: 'POST',
 }, session, API_BASE);
 },

 // ============ CAMP CARDS ============
 getCards: async (session?: Session | null) => {
 const result = await apiCall<any>('/camp-cards', {}, session);
 return {
 content: result.content || result.cards || result || []
 };
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
 return await apiCall<any>('/camp-cards', {
 method: 'POST',
 body: JSON.stringify(data),
 }, session);
 },

 updateCard: async (id: string, data: any, session?: Session | null) => {
 return await apiCall<any>(`/camp-cards/${id}`, {
 method: 'PUT',
 body: JSON.stringify(data),
 }, session);
 },

 deleteCard: async (id: string, session?: Session | null) => {
 return await apiCall<any>(`/camp-cards/${id}`, {
 method: 'DELETE',
 }, session);
 },

 // ============ CATEGORIES ============
 getCategories: async (session?: Session | null) => {
 try {
 const result = await apiCall<any>('/categories', {}, session);
 return {
 content: result.content || result.categories || result || []
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
};
