import express from 'express';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { logger } from '#src/logger.js';
import { healthRouter } from '#src/health/index.js';
import { usersRouter } from '#src/users/index.js';

// import './telemetry.js';
// To enable distributed tracing, create src/telemetry.js with
// OpenTelemetry auto-instrumentations and uncomment the import above.

const BODY_LIMIT = '50mb';

export function buildApp({ pool }) {
  const app = express();

  app.use(pinoHttp({ logger }));
  app.use(helmet());

  app.use(express.json({ limit: BODY_LIMIT }));
  app.use(express.json({ type: 'application/*+json', limit: BODY_LIMIT }));
  app.use(express.urlencoded({ extended: true, limit: BODY_LIMIT }));

  app.use(healthRouter({ pool }));
  app.get('/', (_req, res) =>
    res.status(200).json({ service: 'ms-nodebootstrap-example' }),
  );
  app.use('/users', usersRouter({ pool, logger }));

  // Centralized error handler
  app.use((err, req, res, _next) => {
    if (err?.type === 'entity.parse.failed') {
      return res.status(400).json({ errors: ['invalid JSON body'] });
    }
    req.log?.error({ err }, 'unhandled error');
    const message =
      process.env.NODE_ENV === 'production' ? 'internal server error' : err.message;
    res.status(500).json({ errors: [message] });
  });

  return app;
}
