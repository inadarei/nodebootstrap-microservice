import bcrypt from 'bcrypt';
import { config } from '#src/config.js';

export class UsersModel {
  constructor({ pool }) {
    this.pool = pool;
  }

  async list() {
    const { rows } = await this.pool.query(
      'SELECT uuid, email, last_updated FROM users ORDER BY id',
    );
    return rows;
  }

  async create({ email, password }) {
    const passwordHash = await bcrypt.hash(password, config.BCRYPT_ROUNDS);
    const { rows } = await this.pool.query(
      `INSERT INTO users (email, password_hash)
       VALUES ($1, $2)
       RETURNING uuid, email, created, last_updated`,
      [email, passwordHash],
    );
    return rows[0];
  }

  async findByEmail(email) {
    const { rows } = await this.pool.query(
      'SELECT uuid, email, password_hash FROM users WHERE email = $1',
      [email],
    );
    return rows[0] ?? null;
  }
}
