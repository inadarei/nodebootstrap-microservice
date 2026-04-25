import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5501),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .default('info'),

  POSTGRES_HOST: z.string().min(1),
  POSTGRES_PORT: z.coerce.number().int().positive().default(5432),
  POSTGRES_DB: z.string().min(1),
  POSTGRES_USER: z.string().min(1),
  POSTGRES_PASSWORD: z.string().min(1),
  PG_POOL_MAX: z.coerce.number().int().positive().default(20),
});

export function loadConfig(
  env = process.env,
  { exit = process.exit, log = console.error } = {},
) {
  const parsed = schema.safeParse(env);
  if (!parsed.success) {
    log('Invalid environment configuration:');
    for (const issue of parsed.error.issues) {
      log(`  - ${issue.path.join('.')}: ${issue.message}`);
    }
    exit(1);
    return null;
  }
  return Object.freeze(parsed.data);
}

export const config = loadConfig();
