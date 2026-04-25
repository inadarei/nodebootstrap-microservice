import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Umzug } from 'umzug';
import { createPool } from '#src/db/index.js';
import { logger } from '#src/logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sqlsDir = join(__dirname, '..', 'migrations', 'sqls');

const pool = createPool();

async function runSql(filename) {
  const sql = await readFile(join(sqlsDir, filename), 'utf8');
  await pool.query(sql);
}

function fromSqlPair(name) {
  return {
    name,
    up: () => runSql(`${name}.up.sql`),
    down: () => runSql(`${name}.down.sql`),
  };
}

const umzug = new Umzug({
  migrations: [
    fromSqlPair('000-extensions'),
    fromSqlPair('001-create-users-table'),
    fromSqlPair('002-sample-user-data'),
  ],
  storage: {
    async executed({ context }) {
      await context.query(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
          name TEXT PRIMARY KEY,
          run_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);
      const { rows } = await context.query(
        'SELECT name FROM schema_migrations ORDER BY name',
      );
      return rows.map((r) => r.name);
    },
    async logMigration({ name, context }) {
      await context.query('INSERT INTO schema_migrations (name) VALUES ($1)', [name]);
    },
    async unlogMigration({ name, context }) {
      await context.query('DELETE FROM schema_migrations WHERE name = $1', [name]);
    },
  },
  context: pool,
  logger,
});

try {
  await umzug.runAsCLI();
} finally {
  await pool.end();
}
