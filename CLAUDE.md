# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

All development happens through Docker containers. Use Make targets:

```bash
make                  # Start containers (default)
make stop             # Stop containers
make clean            # Stop, rebuild, and restart (full clean rebuild)
make test             # Start containers and run tests
make test-exec        # Execute tests only (assumes containers running)
make lint-fix         # Run ESLint with --fix flag
make shell            # Shell into the container
make logs             # Follow service logs
make ps               # Check container health status
```

**Package management:**
```bash
make add package=<name>      # Add production dependency
make add-dev package=<name>  # Add dev dependency
```

**Database migrations:**
```bash
make migration-create        # Create new migration
make migrate                 # Run pending migrations
```

**Running a single test:** Shell into container (`make shell`), then run `npx mocha test/path/to/test.js`

## Architecture

This is a containerized Node.js 24 / Express 5 microservice with MySQL, following a modular "mini-app" pattern.

**Entry points:**
- `server.js` - Application entry point, sets up Express 5 body parsing and HTTP server
- `appConfig.js` - Route mounting and middleware setup (helmet, health checks, error handling)

**Module structure** (`/lib/<feature>/`):
Each feature is a self-contained Express mini-app:
```
lib/users/
├── index.js              # Module export (routes)
├── controllers/
│   ├── actions.js        # Request handlers (async/await)
│   └── mappings.js       # Route definitions
└── models/
    └── users.js          # Database queries (class-based)
```

**Key modules:**
- `lib/datastore/` - MySQL connection pool (promise-mysql)
- `lib/healthchecks-advanced/` - Database health checks (maikai library)
- `lib/homedoc/` - Root endpoint

**Configuration:** Uses `config` package with environment-aware YAML files in `/config/`. Environment variables override via `custom-environment-variables.yml`.

**Service runs on port 5501** (localhost:5501)

## Testing

- Tests in `/test/acceptance/` (HTTP endpoints) and `/test/models/` (unit tests)
- Framework: Mocha + Chai + Supertest + Sinon
- Test server factory: `test/support/server.js` provides `server.beforeEach(app, callback)`
- Coverage requirements: 80% lines, 55% statements/functions/branches

## Code Patterns

- Express 5 with built-in body parsing (`express.json()`, `express.urlencoded()`)
- Async/await for all database and async operations (Express 5 auto-catches rejected promises)
- Centralized error handling in `appConfig.js` (validation errors return 400, server errors return 500)
- HAL+JSON responses via `kokua` representor
- Helmet middleware for security headers
- Database migrations via db-migrate with SQL files in `/migrations/sqls/`
