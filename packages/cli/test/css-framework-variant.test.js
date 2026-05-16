import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "fs-extra";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";

vi.mock("@inquirer/prompts", () => ({
  input: vi.fn(),
  select: vi.fn(),
  checkbox: vi.fn(),
  confirm: vi.fn(),
}));

import { createProject } from "../src/create/generator.js";

let tmpDir;
let origCwd;

beforeEach(async () => {
  process.stdin.isTTY = true;
  tmpDir = path.join(os.tmpdir(), `sh-ui-cssvar-${crypto.randomUUID()}`);
  await fs.ensureDir(tmpDir);
  origCwd = process.cwd();
  process.chdir(tmpDir);
});

afterEach(async () => {
  process.chdir(origCwd);
  await fs.remove(tmpDir);
});

/**
 * Phase 3 회귀 가드 — cssFramework 옵션이 base 파일들을 진짜로 분기 emit 하는지 검증.
 * 'tailwind' 가 default. 'plain' / 'css-modules' 시 Tailwind 의존이 사라지고
 * 페이지 / 스타일 파일이 변종으로 교체되어야 함.
 */
describe("Phase 3 — cssFramework 별 base 파일 분기 emit", () => {
  describe("--css plain (standalone fsd, no plugins)", () => {
    let dir;

    beforeEach(async () => {
      await createProject({
        name: "plain-app",
        platform: "next",
        structure: "standalone",
        arch: "fsd",
        css: "plain",
        plugins: [],
        yes: true,
      });
      dir = path.join(tmpDir, "plain-app");
    });

    it("package.json 에서 tailwindcss / @tailwindcss/postcss / prettier-plugin-tailwindcss 모두 제거", async () => {
      const pkg = await fs.readJson(path.join(dir, "package.json"));
      const all = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
      expect(all["tailwindcss"]).toBeUndefined();
      expect(all["@tailwindcss/postcss"]).toBeUndefined();
      expect(all["prettier-plugin-tailwindcss"]).toBeUndefined();
    });

    it("postcss.config.mjs 가 빈 plugins", async () => {
      const c = await fs.readFile(path.join(dir, "postcss.config.mjs"), "utf-8");
      expect(c).not.toContain("@tailwindcss/postcss");
      expect(c).toMatch(/plugins:\s*\{\s*\}/);
    });

    it("globals.css 가 @import 'tailwindcss' 없음", async () => {
      const c = await fs.readFile(path.join(dir, "app/globals.css"), "utf-8");
      expect(c).not.toContain("@import 'tailwindcss'");
      expect(c).toMatch(/tokens\.css/);
    });

    it("page.tsx 가 inline style 사용 — Tailwind 클래스 없음", async () => {
      const c = await fs.readFile(path.join(dir, "app/page.tsx"), "utf-8");
      expect(c).not.toMatch(/className=['"]flex/);
      expect(c).toMatch(/style=\{\{/);
    });

    it(".prettierrc 에서 prettier-plugin-tailwindcss 제거", async () => {
      const c = await fs.readJson(path.join(dir, ".prettierrc"));
      expect(c.plugins).toBeUndefined();
    });
  });

  describe("--css css-modules (standalone fsd, no plugins)", () => {
    let dir;

    beforeEach(async () => {
      await createProject({
        name: "cm-app",
        platform: "next",
        structure: "standalone",
        arch: "fsd",
        css: "css-modules",
        plugins: [],
        yes: true,
      });
      dir = path.join(tmpDir, "cm-app");
    });

    it("page.tsx 가 styles import + page.module.css 가 같이 emit", async () => {
      const tsx = await fs.readFile(path.join(dir, "app/page.tsx"), "utf-8");
      expect(tsx).toContain("import styles from './page.module.css'");
      expect(tsx).toContain("className={styles.main}");
      expect(await fs.pathExists(path.join(dir, "app/page.module.css"))).toBe(true);
      const css = await fs.readFile(path.join(dir, "app/page.module.css"), "utf-8");
      expect(css).toContain(".main");
      expect(css).toContain(".title");
    });

    it("Tailwind 의존성 / globals.css 의 tailwindcss 모두 제거", async () => {
      const pkg = await fs.readJson(path.join(dir, "package.json"));
      const all = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
      expect(all["tailwindcss"]).toBeUndefined();
      expect(all["@tailwindcss/postcss"]).toBeUndefined();
      const globals = await fs.readFile(path.join(dir, "app/globals.css"), "utf-8");
      expect(globals).not.toContain("@import 'tailwindcss'");
    });
  });

  describe("--css tailwind (default) — 베이스 그대로 유지", () => {
    let dir;

    beforeEach(async () => {
      await createProject({
        name: "tw-app",
        platform: "next",
        structure: "standalone",
        arch: "fsd",
        css: "tailwind",
        plugins: [],
        yes: true,
      });
      dir = path.join(tmpDir, "tw-app");
    });

    it("tailwindcss / @tailwindcss/postcss 가 그대로 있음", async () => {
      const pkg = await fs.readJson(path.join(dir, "package.json"));
      const all = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
      expect(all["tailwindcss"]).toBeDefined();
      expect(all["@tailwindcss/postcss"]).toBeDefined();
    });

    it("globals.css 가 @import 'tailwindcss' 보존", async () => {
      const c = await fs.readFile(path.join(dir, "app/globals.css"), "utf-8");
      expect(c).toContain("@import 'tailwindcss'");
    });

    it("page.tsx 가 Tailwind 클래스 보존", async () => {
      const c = await fs.readFile(path.join(dir, "app/page.tsx"), "utf-8");
      expect(c).toMatch(/className=['"]flex/);
    });
  });

  describe("--css plain (monorepo) — root .prettierrc + root pkg 도 정리", () => {
    let dir;

    beforeEach(async () => {
      await createProject({
        name: "mono-plain",
        platform: "next",
        structure: "monorepo",
        arch: "fsd",
        css: "plain",
        plugins: [],
        yes: true,
      });
      dir = path.join(tmpDir, "mono-plain");
    });

    it("root .prettierrc 의 prettier-plugin-tailwindcss 제거", async () => {
      const rc = await fs.readJson(path.join(dir, ".prettierrc"));
      expect(rc.plugins).toBeUndefined();
    });

    it("root package.json 의 prettier-plugin-tailwindcss devDep 제거", async () => {
      const pkg = await fs.readJson(path.join(dir, "package.json"));
      expect(pkg.devDependencies?.["prettier-plugin-tailwindcss"]).toBeUndefined();
    });

    it("apps/web/package.json 도 tailwind 제거", async () => {
      const pkg = await fs.readJson(path.join(dir, "apps/web/package.json"));
      const all = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
      expect(all["tailwindcss"]).toBeUndefined();
      expect(all["@tailwindcss/postcss"]).toBeUndefined();
    });

    it("ui-web 패키지의 tailwindcss 도 제거", async () => {
      const pkg = await fs.readJson(
        path.join(dir, "packages/ui/ui-apps/ui-web/package.json"),
      );
      const all = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
      expect(all["tailwindcss"]).toBeUndefined();
      expect(all["@tailwindcss/postcss"]).toBeUndefined();
    });
  });
});

/**
 * Phase 2 회귀 가드 — i18n hook + error code mapping 이 next-intl 활성 시 emit.
 */
describe("Phase 2 — next-intl + i18n hooks / error mapping", () => {
  it("next-intl 활성 시 useFormatDate / useFormatPrice hook 이 emit", async () => {
    await createProject({
      name: "intl-hooks",
      platform: "next",
      structure: "standalone",
      arch: "fsd",
      css: "tailwind",
      plugins: ["next-intl"],
      yes: true,
    });
    const dir = path.join(tmpDir, "intl-hooks");
    expect(await fs.pathExists(path.join(dir, "src/shared/hooks/useFormatDate.ts"))).toBe(true);
    expect(await fs.pathExists(path.join(dir, "src/shared/hooks/useFormatPrice.ts"))).toBe(true);
    const ufd = await fs.readFile(path.join(dir, "src/shared/hooks/useFormatDate.ts"), "utf-8");
    expect(ufd).toContain("useLocale");
    expect(ufd).toContain("formatDate");
  });

  it("next-intl 비활성 시엔 hook 파일 emit 안 됨 (util 만)", async () => {
    await createProject({
      name: "no-intl",
      platform: "next",
      structure: "standalone",
      arch: "fsd",
      css: "tailwind",
      plugins: [],
      yes: true,
    });
    const dir = path.join(tmpDir, "no-intl");
    expect(await fs.pathExists(path.join(dir, "src/shared/hooks/useFormatDate.ts"))).toBe(false);
    expect(await fs.pathExists(path.join(dir, "src/shared/lib/formatDate.ts"))).toBe(true);
  });

  it("errorMessages.ts 가 항상 emit + resolveErrorMessage export", async () => {
    await createProject({
      name: "err-map",
      platform: "next",
      structure: "standalone",
      arch: "fsd",
      css: "tailwind",
      plugins: [],
      yes: true,
    });
    const dir = path.join(tmpDir, "err-map");
    const errPath = path.join(dir, "src/shared/api/errorMessages.ts");
    expect(await fs.pathExists(errPath)).toBe(true);
    const c = await fs.readFile(errPath, "utf-8");
    expect(c).toContain("export const ERROR_MESSAGES");
    expect(c).toContain("resolveErrorMessage");
  });

  it("useAppMutation 이 resolveErrorMessage 사용", async () => {
    await createProject({
      name: "uam",
      platform: "next",
      structure: "standalone",
      arch: "fsd",
      css: "tailwind",
      plugins: [],
      yes: true,
    });
    const dir = path.join(tmpDir, "uam");
    const c = await fs.readFile(
      path.join(dir, "src/shared/hooks/useAppMutation.ts"),
      "utf-8",
    );
    expect(c).toContain("resolveErrorMessage");
    expect(c).toContain("from '@/src/shared/api/errorMessages'");
  });
});

/**
 * Phase 1 회귀 가드 — 작은 정리 fix 들이 회귀하지 않도록.
 */
describe("Phase 1 — 정리 fix 회귀 가드", () => {
  it("monorepo 에 .eslintrc.js (legacy) 가 없음", async () => {
    await createProject({
      name: "mono",
      platform: "next",
      structure: "monorepo",
      arch: "fsd",
      css: "tailwind",
      plugins: [],
      yes: true,
    });
    const dir = path.join(tmpDir, "mono");
    expect(await fs.pathExists(path.join(dir, ".eslintrc.js"))).toBe(false);
  });

  it("Flutter sh-ui.config.json 에 cssFramework 필드 없음", async () => {
    await createProject({ name: "fl", platform: "flutter", yes: true });
    const cfg = await fs.readJson(path.join(tmpDir, "fl/sh-ui.config.json"));
    expect(cfg.cssFramework).toBeUndefined();
    expect(cfg.platform).toBe("flutter");
  });

  it("clientFetch 가 locale-blind regex 사용 (loop 방지)", async () => {
    await createProject({
      name: "cf",
      platform: "next",
      structure: "standalone",
      arch: "fsd",
      css: "tailwind",
      plugins: [],
      yes: true,
    });
    const c = await fs.readFile(
      path.join(tmpDir, "cf/src/shared/api/clientFetch.ts"),
      "utf-8",
    );
    expect(c).toMatch(/\\\/sign-in\(.*\$\)|\/sign-in\(\\\/\|\$\)/);
    expect(c).not.toMatch(/startsWith\('\/sign-in'\)/);
  });

  it("getQueryClient 가 named export (default 아님)", async () => {
    await createProject({
      name: "gqc",
      platform: "next",
      structure: "standalone",
      arch: "fsd",
      css: "tailwind",
      plugins: [],
      yes: true,
    });
    const c = await fs.readFile(
      path.join(tmpDir, "gqc/src/shared/lib/getQueryClient.ts"),
      "utf-8",
    );
    expect(c).toMatch(/^export function getQueryClient/m);
    expect(c).not.toMatch(/export default function getQueryClient/);
  });

  it("package.json deps 가 알파벳 정렬 (next-intl 도 sort 후 자기 위치)", async () => {
    await createProject({
      name: "sorted",
      platform: "next",
      structure: "standalone",
      arch: "fsd",
      css: "tailwind",
      plugins: ["next-intl"],
      yes: true,
    });
    const pkg = await fs.readJson(path.join(tmpDir, "sorted/package.json"));
    const depKeys = Object.keys(pkg.dependencies ?? {});
    const sorted = [...depKeys].sort((a, b) => a.localeCompare(b));
    expect(depKeys).toEqual(sorted);
  });
});
