package com.bsa.campcard.repository;

import com.bsa.campcard.entity.MobileModuleConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MobileModuleConfigRepository extends JpaRepository<MobileModuleConfig, Long> {

    Optional<MobileModuleConfig> findByModuleId(String moduleId);

    List<MobileModuleConfig> findByCategory(String category);

    List<MobileModuleConfig> findByEnabled(Boolean enabled);

    List<MobileModuleConfig> findAllByOrderByCategoryAscNameAsc();
}
