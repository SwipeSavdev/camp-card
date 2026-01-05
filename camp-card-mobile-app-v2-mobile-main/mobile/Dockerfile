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
    g++

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

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
EXPOSE 8081 19000 19001 19002

# Environment variables for Expo
ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
ENV REACT_NATIVE_PACKAGER_HOSTNAME=0.0.0.0

# Start Expo in tunnel mode for remote access
CMD ["npx", "expo", "start", "--tunnel", "--non-interactive"]
