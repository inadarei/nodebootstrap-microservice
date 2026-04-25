import { UsersModel } from '#src/users/model.js';

export function usersActions({ pool, logger }) {
  const model = new UsersModel({ pool });

  return {
    async getUsers(_req, res) {
      const users = await model.list();
      res.status(200).json({ users });
    },

    async addUser(req, res) {
      try {
        const user = await model.create(req.body);
        res.status(201).json(user);
      } catch (err) {
        if (err.code === '23505') {
          // Postgres unique_violation
          return res.status(409).json({ errors: ['email already registered'] });
        }
        logger.error({ err }, 'failed to create user');
        throw err;
      }
    },
  };
}
