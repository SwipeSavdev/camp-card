import axios from 'axios';
import { API_BASE_URL } from '../config/constants';

/**
 * Location Service for BSA Camp Card Mobile App
 *
 * Uses the backend API for location services which proxies to AWS Location Service.
 * This approach:
 * - Keeps AWS credentials secure on the server
 * - Provides consistent caching
 * - Allows for rate limiting and cost control
 */

// Types
export interface GeocodingResult {
  longitude: number;
  latitude: number;
  formattedAddress: string;
  addressNumber?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  relevance: number;
}

export interface PlaceSearchResult {
  name: string;
  latitude: number;
  longitude: number;
  addressNumber?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  distanceMeters: number;
  relevance: number;
  categories?: string[];
}

export interface PlaceSuggestion {
  text: string;
  placeId: string;
}

export interface RouteResult {
  distanceKm: number;
  durationSeconds: number;
  travelMode: string;
  steps: RouteStep[];
}

export interface RouteStep {
  startLat: number;
  startLon: number;
  endLat: number;
  endLon: number;
  distanceKm: number;
  durationSeconds: number;
}

export interface DistanceResult {
  meters: number;
  kilometers: number;
  miles: number;
}

export interface DevicePosition {
  deviceId: string;
  latitude: number;
  longitude: number;
  sampleTime: string;
  receivedTime: string;
}

// API Client
const locationApi = axios.create({
  baseURL: `${API_BASE_URL}/api/v1/location`,
  timeout: 10000,
});

// ========================================================================
// GEOCODING
// ========================================================================

/**
 * Convert an address to geographic coordinates
 */
export async function geocode(address: string): Promise<GeocodingResult | null> {
  try {
    const response = await locationApi.get<GeocodingResult>('/geocode', {
      params: { address },
    });
    return response.data;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

/**
 * Convert geographic coordinates to an address
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<GeocodingResult | null> {
  try {
    const response = await locationApi.get<GeocodingResult>('/reverse-geocode', {
      params: { latitude, longitude },
    });
    return response.data;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
}

// ========================================================================
// PLACE SEARCH
// ========================================================================

/**
 * Search for places near a location
 */
export async function searchPlaces(
  query: string,
  latitude: number,
  longitude: number,
  maxResults: number = 10,
  radiusMeters: number = 50000
): Promise<PlaceSearchResult[]> {
  try {
    const response = await locationApi.get<PlaceSearchResult[]>('/search', {
      params: { query, latitude, longitude, maxResults, radiusMeters },
    });
    return response.data;
  } catch (error) {
    console.error('Place search error:', error);
    return [];
  }
}

/**
 * Search for merchants by category
 */
export async function searchMerchantsByCategory(
  category: string,
  latitude: number,
  longitude: number,
  maxResults: number = 20
): Promise<PlaceSearchResult[]> {
  try {
    const response = await locationApi.get<PlaceSearchResult[]>('/search/merchants', {
      params: { category, latitude, longitude, maxResults },
    });
    return response.data;
  } catch (error) {
    console.error('Merchant search error:', error);
    return [];
  }
}

/**
 * Get place suggestions for autocomplete
 */
export async function getPlaceSuggestions(
  text: string,
  latitude: number,
  longitude: number
): Promise<PlaceSuggestion[]> {
  if (!text || text.length < 3) {
    return [];
  }

  try {
    const response = await locationApi.get<PlaceSuggestion[]>('/suggestions', {
      params: { text, latitude, longitude },
    });
    return response.data;
  } catch (error) {
    console.error('Place suggestions error:', error);
    return [];
  }
}

/**
 * Get details for a specific place
 */
export async function getPlaceDetails(placeId: string): Promise<PlaceSearchResult | null> {
  try {
    const response = await locationApi.get<PlaceSearchResult>(`/place/${placeId}`);
    return response.data;
  } catch (error) {
    console.error('Place details error:', error);
    return null;
  }
}

// ========================================================================
// ROUTING
// ========================================================================

/**
 * Calculate a route between two points
 */
export async function calculateRoute(
  startLat: number,
  startLon: number,
  endLat: number,
  endLon: number,
  mode: 'CAR' | 'WALKING' | 'TRUCK' = 'CAR'
): Promise<RouteResult | null> {
  try {
    const response = await locationApi.get<RouteResult>('/route', {
      params: { startLat, startLon, endLat, endLon, mode },
    });
    return response.data;
  } catch (error) {
    console.error('Route calculation error:', error);
    return null;
  }
}

/**
 * Get driving directions
 */
export async function getDrivingDirections(
  startLat: number,
  startLon: number,
  endLat: number,
  endLon: number
): Promise<RouteResult | null> {
  try {
    const response = await locationApi.get<RouteResult>('/route/driving', {
      params: { startLat, startLon, endLat, endLon },
    });
    return response.data;
  } catch (error) {
    console.error('Driving directions error:', error);
    return null;
  }
}

/**
 * Get walking directions
 */
export async function getWalkingDirections(
  startLat: number,
  startLon: number,
  endLat: number,
  endLon: number
): Promise<RouteResult | null> {
  try {
    const response = await locationApi.get<RouteResult>('/route/walking', {
      params: { startLat, startLon, endLat, endLon },
    });
    return response.data;
  } catch (error) {
    console.error('Walking directions error:', error);
    return null;
  }
}

// ========================================================================
// DISTANCE
// ========================================================================

/**
 * Calculate distance between two points
 */
export async function calculateDistance(
  fromLat: number,
  fromLon: number,
  toLat: number,
  toLon: number
): Promise<DistanceResult | null> {
  try {
    const response = await locationApi.get<DistanceResult>('/distance', {
      params: { fromLat, fromLon, toLat, toLon },
    });
    return response.data;
  } catch (error) {
    console.error('Distance calculation error:', error);
    return null;
  }
}

/**
 * Calculate distance locally using Haversine formula (no API call)
 */
export function calculateDistanceLocal(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): DistanceResult {
  const EARTH_RADIUS_KM = 6371.0;

  const latDistance = toRadians(lat2 - lat1);
  const lonDistance = toRadians(lon2 - lon1);

  const a =
    Math.sin(latDistance / 2) * Math.sin(latDistance / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(lonDistance / 2) *
      Math.sin(lonDistance / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const meters = EARTH_RADIUS_KM * c * 1000;

  return {
    meters,
    kilometers: meters / 1000,
    miles: meters / 1609.34,
  };
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// ========================================================================
// DEVICE TRACKING
// ========================================================================

/**
 * Update device position for geofence tracking
 */
export async function updateDevicePosition(
  deviceId: string,
  latitude: number,
  longitude: number
): Promise<void> {
  try {
    await locationApi.post(`/device/${deviceId}/position`, null, {
      params: { latitude, longitude },
    });
  } catch (error) {
    console.error('Device position update error:', error);
  }
}

/**
 * Get device's last known position
 */
export async function getDevicePosition(deviceId: string): Promise<DevicePosition | null> {
  try {
    const response = await locationApi.get<DevicePosition>(`/device/${deviceId}/position`);
    return response.data;
  } catch (error) {
    console.error('Get device position error:', error);
    return null;
  }
}

// ========================================================================
// UTILITY FUNCTIONS
// ========================================================================

/**
 * Format distance for display
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  const km = meters / 1000;
  if (km < 100) {
    return `${km.toFixed(1)} km`;
  }
  return `${Math.round(km)} km`;
}

/**
 * Format distance in miles for US users
 */
export function formatDistanceMiles(meters: number): string {
  const miles = meters / 1609.34;
  if (miles < 0.1) {
    const feet = meters * 3.28084;
    return `${Math.round(feet)} ft`;
  }
  if (miles < 10) {
    return `${miles.toFixed(1)} mi`;
  }
  return `${Math.round(miles)} mi`;
}

/**
 * Format duration for display
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)} sec`;
  }
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }
  return `${hours} hr ${remainingMinutes} min`;
}

/**
 * Sort locations by distance from a point
 */
export function sortByDistance<T extends { latitude: number; longitude: number }>(
  items: T[],
  fromLat: number,
  fromLon: number
): (T & { distance: DistanceResult })[] {
  return items
    .map(item => ({
      ...item,
      distance: calculateDistanceLocal(fromLat, fromLon, item.latitude, item.longitude),
    }))
    .sort((a, b) => a.distance.meters - b.distance.meters);
}

/**
 * Filter locations within a radius
 */
export function filterByRadius<T extends { latitude: number; longitude: number }>(
  items: T[],
  centerLat: number,
  centerLon: number,
  radiusMeters: number
): T[] {
  return items.filter(item => {
    const distance = calculateDistanceLocal(centerLat, centerLon, item.latitude, item.longitude);
    return distance.meters <= radiusMeters;
  });
}

// Export all functions as a service object for convenience
export const LocationService = {
  geocode,
  reverseGeocode,
  searchPlaces,
  searchMerchantsByCategory,
  getPlaceSuggestions,
  getPlaceDetails,
  calculateRoute,
  getDrivingDirections,
  getWalkingDirections,
  calculateDistance,
  calculateDistanceLocal,
  updateDevicePosition,
  getDevicePosition,
  formatDistance,
  formatDistanceMiles,
  formatDuration,
  sortByDistance,
  filterByRadius,
};

export default LocationService;
