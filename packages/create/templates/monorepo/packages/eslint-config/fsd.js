import boundaries from "eslint-plugin-boundaries"
import importX from "eslint-plugin-import-x"
import checkFile from "eslint-plugin-check-file"
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript"

/**
 * FSD (Feature-Sliced Design) ESLint configuration.
 * boundaries: layer import direction + public API enforcement
 * import-x: import group ordering
 * check-file: file/folder naming convention enforcement
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const fsdConfig = [
  // ── boundaries plugin ──
  {
    plugins: {
      boundaries,
    },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
        },
      },
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

  // ── check-file plugin (naming conventions) ──
  {
    plugins: {
      "check-file": checkFile,
    },
    rules: {
      "check-file/filename-naming-convention": [
        "error",
        {
          "**/src/**/*.tsx": "PASCAL_CASE",
          "**/src/**/*.ts": "CAMEL_CASE",
        },
        {
          ignoreMiddleExtensions: true,
        },
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

  // ── import-x plugin ──
  {
    plugins: {
      "import-x": importX,
    },
    settings: {
      "import-x/resolver-next": [
        createTypeScriptImportResolver({
          alwaysTryTypes: true,
        }),
      ],
    },
    rules: {
      "import-x/order": "off",
      "import-x/no-unresolved": "off",
    },
  },
]
