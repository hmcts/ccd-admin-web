const js = require('@eslint/js');
const mochaPlugin = require('eslint-plugin-mocha');
const mocha = mochaPlugin.default || mochaPlugin;

const browserGlobals = {
  document: 'readonly',
  navigator: 'readonly',
  window: 'readonly'
};

const jqueryGlobals = {
  $: 'readonly',
  jQuery: 'readonly'
};

const mochaGlobals = {
  after: 'readonly',
  afterEach: 'readonly',
  before: 'readonly',
  beforeEach: 'readonly',
  describe: 'readonly',
  it: 'readonly'
};

const nodeGlobals = {
  __dirname: 'readonly',
  Buffer: 'readonly',
  console: 'readonly',
  exports: 'readonly',
  module: 'readonly',
  process: 'readonly',
  require: 'readonly',
  setTimeout: 'readonly'
};

module.exports = [
  {
    ignores: [
      'coverage/**',
      'lib/**',
      'mochawesome-report/**',
      'node_modules/**',
      'src/main/public/**'
    ]
  },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2017,
      sourceType: 'module',
      globals: {
        ...browserGlobals,
        ...jqueryGlobals,
        ...mochaGlobals,
        ...nodeGlobals,
        actor: 'readonly',
        codecept_helper: 'readonly',
        Feature: 'readonly',
        Scenario: 'readonly'
      }
    },
    plugins: {
      mocha
    },
    rules: {
      'comma-dangle': ['error', 'never'],
      eqeqeq: 'error',
      'linebreak-style': ['error', 'unix'],
      'mocha/no-exclusive-tests': 'error',
      'no-console': 0,
      quotes: ['error', 'single'],
      'require-yield': 'off',
      semi: ['error', 'always']
    }
  }
];
