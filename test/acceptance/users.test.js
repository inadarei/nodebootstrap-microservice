import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { buildTestApp } from '../support/app-factory.js';

describe('users endpoints', () => {
  let app;
  let pool;

  beforeAll(() => {
    ({ app, pool } = buildTestApp());
  });

  afterAll(async () => {
    await pool.end();
  });

  beforeEach(async () => {
    await pool.query(
      `DELETE FROM users
        WHERE email NOT IN (
          'first@example.com','second@example.com','kris@example.co',
          'jack@example.co.uk','molly@example.ca'
        )`,
    );
  });

  it('GET /users returns the seeded users', async () => {
    const res = await request(app).get('/users');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(Array.isArray(res.body.users)).toBe(true);
    expect(res.body.users.length).toBeGreaterThanOrEqual(5);
    const emails = res.body.users.map((u) => u.email);
    expect(emails).toContain('first@example.com');
  });

  it('POST /users rejects missing email', async () => {
    const res = await request(app).post('/users').send({ password: 'abc12' });
    expect(res.status).toBe(400);
    expect(res.body.errors[0]).toMatch(/email/);
  });

  it('POST /users rejects weak passwords', async () => {
    const res = await request(app)
      .post('/users')
      .send({ email: 'weak@example.com', password: 'abcde' });
    expect(res.status).toBe(400);
    expect(res.body.errors[0]).toMatch(/password/);
  });

  it('POST /users creates a new user and returns 201', async () => {
    const email = `new-${Date.now()}@example.com`;
    const res = await request(app).post('/users').send({ email, password: 'strong1' });
    expect(res.status).toBe(201);
    expect(res.body.email).toBe(email);
    expect(res.body.uuid).toMatch(/^[0-9a-f-]{36}$/);
    expect(res.body).not.toHaveProperty('password_hash');
  });

  it('POST /users returns 409 on duplicate email', async () => {
    const email = `dup-${Date.now()}@example.com`;
    const body = { email, password: 'strong1' };
    await request(app).post('/users').send(body).expect(201);
    const res = await request(app).post('/users').send(body);
    expect(res.status).toBe(409);
  });

  it('POST /users returns 500 when the DB is unreachable', async () => {
    const { buildApp } = await import('#src/app.js');
    const pg = (await import('pg')).default;
    const brokenPool = new pg.Pool({
      host: '127.0.0.1',
      port: 1,
      database: 'x',
      user: 'x',
      password: 'x',
      connectionTimeoutMillis: 500,
    });
    const brokenApp = buildApp({ pool: brokenPool });
    const res = await request(brokenApp)
      .post('/users')
      .send({ email: `err-${Date.now()}@example.com`, password: 'strong1' });
    expect(res.status).toBe(500);
    await brokenPool.end().catch(() => {});
  });
});
