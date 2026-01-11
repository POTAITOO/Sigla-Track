// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    rules: {
      'no-unescaped-entities': 'off', // Allow unescaped quotes in JSX
      'jsx-a11y/quotes': 'off', // Disable JSX quote escaping requirement
    },
  },
]);
