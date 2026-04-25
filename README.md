# nodebootstrap-microservice

A modern, opinionated skeleton for a containerized Node.js microservice.

**Use this repo as a starting point** — clone it, rename it, replace the `users`
example feature with your own, and you have a production-ready service with
health checks, structured logging, config validation, migrations, and tests
already wired up.

## Stack

- **Bun 1.x** (ESM throughout, `bun --watch`, auto-loads `.env`)
- **Express 5** with `helmet`, `pino-http`, `express-rate-limit`
- **PostgreSQL 17** via `pg` (pooled) with `umzug` for migrations
- **`zod`** for runtime env + request validation
- **`pino`** for structured logging
- **`node:crypto` scrypt** for password hashing
- **`bun:test`** for tests, **`supertest`** for HTTP assertions
- **ESLint 9** (flat config, `neostandard`) + **Prettier**
- **Docker Compose v2** with `compose watch` for live sync

## Prerequisites

- Docker (or Podman) + Docker Compose v2 (the `docker compose` plugin)
- Make (optional — shortcut for the compose commands)
- [Bun](https://bun.com/docs/installation) ≥ 1.1 if you want to run anything outside containers (`make dev`, host-side `make test`)

## Quickstart

```bash
cp .env.example .env
make            # boots app + postgres; runs migrations automatically
make logs       # tail app logs
make test       # run the bun:test suite against the live container
make stop       # tear down
```

Service listens on `http://localhost:5501`.

## Endpoints in the example

| Method | Path      | Purpose                                      |
| ------ | --------- | -------------------------------------------- |
| GET    | `/`       | Trivial root document                        |
| GET    | `/livez`  | Kubernetes liveness probe                    |
| GET    | `/readyz` | Readiness probe (cached Postgres ping, 10s)  |
| GET    | `/users`  | List users                                   |
| POST   | `/users`  | Create a user (zod-validated, scrypt-hashed) |

## Common tasks

```bash
# Live-reload source changes into the running container
make watch

# Add a dependency inside the container
make add package=some-lib
make add-dev package=some-dev-lib

# Run migrations
make migrate
make migrate-down

# Lint / format
make lint
make lint-fix
make format

# Coverage report (thresholds: 80/80/80/70)
make test-coverage

# Open a shell in the app container
make shell
```

## Architecture

```
src/
├── server.js         # entry — creates http server + graceful shutdown
├── app.js            # buildApp({ pool }) factory — single source of wiring
├── config.js         # zod-validated env schema, frozen config object
├── logger.js         # pino logger (pino-pretty in dev)
├── migrate.js        # umzug CLI runner for migrations/sqls/*.sql
├── db/               # pg Pool factory
├── health/           # /livez + /readyz routes
└── users/            # example feature mini-app
    ├── index.js      # router + rate limiter + zod validation middleware
    ├── actions.js    # request handlers
    ├── model.js      # data access (class-based, injected pool)
    └── validate.js   # zod → express middleware adapter
```

**Mini-app pattern.** Each feature is a self-contained Express Router exported
from its `index.js`. `src/app.js` mounts them. To add a feature, copy `users/`,
rename it, and wire it in `app.js`.

**Dependency injection.** The `pool` and `logger` are created once in
`server.js` and handed to `buildApp()`, which passes them down to routers that
need them. Nothing is a module-global — tests can build their own app.

**Config.** All environment variables flow through a zod schema in
`src/config.js`. Invalid or missing env vars fail the process at startup with
a clear error.

**Migrations.** SQL files live in `migrations/sqls/*.{up,down}.sql` and are
tracked in a `schema_migrations` table. Run `bun run migrate` to apply them
(the container does this automatically on startup).

**Health probes.** Two endpoints by Kubernetes convention:

- `/livez` — is the process alive? (always 200 if the event loop is)
- `/readyz` — can it serve traffic? (pings DB; cached 10s to avoid hammering)

**Observability hook.** `src/app.js` has a commented-out `import './telemetry.js'`
placeholder. Add OpenTelemetry auto-instrumentations when you need tracing; the
rest of the code is already structured-logging-ready.

## License

MIT
