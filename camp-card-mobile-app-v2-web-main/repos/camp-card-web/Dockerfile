# ============================================================================
# Camp Card Web Portal - Dockerfile
# ============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Set build-time environment variables for Next.js
# These can be overridden at runtime for client-side vars (NEXT_PUBLIC_*)
ENV NEXT_PUBLIC_API_URL=http://localhost:7010/api/v1
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN npm run build

# Verify build output exists
RUN ls -la .next/ && test -f .next/BUILD_ID

# ============================================================================
# Runtime Stage
# ============================================================================
FROM node:20-alpine

WORKDIR /app

# Create non-root user
RUN addgroup -S campcard && adduser -S campcard -G campcard

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built application from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./

# Change ownership
RUN chown -R campcard:campcard /app

# Switch to non-root user
USER campcard

# Expose port
EXPOSE 7020

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:7020 || exit 1

# Set environment
ENV NODE_ENV=production
ENV PORT=7020

# Run the application
CMD ["npm", "start"]
