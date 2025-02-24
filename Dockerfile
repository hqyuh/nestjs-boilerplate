# Base stage
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Enable corepack, install NestJS CLI, and set working directory

RUN npm install -g corepack

RUN corepack enable && \
    npm i -g @nestjs/cli

RUN corepack prepare pnpm@10.4.0 --activate

WORKDIR /app

# Copy package manager files and install dependencies
COPY --chown=node:node package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Copy the rest of your application code
COPY --chown=node:node . .

# Set environment for production
ENV NODE_ENV production

# Development stage
FROM base AS dev
EXPOSE 3000
CMD ["pnpm", "start:dev"]

# Production stage
FROM base AS prod

COPY --chown=node:node package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --prod

COPY --chown=node:node --from=build /usr/src/app/dist ./dist

# Build application and remove development dependencies in one RUN
RUN pnpm build && pnpm prune --prod --config.ignore-scripts=true

EXPOSE 3000

# Set production start command
CMD ["pnpm", "start:prod"]
