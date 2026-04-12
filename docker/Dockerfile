# ================================
# Base stage - Common dependencies
# ================================
FROM node:20-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_ENV=production

WORKDIR /app

# Install pnpm via npm (avoids Corepack fetch failures in some Docker/Alpine setups)
RUN npm install -g pnpm@10.4.0 @nestjs/cli

# Copy package files
COPY --chown=node:node package.json pnpm-lock.yaml ./

# Install all dependencies (needed for build)
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# Copy source code
COPY --chown=node:node . .

# ================================
# Development stage
# ================================
FROM base AS dev

EXPOSE 3000
CMD ["pnpm", "start:dev"]

# ================================
# Build stage - Compile TypeScript
# ================================
FROM base AS build

RUN pnpm build

# ================================
# Production stage - Optimized
# ================================
FROM node:20-alpine AS prod

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_ENV=production

WORKDIR /app

RUN npm install -g pnpm@10.4.0

# Copy package files and install production dependencies only
COPY --chown=node:node package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --prod --ignore-scripts

# Copy built application from build stage
COPY --chown=node:node --from=build /app/dist ./dist

# Copy entrypoint script
COPY --chown=node:node docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Create logs directory with proper permissions
RUN mkdir -p logs && chown -R node:node logs

# Switch to non-root user for security
USER node

EXPOSE 3000

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["node", "dist/src/main.js"]
