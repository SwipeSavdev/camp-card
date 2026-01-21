package com.bsa.campcard.repository;

import com.bsa.campcard.entity.CardOrder;
import com.bsa.campcard.entity.CardOrder.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CardOrderRepository extends JpaRepository<CardOrder, Long> {

    // Find by identifiers
    Optional<CardOrder> findByUuid(UUID uuid);
    Optional<CardOrder> findByTransactionId(String transactionId);

    // Find by user
    List<CardOrder> findByUserId(UUID userId);
    Page<CardOrder> findByUserId(UUID userId, Pageable pageable);
    List<CardOrder> findByUserIdAndPaymentStatus(UUID userId, PaymentStatus status);

    // Find by scout
    List<CardOrder> findByScoutId(UUID scoutId);
    List<CardOrder> findByScoutCode(String scoutCode);

    // Find by status
    Page<CardOrder> findByPaymentStatus(PaymentStatus status, Pageable pageable);
    List<CardOrder> findByPaymentStatusIn(List<PaymentStatus> statuses);

    // Orders in date range
    @Query("SELECT o FROM CardOrder o WHERE o.createdAt BETWEEN :startDate AND :endDate " +
           "ORDER BY o.createdAt DESC")
    List<CardOrder> findOrdersBetweenDates(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    // Paid orders in date range (for revenue reporting)
    @Query("SELECT o FROM CardOrder o WHERE o.paymentStatus = 'PAID' " +
           "AND o.createdAt BETWEEN :startDate AND :endDate ORDER BY o.createdAt DESC")
    List<CardOrder> findPaidOrdersBetweenDates(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    // Statistics queries
    @Query("SELECT COALESCE(SUM(o.quantity), 0) FROM CardOrder o " +
           "WHERE o.paymentStatus = 'PAID'")
    Long getTotalCardsSold();

    @Query("SELECT COALESCE(SUM(o.totalPriceCents), 0) FROM CardOrder o " +
           "WHERE o.paymentStatus = 'PAID'")
    Long getTotalRevenueCents();

    @Query("SELECT COALESCE(SUM(o.quantity), 0) FROM CardOrder o " +
           "WHERE o.scoutId = :scoutId AND o.paymentStatus = 'PAID'")
    Long getTotalCardsSoldByScout(@Param("scoutId") UUID scoutId);

    @Query("SELECT COALESCE(SUM(o.totalPriceCents), 0) FROM CardOrder o " +
           "WHERE o.scoutId = :scoutId AND o.paymentStatus = 'PAID'")
    Long getTotalRevenueByScoutCents(@Param("scoutId") UUID scoutId);

    @Query("SELECT COUNT(o) FROM CardOrder o WHERE o.userId = :userId AND o.paymentStatus = 'PAID'")
    Long countPaidOrdersByUser(@Param("userId") UUID userId);

    // Pending orders older than timeout (for cleanup)
    @Query("SELECT o FROM CardOrder o WHERE o.paymentStatus = 'PENDING' " +
           "AND o.createdAt < :cutoffDate")
    List<CardOrder> findStaleOrders(@Param("cutoffDate") LocalDateTime cutoffDate);

    // Admin queries
    @Query("SELECT o FROM CardOrder o ORDER BY o.createdAt DESC")
    Page<CardOrder> findAllOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT o FROM CardOrder o WHERE o.paymentStatus = :status ORDER BY o.createdAt DESC")
    Page<CardOrder> findAllByStatusOrderByCreatedAtDesc(
        @Param("status") PaymentStatus status,
        Pageable pageable
    );

    // Revenue by date for reporting
    @Query("SELECT DATE(o.createdAt), COALESCE(SUM(o.totalPriceCents), 0), COALESCE(SUM(o.quantity), 0) " +
           "FROM CardOrder o WHERE o.paymentStatus = 'PAID' " +
           "AND o.createdAt BETWEEN :startDate AND :endDate " +
           "GROUP BY DATE(o.createdAt) ORDER BY DATE(o.createdAt)")
    List<Object[]> getDailyRevenueBetweenDates(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
}
