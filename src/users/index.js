import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { usersActions } from '#src/users/actions.js';
import { validateBody } from '#src/users/validate.js';

const createUserSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  password: z
    .string()
    .min(5, 'password must be at least 5 characters')
    .regex(/\d/, 'password must contain at least one number'),
});

const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

export function usersRouter({ pool, logger }) {
  const router = Router();
  const actions = usersActions({ pool, logger });

  router.get('/', actions.getUsers);
  router.post('/', writeLimiter, validateBody(createUserSchema), actions.addUser);

  return router;
}
