# Build stage
FROM node:20-alpine AS builder

# Enable corepack for pnpm
RUN corepack enable && corepack prepare pnpm@10.18.2 --activate

WORKDIR /app

# Copy package files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/realtime/package.json ./apps/realtime/
COPY packages ./packages/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/realtime ./apps/realtime/
COPY turbo.json tsconfig.json ./

# Build the application
RUN pnpm --filter @morina/realtime build

# Production stage
FROM node:20-alpine AS production

# Enable corepack
RUN corepack enable && corepack prepare pnpm@10.18.2 --activate

WORKDIR /app

# Copy package files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/realtime/package.json ./apps/realtime/
COPY packages ./packages/

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy built files from builder
COPY --from=builder /app/apps/realtime/dist ./apps/realtime/dist
COPY --from=builder /app/packages ./packages

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

EXPOSE 3334

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:3334/health || exit 1

CMD ["node", "apps/realtime/dist/main.js"]

