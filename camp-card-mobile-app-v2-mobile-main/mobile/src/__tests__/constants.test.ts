/**
 * Constants Unit Tests
 * Tests for app configuration and constants
 */

describe('App Constants', () => {
  beforeEach(() => {
    jest.resetModules();
    // Clear environment variables
    delete process.env.EXPO_PUBLIC_API_BASE_URL;
    delete process.env.EXPO_PUBLIC_AUTHORIZENET_PUBLIC_CLIENT_KEY;
    delete process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
    delete process.env.EXPO_PUBLIC_ENABLE_CUSTOMER_REFERRALS;
    delete process.env.EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS;
    delete process.env.EXPO_PUBLIC_ENABLE_BIOMETRIC_AUTH;
  });

  describe('API_BASE_URL', () => {
    it('should use environment variable when set', () => {
      process.env.EXPO_PUBLIC_API_BASE_URL = 'https://custom-api.example.com';
      const { API_BASE_URL } = require('../config/constants');
      expect(API_BASE_URL).toBe('https://custom-api.example.com');
    });

    it('should use default fallback when env var not set', () => {
      const { API_BASE_URL } = require('../config/constants');
      expect(API_BASE_URL).toBe('http://18.190.69.205:7010');
    });
  });

  describe('COLORS', () => {
    it('should have BSA primary red color', () => {
      const { COLORS } = require('../config/constants');
      expect(COLORS.primary).toBe('#CE1126');
    });

    it('should have BSA secondary blue color', () => {
      const { COLORS } = require('../config/constants');
      expect(COLORS.secondary).toBe('#003F87');
    });

    it('should have gold accent color', () => {
      const { COLORS } = require('../config/constants');
      expect(COLORS.accent).toBe('#FFD700');
    });

    it('should have all required color keys', () => {
      const { COLORS } = require('../config/constants');
      const requiredKeys = [
        'primary', 'secondary', 'accent', 'success', 'warning',
        'error', 'background', 'surface', 'text', 'textSecondary', 'border'
      ];
      requiredKeys.forEach(key => {
        expect(COLORS).toHaveProperty(key);
        expect(typeof COLORS[key]).toBe('string');
        expect(COLORS[key]).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });
  });

  describe('FEATURES', () => {
    it('should have ENABLE_CUSTOMER_REFERRALS flag', () => {
      const { FEATURES } = require('../config/constants');
      expect(typeof FEATURES.ENABLE_CUSTOMER_REFERRALS).toBe('boolean');
    });

    it('should have ENABLE_PUSH_NOTIFICATIONS flag', () => {
      const { FEATURES } = require('../config/constants');
      expect(typeof FEATURES.ENABLE_PUSH_NOTIFICATIONS).toBe('boolean');
    });

    it('should have ENABLE_BIOMETRIC_AUTH flag', () => {
      const { FEATURES } = require('../config/constants');
      expect(typeof FEATURES.ENABLE_BIOMETRIC_AUTH).toBe('boolean');
    });

    it('should enable feature when env var is "true"', () => {
      process.env.EXPO_PUBLIC_ENABLE_CUSTOMER_REFERRALS = 'true';
      const { FEATURES } = require('../config/constants');
      expect(FEATURES.ENABLE_CUSTOMER_REFERRALS).toBe(true);
    });

    it('should disable feature when env var is "false"', () => {
      process.env.EXPO_PUBLIC_ENABLE_CUSTOMER_REFERRALS = 'false';
      const { FEATURES } = require('../config/constants');
      expect(FEATURES.ENABLE_CUSTOMER_REFERRALS).toBe(false);
    });

    it('should disable feature when env var is not set', () => {
      const { FEATURES } = require('../config/constants');
      expect(FEATURES.ENABLE_CUSTOMER_REFERRALS).toBe(false);
    });
  });

  describe('MAP_CONFIG', () => {
    it('should have default region centered on USA', () => {
      const { MAP_CONFIG } = require('../config/constants');
      expect(MAP_CONFIG.defaultRegion.latitude).toBeCloseTo(39.8283, 2);
      expect(MAP_CONFIG.defaultRegion.longitude).toBeCloseTo(-98.5795, 2);
    });

    it('should have latitude and longitude deltas', () => {
      const { MAP_CONFIG } = require('../config/constants');
      expect(MAP_CONFIG.defaultRegion.latitudeDelta).toBeGreaterThan(0);
      expect(MAP_CONFIG.defaultRegion.longitudeDelta).toBeGreaterThan(0);
    });

    it('should have default radius in miles', () => {
      const { MAP_CONFIG } = require('../config/constants');
      expect(MAP_CONFIG.defaultRadius).toBe(25);
    });
  });

  describe('SUBSCRIPTION_PLANS', () => {
    it('should have BASIC plan', () => {
      const { SUBSCRIPTION_PLANS } = require('../config/constants');
      expect(SUBSCRIPTION_PLANS.BASIC).toBeDefined();
      expect(SUBSCRIPTION_PLANS.BASIC.id).toBe('basic');
      expect(SUBSCRIPTION_PLANS.BASIC.name).toBe('Basic Plan');
      expect(typeof SUBSCRIPTION_PLANS.BASIC.price).toBe('number');
    });

    it('should have PREMIUM plan', () => {
      const { SUBSCRIPTION_PLANS } = require('../config/constants');
      expect(SUBSCRIPTION_PLANS.PREMIUM).toBeDefined();
      expect(SUBSCRIPTION_PLANS.PREMIUM.id).toBe('premium');
      expect(SUBSCRIPTION_PLANS.PREMIUM.name).toBe('Premium Plan');
      expect(typeof SUBSCRIPTION_PLANS.PREMIUM.price).toBe('number');
    });

    it('should have BASIC plan cheaper than PREMIUM', () => {
      const { SUBSCRIPTION_PLANS } = require('../config/constants');
      expect(SUBSCRIPTION_PLANS.BASIC.price).toBeLessThan(SUBSCRIPTION_PLANS.PREMIUM.price);
    });

    it('should have features array for each plan', () => {
      const { SUBSCRIPTION_PLANS } = require('../config/constants');
      expect(Array.isArray(SUBSCRIPTION_PLANS.BASIC.features)).toBe(true);
      expect(SUBSCRIPTION_PLANS.BASIC.features.length).toBeGreaterThan(0);
      expect(Array.isArray(SUBSCRIPTION_PLANS.PREMIUM.features)).toBe(true);
      expect(SUBSCRIPTION_PLANS.PREMIUM.features.length).toBeGreaterThan(0);
    });

    it('should have PREMIUM with more features than BASIC', () => {
      const { SUBSCRIPTION_PLANS } = require('../config/constants');
      expect(SUBSCRIPTION_PLANS.PREMIUM.features.length).toBeGreaterThan(
        SUBSCRIPTION_PLANS.BASIC.features.length
      );
    });
  });

  describe('AWS_CONFIG', () => {
    it('should have region configuration', () => {
      const { AWS_CONFIG } = require('../config/constants');
      expect(AWS_CONFIG.region).toBeDefined();
      expect(typeof AWS_CONFIG.region).toBe('string');
    });

    it('should have location service configs', () => {
      const { AWS_CONFIG } = require('../config/constants');
      expect(AWS_CONFIG.location).toBeDefined();
      expect(AWS_CONFIG.location.placeIndex).toBe('campcard-place-index');
      expect(AWS_CONFIG.location.routeCalculator).toBe('campcard-route-calculator');
      expect(AWS_CONFIG.location.geofenceCollection).toBe('campcard-geofences');
      expect(AWS_CONFIG.location.tracker).toBe('campcard-tracker');
      expect(AWS_CONFIG.location.map).toBe('campcard-map');
    });
  });

  describe('APP_CONFIG', () => {
    it('should have app name', () => {
      const { APP_CONFIG } = require('../config/constants');
      expect(APP_CONFIG.name).toBeDefined();
      expect(typeof APP_CONFIG.name).toBe('string');
    });

    it('should have app version', () => {
      const { APP_CONFIG } = require('../config/constants');
      expect(APP_CONFIG.version).toBeDefined();
      expect(typeof APP_CONFIG.version).toBe('string');
    });

    it('should have environment', () => {
      const { APP_CONFIG } = require('../config/constants');
      expect(APP_CONFIG.environment).toBeDefined();
      expect(['development', 'staging', 'production']).toContain(APP_CONFIG.environment);
    });
  });
});
