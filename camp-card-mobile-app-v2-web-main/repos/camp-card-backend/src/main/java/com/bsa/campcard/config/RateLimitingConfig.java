package com.bsa.campcard.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Bucket4j;
import io.github.bucket4j.Refill;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Rate Limiting Configuration using Token Bucket Algorithm
 * Prevents abuse and ensures fair resource usage
 */
@Component
class RateLimitingInterceptor implements HandlerInterceptor {

 private final Map<String, Bucket> cacheBuckets = new ConcurrentHashMap<>();

 @Override
 public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
 throws Exception {

 String key = getClientKey(request);
 Bucket bucket = resolveBucket(key);

 if (bucket.tryConsume(1)) {
 return true; // Request allowed
 } else {
 response.setStatus(429); // Too Many Requests
 response.getWriter().write("{\"error\": \"Rate limit exceeded\"}");
 return false;
 }
 }

 private Bucket resolveBucket(String key) {
 return cacheBuckets.computeIfAbsent(key, k -> createNewBucket());
 }

 @SuppressWarnings("deprecation")
 private Bucket createNewBucket() {
 // 100 requests per minute per IP/User
 Bandwidth limit = Bandwidth.classic(100, Refill.intervally(100, Duration.ofMinutes(1)));
 return Bucket4j.builder()
 .addLimit(limit)
 .build();
 }

 private String getClientKey(HttpServletRequest request) {
 // Use IP address or user ID if authenticated
 String clientIp = request.getHeader("X-Forwarded-For");
 if (clientIp == null || clientIp.isEmpty()) {
 clientIp = request.getRemoteAddr();
 }
 return clientIp;
 }
}

@Configuration
class RateLimitingConfig implements WebMvcConfigurer {

 @Override
 public void addInterceptors(InterceptorRegistry registry) {
 registry.addInterceptor(new RateLimitingInterceptor())
 .addPathPatterns("/api/**")
 .addPathPatterns("/offers/**");
 }
}
