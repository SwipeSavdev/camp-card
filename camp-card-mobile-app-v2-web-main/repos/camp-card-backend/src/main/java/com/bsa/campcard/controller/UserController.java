package com.bsa.campcard.controller;

import java.time.Instant;
import java.util.UUID;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;
import java.util.List;
import java.util.Map;

@RestController
public class UserController {

 // --- DTOs ---

 public record UserCreateRequest(
 String first_name,
 String last_name,
 String email,
 String password,
 String phone_number,
 String council_id
 ) {}

 public record UserUpdateRequest(
 String first_name,
 String last_name,
 String phone_number,
 String profile_image_url
 ) {}

 public record UserResponse(
 String id,
 String first_name,
 String last_name,
 String email,
 String phone_number,
 String role,
 String council_id,
 Boolean is_active,
 Boolean email_verified,
 String profile_image_url,
 Integer login_count,
 String last_login_at,
 String created_at,
 String updated_at
 ) {}

 public record UserListResponse(List<UserResponse> users, Integer total) {}

 // Mock storage for demo
 private static final List<UserResponse> SAMPLE_USERS = List.of(
 new UserResponse(
 "user-001",
 "Sarah",
 "Johnson",
 "sarah.johnson@bsa.org",
 "+1-555-0100",
 "COUNCIL_ADMIN",
 "42",
 true,
 true,
 null,
 5,
 Instant.now().toString(),
 Instant.now().toString(),
 Instant.now().toString()
 ),
 new UserResponse(
 "user-002",
 "Michael",
 "Chen",
 "michael.chen@bsa.org",
 "+1-555-0101",
 "ADMIN",
 "42",
 true,
 true,
 null,
 10,
 Instant.now().toString(),
 Instant.now().toString(),
 Instant.now().toString()
 ),
 new UserResponse(
 "user-003",
 "Jason",
 "Mayoral",
 "jason.mayoral@me.com",
 null,
 "CUSTOMER",
 "42",
 true,
 true,
 null,
 1,
 Instant.now().toString(),
 Instant.now().toString(),
 Instant.now().toString()
 )
 );

 @GetMapping("/users")
 public UserListResponse listUsers() {
 return new UserListResponse(SAMPLE_USERS, SAMPLE_USERS.size());
 }

 @GetMapping("/users/{id}")
 public UserResponse getUser(@PathVariable String id) {
 return SAMPLE_USERS.stream()
 .filter(u -> u.id().equals(id))
 .findFirst()
 .orElse(null);
 }

 @PostMapping("/users")
 @ResponseStatus(HttpStatus.CREATED)
 public UserResponse createUser(@RequestBody UserCreateRequest body) {
 var newUser = new UserResponse(
 UUID.randomUUID().toString(),
 body.first_name(),
 body.last_name(),
 body.email(),
 body.phone_number(),
 "CUSTOMER",
 body.council_id() != null ? body.council_id() : "42",
 true,
 false,
 null,
 0,
 null,
 Instant.now().toString(),
 Instant.now().toString()
 );
 return newUser;
 }

 @PutMapping("/users/{id}")
 public UserResponse updateUser(@PathVariable String id, @RequestBody UserUpdateRequest body) {
 var user = getUser(id);
 if (user == null) {
 return null;
 }
 // In a real implementation, update the user in the database
 return new UserResponse(
 user.id(),
 body.first_name() != null ? body.first_name() : user.first_name(),
 body.last_name() != null ? body.last_name() : user.last_name(),
 user.email(),
 body.phone_number() != null ? body.phone_number() : user.phone_number(),
 user.role(),
 user.council_id(),
 user.is_active(),
 user.email_verified(),
 body.profile_image_url() != null ? body.profile_image_url() : user.profile_image_url(),
 user.login_count(),
 user.last_login_at(),
 user.created_at(),
 Instant.now().toString()
 );
 }

 @DeleteMapping("/users/{id}")
 @ResponseStatus(HttpStatus.NO_CONTENT)
 public void deleteUser(@PathVariable String id) {
 // In a real implementation, delete/soft-delete the user from the database
 }

 @PostMapping("/users/{id}/activate")
 public Map<String, String> activateUser(@PathVariable String id) {
 return Map.of("status", "activated", "user_id", id);
 }

 @PostMapping("/users/{id}/deactivate")
 public Map<String, String> deactivateUser(@PathVariable String id) {
 return Map.of("status", "deactivated", "user_id", id);
 }
}
