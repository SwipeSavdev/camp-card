package com.bsa.campcard.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Represents a multi-card purchase transaction.
 * Tracks the purchase of 1-10 cards in a single order.
 */
@Entity
@Table(name = "card_orders")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CardOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    @Builder.Default
    private UUID uuid = UUID.randomUUID();

    // Purchaser (NULL if purchased before account creation)
    @Column(name = "user_id", columnDefinition = "UUID")
    private UUID userId;

    // Order details
    @Column(nullable = false)
    private Integer quantity;  // 1-10 cards

    @Column(name = "unit_price_cents", nullable = false)
    private Integer unitPriceCents;

    @Column(name = "total_price_cents", nullable = false)
    private Integer totalPriceCents;

    // Payment info
    @Column(name = "transaction_id", length = 100)
    private String transactionId;

    @Column(name = "payment_status", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    // Scout attribution
    @Column(name = "scout_code", length = 50)
    private String scoutCode;

    @Column(name = "scout_id", columnDefinition = "UUID")
    private UUID scoutId;

    // Timestamps
    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        if (uuid == null) {
            uuid = UUID.randomUUID();
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * Payment status enum matching database constraint
     */
    public enum PaymentStatus {
        PENDING,    // Payment not yet completed
        PAID,       // Payment successful
        FAILED,     // Payment failed
        REFUNDED    // Payment refunded
    }

    // Helper methods

    /**
     * Mark the order as paid
     */
    public void markAsPaid(String transactionId) {
        this.paymentStatus = PaymentStatus.PAID;
        this.transactionId = transactionId;
    }

    /**
     * Mark the order as failed
     */
    public void markAsFailed() {
        this.paymentStatus = PaymentStatus.FAILED;
    }

    /**
     * Mark the order as refunded
     */
    public void markAsRefunded() {
        this.paymentStatus = PaymentStatus.REFUNDED;
    }

    /**
     * Check if this order has been paid
     */
    public boolean isPaid() {
        return this.paymentStatus == PaymentStatus.PAID;
    }

    /**
     * Calculate the total price based on quantity and unit price
     */
    public void calculateTotalPrice() {
        if (this.quantity != null && this.unitPriceCents != null) {
            this.totalPriceCents = this.quantity * this.unitPriceCents;
        }
    }
}
