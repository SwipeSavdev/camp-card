import { useState, useEffect, useCallback, useRef } from 'react';
import Geolocation, { GeoPosition, GeoError } from 'react-native-geolocation-service';
import { Platform, PermissionsAndroid, Alert, Linking } from 'react-native';
import {
  LocationService,
  GeocodingResult,
  PlaceSearchResult,
  RouteResult,
  DistanceResult,
} from '../services/locationService';

// Types
export interface LocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  altitude: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: number | null;
  loading: boolean;
  error: string | null;
  permissionStatus: 'granted' | 'denied' | 'blocked' | 'unavailable' | 'unknown';
}

export interface UseLocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  distanceFilter?: number;
  watchPosition?: boolean;
  showLocationDialog?: boolean;
}

const defaultOptions: UseLocationOptions = {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 10000,
  distanceFilter: 10,
  watchPosition: false,
  showLocationDialog: true,
};

/**
 * Hook for managing device location with React Native
 */
export function useLocation(options: UseLocationOptions = {}) {
  const mergedOptions = { ...defaultOptions, ...options };
  const watchIdRef = useRef<number | null>(null);

  const [state, setState] = useState<LocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    altitude: null,
    heading: null,
    speed: null,
    timestamp: null,
    loading: false,
    error: null,
    permissionStatus: 'unknown',
  });

  // Request location permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === 'ios') {
      const auth = await Geolocation.requestAuthorization('whenInUse');
      const granted = auth === 'granted' || auth === 'whenInUse';
      setState(prev => ({
        ...prev,
        permissionStatus: granted ? 'granted' : 'denied',
      }));
      return granted;
    }

    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'BSA Camp Card needs access to your location to find nearby merchants.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );

        const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
        setState(prev => ({
          ...prev,
          permissionStatus: isGranted ? 'granted' : 'denied',
        }));
        return isGranted;
      } catch (err) {
        console.error('Permission request error:', err);
        return false;
      }
    }

    return false;
  }, []);

  // Handle location update
  const handleLocationUpdate = useCallback((position: GeoPosition) => {
    setState(prev => ({
      ...prev,
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      altitude: position.coords.altitude,
      heading: position.coords.heading,
      speed: position.coords.speed,
      timestamp: position.timestamp,
      loading: false,
      error: null,
    }));
  }, []);

  // Handle location error
  const handleLocationError = useCallback((error: GeoError) => {
    let errorMessage: string;

    switch (error.code) {
      case 1:
        errorMessage = 'Location permission denied';
        break;
      case 2:
        errorMessage = 'Location unavailable';
        break;
      case 3:
        errorMessage = 'Location request timed out';
        break;
      case 4:
        errorMessage = 'Google Play services not available';
        break;
      case 5:
        errorMessage = 'Location settings not satisfied';
        break;
      default:
        errorMessage = `Location error: ${error.message}`;
    }

    setState(prev => ({
      ...prev,
      loading: false,
      error: errorMessage,
    }));

    console.error('Location error:', errorMessage);
  }, []);

  // Get current position
  const getCurrentPosition = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    const hasPermission = await requestPermission();
    if (!hasPermission) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Location permission not granted',
      }));
      return;
    }

    Geolocation.getCurrentPosition(
      handleLocationUpdate,
      handleLocationError,
      {
        enableHighAccuracy: mergedOptions.enableHighAccuracy,
        timeout: mergedOptions.timeout,
        maximumAge: mergedOptions.maximumAge,
        showLocationDialog: mergedOptions.showLocationDialog,
      }
    );
  }, [requestPermission, handleLocationUpdate, handleLocationError, mergedOptions]);

  // Start watching position
  const startWatching = useCallback(async () => {
    if (watchIdRef.current !== null) {
      return; // Already watching
    }

    const hasPermission = await requestPermission();
    if (!hasPermission) {
      setState(prev => ({
        ...prev,
        error: 'Location permission not granted',
      }));
      return;
    }

    watchIdRef.current = Geolocation.watchPosition(
      handleLocationUpdate,
      handleLocationError,
      {
        enableHighAccuracy: mergedOptions.enableHighAccuracy,
        distanceFilter: mergedOptions.distanceFilter,
        interval: 5000,
        fastestInterval: 2000,
        showLocationDialog: mergedOptions.showLocationDialog,
      }
    );
  }, [requestPermission, handleLocationUpdate, handleLocationError, mergedOptions]);

  // Stop watching position
  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      Geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  // Open device location settings
  const openSettings = useCallback(() => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  }, []);

  // Show permission denied alert
  const showPermissionDeniedAlert = useCallback(() => {
    Alert.alert(
      'Location Permission Required',
      'BSA Camp Card needs access to your location to find nearby merchants and offers. Please enable location access in your device settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: openSettings },
      ]
    );
  }, [openSettings]);

  // Auto-start watching if option is enabled
  useEffect(() => {
    if (mergedOptions.watchPosition) {
      startWatching();
    }

    return () => {
      stopWatching();
    };
  }, [mergedOptions.watchPosition, startWatching, stopWatching]);

  return {
    ...state,
    getCurrentPosition,
    startWatching,
    stopWatching,
    requestPermission,
    openSettings,
    showPermissionDeniedAlert,
    hasLocation: state.latitude !== null && state.longitude !== null,
  };
}

/**
 * Hook for geocoding addresses
 */
export function useGeocode() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GeocodingResult | null>(null);

  const geocode = useCallback(async (address: string) => {
    setLoading(true);
    setError(null);

    try {
      const geocodeResult = await LocationService.geocode(address);
      setResult(geocodeResult);
      return geocodeResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Geocoding failed';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reverseGeocode = useCallback(async (latitude: number, longitude: number) => {
    setLoading(true);
    setError(null);

    try {
      const geocodeResult = await LocationService.reverseGeocode(latitude, longitude);
      setResult(geocodeResult);
      return geocodeResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Reverse geocoding failed';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    loading,
    error,
    result,
    geocode,
    reverseGeocode,
    reset,
  };
}

/**
 * Hook for searching places nearby
 */
export function usePlaceSearch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<PlaceSearchResult[]>([]);

  const search = useCallback(
    async (
      query: string,
      latitude: number,
      longitude: number,
      maxResults?: number,
      radiusMeters?: number
    ) => {
      setLoading(true);
      setError(null);

      try {
        const searchResults = await LocationService.searchPlaces(
          query,
          latitude,
          longitude,
          maxResults,
          radiusMeters
        );
        setResults(searchResults);
        return searchResults;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Place search failed';
        setError(errorMessage);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const searchByCategory = useCallback(
    async (category: string, latitude: number, longitude: number, maxResults?: number) => {
      setLoading(true);
      setError(null);

      try {
        const searchResults = await LocationService.searchMerchantsByCategory(
          category,
          latitude,
          longitude,
          maxResults
        );
        setResults(searchResults);
        return searchResults;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Merchant search failed';
        setError(errorMessage);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clear = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    loading,
    error,
    results,
    search,
    searchByCategory,
    clear,
  };
}

/**
 * Hook for calculating routes/directions
 */
export function useRouteCalculation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [route, setRoute] = useState<RouteResult | null>(null);

  const calculateRoute = useCallback(
    async (
      startLat: number,
      startLon: number,
      endLat: number,
      endLon: number,
      mode: 'CAR' | 'WALKING' | 'TRUCK' = 'CAR'
    ) => {
      setLoading(true);
      setError(null);

      try {
        const routeResult = await LocationService.calculateRoute(
          startLat,
          startLon,
          endLat,
          endLon,
          mode
        );
        setRoute(routeResult);
        return routeResult;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Route calculation failed';
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getDrivingRoute = useCallback(
    async (startLat: number, startLon: number, endLat: number, endLon: number) => {
      return calculateRoute(startLat, startLon, endLat, endLon, 'CAR');
    },
    [calculateRoute]
  );

  const getWalkingRoute = useCallback(
    async (startLat: number, startLon: number, endLat: number, endLon: number) => {
      return calculateRoute(startLat, startLon, endLat, endLon, 'WALKING');
    },
    [calculateRoute]
  );

  const clear = useCallback(() => {
    setRoute(null);
    setError(null);
  }, []);

  return {
    loading,
    error,
    route,
    calculateRoute,
    getDrivingRoute,
    getWalkingRoute,
    clear,
    formattedDistance: route ? LocationService.formatDistanceMiles(route.distanceKm * 1000) : null,
    formattedDuration: route ? LocationService.formatDuration(route.durationSeconds) : null,
  };
}

/**
 * Hook for calculating distance between points
 */
export function useDistance() {
  const calculateDistance = useCallback(
    (lat1: number, lon1: number, lat2: number, lon2: number): DistanceResult => {
      return LocationService.calculateDistanceLocal(lat1, lon1, lat2, lon2);
    },
    []
  );

  const formatDistance = useCallback((meters: number): string => {
    return LocationService.formatDistanceMiles(meters);
  }, []);

  return {
    calculateDistance,
    formatDistance,
    formatMetric: LocationService.formatDistance,
    formatImperial: LocationService.formatDistanceMiles,
  };
}

/**
 * Combined hook for common location use cases
 */
export function useNearbyMerchants(radiusMeters: number = 50000) {
  const location = useLocation();
  const placeSearch = usePlaceSearch();
  const distance = useDistance();

  const searchNearby = useCallback(
    async (query: string) => {
      if (!location.hasLocation) {
        await location.getCurrentPosition();
      }

      if (location.latitude && location.longitude) {
        return placeSearch.search(
          query,
          location.latitude,
          location.longitude,
          20,
          radiusMeters
        );
      }

      return [];
    },
    [location, placeSearch, radiusMeters]
  );

  const searchCategory = useCallback(
    async (category: string) => {
      if (!location.hasLocation) {
        await location.getCurrentPosition();
      }

      if (location.latitude && location.longitude) {
        return placeSearch.searchByCategory(
          category,
          location.latitude,
          location.longitude,
          20
        );
      }

      return [];
    },
    [location, placeSearch]
  );

  const getDistanceTo = useCallback(
    (lat: number, lon: number): DistanceResult | null => {
      if (!location.hasLocation || !location.latitude || !location.longitude) {
        return null;
      }

      return distance.calculateDistance(location.latitude, location.longitude, lat, lon);
    },
    [location, distance]
  );

  return {
    location,
    results: placeSearch.results,
    loading: location.loading || placeSearch.loading,
    error: location.error || placeSearch.error,
    searchNearby,
    searchCategory,
    getDistanceTo,
    formatDistance: distance.formatDistance,
    refresh: location.getCurrentPosition,
  };
}

export default useLocation;
