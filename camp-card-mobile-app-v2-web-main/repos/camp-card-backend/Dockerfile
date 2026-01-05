FROM eclipse-temurin:21-jre-jammy

LABEL maintainer="BSA Engineering Team <engineering@campcard.org>"
LABEL description="BSA Camp Card Backend API"

# Create app user
RUN groupadd -r campcard && useradd -r -g campcard campcard

# Set working directory
WORKDIR /app

# Copy JAR file
COPY target/campcard.jar app.jar

# Change ownership
RUN chown -R campcard:campcard /app

# Switch to non-root user
USER campcard

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# JVM arguments for production
ENV JAVA_OPTS="-Xms512m -Xmx2g -XX:+UseG1GC -XX:MaxGCPauseMillis=200 -Dspring.profiles.active=prod"

# Run application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
