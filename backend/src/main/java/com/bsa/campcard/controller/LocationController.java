package com.bsa.campcard.controller;

import com.bsa.campcard.service.LocationService;
import com.bsa.campcard.service.LocationService.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import software.amazon.awssdk.services.location.model.TravelMode;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/location")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Location", description = "Location services for geocoding, place search, routing, and geofencing")
public class LocationController {

    private final LocationService locationService;

    // ========================================================================
    // GEOCODING ENDPOINTS
    // ========================================================================

    @GetMapping("/geocode")
    @Operation(summary = "Geocode an address", description = "Convert a street address to geographic coordinates")
    public ResponseEntity<GeocodingResult> geocode(
            @Parameter(description = "Street address to geocode") @RequestParam String address) {
        log.info("Geocoding request for address: {}", address);
        GeocodingResult result = locationService.geocode(address);
        if (result == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/reverse-geocode")
    @Operation(summary = "Reverse geocode coordinates", description = "Convert geographic coordinates to a street address")
    public ResponseEntity<GeocodingResult> reverseGeocode(
            @Parameter(description = "Latitude") @RequestParam double latitude,
            @Parameter(description = "Longitude") @RequestParam double longitude) {
        log.info("Reverse geocoding request for [{}, {}]", latitude, longitude);
        GeocodingResult result = locationService.reverseGeocode(latitude, longitude);
        if (result == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(result);
    }

    // ========================================================================
    // PLACE SEARCH ENDPOINTS
    // ========================================================================

    @GetMapping("/search")
    @Operation(summary = "Search for places", description = "Search for places near a location")
    public ResponseEntity<List<PlaceSearchResult>> searchPlaces(
            @Parameter(description = "Search query") @RequestParam String query,
            @Parameter(description = "Center latitude") @RequestParam double latitude,
            @Parameter(description = "Center longitude") @RequestParam double longitude,
            @Parameter(description = "Maximum results (default 10)") @RequestParam(defaultValue = "10") int maxResults,
            @Parameter(description = "Search radius in meters (default 50000)") @RequestParam(defaultValue = "50000") int radiusMeters) {
        log.info("Place search for '{}' near [{}, {}]", query, latitude, longitude);
        List<PlaceSearchResult> results = locationService.searchNearby(latitude, longitude, query, maxResults, radiusMeters);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/search/merchants")
    @Operation(summary = "Search for merchants by category", description = "Search for merchants near a location by business category")
    public ResponseEntity<List<PlaceSearchResult>> searchMerchants(
            @Parameter(description = "Business category (e.g., 'restaurant', 'coffee shop')") @RequestParam String category,
            @Parameter(description = "Center latitude") @RequestParam double latitude,
            @Parameter(description = "Center longitude") @RequestParam double longitude,
            @Parameter(description = "Maximum results (default 20)") @RequestParam(defaultValue = "20") int maxResults) {
        log.info("Merchant search for '{}' near [{}, {}]", category, latitude, longitude);
        List<PlaceSearchResult> results = locationService.searchMerchantsByCategory(latitude, longitude, category, maxResults);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/suggestions")
    @Operation(summary = "Get place suggestions", description = "Get autocomplete suggestions as user types")
    public ResponseEntity<List<PlaceSuggestion>> getPlaceSuggestions(
            @Parameter(description = "Partial text input") @RequestParam String text,
            @Parameter(description = "User latitude") @RequestParam double latitude,
            @Parameter(description = "User longitude") @RequestParam double longitude) {
        log.debug("Getting suggestions for: {}", text);
        List<PlaceSuggestion> suggestions = locationService.getPlaceSuggestions(text, latitude, longitude);
        return ResponseEntity.ok(suggestions);
    }

    @GetMapping("/place/{placeId}")
    @Operation(summary = "Get place details", description = "Get detailed information about a specific place")
    public ResponseEntity<PlaceSearchResult> getPlaceDetails(
            @Parameter(description = "Place ID from search results") @PathVariable String placeId) {
        log.info("Getting place details for: {}", placeId);
        PlaceSearchResult result = locationService.getPlaceDetails(placeId);
        if (result == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(result);
    }

    // ========================================================================
    // ROUTING ENDPOINTS
    // ========================================================================

    @GetMapping("/route")
    @Operation(summary = "Calculate a route", description = "Calculate directions between two points")
    public ResponseEntity<RouteResult> calculateRoute(
            @Parameter(description = "Start latitude") @RequestParam double startLat,
            @Parameter(description = "Start longitude") @RequestParam double startLon,
            @Parameter(description = "End latitude") @RequestParam double endLat,
            @Parameter(description = "End longitude") @RequestParam double endLon,
            @Parameter(description = "Travel mode (CAR, WALKING, TRUCK)") @RequestParam(defaultValue = "CAR") String mode) {
        log.info("Route calculation from [{}, {}] to [{}, {}] via {}", startLat, startLon, endLat, endLon, mode);

        TravelMode travelMode;
        try {
            travelMode = TravelMode.fromValue(mode.toUpperCase());
        } catch (Exception e) {
            travelMode = TravelMode.CAR;
        }

        RouteResult result = locationService.calculateRoute(startLat, startLon, endLat, endLon, travelMode);
        if (result == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/route/driving")
    @Operation(summary = "Calculate driving route", description = "Get driving directions between two points")
    public ResponseEntity<RouteResult> getDrivingRoute(
            @Parameter(description = "Start latitude") @RequestParam double startLat,
            @Parameter(description = "Start longitude") @RequestParam double startLon,
            @Parameter(description = "End latitude") @RequestParam double endLat,
            @Parameter(description = "End longitude") @RequestParam double endLon) {
        RouteResult result = locationService.calculateDrivingRoute(startLat, startLon, endLat, endLon);
        if (result == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/route/walking")
    @Operation(summary = "Calculate walking route", description = "Get walking directions between two points")
    public ResponseEntity<RouteResult> getWalkingRoute(
            @Parameter(description = "Start latitude") @RequestParam double startLat,
            @Parameter(description = "Start longitude") @RequestParam double startLon,
            @Parameter(description = "End latitude") @RequestParam double endLat,
            @Parameter(description = "End longitude") @RequestParam double endLon) {
        RouteResult result = locationService.calculateWalkingRoute(startLat, startLon, endLat, endLon);
        if (result == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(result);
    }

    // ========================================================================
    // DISTANCE ENDPOINTS
    // ========================================================================

    @GetMapping("/distance")
    @Operation(summary = "Calculate distance", description = "Calculate straight-line distance between two points")
    public ResponseEntity<DistanceResponse> calculateDistance(
            @Parameter(description = "From latitude") @RequestParam double fromLat,
            @Parameter(description = "From longitude") @RequestParam double fromLon,
            @Parameter(description = "To latitude") @RequestParam double toLat,
            @Parameter(description = "To longitude") @RequestParam double toLon) {
        double distanceMeters = locationService.calculateDistance(fromLat, fromLon, toLat, toLon);
        return ResponseEntity.ok(new DistanceResponse(
                distanceMeters,
                distanceMeters / 1000.0,
                distanceMeters / 1609.34
        ));
    }

    @PostMapping("/distances")
    @Operation(summary = "Calculate multiple distances", description = "Calculate distances from a point to multiple locations")
    public ResponseEntity<Map<String, Double>> calculateDistances(
            @Parameter(description = "From latitude") @RequestParam double fromLat,
            @Parameter(description = "From longitude") @RequestParam double fromLon,
            @RequestBody Map<String, double[]> locations) {
        Map<String, Double> distances = locationService.calculateDistances(fromLat, fromLon, locations);
        return ResponseEntity.ok(distances);
    }

    // ========================================================================
    // DEVICE TRACKING ENDPOINTS
    // ========================================================================

    @PostMapping("/device/{deviceId}/position")
    @Operation(summary = "Update device position", description = "Update the current position of a device for geofence tracking")
    public ResponseEntity<Void> updateDevicePosition(
            @Parameter(description = "Device ID") @PathVariable String deviceId,
            @Parameter(description = "Latitude") @RequestParam double latitude,
            @Parameter(description = "Longitude") @RequestParam double longitude) {
        log.debug("Updating position for device {} to [{}, {}]", deviceId, latitude, longitude);
        locationService.updateDevicePosition(deviceId, latitude, longitude);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/device/{deviceId}/position")
    @Operation(summary = "Get device position", description = "Get the last known position of a device")
    public ResponseEntity<DevicePosition> getDevicePosition(
            @Parameter(description = "Device ID") @PathVariable String deviceId) {
        DevicePosition position = locationService.getDevicePosition(deviceId);
        if (position == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(position);
    }

    // ========================================================================
    // GEOFENCE ENDPOINTS (Admin only)
    // ========================================================================

    @PostMapping("/geofence/merchant/{merchantId}")
    @Operation(summary = "Create merchant geofence", description = "Create a geofence around a merchant location (admin only)")
    public ResponseEntity<Void> createMerchantGeofence(
            @Parameter(description = "Merchant ID") @PathVariable String merchantId,
            @Parameter(description = "Merchant name") @RequestParam String merchantName,
            @Parameter(description = "Latitude") @RequestParam double latitude,
            @Parameter(description = "Longitude") @RequestParam double longitude,
            @Parameter(description = "Radius in meters (default 100)") @RequestParam(defaultValue = "100") double radiusMeters) {
        log.info("Creating geofence for merchant {} at [{}, {}]", merchantId, latitude, longitude);
        locationService.createMerchantGeofence(merchantId, merchantName, latitude, longitude, radiusMeters);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/geofence/merchant/{merchantId}")
    @Operation(summary = "Delete merchant geofence", description = "Delete a merchant's geofence (admin only)")
    public ResponseEntity<Void> deleteMerchantGeofence(
            @Parameter(description = "Merchant ID") @PathVariable String merchantId) {
        log.info("Deleting geofence for merchant {}", merchantId);
        locationService.deleteMerchantGeofence(merchantId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/geofences")
    @Operation(summary = "List all geofences", description = "List all active geofences (admin only)")
    public ResponseEntity<List<GeofenceInfo>> listGeofences() {
        List<GeofenceInfo> geofences = locationService.listGeofences();
        return ResponseEntity.ok(geofences);
    }

    // ========================================================================
    // RESPONSE DTOs
    // ========================================================================

    public record DistanceResponse(
            double meters,
            double kilometers,
            double miles
    ) {}
}
