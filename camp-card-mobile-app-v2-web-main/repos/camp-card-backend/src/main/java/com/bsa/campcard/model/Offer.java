package com.bsa.campcard.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "offers", indexes = {
 @Index(name = "idx_offers_merchant_id", columnList = "merchant_id"),
 @Index(name = "idx_offers_category_id", columnList = "category_id"),
 @Index(name = "idx_offers_valid_from", columnList = "valid_from"),
 @Index(name = "idx_offers_valid_until", columnList = "valid_until"),
 @Index(name = "idx_offers_is_active", columnList = "is_active"),
 @Index(name = "idx_offers_uuid", columnList = "uuid"),
 @Index(name = "idx_offers_created_at", columnList = "created_at")
})
public class Offer {

 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Integer id;

 @Column(unique = true, nullable = false, length = 36)
 private String uuid;

 @Column(name = "merchant_id", nullable = false)
 private java.util.UUID merchantId;

 @Column(name = "category_id", nullable = false)
 private Integer categoryId;

 @Column(nullable = false, length = 255)
 private String title;

 @Column(columnDefinition = "TEXT")
 private String description;

 @Column(name = "discount_description", length = 255)
 private String discountDescription;

 @Column(name = "discount_value", precision = 10, scale = 2)
 private BigDecimal discountValue;

 @Column(name = "usage_type", nullable = false, length = 50)
 private String usageType = "UNLIMITED"; // UNLIMITED or LIMITED

 @Column(name = "is_featured")
 private Boolean isFeatured = false;

 @Column(name = "valid_from", nullable = false)
 private LocalDateTime validFrom;

 @Column(name = "valid_until", nullable = false)
 private LocalDateTime validUntil;

 @Column(name = "is_active")
 private Boolean isActive = true;

 @Column(name = "created_at", nullable = false, updatable = false)
 private LocalDateTime createdAt;

 @Column(name = "updated_at")
 private LocalDateTime updatedAt;

 @Column(name = "created_by")
 private java.util.UUID createdBy;

 @Column(name = "updated_by")
 private java.util.UUID updatedBy;

 // Constructors
 public Offer() {}

 public Offer(String uuid, java.util.UUID merchantId, Integer categoryId, String title,
 String description, LocalDateTime validFrom, LocalDateTime validUntil) {
 this.uuid = uuid;
 this.merchantId = merchantId;
 this.categoryId = categoryId;
 this.title = title;
 this.description = description;
 this.validFrom = validFrom;
 this.validUntil = validUntil;
 }

 @PrePersist
 protected void onCreate() {
 if (createdAt == null) {
 createdAt = LocalDateTime.now();
 }
 if (updatedAt == null) {
 updatedAt = LocalDateTime.now();
 }
 }

 @PreUpdate
 protected void onUpdate() {
 updatedAt = LocalDateTime.now();
 }

 // Getters and Setters

 public Integer getId() {
 return id;
 }

 public void setId(Integer id) {
 this.id = id;
 }

 public String getUuid() {
 return uuid;
 }

 public void setUuid(String uuid) {
 this.uuid = uuid;
 }

 public java.util.UUID getMerchantId() {
 return merchantId;
 }

 public void setMerchantId(java.util.UUID merchantId) {
 this.merchantId = merchantId;
 }

 public Integer getCategoryId() {
 return categoryId;
 }

 public void setCategoryId(Integer categoryId) {
 this.categoryId = categoryId;
 }

 public String getTitle() {
 return title;
 }

 public void setTitle(String title) {
 this.title = title;
 }

 public String getDescription() {
 return description;
 }

 public void setDescription(String description) {
 this.description = description;
 }

 public String getDiscountDescription() {
 return discountDescription;
 }

 public void setDiscountDescription(String discountDescription) {
 this.discountDescription = discountDescription;
 }

 public BigDecimal getDiscountValue() {
 return discountValue;
 }

 public void setDiscountValue(BigDecimal discountValue) {
 this.discountValue = discountValue;
 }

 public String getUsageType() {
 return usageType;
 }

 public void setUsageType(String usageType) {
 this.usageType = usageType;
 }

 public Boolean getIsFeatured() {
 return isFeatured;
 }

 public void setIsFeatured(Boolean isFeatured) {
 this.isFeatured = isFeatured;
 }

 public LocalDateTime getValidFrom() {
 return validFrom;
 }

 public void setValidFrom(LocalDateTime validFrom) {
 this.validFrom = validFrom;
 }

 public LocalDateTime getValidUntil() {
 return validUntil;
 }

 public void setValidUntil(LocalDateTime validUntil) {
 this.validUntil = validUntil;
 }

 public Boolean getIsActive() {
 return isActive;
 }

 public void setIsActive(Boolean isActive) {
 this.isActive = isActive;
 }

 public LocalDateTime getCreatedAt() {
 return createdAt;
 }

 public void setCreatedAt(LocalDateTime createdAt) {
 this.createdAt = createdAt;
 }

 public LocalDateTime getUpdatedAt() {
 return updatedAt;
 }

 public void setUpdatedAt(LocalDateTime updatedAt) {
 this.updatedAt = updatedAt;
 }

 public java.util.UUID getCreatedBy() {
 return createdBy;
 }

 public void setCreatedBy(java.util.UUID createdBy) {
 this.createdBy = createdBy;
 }

 public java.util.UUID getUpdatedBy() {
 return updatedBy;
 }

 public void setUpdatedBy(java.util.UUID updatedBy) {
 this.updatedBy = updatedBy;
 }

 @Override
 public String toString() {
 return "Offer{" +
 "id=" + id +
 ", uuid='" + uuid + '\'' +
 ", merchantId=" + merchantId +
 ", categoryId=" + categoryId +
 ", title='" + title + '\'' +
 ", usageType='" + usageType + '\'' +
 ", validFrom=" + validFrom +
 ", validUntil=" + validUntil +
 ", isActive=" + isActive +
 ", createdAt=" + createdAt +
 '}';
 }
}
