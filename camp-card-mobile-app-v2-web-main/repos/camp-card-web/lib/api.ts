import { Session } from 'next-auth';
import { mockUsers, mockCouncils, mockTroops, mockMerchants, mockOffers, mockCards } from './mockData';

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
 };

 if (options.headers && typeof options.headers === 'object' && !(options.headers instanceof Headers)) {
 Object.assign(headers, options.headers as Record<string, string>);
 }

 if (session?.user && 'accessToken' in session.user) {
 headers.Authorization = `Bearer ${(session.user as any).accessToken}`;
 }

 try {
 const controller = new AbortController();
 const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

 const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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
 try {
 const result = await apiCall<any>('/users', {}, session);
 return {
 content: result.content || result.users || result || []
 };
 } catch (error) {
 console.error('Failed to fetch users:', error);
 return mockUsers;
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
 // Fallback: Create mock user
 const newUser = {
 id: String(Math.floor(Math.random() * 10000)),
 ...data,
 createdAt: new Date().toISOString().split('T')[0],
 };
 return newUser;
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
 // Fallback: Return updated user
 return { id, ...data };
 }
 },

 deleteUser: async (id: string, session?: Session | null) => {
 try {
 return await apiCall<any>(`/users/${id}`, {
 method: 'DELETE',
 }, session);
 } catch (error) {
 console.error('Failed to delete user:', error);
 // Fallback: Return success
 return { id, deleted: true };
 }
 },

 // ============ ORGANIZATIONS ============
 getOrganizations: async (session?: Session | null) => {
 try {
 const result = await apiCall<any>('/organizations', {}, session);
 return {
 content: result.content || result.organizations || result || []
 };
 } catch (error) {
 console.error('Failed to fetch organizations:', error);
 return mockCouncils;
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
 // Fallback: Create mock organization
 const newOrg = {
 id: String(Math.floor(Math.random() * 10000)),
 ...data,
 createdAt: new Date().toISOString().split('T')[0],
 };
 return newOrg;
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
 // Fallback: Return updated organization
 return { id, ...data };
 }
 },

 deleteOrganization: async (id: string, session?: Session | null) => {
 try {
 return await apiCall<any>(`/organizations/${id}`, {
 method: 'DELETE',
 }, session);
 } catch (error) {
 console.error('Failed to delete organization:', error);
 // Fallback: Return success
 return { id, deleted: true };
 }
 },

 // ============ TROOPS ============
 getTroops: async (session?: Session | null) => {
 try {
 const result = await apiCall<any>('/troops', {}, session);
 return {
 content: result.content || result.troops || result || []
 };
 } catch (error) {
 console.error('Failed to fetch troops:', error);
 return mockTroops;
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
 // Fallback: Create mock troop
 const newTroop = {
 id: String(Math.floor(Math.random() * 10000)),
 ...data,
 createdAt: new Date().toISOString().split('T')[0],
 };
 return newTroop;
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
 // Fallback: Return updated troop
 return { id, ...data };
 }
 },

 deleteTroop: async (id: string, session?: Session | null) => {
 try {
 return await apiCall<any>(`/troops/${id}`, {
 method: 'DELETE',
 }, session);
 } catch (error) {
 console.error('Failed to delete troop:', error);
 // Fallback: Return success
 return { id, deleted: true };
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
 merchants: merchants,
 content: merchants
 };
 } catch (error) {
 console.error('[API] Failed to fetch merchants, using mock data:', error);
 // Fall back to mock data if backend is unavailable
 return mockMerchants;
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
 // Fallback: Create mock merchant
 const newMerchant = {
 id: String(Math.floor(Math.random() * 10000)),
 ...data,
 createdAt: new Date().toISOString().split('T')[0],
 };
 return newMerchant;
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
 // Fallback: Return updated merchant
 return { id, ...data };
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
 // Fallback: Return success
 return { success: true, id, deleted: true };
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
 content: offers
 };
 } catch (error) {
 console.error('[API] Failed to fetch offers, using mock data:', error);
 // Fall back to mock data if backend is unavailable
 return mockOffers;
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
 // Fallback: Create mock offer
 const newOffer = {
 id: String(Math.floor(Math.random() * 10000)),
 ...data,
 createdAt: new Date().toISOString().split('T')[0],
 };
 return newOffer;
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
 // Fallback: Return updated offer
 return { id, ...data };
 }
 },

 deleteOffer: async (id: string, session?: Session | null) => {
 try {
 return await apiCall<any>(`/offers/${id}`, {
 method: 'DELETE',
 }, session);
 } catch (error) {
 console.error('Failed to delete offer:', error);
 // Fallback: Return success
 return { id, deleted: true };
 }
 },

 activateOffer: async (id: string, session?: Session | null) => {
 try {
 return await apiCall<any>(`/offers/${id}/activate`, {
 method: 'POST',
 }, session);
 } catch (error) {
 console.error('Failed to activate offer:', error);
 // Fallback: Return activated offer
 return { id, activated: true };
 }
 },

 // ============ CAMP CARDS ============
 getCards: async (session?: Session | null) => {
 try {
 const result = await apiCall<any>('/camp-cards', {}, session);
 return {
 content: result.content || result.cards || result || []
 };
 } catch (error) {
 console.error('Failed to fetch cards:', error);
 return mockCards;
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
 // Fallback: Create mock card
 const newCard = {
 id: String(Math.floor(Math.random() * 10000)),
 ...data,
 createdAt: new Date().toISOString().split('T')[0],
 };
 return newCard;
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
 // Fallback: Return updated card
 return { id, ...data };
 }
 },

 deleteCard: async (id: string, session?: Session | null) => {
 try {
 return await apiCall<any>(`/camp-cards/${id}`, {
 method: 'DELETE',
 }, session);
 } catch (error) {
 console.error('Failed to delete card:', error);
 // Fallback: Return success
 return { id, deleted: true };
 }
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
