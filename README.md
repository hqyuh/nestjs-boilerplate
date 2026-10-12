# NestJS boilerplate

NestJS 12 API boilerplate: TypeORM/Postgres, Redis, CASL, JWT auth, Biome, Vitest.

Requires **Node 26.10.0** (see `.nvmrc`) and **pnpm 10.4.0**.

## Setup

```bash
nvm use
pnpm install
cp .env.example .env
docker compose up -d database redis
pnpm db
pnpm start:dev
```

API: `http://localhost:3000/api`. Copy `.env.production` as well if you run the compose `server` service.

## Scripts

```bash
pnpm start:dev      # watch
pnpm start:prod     # node dist/src/main
pnpm lint           # biome check
pnpm lint:fix       # biome check --write
pnpm test           # unit (Vitest)
pnpm test:e2e       # build then e2e against dist
pnpm test:cov
pnpm db             # drop schema, migrate, seed
pnpm migration:run
pnpm migration:generate --name=MigrationName
```

`pnpm test` only runs `src/**/*.spec.ts`. E2E is `pnpm test:e2e` (needs a running Postgres matching `.env`).

## CI/CD

Workflow: `.github/workflows/ci-cd.yml`.

- **CI** (`lint` + unit tests) on every push and pull request
- **CD** (build & push Docker image) only on push to `master` / `main`

CD uses GitHub environment **`nest-bl`**. Put Hub credentials in **Environment secrets**, not Environment variables:

| Secret | Value |
| --- | --- |
| `DOCKERHUB_USERNAME` | Docker Hub ID (not an email) |
| `DOCKERHUB_TOKEN` | Hub PAT starting with `dckr_pat_` |

Create a token: [https://app.docker.com/settings/personal-access-tokens](https://app.docker.com/settings/personal-access-tokens) (Read, Write, Delete).

`${{ secrets.* }}` does not read Environment variables. If the environment secrets list is empty, Docker login will fail with `incorrect username or password`.
