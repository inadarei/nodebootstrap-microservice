import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { buildTestApp } from '../support/app-factory.js';

describe('health endpoints', () => {
  let app;
  let pool;

  beforeAll(() => {
    ({ app, pool } = buildTestApp());
  });

  afterAll(async () => {
    await pool.end();
  });

  it('GET /livez returns 200 with health+json', async () => {
    const res = await request(app).get('/livez');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/health\+json/);
    expect(res.body.status).toBe('pass');
  });

  it('GET /readyz probes the database', async () => {
    const res = await request(app).get('/readyz');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('pass');
    expect(res.body.details['db:ping'].metricUnit).toBe('ms');
    expect(res.body.details['db:ping'].metricValue).toBeGreaterThanOrEqual(0);
  });

  it('GET /readyz serves a cached response on a second immediate hit', async () => {
    const first = await request(app).get('/readyz');
    const second = await request(app).get('/readyz');
    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    // Cached response returns the same metric value
    expect(second.body.details['db:ping'].metricValue).toBe(
      first.body.details['db:ping'].metricValue,
    );
  });

  it('GET / returns service identity', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.service).toBe('ms-nodebootstrap-example');
  });

  it('rejects malformed JSON with 400', async () => {
    const res = await request(app)
      .post('/users')
      .set('Content-Type', 'application/json')
      .send('{not json');
    expect(res.status).toBe(400);
    expect(res.body.errors[0]).toMatch(/json/i);
  });
});

describe('readyz on a broken pool', () => {
  it('returns 503 when the DB pool is unreachable', async () => {
    const { buildApp } = await import('#src/app.js');
    const pg = (await import('pg')).default;
    const brokenPool = new pg.Pool({
      host: '127.0.0.1',
      port: 1, // nothing listens here
      database: 'x',
      user: 'x',
      password: 'x',
      connectionTimeoutMillis: 500,
    });
    const app = buildApp({ pool: brokenPool });
    const res = await request(app).get('/readyz');
    expect(res.status).toBe(503);
    expect(res.body.status).toBe('fail');
    await brokenPool.end().catch(() => {});
  });
});
