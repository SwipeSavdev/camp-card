package com.bsa.campcard.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.bsa.campcard.model.User;
import java.util.UUID;
import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
 Optional<User> findByEmail(String email);
 List<User> findByIsActive(Boolean isActive);
 List<User> findByCouncilId(UUID councilId);
 List<User> findByRole(String role);
}
