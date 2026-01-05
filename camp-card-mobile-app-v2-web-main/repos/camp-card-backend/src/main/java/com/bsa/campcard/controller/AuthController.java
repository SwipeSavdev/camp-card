package com.bsa.campcard.controller;

import java.time.Instant;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthController {

 // NOTE: Stub implementation. Replace with real auth/token service.

 public record RegisterRequest(
 String email,
 String password,
 String first_name,
 String last_name,
 String invitation_code
 ) {}

 public record LoginRequest(String email, String password) {}

 public record RefreshRequest(String refresh_token) {}

 public record UserResponse(
 String id,
 String email,
 String full_name,
 String role,
 String council_id
 ) {}

 public record AuthResponse(
 String access_token,
 String refresh_token,
 Integer expires_in,
 UserResponse user
 ) {}

 @PostMapping("/auth/register")
 @ResponseStatus(HttpStatus.CREATED)
 public AuthResponse register(@RequestBody RegisterRequest body) {
 var role = inferRole(body.email);
 var user = new UserResponse(
 UUID.randomUUID().toString(),
 body.email,
 ((body.first_name != null ? body.first_name : "") + " " + (body.last_name != null ? body.last_name : "")).trim(),
 role,
 inferCouncilId(body.email, body.invitation_code)
 );

 return new AuthResponse(
 issueAccessToken(user.id()),
 issueRefreshToken(user.id()),
 3600,
 user
 );
 }

 @PostMapping("/auth/login")
 public AuthResponse login(@RequestBody LoginRequest body) {
 var role = inferRole(body.email);
 var user = new UserResponse(
 UUID.randomUUID().toString(),
 body.email,
 body.email,
 role,
 inferCouncilId(body.email, null)
 );

 return new AuthResponse(
 issueAccessToken(user.id()),
 issueRefreshToken(user.id()),
 3600,
 user
 );
 }

 @PostMapping("/auth/refresh")
 public AuthResponse refresh(@RequestBody RefreshRequest body) {
 // In a real implementation you would validate the refresh token and load user.
 var user = new UserResponse(
 UUID.randomUUID().toString(),
 "demo@campcard.app",
 "Demo User",
 "CUSTOMER",
 "42"
 );

 return new AuthResponse(
 issueAccessToken(user.id()),
 body.refresh_token,
 3600,
 user
 );
 }

 private static String inferRole(String email) {
 if (email == null) return "CUSTOMER";
 var e = email.toLowerCase();
 if (e.contains("leader")) return "TROOP_LEADER";
 if (e.contains("scout")) return "SCOUT";
 return "CUSTOMER";
 }

 private static String inferCouncilId(String email, String invitationCode) {
 // Simple heuristics for the stub
 if (invitationCode != null && !invitationCode.isBlank()) return invitationCode.trim();
 if (email != null && email.contains("+council")) {
 // ex: user+council12@example.com
 var idx = email.indexOf("+council");
 var tail = email.substring(idx + "+council".length());
 var digits = tail.replaceAll("[^0-9].*$", "");
 if (!digits.isBlank()) return digits;
 }
 return "42";
 }

 private static String issueAccessToken(String userId) {
 return "access_" + userId + "_" + Instant.now().getEpochSecond() + "_" + UUID.randomUUID();
 }

 private static String issueRefreshToken(String userId) {
 return "refresh_" + userId + "_" + UUID.randomUUID();
 }
}
