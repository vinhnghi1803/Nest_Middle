import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';
import * as prettierPlugin from 'eslint-plugin-prettier';

export default defineConfig([
  {
    ignores: ['dist/**/*', 'node_modules/**/*'],
  },
  {
    files: ['**/*.{js,ts}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: globals.node,
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      prettier: prettierPlugin.default ?? prettierPlugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
      semi: ['error', 'always'],
      quotes: ['error', 'single'],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    files: ['**/*.spec.ts', '**/*.test.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
  },
]);
