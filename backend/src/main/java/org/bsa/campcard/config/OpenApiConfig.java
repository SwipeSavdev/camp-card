package org.bsa.campcard.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * OpenAPI/Swagger configuration
 */
@Configuration
public class OpenApiConfig {

    @Value("${server.servlet.context-path:/}")
    private String contextPath;

    @Bean
    public OpenAPI campCardOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("BSA Camp Card API")
                .description("RESTful API for the BSA Camp Card digitalization platform. " +
                    "Supports subscription management, merchant offers, QR code redemption, and analytics.")
                .version("1.0.0")
                .contact(new Contact()
                    .name("BSA Engineering Team")
                    .email("engineering@campcard.org")
                    .url("https://campcard.org"))
                .license(new License()
                    .name("Proprietary")
                    .url("https://campcard.org/license")))
            .servers(List.of(
                new Server().url("http://localhost:8080").description("Local Development"),
                new Server().url("https://api-staging.campcard.org").description("Staging"),
                new Server().url("https://api.campcard.org").description("Production")
            ))
            .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
            .schemaRequirement("bearerAuth", new SecurityScheme()
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT")
                .description("JWT token obtained from /api/v1/auth/login"));
    }
}
