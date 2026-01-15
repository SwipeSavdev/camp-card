/**
 * Location Services Unit Tests
 * Tests for location-related functionality and expo-location configuration
 */

import * as Location from 'expo-location';

// Mock expo-location
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  watchPositionAsync: jest.fn(),
  Accuracy: {
    Balanced: 3,
    High: 4,
    Highest: 5,
    Low: 2,
    Lowest: 1,
  },
}));

const mockedLocation = Location as jest.Mocked<typeof Location>;

describe('Location Services Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Expo Location Module', () => {
    it('should have requestForegroundPermissionsAsync available', () => {
      expect(Location.requestForegroundPermissionsAsync).toBeDefined();
    });

    it('should have getCurrentPositionAsync available', () => {
      expect(Location.getCurrentPositionAsync).toBeDefined();
    });

    it('should have watchPositionAsync available', () => {
      expect(Location.watchPositionAsync).toBeDefined();
    });

    it('should have Accuracy enum with expected values', () => {
      expect(Location.Accuracy.Balanced).toBe(3);
      expect(Location.Accuracy.High).toBe(4);
      expect(Location.Accuracy.Highest).toBe(5);
      expect(Location.Accuracy.Low).toBe(2);
      expect(Location.Accuracy.Lowest).toBe(1);
    });
  });

  describe('Permission Request', () => {
    it('should call requestForegroundPermissionsAsync', async () => {
      mockedLocation.requestForegroundPermissionsAsync.mockResolvedValue({
        status: 'granted' as Location.PermissionStatus,
        expires: 'never',
        granted: true,
        canAskAgain: true,
      });

      await Location.requestForegroundPermissionsAsync();
      expect(mockedLocation.requestForegroundPermissionsAsync).toHaveBeenCalled();
    });

    it('should return granted status on success', async () => {
      mockedLocation.requestForegroundPermissionsAsync.mockResolvedValue({
        status: 'granted' as Location.PermissionStatus,
        expires: 'never',
        granted: true,
        canAskAgain: true,
      });

      const result = await Location.requestForegroundPermissionsAsync();
      expect(result.status).toBe('granted');
      expect(result.granted).toBe(true);
    });

    it('should return denied status when user declines', async () => {
      mockedLocation.requestForegroundPermissionsAsync.mockResolvedValue({
        status: 'denied' as Location.PermissionStatus,
        expires: 'never',
        granted: false,
        canAskAgain: true,
      });

      const result = await Location.requestForegroundPermissionsAsync();
      expect(result.status).toBe('denied');
      expect(result.granted).toBe(false);
    });

    it('should include canAskAgain flag', async () => {
      mockedLocation.requestForegroundPermissionsAsync.mockResolvedValue({
        status: 'denied' as Location.PermissionStatus,
        expires: 'never',
        granted: false,
        canAskAgain: false,
      });

      const result = await Location.requestForegroundPermissionsAsync();
      expect(result.canAskAgain).toBe(false);
    });
  });

  describe('Get Current Position', () => {
    it('should return coordinates on success', async () => {
      mockedLocation.getCurrentPositionAsync.mockResolvedValue({
        coords: {
          latitude: 40.7128,
          longitude: -74.0060,
          altitude: null,
          accuracy: 10,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      });

      const result = await Location.getCurrentPositionAsync({});
      expect(result.coords.latitude).toBe(40.7128);
      expect(result.coords.longitude).toBe(-74.0060);
    });

    it('should include accuracy in response', async () => {
      mockedLocation.getCurrentPositionAsync.mockResolvedValue({
        coords: {
          latitude: 40.7128,
          longitude: -74.0060,
          altitude: null,
          accuracy: 5,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      });

      const result = await Location.getCurrentPositionAsync({});
      expect(result.coords.accuracy).toBe(5);
    });

    it('should include timestamp in response', async () => {
      const mockTimestamp = Date.now();
      mockedLocation.getCurrentPositionAsync.mockResolvedValue({
        coords: {
          latitude: 40.7128,
          longitude: -74.0060,
          altitude: null,
          accuracy: 10,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: mockTimestamp,
      });

      const result = await Location.getCurrentPositionAsync({});
      expect(result.timestamp).toBe(mockTimestamp);
    });

    it('should accept accuracy option', async () => {
      mockedLocation.getCurrentPositionAsync.mockResolvedValue({
        coords: {
          latitude: 40.7128,
          longitude: -74.0060,
          altitude: null,
          accuracy: 5,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      });

      await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      expect(mockedLocation.getCurrentPositionAsync).toHaveBeenCalledWith(
        expect.objectContaining({ accuracy: Location.Accuracy.High })
      );
    });

    it('should handle location errors', async () => {
      mockedLocation.getCurrentPositionAsync.mockRejectedValue(new Error('Location unavailable'));

      await expect(Location.getCurrentPositionAsync({})).rejects.toThrow('Location unavailable');
    });
  });

  describe('Watch Position', () => {
    it('should be callable with options', async () => {
      const mockSubscription = { remove: jest.fn() };
      mockedLocation.watchPositionAsync.mockResolvedValue(mockSubscription);

      const callback = jest.fn();
      await Location.watchPositionAsync({}, callback);

      expect(mockedLocation.watchPositionAsync).toHaveBeenCalledWith({}, callback);
    });

    it('should return subscription object', async () => {
      const mockSubscription = { remove: jest.fn() };
      mockedLocation.watchPositionAsync.mockResolvedValue(mockSubscription);

      const result = await Location.watchPositionAsync({}, jest.fn());
      expect(result).toHaveProperty('remove');
    });
  });
});

describe('Distance Calculation Logic', () => {
  // Haversine formula implementation for testing
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): { miles: number; km: number } => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const km = R * c;
    const miles = km * 0.621371;
    return { miles, km };
  };

  it('should calculate distance between New York and Los Angeles', () => {
    const distance = calculateDistance(
      40.7128, -74.0060,  // New York
      34.0522, -118.2437  // Los Angeles
    );

    // Distance should be approximately 2450 miles / 3940 km
    expect(distance.miles).toBeGreaterThan(2000);
    expect(distance.miles).toBeLessThan(3000);
    expect(distance.km).toBeGreaterThan(3500);
    expect(distance.km).toBeLessThan(4500);
  });

  it('should return 0 for same point', () => {
    const distance = calculateDistance(
      40.7128, -74.0060,
      40.7128, -74.0060
    );

    expect(distance.miles).toBe(0);
    expect(distance.km).toBe(0);
  });

  it('should return both miles and kilometers', () => {
    const distance = calculateDistance(
      40.7128, -74.0060,
      40.7500, -74.0060
    );

    expect(distance).toHaveProperty('miles');
    expect(distance).toHaveProperty('km');
  });

  it('should have km > miles always', () => {
    const distance = calculateDistance(
      40.7128, -74.0060,
      40.7500, -74.0060
    );

    expect(distance.km).toBeGreaterThan(distance.miles);
  });

  it('should calculate short distances (within 1 mile) accurately', () => {
    // ~1 mile = ~1.6 km
    const distance = calculateDistance(
      40.7128, -74.0060,
      40.7272, -74.0060
    );

    expect(distance.miles).toBeGreaterThan(0.5);
    expect(distance.miles).toBeLessThan(2);
  });

  it('should calculate international distances', () => {
    // London to Paris
    const distance = calculateDistance(
      51.5074, -0.1278,  // London
      48.8566, 2.3522    // Paris
    );

    // ~215 miles / ~340 km
    expect(distance.miles).toBeGreaterThan(200);
    expect(distance.miles).toBeLessThan(250);
  });

  it('should handle negative coordinates', () => {
    // Sydney, Australia
    const distance = calculateDistance(
      -33.8688, 151.2093,  // Sydney
      -34.9285, 138.6007   // Adelaide
    );

    // ~725 miles / ~1167 km
    expect(distance.km).toBeGreaterThan(1000);
  });

  it('should handle crossing the prime meridian', () => {
    const distance = calculateDistance(
      51.5074, -0.5,    // West of London
      51.5074, 0.5      // East of London
    );

    expect(distance.km).toBeGreaterThan(0);
    expect(distance.km).toBeLessThan(100);
  });

  it('should handle equatorial coordinates', () => {
    const distance = calculateDistance(
      0, 0,      // Gulf of Guinea
      0, 1       // 1 degree east
    );

    // 1 degree at equator ≈ 111 km
    expect(distance.km).toBeGreaterThan(100);
    expect(distance.km).toBeLessThan(120);
  });
});

describe('Location State Interface', () => {
  interface LocationState {
    latitude: number | null;
    longitude: number | null;
    accuracy: number | null;
    loading: boolean;
    error: string | null;
    permissionStatus: 'undetermined' | 'granted' | 'denied';
    hasLocation: boolean;
  }

  it('should have all required state properties', () => {
    const state: LocationState = {
      latitude: null,
      longitude: null,
      accuracy: null,
      loading: false,
      error: null,
      permissionStatus: 'undetermined',
      hasLocation: false,
    };

    expect(state).toHaveProperty('latitude');
    expect(state).toHaveProperty('longitude');
    expect(state).toHaveProperty('accuracy');
    expect(state).toHaveProperty('loading');
    expect(state).toHaveProperty('error');
    expect(state).toHaveProperty('permissionStatus');
    expect(state).toHaveProperty('hasLocation');
  });

  it('should support granted permission state', () => {
    const state: LocationState = {
      latitude: 40.7128,
      longitude: -74.0060,
      accuracy: 10,
      loading: false,
      error: null,
      permissionStatus: 'granted',
      hasLocation: true,
    };

    expect(state.permissionStatus).toBe('granted');
    expect(state.hasLocation).toBe(true);
  });

  it('should support denied permission state', () => {
    const state: LocationState = {
      latitude: null,
      longitude: null,
      accuracy: null,
      loading: false,
      error: 'Permission denied',
      permissionStatus: 'denied',
      hasLocation: false,
    };

    expect(state.permissionStatus).toBe('denied');
    expect(state.error).toBeTruthy();
  });

  it('should support loading state', () => {
    const state: LocationState = {
      latitude: null,
      longitude: null,
      accuracy: null,
      loading: true,
      error: null,
      permissionStatus: 'undetermined',
      hasLocation: false,
    };

    expect(state.loading).toBe(true);
  });
});

describe('Location Options Configuration', () => {
  interface LocationOptions {
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
  }

  it('should support high accuracy option', () => {
    const options: LocationOptions = { enableHighAccuracy: true };
    expect(options.enableHighAccuracy).toBe(true);
  });

  it('should support timeout option', () => {
    const options: LocationOptions = { timeout: 10000 };
    expect(options.timeout).toBe(10000);
  });

  it('should support maximumAge option', () => {
    const options: LocationOptions = { maximumAge: 60000 };
    expect(options.maximumAge).toBe(60000);
  });

  it('should have all options optional', () => {
    const options: LocationOptions = {};
    expect(options.enableHighAccuracy).toBeUndefined();
    expect(options.timeout).toBeUndefined();
    expect(options.maximumAge).toBeUndefined();
  });

  it('should support combined options', () => {
    const options: LocationOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 30000,
    };

    expect(options.enableHighAccuracy).toBe(true);
    expect(options.timeout).toBe(15000);
    expect(options.maximumAge).toBe(30000);
  });
});
