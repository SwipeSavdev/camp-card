package com.bsa.campcard.controller;

import com.bsa.campcard.service.LocationService;
import com.bsa.campcard.service.LocationService.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import org.springframework.context.annotation.Import;

/**
 * Unit tests for LocationController using @WebMvcTest.
 *
 * Tests the REST API layer including:
 * - Geocoding endpoints
 * - Place search endpoints
 * - Routing endpoints
 * - Distance calculation endpoints
 * - Device tracking endpoints
 * - Geofence management endpoints
 *
 * Security is disabled for unit testing - authorization is tested at integration level.
 */
@WebMvcTest(value = LocationController.class, excludeAutoConfiguration = SecurityAutoConfiguration.class)
@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
@DisplayName("LocationController Tests")
class LocationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private LocationService locationService;

    private GeocodingResult sampleGeocodingResult;
    private PlaceSearchResult samplePlaceSearchResult;
    private PlaceSuggestion samplePlaceSuggestion;
    private RouteResult sampleRouteResult;
    private DevicePosition sampleDevicePosition;
    private GeofenceInfo sampleGeofenceInfo;

    @BeforeEach
    void setUp() {
        sampleGeocodingResult = new GeocodingResult(
                -104.9903,
                39.7392,
                "123 Main St, Denver, CO 80202",
                "123",
                "Main St",
                "Denver",
                "CO",
                "80202",
                "USA",
                0.95
        );

        samplePlaceSearchResult = new PlaceSearchResult(
                "Coffee Shop",
                39.7392,
                -104.9903,
                "456",
                "Market St",
                "Denver",
                "CO",
                "80202",
                "USA",
                500.0,
                0.90,
                List.of("cafe", "food")
        );

        samplePlaceSuggestion = new PlaceSuggestion(
                "Coffee Shop on Market St",
                "place-id-123"
        );

        List<RouteStep> steps = List.of(
                new RouteStep(39.7392, -104.9903, 39.7400, -104.9900, 0.5, 60)
        );
        sampleRouteResult = new RouteResult(5.5, 600, "CAR", steps);

        sampleDevicePosition = new DevicePosition(
                "device-123",
                39.7392,
                -104.9903,
                Instant.now(),
                Instant.now()
        );

        sampleGeofenceInfo = new GeofenceInfo(
                "merchant-123",
                "ACTIVE",
                Instant.now().minus(1, ChronoUnit.DAYS),
                Instant.now()
        );
    }

    // ========================================================================
    // GEOCODING TESTS
    // ========================================================================

    @Nested
    @DisplayName("GET /api/v1/location/geocode - Geocode Address")
    class GeocodeTests {

        @Test
        @DisplayName("Should geocode address successfully")
        void geocode_ValidAddress_Success() throws Exception {
            when(locationService.geocode("123 Main St, Denver, CO")).thenReturn(sampleGeocodingResult);

            mockMvc.perform(get("/api/v1/location/geocode")
                            .param("address", "123 Main St, Denver, CO")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.latitude").value(39.7392))
                    .andExpect(jsonPath("$.longitude").value(-104.9903))
                    .andExpect(jsonPath("$.city").value("Denver"))
                    .andExpect(jsonPath("$.state").value("CO"))
                    .andExpect(jsonPath("$.relevance").value(0.95));

            verify(locationService).geocode("123 Main St, Denver, CO");
        }

        @Test
        @DisplayName("Should return 404 when address not found")
        void geocode_AddressNotFound_Returns404() throws Exception {
            when(locationService.geocode("nonexistent address")).thenReturn(null);

            mockMvc.perform(get("/api/v1/location/geocode")
                            .param("address", "nonexistent address")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isNotFound());

            verify(locationService).geocode("nonexistent address");
        }
    }

    @Nested
    @DisplayName("GET /api/v1/location/reverse-geocode - Reverse Geocode")
    class ReverseGeocodeTests {

        @Test
        @DisplayName("Should reverse geocode coordinates successfully")
        void reverseGeocode_ValidCoordinates_Success() throws Exception {
            when(locationService.reverseGeocode(39.7392, -104.9903)).thenReturn(sampleGeocodingResult);

            mockMvc.perform(get("/api/v1/location/reverse-geocode")
                            .param("latitude", "39.7392")
                            .param("longitude", "-104.9903")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.formattedAddress").value("123 Main St, Denver, CO 80202"))
                    .andExpect(jsonPath("$.city").value("Denver"));

            verify(locationService).reverseGeocode(39.7392, -104.9903);
        }

        @Test
        @DisplayName("Should return 404 when location not found")
        void reverseGeocode_LocationNotFound_Returns404() throws Exception {
            when(locationService.reverseGeocode(0.0, 0.0)).thenReturn(null);

            mockMvc.perform(get("/api/v1/location/reverse-geocode")
                            .param("latitude", "0.0")
                            .param("longitude", "0.0")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isNotFound());
        }
    }

    // ========================================================================
    // PLACE SEARCH TESTS
    // ========================================================================

    @Nested
    @DisplayName("GET /api/v1/location/search - Search Places")
    class SearchPlacesTests {

        @Test
        @DisplayName("Should search places successfully")
        void searchPlaces_ValidQuery_Success() throws Exception {
            when(locationService.searchNearby(39.7392, -104.9903, "coffee", 10, 50000))
                    .thenReturn(List.of(samplePlaceSearchResult));

            mockMvc.perform(get("/api/v1/location/search")
                            .param("query", "coffee")
                            .param("latitude", "39.7392")
                            .param("longitude", "-104.9903")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].name").value("Coffee Shop"))
                    .andExpect(jsonPath("$[0].distanceMeters").value(500.0));

            verify(locationService).searchNearby(39.7392, -104.9903, "coffee", 10, 50000);
        }

        @Test
        @DisplayName("Should search with custom max results and radius")
        void searchPlaces_CustomParameters_Success() throws Exception {
            when(locationService.searchNearby(39.7392, -104.9903, "restaurant", 20, 10000))
                    .thenReturn(Collections.emptyList());

            mockMvc.perform(get("/api/v1/location/search")
                            .param("query", "restaurant")
                            .param("latitude", "39.7392")
                            .param("longitude", "-104.9903")
                            .param("maxResults", "20")
                            .param("radiusMeters", "10000")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray());

            verify(locationService).searchNearby(39.7392, -104.9903, "restaurant", 20, 10000);
        }

        @Test
        @DisplayName("Should return empty list when no places found")
        void searchPlaces_NoResults_ReturnsEmpty() throws Exception {
            when(locationService.searchNearby(anyDouble(), anyDouble(), anyString(), eq(10), eq(50000)))
                    .thenReturn(Collections.emptyList());

            mockMvc.perform(get("/api/v1/location/search")
                            .param("query", "nonexistent")
                            .param("latitude", "39.7392")
                            .param("longitude", "-104.9903")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$", hasSize(0)));
        }
    }

    @Nested
    @DisplayName("GET /api/v1/location/search/merchants - Search Merchants")
    class SearchMerchantsTests {

        @Test
        @DisplayName("Should search merchants by category")
        void searchMerchants_ValidCategory_Success() throws Exception {
            when(locationService.searchMerchantsByCategory(39.7392, -104.9903, "restaurant", 20))
                    .thenReturn(List.of(samplePlaceSearchResult));

            mockMvc.perform(get("/api/v1/location/search/merchants")
                            .param("category", "restaurant")
                            .param("latitude", "39.7392")
                            .param("longitude", "-104.9903")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$", hasSize(1)));

            verify(locationService).searchMerchantsByCategory(39.7392, -104.9903, "restaurant", 20);
        }
    }

    @Nested
    @DisplayName("GET /api/v1/location/suggestions - Get Place Suggestions")
    class GetPlaceSuggestionsTests {

        @Test
        @DisplayName("Should get place suggestions")
        void getPlaceSuggestions_ValidText_Success() throws Exception {
            when(locationService.getPlaceSuggestions("coff", 39.7392, -104.9903))
                    .thenReturn(List.of(samplePlaceSuggestion));

            mockMvc.perform(get("/api/v1/location/suggestions")
                            .param("text", "coff")
                            .param("latitude", "39.7392")
                            .param("longitude", "-104.9903")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$[0].text").value("Coffee Shop on Market St"))
                    .andExpect(jsonPath("$[0].placeId").value("place-id-123"));

            verify(locationService).getPlaceSuggestions("coff", 39.7392, -104.9903);
        }
    }

    @Nested
    @DisplayName("GET /api/v1/location/place/{placeId} - Get Place Details")
    class GetPlaceDetailsTests {

        @Test
        @DisplayName("Should get place details by ID")
        void getPlaceDetails_ValidId_Success() throws Exception {
            when(locationService.getPlaceDetails("place-id-123")).thenReturn(samplePlaceSearchResult);

            mockMvc.perform(get("/api/v1/location/place/place-id-123")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.name").value("Coffee Shop"))
                    .andExpect(jsonPath("$.latitude").value(39.7392));

            verify(locationService).getPlaceDetails("place-id-123");
        }

        @Test
        @DisplayName("Should return 404 when place not found")
        void getPlaceDetails_NotFound_Returns404() throws Exception {
            when(locationService.getPlaceDetails("unknown-place")).thenReturn(null);

            mockMvc.perform(get("/api/v1/location/place/unknown-place")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isNotFound());
        }
    }

    // ========================================================================
    // ROUTING TESTS
    // ========================================================================

    @Nested
    @DisplayName("GET /api/v1/location/route - Calculate Route")
    class CalculateRouteTests {

        @Test
        @DisplayName("Should calculate route successfully")
        void calculateRoute_ValidCoordinates_Success() throws Exception {
            when(locationService.calculateRoute(eq(39.7392), eq(-104.9903), eq(39.7500), eq(-104.9800), any()))
                    .thenReturn(sampleRouteResult);

            mockMvc.perform(get("/api/v1/location/route")
                            .param("startLat", "39.7392")
                            .param("startLon", "-104.9903")
                            .param("endLat", "39.7500")
                            .param("endLon", "-104.9800")
                            .param("mode", "CAR")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.distanceKm").value(5.5))
                    .andExpect(jsonPath("$.durationSeconds").value(600))
                    .andExpect(jsonPath("$.travelMode").value("CAR"))
                    .andExpect(jsonPath("$.steps").isArray());

            verify(locationService).calculateRoute(eq(39.7392), eq(-104.9903), eq(39.7500), eq(-104.9800), any());
        }

        @Test
        @DisplayName("Should return 404 when route not found")
        void calculateRoute_NotFound_Returns404() throws Exception {
            when(locationService.calculateRoute(anyDouble(), anyDouble(), anyDouble(), anyDouble(), any()))
                    .thenReturn(null);

            mockMvc.perform(get("/api/v1/location/route")
                            .param("startLat", "0.0")
                            .param("startLon", "0.0")
                            .param("endLat", "0.0")
                            .param("endLon", "0.0")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("GET /api/v1/location/route/driving - Get Driving Route")
    class GetDrivingRouteTests {

        @Test
        @DisplayName("Should calculate driving route")
        void getDrivingRoute_Success() throws Exception {
            when(locationService.calculateDrivingRoute(39.7392, -104.9903, 39.7500, -104.9800))
                    .thenReturn(sampleRouteResult);

            mockMvc.perform(get("/api/v1/location/route/driving")
                            .param("startLat", "39.7392")
                            .param("startLon", "-104.9903")
                            .param("endLat", "39.7500")
                            .param("endLon", "-104.9800")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.distanceKm").value(5.5));

            verify(locationService).calculateDrivingRoute(39.7392, -104.9903, 39.7500, -104.9800);
        }
    }

    @Nested
    @DisplayName("GET /api/v1/location/route/walking - Get Walking Route")
    class GetWalkingRouteTests {

        @Test
        @DisplayName("Should calculate walking route")
        void getWalkingRoute_Success() throws Exception {
            when(locationService.calculateWalkingRoute(39.7392, -104.9903, 39.7500, -104.9800))
                    .thenReturn(sampleRouteResult);

            mockMvc.perform(get("/api/v1/location/route/walking")
                            .param("startLat", "39.7392")
                            .param("startLon", "-104.9903")
                            .param("endLat", "39.7500")
                            .param("endLon", "-104.9800")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.distanceKm").value(5.5));

            verify(locationService).calculateWalkingRoute(39.7392, -104.9903, 39.7500, -104.9800);
        }
    }

    // ========================================================================
    // DISTANCE TESTS
    // ========================================================================

    @Nested
    @DisplayName("GET /api/v1/location/distance - Calculate Distance")
    class CalculateDistanceTests {

        @Test
        @DisplayName("Should calculate distance between two points")
        void calculateDistance_ValidCoordinates_Success() throws Exception {
            when(locationService.calculateDistance(39.7392, -104.9903, 39.7500, -104.9800))
                    .thenReturn(1500.0);

            mockMvc.perform(get("/api/v1/location/distance")
                            .param("fromLat", "39.7392")
                            .param("fromLon", "-104.9903")
                            .param("toLat", "39.7500")
                            .param("toLon", "-104.9800")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.meters").value(1500.0))
                    .andExpect(jsonPath("$.kilometers").value(1.5))
                    .andExpect(jsonPath("$.miles").isNumber());

            verify(locationService).calculateDistance(39.7392, -104.9903, 39.7500, -104.9800);
        }
    }

    @Nested
    @DisplayName("POST /api/v1/location/distances - Calculate Multiple Distances")
    class CalculateDistancesTests {

        @Test
        @DisplayName("Should calculate distances to multiple locations")
        void calculateDistances_MultipleLocations_Success() throws Exception {
            Map<String, double[]> locations = new HashMap<>();
            locations.put("location1", new double[]{39.7500, -104.9800});
            locations.put("location2", new double[]{39.7600, -104.9700});

            Map<String, Double> distances = new HashMap<>();
            distances.put("location1", 1000.0);
            distances.put("location2", 2000.0);

            when(locationService.calculateDistances(eq(39.7392), eq(-104.9903), any())).thenReturn(distances);

            mockMvc.perform(post("/api/v1/location/distances")
                            .param("fromLat", "39.7392")
                            .param("fromLon", "-104.9903")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(locations)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.location1").value(1000.0))
                    .andExpect(jsonPath("$.location2").value(2000.0));

            verify(locationService).calculateDistances(eq(39.7392), eq(-104.9903), any());
        }
    }

    // ========================================================================
    // DEVICE TRACKING TESTS
    // ========================================================================

    @Nested
    @DisplayName("POST /api/v1/location/device/{deviceId}/position - Update Device Position")
    class UpdateDevicePositionTests {

        @Test
        @DisplayName("Should update device position")
        void updateDevicePosition_Success() throws Exception {
            doNothing().when(locationService).updateDevicePosition("device-123", 39.7392, -104.9903);

            mockMvc.perform(post("/api/v1/location/device/device-123/position")
                            .param("latitude", "39.7392")
                            .param("longitude", "-104.9903")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk());

            verify(locationService).updateDevicePosition("device-123", 39.7392, -104.9903);
        }
    }

    @Nested
    @DisplayName("GET /api/v1/location/device/{deviceId}/position - Get Device Position")
    class GetDevicePositionTests {

        @Test
        @DisplayName("Should get device position")
        void getDevicePosition_Success() throws Exception {
            when(locationService.getDevicePosition("device-123")).thenReturn(sampleDevicePosition);

            mockMvc.perform(get("/api/v1/location/device/device-123/position")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.deviceId").value("device-123"))
                    .andExpect(jsonPath("$.latitude").value(39.7392))
                    .andExpect(jsonPath("$.longitude").value(-104.9903));

            verify(locationService).getDevicePosition("device-123");
        }

        @Test
        @DisplayName("Should return 404 when device not found")
        void getDevicePosition_NotFound_Returns404() throws Exception {
            when(locationService.getDevicePosition("unknown-device")).thenReturn(null);

            mockMvc.perform(get("/api/v1/location/device/unknown-device/position")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isNotFound());
        }
    }

    // ========================================================================
    // GEOFENCE TESTS
    // ========================================================================

    @Nested
    @DisplayName("POST /api/v1/location/geofence/merchant/{merchantId} - Create Merchant Geofence")
    class CreateMerchantGeofenceTests {

        @Test
        @DisplayName("Should create merchant geofence")
        void createMerchantGeofence_Success() throws Exception {
            doNothing().when(locationService).createMerchantGeofence(
                    "merchant-123", "Coffee Shop", 39.7392, -104.9903, 100);

            mockMvc.perform(post("/api/v1/location/geofence/merchant/merchant-123")
                            .param("merchantName", "Coffee Shop")
                            .param("latitude", "39.7392")
                            .param("longitude", "-104.9903")
                            .param("radiusMeters", "100")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk());

            verify(locationService).createMerchantGeofence(
                    "merchant-123", "Coffee Shop", 39.7392, -104.9903, 100);
        }
    }

    @Nested
    @DisplayName("DELETE /api/v1/location/geofence/merchant/{merchantId} - Delete Merchant Geofence")
    class DeleteMerchantGeofenceTests {

        @Test
        @DisplayName("Should delete merchant geofence")
        void deleteMerchantGeofence_Success() throws Exception {
            doNothing().when(locationService).deleteMerchantGeofence("merchant-123");

            mockMvc.perform(delete("/api/v1/location/geofence/merchant/merchant-123")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk());

            verify(locationService).deleteMerchantGeofence("merchant-123");
        }
    }

    @Nested
    @DisplayName("GET /api/v1/location/geofences - List Geofences")
    class ListGeofencesTests {

        @Test
        @DisplayName("Should list all geofences")
        void listGeofences_Success() throws Exception {
            when(locationService.listGeofences()).thenReturn(List.of(sampleGeofenceInfo));

            mockMvc.perform(get("/api/v1/location/geofences")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].geofenceId").value("merchant-123"))
                    .andExpect(jsonPath("$[0].status").value("ACTIVE"));

            verify(locationService).listGeofences();
        }

        @Test
        @DisplayName("Should return empty list when no geofences")
        void listGeofences_Empty_ReturnsEmptyList() throws Exception {
            when(locationService.listGeofences()).thenReturn(Collections.emptyList());

            mockMvc.perform(get("/api/v1/location/geofences")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$", hasSize(0)));
        }
    }
}
