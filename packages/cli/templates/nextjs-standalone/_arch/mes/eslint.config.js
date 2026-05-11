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

  // ── MES-arch boundaries ──
  // 페이지 격리 + 단방향 의존:
  //   - 각 `src/pages/<name>/` 는 자기완결 — 다른 페이지 import 금지
  //   - 페이지/공용 컴포넌트는 hooks/lib 사용 OK, 반대 방향은 X
  //   - app 라우트는 페이지/공용 모두 import 가능 (한 줄 위임)
  {
    plugins: { boundaries },
    settings: {
      "boundaries/elements": [
        { type: "lib", pattern: ["src/lib/*"], mode: "folder" },
        { type: "hooks", pattern: ["src/hooks"], mode: "folder" },
        { type: "components", pattern: ["src/components/*"], mode: "folder" },
        { type: "pages", pattern: ["src/pages/*"], mode: "folder" },
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
            { from: "app", allow: ["pages", "components", "hooks", "lib"] },
            // pages 끼리는 import 금지 — 페이지 격리 원칙
            { from: "pages", allow: ["components", "hooks", "lib"] },
            { from: "components", allow: ["components", "hooks", "lib"] },
            { from: "hooks", allow: ["hooks", "lib"] },
            { from: "lib", allow: ["lib"] },
          ],
        },
      ],
    },
  },

  // ── File naming ──
  // .tsx = PASCAL_CASE (컴포넌트), .ts = CAMEL_CASE (유틸/스키마/훅)
  {
    plugins: { "check-file": checkFile },
    rules: {
      "check-file/filename-naming-convention": [
        "error",
        {
          "**/components/**/*.tsx": "PASCAL_CASE",
          "**/pages/**/components/**/*.tsx": "PASCAL_CASE",
          "**/lib/**/*.ts": "CAMEL_CASE",
          "**/hooks/**/*.ts": "CAMEL_CASE",
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
      // MES 페이지 concern 파일들
      "**/pages/**/api.ts", "**/pages/**/schema.ts",
      "**/pages/**/columns.ts", "**/pages/**/hooks.ts",
    ],
    rules: {
      "check-file/filename-naming-convention": "off",
    },
  },
]
