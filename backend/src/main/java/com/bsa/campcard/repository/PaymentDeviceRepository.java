package com.bsa.campcard.repository;

import com.bsa.campcard.entity.PaymentDevice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentDeviceRepository extends JpaRepository<PaymentDevice, Long> {

    Optional<PaymentDevice> findByUuid(UUID uuid);

    Optional<PaymentDevice> findByIdAndDeletedAtIsNull(Long id);

    Optional<PaymentDevice> findByUuidAndDeletedAtIsNull(UUID uuid);

    Optional<PaymentDevice> findBySerialNumber(String serialNumber);

    List<PaymentDevice> findByMerchantIdAndDeletedAtIsNull(Long merchantId);

    List<PaymentDevice> findByMerchantLocationIdAndDeletedAtIsNull(Long locationId);

    Page<PaymentDevice> findByStatusAndDeletedAtIsNull(
        PaymentDevice.DeviceStatus status,
        Pageable pageable
    );

    Page<PaymentDevice> findByDeletedAtIsNull(Pageable pageable);

    @Query("SELECT d FROM PaymentDevice d WHERE " +
           "(LOWER(d.manufacturer) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(d.model) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(d.serialNumber) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(d.deviceName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) AND " +
           "d.deletedAt IS NULL")
    Page<PaymentDevice> searchDevices(@Param("searchTerm") String searchTerm, Pageable pageable);

    @Query("SELECT d FROM PaymentDevice d WHERE " +
           "d.manufacturer = :manufacturer AND " +
           "d.deletedAt IS NULL")
    List<PaymentDevice> findByManufacturer(@Param("manufacturer") String manufacturer);

    @Query("SELECT d FROM PaymentDevice d WHERE " +
           "d.manufacturer = :manufacturer AND " +
           "d.model = :model AND " +
           "d.deletedAt IS NULL")
    List<PaymentDevice> findByManufacturerAndModel(
        @Param("manufacturer") String manufacturer,
        @Param("model") String model
    );

    Long countByStatusAndDeletedAtIsNull(PaymentDevice.DeviceStatus status);

    Long countByMerchantIdAndDeletedAtIsNull(Long merchantId);

    @Query("SELECT d.status, COUNT(d) FROM PaymentDevice d WHERE d.deletedAt IS NULL GROUP BY d.status")
    List<Object[]> countByStatus();

    @Query("SELECT d.manufacturer, COUNT(d) FROM PaymentDevice d WHERE d.deletedAt IS NULL GROUP BY d.manufacturer")
    List<Object[]> countByManufacturer();

    boolean existsBySerialNumber(String serialNumber);
}
