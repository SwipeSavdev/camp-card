import { apiClient } from './apiClient';
import { useAuthStore } from '../store/authStore';

// Types based on docs/build-specification/PART-05-API-SPECIFICATIONS.md
export type OfferLocation = {
 id: number;
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

export type OfferMerchant = {
 id: number;
 business_name: string;
 category?: string;
 logo_url?: string;
 website_url?: string;
};

export type OfferListItem = {
 id: number;
 uuid?: string;
 merchant: OfferMerchant;
 title: string;
 description: string;
 category: string;
 valid_from?: string;
 valid_until?: string;
 usage_type?: string;
 redemption_method?: string;
 locations?: OfferLocation[];
 can_redeem?: boolean;
};

export type OfferListResponse = {
 data: OfferListItem[];
 pagination?: {
 total?: number;
 limit?: number;
 offset?: number;
 has_more?: boolean;
 };
};

export type OfferDetailsResponse = {
 offer: OfferListItem & {
 redemptions_count?: number;
 user_redemption_count?: number;
 };
};

function mockOffers(): OfferListItem[] {
 return [
 {
 id: 123,
 uuid: 'offer-uuid-1',
 merchant: { id: 45, business_name: 'Pizza Palace', category: 'DINING' },
 title: '20% off entire purchase',
 description: 'Valid on dine-in or takeout. Excludes alcohol.',
 category: 'DINING',
 valid_from: '2025-12-01',
 valid_until: '2025-12-31',
 usage_type: 'UNLIMITED',
 locations: [
 { id: 78, name: 'Downtown', address: '123 Main St, Orlando, FL', distance_km: 2.3 },
 ],
 can_redeem: true,
 },
 {
 id: 124,
 uuid: 'offer-uuid-2',
 merchant: { id: 46, business_name: 'AutoCare', category: 'AUTO' },
 title: '$10 off oil change',
 description: 'Includes up to 5 quarts. Appointment recommended.',
 category: 'AUTO',
 valid_until: '2026-01-15',
 usage_type: 'UNLIMITED',
 locations: [{ id: 79, name: 'Main', address: '55 Service Rd', distance_km: 5.1 }],
 can_redeem: true,
 },
 {
 id: 125,
 uuid: 'offer-uuid-3',
 merchant: { id: 47, business_name: 'Fun Zone', category: 'ENTERTAINMENT' },
 title: 'Buy 1 get 1 50% off',
 description: 'Valid on weekday tickets only.',
 category: 'ENTERTAINMENT',
 valid_until: '2026-02-01',
 usage_type: 'LIMITED',
 locations: [{ id: 80, name: 'Front Gate', address: '800 Park Ave', distance_km: 12.2 }],
 can_redeem: false,
 },
 ];
}

export async function listOffers(args?: {
 category?: string;
 latitude?: number;
 longitude?: number;
 radius_km?: number;
 limit?: number;
 offset?: number;
}): Promise<OfferListItem[]> {
 const { user, isAuthenticated } = useAuthStore.getState();
 const council_id = !isAuthenticated ? user?.tenantId : undefined;

 try {
 const res = await apiClient.get<OfferListResponse>('/offers', {
 params: {
 ...args,
 ...(council_id ? { council_id } : {}),
 },
 });

 return res.data?.data ?? [];
 } catch {
 // Keep UX unblocked while backend wiring is completed
 return mockOffers();
 }
}

export async function getOffer(
 id: number | string
): Promise<OfferDetailsResponse['offer'] | null> {
 try {
 const res = await apiClient.get<OfferDetailsResponse>(`/offers/${id}`);
 return res.data.offer ?? null;
 } catch {
 const fallback = mockOffers().find(o => String(o.id) === String(id));
 return fallback ? (fallback as any) : null;
 }
}
