// `sh-ui migrate bundled` — 기존 per-component 프로젝트를 cssStrategy: bundled 로 전환.
//
// 동작:
//   1) sh-ui.config.json 의 cssStrategy 가 미설정/per-component 인지 확인.
//   2) 사용자에게 paths.cssBundle 위치 안내 (기본값 자동 결정 — paths.styles 또는
//      paths.tokens 의 디렉토리 + `sh-ui-components.css`).
//   3) paths.components 아래 모든 `<name>/styles.css` 를 읽어 bundle 에 섹션으로 누적.
//   4) 각 컴포넌트 .tsx 의 `import "./styles.css";` 라인 제거.
//   5) per-component styles.css 파일 삭제.
//   6) sh-ui.config.json 에 `cssStrategy: "bundled"` + `paths.cssBundle` 저장.
//
// dry-run 기본 — 실제 변경은 --apply 로만. 실행 전 사용자에게 변경 매트릭스 안내.

import { readFile, writeFile, readdir, rm, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, relative, dirname, join } from "node:path";
import { upsertSection, stripStylesImport } from "./css-bundle.mjs";

export const HELP_TEXT = `sh-ui migrate bundled — cssStrategy=bundled 로 전환

사용법:
  sh-ui migrate bundled          per-component styles.css → 단일 sh-ui-components.css

옵션:
  --apply             실제 적용 (미지정 시 미리보기)
  --bundle <path>     번들 CSS 파일 경로 명시

예:
  sh-ui migrate bundled
  sh-ui migrate bundled --apply
`;

async function loadConfig(cwd) {
  const configPath = resolve(cwd, "sh-ui.config.json");
  if (!existsSync(configPath)) {
    throw new Error(
      "sh-ui.config.json 을 찾을 수 없습니다. 먼저 `sh-ui init` 또는 `sh-ui create`.",
    );
  }
  return { configPath, config: JSON.parse(await readFile(configPath, "utf8")) };
}

/**
 * paths.cssBundle 기본값 — 기존 paths.styles 또는 paths.tokens 의 부모 디렉토리에
 * `sh-ui-components.css` 를 둔다.
 */
function defaultBundlePath(config) {
  const stylesDir = config.paths?.styles
    ?? (config.paths?.tokens && dirname(config.paths.tokens));
  if (!stylesDir) {
    throw new Error(
      "paths.styles 또는 paths.tokens 를 설정에서 찾을 수 없어 cssBundle 기본 경로를 정할 수 없습니다.\n" +
        "  --bundle <path> 로 명시하세요 (예: --bundle src/styles/sh-ui-components.css).",
    );
  }
  return join(stylesDir, "sh-ui-components.css");
}

/**
 * paths.components 아래 컴포넌트 폴더 (직속 디렉토리 한 단계만).
 */
async function listComponentDirs(componentsAbs) {
  if (!existsSync(componentsAbs)) return [];
  const entries = await readdir(componentsAbs, { withFileTypes: true });
  return entries
    .filter((e) => e.isDirectory())
    .map((e) => ({ name: e.name, dir: resolve(componentsAbs, e.name) }));
}

/**
 * 컴포넌트 디렉토리에서 styles.css / styles.module.css 를 찾아 (있으면) 반환.
 * .tsx 변종은 별도 — `migrateOne` 이 처리.
 */
function findStyleFiles(componentDir) {
  return [
    resolve(componentDir, "styles.css"),
    resolve(componentDir, "styles.module.css"),
  ].filter((p) => existsSync(p));
}

function findTsxFiles(componentDir) {
  return [
    resolve(componentDir, "index.tsx"),
    resolve(componentDir, "index.module.tsx"),
  ].filter((p) => existsSync(p));
}

export async function runMigrateBundled({ cwd, apply, bundleArg }) {
  const { configPath, config } = await loadConfig(cwd);

  if (config.cssStrategy === "bundled") {
    console.log("이미 cssStrategy='bundled' 로 설정돼 있습니다 — 마이그레이션 불필요.");
    return;
  }

  if ((config.cssFramework ?? "plain") !== "plain") {
    throw new Error(
      `cssFramework='${config.cssFramework}' 에선 bundled 모드가 동작하지 않습니다 (plain 만 지원).`,
    );
  }

  if (config.platform !== "react") {
    throw new Error("bundled 마이그레이션은 React 만 지원합니다.");
  }

  const componentsRel = config.paths?.components;
  if (!componentsRel) {
    throw new Error("paths.components 가 sh-ui.config.json 에 없습니다.");
  }
  const componentsAbs = resolve(cwd, componentsRel);
  const components = await listComponentDirs(componentsAbs);
  if (components.length === 0) {
    console.log(`${componentsRel} 아래에 컴포넌트가 없습니다. 마이그레이션할 게 없음.`);
  }

  const bundleRel = bundleArg ?? defaultBundlePath(config);
  const bundleAbs = resolve(cwd, bundleRel);

  // 변경 매트릭스 계산
  const plan = []; // { name, styleFiles: [], tsxFiles: [] }
  for (const c of components) {
    const styleFiles = findStyleFiles(c.dir);
    const tsxFiles = findTsxFiles(c.dir);
    if (styleFiles.length === 0 && tsxFiles.length === 0) continue;
    plan.push({ name: c.name, dir: c.dir, styleFiles, tsxFiles });
  }

  console.log(`\n── bundled 마이그레이션 ${apply ? "(실행)" : "(dry-run)"} ──`);
  console.log(`  bundle 파일: ${bundleRel}`);
  console.log(`  대상 컴포넌트: ${plan.length}개`);
  for (const p of plan) {
    const styleNames = p.styleFiles.map((f) => relative(cwd, f));
    const tsxNames = p.tsxFiles.map((f) => relative(cwd, f));
    console.log(`    · ${p.name}`);
    for (const f of styleNames) console.log(`        styles → bundle 섹션 + 파일 삭제: ${f}`);
    for (const f of tsxNames) console.log(`        .tsx import 제거: ${f}`);
  }

  if (!apply) {
    console.log(`\n실제 적용은 \`sh-ui migrate bundled --apply\`.`);
    return;
  }

  // 적용 시작 — 번들 텍스트를 먼저 빌드, 마지막에 한 번에 쓴다.
  let bundleText = existsSync(bundleAbs)
    ? await readFile(bundleAbs, "utf8")
    : `/* sh-ui — 컴포넌트 CSS 번들 (cssStrategy: bundled). 마커 사이는 sh-ui 가 관리, 그 밖은 사용자 자유. */\n\n`;

  for (const p of plan) {
    let cssAccum = "";
    for (const f of p.styleFiles) {
      const text = await readFile(f, "utf8");
      cssAccum += (cssAccum ? "\n\n" : "") + text.trim();
    }
    if (cssAccum) {
      bundleText = upsertSection(bundleText, p.name, cssAccum);
    }
    for (const f of p.tsxFiles) {
      const before = await readFile(f, "utf8");
      const after = stripStylesImport(before);
      if (before !== after) await writeFile(f, after, "utf8");
    }
    for (const f of p.styleFiles) {
      await rm(f);
    }
  }

  await mkdir(dirname(bundleAbs), { recursive: true });
  await writeFile(bundleAbs, bundleText, "utf8");

  // config 갱신
  const nextConfig = {
    ...config,
    cssStrategy: "bundled",
    paths: { ...config.paths, cssBundle: bundleRel },
  };
  await writeFile(configPath, JSON.stringify(nextConfig, null, 2) + "\n", "utf8");

  console.log(
    `\n✓ 마이그레이션 완료.\n` +
      `  bundle: ${bundleRel}\n` +
      `  config: cssStrategy='bundled', paths.cssBundle 추가\n\n` +
      `다음 단계: globals.css (또는 entry CSS) 에서 한 번 import 하세요:\n` +
      `  @import './${bundleRel.replace(/^.*\//, "")}';`,
  );
}
