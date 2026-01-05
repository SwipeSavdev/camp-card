package org.bsa.campcard;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * BSA Camp Card Platform - Main Application
 *
 * Spring Boot application entry point for the Camp Card digitalization platform.
 *
 * Features:
 * - RESTful API for mobile app and web portal
 * - Multi-tenant architecture with Row-Level Security
 * - Subscription management with Stripe integration
 * - QR code generation and redemption
 * - Real-time analytics and reporting
 *
 * @author BSA Engineering Team
 * @version 1.0.0
 * @since 2025-01-01
 */
@SpringBootApplication
@ComponentScan(basePackages = {"org.bsa.campcard", "com.bsa.campcard"})
@EntityScan(basePackages = {"org.bsa.campcard", "com.bsa.campcard"})
@EnableJpaRepositories(basePackages = {"org.bsa.campcard", "com.bsa.campcard"})
@EnableJpaAuditing
@EnableAsync
@EnableScheduling
public class CampCardApplication {

    public static void main(String[] args) {
        SpringApplication.run(CampCardApplication.class, args);
    }
}
