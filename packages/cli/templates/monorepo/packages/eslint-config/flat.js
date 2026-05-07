import boundaries from "eslint-plugin-boundaries"
import checkFile from "eslint-plugin-check-file"

/**
 * Flat arch ESLint configuration.
 *
 * FSD 의 슬라이스 boundaries 대신 flat 구조 (`lib/`, `components/`, `app/`) 의
 * 단순한 의존 방향을 강제한다:
 *
 *   - `lib/` — 다른 lib 만 import (UI 모름)
 *   - `components/` — components / lib 만
 *   - `app/` — components / lib 만 (Next.js routes)
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const flatConfig = [
  // ── boundaries ──
  {
    plugins: { boundaries },
    settings: {
      "import/resolver": {
        typescript: { alwaysTryTypes: true },
      },
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

  // ── check-file (flat 의 lib 는 CAMEL_CASE, components 는 PASCAL_CASE) ──
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
