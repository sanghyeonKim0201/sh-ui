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

  // ── Flat-arch boundaries ──
  // FSD 의 src/* 슬라이스 대신 flat 의 lib/components/app 의존 방향만 강제.
  {
    plugins: { boundaries },
    settings: {
      "boundaries/elements": [
        { type: "lib", pattern: ["lib/*"], mode: "folder" },
        { type: "components", pattern: ["components/*"], mode: "folder" },
        { type: "app", pattern: ["app"], mode: "folder" },
      ],
      "boundaries/ignore": ["**/*.test.*", "**/*.spec.*"],
    },
    rules: {
      "boundaries/element-types": [
        "warn",
        {
          default: "disallow",
          rules: [
            { from: "app", allow: ["components", "lib"] },
            { from: "components", allow: ["components", "lib"] },
            { from: "lib", allow: ["lib"] },
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
          "**/components/**/*.tsx": "PASCAL_CASE",
          "**/lib/**/*.ts": "CAMEL_CASE",
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
