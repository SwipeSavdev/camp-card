import { apiClient } from './apiClient';

// Utility function to generate a safe fallback referral code
export function generateFallbackReferralCode(userId: string | number): string {
 if (!userId) return 'REF-DEMO00';

 const userIdStr = String(userId);
 // Take first 8 chars if available, pad with zeros if less
 const safeId = userIdStr.substring(0, 8).toUpperCase().padEnd(8, '0');
 return `REF-${safeId}`;
}

export interface ReferralCode {
 code: string;
 url: string;
 expires_at?: string;
}

export interface ReferralStats {
 total_shares: number;
 total_signups: number;
 total_earnings: number;
}

export interface ReferralHistory {
 id: string;
 referred_user_name: string;
 referred_user_email: string;
 signup_date: string;
 first_purchase_date?: string;
 earnings_amount: number;
 status: 'pending' | 'completed' | 'expired';
}

export interface ReferralData {
 code: string;
 url: string;
 stats: ReferralStats;
 history: ReferralHistory[];
}

/**
 * Generate a new referral code for the user
 * Endpoint: POST /users/{userId}/referral/generate
 */
export async function generateReferralCode(userId: string): Promise<ReferralCode> {
 try {
 const response = await apiClient.post<{ referral_code: ReferralCode }>(
 `/users/${userId}/referral/generate`
 );
 return response.data.referral_code;
 } catch {
 // Fallback mock code
 return {
 code: `REF-${userId.substring(0, 6).toUpperCase()}`,
 url: `https://campcard.app/r/REF-${userId.substring(0, 6).toUpperCase()}`,
 expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
 };
 }
}

/**
 * Log a referral share event
 * Endpoint: POST /users/{userId}/referral/share
 */
export async function logReferralShare(
 userId: string,
 platform: 'sms' | 'email' | 'whatsapp' | 'facebook' | 'twitter' | 'copy'
): Promise<{ success: boolean }> {
 try {
 const response = await apiClient.post<{ success: boolean }>(
 `/users/${userId}/referral/share`,
 { platform }
 );
 return response.data;
 } catch {
 // Return success even if logging fails
 return { success: true };
 }
}

/**
 * Fetch all referral data (code, stats, and history)
 * Endpoint: GET /users/{userId}/referral-data (or composite)
 */
export async function fetchReferralData(userId: string): Promise<ReferralData> {
 try {
 // Try to fetch all referral data at once
 const response = await apiClient.get<{ referral_data: ReferralData }>(
 `/users/${userId}/referral-data`
 );
 return response.data.referral_data;
 } catch {
 // Fallback: return default structure
 return {
 code: `REF-${userId.substring(0, 6).toUpperCase()}`,
 url: `https://campcard.app/r/REF-${userId.substring(0, 6).toUpperCase()}`,
 stats: {
 total_shares: 0,
 total_signups: 0,
 total_earnings: 0,
 },
 history: [],
 };
 }
}

/**
 * Fetch referral stats only
 * Endpoint: GET /users/{userId}/referral-stats
 */
export async function fetchReferralStats(userId: string): Promise<ReferralStats> {
 try {
 const response = await apiClient.get<{ stats: ReferralStats }>(
 `/users/${userId}/referral-stats`
 );
 return response.data.stats;
 } catch {
 return {
 total_shares: 0,
 total_signups: 0,
 total_earnings: 0,
 };
 }
}

/**
 * Fetch referral history
 * Endpoint: GET /users/{userId}/referral-history
 */
export async function fetchReferralHistory(userId: string): Promise<ReferralHistory[]> {
 try {
 const response = await apiClient.get<{ referrals: ReferralHistory[] }>(
 `/users/${userId}/referral-history`
 );
 return response.data.referrals;
 } catch {
 return [];
 }
}
