import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../config/constants';

/**
 * API Client with automatic token refresh
 */
class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];
  
  // Declare methods as functions to avoid initialization errors
  public get: AxiosInstance['get'];
  public post: AxiosInstance['post'];
  public put: AxiosInstance['put'];
  public patch: AxiosInstance['patch'];
  public delete: AxiosInstance['delete'];

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
    
    // Bind methods after client is initialized
    this.get = this.client.get.bind(this.client);
    this.post = this.client.post.bind(this.client);
    this.put = this.client.put.bind(this.client);
    this.patch = this.client.patch.bind(this.client);
    this.delete = this.client.delete.bind(this.client);
  }

  private setupInterceptors() {
    // Request interceptor - Add access token
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const accessToken = await SecureStore.getItemAsync('accessToken');
        
        if (accessToken && config.headers) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        
        return config;
      },
      (error: any) => Promise.reject(error)
    );

    // Response interceptor - Handle 401 and refresh token
    this.client.interceptors.response.use(
      (response: any) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        // Skip token refresh for auth endpoints (login, register, forgot-password)
        const isAuthEndpoint = originalRequest.url?.includes('/auth/login') ||
          originalRequest.url?.includes('/auth/mobile/login') ||
          originalRequest.url?.includes('/auth/register') ||
          originalRequest.url?.includes('/auth/forgot-password') ||
          originalRequest.url?.includes('/auth/reset-password');

        // If 401 and not already retried, try to refresh token (skip for auth endpoints)
        if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
          if (this.isRefreshing) {
            // Wait for token refresh to complete
            return new Promise((resolve) => {
              this.refreshSubscribers.push((token: string) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                resolve(this.client(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = await SecureStore.getItemAsync('refreshToken');
            
            if (!refreshToken) {
              throw new Error('No refresh token');
            }

            const response = await axios.post(
              `${API_BASE_URL}/api/v1/auth/refresh`,
              { refreshToken }
            );

            const { accessToken: newAccessToken } = response.data;

            // Store new access token
            await SecureStore.setItemAsync('accessToken', newAccessToken);

            // Update original request with new token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            }

            // Notify all subscribers
            this.refreshSubscribers.forEach((callback) =>
              callback(newAccessToken)
            );
            this.refreshSubscribers = [];

            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed - logout user
            await SecureStore.deleteItemAsync('accessToken');
            await SecureStore.deleteItemAsync('refreshToken');
            
            // Navigate to login (handled by auth store)
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }
}

export const apiClient = new ApiClient();

// Type-safe API functions
export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post('/api/v1/auth/mobile/login', { email, password }),

  signup: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: string;
  }) => apiClient.post('/api/v1/auth/register', data),

  logout: () => apiClient.post('/api/v1/auth/logout'),

  refreshToken: (refreshToken: string) =>
    apiClient.post('/api/v1/auth/refresh', { refreshToken }),

  getCurrentUser: () => apiClient.get('/api/v1/auth/me'),

  forgotPassword: (email: string) =>
    apiClient.post('/api/v1/auth/forgot-password', { email }),

  resetPassword: (token: string, newPassword: string) =>
    apiClient.post('/api/v1/auth/reset-password', { token, newPassword }),
};

export const userApi = {
  updateProfile: (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  }) => apiClient.put('/api/v1/auth/profile', data),

  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
  }) => apiClient.post('/api/v1/auth/change-password', data),
};

export const offersApi = {
  getOffers: (params?: {
    latitude?: number;
    longitude?: number;
    radius?: number;
    category?: string;
  }) => apiClient.get('/api/v1/offers', { params }),

  getActiveOffers: () => apiClient.get('/api/v1/offers/active'),

  getActiveOffersForUser: (userId: string | number) =>
    apiClient.get(`/api/v1/offers/active/user/${userId}`),

  getFeaturedOffers: () => apiClient.get('/api/v1/offers/featured'),

  getOfferById: (id: string | number) => apiClient.get(`/api/v1/offers/${id}`),

  searchOffers: (query: string) =>
    apiClient.get('/api/v1/offers', { params: { search: query } }),

  redeemOffer: (offerId: string | number, merchantLocationId?: number | null, purchaseAmount?: number | null, notes?: string) =>
    apiClient.post('/api/v1/offers/redeem', { offerId, merchantLocationId, purchaseAmount, notes }),
};

export const subscriptionsApi = {
  getSubscriptions: () => apiClient.get('/api/v1/subscriptions'),
  
  createSubscription: (data: { scoutId: string; planId: string }) =>
    apiClient.post('/api/v1/subscriptions', data),
  
  cancelSubscription: (id: string) =>
    apiClient.delete(`/api/v1/subscriptions/${id}`),
};

export const redemptionsApi = {
  redeemCode: (code: string) =>
    apiClient.post('/api/v1/redemptions', { code }),

  getRedemptionHistory: () => apiClient.get('/api/v1/redemptions'),
};

export const merchantsApi = {
  getMerchants: (params?: { status?: string; category?: string; size?: number }) =>
    apiClient.get('/api/v1/merchants', { params }),

  getMerchantById: (id: string | number) =>
    apiClient.get(`/api/v1/merchants/${id}`),

  getMerchantOffers: (merchantId: string | number) =>
    apiClient.get(`/api/v1/offers/merchant/${merchantId}`),
};

export const scoutApi = {
  // Get scout stats (fundraising metrics, link performance)
  getStats: (scoutId: string) =>
    apiClient.get(`/api/v1/scouts/${scoutId}/stats`),

  // Record a sale/subscription attributed to scout
  recordSale: (scoutId: string, data: { customerId: string; amount: number; transactionId?: string }) =>
    apiClient.post(`/api/v1/scouts/${scoutId}/sales`, data),

  // Get scout's sales history
  getSales: (scoutId: string) =>
    apiClient.get(`/api/v1/scouts/${scoutId}/sales`),

  // Create a new scout (by Unit Leader)
  createScout: (data: {
    firstName: string;
    lastName: string;
    email: string;
    unitType: string;
    unitNumber: string;
    troopId?: string;
    role?: string;
  }) =>
    apiClient.post('/api/v1/auth/register', {
      ...data,
      password: `TempPass${Date.now()}!`, // Temporary password, user will reset via email
    }),

  // Get scouts for a troop
  getTroopScouts: (troopId: string) =>
    apiClient.get(`/api/v1/troops/${troopId}/scouts`),
};

export const referralApi = {
  // Get or generate the user's referral code
  getMyReferralCode: () =>
    apiClient.get('/api/v1/referrals/my-code'),

  // Get list of referrals made by current user
  getMyReferrals: () =>
    apiClient.get('/api/v1/referrals/my-referrals'),

  // Apply a referral code during registration
  applyReferralCode: (code: string) =>
    apiClient.post('/api/v1/referrals/apply', { code }),

  // Claim a referral reward
  claimReward: (referralId: string) =>
    apiClient.post(`/api/v1/referrals/${referralId}/claim`),

  // Track a link click or QR scan
  trackClick: (code: string, source: 'link' | 'qr') =>
    apiClient.post('/api/v1/referrals/track', { code, source }),
};

export const analyticsApi = {
  // Get user's savings/redemption analytics
  getUserAnalytics: (userId: string) =>
    apiClient.get(`/api/v1/analytics/user/${userId}`),

  // Get wallet/card analytics
  getWalletStats: () =>
    apiClient.get('/api/v1/analytics/wallet'),
};

export const qrCodeApi = {
  // Get user's QR code with shareable link for scout affiliate tracking
  getUserQRCode: () =>
    apiClient.get('/api/v1/qr-codes/user'),

  // Validate a QR code
  validateQRCode: (code: string) =>
    apiClient.get(`/api/v1/qr-codes/validate/${code}`),
};

// Camp Cards API (Multi-Card System)
export const cardsApi = {
  // Purchase 1-10 cards
  purchaseCards: (data: {
    quantity: number;
    planId?: string;
    scoutCode?: string;
    paymentToken: string;
    email?: string;
    firstName?: string;
    lastName?: string;
  }) => apiClient.post('/api/v1/cards/purchase', data),

  // Get user's card inventory (active, unused, gifted, historical)
  getMyCards: () => apiClient.get('/api/v1/cards/my-cards'),

  // Get single card by ID
  getCard: (cardId: number) => apiClient.get(`/api/v1/cards/${cardId}`),

  // Get card by UUID
  getCardByUuid: (uuid: string) => apiClient.get(`/api/v1/cards/uuid/${uuid}`),

  // Get expiry status for notifications
  getExpiryStatus: () => apiClient.get('/api/v1/cards/expiry-status'),

  // Activate/replenish - replace current card with unused card
  activateCard: (cardId: number) => apiClient.post(`/api/v1/cards/${cardId}/activate`),

  // Gift a card to someone
  giftCard: (cardId: number, data: { recipientEmail: string; recipientName?: string; message?: string }) =>
    apiClient.post(`/api/v1/cards/${cardId}/gift`, data),

  // Cancel a pending gift
  cancelGift: (cardId: number) => apiClient.post(`/api/v1/cards/${cardId}/cancel-gift`),

  // Resend gift notification email
  resendGiftEmail: (cardId: number) => apiClient.post(`/api/v1/cards/${cardId}/resend-gift`),

  // Get gift details by claim token (public - no auth required)
  getGiftDetails: (token: string) => apiClient.get(`/api/v1/cards/claim/${token}`),

  // Claim a gifted card (can be public or authenticated)
  claimGift: (token: string, data?: { email?: string; password?: string; firstName?: string; lastName?: string }) =>
    apiClient.post(`/api/v1/cards/claim/${token}`, data || {}),
};

// Payment API (Authorize.net)
export const paymentsApi = {
  // Process a payment charge
  charge: (data: {
    amount: number; // decimal amount (e.g., 15.00)
    cardNumber: string;
    expirationDate: string; // MMYY format
    cvv: string;
    description?: string;
    customerEmail?: string;
    customerName?: string;
    billingZip?: string;
  }) => apiClient.post('/api/v1/payments/charge', {
    ...data,
    amount: data.amount.toFixed(2), // Ensure proper decimal format
  }),

  // Get Accept Hosted token for subscription
  getSubscriptionToken: (data?: {
    customerEmail?: string;
    referralCode?: string;
    returnUrl?: string;
    cancelUrl?: string;
  }) => apiClient.post('/api/v1/payments/subscribe/token', data || {}),

  // Process subscription checkout (combines payment + account creation)
  subscriptionCheckout: (data: {
    cardNumber: string;
    expirationDate: string; // MMYY format
    cvv: string;
    billingZip?: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    scoutCode?: string;
    customerRefCode?: string;
  }) => apiClient.post('/api/v1/payments/subscribe/checkout', data),

  // Verify a subscription payment transaction
  verifyPayment: (transactionId: string) =>
    apiClient.get(`/api/v1/payments/subscribe/verify/${transactionId}`),
};

// COPPA Parental Consent API
export const consentApi = {
  // Get current user's consent status
  getMyConsentStatus: () =>
    apiClient.get('/api/v1/consent/my-status'),

  // Resend consent request email to parent
  resendConsentRequest: () =>
    apiClient.post('/api/v1/consent/resend'),

  // Update parent email and resend consent request
  updateParentAndResend: (parentEmail: string, parentName: string) =>
    apiClient.post('/api/v1/consent/update-parent', { parentEmail, parentName }),

  // Get consent verification details by token (public endpoint)
  getConsentVerification: (token: string) =>
    apiClient.get(`/api/v1/consent/verify/${token}`),

  // Submit consent decision (public endpoint, used by parent via web link)
  submitConsentDecision: (token: string, data: {
    granted: boolean;
    locationConsent: boolean;
    marketingConsent: boolean;
  }) =>
    apiClient.post(`/api/v1/consent/verify/${token}`, data),
};
