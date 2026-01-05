import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

import { ENV } from '../config/env';
import { useAuthStore } from '../store/authStore';

export const apiClient = axios.create({
 baseURL: ENV.apiBaseUrl,
 timeout: ENV.apiTimeoutMs,
 headers: {
 'Content-Type': 'application/json',
 },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
 const { accessToken, user } = useAuthStore.getState();

 if (accessToken) {
 config.headers.Authorization = `Bearer ${accessToken}`;
 }

 // Multi-tenant hint header (safe even if backend ignores it)
 if (user?.tenantId) {
 config.headers['X-Tenant-Id'] = String(user.tenantId);
 }

 return config;
});

// Simple token refresh on 401
let isRefreshing = false;
let queued: Array<(token: string | null) => void> = [];

function queue(cb: (token: string | null) => void) {
 queued.push(cb);
}

function flush(token: string | null) {
 queued.forEach(cb => cb(token));
 queued = [];
}

apiClient.interceptors.response.use(
 response => response,
 async (error: AxiosError) => {
 const originalRequest: any = error.config;

 if (!originalRequest || originalRequest._retry) {
 return Promise.reject(error);
 }

 if (error.response?.status !== 401) {
 return Promise.reject(error);
 }

 // Attempt refresh
 originalRequest._retry = true;

 const { refreshToken, refresh, logout } = useAuthStore.getState();
 if (!refreshToken) {
 await logout();
 return Promise.reject(error);
 }

 if (isRefreshing) {
 return new Promise((resolve, reject) => {
 queue(token => {
 if (!token) return reject(error);
 originalRequest.headers.Authorization = `Bearer ${token}`;
 resolve(apiClient(originalRequest));
 });
 });
 }

 isRefreshing = true;

 try {
 const newToken = await refresh();
 flush(newToken);

 if (!newToken) {
 await logout();
 return Promise.reject(error);
 }

 originalRequest.headers.Authorization = `Bearer ${newToken}`;
 return apiClient(originalRequest);
 } catch (e) {
 flush(null);
 await logout();
 return Promise.reject(e);
 } finally {
 isRefreshing = false;
 }
 }
);
