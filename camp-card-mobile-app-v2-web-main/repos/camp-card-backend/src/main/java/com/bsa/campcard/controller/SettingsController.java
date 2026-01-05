package com.bsa.campcard.controller;

import java.time.Instant;
import java.util.UUID;
import java.util.Map;
import java.util.HashMap;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SettingsController {

 // --- DTOs ---

 public record NotificationSettingsRequest(
 Boolean notifications_enabled,
 Boolean push_notifications_enabled,
 Boolean email_notifications_enabled,
 Boolean sms_notifications_enabled,
 Double notification_radius_km,
 String quiet_hours_start,
 String quiet_hours_end,
 Boolean quiet_hours_enabled
 ) {}

 public record GeolocationSettingsRequest(
 Boolean geolocation_enabled,
 Double notification_radius_km,
 String preferred_categories,
 Integer min_discount_percentage
 ) {}

 public record PrivacySettingsRequest(
 Boolean share_location,
 Boolean marketing_consent,
 Boolean data_sharing_consent
 ) {}

 public record UserSettingsResponse(
 String id,
 String user_id,
 Boolean notifications_enabled,
 Boolean push_notifications_enabled,
 Boolean email_notifications_enabled,
 Boolean sms_notifications_enabled,
 Boolean geolocation_enabled,
 Double notification_radius_km,
 String preferred_categories,
 Integer min_discount_percentage,
 Boolean share_location,
 Boolean marketing_consent,
 Boolean data_sharing_consent,
 String quiet_hours_start,
 String quiet_hours_end,
 Boolean quiet_hours_enabled,
 String created_at,
 String updated_at
 ) {}

 public record SettingsUpdateResponse(
 String status,
 String message,
 UserSettingsResponse settings
 ) {}

 public record NotificationPreference(
 String category,
 Boolean enabled,
 Integer min_discount
 ) {}

 public record LocationHistoryEntry(
 String timestamp,
 Double latitude,
 Double longitude,
 String location_name,
 String merchant_name
 ) {}

 // Mock storage for settings
 private static final Map<String, UserSettingsResponse> SETTINGS_STORE = new HashMap<>();

 static {
 // Initialize default settings for test user
 SETTINGS_STORE.put(
 "43f8ed30-fcef-4abc-bf79-67d57836e5d2",
 new UserSettingsResponse(
 UUID.randomUUID().toString(),
 "43f8ed30-fcef-4abc-bf79-67d57836e5d2",
 true,
 true,
 true,
 false,
 true,
 5.0,
 "DINING,AUTO,ENTERTAINMENT",
 15,
 false,
 false,
 false,
 "22:00",
 "07:00",
 false,
 Instant.now().toString(),
 Instant.now().toString()
 )
 );
 }

 @GetMapping("/users/{user_id}/settings")
 public UserSettingsResponse getUserSettings(@PathVariable String user_id) {
 return SETTINGS_STORE.getOrDefault(user_id, createDefaultSettings(user_id));
 }

 @PutMapping("/users/{user_id}/settings/notifications")
 public SettingsUpdateResponse updateNotificationSettings(
 @PathVariable String user_id,
 @RequestBody NotificationSettingsRequest body
 ) {
 var settings = getUserSettings(user_id);

 var updated = new UserSettingsResponse(
 settings.id(),
 settings.user_id(),
 body.notifications_enabled() != null ? body.notifications_enabled() : settings.notifications_enabled(),
 body.push_notifications_enabled() != null ? body.push_notifications_enabled() : settings.push_notifications_enabled(),
 body.email_notifications_enabled() != null ? body.email_notifications_enabled() : settings.email_notifications_enabled(),
 body.sms_notifications_enabled() != null ? body.sms_notifications_enabled() : settings.sms_notifications_enabled(),
 settings.geolocation_enabled(),
 settings.notification_radius_km(),
 settings.preferred_categories(),
 settings.min_discount_percentage(),
 settings.share_location(),
 settings.marketing_consent(),
 settings.data_sharing_consent(),
 body.quiet_hours_start() != null ? body.quiet_hours_start() : settings.quiet_hours_start(),
 body.quiet_hours_end() != null ? body.quiet_hours_end() : settings.quiet_hours_end(),
 body.quiet_hours_enabled() != null ? body.quiet_hours_enabled() : settings.quiet_hours_enabled(),
 settings.created_at(),
 Instant.now().toString()
 );

 SETTINGS_STORE.put(user_id, updated);

 return new SettingsUpdateResponse(
 "success",
 "Notification settings updated successfully",
 updated
 );
 }

 @PutMapping("/users/{user_id}/settings/geolocation")
 public SettingsUpdateResponse updateGeolocationSettings(
 @PathVariable String user_id,
 @RequestBody GeolocationSettingsRequest body
 ) {
 var settings = getUserSettings(user_id);

 var updated = new UserSettingsResponse(
 settings.id(),
 settings.user_id(),
 settings.notifications_enabled(),
 settings.push_notifications_enabled(),
 settings.email_notifications_enabled(),
 settings.sms_notifications_enabled(),
 body.geolocation_enabled() != null ? body.geolocation_enabled() : settings.geolocation_enabled(),
 body.notification_radius_km() != null ? body.notification_radius_km() : settings.notification_radius_km(),
 body.preferred_categories() != null ? body.preferred_categories() : settings.preferred_categories(),
 body.min_discount_percentage() != null ? body.min_discount_percentage() : settings.min_discount_percentage(),
 settings.share_location(),
 settings.marketing_consent(),
 settings.data_sharing_consent(),
 settings.quiet_hours_start(),
 settings.quiet_hours_end(),
 settings.quiet_hours_enabled(),
 settings.created_at(),
 Instant.now().toString()
 );

 SETTINGS_STORE.put(user_id, updated);

 return new SettingsUpdateResponse(
 "success",
 "Geolocation settings updated successfully",
 updated
 );
 }

 @PutMapping("/users/{user_id}/settings/privacy")
 public SettingsUpdateResponse updatePrivacySettings(
 @PathVariable String user_id,
 @RequestBody PrivacySettingsRequest body
 ) {
 var settings = getUserSettings(user_id);

 var updated = new UserSettingsResponse(
 settings.id(),
 settings.user_id(),
 settings.notifications_enabled(),
 settings.push_notifications_enabled(),
 settings.email_notifications_enabled(),
 settings.sms_notifications_enabled(),
 settings.geolocation_enabled(),
 settings.notification_radius_km(),
 settings.preferred_categories(),
 settings.min_discount_percentage(),
 body.share_location() != null ? body.share_location() : settings.share_location(),
 body.marketing_consent() != null ? body.marketing_consent() : settings.marketing_consent(),
 body.data_sharing_consent() != null ? body.data_sharing_consent() : settings.data_sharing_consent(),
 settings.quiet_hours_start(),
 settings.quiet_hours_end(),
 settings.quiet_hours_enabled(),
 settings.created_at(),
 Instant.now().toString()
 );

 SETTINGS_STORE.put(user_id, updated);

 return new SettingsUpdateResponse(
 "success",
 "Privacy settings updated successfully",
 updated
 );
 }

 @PostMapping("/users/{user_id}/settings/reset")
 public SettingsUpdateResponse resetSettings(@PathVariable String user_id) {
 var defaultSettings = createDefaultSettings(user_id);
 SETTINGS_STORE.put(user_id, defaultSettings);

 return new SettingsUpdateResponse(
 "success",
 "Settings reset to default values",
 defaultSettings
 );
 }

 @PostMapping("/users/{user_id}/settings/radius")
 public Map<String, Object> updateNotificationRadius(
 @PathVariable String user_id,
 @RequestBody Map<String, Double> body
 ) {
 var settings = getUserSettings(user_id);
 Double newRadius = body.get("radius_km");

 if (newRadius == null || newRadius < 0.5 || newRadius > 50.0) {
 return Map.of(
 "error", "Radius must be between 0.5 and 50 km",
 "current_radius", settings.notification_radius_km()
 );
 }

 var updated = new UserSettingsResponse(
 settings.id(),
 settings.user_id(),
 settings.notifications_enabled(),
 settings.push_notifications_enabled(),
 settings.email_notifications_enabled(),
 settings.sms_notifications_enabled(),
 settings.geolocation_enabled(),
 newRadius,
 settings.preferred_categories(),
 settings.min_discount_percentage(),
 settings.share_location(),
 settings.marketing_consent(),
 settings.data_sharing_consent(),
 settings.quiet_hours_start(),
 settings.quiet_hours_end(),
 settings.quiet_hours_enabled(),
 settings.created_at(),
 Instant.now().toString()
 );

 SETTINGS_STORE.put(user_id, updated);

 return Map.of(
 "status", "success",
 "message", "Notification radius updated",
 "previous_radius", settings.notification_radius_km(),
 "new_radius", newRadius,
 "updated_at", Instant.now().toString()
 );
 }

 @PostMapping("/users/{user_id}/settings/toggle-notifications")
 public Map<String, Object> toggleNotifications(
 @PathVariable String user_id,
 @RequestBody Map<String, Boolean> body
 ) {
 var settings = getUserSettings(user_id);
 Boolean enabled = body.get("enabled");

 var updated = new UserSettingsResponse(
 settings.id(),
 settings.user_id(),
 enabled,
 enabled ? settings.push_notifications_enabled() : false,
 enabled ? settings.email_notifications_enabled() : false,
 false,
 settings.geolocation_enabled(),
 settings.notification_radius_km(),
 settings.preferred_categories(),
 settings.min_discount_percentage(),
 settings.share_location(),
 settings.marketing_consent(),
 settings.data_sharing_consent(),
 settings.quiet_hours_start(),
 settings.quiet_hours_end(),
 settings.quiet_hours_enabled(),
 settings.created_at(),
 Instant.now().toString()
 );

 SETTINGS_STORE.put(user_id, updated);

 return Map.of(
 "status", "success",
 "notifications_enabled", enabled,
 "message", enabled ? "Notifications enabled" : "Notifications disabled",
 "updated_at", Instant.now().toString()
 );
 }

 @PostMapping("/users/{user_id}/settings/category-preference")
 public Map<String, Object> setCategoryPreference(
 @PathVariable String user_id,
 @RequestBody Map<String, String> body
 ) {
 var settings = getUserSettings(user_id);
 String categories = body.get("categories"); // Comma-separated

 var updated = new UserSettingsResponse(
 settings.id(),
 settings.user_id(),
 settings.notifications_enabled(),
 settings.push_notifications_enabled(),
 settings.email_notifications_enabled(),
 settings.sms_notifications_enabled(),
 settings.geolocation_enabled(),
 settings.notification_radius_km(),
 categories,
 settings.min_discount_percentage(),
 settings.share_location(),
 settings.marketing_consent(),
 settings.data_sharing_consent(),
 settings.quiet_hours_start(),
 settings.quiet_hours_end(),
 settings.quiet_hours_enabled(),
 settings.created_at(),
 Instant.now().toString()
 );

 SETTINGS_STORE.put(user_id, updated);

 return Map.of(
 "status", "success",
 "message", "Category preferences updated",
 "preferred_categories", categories,
 "updated_at", Instant.now().toString()
 );
 }

 // Helper method to create default settings
 private UserSettingsResponse createDefaultSettings(String user_id) {
 return new UserSettingsResponse(
 UUID.randomUUID().toString(),
 user_id,
 true,
 true,
 true,
 false,
 true,
 5.0,
 "DINING,AUTO,ENTERTAINMENT",
 0,
 false,
 false,
 false,
 "22:00",
 "07:00",
 false,
 Instant.now().toString(),
 Instant.now().toString()
 );
 }
}
