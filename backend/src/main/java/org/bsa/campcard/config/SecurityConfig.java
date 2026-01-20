package org.bsa.campcard.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/api/v1/auth/**").permitAll()
                .requestMatchers("/api/v1/public/**").permitAll()
                .requestMatchers("/api/v1/subscription-plans").permitAll()
                .requestMatchers("/api/v1/offers/**").permitAll()
                .requestMatchers("/api/v1/merchants/**").permitAll()
                .requestMatchers("/api/v1/location/**").permitAll()
                // Public subscription purchase endpoints (Authorize.Net Accept Hosted)
                .requestMatchers("/api/v1/payments/subscribe/**").permitAll()
                .requestMatchers("/actuator/**").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()
                .requestMatchers("/h2-console/**").permitAll()
                .requestMatchers("/error").permitAll()
                // WebSocket endpoints
                .requestMatchers("/ws/**").permitAll()

                // Role-based access
                .requestMatchers("/api/v1/admin/**").hasRole("NATIONAL_ADMIN")
                .requestMatchers("/api/v1/council/**").hasAnyRole("COUNCIL_ADMIN", "NATIONAL_ADMIN")
                .requestMatchers("/api/v1/troop/**").hasAnyRole("UNIT_LEADER", "COUNCIL_ADMIN", "NATIONAL_ADMIN")

                // All other endpoints require authentication
                .anyRequest().authenticated()
            )
            .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()))
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:7020",  // Web portal (dev)
            "http://localhost:8085",  // Mobile Expo (dev)
            "http://18.190.69.205:7020",  // AWS Admin Portal
            "http://18.190.69.205:7010",  // AWS API
            "https://bsa.swipesavvy.com",  // Legacy production domain
            "http://bsa.swipesavvy.com",   // Legacy HTTP redirect
            "https://portal.campcard.org",  // Legacy web portal
            "https://api.campcard.org",     // Legacy API
            // New campcardapp.org domains
            "https://campcardapp.org",           // Root domain
            "https://www.campcardapp.org",       // Marketing site
            "https://admin.campcardapp.org",     // Admin portal (prod)
            "https://api.campcardapp.org"        // API (prod)
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList(
            "Authorization",
            "Content-Type",
            "Accept",
            "Origin",
            "X-Requested-With",
            "X-User-Id",
            "X-Council-Id",
            "Cache-Control",
            "Pragma"
        ));
        configuration.setExposedHeaders(Arrays.asList("Authorization", "X-Total-Count"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
