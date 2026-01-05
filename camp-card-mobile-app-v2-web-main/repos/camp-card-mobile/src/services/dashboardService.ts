import { apiClient } from './apiClient';

export interface ScoutDashboard {
 recruits_count: number;
 active_scouts: number;
 total_redemptions: number;
 total_earnings: number;
 recruitment_pipeline?: {
 pending: number;
 accepted: number;
 rejected: number;
 };
 recent_activity?: Array<{
 type: string;
 message: string;
 timestamp: string;
 }>;
}

export interface LeaderDashboard {
 scouts_count: number;
 active_scouts: number;
 recruitment_pipeline?: {
 pending: number;
 accepted: number;
 rejected: number;
 };
 total_earnings: number;
 top_referrals?: Array<{
 scout_name: string;
 referrals_count: number;
 earnings: number;
 }>;
 recent_activity?: Array<{
 type: string;
 message: string;
 timestamp: string;
 }>;
}

export interface Scout {
 id: string;
 name: string;
 email: string;
 troop_number: string;
 status: 'active' | 'inactive' | 'invited';
 recruits_count: number;
 total_earnings: number;
 joined_date: string;
}

/**
 * Fetch Scout dashboard data
 * Endpoint: GET /scout/dashboard
 */
export async function fetchScoutDashboard(): Promise<ScoutDashboard> {
 try {
 const response = await apiClient.get<{ dashboard: ScoutDashboard }>(
 '/scout/dashboard'
 );
 return response.data.dashboard;
 } catch {
 // Fallback mock data
 return {
 recruits_count: 0,
 active_scouts: 0,
 total_redemptions: 0,
 total_earnings: 0,
 recruitment_pipeline: {
 pending: 0,
 accepted: 0,
 rejected: 0,
 },
 recent_activity: [],
 };
 }
}

/**
 * Fetch Leader dashboard data
 * Endpoint: GET /leader/dashboard
 */
export async function fetchLeaderDashboard(): Promise<LeaderDashboard> {
 try {
 const response = await apiClient.get<{ dashboard: LeaderDashboard }>(
 '/leader/dashboard'
 );
 return response.data.dashboard;
 } catch {
 // Fallback mock data
 return {
 scouts_count: 0,
 active_scouts: 0,
 recruitment_pipeline: {
 pending: 0,
 accepted: 0,
 rejected: 0,
 },
 total_earnings: 0,
 top_referrals: [],
 recent_activity: [],
 };
 }
}

/**
 * Fetch list of scouts managed by leader
 * Endpoint: GET /leader/scouts
 */
export async function fetchScoutsList(): Promise<Scout[]> {
 try {
 const response = await apiClient.get<{ scouts: Scout[] }>(
 '/leader/scouts'
 );
 return response.data.scouts;
 } catch {
 return [];
 }
}

/**
 * Log scout share
 * Endpoint: POST /scout/share
 */
export async function logScoutShare(platform: string): Promise<{ success: boolean }> {
 try {
 const response = await apiClient.post<{ success: boolean }>(
 '/scout/share',
 { platform }
 );
 return response.data;
 } catch {
 return { success: true };
 }
}

/**
 * Log leader/troop share
 * Endpoint: POST /leader/share
 */
export async function logLeaderShare(platform: string): Promise<{ success: boolean }> {
 try {
 const response = await apiClient.post<{ success: boolean }>(
 '/leader/share',
 { platform }
 );
 return response.data;
 } catch {
 return { success: true };
 }
}
