# Base stage
FROM node:20-alpine as base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Enable corepack, install NestJS CLI, and set working directory
RUN corepack enable && \
    npm i -g @nestjs/cli

WORKDIR /app

# Copy package manager files and install dependencies
COPY --chown=node:node package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Copy the rest of your application code
COPY --chown=node:node . .

# Set environment for production
ENV NODE_ENV production

# Development stage
FROM base as dev
EXPOSE 3000
CMD ["pnpm", "start:dev"]

# Production stage
FROM base as prod
# Build application and remove development dependencies in one RUN
RUN pnpm build && pnpm prune --prod --config.ignore-scripts=true

EXPOSE 3000

# Set production start command
CMD ["pnpm", "start:prod"]
