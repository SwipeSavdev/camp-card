import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import { ENV } from '../config/env';
import { ApiRole, mapApiRoleToAppRole, User } from '../types/roles';

const STORAGE_KEY = 'campcard.auth.v1';

type LoginResponse = {
 user: {
 id: string;
 email: string;
 role: ApiRole;
 council_id?: number | string;
 first_name?: string;
 last_name?: string;
 };
 tokens: {
 access_token: string;
 refresh_token: string;
 expires_in: number;
 };
};

type AuthState = {
 initializing: boolean;
 isAuthenticated: boolean;
 user: User | null;
 accessToken: string | null;
 refreshToken: string | null;
 expiresIn?: number;
 error?: string | null;

 initialize: () => Promise<void>;
 login: (params: { email: string; password: string }) => Promise<void>;
 signup: (params: {
 fullName: string;
 email: string;
 password: string;
 invitationCode?: string;
 }) => Promise<void>;
 refresh: () => Promise<string | null>;
 logout: () => Promise<void>;
};

const authHttp = axios.create({
 baseURL: ENV.apiBaseUrl,
 timeout: ENV.apiTimeoutMs,
 headers: { 'Content-Type': 'application/json' },
});

async function saveAuth(payload: {
 user: User;
 accessToken: string;
 refreshToken: string;
 expiresIn?: number;
}) {
 await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

async function loadAuth(): Promise<{
 user: User;
 accessToken: string;
 refreshToken: string;
 expiresIn?: number;
} | null> {
 const raw = await AsyncStorage.getItem(STORAGE_KEY);
 if (!raw) return null;
 try {
 return JSON.parse(raw);
 } catch {
 return null;
 }
}

async function clearAuth() {
 await AsyncStorage.removeItem(STORAGE_KEY);
}

function deriveMockUser(email: string): User {
 const lower = email.toLowerCase();
 const role = lower.includes('leader')
 ? 'leader'
 : lower.includes('scout')
 ? 'scout'
 : 'customer';

 return {
 id: 'mock-user',
 email,
 name: role === 'customer' ? 'Customer (Mock)' : role === 'leader' ? 'Leader (Mock)' : 'Scout (Mock)',
 role,
 tenantId: '42',
 };
}

export const useAuthStore = create<AuthState>((set, get) => ({
 initializing: true,
 isAuthenticated: false,
 user: null,
 accessToken: null,
 refreshToken: null,
 expiresIn: undefined,
 error: null,

 initialize: async () => {
 set({ initializing: true, error: null });
 const stored = await loadAuth();

 if (!stored) {
 set({ initializing: false, isAuthenticated: false, user: null, accessToken: null, refreshToken: null });
 return;
 }

 set({
 user: stored.user,
 accessToken: stored.accessToken,
 refreshToken: stored.refreshToken,
 expiresIn: stored.expiresIn,
 isAuthenticated: true,
 initializing: false,
 });
 },

 login: async ({ email, password }) => {
 set({ error: null });

 // Primary: real API login
 try {
 const res = await authHttp.post<LoginResponse>('/auth/login', { email, password });
 const data = res.data;

 const user: User = {
 id: data.user.id,
 email: data.user.email,
 name:
 data.user.first_name || data.user.last_name
 ? `${data.user.first_name ?? ''} ${data.user.last_name ?? ''}`.trim()
 : undefined,
 role: mapApiRoleToAppRole(data.user.role),
 tenantId: data.user.council_id ? String(data.user.council_id) : undefined,
 };

 await saveAuth({
 user,
 accessToken: data.tokens.access_token,
 refreshToken: data.tokens.refresh_token,
 expiresIn: data.tokens.expires_in,
 });

 set({
 user,
 accessToken: data.tokens.access_token,
 refreshToken: data.tokens.refresh_token,
 expiresIn: data.tokens.expires_in,
 isAuthenticated: true,
 });
 return;
 } catch (e: any) {
 // Fallback: mock auth for local UI work
 if (!ENV.enableMockAuth) {
 const msg = e?.response?.data?.message || e?.message || 'Login failed';
 set({ error: msg });
 throw e;
 }

 const user = deriveMockUser(email);
 const accessToken = 'mock-access-token';
 const refreshToken = 'mock-refresh-token';

 await saveAuth({ user, accessToken, refreshToken, expiresIn: 3600 });
 set({ user, accessToken, refreshToken, expiresIn: 3600, isAuthenticated: true });
 }
 },

 signup: async ({ fullName, email, password, invitationCode }) => {
 set({ error: null });

 // If backend supports /auth/register use it, then auto-login.
 try {
 const [firstName, ...rest] = fullName.trim().split(' ');
 const lastName = rest.join(' ') || undefined;

 await authHttp.post('/auth/register', {
 email,
 password,
 first_name: firstName,
 last_name: lastName,
 invitation_code: invitationCode,
 });

 await get().login({ email, password });
 } catch (e: any) {
 if (!ENV.enableMockAuth) {
 const msg = e?.response?.data?.message || e?.message || 'Signup failed';
 set({ error: msg });
 throw e;
 }

 // Mock signup
 const user = deriveMockUser(email);
 const accessToken = 'mock-access-token';
 const refreshToken = 'mock-refresh-token';

 await saveAuth({ user, accessToken, refreshToken, expiresIn: 3600 });
 set({ user, accessToken, refreshToken, expiresIn: 3600, isAuthenticated: true });
 }
 },

 refresh: async () => {
 const { refreshToken } = get();
 if (!refreshToken) return null;

 // In mock mode, just return the same token
 if (ENV.enableMockAuth && refreshToken === 'mock-refresh-token') {
 return get().accessToken;
 }

 try {
 const res = await authHttp.post<{ access_token: string; expires_in: number }>(
 '/auth/refresh',
 { refresh_token: refreshToken }
 );

 const newToken = res.data.access_token;
 const stored = await loadAuth();

 if (stored) {
 await saveAuth({
 user: stored.user,
 accessToken: newToken,
 refreshToken: stored.refreshToken,
 expiresIn: res.data.expires_in,
 });
 }

 set({ accessToken: newToken, expiresIn: res.data.expires_in });
 return newToken;
 } catch {
 return null;
 }
 },

 logout: async () => {
 await clearAuth();
 set({ isAuthenticated: false, user: null, accessToken: null, refreshToken: null, expiresIn: undefined });
 },
}));
