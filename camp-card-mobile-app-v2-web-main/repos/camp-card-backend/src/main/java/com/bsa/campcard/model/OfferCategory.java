package com.bsa.campcard.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "offer_categories")
public class OfferCategory {

 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Integer id;

 @Column(unique = true, nullable = false, length = 50)
 private String name;

 @Column(columnDefinition = "TEXT")
 private String description;

 @Column(name = "icon_url", length = 500)
 private String iconUrl;

 @Column(name = "color_code", length = 7)
 private String colorCode;

 @Column(name = "created_at", nullable = false, updatable = false)
 private LocalDateTime createdAt;

 // Constructors
 public OfferCategory() {}

 public OfferCategory(String name, String description, String iconUrl, String colorCode) {
 this.name = name;
 this.description = description;
 this.iconUrl = iconUrl;
 this.colorCode = colorCode;
 }

 @PrePersist
 protected void onCreate() {
 if (createdAt == null) {
 createdAt = LocalDateTime.now();
 }
 }

 // Getters and Setters

 public Integer getId() {
 return id;
 }

 public void setId(Integer id) {
 this.id = id;
 }

 public String getName() {
 return name;
 }

 public void setName(String name) {
 this.name = name;
 }

 public String getDescription() {
 return description;
 }

 public void setDescription(String description) {
 this.description = description;
 }

 public String getIconUrl() {
 return iconUrl;
 }

 public void setIconUrl(String iconUrl) {
 this.iconUrl = iconUrl;
 }

 public String getColorCode() {
 return colorCode;
 }

 public void setColorCode(String colorCode) {
 this.colorCode = colorCode;
 }

 public LocalDateTime getCreatedAt() {
 return createdAt;
 }

 public void setCreatedAt(LocalDateTime createdAt) {
 this.createdAt = createdAt;
 }

 @Override
 public String toString() {
 return "OfferCategory{" +
 "id=" + id +
 ", name='" + name + '\'' +
 ", description='" + description + '\'' +
 ", iconUrl='" + iconUrl + '\'' +
 ", colorCode='" + colorCode + '\'' +
 ", createdAt=" + createdAt +
 '}';
 }
}
