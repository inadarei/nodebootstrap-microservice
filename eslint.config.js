import neostandard from 'neostandard';

export default [
  {
    ignores: ['node_modules/**', 'coverage/**', 'docs/**', '.nyc_output/**'],
  },
  ...neostandard({
    semi: true,
    noStyle: true,
  }),
  {
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        process: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        performance: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'warn',
    },
  },
  {
    files: ['test/**/*.js'],
    rules: {
      'no-console': 'off',
    },
  },
];
