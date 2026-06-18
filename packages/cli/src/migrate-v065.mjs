// v0.64.x → v0.65 monorepo 마이그레이션 도구.
//
// v0.64.x 레이아웃: 컴포넌트가 packages/ui/ui-apps/ui-{app}/src/components/ 에 emit.
//                  같은 모노레포 내 N 개 앱이면 같은 컴포넌트가 N 번 복제됨.
// v0.65 레이아웃:  컴포넌트는 packages/ui/ui-core/src/components/ 단일 SoT.
//                  ui-{app} 은 tokens-only role (토큰/스타일만).
//
// 안전 원칙:
//  - dryRun 기본 — 실제 파일 변경은 명시적 dryRun=false 시에만.
//  - 컨텐츠 충돌 시 즉시 abort — 자동 병합 시도하지 않음 (사용자가 손본 컴포넌트 보호).
//  - import 재작성은 정확한 패턴 (`@workspace/ui-{app}/{kind}/`) 만 — false-positive 차단.

import * as fsp from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";

export const HELP_TEXT = `sh-ui migrate-v065 — v0.64.x → v0.65 자동 마이그레이션

사용법:
  sh-ui migrate-v065             ui-app 컴포넌트를 ui-core 단일 SoT 로 dedup 이동

옵션:
  --dry-run   변경 plan 만 출력 (기본값 — 미지정 시 동작)
  --apply     실제 적용

예:
  sh-ui migrate-v065
  sh-ui migrate-v065 --apply
`;

const COMPONENT_KINDS = ["components", "hooks", "lib"];

async function fileExists(p) {
  try {
    await fsp.access(p);
    return true;
  } catch {
    return false;
  }
}

async function listFilesRecursive(dir) {
  const out = [];
  async function walk(d) {
    const entries = await fsp.readdir(d, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) {
        if (e.name === "node_modules" || e.name === ".next" || e.name === "dist") continue;
        await walk(full);
      } else if (e.isFile()) {
        out.push(full);
      }
    }
  }
  await walk(dir);
  return out;
}

function hashContent(s) {
  return createHash("sha256").update(s).digest("hex").slice(0, 12);
}

/**
 * 마이그레이션 plan 빌드 + (옵션) 적용.
 *
 * @param {Object} options
 * @param {string} [options.cwd]                — monorepo 루트. 기본 process.cwd().
 * @param {boolean} [options.dryRun=true]       — true 면 plan 텍스트 반환, false 면 실제 적용.
 * @param {boolean} [options.skipImportRewrite] — apps/* 의 import 재작성 생략. 기본 false.
 * @returns {Promise<{plan: object, summary: string}>}
 */
export async function migrateToV065(options = {}) {
  const cwd = path.resolve(options.cwd ?? process.cwd());
  const dryRun = options.dryRun !== false; // 기본 true (안전)
  const skipImportRewrite = options.skipImportRewrite === true;

  // ─── 1. 사전 검사 ───
  if (!(await fileExists(path.join(cwd, "pnpm-workspace.yaml")))) {
    throw new Error(
      "pnpm-workspace.yaml 없음 — 모노레포가 아닙니다. v0.65 마이그레이션은 monorepo 변종에만 적용됩니다.",
    );
  }

  const uiAppsDir = path.join(cwd, "packages", "ui", "ui-apps");
  if (!(await fileExists(uiAppsDir))) {
    throw new Error(
      "packages/ui/ui-apps/ 없음 — v0.64.x monorepo 레이아웃이 아니거나 이미 마이그레이션됨.",
    );
  }

  const uiPackages = (await fsp.readdir(uiAppsDir, { withFileTypes: true }))
    .filter((e) => e.isDirectory() && e.name.startsWith("ui-") && e.name !== "ui-app-template")
    .map((e) => e.name);

  if (uiPackages.length === 0) {
    throw new Error("packages/ui/ui-apps/ui-* 패키지 없음.");
  }

  const uiCoreDir = path.join(cwd, "packages", "ui", "ui-core");
  const uiCoreCfgPath = path.join(uiCoreDir, "sh-ui.config.json");
  const uiCoreAlreadyV065 = await fileExists(uiCoreCfgPath);

  // ─── 2. 파일 수집 + 충돌 검출 ───
  // logicalPath ('src/components/button/index.tsx') → [{app, srcPath, hash, content}]
  const fileMap = new Map();
  for (const pkg of uiPackages) {
    const pkgDir = path.join(uiAppsDir, pkg);
    for (const kind of COMPONENT_KINDS) {
      const subDir = path.join(pkgDir, "src", kind);
      if (!(await fileExists(subDir))) continue;
      const files = await listFilesRecursive(subDir);
      for (const file of files) {
        const rel = path.relative(subDir, file);
        if (rel === ".gitkeep" || rel.startsWith(".gitkeep")) continue;
        const content = await fsp.readFile(file, "utf-8");
        const hash = hashContent(content);
        const logicalPath = path.posix.join("src", kind, ...rel.split(path.sep));
        const list = fileMap.get(logicalPath) ?? [];
        list.push({ app: pkg, srcPath: file, hash, content });
        fileMap.set(logicalPath, list);
      }
    }
  }

  // ui-core 에 같은 logical path 의 기존 파일이 있으면 충돌 검출 대상에 포함.
  for (const [logicalPath, entries] of fileMap) {
    const uiCorePath = path.join(uiCoreDir, logicalPath);
    if (await fileExists(uiCorePath)) {
      const existing = await fsp.readFile(uiCorePath, "utf-8");
      const hash = hashContent(existing);
      entries.push({ app: "ui-core (existing)", srcPath: uiCorePath, hash, content: existing });
    }
  }

  const moves = [];
  const conflicts = [];
  for (const [logicalPath, entries] of fileMap) {
    const uniqueHashes = [...new Set(entries.map((e) => e.hash))];
    if (uniqueHashes.length > 1) {
      conflicts.push({
        logicalPath,
        variants: entries.map((e) => ({ app: e.app, hash: e.hash })),
      });
    } else {
      moves.push({
        logicalPath,
        sourceApps: entries
          .filter((e) => e.app !== "ui-core (existing)")
          .map((e) => e.app),
        canonicalSrc: entries[0].srcPath,
        dest: path.join(uiCoreDir, logicalPath),
        alreadyInUiCore: entries.some((e) => e.app === "ui-core (existing)"),
      });
    }
  }

  // ─── 3. ui-app config / package.json 패치 plan ───
  const appConfigPatches = [];
  const appPackageJsonPatches = [];
  for (const pkg of uiPackages) {
    const cfgPath = path.join(uiAppsDir, pkg, "sh-ui.config.json");
    if (await fileExists(cfgPath)) {
      const cfg = JSON.parse(await fsp.readFile(cfgPath, "utf-8"));
      if (cfg.role !== "tokens-only") {
        appConfigPatches.push({ pkg, cfgPath });
      }
    }
    const pkgJsonPath = path.join(uiAppsDir, pkg, "package.json");
    if (await fileExists(pkgJsonPath)) {
      const pkgJson = JSON.parse(await fsp.readFile(pkgJsonPath, "utf-8"));
      const removeExports = ["./components/*", "./hooks/*", "./lib/*"]
        .filter((k) => pkgJson.exports?.[k]);
      if (removeExports.length > 0) {
        appPackageJsonPatches.push({ pkg, pkgJsonPath, removeExports });
      }
    }
  }

  // ─── 4. apps/* import 재작성 plan ───
  const importRewrites = [];
  if (!skipImportRewrite) {
    const appsDir = path.join(cwd, "apps");
    if (await fileExists(appsDir)) {
      const apps = (await fsp.readdir(appsDir, { withFileTypes: true }))
        .filter((e) => e.isDirectory())
        .map((e) => e.name);
      const tsExt = /\.(ts|tsx|mjs|js|jsx)$/;
      const re = /@workspace\/ui-([a-zA-Z0-9-]+)\/(components|hooks|lib)\//g;
      for (const app of apps) {
        const appDir = path.join(appsDir, app);
        const files = await listFilesRecursive(appDir);
        for (const file of files) {
          if (!tsExt.test(file)) continue;
          const content = await fsp.readFile(file, "utf-8");
          if (!content.includes("@workspace/ui-")) continue;
          let count = 0;
          const rewritten = content.replace(re, (match, appName) => {
            if (appName === "core") return match; // already core
            count++;
            return match.replace(`@workspace/ui-${appName}/`, "@workspace/ui-core/");
          });
          if (count > 0) {
            importRewrites.push({ file, count, rewritten });
          }
        }
      }
    }
  }

  const plan = {
    uiCoreAlreadyV065,
    uiPackages,
    moves,
    conflicts,
    appConfigPatches,
    appPackageJsonPatches,
    importRewrites,
  };

  // ─── 5. 충돌 발생 시 abort ───
  if (conflicts.length > 0) {
    const summary = renderConflicts(conflicts);
    const err = new Error(
      `자동 마이그레이션 abort — ${conflicts.length} 개 파일에 컨텐츠 충돌.\n` +
        `같은 logical path 의 파일이 ui-app 마다 다른 내용을 가지고 있습니다 (사용자가 손본 결과 가능성).\n` +
        `수동으로 해결한 뒤 재실행하거나, 충돌 파일은 수동 이전.\n\n${summary}`,
    );
    err.conflicts = conflicts;
    throw err;
  }

  // ─── 6. dryRun: plan 텍스트 반환 ───
  if (dryRun) {
    const summary = renderPlan(plan, cwd);
    return { plan, summary };
  }

  // ─── 7. apply ───
  await applyPlan(plan, { cwd, uiAppsDir, uiCoreDir });
  return {
    plan,
    summary:
      `✓ v0.65 마이그레이션 완료\n` +
      `  ${moves.length} 파일 ui-core 로 이동\n` +
      `  ${appConfigPatches.length} ui-app sh-ui.config.json 패치\n` +
      `  ${appPackageJsonPatches.length} ui-app package.json 패치\n` +
      `  ${importRewrites.length} apps/* 파일 import 재작성`,
  };
}

function renderPlan(plan, cwd) {
  const lines = [];
  lines.push("[DRY RUN] v0.65 마이그레이션 plan — 실제 적용은 dryRun: false");
  lines.push("");

  if (!plan.uiCoreAlreadyV065) {
    lines.push("◇ ui-core sh-ui.config.json 신규 생성 + package.json exports 추가");
  } else {
    lines.push("◇ ui-core 는 이미 v0.65 레이아웃 — 컴포넌트만 이동");
  }
  lines.push("");

  if (plan.moves.length > 0) {
    lines.push(`◇ 파일 이동 (${plan.moves.length}개) — N 개 ui-app 의 동일 컨텐츠 → ui-core 단일 SoT:`);
    for (const m of plan.moves.slice(0, 30)) {
      const sources = m.sourceApps.length > 0 ? m.sourceApps.join(", ") : "(이미 ui-core)";
      lines.push(`    ${m.logicalPath}  ←  ${sources}${m.alreadyInUiCore ? " (ui-core 동일)" : ""}`);
    }
    if (plan.moves.length > 30) lines.push(`    ... +${plan.moves.length - 30} more`);
    lines.push("");
  }

  if (plan.appConfigPatches.length > 0) {
    lines.push(`◇ ui-app sh-ui.config.json 패치 (${plan.appConfigPatches.length}개):`);
    for (const p of plan.appConfigPatches) {
      lines.push(`    ${p.pkg}: role: "tokens-only" 추가, components/utils paths/aliases 제거`);
    }
    lines.push("");
  }

  if (plan.appPackageJsonPatches.length > 0) {
    lines.push(`◇ ui-app package.json exports 정리 (${plan.appPackageJsonPatches.length}개):`);
    for (const p of plan.appPackageJsonPatches) {
      lines.push(`    ${p.pkg}: ${p.removeExports.join(", ")} 제거`);
    }
    lines.push("");
  }

  if (plan.importRewrites.length > 0) {
    lines.push(`◇ apps/* import 재작성 (${plan.importRewrites.length}개 파일):`);
    for (const r of plan.importRewrites.slice(0, 20)) {
      lines.push(`    ${path.relative(cwd, r.file)}  (${r.count} 곳)`);
    }
    if (plan.importRewrites.length > 20) {
      lines.push(`    ... +${plan.importRewrites.length - 20} more files`);
    }
    lines.push("");
  }

  if (
    plan.moves.length === 0 &&
    plan.appConfigPatches.length === 0 &&
    plan.appPackageJsonPatches.length === 0 &&
    plan.importRewrites.length === 0
  ) {
    lines.push("✓ 변경 사항 없음 — 이미 v0.65 레이아웃.");
  } else {
    lines.push("실제 적용: dryRun: false 로 재호출.");
  }
  return lines.join("\n");
}

function renderConflicts(conflicts) {
  const lines = [];
  for (const c of conflicts.slice(0, 15)) {
    lines.push(`  ${c.logicalPath}`);
    for (const v of c.variants) {
      lines.push(`    ${v.app}: ${v.hash}`);
    }
  }
  if (conflicts.length > 15) {
    lines.push(`  ... +${conflicts.length - 15} more`);
  }
  return lines.join("\n");
}

async function applyPlan(plan, ctx) {
  const { uiAppsDir, uiCoreDir } = ctx;

  // 1. ui-core 디렉토리/configs 보장
  await fsp.mkdir(uiCoreDir, { recursive: true });
  await fsp.mkdir(path.join(uiCoreDir, "src", "components"), { recursive: true });
  await fsp.mkdir(path.join(uiCoreDir, "src", "hooks"), { recursive: true });
  await fsp.mkdir(path.join(uiCoreDir, "src", "lib"), { recursive: true });

  if (!plan.uiCoreAlreadyV065) {
    await ensureUiCoreConfig(uiCoreDir);
    await ensureUiCorePackageJsonExports(uiCoreDir);
  }

  // 2. 파일 이동 — copy 후 source 삭제
  for (const m of plan.moves) {
    if (!m.alreadyInUiCore) {
      await fsp.mkdir(path.dirname(m.dest), { recursive: true });
      await fsp.copyFile(m.canonicalSrc, m.dest);
    }
    for (const app of m.sourceApps) {
      const appSrc = path.join(uiAppsDir, app, m.logicalPath);
      if (await fileExists(appSrc)) {
        await fsp.rm(appSrc, { force: true });
      }
    }
  }

  // 3. ui-app sh-ui.config.json 패치 — role 추가, components/utils paths/aliases 제거
  for (const p of plan.appConfigPatches) {
    const cfg = JSON.parse(await fsp.readFile(p.cfgPath, "utf-8"));
    cfg.role = "tokens-only";
    if (cfg.paths) {
      delete cfg.paths.components;
      delete cfg.paths.hooks;
      delete cfg.paths.utils;
    }
    if (cfg.aliases) {
      delete cfg.aliases.components;
      delete cfg.aliases.hooks;
      delete cfg.aliases.utils;
      delete cfg.aliases.ui;
      if (Object.keys(cfg.aliases).length === 0) delete cfg.aliases;
    }
    // role 을 platform/cssFramework 직후로 이동시키기 위해 재구성.
    const ordered = {};
    if (cfg.platform != null) ordered.platform = cfg.platform;
    if (cfg.cssFramework != null) ordered.cssFramework = cfg.cssFramework;
    ordered.role = "tokens-only";
    for (const [k, v] of Object.entries(cfg)) {
      if (k === "platform" || k === "cssFramework" || k === "role") continue;
      ordered[k] = v;
    }
    await fsp.writeFile(p.cfgPath, JSON.stringify(ordered, null, 2) + "\n");
  }

  // 4. ui-app package.json exports 정리
  for (const p of plan.appPackageJsonPatches) {
    const pkgJson = JSON.parse(await fsp.readFile(p.pkgJsonPath, "utf-8"));
    if (pkgJson.exports) {
      for (const k of p.removeExports) delete pkgJson.exports[k];
    }
    await fsp.writeFile(p.pkgJsonPath, JSON.stringify(pkgJson, null, 2) + "\n");
  }

  // 5. apps/* import 재작성
  for (const r of plan.importRewrites) {
    await fsp.writeFile(r.file, r.rewritten);
  }

  // 6. 비어진 ui-app 의 src/components/, src/hooks/, src/lib/ 디렉토리 정리.
  //    .gitkeep 남기지 않고 디렉토리 자체 제거 (v0.65 ui-app 은 styles 만).
  for (const pkg of plan.uiPackages) {
    for (const kind of COMPONENT_KINDS) {
      const subDir = path.join(uiAppsDir, pkg, "src", kind);
      if (!(await fileExists(subDir))) continue;
      const remaining = await listFilesRecursive(subDir);
      const allGitkeep = remaining.every((f) => path.basename(f) === ".gitkeep");
      if (remaining.length === 0 || allGitkeep) {
        await fsp.rm(subDir, { recursive: true, force: true });
      }
    }
  }
}

async function ensureUiCoreConfig(uiCoreDir) {
  const cfgPath = path.join(uiCoreDir, "sh-ui.config.json");
  if (await fileExists(cfgPath)) return;
  const cfg = {
    platform: "react",
    cssFramework: "plain",
    paths: {
      components: "src/components",
      hooks: "src/hooks",
      utils: "src/lib/utils.ts",
    },
    aliases: {
      components: "@workspace/ui-core/components",
      hooks: "@workspace/ui-core/hooks",
      utils: "@workspace/ui-core/lib/utils",
      ui: "@workspace/ui-core/components",
    },
  };
  await fsp.writeFile(cfgPath, JSON.stringify(cfg, null, 2) + "\n");
}

async function ensureUiCorePackageJsonExports(uiCoreDir) {
  const pkgJsonPath = path.join(uiCoreDir, "package.json");
  if (!(await fileExists(pkgJsonPath))) return;
  const pkgJson = JSON.parse(await fsp.readFile(pkgJsonPath, "utf-8"));
  pkgJson.exports = {
    "./components/*": "./src/components/*.tsx",
    "./hooks/*": "./src/hooks/*.ts",
    "./lib/*": "./src/lib/*.ts",
    ...(pkgJson.exports ?? {}),
  };
  await fsp.writeFile(pkgJsonPath, JSON.stringify(pkgJson, null, 2) + "\n");
}
