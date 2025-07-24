module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['unused-imports', 'react', '@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  rules: {
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'warn',
      { 'vars': 'all', 'varsIgnorePattern': '^_', 'args': 'after-used', 'argsIgnorePattern': '^_' }
    ],
    'react/no-unescaped-entities': [
      'error',
      { forbid: ['>', '"', '}', ']'] }
    ],
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
};
