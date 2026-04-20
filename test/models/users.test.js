import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createPool } from '#src/db/index.js';
import { UsersModel } from '#src/users/model.js';

describe('UsersModel (integration)', () => {
  let pool;
  let model;

  beforeAll(() => {
    pool = createPool();
    model = new UsersModel({ pool });
  });

  afterAll(async () => {
    await pool.end();
  });

  it('list() returns seeded users', async () => {
    const users = await model.list();
    expect(users.length).toBeGreaterThan(0);
    expect(users[0]).toHaveProperty('email');
    expect(users[0]).toHaveProperty('uuid');
  });

  it('create() inserts a user and hashes the password', async () => {
    const email = `model-${Date.now()}@example.com`;
    const created = await model.create({ email, password: 'strong1' });
    expect(created.email).toBe(email);
    expect(created.uuid).toMatch(/^[0-9a-f-]{36}$/);

    const found = await model.findByEmail(email);
    expect(found).not.toBeNull();
    expect(found.password_hash).not.toBe('strong1');
    expect(found.password_hash).toMatch(/^scrypt\$[0-9a-f]+\$[0-9a-f]+$/);

    await pool.query('DELETE FROM users WHERE email = $1', [email]);
  });

  it('findByEmail() returns null for an unknown email', async () => {
    const found = await model.findByEmail(`missing-${Date.now()}@example.com`);
    expect(found).toBeNull();
  });
});
