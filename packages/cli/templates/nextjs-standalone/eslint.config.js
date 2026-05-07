import js from "@eslint/js"
import pluginNext from "@next/eslint-plugin-next"
import eslintConfigPrettier from "eslint-config-prettier"
import boundaries from "eslint-plugin-boundaries"
import checkFile from "eslint-plugin-check-file"
import onlyWarn from "eslint-plugin-only-warn"
import pluginReact from "eslint-plugin-react"
import pluginReactHooks from "eslint-plugin-react-hooks"
import globals from "globals"
import tseslint from "typescript-eslint"

export default [
  {
    ignores: [".next/**", "dist/**", "node_modules/**"],
  },

  // ── Base ──
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    plugins: { onlyWarn },
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },

  // ── React + Next.js ──
  {
    ...pluginReact.configs.flat.recommended,
    languageOptions: {
      ...pluginReact.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.serviceworker,
      },
    },
  },
  {
    plugins: {
      "@next/next": pluginNext,
    },
    rules: {
      ...pluginNext.configs.recommended.rules,
      ...pluginNext.configs["core-web-vitals"].rules,
    },
  },
  {
    plugins: {
      "react-hooks": pluginReactHooks,
    },
    settings: { react: { version: "detect" } },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/function-component-definition": [
        "warn",
        {
          namedComponents: "function-declaration",
          unnamedComponents: "arrow-function",
        },
      ],
    },
  },

  // ── FSD boundaries ──
  {
    plugins: { boundaries },
    settings: {
      "boundaries/elements": [
        { type: "app", pattern: ["src/app"], mode: "folder" },
        { type: "shared", pattern: ["src/shared/*"], mode: "folder" },
        { type: "entity", pattern: ["src/entities/*"], mode: "folder" },
        { type: "feature", pattern: ["src/features/*"], mode: "folder" },
        { type: "widget", pattern: ["src/widgets/*"], mode: "folder" },
        { type: "view", pattern: ["src/views/*"], mode: "folder" },
      ],
      "boundaries/ignore": ["**/*.test.*", "**/*.spec.*"],
    },
    rules: {
      "boundaries/element-types": [
        "warn",
        {
          default: "disallow",
          rules: [
            { from: "app", allow: ["view", "widget", "feature", "entity", "shared"] },
            { from: "view", allow: ["widget", "feature", "entity", "shared"] },
            { from: "widget", allow: ["feature", "entity", "shared"] },
            { from: "feature", allow: ["entity", "shared"] },
            { from: "entity", allow: ["shared"] },
            { from: "shared", allow: ["shared"] },
          ],
        },
      ],
      "boundaries/entry-point": [
        "warn",
        {
          default: "disallow",
          rules: [
            { target: "shared", allow: "**" },
            { target: "app", allow: "**" },
            {
              target: ["entity", "widget", "view"],
              allow: "index.{ts,tsx}",
            },
            {
              target: ["feature"],
              allow: ["index.{ts,tsx}", "*/index.{ts,tsx}"],
            },
          ],
        },
      ],
    },
  },

  // ── File naming ──
  {
    plugins: { "check-file": checkFile },
    rules: {
      "check-file/filename-naming-convention": [
        "error",
        {
          "**/src/**/*.tsx": "PASCAL_CASE",
          "**/src/**/*.ts": "CAMEL_CASE",
        },
        { ignoreMiddleExtensions: true },
      ],
    },
  },
  {
    files: [
      "**/index.tsx", "**/index.ts",
      "**/layout.tsx", "**/page.tsx",
      "**/error.tsx", "**/not-found.tsx",
      "**/routing.ts", "**/navigation.ts", "**/request.ts",
    ],
    rules: {
      "check-file/filename-naming-convention": "off",
    },
  },

]
