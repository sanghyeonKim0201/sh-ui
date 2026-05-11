import boundaries from "eslint-plugin-boundaries"
import checkFile from "eslint-plugin-check-file"

/**
 * MES (Backoffice) ESLint configuration.
 *
 * 페이지 격리 + 단방향 의존을 강제:
 *
 *   - `src/lib/*` — lib 끼리만 (UI/페이지 모름)
 *   - `src/hooks/*` — hooks / lib 만
 *   - `src/components/*` — components / hooks / lib 만
 *   - `src/pages/*` — components / hooks / lib 만. **다른 페이지 import 금지** (격리)
 *   - `app/` — pages / components / hooks / lib 모두 OK (한 줄 위임)
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const mesConfig = [
  // ── boundaries ──
  {
    plugins: { boundaries },
    settings: {
      "import/resolver": {
        typescript: { alwaysTryTypes: true },
      },
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

  // ── check-file (MES 는 .tsx PASCAL, .ts CAMEL) ──
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
