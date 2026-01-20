package com.bsa.campcard.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity for storing offer images as base64 data.
 * This is a workaround for the offers.image_url VARCHAR(255) limitation.
 */
@Entity
@Table(name = "offer_images", schema = "campcard")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OfferImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "offer_id", nullable = false)
    private Long offerId;

    @Column(name = "image_data", columnDefinition = "TEXT", nullable = false)
    private String imageData;

    @Builder.Default
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
