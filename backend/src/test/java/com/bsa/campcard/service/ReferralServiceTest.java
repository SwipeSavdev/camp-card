package com.bsa.campcard.service;

import com.bsa.campcard.dto.referral.ReferralCodeResponse;
import com.bsa.campcard.dto.referral.ReferralResponse;
import com.bsa.campcard.entity.Referral;
import com.bsa.campcard.exception.ResourceNotFoundException;
import com.bsa.campcard.repository.ReferralRepository;
import org.bsa.campcard.domain.user.User;
import org.bsa.campcard.domain.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ReferralService Tests")
class ReferralServiceTest {

    @Mock
    private ReferralRepository referralRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ReferralService referralService;

    private UUID testUserId;
    private UUID referrerId;
    private UUID referredUserId;
    private User testUser;
    private User referrer;
    private Referral pendingReferral;
    private Referral completedReferral;

    @BeforeEach
    void setUp() {
        testUserId = UUID.randomUUID();
        referrerId = UUID.randomUUID();
        referredUserId = UUID.randomUUID();

        // Set the @Value fields via reflection
        ReflectionTestUtils.setField(referralService, "referralRewardAmount", new BigDecimal("10.00"));
        ReflectionTestUtils.setField(referralService, "baseUrl", "https://campcardapp.com");

        testUser = User.builder()
                .id(testUserId)
                .email("test@example.com")
                .firstName("John")
                .lastName("Doe")
                .referralCode("TESTCODE")
                .role(User.UserRole.SCOUT)
                .isActive(true)
                .build();

        referrer = User.builder()
                .id(referrerId)
                .email("referrer@example.com")
                .firstName("Jane")
                .lastName("Smith")
                .referralCode("REFCODE1")
                .role(User.UserRole.SCOUT)
                .isActive(true)
                .build();

        pendingReferral = Referral.builder()
                .id(1L)
                .referrerId(referrerId)
                .referredUserId(referredUserId)
                .referralCode("REFCODE1")
                .status(Referral.ReferralStatus.PENDING)
                .rewardAmount(new BigDecimal("10.00"))
                .rewardClaimed(false)
                .createdAt(LocalDateTime.now().minusDays(1))
                .build();

        completedReferral = Referral.builder()
                .id(2L)
                .referrerId(referrerId)
                .referredUserId(referredUserId)
                .referralCode("REFCODE1")
                .status(Referral.ReferralStatus.COMPLETED)
                .rewardAmount(new BigDecimal("10.00"))
                .rewardClaimed(false)
                .createdAt(LocalDateTime.now().minusDays(5))
                .completedAt(LocalDateTime.now().minusDays(1))
                .build();
    }

    @Nested
    @DisplayName("getUserReferralCode Tests")
    class GetUserReferralCodeTests {

        @Test
        @DisplayName("Should return existing referral code for user")
        void shouldReturnExistingReferralCode() {
            // Given
            when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
            when(referralRepository.findByReferrerId(testUserId)).thenReturn(Collections.emptyList());
            when(referralRepository.countSuccessfulReferrals(testUserId)).thenReturn(0L);
            when(referralRepository.getTotalRewardsEarned(testUserId)).thenReturn(0.0);

            // When
            ReferralCodeResponse response = referralService.getUserReferralCode(testUserId);

            // Then
            assertNotNull(response);
            assertEquals("TESTCODE", response.getReferralCode());
            assertEquals("https://campcardapp.com/join?ref=TESTCODE", response.getShareableLink());
            assertEquals(0, response.getTotalReferrals());
            assertEquals(0, response.getSuccessfulReferrals());
            assertEquals(BigDecimal.ZERO, response.getTotalRewardsEarned());
            assertEquals(BigDecimal.ZERO, response.getPendingRewards());
            verify(userRepository, never()).save(any(User.class));
        }

        @Test
        @DisplayName("Should generate new referral code when user has none")
        void shouldGenerateNewReferralCodeWhenUserHasNone() {
            // Given
            User userWithoutCode = User.builder()
                    .id(testUserId)
                    .email("test@example.com")
                    .firstName("John")
                    .lastName("Doe")
                    .referralCode(null)
                    .role(User.UserRole.SCOUT)
                    .isActive(true)
                    .build();

            when(userRepository.findById(testUserId)).thenReturn(Optional.of(userWithoutCode));
            when(userRepository.findByReferralCode(anyString())).thenReturn(Optional.empty());
            when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));
            when(referralRepository.findByReferrerId(testUserId)).thenReturn(Collections.emptyList());
            when(referralRepository.countSuccessfulReferrals(testUserId)).thenReturn(0L);
            when(referralRepository.getTotalRewardsEarned(testUserId)).thenReturn(null);

            // When
            ReferralCodeResponse response = referralService.getUserReferralCode(testUserId);

            // Then
            assertNotNull(response);
            assertNotNull(response.getReferralCode());
            assertEquals(8, response.getReferralCode().length());
            assertTrue(response.getShareableLink().contains(response.getReferralCode()));
            verify(userRepository).save(any(User.class));
        }

        @Test
        @DisplayName("Should generate new referral code when user has empty code")
        void shouldGenerateNewReferralCodeWhenUserHasEmptyCode() {
            // Given
            User userWithEmptyCode = User.builder()
                    .id(testUserId)
                    .email("test@example.com")
                    .firstName("John")
                    .lastName("Doe")
                    .referralCode("")
                    .role(User.UserRole.SCOUT)
                    .isActive(true)
                    .build();

            when(userRepository.findById(testUserId)).thenReturn(Optional.of(userWithEmptyCode));
            when(userRepository.findByReferralCode(anyString())).thenReturn(Optional.empty());
            when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));
            when(referralRepository.findByReferrerId(testUserId)).thenReturn(Collections.emptyList());
            when(referralRepository.countSuccessfulReferrals(testUserId)).thenReturn(0L);
            when(referralRepository.getTotalRewardsEarned(testUserId)).thenReturn(null);

            // When
            ReferralCodeResponse response = referralService.getUserReferralCode(testUserId);

            // Then
            assertNotNull(response);
            assertNotNull(response.getReferralCode());
            assertFalse(response.getReferralCode().isEmpty());
            verify(userRepository).save(any(User.class));
        }

        @Test
        @DisplayName("Should throw exception when user not found")
        void shouldThrowExceptionWhenUserNotFound() {
            // Given
            when(userRepository.findById(testUserId)).thenReturn(Optional.empty());

            // When/Then
            assertThrows(ResourceNotFoundException.class, () ->
                    referralService.getUserReferralCode(testUserId));
        }

        @Test
        @DisplayName("Should calculate referral statistics correctly")
        void shouldCalculateReferralStatisticsCorrectly() {
            // Given
            Referral completedUnclaimedReferral = Referral.builder()
                    .id(3L)
                    .referrerId(testUserId)
                    .referredUserId(UUID.randomUUID())
                    .status(Referral.ReferralStatus.COMPLETED)
                    .rewardAmount(new BigDecimal("10.00"))
                    .rewardClaimed(false)
                    .build();

            Referral completedClaimedReferral = Referral.builder()
                    .id(4L)
                    .referrerId(testUserId)
                    .referredUserId(UUID.randomUUID())
                    .status(Referral.ReferralStatus.REWARDED)
                    .rewardAmount(new BigDecimal("10.00"))
                    .rewardClaimed(true)
                    .build();

            List<Referral> allReferrals = List.of(pendingReferral, completedUnclaimedReferral, completedClaimedReferral);

            when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
            when(referralRepository.findByReferrerId(testUserId)).thenReturn(allReferrals);
            when(referralRepository.countSuccessfulReferrals(testUserId)).thenReturn(2L);
            when(referralRepository.getTotalRewardsEarned(testUserId)).thenReturn(10.0);

            // When
            ReferralCodeResponse response = referralService.getUserReferralCode(testUserId);

            // Then
            assertEquals(3, response.getTotalReferrals());
            assertEquals(2, response.getSuccessfulReferrals());
            assertEquals(new BigDecimal("10.0"), response.getTotalRewardsEarned());
            assertEquals(new BigDecimal("10.00"), response.getPendingRewards());
        }

        @Test
        @DisplayName("Should handle null total rewards gracefully")
        void shouldHandleNullTotalRewardsGracefully() {
            // Given
            when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
            when(referralRepository.findByReferrerId(testUserId)).thenReturn(Collections.emptyList());
            when(referralRepository.countSuccessfulReferrals(testUserId)).thenReturn(0L);
            when(referralRepository.getTotalRewardsEarned(testUserId)).thenReturn(null);

            // When
            ReferralCodeResponse response = referralService.getUserReferralCode(testUserId);

            // Then
            assertEquals(BigDecimal.ZERO, response.getTotalRewardsEarned());
        }
    }

    @Nested
    @DisplayName("applyReferralCode Tests")
    class ApplyReferralCodeTests {

        @Test
        @DisplayName("Should apply referral code successfully")
        void shouldApplyReferralCodeSuccessfully() {
            // Given
            UUID newUserId = UUID.randomUUID();
            String referralCode = "REFCODE1";

            when(userRepository.findByReferralCode(referralCode)).thenReturn(Optional.of(referrer));
            when(referralRepository.findByReferredUserId(newUserId)).thenReturn(Collections.emptyList());
            when(referralRepository.save(any(Referral.class))).thenAnswer(i -> {
                Referral r = i.getArgument(0);
                r.setId(1L);
                return r;
            });

            // When
            referralService.applyReferralCode(newUserId, referralCode);

            // Then
            ArgumentCaptor<Referral> captor = ArgumentCaptor.forClass(Referral.class);
            verify(referralRepository).save(captor.capture());

            Referral savedReferral = captor.getValue();
            assertEquals(referrerId, savedReferral.getReferrerId());
            assertEquals(newUserId, savedReferral.getReferredUserId());
            assertEquals(referralCode, savedReferral.getReferralCode());
            assertEquals(Referral.ReferralStatus.PENDING, savedReferral.getStatus());
            assertEquals(new BigDecimal("10.00"), savedReferral.getRewardAmount());
            assertFalse(savedReferral.getRewardClaimed());
        }

        @Test
        @DisplayName("Should throw exception for invalid referral code")
        void shouldThrowExceptionForInvalidReferralCode() {
            // Given
            UUID newUserId = UUID.randomUUID();
            String invalidCode = "INVALID";

            when(userRepository.findByReferralCode(invalidCode)).thenReturn(Optional.empty());

            // When/Then
            ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () ->
                    referralService.applyReferralCode(newUserId, invalidCode));
            assertEquals("Invalid referral code", exception.getMessage());
        }

        @Test
        @DisplayName("Should throw exception for self-referral")
        void shouldThrowExceptionForSelfReferral() {
            // Given
            String referralCode = "TESTCODE";
            when(userRepository.findByReferralCode(referralCode)).thenReturn(Optional.of(testUser));

            // When/Then
            IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                    referralService.applyReferralCode(testUserId, referralCode));
            assertEquals("Cannot refer yourself", exception.getMessage());
        }

        @Test
        @DisplayName("Should throw exception when user already referred")
        void shouldThrowExceptionWhenUserAlreadyReferred() {
            // Given
            UUID newUserId = UUID.randomUUID();
            String referralCode = "REFCODE1";

            Referral existingReferral = Referral.builder()
                    .id(1L)
                    .referrerId(UUID.randomUUID())
                    .referredUserId(newUserId)
                    .build();

            when(userRepository.findByReferralCode(referralCode)).thenReturn(Optional.of(referrer));
            when(referralRepository.findByReferredUserId(newUserId)).thenReturn(List.of(existingReferral));

            // When/Then
            IllegalStateException exception = assertThrows(IllegalStateException.class, () ->
                    referralService.applyReferralCode(newUserId, referralCode));
            assertEquals("User has already been referred", exception.getMessage());
        }

        @Test
        @DisplayName("Should set default reward amount from configuration")
        void shouldSetDefaultRewardAmountFromConfiguration() {
            // Given
            UUID newUserId = UUID.randomUUID();
            String referralCode = "REFCODE1";

            when(userRepository.findByReferralCode(referralCode)).thenReturn(Optional.of(referrer));
            when(referralRepository.findByReferredUserId(newUserId)).thenReturn(Collections.emptyList());
            when(referralRepository.save(any(Referral.class))).thenAnswer(i -> i.getArgument(0));

            // When
            referralService.applyReferralCode(newUserId, referralCode);

            // Then
            ArgumentCaptor<Referral> captor = ArgumentCaptor.forClass(Referral.class);
            verify(referralRepository).save(captor.capture());
            assertEquals(new BigDecimal("10.00"), captor.getValue().getRewardAmount());
        }
    }

    @Nested
    @DisplayName("completeReferral Tests")
    class CompleteReferralTests {

        @Test
        @DisplayName("Should complete pending referral")
        void shouldCompletePendingReferral() {
            // Given
            when(referralRepository.findByReferredUserId(referredUserId)).thenReturn(List.of(pendingReferral));
            when(referralRepository.save(any(Referral.class))).thenAnswer(i -> i.getArgument(0));

            // When
            referralService.completeReferral(referredUserId);

            // Then
            ArgumentCaptor<Referral> captor = ArgumentCaptor.forClass(Referral.class);
            verify(referralRepository).save(captor.capture());

            Referral savedReferral = captor.getValue();
            assertEquals(Referral.ReferralStatus.COMPLETED, savedReferral.getStatus());
            assertNotNull(savedReferral.getCompletedAt());
        }

        @Test
        @DisplayName("Should complete multiple pending referrals")
        void shouldCompleteMultiplePendingReferrals() {
            // Given
            Referral anotherPendingReferral = Referral.builder()
                    .id(2L)
                    .referrerId(UUID.randomUUID())
                    .referredUserId(referredUserId)
                    .status(Referral.ReferralStatus.PENDING)
                    .rewardAmount(new BigDecimal("10.00"))
                    .rewardClaimed(false)
                    .build();

            when(referralRepository.findByReferredUserId(referredUserId))
                    .thenReturn(List.of(pendingReferral, anotherPendingReferral));
            when(referralRepository.save(any(Referral.class))).thenAnswer(i -> i.getArgument(0));

            // When
            referralService.completeReferral(referredUserId);

            // Then
            verify(referralRepository, times(2)).save(any(Referral.class));
        }

        @Test
        @DisplayName("Should not modify already completed referral")
        void shouldNotModifyAlreadyCompletedReferral() {
            // Given
            when(referralRepository.findByReferredUserId(referredUserId)).thenReturn(List.of(completedReferral));

            // When
            referralService.completeReferral(referredUserId);

            // Then
            verify(referralRepository, never()).save(any(Referral.class));
        }

        @Test
        @DisplayName("Should handle no referrals found gracefully")
        void shouldHandleNoReferralsFoundGracefully() {
            // Given
            when(referralRepository.findByReferredUserId(referredUserId)).thenReturn(Collections.emptyList());

            // When
            referralService.completeReferral(referredUserId);

            // Then
            verify(referralRepository, never()).save(any(Referral.class));
        }

        @Test
        @DisplayName("Should skip expired referrals when completing")
        void shouldSkipExpiredReferralsWhenCompleting() {
            // Given
            Referral expiredReferral = Referral.builder()
                    .id(3L)
                    .referrerId(UUID.randomUUID())
                    .referredUserId(referredUserId)
                    .status(Referral.ReferralStatus.EXPIRED)
                    .rewardAmount(new BigDecimal("10.00"))
                    .rewardClaimed(false)
                    .build();

            when(referralRepository.findByReferredUserId(referredUserId))
                    .thenReturn(List.of(pendingReferral, expiredReferral));
            when(referralRepository.save(any(Referral.class))).thenAnswer(i -> i.getArgument(0));

            // When
            referralService.completeReferral(referredUserId);

            // Then
            verify(referralRepository, times(1)).save(any(Referral.class));
        }
    }

    @Nested
    @DisplayName("claimReward Tests")
    class ClaimRewardTests {

        @Test
        @DisplayName("Should claim reward successfully")
        void shouldClaimRewardSuccessfully() {
            // Given
            when(referralRepository.findById(2L)).thenReturn(Optional.of(completedReferral));
            when(referralRepository.save(any(Referral.class))).thenAnswer(i -> i.getArgument(0));

            // When
            referralService.claimReward(referrerId, 2L);

            // Then
            ArgumentCaptor<Referral> captor = ArgumentCaptor.forClass(Referral.class);
            verify(referralRepository).save(captor.capture());

            Referral savedReferral = captor.getValue();
            assertTrue(savedReferral.getRewardClaimed());
            assertNotNull(savedReferral.getRewardClaimedAt());
            assertEquals(Referral.ReferralStatus.REWARDED, savedReferral.getStatus());
        }

        @Test
        @DisplayName("Should throw exception when referral not found")
        void shouldThrowExceptionWhenReferralNotFound() {
            // Given
            when(referralRepository.findById(999L)).thenReturn(Optional.empty());

            // When/Then
            ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () ->
                    referralService.claimReward(referrerId, 999L));
            assertEquals("Referral not found", exception.getMessage());
        }

        @Test
        @DisplayName("Should throw exception when referral belongs to different user")
        void shouldThrowExceptionWhenReferralBelongsToDifferentUser() {
            // Given
            UUID differentUserId = UUID.randomUUID();
            when(referralRepository.findById(2L)).thenReturn(Optional.of(completedReferral));

            // When/Then
            IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                    referralService.claimReward(differentUserId, 2L));
            assertEquals("This referral does not belong to you", exception.getMessage());
        }

        @Test
        @DisplayName("Should throw exception when referral is not completed")
        void shouldThrowExceptionWhenReferralIsNotCompleted() {
            // Given
            when(referralRepository.findById(1L)).thenReturn(Optional.of(pendingReferral));

            // When/Then
            IllegalStateException exception = assertThrows(IllegalStateException.class, () ->
                    referralService.claimReward(referrerId, 1L));
            assertEquals("Referral is not completed yet", exception.getMessage());
        }

        @Test
        @DisplayName("Should throw exception when reward already claimed")
        void shouldThrowExceptionWhenRewardAlreadyClaimed() {
            // Given
            Referral alreadyClaimedReferral = Referral.builder()
                    .id(3L)
                    .referrerId(referrerId)
                    .referredUserId(referredUserId)
                    .status(Referral.ReferralStatus.COMPLETED)
                    .rewardAmount(new BigDecimal("10.00"))
                    .rewardClaimed(true)
                    .rewardClaimedAt(LocalDateTime.now())
                    .build();

            when(referralRepository.findById(3L)).thenReturn(Optional.of(alreadyClaimedReferral));

            // When/Then
            IllegalStateException exception = assertThrows(IllegalStateException.class, () ->
                    referralService.claimReward(referrerId, 3L));
            assertEquals("Reward has already been claimed", exception.getMessage());
        }

        @Test
        @DisplayName("Should set reward claimed timestamp")
        void shouldSetRewardClaimedTimestamp() {
            // Given
            LocalDateTime beforeClaim = LocalDateTime.now();
            when(referralRepository.findById(2L)).thenReturn(Optional.of(completedReferral));
            when(referralRepository.save(any(Referral.class))).thenAnswer(i -> i.getArgument(0));

            // When
            referralService.claimReward(referrerId, 2L);

            // Then
            ArgumentCaptor<Referral> captor = ArgumentCaptor.forClass(Referral.class);
            verify(referralRepository).save(captor.capture());

            LocalDateTime claimedAt = captor.getValue().getRewardClaimedAt();
            assertNotNull(claimedAt);
            assertTrue(claimedAt.isAfter(beforeClaim.minusSeconds(1)));
            assertTrue(claimedAt.isBefore(LocalDateTime.now().plusSeconds(1)));
        }
    }

    @Nested
    @DisplayName("getUserReferrals Tests")
    class GetUserReferralsTests {

        @Test
        @DisplayName("Should return user referrals")
        void shouldReturnUserReferrals() {
            // Given
            User referredUser = User.builder()
                    .id(referredUserId)
                    .email("referred@example.com")
                    .firstName("Bob")
                    .lastName("Jones")
                    .build();

            when(referralRepository.findByReferrerId(referrerId)).thenReturn(List.of(completedReferral));
            when(userRepository.findById(referredUserId)).thenReturn(Optional.of(referredUser));

            // When
            List<ReferralResponse> referrals = referralService.getUserReferrals(referrerId);

            // Then
            assertEquals(1, referrals.size());
            ReferralResponse response = referrals.get(0);
            assertEquals(2L, response.getId());
            assertEquals(referredUserId, response.getReferredUserId());
            assertEquals("Bob Jones", response.getReferredUserName());
            assertEquals("referred@example.com", response.getReferredUserEmail());
            assertEquals("COMPLETED", response.getStatus());
            assertEquals(new BigDecimal("10.00"), response.getRewardAmount());
            assertFalse(response.getRewardClaimed());
        }

        @Test
        @DisplayName("Should return empty list when no referrals")
        void shouldReturnEmptyListWhenNoReferrals() {
            // Given
            when(referralRepository.findByReferrerId(referrerId)).thenReturn(Collections.emptyList());

            // When
            List<ReferralResponse> referrals = referralService.getUserReferrals(referrerId);

            // Then
            assertTrue(referrals.isEmpty());
        }

        @Test
        @DisplayName("Should handle referred user not found")
        void shouldHandleReferredUserNotFound() {
            // Given
            when(referralRepository.findByReferrerId(referrerId)).thenReturn(List.of(completedReferral));
            when(userRepository.findById(referredUserId)).thenReturn(Optional.empty());

            // When
            List<ReferralResponse> referrals = referralService.getUserReferrals(referrerId);

            // Then
            assertEquals(1, referrals.size());
            ReferralResponse response = referrals.get(0);
            assertEquals("Unknown", response.getReferredUserName());
            assertEquals("", response.getReferredUserEmail());
        }

        @Test
        @DisplayName("Should return multiple referrals in order")
        void shouldReturnMultipleReferralsInOrder() {
            // Given
            UUID userId2 = UUID.randomUUID();
            Referral anotherReferral = Referral.builder()
                    .id(3L)
                    .referrerId(referrerId)
                    .referredUserId(userId2)
                    .referralCode("REFCODE1")
                    .status(Referral.ReferralStatus.PENDING)
                    .rewardAmount(new BigDecimal("10.00"))
                    .rewardClaimed(false)
                    .createdAt(LocalDateTime.now())
                    .build();

            User user1 = User.builder()
                    .id(referredUserId)
                    .firstName("Bob")
                    .lastName("Jones")
                    .email("bob@example.com")
                    .build();

            User user2 = User.builder()
                    .id(userId2)
                    .firstName("Alice")
                    .lastName("Smith")
                    .email("alice@example.com")
                    .build();

            when(referralRepository.findByReferrerId(referrerId)).thenReturn(List.of(completedReferral, anotherReferral));
            when(userRepository.findById(referredUserId)).thenReturn(Optional.of(user1));
            when(userRepository.findById(userId2)).thenReturn(Optional.of(user2));

            // When
            List<ReferralResponse> referrals = referralService.getUserReferrals(referrerId);

            // Then
            assertEquals(2, referrals.size());
            assertEquals("Bob Jones", referrals.get(0).getReferredUserName());
            assertEquals("Alice Smith", referrals.get(1).getReferredUserName());
        }

        @Test
        @DisplayName("Should include completed timestamp in response")
        void shouldIncludeCompletedTimestampInResponse() {
            // Given
            User referredUser = User.builder()
                    .id(referredUserId)
                    .firstName("Bob")
                    .lastName("Jones")
                    .email("bob@example.com")
                    .build();

            when(referralRepository.findByReferrerId(referrerId)).thenReturn(List.of(completedReferral));
            when(userRepository.findById(referredUserId)).thenReturn(Optional.of(referredUser));

            // When
            List<ReferralResponse> referrals = referralService.getUserReferrals(referrerId);

            // Then
            assertEquals(1, referrals.size());
            assertNotNull(referrals.get(0).getCompletedAt());
            assertNotNull(referrals.get(0).getCreatedAt());
        }
    }

    @Nested
    @DisplayName("Referral Code Generation Tests")
    class ReferralCodeGenerationTests {

        @Test
        @DisplayName("Should generate unique code when first attempt succeeds")
        void shouldGenerateUniqueCodeWhenFirstAttemptSucceeds() {
            // Given
            User userWithoutCode = User.builder()
                    .id(testUserId)
                    .email("test@example.com")
                    .firstName("John")
                    .lastName("Doe")
                    .referralCode(null)
                    .build();

            when(userRepository.findById(testUserId)).thenReturn(Optional.of(userWithoutCode));
            when(userRepository.findByReferralCode(anyString())).thenReturn(Optional.empty());
            when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));
            when(referralRepository.findByReferrerId(testUserId)).thenReturn(Collections.emptyList());
            when(referralRepository.countSuccessfulReferrals(testUserId)).thenReturn(0L);
            when(referralRepository.getTotalRewardsEarned(testUserId)).thenReturn(null);

            // When
            ReferralCodeResponse response = referralService.getUserReferralCode(testUserId);

            // Then
            assertNotNull(response.getReferralCode());
            assertEquals(8, response.getReferralCode().length());
            // Verify code only contains valid characters
            assertTrue(response.getReferralCode().matches("[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]+"));
        }

        @Test
        @DisplayName("Should retry code generation on collision")
        void shouldRetryCodeGenerationOnCollision() {
            // Given
            User userWithoutCode = User.builder()
                    .id(testUserId)
                    .email("test@example.com")
                    .firstName("John")
                    .lastName("Doe")
                    .referralCode(null)
                    .build();

            when(userRepository.findById(testUserId)).thenReturn(Optional.of(userWithoutCode));
            // First two attempts return existing user (collision), third succeeds
            when(userRepository.findByReferralCode(anyString()))
                    .thenReturn(Optional.of(referrer))
                    .thenReturn(Optional.of(referrer))
                    .thenReturn(Optional.empty());
            when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));
            when(referralRepository.findByReferrerId(testUserId)).thenReturn(Collections.emptyList());
            when(referralRepository.countSuccessfulReferrals(testUserId)).thenReturn(0L);
            when(referralRepository.getTotalRewardsEarned(testUserId)).thenReturn(null);

            // When
            ReferralCodeResponse response = referralService.getUserReferralCode(testUserId);

            // Then
            assertNotNull(response.getReferralCode());
            verify(userRepository, times(3)).findByReferralCode(anyString());
        }
    }
}
