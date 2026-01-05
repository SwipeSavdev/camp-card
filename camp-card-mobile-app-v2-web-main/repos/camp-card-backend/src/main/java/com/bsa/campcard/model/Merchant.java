package com.bsa.campcard.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "merchants")
public class Merchant {
 @Id
 @GeneratedValue(strategy = GenerationType.UUID)
 private UUID id;

 @Column(name = "business_name", nullable = false)
 private String businessName;

 @Column(name = "category", nullable = false)
 private String category;

 @Column(name = "description")
 private String description;

 @Column(name = "website_url")
 private String websiteUrl;

 @Column(name = "phone_number")
 private String phoneNumber;

 @Column(name = "email")
 private String email;

 @Column(name = "logo_url")
 private String logoUrl;

 @Column(name = "banner_url")
 private String bannerUrl;

 @Column(name = "is_active", nullable = false)
 private Boolean isActive = true;

 @Column(name = "verified", nullable = false)
 private Boolean verified = false;

 @Column(name = "created_at", nullable = false, updatable = false)
 private Instant createdAt;

 @Column(name = "updated_at", nullable = false)
 private Instant updatedAt;

 @Column(name = "created_by")
 private UUID createdBy;

 @Column(name = "updated_by")
 private UUID updatedBy;

 @PrePersist
 protected void onCreate() {
 createdAt = Instant.now();
 updatedAt = Instant.now();
 isActive = true;
 verified = false;
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

 public String getBusinessName() {
 return businessName;
 }

 public void setBusinessName(String businessName) {
 this.businessName = businessName;
 }

 public String getCategory() {
 return category;
 }

 public void setCategory(String category) {
 this.category = category;
 }

 public String getDescription() {
 return description;
 }

 public void setDescription(String description) {
 this.description = description;
 }

 public String getWebsiteUrl() {
 return websiteUrl;
 }

 public void setWebsiteUrl(String websiteUrl) {
 this.websiteUrl = websiteUrl;
 }

 public String getPhoneNumber() {
 return phoneNumber;
 }

 public void setPhoneNumber(String phoneNumber) {
 this.phoneNumber = phoneNumber;
 }

 public String getEmail() {
 return email;
 }

 public void setEmail(String email) {
 this.email = email;
 }

 public String getLogoUrl() {
 return logoUrl;
 }

 public void setLogoUrl(String logoUrl) {
 this.logoUrl = logoUrl;
 }

 public String getBannerUrl() {
 return bannerUrl;
 }

 public void setBannerUrl(String bannerUrl) {
 this.bannerUrl = bannerUrl;
 }

 public Boolean getIsActive() {
 return isActive;
 }

 public void setIsActive(Boolean isActive) {
 this.isActive = isActive;
 }

 public Boolean getVerified() {
 return verified;
 }

 public void setVerified(Boolean verified) {
 this.verified = verified;
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

 public UUID getCreatedBy() {
 return createdBy;
 }

 public void setCreatedBy(UUID createdBy) {
 this.createdBy = createdBy;
 }

 public UUID getUpdatedBy() {
 return updatedBy;
 }

 public void setUpdatedBy(UUID updatedBy) {
 this.updatedBy = updatedBy;
 }
}
