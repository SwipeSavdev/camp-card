package com.bsa.campcard.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.location.LocationClient;
import software.amazon.awssdk.services.location.model.*;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

/**
 * AWS Location Service for the BSA Camp Card Platform
 *
 * Features:
 * - Geocoding: Convert addresses to coordinates
 * - Reverse Geocoding: Convert coordinates to addresses
 * - Place Search: Find merchants and POIs near a location
 * - Route Calculation: Get directions between locations
 * - Geofencing: Track when users enter/exit merchant areas
 * - Distance Calculation: Calculate distances between points
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class LocationService {

    private final LocationClient locationClient;

    @Value("${aws.location.place-index:campcard-place-index}")
    private String placeIndexName;

    @Value("${aws.location.route-calculator:campcard-route-calculator}")
    private String routeCalculatorName;

    @Value("${aws.location.geofence-collection:campcard-geofences}")
    private String geofenceCollectionName;

    @Value("${aws.location.tracker:campcard-tracker}")
    private String trackerName;

    @Value("${aws.location.map:campcard-map}")
    private String mapName;

    @Value("${aws.location.enabled:true}")
    private boolean locationEnabled;

    // ========================================================================
    // GEOCODING - Convert Address to Coordinates
    // ========================================================================

    /**
     * Convert an address to geographic coordinates (latitude/longitude)
     */
    @Cacheable(value = "geocode", key = "#address", unless = "#result == null")
    public GeocodingResult geocode(String address) {
        if (!locationEnabled) {
            log.info("Location service disabled - would geocode address: {}", address);
            return null;
        }

        log.info("Geocoding address: {}", address);

        try {
            SearchPlaceIndexForTextRequest request = SearchPlaceIndexForTextRequest.builder()
                    .indexName(placeIndexName)
                    .text(address)
                    .maxResults(1)
                    .build();

            SearchPlaceIndexForTextResponse response = locationClient.searchPlaceIndexForText(request);

            if (response.hasResults() && !response.results().isEmpty()) {
                SearchForTextResult result = response.results().get(0);
                Place place = result.place();

                GeocodingResult geocodingResult = new GeocodingResult(
                        place.geometry().point().get(0), // longitude
                        place.geometry().point().get(1), // latitude
                        place.label(),
                        place.addressNumber(),
                        place.street(),
                        place.municipality(),
                        place.region(),
                        place.postalCode(),
                        place.country(),
                        result.relevance()
                );

                log.info("Geocoded address to: [{}, {}]", geocodingResult.latitude(), geocodingResult.longitude());
                return geocodingResult;
            }

            log.warn("No geocoding results for address: {}", address);
            return null;

        } catch (Exception e) {
            log.error("Error geocoding address: {} - {}", address, e.getMessage());
            throw new LocationServiceException("Failed to geocode address", e);
        }
    }

    /**
     * Batch geocode multiple addresses
     */
    @Async
    public CompletableFuture<Map<String, GeocodingResult>> batchGeocode(List<String> addresses) {
        Map<String, GeocodingResult> results = new HashMap<>();

        for (String address : addresses) {
            try {
                GeocodingResult result = geocode(address);
                if (result != null) {
                    results.put(address, result);
                }
            } catch (Exception e) {
                log.error("Failed to geocode address in batch: {}", address);
            }
        }

        return CompletableFuture.completedFuture(results);
    }

    // ========================================================================
    // REVERSE GEOCODING - Convert Coordinates to Address
    // ========================================================================

    /**
     * Convert geographic coordinates to a human-readable address
     */
    @Cacheable(value = "reverse-geocode", key = "#latitude + ',' + #longitude", unless = "#result == null")
    public GeocodingResult reverseGeocode(double latitude, double longitude) {
        if (!locationEnabled) {
            log.info("Location service disabled - would reverse geocode: [{}, {}]", latitude, longitude);
            return null;
        }

        log.info("Reverse geocoding coordinates: [{}, {}]", latitude, longitude);

        try {
            SearchPlaceIndexForPositionRequest request = SearchPlaceIndexForPositionRequest.builder()
                    .indexName(placeIndexName)
                    .position(Arrays.asList(longitude, latitude))
                    .maxResults(1)
                    .build();

            SearchPlaceIndexForPositionResponse response = locationClient.searchPlaceIndexForPosition(request);

            if (response.hasResults() && !response.results().isEmpty()) {
                SearchForPositionResult result = response.results().get(0);
                Place place = result.place();

                GeocodingResult geocodingResult = new GeocodingResult(
                        longitude,
                        latitude,
                        place.label(),
                        place.addressNumber(),
                        place.street(),
                        place.municipality(),
                        place.region(),
                        place.postalCode(),
                        place.country(),
                        result.distance()
                );

                log.info("Reverse geocoded to: {}", geocodingResult.formattedAddress());
                return geocodingResult;
            }

            log.warn("No reverse geocoding results for coordinates: [{}, {}]", latitude, longitude);
            return null;

        } catch (Exception e) {
            log.error("Error reverse geocoding coordinates: [{}, {}] - {}", latitude, longitude, e.getMessage());
            throw new LocationServiceException("Failed to reverse geocode coordinates", e);
        }
    }

    // ========================================================================
    // PLACE SEARCH - Find Nearby Merchants and POIs
    // ========================================================================

    /**
     * Search for places near a location
     */
    public List<PlaceSearchResult> searchNearby(double latitude, double longitude, String query, int maxResults, int radiusMeters) {
        if (!locationEnabled) {
            log.info("Location service disabled - would search nearby: {} at [{}, {}]", query, latitude, longitude);
            return Collections.emptyList();
        }

        log.info("Searching for '{}' near [{}, {}] within {}m", query, latitude, longitude, radiusMeters);

        try {
            // Calculate bounding box from radius
            double[] bbox = calculateBoundingBox(latitude, longitude, radiusMeters);

            SearchPlaceIndexForTextRequest request = SearchPlaceIndexForTextRequest.builder()
                    .indexName(placeIndexName)
                    .text(query)
                    .biasPosition(Arrays.asList(longitude, latitude))
                    .filterBBox(Arrays.asList(bbox[0], bbox[1], bbox[2], bbox[3]))
                    .maxResults(maxResults)
                    .build();

            SearchPlaceIndexForTextResponse response = locationClient.searchPlaceIndexForText(request);

            List<PlaceSearchResult> results = response.results().stream()
                    .map(result -> {
                        Place place = result.place();
                        double placeLat = place.geometry().point().get(1);
                        double placeLon = place.geometry().point().get(0);
                        double distance = calculateDistance(latitude, longitude, placeLat, placeLon);

                        return new PlaceSearchResult(
                                place.label(),
                                placeLat,
                                placeLon,
                                place.addressNumber(),
                                place.street(),
                                place.municipality(),
                                place.region(),
                                place.postalCode(),
                                place.country(),
                                distance,
                                result.relevance(),
                                place.categories()
                        );
                    })
                    .sorted(Comparator.comparingDouble(PlaceSearchResult::distanceMeters))
                    .collect(Collectors.toList());

            log.info("Found {} places matching '{}'", results.size(), query);
            return results;

        } catch (Exception e) {
            log.error("Error searching for places: {} - {}", query, e.getMessage());
            throw new LocationServiceException("Failed to search for places", e);
        }
    }

    /**
     * Search for merchants by category near a location
     */
    public List<PlaceSearchResult> searchMerchantsByCategory(double latitude, double longitude, String category, int maxResults) {
        return searchNearby(latitude, longitude, category, maxResults, 50000); // 50km radius
    }

    /**
     * Autocomplete place suggestions as user types
     */
    public List<PlaceSuggestion> getPlaceSuggestions(String text, double latitude, double longitude) {
        if (!locationEnabled || text == null || text.length() < 3) {
            return Collections.emptyList();
        }

        log.debug("Getting place suggestions for: {}", text);

        try {
            SearchPlaceIndexForSuggestionsRequest request = SearchPlaceIndexForSuggestionsRequest.builder()
                    .indexName(placeIndexName)
                    .text(text)
                    .biasPosition(Arrays.asList(longitude, latitude))
                    .maxResults(5)
                    .build();

            SearchPlaceIndexForSuggestionsResponse response = locationClient.searchPlaceIndexForSuggestions(request);

            return response.results().stream()
                    .map(result -> new PlaceSuggestion(
                            result.text(),
                            result.placeId()
                    ))
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Error getting place suggestions: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    /**
     * Get details for a specific place by ID
     */
    public PlaceSearchResult getPlaceDetails(String placeId) {
        if (!locationEnabled) {
            return null;
        }

        try {
            GetPlaceRequest request = GetPlaceRequest.builder()
                    .indexName(placeIndexName)
                    .placeId(placeId)
                    .build();

            GetPlaceResponse response = locationClient.getPlace(request);
            Place place = response.place();

            return new PlaceSearchResult(
                    place.label(),
                    place.geometry().point().get(1),
                    place.geometry().point().get(0),
                    place.addressNumber(),
                    place.street(),
                    place.municipality(),
                    place.region(),
                    place.postalCode(),
                    place.country(),
                    0.0,
                    1.0,
                    place.categories()
            );

        } catch (Exception e) {
            log.error("Error getting place details for ID {}: {}", placeId, e.getMessage());
            return null;
        }
    }

    // ========================================================================
    // ROUTE CALCULATION - Get Directions
    // ========================================================================

    /**
     * Calculate a route between two points
     */
    public RouteResult calculateRoute(double startLat, double startLon, double endLat, double endLon, TravelMode travelMode) {
        if (!locationEnabled) {
            log.info("Location service disabled - would calculate route from [{}, {}] to [{}, {}]", startLat, startLon, endLat, endLon);
            return null;
        }

        log.info("Calculating {} route from [{}, {}] to [{}, {}]", travelMode, startLat, startLon, endLat, endLon);

        try {
            CalculateRouteRequest request = CalculateRouteRequest.builder()
                    .calculatorName(routeCalculatorName)
                    .departurePosition(Arrays.asList(startLon, startLat))
                    .destinationPosition(Arrays.asList(endLon, endLat))
                    .travelMode(travelMode)
                    .distanceUnit(DistanceUnit.KILOMETERS)
                    .departNow(true)
                    .build();

            CalculateRouteResponse response = locationClient.calculateRoute(request);
            CalculateRouteSummary summary = response.summary();

            List<RouteStep> steps = response.legs().stream()
                    .flatMap(leg -> leg.steps().stream())
                    .map(step -> new RouteStep(
                            step.startPosition().get(1),
                            step.startPosition().get(0),
                            step.endPosition().get(1),
                            step.endPosition().get(0),
                            step.distance(),
                            step.durationSeconds().intValue()
                    ))
                    .collect(Collectors.toList());

            RouteResult result = new RouteResult(
                    summary.distance(),
                    summary.durationSeconds().intValue(),
                    travelMode.toString(),
                    steps
            );

            log.info("Route calculated: {} km, {} minutes", result.distanceKm(), result.durationMinutes());
            return result;

        } catch (Exception e) {
            log.error("Error calculating route: {}", e.getMessage());
            throw new LocationServiceException("Failed to calculate route", e);
        }
    }

    /**
     * Calculate driving route (convenience method)
     */
    public RouteResult calculateDrivingRoute(double startLat, double startLon, double endLat, double endLon) {
        return calculateRoute(startLat, startLon, endLat, endLon, TravelMode.CAR);
    }

    /**
     * Calculate walking route (convenience method)
     */
    public RouteResult calculateWalkingRoute(double startLat, double startLon, double endLat, double endLon) {
        return calculateRoute(startLat, startLon, endLat, endLon, TravelMode.WALKING);
    }

    // ========================================================================
    // GEOFENCING - Track Entry/Exit from Merchant Areas
    // ========================================================================

    /**
     * Create a geofence around a merchant location
     */
    public void createMerchantGeofence(String merchantId, String merchantName, double latitude, double longitude, double radiusMeters) {
        if (!locationEnabled) {
            log.info("Location service disabled - would create geofence for merchant: {}", merchantId);
            return;
        }

        log.info("Creating geofence for merchant {} at [{}, {}] with radius {}m", merchantId, latitude, longitude, radiusMeters);

        try {
            // Create circular polygon for geofence
            List<List<Double>> polygon = createCirclePolygon(latitude, longitude, radiusMeters, 32);

            GeofenceGeometry geometry = GeofenceGeometry.builder()
                    .polygon(Collections.singletonList(polygon))
                    .build();

            PutGeofenceRequest request = PutGeofenceRequest.builder()
                    .collectionName(geofenceCollectionName)
                    .geofenceId("merchant-" + merchantId)
                    .geometry(geometry)
                    .build();

            locationClient.putGeofence(request);
            log.info("Created geofence for merchant: {}", merchantId);

        } catch (Exception e) {
            log.error("Error creating geofence for merchant {}: {}", merchantId, e.getMessage());
            throw new LocationServiceException("Failed to create merchant geofence", e);
        }
    }

    /**
     * Delete a merchant's geofence
     */
    public void deleteMerchantGeofence(String merchantId) {
        if (!locationEnabled) {
            return;
        }

        try {
            BatchDeleteGeofenceRequest request = BatchDeleteGeofenceRequest.builder()
                    .collectionName(geofenceCollectionName)
                    .geofenceIds(Collections.singletonList("merchant-" + merchantId))
                    .build();

            locationClient.batchDeleteGeofence(request);
            log.info("Deleted geofence for merchant: {}", merchantId);

        } catch (Exception e) {
            log.error("Error deleting geofence for merchant {}: {}", merchantId, e.getMessage());
        }
    }

    /**
     * List all active geofences
     */
    public List<GeofenceInfo> listGeofences() {
        if (!locationEnabled) {
            return Collections.emptyList();
        }

        try {
            ListGeofencesRequest request = ListGeofencesRequest.builder()
                    .collectionName(geofenceCollectionName)
                    .build();

            ListGeofencesResponse response = locationClient.listGeofences(request);

            return response.entries().stream()
                    .map(entry -> new GeofenceInfo(
                            entry.geofenceId(),
                            entry.status(),
                            entry.createTime(),
                            entry.updateTime()
                    ))
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Error listing geofences: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    // ========================================================================
    // DEVICE TRACKING - Track User Positions
    // ========================================================================

    /**
     * Update a device's position (for geofence triggering)
     */
    public void updateDevicePosition(String deviceId, double latitude, double longitude) {
        if (!locationEnabled) {
            return;
        }

        log.debug("Updating device {} position to [{}, {}]", deviceId, latitude, longitude);

        try {
            DevicePositionUpdate positionUpdate = DevicePositionUpdate.builder()
                    .deviceId(deviceId)
                    .position(Arrays.asList(longitude, latitude))
                    .sampleTime(Instant.now())
                    .build();

            BatchUpdateDevicePositionRequest request = BatchUpdateDevicePositionRequest.builder()
                    .trackerName(trackerName)
                    .updates(Collections.singletonList(positionUpdate))
                    .build();

            locationClient.batchUpdateDevicePosition(request);

        } catch (Exception e) {
            log.error("Error updating device position: {}", e.getMessage());
        }
    }

    /**
     * Get the last known position of a device
     */
    public DevicePosition getDevicePosition(String deviceId) {
        if (!locationEnabled) {
            return null;
        }

        try {
            GetDevicePositionRequest request = GetDevicePositionRequest.builder()
                    .trackerName(trackerName)
                    .deviceId(deviceId)
                    .build();

            GetDevicePositionResponse response = locationClient.getDevicePosition(request);

            return new DevicePosition(
                    deviceId,
                    response.position().get(1),
                    response.position().get(0),
                    response.sampleTime(),
                    response.receivedTime()
            );

        } catch (Exception e) {
            log.error("Error getting device position for {}: {}", deviceId, e.getMessage());
            return null;
        }
    }

    /**
     * Get position history for a device
     */
    public List<DevicePosition> getDevicePositionHistory(String deviceId, Instant startTime, Instant endTime) {
        if (!locationEnabled) {
            return Collections.emptyList();
        }

        try {
            GetDevicePositionHistoryRequest request = GetDevicePositionHistoryRequest.builder()
                    .trackerName(trackerName)
                    .deviceId(deviceId)
                    .startTimeInclusive(startTime)
                    .endTimeExclusive(endTime)
                    .build();

            GetDevicePositionHistoryResponse response = locationClient.getDevicePositionHistory(request);

            return response.devicePositions().stream()
                    .map(pos -> new DevicePosition(
                            deviceId,
                            pos.position().get(1),
                            pos.position().get(0),
                            pos.sampleTime(),
                            pos.receivedTime()
                    ))
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Error getting device position history: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    // ========================================================================
    // DISTANCE CALCULATIONS
    // ========================================================================

    /**
     * Calculate the straight-line distance between two points using Haversine formula
     * @return distance in meters
     */
    public double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final double EARTH_RADIUS_KM = 6371.0;

        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);

        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS_KM * c * 1000; // Convert to meters
    }

    /**
     * Calculate distances from a point to multiple locations
     */
    public Map<String, Double> calculateDistances(double fromLat, double fromLon, Map<String, double[]> locations) {
        Map<String, Double> distances = new HashMap<>();

        for (Map.Entry<String, double[]> entry : locations.entrySet()) {
            double[] coords = entry.getValue();
            double distance = calculateDistance(fromLat, fromLon, coords[0], coords[1]);
            distances.put(entry.getKey(), distance);
        }

        return distances;
    }

    /**
     * Sort locations by distance from a point
     */
    public List<LocationWithDistance> sortByDistance(double fromLat, double fromLon, List<LocationInfo> locations) {
        return locations.stream()
                .map(loc -> new LocationWithDistance(
                        loc.id(),
                        loc.name(),
                        loc.latitude(),
                        loc.longitude(),
                        calculateDistance(fromLat, fromLon, loc.latitude(), loc.longitude())
                ))
                .sorted(Comparator.comparingDouble(LocationWithDistance::distanceMeters))
                .collect(Collectors.toList());
    }

    /**
     * Filter locations within a radius
     */
    public List<LocationInfo> filterByRadius(double centerLat, double centerLon, List<LocationInfo> locations, double radiusMeters) {
        return locations.stream()
                .filter(loc -> calculateDistance(centerLat, centerLon, loc.latitude(), loc.longitude()) <= radiusMeters)
                .collect(Collectors.toList());
    }

    // ========================================================================
    // HELPER METHODS
    // ========================================================================

    /**
     * Calculate bounding box from center point and radius
     */
    private double[] calculateBoundingBox(double lat, double lon, double radiusMeters) {
        double radiusKm = radiusMeters / 1000.0;
        double latDelta = radiusKm / 111.32; // ~111km per degree of latitude
        double lonDelta = radiusKm / (111.32 * Math.cos(Math.toRadians(lat)));

        return new double[] {
                lon - lonDelta, // west
                lat - latDelta, // south
                lon + lonDelta, // east
                lat + latDelta  // north
        };
    }

    /**
     * Create a circular polygon approximation for geofencing
     */
    private List<List<Double>> createCirclePolygon(double centerLat, double centerLon, double radiusMeters, int numPoints) {
        List<List<Double>> polygon = new ArrayList<>();
        double radiusKm = radiusMeters / 1000.0;

        for (int i = 0; i <= numPoints; i++) {
            double angle = (2 * Math.PI * i) / numPoints;
            double latDelta = radiusKm * Math.cos(angle) / 111.32;
            double lonDelta = radiusKm * Math.sin(angle) / (111.32 * Math.cos(Math.toRadians(centerLat)));

            polygon.add(Arrays.asList(centerLon + lonDelta, centerLat + latDelta));
        }

        return polygon;
    }

    // ========================================================================
    // DATA TRANSFER OBJECTS
    // ========================================================================

    public record GeocodingResult(
            double longitude,
            double latitude,
            String formattedAddress,
            String addressNumber,
            String street,
            String city,
            String state,
            String postalCode,
            String country,
            double relevance
    ) {}

    public record PlaceSearchResult(
            String name,
            double latitude,
            double longitude,
            String addressNumber,
            String street,
            String city,
            String state,
            String postalCode,
            String country,
            double distanceMeters,
            double relevance,
            List<String> categories
    ) {}

    public record PlaceSuggestion(
            String text,
            String placeId
    ) {}

    public record RouteResult(
            double distanceKm,
            int durationSeconds,
            String travelMode,
            List<RouteStep> steps
    ) {
        public int durationMinutes() {
            return durationSeconds / 60;
        }
    }

    public record RouteStep(
            double startLat,
            double startLon,
            double endLat,
            double endLon,
            double distanceKm,
            int durationSeconds
    ) {}

    public record GeofenceInfo(
            String geofenceId,
            String status,
            Instant createTime,
            Instant updateTime
    ) {}

    public record DevicePosition(
            String deviceId,
            double latitude,
            double longitude,
            Instant sampleTime,
            Instant receivedTime
    ) {}

    public record LocationInfo(
            String id,
            String name,
            double latitude,
            double longitude
    ) {}

    public record LocationWithDistance(
            String id,
            String name,
            double latitude,
            double longitude,
            double distanceMeters
    ) {
        public double distanceKm() {
            return distanceMeters / 1000.0;
        }

        public double distanceMiles() {
            return distanceMeters / 1609.34;
        }
    }

    // ========================================================================
    // CUSTOM EXCEPTION
    // ========================================================================

    public static class LocationServiceException extends RuntimeException {
        public LocationServiceException(String message) {
            super(message);
        }

        public LocationServiceException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
