import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

import { apiClient } from '../services/apiClient';
import { API_BASE_URL } from '../config/constants';

export type ConsentStatus = 'NOT_REQUIRED' | 'PENDING' | 'GRANTED' | 'DENIED' | 'REVOKED';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'SCOUT' | 'PARENT' | 'UNIT_LEADER' | 'COUNCIL_ADMIN' | 'NATIONAL_ADMIN';
  councilId?: string;
  troopId?: string;
  subscriptionStatus?: 'active' | 'inactive' | 'expired' | 'none';
  subscriptionExpiresAt?: string;
  // COPPA compliance fields
  consentStatus?: ConsentStatus;
  locationAllowed?: boolean;
  requiresPasswordChange?: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  updateUser: (user: User) => void;
  initialize: () => Promise<void>;
  devBypass: () => void;
}

// DEV MODE: Always start with login screen for testing
// Set to true to clear auth state on every app reload
const DEV_ALWAYS_SHOW_LOGIN = __DEV__ && true;

const DEV_MOCK_USER: User = {
  id: 'dev-user-123',
  email: 'admin@campcard.org',
  firstName: 'Dev',
  lastName: 'User',
  role: 'NATIONAL_ADMIN',
};

interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: User['role'];
}

/**
 * Authentication Store
 * Manages user authentication state with secure token storage
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      initialize: async () => {
        // DEV MODE: Always clear auth state to show login screen
        if (DEV_ALWAYS_SHOW_LOGIN) {
          console.log('🔓 DEV MODE: Clearing auth state for testing');
          console.log('📡 API URL:', API_BASE_URL);

          // Clear all stored auth data
          try {
            await SecureStore.deleteItemAsync('accessToken');
            await SecureStore.deleteItemAsync('refreshToken');
            await AsyncStorage.removeItem('auth-storage');
          } catch (e) {
            console.log('Error clearing auth storage:', e);
          }

          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
          });
          return;
        }

        try {
          // Load tokens from secure storage
          const accessToken = await SecureStore.getItemAsync('accessToken');
          const refreshToken = await SecureStore.getItemAsync('refreshToken');

          if (accessToken && refreshToken) {
            set({
              accessToken,
              refreshToken,
              isAuthenticated: true,
            });

            // Fetch current user
            const response = await apiClient.get('/api/v1/auth/me');
            set({ user: response.data });
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          get().logout();
        }
      },

      devBypass: () => {
        console.log('🔓 DEV MODE: Manual bypass triggered');
        set({
          user: DEV_MOCK_USER,
          accessToken: 'dev-token',
          refreshToken: 'dev-refresh-token',
          isAuthenticated: true,
        });
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        console.log('🔐 Attempting login for:', email);
        console.log('📡 API URL:', API_BASE_URL);

        try {
          const response = await apiClient.post('/api/v1/auth/mobile/login', {
            email,
            password,
          });

          console.log('✅ Login successful:', response.data.user?.email);

          const { user, accessToken, refreshToken } = response.data;

          // Store tokens securely
          await SecureStore.setItemAsync('accessToken', accessToken);
          await SecureStore.setItemAsync('refreshToken', refreshToken);

          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          console.error('❌ Login failed:', error.message);
          console.error('❌ Error details:', error.response?.data || error);
          console.error('❌ Request URL:', `${API_BASE_URL}/api/v1/auth/mobile/login`);
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        console.log('🚪 Logging out...');

        // First, immediately set isAuthenticated to false to trigger navigation
        set({
          isAuthenticated: false,
          user: null,
          accessToken: null,
          refreshToken: null,
        });

        try {
          // Clear tokens from secure storage
          await SecureStore.deleteItemAsync('accessToken');
          await SecureStore.deleteItemAsync('refreshToken');

          // Clear persisted storage
          await AsyncStorage.removeItem('auth-storage');
        } catch (error) {
          console.error('Logout cleanup error:', error);
        }

        // Optionally call logout endpoint (don't block on it)
        try {
          await apiClient.post('/api/v1/auth/logout');
        } catch (error) {
          // Ignore logout endpoint errors - user is already logged out locally
          console.log('Logout endpoint call failed (ignored):', error);
        }
      },

      signup: async (data: SignupData) => {
        set({ isLoading: true });
        try {
          const response = await apiClient.post('/api/v1/auth/register', data);

          const { user, accessToken, refreshToken } = response.data;

          // Store tokens securely
          await SecureStore.setItemAsync('accessToken', accessToken);
          await SecureStore.setItemAsync('refreshToken', refreshToken);

          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      refreshAccessToken: async () => {
        try {
          const { refreshToken } = get();
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          const response = await apiClient.post('/api/v1/auth/refresh', {
            refreshToken,
          });

          const { accessToken: newAccessToken } = response.data;

          // Update access token
          await SecureStore.setItemAsync('accessToken', newAccessToken);

          set({ accessToken: newAccessToken });
        } catch (error) {
          console.error('Token refresh error:', error);
          get().logout();
          throw error;
        }
      },

      updateUser: (user: User) => {
        set({ user });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist non-sensitive data
      partialize: (state: any) => ({
        user: state.user,
      }),
    }
  )
);
