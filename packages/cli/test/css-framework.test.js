import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs-extra";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";

import { init } from "../src/init.mjs";
import { add } from "../src/add.mjs";
import {
  CSS_FRAMEWORK_DEFAULT,
  CSS_FRAMEWORKS_SUPPORTED,
  CSS_FRAMEWORKS_PLANNED,
} from "../src/constants.js";
import { buildTokens } from "../../tokens/build.mjs";

let tmpDir;

beforeEach(async () => {
  tmpDir = path.join(os.tmpdir(), `sh-ui-cssfw-${crypto.randomUUID()}`);
  await fs.ensureDir(tmpDir);
});

afterEach(async () => {
  await fs.remove(tmpDir);
});

describe("CSS framework — config 필드", () => {
  it("init --yes → config 에 cssFramework: 'plain' 기록 + style 필드 없음", async () => {
    await init({ cwd: tmpDir, args: ["--yes", "--platform", "react"] });
    const config = await fs.readJson(path.join(tmpDir, "sh-ui.config.json"));
    expect(config.cssFramework).toBe(CSS_FRAMEWORK_DEFAULT);
    expect(config.style).toBeUndefined();
  });

  it("init --cssFramework plain → 명시 값 채택", async () => {
    await init({
      cwd: tmpDir,
      args: ["--yes", "--platform", "react", "--cssFramework", "plain"],
    });
    const config = await fs.readJson(path.join(tmpDir, "sh-ui.config.json"));
    expect(config.cssFramework).toBe("plain");
  });

  it("init --cssFramework tailwind → SUPPORTED 라 정상 채택", async () => {
    await init({
      cwd: tmpDir,
      args: ["--yes", "--platform", "react", "--cssFramework", "tailwind"],
    });
    const config = await fs.readJson(path.join(tmpDir, "sh-ui.config.json"));
    expect(config.cssFramework).toBe("tailwind");
  });

  it("init --cssFramework css-modules → SUPPORTED 라 정상 채택", async () => {
    await init({
      cwd: tmpDir,
      args: ["--yes", "--platform", "react", "--cssFramework", "css-modules"],
    });
    const config = await fs.readJson(path.join(tmpDir, "sh-ui.config.json"));
    expect(config.cssFramework).toBe("css-modules");
  });

  it("init --cssFramework vanilla-extract → '곧 지원 예정' 친절 에러", async () => {
    await expect(
      init({
        cwd: tmpDir,
        args: ["--yes", "--platform", "react", "--cssFramework", "vanilla-extract"],
      }),
    ).rejects.toThrow(/곧 지원 예정/);
  });

  it("init --cssFramework garbage → 일반 enum 에러", async () => {
    await expect(
      init({
        cwd: tmpDir,
        args: ["--yes", "--platform", "react", "--cssFramework", "garbage"],
      }),
    ).rejects.toThrow(/허용되지 않습니다/);
  });
});

describe("CSS framework — buildTokens 디스패처", () => {
  const baseConfig = {
    platform: "react",
    cssFramework: "plain",
    theme: { base: "neutral", radius: "md", mode: "light" },
  };

  it("react/plain → CSS 문자열 생성 (기존 buildTokensCss 와 동등)", async () => {
    const css = await buildTokens(baseConfig);
    expect(typeof css).toBe("string");
    // tokens.css 의 시그니처 — :root 블록과 CSS custom property 가 들어감
    expect(css).toMatch(/:root/);
    expect(css).toMatch(/--/);
  });

  it("flutter/plain → Dart 문자열 생성", async () => {
    const dart = await buildTokens({ ...baseConfig, platform: "flutter" });
    expect(typeof dart).toBe("string");
    expect(dart).toMatch(/import 'package:flutter/);
  });

  it("cssFramework 미지정 → plain 으로 폴백", async () => {
    const { cssFramework: _, ...noFw } = baseConfig;
    const css = await buildTokens(noFw);
    expect(css).toMatch(/:root/);
  });

  it("react/tailwind 도 plain 과 같은 tokens.css 공유", async () => {
    const plainCss = await buildTokens({ ...baseConfig, cssFramework: "plain" });
    const tailwindCss = await buildTokens({ ...baseConfig, cssFramework: "tailwind" });
    expect(tailwindCss).toBe(plainCss);
  });

  it("react/css-modules 도 plain 과 같은 tokens.css 공유", async () => {
    const plainCss = await buildTokens({ ...baseConfig, cssFramework: "plain" });
    const moduleCss = await buildTokens({ ...baseConfig, cssFramework: "css-modules" });
    expect(moduleCss).toBe(plainCss);
  });

  it("미구현 emitter (react/vanilla-extract) → 명확한 에러", async () => {
    await expect(
      buildTokens({ ...baseConfig, cssFramework: "vanilla-extract" }),
    ).rejects.toThrow(/tokens emitter 미구현/);
  });

  it("알 수 없는 platform → 에러", async () => {
    await expect(
      buildTokens({ ...baseConfig, platform: "swift" }),
    ).rejects.toThrow(/알 수 없는 platform/);
  });
});

describe("CSS framework — Tailwind v4 @theme inline 브리지", () => {
  const baseConfig = {
    platform: "react",
    cssFramework: "plain",
    theme: { base: "neutral", radius: "md", mode: "light-dark" },
  };

  it("buildTokens 출력에 @theme inline 블록 포함", async () => {
    const css = await buildTokens(baseConfig);
    expect(css).toMatch(/@theme inline\s*\{/);
  });

  it("색 토큰이 --color-* 네임스페이스로 매핑", async () => {
    const css = await buildTokens(baseConfig);
    expect(css).toMatch(/--color-primary:\s*var\(--primary\);/);
    expect(css).toMatch(/--color-background:\s*var\(--background\);/);
    expect(css).toMatch(/--color-foreground-muted:\s*var\(--foreground-muted\);/);
  });

  it("radius 가 sm/md/lg/xl 4 단계로 expand", async () => {
    const css = await buildTokens(baseConfig);
    expect(css).toMatch(/--radius-sm:\s*calc\(var\(--radius\) - 2px\);/);
    expect(css).toMatch(/--radius-md:\s*var\(--radius\);/);
    expect(css).toMatch(/--radius-lg:\s*calc\(var\(--radius\) \+ 2px\);/);
    expect(css).toMatch(/--radius-xl:\s*calc\(var\(--radius\) \+ 4px\);/);
  });

  it("dark-only 모드에서도 @theme 블록은 light 토큰 기반으로 emit", async () => {
    const css = await buildTokens({
      ...baseConfig,
      theme: { ...baseConfig.theme, mode: "dark" },
    });
    expect(css).toMatch(/@theme inline/);
    expect(css).toMatch(/--color-primary/);
  });
});

describe("CSS framework — registry frameworks 분기 (button 파일럿)", () => {
  /** 테스트용 sh-ui.config.json + paths 셋업 */
  async function setupProject(cssFramework) {
    await fs.writeJson(path.join(tmpDir, "sh-ui.config.json"), {
      $schema: "https://your-ds.dev/sh-ui.schema.json",
      platform: "react",
      cssFramework,
      theme: { base: "neutral", radius: "md", mode: "light" },
      paths: {
        tokens: "src/styles/tokens.css",
        components: "src/components/ui",
        utils: "src/lib/utils.ts",
      },
      aliases: {
        components: "@/components",
        utils: "@/lib/utils",
        ui: "@/components/ui",
      },
    });
  }

  it("plain → index.tsx + styles.css 가 들어감 (cva 의존성 없음)", async () => {
    await setupProject("plain");
    await add({ cwd: tmpDir, names: ["button"], skipInstall: true, onConflict: "overwrite" });

    const indexPath = path.join(tmpDir, "src/components/ui/button/index.tsx");
    const stylesPath = path.join(tmpDir, "src/components/ui/button/styles.css");
    expect(await fs.pathExists(indexPath)).toBe(true);
    expect(await fs.pathExists(stylesPath)).toBe(true);

    const indexContent = await fs.readFile(indexPath, "utf8");
    expect(indexContent).toContain('import "./styles.css"');
    expect(indexContent).not.toContain("class-variance-authority");
  });

  it("tailwind → index.tailwind.tsx 가 index.tsx 자리에 들어감 + cva import", async () => {
    await setupProject("tailwind");
    await add({ cwd: tmpDir, names: ["button"], skipInstall: true, onConflict: "overwrite" });

    const indexPath = path.join(tmpDir, "src/components/ui/button/index.tsx");
    const stylesPath = path.join(tmpDir, "src/components/ui/button/styles.css");
    expect(await fs.pathExists(indexPath)).toBe(true);
    // tailwind 변종은 styles.css 가 없음
    expect(await fs.pathExists(stylesPath)).toBe(false);

    const indexContent = await fs.readFile(indexPath, "utf8");
    expect(indexContent).toContain("class-variance-authority");
    expect(indexContent).not.toContain('import "./styles.css"');
    // Tailwind utility 가 들어 있음
    expect(indexContent).toMatch(/bg-primary/);
  });

  it("css-modules → index.module.tsx + styles.module.css 가 들어감", async () => {
    await setupProject("css-modules");
    await add({ cwd: tmpDir, names: ["button"], skipInstall: true, onConflict: "overwrite" });

    const indexPath = path.join(tmpDir, "src/components/ui/button/index.tsx");
    const moduleCssPath = path.join(tmpDir, "src/components/ui/button/styles.module.css");
    const plainCssPath = path.join(tmpDir, "src/components/ui/button/styles.css");
    expect(await fs.pathExists(indexPath)).toBe(true);
    expect(await fs.pathExists(moduleCssPath)).toBe(true);
    // css-modules 변종은 plain styles.css 가 안 들어감
    expect(await fs.pathExists(plainCssPath)).toBe(false);

    const indexContent = await fs.readFile(indexPath, "utf8");
    expect(indexContent).toContain('import styles from "./styles.module.css"');
    expect(indexContent).not.toContain("class-variance-authority");
  });

  it("css-modules → cva 가 install 큐에 안 들어감", async () => {
    await setupProject("css-modules");

    const logs = [];
    const origLog = console.log;
    console.log = (...args) => logs.push(args.map(String).join(" "));
    try {
      await add({
        cwd: tmpDir,
        names: ["button"],
        skipInstall: true,
        onConflict: "overwrite",
      });
    } finally {
      console.log = origLog;
    }

    const allLogs = logs.join("\n");
    expect(allLogs).not.toContain("class-variance-authority");
  });

  it("tailwind → dependencies 분기로 cva 가 install 큐에 들어감", async () => {
    await setupProject("tailwind");

    // skipInstall=true 상태에서 console.log 캡처해 install 안내 메시지 확인
    const logs = [];
    const origLog = console.log;
    console.log = (...args) => logs.push(args.map(String).join(" "));
    try {
      await add({
        cwd: tmpDir,
        names: ["button"],
        skipInstall: true,
        onConflict: "overwrite",
      });
    } finally {
      console.log = origLog;
    }

    const allLogs = logs.join("\n");
    expect(allLogs).toContain("class-variance-authority");
  });

  it("plain → cva 가 install 큐에 안 들어감", async () => {
    await setupProject("plain");

    const logs = [];
    const origLog = console.log;
    console.log = (...args) => logs.push(args.map(String).join(" "));
    try {
      await add({
        cwd: tmpDir,
        names: ["button"],
        skipInstall: true,
        onConflict: "overwrite",
      });
    } finally {
      console.log = origLog;
    }

    const allLogs = logs.join("\n");
    expect(allLogs).not.toContain("class-variance-authority");
  });

  // v0.45.0 부터 모든 styled 컴포넌트가 tailwind 변종을 갖춰 실제 fallback 은
  // 거의 발생하지 않음. fallback 메커니즘 자체는 add.mjs::effectiveFramework 함수가
  // 담당 — 미래에 새 컴포넌트가 추가되거나 css-modules 등 다른 변종이 도입될 때 자연스럽게
  // 동작한다. 이 테스트는 fallback 회귀 시 빠르게 잡히도록 남겨 두되, 모든 컴포넌트가
  // tailwind 변종을 갖춘 현 시점에서는 plain 동작을 그대로 검증.
  it("tailwind + 모든 컴포넌트 변종 보유 → fallback 없이 utility-class 변종 설치", async () => {
    await setupProject("tailwind");
    await add({ cwd: tmpDir, names: ["calendar"], skipInstall: true, onConflict: "overwrite" });
    const indexPath = path.join(tmpDir, "src/components/ui/calendar/index.tsx");
    const stylesPath = path.join(tmpDir, "src/components/ui/calendar/styles.css");
    expect(await fs.pathExists(indexPath)).toBe(true);
    // tailwind 변종 보유 — styles.css 는 안 들어감
    expect(await fs.pathExists(stylesPath)).toBe(false);
  });
});

describe("CSS framework — 상수 무결성", () => {
  it("supported 와 planned 는 겹치지 않는다", () => {
    const overlap = CSS_FRAMEWORKS_SUPPORTED.filter((s) =>
      CSS_FRAMEWORKS_PLANNED.includes(s),
    );
    expect(overlap).toEqual([]);
  });

  it("기본값은 supported 에 포함", () => {
    expect(CSS_FRAMEWORKS_SUPPORTED).toContain(CSS_FRAMEWORK_DEFAULT);
  });
});
