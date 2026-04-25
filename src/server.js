import { createServer } from 'node:http';
import { config } from '#src/config.js';
import { logger } from '#src/logger.js';
import { createPool } from '#src/db/index.js';
import { buildApp } from '#src/app.js';

const pool = createPool();
const app = buildApp({ pool });
const server = createServer(app);

server.listen(config.PORT, () => {
  logger.info({ port: config.PORT }, 'server listening');
});

const SHUTDOWN_TIMEOUT_MS = 10_000;
let shuttingDown = false;

async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ signal }, 'shutdown initiated');

  const forceExit = setTimeout(() => {
    logger.error('shutdown timed out, forcing exit');
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);
  forceExit.unref();

  server.close(async (err) => {
    if (err) logger.error({ err }, 'error closing http server');
    try {
      await pool.end();
      logger.info('shutdown complete');
      process.exit(0);
    } catch (poolErr) {
      logger.error({ err: poolErr }, 'error closing db pool');
      process.exit(1);
    }
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'unhandled promise rejection');
});
