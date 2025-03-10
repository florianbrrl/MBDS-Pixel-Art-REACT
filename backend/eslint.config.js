import tsparser from '@typescript-eslint/parser';
import tseslint from '@typescript-eslint/eslint-plugin';
import prettier from 'eslint-plugin-prettier';
import security from 'eslint-plugin-security';
import node from 'eslint-plugin-node';
import importPlugin from 'eslint-plugin-import';

export default [
  {
    files: ['**/*.{ts,js}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      prettier,
      security,
      node,
      import: importPlugin,
    },
    rules: {
      // Basic ESLint rules
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'eqeqeq': ['error', 'always'],
      'no-magic-numbers': ['warn', { ignore: [0, 1, -1] }],

      // Prettier integration
      'prettier/prettier': ['error', {
        singleQuote: true,
        tabWidth: 4,
        useTabs: true,
        semi: true,
        printWidth: 100,
        trailingComma: 'es5',
      }],

      // Security
      'security/detect-object-injection': 'warn',
      'security/detect-non-literal-regexp': 'warn',
      'security/detect-unsafe-regex': 'error',
      'security/detect-buffer-noassert': 'error',
      'security/detect-eval-with-expression': 'error',
      'security/detect-no-csrf-before-method-override': 'error',
      'security/detect-pseudo-random-bytes': 'error',
    },
    ignores: [
      'node_modules/**',
      'dist/**',
      'coverage/**',
      '.git/**',
    ],
  },
];