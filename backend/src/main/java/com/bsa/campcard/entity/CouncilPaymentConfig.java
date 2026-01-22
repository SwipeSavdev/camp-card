package com.bsa.campcard.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity for storing council-specific payment gateway configurations.
 * Credentials are stored encrypted using AES-256-GCM.
 */
@Entity
@Table(name = "council_payment_configs", schema = "campcard")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CouncilPaymentConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private UUID uuid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "council_id", nullable = false)
    private Council council;

    @Enumerated(EnumType.STRING)
    @Column(name = "gateway_type", nullable = false)
    @Builder.Default
    private GatewayType gatewayType = GatewayType.AUTHORIZE_NET;

    @Column(name = "api_login_id_encrypted", nullable = false, length = 512)
    private String apiLoginIdEncrypted;

    @Column(name = "transaction_key_encrypted", nullable = false, length = 512)
    private String transactionKeyEncrypted;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private GatewayEnvironment environment = GatewayEnvironment.SANDBOX;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "is_verified", nullable = false)
    @Builder.Default
    private Boolean isVerified = false;

    @Column(name = "last_verified_at")
    private LocalDateTime lastVerifiedAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private org.bsa.campcard.domain.user.User createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private org.bsa.campcard.domain.user.User updatedBy;

    @PrePersist
    protected void onCreate() {
        if (uuid == null) {
            uuid = UUID.randomUUID();
        }
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
