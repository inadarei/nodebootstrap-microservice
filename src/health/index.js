import { Router } from 'express';

const HEALTH_CONTENT_TYPE = 'application/health+json';
const READINESS_CACHE_MS = 10_000;

export function healthRouter({ pool }) {
  const router = Router();
  let cached = null;

  router.get('/livez', (_req, res) => {
    res.type(HEALTH_CONTENT_TYPE).status(200).json({ status: 'pass' });
  });

  router.get('/readyz', async (_req, res) => {
    if (cached && Date.now() - cached.at < READINESS_CACHE_MS) {
      return res.type(HEALTH_CONTENT_TYPE).status(cached.code).json(cached.body);
    }
    const start = performance.now();
    try {
      await pool.query('SELECT 1');
      const body = {
        status: 'pass',
        details: {
          'db:ping': {
            status: 'pass',
            metricValue: Math.round(performance.now() - start),
            metricUnit: 'ms',
          },
        },
      };
      cached = { at: Date.now(), code: 200, body };
      res.type(HEALTH_CONTENT_TYPE).status(200).json(body);
    } catch (err) {
      const body = {
        status: 'fail',
        details: {
          'db:ping': { status: 'fail', output: err.message },
        },
      };
      cached = { at: Date.now(), code: 503, body };
      res.type(HEALTH_CONTENT_TYPE).status(503).json(body);
    }
  });

  return router;
}
