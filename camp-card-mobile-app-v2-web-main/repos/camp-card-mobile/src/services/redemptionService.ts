import { apiClient } from './apiClient';

export type RedemptionCode = {
 id: string;
 code: string;
 qr_code_data?: string;
 qr_code_image_url?: string;
 offer?: {
 title?: string;
 merchant?: string;
 };
 location?: {
 name?: string;
 address?: string;
 };
 expires_at?: string;
 instructions?: string;
};

export async function activateOffer(params: {
 offerId: number | string;
 location_id?: number;
}): Promise<RedemptionCode> {
 try {
 const res = await apiClient.post<{ redemption_code: RedemptionCode }>(
 `/offers/${params.offerId}/activate`,
 { location_id: params.location_id }
 );

 return res.data.redemption_code;
 } catch {
 // Fallback mock
 return {
 id: 'code-uuid',
 code: '1234-5678',
 qr_code_data: 'https://campcard.app/redeem/code-uuid',
 offer: { title: 'Sample Offer', merchant: 'Sample Merchant' },
 location: { name: 'Main Location', address: '123 Main St' },
 expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
 instructions: 'Show this code to cashier at checkout',
 };
 }
}
