import { describe, expect, it } from 'bun:test';
import { loadConfig } from '#src/config.js';

const validEnv = {
  POSTGRES_HOST: 'h',
  POSTGRES_DB: 'd',
  POSTGRES_USER: 'u',
  POSTGRES_PASSWORD: 'p',
};

describe('loadConfig', () => {
  it('parses a valid env and applies defaults', () => {
    const c = loadConfig(validEnv);
    expect(c.POSTGRES_HOST).toBe('h');
    expect(c.PORT).toBe(5501);
    expect(c.NODE_ENV).toBe('development');
    expect(c.LOG_LEVEL).toBe('info');
  });

  it('freezes the returned config', () => {
    const c = loadConfig(validEnv);
    expect(Object.isFrozen(c)).toBe(true);
  });

  it('logs each error and calls exit(1) on invalid env', () => {
    const logs = [];
    let exitCode;
    const result = loadConfig(
      {},
      {
        exit: (code) => {
          exitCode = code;
        },
        log: (msg) => logs.push(msg),
      },
    );

    expect(result).toBeNull();
    expect(exitCode).toBe(1);
    expect(logs[0]).toBe('Invalid environment configuration:');
    // Four missing required fields → four error lines after the header
    expect(logs.length).toBe(5);
    expect(logs[1]).toMatch(/POSTGRES_HOST/);
  });

  it('rejects a bad LOG_LEVEL enum value', () => {
    const logs = [];
    loadConfig(
      { ...validEnv, LOG_LEVEL: 'chatty' },
      { exit: () => {}, log: (msg) => logs.push(msg) },
    );
    expect(logs.some((l) => /LOG_LEVEL/.test(l))).toBe(true);
  });
});
