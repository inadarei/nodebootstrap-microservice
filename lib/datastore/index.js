import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  user:     process.env.POSTGRES_USER,
  host:     process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
});

export default {
  query:  (text, params) => pool.query(text, params),
  client: () => pool.connect()
};

