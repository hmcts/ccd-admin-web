import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import mocha from "eslint-plugin-mocha";
import css from "@eslint/css";
import { defineConfig } from "eslint/config";
import tsParser from "@typescript-eslint/parser";

export default defineConfig([
  {
    ignores: [
      "**/config/*",
      "**/node_modules/*",
      "yarn.lock",
      ".yarn/**",
      "server.js",
      "yarn-audit-known-issues",
      "**/*.properties",
      "src/main/public/**"
    ],
  },
  { 
    files: ["**/*.{ts,tsx,js,jsx}"], 
    plugins: { js, mocha, tseslint }, 
    extends: [tseslint.configs.recommended, js.configs.recommended], 
    languageOptions: {
      parser: tsParser,
      parserOptions: { sourceType: 'module' },
      ecmaVersion: 2019,
      sourceType: "module",
      globals: {
            ...globals.browser,
            ...globals.node,
            ...globals.jquery,
            ...globals.mocha,
        },
    },
    rules: {
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-unused-vars": "off",
        "@typescript-eslint/no-unused-expressions": "off",
        "no-console": "error",
        "no-unassigned-vars": "off",
        "no-unused-vars": "off",
        "linebreak-style": ["error", "unix"],
        quotes: ["error", "double", { "avoidEscape": true }],
        semi: ["error", "always"],
        "comma-dangle": ["error", "always-multiline"],
        eqeqeq: "error",
        "require-yield": "off",
        "mocha/no-exclusive-tests": "error",
    }
  },
  { 
    files: ["src/**/*.scss"], 
    plugins: { css }, 
    language: "css/css", 
    extends: ["css/recommended"] 
  },
]);
