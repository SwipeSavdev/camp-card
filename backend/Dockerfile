# ============================================================================
# Camp Card Backend - Dockerfile
# ============================================================================
FROM amazoncorretto:21-alpine AS builder

WORKDIR /app

# Copy Maven wrapper and pom
COPY pom.xml .
COPY mvnw .
COPY .mvn .mvn

# Make mvnw executable
RUN chmod +x mvnw

# Download dependencies (cached layer)
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application
RUN ./mvnw clean package -DskipTests -B

# ============================================================================
# Runtime Stage
# ============================================================================
FROM amazoncorretto:21-alpine

WORKDIR /app

# Create non-root user
RUN addgroup -S campcard && adduser -S campcard -G campcard

# Create log directory
RUN mkdir -p /var/log/campcard && chown -R campcard:campcard /var/log/campcard

# Copy JAR from builder
COPY --from=builder /app/target/*.jar app.jar

# Change ownership
RUN chown campcard:campcard app.jar

# Switch to non-root user
USER campcard

# Expose port
EXPOSE 7010

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:7010/actuator/health || exit 1

# JVM settings
ENV JAVA_OPTS="-Xms256m -Xmx1g -XX:+UseG1GC"

# Run the application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar --spring.profiles.active=${SPRING_PROFILE:-aws}"]
