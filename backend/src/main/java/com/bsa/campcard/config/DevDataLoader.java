package com.bsa.campcard.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bsa.campcard.domain.user.User;
import org.bsa.campcard.domain.user.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Development data loader - seeds test users on startup
 * Only runs in dev profile with H2 in-memory database
 */
@Component
@Profile("dev")
@RequiredArgsConstructor
@Slf4j
public class DevDataLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already has users, skipping seed data");
            return;
        }

        log.info("Seeding development test users...");

        String encodedPassword = passwordEncoder.encode("Password123!");
        LocalDateTime now = LocalDateTime.now();

        List<User> users = List.of(
            // National Admins
            User.builder()
                .email("admin@campcard.org")
                .passwordHash(encodedPassword)
                .firstName("Sarah")
                .lastName("Johnson")
                .phoneNumber("555-0001")
                .role(User.UserRole.NATIONAL_ADMIN)
                .isActive(true)
                .emailVerified(true)
                .referralCode("ADMIN001")
                .createdAt(now)
                .updatedAt(now)
                .build(),

            User.builder()
                .email("mike.admin@campcard.org")
                .passwordHash(encodedPassword)
                .firstName("Mike")
                .lastName("Thompson")
                .phoneNumber("555-0002")
                .role(User.UserRole.NATIONAL_ADMIN)
                .isActive(true)
                .emailVerified(true)
                .referralCode("ADMIN002")
                .createdAt(now)
                .updatedAt(now)
                .build(),

            // Council Admins
            User.builder()
                .email("john.smith@nycbsa.org")
                .passwordHash(encodedPassword)
                .firstName("John")
                .lastName("Smith")
                .phoneNumber("212-555-0101")
                .role(User.UserRole.COUNCIL_ADMIN)
                .isActive(true)
                .emailVerified(true)
                .referralCode("NYC00001")
                .createdAt(now)
                .updatedAt(now)
                .build(),

            User.builder()
                .email("lisa.garcia@labsa.org")
                .passwordHash(encodedPassword)
                .firstName("Lisa")
                .lastName("Garcia")
                .phoneNumber("213-555-0201")
                .role(User.UserRole.COUNCIL_ADMIN)
                .isActive(true)
                .emailVerified(true)
                .referralCode("LAC00001")
                .createdAt(now)
                .updatedAt(now)
                .build(),

            User.builder()
                .email("robert.chen@chicagobsa.org")
                .passwordHash(encodedPassword)
                .firstName("Robert")
                .lastName("Chen")
                .phoneNumber("312-555-0301")
                .role(User.UserRole.COUNCIL_ADMIN)
                .isActive(true)
                .emailVerified(true)
                .referralCode("CHI00001")
                .createdAt(now)
                .updatedAt(now)
                .build(),

            // Troop Leaders
            User.builder()
                .email("david.wilson@troop101.org")
                .passwordHash(encodedPassword)
                .firstName("David")
                .lastName("Wilson")
                .phoneNumber("212-555-1101")
                .role(User.UserRole.TROOP_LEADER)
                .isActive(true)
                .emailVerified(true)
                .referralCode("TRP10101")
                .createdAt(now)
                .updatedAt(now)
                .build(),

            User.builder()
                .email("maria.rodriguez@troop201.org")
                .passwordHash(encodedPassword)
                .firstName("Maria")
                .lastName("Rodriguez")
                .phoneNumber("213-555-2101")
                .role(User.UserRole.TROOP_LEADER)
                .isActive(true)
                .emailVerified(true)
                .referralCode("TRP20101")
                .createdAt(now)
                .updatedAt(now)
                .build(),

            // Parents
            User.builder()
                .email("james.anderson@email.com")
                .passwordHash(encodedPassword)
                .firstName("James")
                .lastName("Anderson")
                .phoneNumber("212-555-3001")
                .role(User.UserRole.PARENT)
                .isActive(true)
                .emailVerified(true)
                .referralCode("PAR00001")
                .createdAt(now)
                .updatedAt(now)
                .build(),

            User.builder()
                .email("jennifer.martinez@email.com")
                .passwordHash(encodedPassword)
                .firstName("Jennifer")
                .lastName("Martinez")
                .phoneNumber("213-555-3002")
                .role(User.UserRole.PARENT)
                .isActive(true)
                .emailVerified(true)
                .referralCode("PAR00002")
                .createdAt(now)
                .updatedAt(now)
                .build(),

            // Scouts
            User.builder()
                .email("ethan.anderson@email.com")
                .passwordHash(encodedPassword)
                .firstName("Ethan")
                .lastName("Anderson")
                .phoneNumber("212-555-4001")
                .role(User.UserRole.SCOUT)
                .isActive(true)
                .emailVerified(true)
                .referralCode("SCT00001")
                .createdAt(now)
                .updatedAt(now)
                .build(),

            User.builder()
                .email("sophia.martinez@email.com")
                .passwordHash(encodedPassword)
                .firstName("Sophia")
                .lastName("Martinez")
                .phoneNumber("213-555-4002")
                .role(User.UserRole.SCOUT)
                .isActive(true)
                .emailVerified(true)
                .referralCode("SCT00002")
                .createdAt(now)
                .updatedAt(now)
                .build(),

            User.builder()
                .email("noah.taylor@email.com")
                .passwordHash(encodedPassword)
                .firstName("Noah")
                .lastName("Taylor")
                .phoneNumber("212-555-4003")
                .role(User.UserRole.SCOUT)
                .isActive(true)
                .emailVerified(true)
                .referralCode("SCT00003")
                .createdAt(now)
                .updatedAt(now)
                .build()
        );

        userRepository.saveAll(users);

        log.info("✅ Seeded {} test users successfully!", users.size());
        log.info("📧 All users have password: Password123!");
        log.info("Test accounts:");
        log.info("  - admin@campcard.org (NATIONAL_ADMIN)");
        log.info("  - john.smith@nycbsa.org (COUNCIL_ADMIN)");
        log.info("  - david.wilson@troop101.org (TROOP_LEADER)");
        log.info("  - james.anderson@email.com (PARENT)");
        log.info("  - ethan.anderson@email.com (SCOUT)");
    }
}
