FROM node:20-alpine as base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable
WORKDIR /app

# Install NestJS CLI globally
RUN npm i -g @nestjs/cli

# Copy necessary files for installation
COPY --chown=node:node package.json ./
COPY --chown=node:node pnpm-lock.yaml ./

# Install dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install

# Copy the rest of your application
COPY --chown=node:node . .

ENV NODE_ENV production

FROM base as dev
EXPOSE 3000

FROM base as prod
# Build your application
RUN pnpm build

# Remove development dependencies
RUN pnpm prune --prod --config.ignore-scripts=true
EXPOSE 3000

CMD ["pnpm", "start:prod"]
