import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { apiClient } from './apiClient';

// Event types for categorization
export const EventType = {
  SCREEN_VIEW: 'screen_view',
  SESSION: 'session',
  USER_ACTION: 'user_action',
  IAP: 'iap',
  SEARCH: 'search',
  LOCATION: 'location',
  ENGAGEMENT: 'engagement',
  ERROR: 'error',
} as const;

// Standard event names
export const EventName = {
  // Session events
  SESSION_START: 'session_start',
  SESSION_END: 'session_end',
  APP_FOREGROUND: 'app_foreground',
  APP_BACKGROUND: 'app_background',

  // Screen views
  SCREEN_VIEW: 'screen_view',

  // User actions
  LOGIN: 'login',
  LOGOUT: 'logout',
  SIGNUP: 'signup',
  PROFILE_UPDATE: 'profile_update',

  // IAP/Payment events
  IAP_PRODUCT_VIEW: 'iap_product_view',
  IAP_PURCHASE_START: 'iap_purchase_start',
  IAP_PURCHASE_SUCCESS: 'iap_purchase_success',
  IAP_PURCHASE_FAIL: 'iap_purchase_fail',
  IAP_PURCHASE_CANCEL: 'iap_purchase_cancel',
  IAP_RESTORE: 'iap_restore',
  SUBSCRIPTION_VIEW: 'subscription_view',

  // Offer events
  OFFER_VIEW: 'offer_view',
  OFFER_FAVORITE: 'offer_favorite',
  OFFER_UNFAVORITE: 'offer_unfavorite',
  OFFER_REDEEM: 'offer_redeem',
  OFFER_SHARE: 'offer_share',
  QR_SCAN: 'qr_scan',

  // Merchant events
  MERCHANT_VIEW: 'merchant_view',
  MERCHANT_DIRECTIONS: 'merchant_directions',

  // Search events
  SEARCH_QUERY: 'search_query',
  SEARCH_RESULT_TAP: 'search_result_tap',

  // Location events
  LOCATION_PERMISSION_GRANTED: 'location_permission_granted',
  LOCATION_PERMISSION_DENIED: 'location_permission_denied',
  NEARBY_MERCHANTS_LOAD: 'nearby_merchants_load',

  // Card events
  CARD_ACTIVATE: 'card_activate',
  CARD_GIFT: 'card_gift',
  CARD_PURCHASE: 'card_purchase',

  // Referral events
  REFERRAL_SHARE: 'referral_share',
  REFERRAL_QR_VIEW: 'referral_qr_view',
} as const;

interface AnalyticsEventPayload {
  sessionId?: string;
  eventType: string;
  eventName: string;
  screenName?: string;
  properties?: Record<string, unknown>;
  deviceType?: string;
  deviceModel?: string;
  osVersion?: string;
  appVersion?: string;
  latitude?: number;
  longitude?: number;
}

class AnalyticsService {
  private sessionId: string = '';
  private eventQueue: AnalyticsEventPayload[] = [];
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private flushIntervalMs = 15000; // Flush every 15 seconds
  private maxQueueSize = 20;
  private deviceInfo: { deviceType: string; deviceModel: string; osVersion: string; appVersion: string } | null = null;
  private trackingAllowed: boolean = true;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  // Set whether ATT tracking is allowed (iOS). First-party analytics always run;
  // this flag is sent with events so the backend can gate cross-app tracking.
  setTrackingAllowed(allowed: boolean) {
    this.trackingAllowed = allowed;
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  }

  private getDeviceInfo() {
    if (!this.deviceInfo) {
      this.deviceInfo = {
        deviceType: Platform.OS === 'ios' ? 'IOS' : 'ANDROID',
        deviceModel: Device.modelName || 'Unknown',
        osVersion: `${Platform.OS} ${Platform.Version}`,
        appVersion: Constants.expoConfig?.version || '1.0.0',
      };
    }
    return this.deviceInfo;
  }

  // Start a new session
  startSession() {
    this.sessionId = this.generateSessionId();
    this.track(EventType.SESSION, EventName.SESSION_START);
    this.startFlushTimer();
  }

  // End the current session
  endSession() {
    this.track(EventType.SESSION, EventName.SESSION_END);
    this.flush();
    this.stopFlushTimer();
  }

  // Track a screen view
  trackScreenView(screenName: string, params?: Record<string, unknown>) {
    this.track(EventType.SCREEN_VIEW, EventName.SCREEN_VIEW, {
      screenName,
      properties: params,
    });
  }

  // Track a user action
  trackAction(eventName: string, properties?: Record<string, unknown>) {
    this.track(EventType.USER_ACTION, eventName, { properties });
  }

  // Track IAP events
  trackIAP(eventName: string, properties?: Record<string, unknown>) {
    this.track(EventType.IAP, eventName, { properties });
  }

  // Track search
  trackSearch(query: string, resultCount: number) {
    this.track(EventType.SEARCH, EventName.SEARCH_QUERY, {
      properties: { query, resultCount },
    });
  }

  // Track location events
  trackLocation(eventName: string, latitude?: number, longitude?: number, properties?: Record<string, unknown>) {
    this.track(EventType.LOCATION, eventName, {
      properties,
      latitude,
      longitude,
    });
  }

  // Track errors
  trackError(errorMessage: string, screen?: string, properties?: Record<string, unknown>) {
    this.track(EventType.ERROR, 'app_error', {
      screenName: screen,
      properties: { ...properties, errorMessage },
    });
  }

  // Core tracking method — queues events and flushes periodically
  private track(
    eventType: string,
    eventName: string,
    options?: {
      screenName?: string;
      properties?: Record<string, unknown>;
      latitude?: number;
      longitude?: number;
    }
  ) {
    const device = this.getDeviceInfo();
    const event: AnalyticsEventPayload = {
      sessionId: this.sessionId,
      eventType,
      eventName,
      screenName: options?.screenName,
      properties: { ...options?.properties, attConsent: this.trackingAllowed },
      latitude: options?.latitude,
      longitude: options?.longitude,
      ...device,
    };

    this.eventQueue.push(event);

    // Flush if queue is full
    if (this.eventQueue.length >= this.maxQueueSize) {
      this.flush();
    }
  }

  // Flush queued events to backend
  private async flush() {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      await apiClient.post('/api/v1/analytics/events/batch', { events });
    } catch (error) {
      // Re-queue events on failure (up to limit)
      if (this.eventQueue.length + events.length <= this.maxQueueSize * 2) {
        this.eventQueue.unshift(...events);
      }
      console.warn('[Analytics] Failed to flush events:', error);
    }
  }

  private startFlushTimer() {
    this.stopFlushTimer();
    this.flushTimer = setInterval(() => this.flush(), this.flushIntervalMs);
  }

  private stopFlushTimer() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }
}

export const analyticsService = new AnalyticsService();
