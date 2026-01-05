# ============================================================================
# Camp Card Mobile App - Expo Development Server
# ============================================================================
# This Dockerfile creates an Expo development server for testing
# Testers can connect via Expo Go app on their phones
# ============================================================================

FROM node:20-alpine

WORKDIR /app

# Install required system dependencies
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++ \
    curl

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Install ngrok globally for Expo tunnel mode
RUN npm install -g @expo/ngrok@^4.1.0

# Copy source code
COPY . .

# Use AWS environment config
# Copy .env.aws as .env so Expo picks up the correct API URL
RUN cp .env.aws .env 2>/dev/null || true

# Make startup script executable
RUN chmod +x start-expo.sh 2>/dev/null || true

# Create non-root user
RUN addgroup -S campcard && adduser -S campcard -G campcard
RUN chown -R campcard:campcard /app

# Switch to non-root user
USER campcard

# Expose Expo ports
# 8081 - Metro bundler
# 19000 - Expo DevTools
# 19001 - Expo DevTools (packager)
# 19002 - Expo DevTools (web interface)
# 4040 - ngrok inspector
EXPOSE 8081 19000 19001 19002 4040

# Environment variables for Expo
ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
ENV REACT_NATIVE_PACKAGER_HOSTNAME=0.0.0.0
# CI=1 enables non-interactive mode properly
ENV CI=1

# Start Expo with custom script that prints tunnel URL
CMD ["/bin/sh", "./start-expo.sh"]
