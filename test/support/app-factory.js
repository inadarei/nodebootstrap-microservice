import { buildApp } from '#src/app.js';
import { createPool } from '#src/db/index.js';

export function buildTestApp() {
  const pool = createPool();
  const app = buildApp({ pool });
  return { app, pool };
}
