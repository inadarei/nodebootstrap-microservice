import pg from 'pg';
import { config } from '#src/config.js';

export function createPool() {
  return new pg.Pool({
    host: config.POSTGRES_HOST,
    port: config.POSTGRES_PORT,
    database: config.POSTGRES_DB,
    user: config.POSTGRES_USER,
    password: config.POSTGRES_PASSWORD,
    max: config.PG_POOL_MAX,
  });
}
