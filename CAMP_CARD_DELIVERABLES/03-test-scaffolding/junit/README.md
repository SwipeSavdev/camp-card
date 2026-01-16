# JUnit Starter Kit for Camp Card Backend

## Overview

This folder contains templates and examples for backend testing with JUnit 5.

## Dependencies (add to pom.xml)

```xml
<dependencies>
    <!-- JUnit 5 -->
    <dependency>
        <groupId>org.junit.jupiter</groupId>
        <artifactId>junit-jupiter</artifactId>
        <version>5.10.0</version>
        <scope>test</scope>
    </dependency>

    <!-- Mockito -->
    <dependency>
        <groupId>org.mockito</groupId>
        <artifactId>mockito-core</artifactId>
        <version>5.7.0</version>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>org.mockito</groupId>
        <artifactId>mockito-junit-jupiter</artifactId>
        <version>5.7.0</version>
        <scope>test</scope>
    </dependency>

    <!-- Testcontainers -->
    <dependency>
        <groupId>org.testcontainers</groupId>
        <artifactId>testcontainers</artifactId>
        <version>1.19.3</version>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>org.testcontainers</groupId>
        <artifactId>postgresql</artifactId>
        <version>1.19.3</version>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>org.testcontainers</groupId>
        <artifactId>junit-jupiter</artifactId>
        <version>1.19.3</version>
        <scope>test</scope>
    </dependency>

    <!-- Spring Boot Test -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>org.springframework.security</groupId>
        <artifactId>spring-security-test</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

## Test Structure

```
src/test/java/com/bsa/campcard/
├── service/
│   ├── SubscriptionPurchaseServiceTest.java
│   ├── UserServiceTest.java
│   ├── CampaignServiceTest.java
│   └── PaymentServiceTest.java
├── repository/
│   ├── UserRepositoryIT.java
│   ├── SubscriptionRepositoryIT.java
│   └── CampaignRepositoryIT.java
├── api/
│   ├── AuthControllerTest.java
│   ├── UserControllerTest.java
│   └── CampaignControllerTest.java
└── integration/
    ├── SubscriptionFlowIT.java
    └── CampaignFlowIT.java
```

## Example Test Templates

### Service Unit Test

```java
package com.bsa.campcard.service;

import com.bsa.campcard.dto.payment.SubscriptionPurchaseRequest;
import com.bsa.campcard.dto.payment.SubscriptionPurchaseResponse;
import com.bsa.campcard.repository.SubscriptionRepository;
import org.bsa.campcard.domain.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SubscriptionPurchaseServiceTest {

    @Mock
    private PaymentService paymentService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SubscriptionRepository subscriptionRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private SubscriptionPurchaseService subscriptionPurchaseService;

    @BeforeEach
    void setUp() {
        // Common setup
    }

    @Test
    @DisplayName("Should complete purchase successfully with valid payment")
    void completePurchase_ValidPayment_Success() {
        // Arrange
        var request = createValidPurchaseRequest();
        when(paymentService.verifySubscriptionPayment(any())).thenReturn(successfulPayment());
        when(userRepository.existsByEmail(any())).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("hashedPassword");
        when(userRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(subscriptionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(subscriptionRepository.existsByCardNumber(any())).thenReturn(false);

        // Act
        var response = subscriptionPurchaseService.completePurchase(request);

        // Assert
        assertThat(response.isSuccess()).isTrue();
        assertThat(response.getCardNumber()).startsWith("CC-");
        verify(userRepository).save(any());
        verify(subscriptionRepository).save(any());
    }

    @Test
    @DisplayName("Should fail when email already exists")
    void completePurchase_EmailExists_Fails() {
        // Arrange
        var request = createValidPurchaseRequest();
        when(paymentService.verifySubscriptionPayment(any())).thenReturn(successfulPayment());
        when(userRepository.existsByEmail(request.getEmail())).thenReturn(true);

        // Act
        var response = subscriptionPurchaseService.completePurchase(request);

        // Assert
        assertThat(response.isSuccess()).isFalse();
        assertThat(response.getErrorCode()).isEqualTo("EMAIL_EXISTS");
        verify(userRepository, never()).save(any());
    }

    private SubscriptionPurchaseRequest createValidPurchaseRequest() {
        return SubscriptionPurchaseRequest.builder()
            .email("test@example.com")
            .password("Password123!")
            .firstName("Test")
            .lastName("User")
            .transactionId("txn_123")
            .build();
    }

    private PaymentResponse successfulPayment() {
        return PaymentResponse.builder()
            .status("SUCCESS")
            .transactionId("txn_123")
            .build();
    }
}
```

### Repository Integration Test

```java
package com.bsa.campcard.repository;

import com.bsa.campcard.entity.Subscription;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@Testcontainers
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class SubscriptionRepositoryIT {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
        .withDatabaseName("campcard_test")
        .withUsername("test")
        .withPassword("test");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Test
    void shouldFindByCardNumber() {
        // Arrange
        var subscription = Subscription.builder()
            .userId(1L)
            .councilId(1L)
            .planId(1L)
            .cardNumber("CC-1234-5678-9012")
            .status(Subscription.SubscriptionStatus.ACTIVE)
            .currentPeriodStart(LocalDateTime.now())
            .currentPeriodEnd(LocalDateTime.now().plusYears(1))
            .build();
        subscriptionRepository.save(subscription);

        // Act
        var found = subscriptionRepository.findByCardNumber("CC-1234-5678-9012");

        // Assert
        assertThat(found).isPresent();
        assertThat(found.get().getStatus()).isEqualTo(Subscription.SubscriptionStatus.ACTIVE);
    }

    @Test
    void shouldCheckCardNumberExists() {
        // Arrange
        var subscription = Subscription.builder()
            .userId(1L)
            .councilId(1L)
            .planId(1L)
            .cardNumber("CC-UNIQUE-1234")
            .status(Subscription.SubscriptionStatus.ACTIVE)
            .currentPeriodStart(LocalDateTime.now())
            .currentPeriodEnd(LocalDateTime.now().plusYears(1))
            .build();
        subscriptionRepository.save(subscription);

        // Act & Assert
        assertThat(subscriptionRepository.existsByCardNumber("CC-UNIQUE-1234")).isTrue();
        assertThat(subscriptionRepository.existsByCardNumber("CC-NONEXISTENT")).isFalse();
    }
}
```

### Controller Test with Security

```java
package com.bsa.campcard.api;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UserController.class)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @Test
    @WithMockUser(roles = "NATIONAL_ADMIN")
    void getUsers_AsAdmin_ReturnsOk() throws Exception {
        mockMvc.perform(get("/api/v1/users"))
            .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "SCOUT")
    void getUsers_AsScout_ReturnsForbidden() throws Exception {
        mockMvc.perform(get("/api/v1/users"))
            .andExpect(status().isForbidden());
    }

    @Test
    void getUsers_Unauthenticated_ReturnsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/users"))
            .andExpect(status().isUnauthorized());
    }
}
```

## Running Tests

```bash
# All tests
./mvnw test

# Specific test class
./mvnw test -Dtest=SubscriptionPurchaseServiceTest

# Integration tests only
./mvnw verify -P integration-tests

# With coverage report
./mvnw test jacoco:report
```

## Coverage Requirements

- Line coverage: > 80%
- Branch coverage: > 70%
- Classes to cover:
  - All service classes
  - All repository classes
  - All controller classes

## Best Practices

1. **Use descriptive test names** with `@DisplayName`
2. **Follow AAA pattern**: Arrange, Act, Assert
3. **One assertion per test** (or related assertions)
4. **Mock external dependencies** in unit tests
5. **Use Testcontainers** for integration tests
6. **Test all user roles** for RBAC
7. **Test edge cases** and error conditions
8. **No flaky tests** - avoid `Thread.sleep()`
