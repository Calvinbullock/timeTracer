import js from '@eslint/js';
import pluginImport from 'eslint-plugin-import';
import pluginPromise from 'eslint-plugin-promise';

export default [
  {
    files: ['**/*.js', '**/*.mjs', '**/*.cjs'], // Apply this config to all JavaScript files
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...js.globals.browser,
        ...js.globals.es2021,
        ...pluginWebextensions.environments.webextensions.globals, // Assuming a community plugin for webextensions globals
      },
    },
    plugins: {
      import: pluginImport,
      promise: pluginPromise,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...pluginImport.configs.errors.rules,
      ...pluginImport.configs.warnings.rules,
      ...pluginPromise.configs.recommended.rules,

      'no-console': 'warn',
      'no-unused-vars': 'warn',
      'eqeqeq': 'warn',
      'no-else-return': 'warn',
      'no-unreachable': 'warn',
      'indent': ['warn', 2],
      'quotes': ['warn', 'single', { 'avoidEscape': true }],
      'semi': ['warn', 'always'],
      'comma-dangle': ['warn', 'always-multiline'],
      'import/no-unresolved': 'warn',
      'import/order': ['warn', {
        'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
      }],
      'promise/always-return': 'warn',
      'promise/no-return-wrap': 'warn',
      'promise/catch-or-return': 'warn',
      'no-restricted-globals': ['error', 'event', 'name', 'length'],
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.mjs'],
        },
      },
    },
  },
];
