// Populate required env vars for tests if the user hasn't exported them.
// Individual tests still assume a live Postgres reachable at these coords
// (the containerized DB from compose.yaml, or a locally-run equivalent).
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'silent';
process.env.POSTGRES_HOST ??= 'localhost';
process.env.POSTGRES_PORT ??= '5432';
process.env.POSTGRES_DB ??= 'microservices_demo';
process.env.POSTGRES_USER ??= 'microservices_demo';
process.env.POSTGRES_PASSWORD ??= 'microservices_demo_pw';
process.env.PG_POOL_MAX ??= '5';
process.env.BCRYPT_ROUNDS ??= '4';
process.env.PORT ??= '5501';
