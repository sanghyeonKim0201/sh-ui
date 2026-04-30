import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve, relative } from "node:path";
import { pathToFileURL } from "node:url";
import { spawn } from "node:child_process";
import { select } from "@inquirer/prompts";
import { formatUnifiedDiff } from "./diff.mjs";
import { getRegistryRoot, getTokensRoot, getPeerVersionsPath } from "./paths.mjs";

/**
 * 기존 파일과 registry 파일 내용이 다를 때 keep/overwrite 결정.
 * strategy 가 "prompt" 면 사용자에게 묻고, 그 외엔 즉시 결정.
 * "ALL" 선택은 이번 add 실행 동안만 유지된다.
 */
function makeConflictResolver(strategy) {
  // strategy: "prompt" | "keep" | "overwrite"
  let sticky = strategy === "prompt" ? null : strategy;
  return {
    async resolve(rel) {
      if (sticky) return sticky;
      const choice = await select({
        message: `이미 존재합니다: ${rel} — 어떻게 할까요?`,
        choices: [
          { name: "그대로 두기 (사용자 변경 유지)", value: "keep" },
          { name: "덮어쓰기 (registry 버전으로 교체)", value: "overwrite" },
          { name: "남은 충돌도 모두 그대로 두기", value: "keep-all" },
          { name: "남은 충돌도 모두 덮어쓰기", value: "overwrite-all" },
        ],
        default: "keep",
      });
      if (choice === "keep-all") {
        sticky = "keep";
        return "keep";
      }
      if (choice === "overwrite-all") {
        sticky = "overwrite";
        return "overwrite";
      }
      return choice;
    },
  };
}

/**
 * `dependencies` 에 적힌 패키지명을 peer-versions.json 의 버전 범위와 결합.
 * 패키지 자체에 이미 `@version` 이 붙어 있거나 맵에 없으면 그대로 둔다.
 *
 * 왜: registry.json 은 deps 를 패키지명만 적어 두고, 실제 호환 버전은
 * peer-versions.json 가 단일 출처로 관리한다. 이게 없으면 npm install 이
 * latest 태그를 찾는데, RC 만 있는 패키지(@base-ui-components/react 등)
 * 에서 ETARGET 으로 실패한다.
 */
async function resolveDepVersions(deps, platform) {
  let map = {};
  try {
    const data = JSON.parse(await readFile(getPeerVersionsPath(platform), "utf8"));
    map = data.versions ?? {};
  } catch {
    // peer-versions.json 이 없는 platform 은 그대로 패스 (Flutter 등)
  }
  return deps.map((d) => {
    if (d.includes("@", 1)) return d; // 이미 name@range 형식
    return map[d] ? `${d}@${map[d]}` : d;
  });
}

// tokens/build.mjs 는 모노레포·출고 모드에 따라 위치가 달라서 동적 import.
async function loadTokensBuilder() {
  const url = pathToFileURL(resolve(getTokensRoot(), "build.mjs")).href;
  return import(url);
}

/** 컬러 출력 가능 여부: TTY + NO_COLOR 미설정. */
function canUseColor() {
  return Boolean(process.stdout.isTTY) && !process.env.NO_COLOR;
}

/** `{components}/button.tsx` 처럼 config.paths 값으로 치환 */
function resolveDest(template, config) {
  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (m, key) => {
    const v = config.paths?.[key];
    if (!v) throw new Error(`paths.${key} 가 sh-ui.config.json에 없습니다.`);
    return v;
  });
}

/**
 * registry source 안의 placeholder 를 사용자 config 값으로 치환.
 * 현재 지원: `@SH_UI_UTILS@` → `aliases.utils` (예: `@/src/shared/lib/utils`).
 *
 * registry 컴포넌트는 cn 유틸을 `import { cn } from "@SH_UI_UTILS@"` 로 import 한다 —
 * CLI 가 add 시점에 사용자 프로젝트의 alias 로 치환해 TS module resolution 이 동작.
 *
 * aliases.utils 가 미설정인데 placeholder 가 등장하면 친절 에러로 안내. 사용자가 매 컴포넌트
 * 추가 후 import 깨진 것을 발견하기 전에 시점에 잡는다.
 */
function substitutePlaceholders(content, config, srcRel) {
  const PLACEHOLDER = "@SH_UI_UTILS@";
  if (!content.includes(PLACEHOLDER)) return content;
  const alias = config.aliases?.utils;
  if (!alias) {
    throw new Error(
      `${srcRel} 가 cn 유틸을 import 합니다. sh-ui.config.json 에 aliases.utils 를 설정하세요.\n` +
        `  예: "aliases": { "utils": "@/src/lib/utils" }`,
    );
  }
  return content.replaceAll(PLACEHOLDER, alias);
}

async function ensureDir(filePath) {
  await mkdir(dirname(filePath), { recursive: true });
}

/**
 * 대상 파일 쓰기 래퍼.
 * - diff 모드면 기존 파일과 비교해 diff만 출력하고 skip.
 * - 일반 모드에서 기존 파일과 내용이 다르면 conflictResolver 에 위임.
 * @returns "new" | "unchanged" | "modified" | "kept" | "previewed"
 */
async function writeOrDiff({ dest, content, cwd, diffMode, summary, conflictResolver, isBinary = false }) {
  const rel = relative(cwd, dest);
  const exists = existsSync(dest);

  if (!exists) {
    if (diffMode) {
      summary.push({ kind: "new", rel });
      return "previewed";
    }
    await ensureDir(dest);
    await writeFile(dest, content, "utf8");
    return "new";
  }

  if (isBinary) {
    // 바이너리는 diff 비교가 의미 없음. 기존 파일이 있으면 conflictResolver 에 위임.
    if (diffMode) {
      summary.push({ kind: "binary", rel });
      return "previewed";
    }
    const choice = await conflictResolver.resolve(rel);
    if (choice === "keep") return "kept";
    await writeFile(dest, content, "utf8");
    return "modified";
  }

  const existing = await readFile(dest, "utf8");
  if (existing === content) {
    if (diffMode) {
      summary.push({ kind: "same", rel });
    }
    return "unchanged";
  }

  if (diffMode) {
    const { text, addCount, delCount } = formatUnifiedDiff(existing, content, {
      useColor: canUseColor(),
    });
    summary.push({ kind: "modified", rel, addCount, delCount, diff: text });
    return "previewed";
  }

  const choice = await conflictResolver.resolve(rel);
  if (choice === "keep") return "kept";

  await writeFile(dest, content, "utf8");
  return "modified";
}

/** 특수 컴포넌트: 설정으로 토큰 파일 생성 */
async function addTokens(config, cwd, diffMode, summary, conflictResolver) {
  const destRel = config.paths?.tokens;
  if (!destRel) throw new Error("paths.tokens 가 설정에 없습니다.");
  const dest = resolve(cwd, destRel);

  const { buildTokens } = await loadTokensBuilder();
  const content = await buildTokens(config);

  const result = await writeOrDiff({ dest, content, cwd, diffMode, summary, conflictResolver });
  if (!diffMode && result !== "unchanged") {
    const prefix = result === "kept" ? "↷" : "✓";
    const suffix = result === "kept" ? " (kept)" : "";
    console.log(`${prefix} tokens → ${relative(cwd, dest)}${suffix}`);
  }
}

/**
 * registry 엔트리의 frameworks 필드와 현재 cssFramework 가 호환되는지.
 * 필드가 없으면 "모든 프레임워크에 적용" — 기본 케이스.
 */
function frameworkMatches(entry, cssFramework) {
  if (!entry.frameworks) return true;
  return entry.frameworks.includes(cssFramework);
}

/**
 * cssFramework="tailwind" 인데 컴포넌트에 tailwind 전용 변종 파일이 없으면
 * plain 으로 fallback. plain CSS 컴포넌트도 @theme inline 브리지 덕분에
 * Tailwind v4 프로젝트에서 그대로 동작하므로 깨지지 않음.
 *
 * 점진적 rollout 전략 — 모든 컴포넌트가 한 번에 tailwind 변종을 갖출 필요 없이
 * 가능한 것부터 utility-class 변종을 제공하고, 나머지는 plain 으로 자연 처리.
 */
function effectiveFramework(entry, cssFramework) {
  if (cssFramework !== "tailwind") return cssFramework;
  const hasTailwindVariant = (entry.files ?? []).some(
    (f) => f.frameworks && f.frameworks.includes("tailwind"),
  );
  return hasTailwindVariant ? "tailwind" : "plain";
}

async function addComponent(name, config, cwd, installed, pendingDeps, diffMode, summary, conflictResolver) {
  const registryRoot = getRegistryRoot(config.platform);
  const registry = JSON.parse(
    await readFile(resolve(registryRoot, "registry.json"), "utf8"),
  );
  const entry = registry.components?.[name];
  if (!entry) {
    throw new Error(
      `'${name}' 컴포넌트를 ${config.platform} 레지스트리에서 찾을 수 없습니다.`,
    );
  }

  const requestedFw = config.cssFramework ?? "plain";
  const cssFramework = effectiveFramework(entry, requestedFw);

  // 사용자가 tailwind 를 골랐는데 이 컴포넌트는 plain 으로 fallback 된 경우 한 줄 알림.
  // 동작에 문제는 없지만 일관성에 대한 기대를 정확히 셋업하기 위함.
  if (requestedFw === "tailwind" && cssFramework === "plain" && !diffMode) {
    console.log(
      `ℹ ${name} — Tailwind 변종 미제공, plain 변종으로 설치 (Tailwind v4 환경에서 그대로 동작)`,
    );
  }

  if (!frameworkMatches(entry, cssFramework)) {
    console.log(
      `↷ ${name} skipped — cssFramework=${cssFramework} 미지원 (지원: ${entry.frameworks.join(", ")})`,
    );
    return;
  }

  for (const dep of entry.registryDependencies ?? []) {
    await addOne(dep, config, cwd, installed, pendingDeps, diffMode, summary, conflictResolver);
  }

  for (const file of entry.files) {
    if (!frameworkMatches(file, cssFramework)) continue;
    const src = resolve(registryRoot, file.src);
    const dest = resolve(cwd, resolveDest(file.dest, config));
    const raw = await readFile(src, "utf8");
    const content = substitutePlaceholders(raw, config, file.src);
    const result = await writeOrDiff({ dest, content, cwd, diffMode, summary, conflictResolver });
    if (!diffMode && result !== "unchanged") {
      const prefix = result === "kept" ? "↷" : "✓";
      const suffix = result === "kept" ? " (kept)" : "";
      console.log(`${prefix} ${name} → ${relative(cwd, dest)}${suffix}`);
    }
  }

  for (const dep of entry.dependencies ?? []) {
    // dep 은 string ("react-hook-form") 또는 object ({name, frameworks?: string[]}).
    // 후자는 cssFramework 에 따라 의존성을 분기 (예: cva 는 tailwind 변종에만 필요).
    if (typeof dep === "string") {
      pendingDeps.add(dep);
    } else if (dep && typeof dep === "object" && dep.name) {
      if (dep.frameworks && !dep.frameworks.includes(cssFramework)) continue;
      pendingDeps.add(dep.name);
    }
  }
}

/** lockfile 존재로 패키지 매니저 감지. 없으면 npm. */
function detectPackageManager(cwd) {
  if (existsSync(resolve(cwd, "pnpm-lock.yaml"))) return "pnpm";
  if (
    existsSync(resolve(cwd, "bun.lockb")) ||
    existsSync(resolve(cwd, "bun.lock"))
  ) {
    return "bun";
  }
  if (existsSync(resolve(cwd, "yarn.lock"))) return "yarn";
  return "npm";
}

/** 이미 package.json에 있는 의존성은 제외. */
async function filterMissingDeps(deps, cwd) {
  try {
    const pkg = JSON.parse(
      await readFile(resolve(cwd, "package.json"), "utf8"),
    );
    const have = {
      ...(pkg.dependencies ?? {}),
      ...(pkg.devDependencies ?? {}),
      ...(pkg.peerDependencies ?? {}),
      ...(pkg.optionalDependencies ?? {}),
    };
    return deps.filter((d) => !(d in have));
  } catch {
    return deps;
  }
}

function runInstall(pm, deps, cwd) {
  const addCmd = pm === "npm" ? "install" : "add";
  const args = [addCmd, ...deps];
  console.log(`\n외부 패키지 설치: ${pm} ${args.join(" ")}`);
  // Windows는 .cmd/.bat 파일을 실행하려면 shell이 필요하지만,
  // Unix에선 args 이스케이프 경고를 피하려고 shell을 끈다.
  const isWin = process.platform === "win32";
  return new Promise((ok, bad) => {
    const child = spawn(pm, args, { cwd, stdio: "inherit", shell: isWin });
    child.on("exit", (code) =>
      code === 0 ? ok() : bad(new Error(`${pm} exited with code ${code}`)),
    );
    child.on("error", bad);
  });
}

export async function add({
  cwd,
  names,
  skipInstall = false,
  diffMode = false,
  /**
   * 기존 파일과 registry 파일이 충돌할 때 동작.
   * "prompt" — 인터랙티브 (기본). 비대화형 환경에선 자동으로 "keep" 으로 강등.
   * "keep"   — 기존 파일 유지 (사용자 변경 보존).
   * "overwrite" — registry 버전으로 덮어쓰기 (`--force`).
   */
  onConflict = "prompt",
}) {
  const configPath = resolve(cwd, "sh-ui.config.json");
  let config;
  try {
    config = JSON.parse(await readFile(configPath, "utf8"));
  } catch {
    throw new Error(
      "sh-ui.config.json을 찾을 수 없습니다. 먼저 `sh-ui init`을 실행하세요.",
    );
  }

  // 비대화형(non-TTY)이면 prompt 를 못 띄우니 안전하게 keep 으로 강등.
  const effectiveStrategy =
    onConflict === "prompt" && !process.stdin.isTTY ? "keep" : onConflict;
  const conflictResolver = makeConflictResolver(effectiveStrategy);

  const installed = new Set();
  const pendingDeps = new Set();
  const summary = [];
  for (const name of names) {
    await addOne(name, config, cwd, installed, pendingDeps, diffMode, summary, conflictResolver);
  }

  if (diffMode) {
    renderDiffReport(summary);
    return;
  }

  if (pendingDeps.size === 0) return;

  const deps = [...pendingDeps];
  const missing = await filterMissingDeps(deps, cwd);

  if (missing.length === 0) {
    console.log(
      `\n외부 패키지 모두 이미 설치됨: ${deps.join(", ")}`,
    );
    return;
  }

  const versioned = await resolveDepVersions(missing, config.platform);

  if (skipInstall) {
    const pm = detectPackageManager(cwd);
    const addCmd = pm === "npm" ? "install" : "add";
    console.log(
      `\n  ⚠ 외부 패키지 필요. 다음을 실행하세요:\n    ${pm} ${addCmd} ${versioned.join(" ")}`,
    );
    return;
  }

  const pm = detectPackageManager(cwd);
  try {
    await runInstall(pm, versioned, cwd);
  } catch (err) {
    const addCmd = pm === "npm" ? "install" : "add";
    console.error(
      `\n✗ 자동 설치 실패 (${err.message}). 수동으로 실행하세요:\n    ${pm} ${addCmd} ${versioned.join(" ")}`,
    );
    throw err;
  }
}

async function addOne(name, config, cwd, installed, pendingDeps, diffMode, summary, conflictResolver) {
  if (installed.has(name)) return;
  installed.add(name);
  if (name === "tokens") {
    await addTokens(config, cwd, diffMode, summary, conflictResolver);
  } else {
    await addComponent(name, config, cwd, installed, pendingDeps, diffMode, summary, conflictResolver);
  }
}

function renderDiffReport(summary) {
  const created = summary.filter((s) => s.kind === "new");
  const modified = summary.filter((s) => s.kind === "modified");
  const same = summary.filter((s) => s.kind === "same");
  const binary = summary.filter((s) => s.kind === "binary");

  console.log("\n── 변경 미리보기 (diff 모드) ──");

  if (created.length) {
    console.log(`\n신규 ${created.length}개:`);
    for (const s of created) console.log(`  + ${s.rel}`);
  }

  if (modified.length) {
    console.log(`\n변경 ${modified.length}개:`);
    for (const s of modified) {
      console.log(`\n  ~ ${s.rel} (+${s.addCount} -${s.delCount})`);
      console.log(s.diff);
    }
  }

  if (binary.length) {
    console.log(`\n바이너리(비교 생략) ${binary.length}개:`);
    for (const s of binary) console.log(`  ~ ${s.rel}`);
  }

  if (same.length) {
    console.log(`\n동일(변경 없음) ${same.length}개:`);
    for (const s of same) console.log(`  = ${s.rel}`);
  }

  if (!created.length && !modified.length) {
    console.log("\n모든 파일이 최신 상태입니다.");
  } else {
    console.log(
      "\n※ diff 모드 — 파일이 실제로 쓰이지 않았습니다. 적용하려면 --diff 없이 다시 실행하세요.",
    );
  }
}
