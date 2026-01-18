package com.bsa.campcard.integration;

import org.bsa.campcard.domain.user.User;
import org.bsa.campcard.domain.user.User.UserRole;
import org.bsa.campcard.domain.user.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Integration tests for UserRepository.
 *
 * Tests database operations with real PostgreSQL via Testcontainers.
 */
@DisplayName("User Repository Integration Tests")
class UserRepositoryIT extends AbstractIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    /**
     * Helper method to create a valid user with required fields.
     */
    private User createUser() {
        return TestDataBuilder.createUser();
    }

    /**
     * Helper method to create a user with a specific role.
     */
    private User createUser(UserRole role) {
        return TestDataBuilder.createUser(role);
    }

    @Nested
    @DisplayName("CRUD Operations")
    class CrudTests {

        @Test
        @DisplayName("Should save and retrieve a user by ID")
        void shouldSaveAndRetrieveUserById() {
            // Given
            User user = createUser();

            // When
            User saved = userRepository.save(user);
            flushAndClear();
            Optional<User> found = userRepository.findById(saved.getId());

            // Then
            assertThat(found).isPresent();
            assertThat(found.get().getEmail()).isEqualTo(user.getEmail());
            assertThat(found.get().getFirstName()).isEqualTo(user.getFirstName());
        }

        @Test
        @DisplayName("Should generate UUID on persist")
        void shouldGenerateUuidOnPersist() {
            // Given
            User user = createUser();
            assertThat(user.getId()).isNull();

            // When
            User saved = userRepository.save(user);
            flushAndClear();

            // Then
            assertThat(saved.getId()).isNotNull();
        }

        @Test
        @DisplayName("Should update user fields")
        void shouldUpdateUserFields() {
            // Given
            User user = createUser();
            User saved = userRepository.save(user);
            flushAndClear();

            // When
            saved.setFirstName("UpdatedFirst");
            saved.setLastName("UpdatedLast");
            saved.setPhoneNumber("555-9999");
            userRepository.save(saved);
            flushAndClear();

            Optional<User> updated = userRepository.findById(saved.getId());

            // Then
            assertThat(updated).isPresent();
            assertThat(updated.get().getFirstName()).isEqualTo("UpdatedFirst");
            assertThat(updated.get().getLastName()).isEqualTo("UpdatedLast");
            assertThat(updated.get().getPhoneNumber()).isEqualTo("555-9999");
        }

        @Test
        @DisplayName("Should delete user by ID")
        void shouldDeleteUserById() {
            // Given
            User user = createUser();
            User saved = userRepository.save(user);
            UUID savedId = saved.getId();
            flushAndClear();

            // When
            userRepository.deleteById(savedId);
            flushAndClear();

            // Then
            assertThat(userRepository.findById(savedId)).isEmpty();
        }

        @Test
        @DisplayName("Should set timestamps on persist")
        void shouldSetTimestampsOnPersist() {
            // Given
            User user = createUser();
            LocalDateTime beforeSave = LocalDateTime.now().minusSeconds(1);

            // When
            User saved = userRepository.save(user);
            flushAndClear();

            // Then
            assertThat(saved.getCreatedAt()).isAfter(beforeSave);
            assertThat(saved.getUpdatedAt()).isAfter(beforeSave);
        }
    }

    @Nested
    @DisplayName("Find By Email Operations")
    class FindByEmailTests {

        @Test
        @DisplayName("Should find user by email")
        void shouldFindUserByEmail() {
            // Given
            User user = createUser();
            User saved = userRepository.save(user);
            flushAndClear();

            // When
            Optional<User> found = userRepository.findByEmail(saved.getEmail());

            // Then
            assertThat(found).isPresent();
            assertThat(found.get().getId()).isEqualTo(saved.getId());
        }

        @Test
        @DisplayName("Should find active user by email")
        void shouldFindActiveUserByEmail() {
            // Given
            User activeUser = createUser();
            activeUser.setIsActive(true);

            User inactiveUser = createUser();
            inactiveUser.setIsActive(false);

            userRepository.saveAll(List.of(activeUser, inactiveUser));
            flushAndClear();

            // When
            Optional<User> foundActive = userRepository.findByEmailAndIsActiveTrue(activeUser.getEmail());
            Optional<User> foundInactive = userRepository.findByEmailAndIsActiveTrue(inactiveUser.getEmail());

            // Then
            assertThat(foundActive).isPresent();
            assertThat(foundInactive).isEmpty();
        }

        @Test
        @DisplayName("Should return empty optional for non-existent email")
        void shouldReturnEmptyForNonExistentEmail() {
            // When
            Optional<User> found = userRepository.findByEmail("nonexistent@test.com");

            // Then
            assertThat(found).isEmpty();
        }

        @Test
        @DisplayName("Should check if email exists")
        void shouldCheckIfEmailExists() {
            // Given
            User user = createUser();
            userRepository.save(user);
            flushAndClear();

            // When/Then
            assertThat(userRepository.existsByEmail(user.getEmail())).isTrue();
            assertThat(userRepository.existsByEmail("nonexistent@test.com")).isFalse();
        }

        @Test
        @DisplayName("Should check if email exists case-insensitively")
        void shouldCheckIfEmailExistsCaseInsensitively() {
            // Given
            User user = createUser();
            String originalEmail = user.getEmail();
            userRepository.save(user);
            flushAndClear();

            // When/Then
            assertThat(userRepository.existsByEmailIgnoreCase(originalEmail.toUpperCase())).isTrue();
            assertThat(userRepository.existsByEmailIgnoreCase(originalEmail.toLowerCase())).isTrue();
        }
    }

    @Nested
    @DisplayName("Search Users Operations")
    class SearchUsersTests {

        @Test
        @DisplayName("Should search users by first name")
        void shouldSearchUsersByFirstName() {
            // Given
            User user = createUser();
            user.setFirstName("UniqueSearchName");
            userRepository.save(user);
            flushAndClear();

            // When
            Page<User> results = userRepository.searchUsers("UniqueSearch", PageRequest.of(0, 10));

            // Then
            assertThat(results.getContent())
                    .isNotEmpty()
                    .anyMatch(u -> u.getFirstName().contains("UniqueSearch"));
        }

        @Test
        @DisplayName("Should search users by last name")
        void shouldSearchUsersByLastName() {
            // Given
            User user = createUser();
            user.setLastName("UniqueLastName");
            userRepository.save(user);
            flushAndClear();

            // When
            Page<User> results = userRepository.searchUsers("UniqueLast", PageRequest.of(0, 10));

            // Then
            assertThat(results.getContent())
                    .isNotEmpty()
                    .anyMatch(u -> u.getLastName().contains("UniqueLast"));
        }

        @Test
        @DisplayName("Should search users by email")
        void shouldSearchUsersByEmail() {
            // Given
            User user = createUser();
            user.setEmail("searchable-unique@test.com");
            userRepository.save(user);
            flushAndClear();

            // When
            Page<User> results = userRepository.searchUsers("searchable-unique", PageRequest.of(0, 10));

            // Then
            assertThat(results.getContent())
                    .isNotEmpty()
                    .anyMatch(u -> u.getEmail().contains("searchable-unique"));
        }

        @Test
        @DisplayName("Should perform case-insensitive search")
        void shouldPerformCaseInsensitiveSearch() {
            // Given
            User user = createUser();
            user.setFirstName("CamelCaseName");
            userRepository.save(user);
            flushAndClear();

            // When
            Page<User> results = userRepository.searchUsers("camelcasename", PageRequest.of(0, 10));

            // Then
            assertThat(results.getContent())
                    .isNotEmpty()
                    .anyMatch(u -> u.getFirstName().equals("CamelCaseName"));
        }

        @Test
        @DisplayName("Should exclude soft-deleted users from search")
        void shouldExcludeSoftDeletedUsersFromSearch() {
            // Given
            User activeUser = createUser();
            activeUser.setFirstName("ActiveSearchable");

            User deletedUser = createUser();
            deletedUser.setFirstName("DeletedSearchable");
            deletedUser.setDeletedAt(LocalDateTime.now());

            userRepository.saveAll(List.of(activeUser, deletedUser));
            flushAndClear();

            // When
            Page<User> results = userRepository.searchUsers("Searchable", PageRequest.of(0, 10));

            // Then
            assertThat(results.getContent()).allMatch(u -> u.getDeletedAt() == null);
        }
    }

    @Nested
    @DisplayName("Find By Council ID Operations")
    class FindByCouncilIdTests {

        @Test
        @DisplayName("Should find users by council ID with pagination")
        void shouldFindUsersByCouncilIdWithPagination() {
            // Given
            UUID councilId = UUID.randomUUID();
            for (int i = 0; i < 5; i++) {
                User user = createUser();
                user.setCouncilId(councilId);
                userRepository.save(user);
            }
            flushAndClear();

            // When
            Page<User> page = userRepository.findByCouncilId(councilId, PageRequest.of(0, 3));

            // Then
            assertThat(page.getContent()).hasSizeLessThanOrEqualTo(3);
            assertThat(page.getContent()).allMatch(u -> u.getCouncilId().equals(councilId));
        }

        @Test
        @DisplayName("Should return empty page for non-existent council")
        void shouldReturnEmptyPageForNonExistentCouncil() {
            // When
            Page<User> page = userRepository.findByCouncilId(UUID.randomUUID(), PageRequest.of(0, 10));

            // Then
            assertThat(page.getContent()).isEmpty();
        }

        @Test
        @DisplayName("Should find active users by council and role")
        void shouldFindActiveUsersByCouncilAndRole() {
            // Given
            UUID councilId = UUID.randomUUID();

            User activeScout = createUser(UserRole.SCOUT);
            activeScout.setCouncilId(councilId);
            activeScout.setIsActive(true);

            User inactiveScout = createUser(UserRole.SCOUT);
            inactiveScout.setCouncilId(councilId);
            inactiveScout.setIsActive(false);

            userRepository.saveAll(List.of(activeScout, inactiveScout));
            flushAndClear();

            // When
            Page<User> results = userRepository.findActiveUsersByCouncilAndRole(
                    councilId,
                    UserRole.SCOUT,
                    PageRequest.of(0, 10)
            );

            // Then
            assertThat(results.getContent())
                    .isNotEmpty()
                    .allMatch(u -> u.getIsActive())
                    .allMatch(u -> u.getRole() == UserRole.SCOUT);
        }

        @Test
        @DisplayName("Should count active users by council")
        void shouldCountActiveUsersByCouncil() {
            // Given
            UUID councilId = UUID.randomUUID();

            User activeUser1 = createUser();
            activeUser1.setCouncilId(councilId);
            activeUser1.setIsActive(true);

            User activeUser2 = createUser();
            activeUser2.setCouncilId(councilId);
            activeUser2.setIsActive(true);

            User inactiveUser = createUser();
            inactiveUser.setCouncilId(councilId);
            inactiveUser.setIsActive(false);

            userRepository.saveAll(List.of(activeUser1, activeUser2, inactiveUser));
            flushAndClear();

            // When
            long count = userRepository.countActiveUsersByCouncil(councilId);

            // Then
            assertThat(count).isEqualTo(2);
        }
    }

    @Nested
    @DisplayName("Find By Troop ID Operations")
    class FindByTroopIdTests {

        @Test
        @DisplayName("Should find users by troop ID with pagination")
        void shouldFindUsersByTroopIdWithPagination() {
            // Given
            UUID troopId = UUID.randomUUID();
            for (int i = 0; i < 5; i++) {
                User user = createUser(UserRole.SCOUT);
                user.setTroopId(troopId);
                userRepository.save(user);
            }
            flushAndClear();

            // When
            Page<User> page = userRepository.findByTroopId(troopId, PageRequest.of(0, 3));

            // Then
            assertThat(page.getContent()).hasSizeLessThanOrEqualTo(3);
            assertThat(page.getContent()).allMatch(u -> u.getTroopId().equals(troopId));
        }

        @Test
        @DisplayName("Should find users by troop ID and role")
        void shouldFindUsersByTroopIdAndRole() {
            // Given
            UUID troopId = UUID.randomUUID();

            User scout = createUser(UserRole.SCOUT);
            scout.setTroopId(troopId);

            User parent = createUser(UserRole.PARENT);
            parent.setTroopId(troopId);

            userRepository.saveAll(List.of(scout, parent));
            flushAndClear();

            // When
            Page<User> scouts = userRepository.findByTroopIdAndRole(
                    troopId,
                    UserRole.SCOUT,
                    PageRequest.of(0, 10)
            );

            // Then
            assertThat(scouts.getContent())
                    .isNotEmpty()
                    .allMatch(u -> u.getRole() == UserRole.SCOUT);
        }
    }

    @Nested
    @DisplayName("Find By Role Operations")
    class FindByRoleTests {

        @Test
        @DisplayName("Should find users by role with pagination")
        void shouldFindUsersByRoleWithPagination() {
            // Given
            User admin = createUser(UserRole.NATIONAL_ADMIN);
            User councilAdmin = createUser(UserRole.COUNCIL_ADMIN);
            User scout = createUser(UserRole.SCOUT);

            userRepository.saveAll(List.of(admin, councilAdmin, scout));
            flushAndClear();

            // When
            Page<User> admins = userRepository.findByRole(UserRole.NATIONAL_ADMIN, PageRequest.of(0, 10));

            // Then
            assertThat(admins.getContent())
                    .isNotEmpty()
                    .allMatch(u -> u.getRole() == UserRole.NATIONAL_ADMIN);
        }
    }

    @Nested
    @DisplayName("Token Operations")
    class TokenOperationsTests {

        @Test
        @DisplayName("Should find user by email verification token")
        void shouldFindUserByEmailVerificationToken() {
            // Given
            User user = createUser();
            String token = UUID.randomUUID().toString();
            user.setEmailVerificationToken(token);
            userRepository.save(user);
            flushAndClear();

            // When
            Optional<User> found = userRepository.findByEmailVerificationToken(token);

            // Then
            assertThat(found).isPresent();
            assertThat(found.get().getEmailVerificationToken()).isEqualTo(token);
        }

        @Test
        @DisplayName("Should find user by password reset token")
        void shouldFindUserByPasswordResetToken() {
            // Given
            User user = createUser();
            String token = UUID.randomUUID().toString();
            user.setPasswordResetToken(token);
            userRepository.save(user);
            flushAndClear();

            // When
            Optional<User> found = userRepository.findByPasswordResetToken(token);

            // Then
            assertThat(found).isPresent();
            assertThat(found.get().getPasswordResetToken()).isEqualTo(token);
        }
    }

    @Nested
    @DisplayName("Referral Code Operations")
    class ReferralCodeOperationsTests {

        @Test
        @DisplayName("Should find user by referral code")
        void shouldFindUserByReferralCode() {
            // Given
            User user = createUser();
            String referralCode = "REF" + TestDataBuilder.uniqueSuffix();
            user.setReferralCode(referralCode);
            userRepository.save(user);
            flushAndClear();

            // When
            Optional<User> found = userRepository.findByReferralCode(referralCode);

            // Then
            assertThat(found).isPresent();
            assertThat(found.get().getReferralCode()).isEqualTo(referralCode);
        }

        @Test
        @DisplayName("Should check if referral code exists")
        void shouldCheckIfReferralCodeExists() {
            // Given
            User user = createUser();
            String referralCode = "REF" + TestDataBuilder.uniqueSuffix();
            user.setReferralCode(referralCode);
            userRepository.save(user);
            flushAndClear();

            // When/Then
            assertThat(userRepository.existsByReferralCode(referralCode)).isTrue();
            assertThat(userRepository.existsByReferralCode("NONEXISTENT")).isFalse();
        }
    }

    @Nested
    @DisplayName("Unassigned Scouts Operations")
    class UnassignedScoutsTests {

        @Test
        @DisplayName("Should find unassigned scouts")
        void shouldFindUnassignedScouts() {
            // Given
            User assignedScout = createUser(UserRole.SCOUT);
            assignedScout.setTroopId(UUID.randomUUID());
            assignedScout.setIsActive(true);

            User unassignedScout = createUser(UserRole.SCOUT);
            unassignedScout.setTroopId(null);
            unassignedScout.setIsActive(true);

            userRepository.saveAll(List.of(assignedScout, unassignedScout));
            flushAndClear();

            // When
            Page<User> unassigned = userRepository.findUnassignedScouts(PageRequest.of(0, 10));

            // Then
            assertThat(unassigned.getContent())
                    .isNotEmpty()
                    .allMatch(u -> u.getTroopId() == null)
                    .allMatch(u -> u.getRole() == UserRole.SCOUT)
                    .allMatch(u -> u.getIsActive());
        }

        @Test
        @DisplayName("Should find unassigned scouts by council")
        void shouldFindUnassignedScoutsByCouncil() {
            // Given
            UUID councilId = UUID.randomUUID();

            User unassignedScout = createUser(UserRole.SCOUT);
            unassignedScout.setCouncilId(councilId);
            unassignedScout.setTroopId(null);
            unassignedScout.setIsActive(true);

            User assignedScout = createUser(UserRole.SCOUT);
            assignedScout.setCouncilId(councilId);
            assignedScout.setTroopId(UUID.randomUUID());
            assignedScout.setIsActive(true);

            userRepository.saveAll(List.of(unassignedScout, assignedScout));
            flushAndClear();

            // When
            Page<User> unassigned = userRepository.findUnassignedScoutsByCouncil(councilId, PageRequest.of(0, 10));

            // Then
            assertThat(unassigned.getContent())
                    .isNotEmpty()
                    .allMatch(u -> u.getTroopId() == null)
                    .allMatch(u -> u.getCouncilId().equals(councilId));
        }
    }

    @Nested
    @DisplayName("Pagination and Sorting")
    class PaginationAndSortingTests {

        @Test
        @DisplayName("Should paginate results correctly")
        void shouldPaginateResultsCorrectly() {
            // Given - Create 10 users
            UUID councilId = UUID.randomUUID();
            for (int i = 0; i < 10; i++) {
                User user = createUser();
                user.setCouncilId(councilId);
                userRepository.save(user);
            }
            flushAndClear();

            // When
            Page<User> firstPage = userRepository.findByCouncilId(councilId, PageRequest.of(0, 3));
            Page<User> secondPage = userRepository.findByCouncilId(councilId, PageRequest.of(1, 3));

            // Then
            assertThat(firstPage.getContent()).hasSize(3);
            assertThat(secondPage.getContent()).hasSize(3);
            assertThat(firstPage.getNumber()).isEqualTo(0);
            assertThat(secondPage.getNumber()).isEqualTo(1);
        }

        @Test
        @DisplayName("Should sort results by email")
        void shouldSortResultsByEmail() {
            // Given
            UUID councilId = UUID.randomUUID();

            User userA = createUser();
            userA.setEmail("aaa-" + TestDataBuilder.uniqueSuffix() + "@test.com");
            userA.setCouncilId(councilId);

            User userZ = createUser();
            userZ.setEmail("zzz-" + TestDataBuilder.uniqueSuffix() + "@test.com");
            userZ.setCouncilId(councilId);

            userRepository.saveAll(List.of(userZ, userA));
            flushAndClear();

            // When
            Page<User> sortedAsc = userRepository.findByCouncilId(
                    councilId,
                    PageRequest.of(0, 10, Sort.by("email").ascending())
            );

            // Then
            List<String> emails = sortedAsc.getContent().stream()
                    .map(User::getEmail)
                    .toList();
            assertThat(emails).isSorted();
        }
    }

    @Nested
    @DisplayName("Edge Cases")
    class EdgeCaseTests {

        @Test
        @DisplayName("Should return empty optional for non-existent ID")
        void shouldReturnEmptyForNonExistentId() {
            // When
            Optional<User> found = userRepository.findById(UUID.randomUUID());

            // Then
            assertThat(found).isEmpty();
        }

        @Test
        @DisplayName("Should handle user with null optional fields")
        void shouldHandleUserWithNullOptionalFields() {
            // Given
            User user = createUser();
            user.setCouncilId(null);
            user.setTroopId(null);
            user.setReferralCode(null);
            user.setCardNumber(null);

            // When
            User saved = userRepository.save(user);
            flushAndClear();
            Optional<User> found = userRepository.findById(saved.getId());

            // Then
            assertThat(found).isPresent();
            assertThat(found.get().getCouncilId()).isNull();
            assertThat(found.get().getTroopId()).isNull();
        }

        @Test
        @DisplayName("Should handle empty search term")
        void shouldHandleEmptySearchTerm() {
            // Given
            User user = createUser();
            userRepository.save(user);
            flushAndClear();

            // When
            Page<User> results = userRepository.searchUsers("", PageRequest.of(0, 10));

            // Then
            assertThat(results.getContent()).isNotEmpty();
        }
    }

    @Nested
    @DisplayName("Constraint Validation")
    class ConstraintTests {

        @Test
        @DisplayName("Should enforce unique email constraint")
        void shouldEnforceUniqueEmailConstraint() {
            // Given
            User user1 = createUser();
            String email = "unique-" + TestDataBuilder.uniqueSuffix() + "@test.com";
            user1.setEmail(email);
            userRepository.save(user1);
            flushAndClear();

            User user2 = createUser();
            user2.setEmail(email); // Same email

            // When/Then
            assertThatThrownBy(() -> {
                userRepository.save(user2);
                flushAndClear();
            }).isInstanceOf(DataIntegrityViolationException.class);
        }

        @Test
        @DisplayName("Should require email")
        void shouldRequireEmail() {
            // Given
            User user = createUser();
            user.setEmail(null);

            // When/Then
            assertThatThrownBy(() -> {
                userRepository.save(user);
                flushAndClear();
            }).isInstanceOf(DataIntegrityViolationException.class);
        }

        @Test
        @DisplayName("Should require password hash")
        void shouldRequirePasswordHash() {
            // Given
            User user = createUser();
            user.setPasswordHash(null);

            // When/Then
            assertThatThrownBy(() -> {
                userRepository.save(user);
                flushAndClear();
            }).isInstanceOf(DataIntegrityViolationException.class);
        }

        @Test
        @DisplayName("Should require first name")
        void shouldRequireFirstName() {
            // Given
            User user = createUser();
            user.setFirstName(null);

            // When/Then
            assertThatThrownBy(() -> {
                userRepository.save(user);
                flushAndClear();
            }).isInstanceOf(DataIntegrityViolationException.class);
        }

        @Test
        @DisplayName("Should require last name")
        void shouldRequireLastName() {
            // Given
            User user = createUser();
            user.setLastName(null);

            // When/Then
            assertThatThrownBy(() -> {
                userRepository.save(user);
                flushAndClear();
            }).isInstanceOf(DataIntegrityViolationException.class);
        }

        @Test
        @DisplayName("Should require role")
        void shouldRequireRole() {
            // Given
            User user = createUser();
            user.setRole(null);

            // When/Then
            assertThatThrownBy(() -> {
                userRepository.save(user);
                flushAndClear();
            }).isInstanceOf(DataIntegrityViolationException.class);
        }

        @Test
        @DisplayName("Should enforce unique referral code constraint")
        void shouldEnforceUniqueReferralCodeConstraint() {
            // Given
            String referralCode = "REF" + TestDataBuilder.uniqueSuffix();

            User user1 = createUser();
            user1.setReferralCode(referralCode);
            userRepository.save(user1);
            flushAndClear();

            User user2 = createUser();
            user2.setReferralCode(referralCode); // Same referral code

            // When/Then
            assertThatThrownBy(() -> {
                userRepository.save(user2);
                flushAndClear();
            }).isInstanceOf(DataIntegrityViolationException.class);
        }
    }
}
