/**
 * vanilla-extract 자동 변환 검증 — 모든 styles.css.ts 파일이 정상 import 되는지.
 *
 * `style()` 호출은 vanilla-extract 빌드 플러그인 없이도 런타임에서 동작 (단순 문자열 반환).
 * 다만 import 자체가 실패하거나 type 가 깨졌으면 vitest 가 잡는다.
 *
 * 새 변종 추가 시: `glob` 패턴으로 자동 발견되므로 별도 추가 불필요.
 */
import { describe, it, expect } from "vitest";
import { existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const COMPONENTS_DIR = resolve(__dirname, "..");

const components = readdirSync(COMPONENTS_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory() && d.name !== "_smoke")
  .map((d) => d.name)
  .filter((name) => existsSync(resolve(COMPONENTS_DIR, name, "styles.css.ts")));

describe("vanilla-extract — styles.css.ts 모듈 무결성", () => {
  for (const name of components) {
    it(`${name} loads without error`, async () => {
      const mod = await import(`../${name}/styles.css.ts`);
      const exports = Object.keys(mod).filter((k) => k !== "default");
      expect(exports.length).toBeGreaterThan(0);
      // 각 export 가 string (vanilla-extract style 함수 반환값) 또는 byKey 같은 record
      for (const key of exports) {
        const val = mod[key];
        expect(typeof val === "string" || typeof val === "object").toBe(true);
      }
    });
  }
});
