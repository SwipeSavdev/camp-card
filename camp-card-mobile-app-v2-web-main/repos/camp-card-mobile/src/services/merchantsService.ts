import { apiClient } from './apiClient';

export type MerchantLocation = {
 id?: number | string;
 name?: string;
 address?: string;
 street_address?: string;
 city?: string;
 state?: string;
 zip_code?: string;
 distance_km?: number;
 latitude?: number;
 longitude?: number;
};

export type Merchant = {
 id: string | number;
 uuid?: string;
 business_name: string;
 category?: string;
 email?: string;
 phone_number?: string;
 website_url?: string;
 logo_url?: string;
 banner_url?: string;
 is_active?: boolean;
 verified?: boolean;
 locations?: MerchantLocation[];
 total_locations?: number;
 total_offers?: number;
 created_at?: string;
 updated_at?: string;
};

export type MerchantListResponse = {
 data?: Merchant[];
 merchants?: Merchant[];
 pagination?: {
 total?: number;
 limit?: number;
 offset?: number;
 has_more?: boolean;
 };
};

export type MerchantDetailsResponse = {
 merchant: Merchant;
};

/**
 * Mock merchants data for fallback when API is unavailable
 */
function mockMerchants(): Merchant[] {
 return [
 {
 id: '00000000-0000-0000-0000-000000000101',
 business_name: 'Pizza Palace',
 category: 'DINING',
 email: 'info@pizzapalace.com',
 phone_number: '+1-407-555-0101',
 website_url: 'https://pizzapalace.com',
 logo_url: 'https://via.placeholder.com/100?text=Pizza+Palace',
 is_active: true,
 verified: true,
 locations: [
 {
 id: 1,
 name: 'Pizza Palace Downtown',
 address: '123 Main St, Orlando, FL 32801',
 latitude: 28.5383,
 longitude: -81.3792,
 distance_km: 2.3,
 },
 {
 id: 2,
 name: 'Pizza Palace Airport',
 address: '456 Airport Blvd, Orlando, FL 32822',
 latitude: 28.4312,
 longitude: -81.3089,
 distance_km: 5.1,
 },
 ],
 total_locations: 2,
 total_offers: 8,
 },
 {
 id: '00000000-0000-0000-0000-000000000102',
 business_name: 'AutoCare',
 category: 'AUTO',
 email: 'service@autocare.com',
 phone_number: '+1-407-555-0102',
 website_url: 'https://autocare.com',
 logo_url: 'https://via.placeholder.com/100?text=AutoCare',
 is_active: true,
 verified: true,
 locations: [
 {
 id: 3,
 name: 'AutoCare Downtown',
 address: '234 Service Rd, Orlando, FL 32801',
 latitude: 28.5400,
 longitude: -81.3800,
 distance_km: 3.0,
 },
 ],
 total_locations: 1,
 total_offers: 5,
 },
 {
 id: '00000000-0000-0000-0000-000000000103',
 business_name: 'Fun Zone',
 category: 'ENTERTAINMENT',
 email: 'info@funzone.com',
 phone_number: '+1-407-555-0103',
 website_url: 'https://funzone.com',
 logo_url: 'https://via.placeholder.com/100?text=Fun+Zone',
 is_active: true,
 verified: true,
 locations: [
 {
 id: 4,
 name: 'Fun Zone Front Gate',
 address: '321 Entertainment Dr, Orlando, FL 32801',
 latitude: 28.5420,
 longitude: -81.3820,
 distance_km: 1.8,
 },
 ],
 total_locations: 1,
 total_offers: 3,
 },
 ];
}

/**
 * Get all merchants
 * Endpoint: GET /merchants
 * @param args Optional query parameters (limit, offset, category, search)
 */
export async function listMerchants(args?: {
 limit?: number;
 offset?: number;
 category?: string;
 search?: string;
}): Promise<Merchant[]> {
 try {
 const res = await apiClient.get<MerchantListResponse>('/merchants', {
 params: args,
 });

 // Handle both response formats
 return res.data?.data ?? res.data?.merchants ?? [];
 } catch (error) {
 console.warn('[merchantsService] Failed to fetch merchants, using mock data:', error);
 // Keep UX unblocked while backend is being wired
 return mockMerchants();
 }
}

/**
 * Get a specific merchant by ID
 * Endpoint: GET /merchants/{merchant_id}
 * @param id Merchant ID or UUID
 */
export async function getMerchant(
 id: string | number
): Promise<Merchant | null> {
 try {
 const res = await apiClient.get<MerchantDetailsResponse>(`/merchants/${id}`);
 return res.data?.merchant ?? null;
 } catch (error) {
 console.warn(`[merchantsService] Failed to fetch merchant ${id}, using mock data:`, error);
 // Fallback to mock
 const fallback = mockMerchants().find(m => String(m.id) === String(id));
 return fallback ?? null;
 }
}

/**
 * Get nearby merchants based on location
 * Endpoint: GET /merchants/nearby
 * @param latitude User latitude
 * @param longitude User longitude
 * @param radius_km Search radius in kilometers
 */
export async function getNearbyMerchants(
 latitude: number,
 longitude: number,
 radius_km: number = 10
): Promise<Merchant[]> {
 try {
 const res = await apiClient.get<MerchantListResponse>('/merchants/nearby', {
 params: {
 latitude,
 longitude,
 radius_km,
 },
 });

 // Handle both response formats
 return res.data?.data ?? res.data?.merchants ?? [];
 } catch (error) {
 console.warn('[merchantsService] Failed to fetch nearby merchants, using mock data:', error);
 // Fallback: calculate distance from mock merchants
 const merchants = mockMerchants();
 return merchants.map(m => {
 // Calculate approximate distance (simplified)
 if (m.locations?.[0]) {
 const loc = m.locations[0];
 const distance = Math.sqrt(
 Math.pow(loc.latitude! - latitude, 2) + Math.pow(loc.longitude! - longitude, 2)
 ) * 111; // Rough km conversion
 return {
 ...m,
 locations: m.locations.map(l => ({ ...l, distance_km: distance })),
 };
 }
 return m;
 }).filter(m => {
 const dist = m.locations?.[0]?.distance_km ?? 0;
 return dist <= radius_km;
 });
 }
}

/**
 * Get merchant locations
 * Endpoint: GET /merchants/{merchant_id}/locations
 * @param merchantId Merchant ID or UUID
 */
export async function getMerchantLocations(
 merchantId: string | number
): Promise<MerchantLocation[]> {
 try {
 const res = await apiClient.get<{ locations: MerchantLocation[] }>(
 `/merchants/${merchantId}/locations`
 );
 return res.data?.locations ?? [];
 } catch (error) {
 console.warn(
 `[merchantsService] Failed to fetch locations for merchant ${merchantId}:`,
 error
 );
 // Fallback: get from merchant data
 const merchant = mockMerchants().find(m => String(m.id) === String(merchantId));
 return merchant?.locations ?? [];
 }
}

/**
 * Create a new merchant (admin/partner only)
 * Endpoint: POST /merchants
 */
export async function createMerchant(data: Partial<Merchant>): Promise<Merchant | null> {
 try {
 const res = await apiClient.post<MerchantDetailsResponse>('/merchants', data);
 return res.data?.merchant ?? null;
 } catch (error) {
 console.error('[merchantsService] Failed to create merchant:', error);
 throw error;
 }
}

/**
 * Update a merchant (admin/partner only)
 * Endpoint: PUT /merchants/{merchant_id}
 */
export async function updateMerchant(
 id: string | number,
 data: Partial<Merchant>
): Promise<Merchant | null> {
 try {
 const res = await apiClient.put<MerchantDetailsResponse>(`/merchants/${id}`, data);
 return res.data?.merchant ?? null;
 } catch (error) {
 console.error(`[merchantsService] Failed to update merchant ${id}:`, error);
 throw error;
 }
}

/**
 * Delete a merchant (admin only)
 * Endpoint: DELETE /merchants/{merchant_id}
 */
export async function deleteMerchant(id: string | number): Promise<boolean> {
 try {
 await apiClient.delete(`/merchants/${id}`);
 return true;
 } catch (error) {
 console.error(`[merchantsService] Failed to delete merchant ${id}:`, error);
 throw error;
 }
}
