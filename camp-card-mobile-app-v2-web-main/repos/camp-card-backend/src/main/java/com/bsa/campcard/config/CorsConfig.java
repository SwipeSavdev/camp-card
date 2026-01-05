package com.bsa.campcard.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {
 @Override
 public void addCorsMappings(CorsRegistry registry) {
 // Dev-friendly CORS. Tighten this in production.
 registry.addMapping("/**")
 .allowedOrigins("*")
 .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
 .allowedHeaders("*");
 }
}
