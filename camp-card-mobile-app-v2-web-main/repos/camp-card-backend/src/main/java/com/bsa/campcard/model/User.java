package com.bsa.campcard.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "users")
public class User {
 @Id
 @GeneratedValue(strategy = GenerationType.UUID)
 private UUID id;

 @Column(name = "first_name")
 private String firstName;

 @Column(name = "last_name")
 private String lastName;

 @Column(name = "email", nullable = false, unique = true)
 private String email;

 @Column(name = "password_hash")
 private String passwordHash;

 @Column(name = "password_reset_token")
 private String passwordResetToken;

 @Column(name = "password_reset_token_expiry")
 private Instant passwordResetTokenExpiry;

 @Column(name = "phone_number")
 private String phoneNumber;

 @Column(name = "council_id")
 private UUID councilId;

 @Column(name = "is_active", nullable = false)
 private Boolean isActive = true;

 @Column(name = "email_verified")
 private Boolean emailVerified = false;

 @Column(name = "email_verification_token")
 private String emailVerificationToken;

 @Column(name = "email_verification_token_expiry")
 private Instant emailVerificationTokenExpiry;

 @Column(name = "role")
 private String role;

 @Column(name = "profile_image_url")
 private String profileImageUrl;

 @Column(name = "last_login_at")
 private Instant lastLoginAt;

 @Column(name = "login_count")
 private Integer loginCount = 0;

 @Column(name = "created_at", nullable = false, updatable = false)
 private Instant createdAt;

 @Column(name = "updated_at", nullable = false)
 private Instant updatedAt;

 @Column(name = "deleted_at")
 private Instant deletedAt;

 @PrePersist
 protected void onCreate() {
 createdAt = Instant.now();
 updatedAt = Instant.now();
 isActive = true;
 emailVerified = false;
 loginCount = 0;
 }

 @PreUpdate
 protected void onUpdate() {
 updatedAt = Instant.now();
 }

 // Getters and Setters
 public UUID getId() {
 return id;
 }

 public void setId(UUID id) {
 this.id = id;
 }

 public String getFirstName() {
 return firstName;
 }

 public void setFirstName(String firstName) {
 this.firstName = firstName;
 }

 public String getLastName() {
 return lastName;
 }

 public void setLastName(String lastName) {
 this.lastName = lastName;
 }

 public String getEmail() {
 return email;
 }

 public void setEmail(String email) {
 this.email = email;
 }

 public String getPasswordHash() {
 return passwordHash;
 }

 public void setPasswordHash(String passwordHash) {
 this.passwordHash = passwordHash;
 }

 public String getPasswordResetToken() {
 return passwordResetToken;
 }

 public void setPasswordResetToken(String passwordResetToken) {
 this.passwordResetToken = passwordResetToken;
 }

 public Instant getPasswordResetTokenExpiry() {
 return passwordResetTokenExpiry;
 }

 public void setPasswordResetTokenExpiry(Instant passwordResetTokenExpiry) {
 this.passwordResetTokenExpiry = passwordResetTokenExpiry;
 }

 public String getPhoneNumber() {
 return phoneNumber;
 }

 public void setPhoneNumber(String phoneNumber) {
 this.phoneNumber = phoneNumber;
 }

 public UUID getCouncilId() {
 return councilId;
 }

 public void setCouncilId(UUID councilId) {
 this.councilId = councilId;
 }

 public Boolean getIsActive() {
 return isActive;
 }

 public void setIsActive(Boolean isActive) {
 this.isActive = isActive;
 }

 public Boolean getEmailVerified() {
 return emailVerified;
 }

 public void setEmailVerified(Boolean emailVerified) {
 this.emailVerified = emailVerified;
 }

 public String getEmailVerificationToken() {
 return emailVerificationToken;
 }

 public void setEmailVerificationToken(String emailVerificationToken) {
 this.emailVerificationToken = emailVerificationToken;
 }

 public Instant getEmailVerificationTokenExpiry() {
 return emailVerificationTokenExpiry;
 }

 public void setEmailVerificationTokenExpiry(Instant emailVerificationTokenExpiry) {
 this.emailVerificationTokenExpiry = emailVerificationTokenExpiry;
 }

 public String getRole() {
 return role;
 }

 public void setRole(String role) {
 this.role = role;
 }

 public String getProfileImageUrl() {
 return profileImageUrl;
 }

 public void setProfileImageUrl(String profileImageUrl) {
 this.profileImageUrl = profileImageUrl;
 }

 public Instant getLastLoginAt() {
 return lastLoginAt;
 }

 public void setLastLoginAt(Instant lastLoginAt) {
 this.lastLoginAt = lastLoginAt;
 }

 public Integer getLoginCount() {
 return loginCount;
 }

 public void setLoginCount(Integer loginCount) {
 this.loginCount = loginCount;
 }

 public Instant getCreatedAt() {
 return createdAt;
 }

 public void setCreatedAt(Instant createdAt) {
 this.createdAt = createdAt;
 }

 public Instant getUpdatedAt() {
 return updatedAt;
 }

 public void setUpdatedAt(Instant updatedAt) {
 this.updatedAt = updatedAt;
 }

 public Instant getDeletedAt() {
 return deletedAt;
 }

 public void setDeletedAt(Instant deletedAt) {
 this.deletedAt = deletedAt;
 }
}
