import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve, relative } from "node:path";
import { pathToFileURL } from "node:url";
import { spawn } from "node:child_process";
import { select } from "@inquirer/prompts";
import { formatUnifiedDiff } from "./diff.mjs";
import { suggest } from "./levenshtein.mjs";
import { getRegistryRoot, getTokensRoot, getPeerVersionsPath } from "./paths.mjs";
import { THEME_BASES } from "./constants.js";
import {
  findMissingTokens,
  loadDefinedVarsFromConfig,
} from "./tokens-validate.mjs";
import {
  upsertSection,
  stripStylesImport,
  isStyleFile,
  isTsxFile,
  hasCrossComponentImport,
  rewriteCrossComponentImports,
} from "./css-bundle.mjs";

export const HELP_TEXT = `sh-ui add — 컴포넌트 소스를 프로젝트로 복사 + 필요한 패키지 자동 설치

사용법:
  sh-ui add <component...>
  sh-ui add tokens          설정 기반 토큰 파일 생성 (특수값)

옵션:
  --skip-install   외부 패키지 자동 설치 생략
  --diff           파일을 쓰지 않고 변경 내역(unified diff)만 출력
  --force          기존 파일을 모두 덮어쓰기 (prompt 없음)
  --keep           기존 파일을 모두 유지 (prompt 없음)
  --app <name>     monorepo 라우팅 시 대상 ui-{name} 명시

예:
  sh-ui add button
  sh-ui add button card --diff
  sh-ui add tokens
`;

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
 * registry source 안의 placeholder / 상대 import 를 사용자 config 값으로 치환.
 *
 * 1) `@SH_UI_UTILS@` → `aliases.utils` (예: `@/src/shared/lib/utils`).
 *    registry 컴포넌트는 cn 유틸을 `import { cn } from "@SH_UI_UTILS@"` 로
 *    import 한다 — add 시점에 사용자 프로젝트 alias 로 치환해 module resolution 동작.
 * 2) 크로스컴포넌트 상대 import (`from "../popover"` /
 *    `from "../popover/index.tsx"` / `from "../form/types"`) →
 *    `aliases.components` 경유 (예: `@workspace/ui-core/components/popover`).
 *    상대경로/명시적 `.tsx` 확장자가 그대로 emit 되면 NodeNext 소비자가 깨지므로
 *    (TS5097 → `allowImportingTsExtensions`+`noEmit` 강요), utils 와 동일하게
 *    add 시점에 alias 로 정규화한다. 변환 규칙은 css-bundle.mjs 의
 *    rewriteCrossComponentImports 참조 (remove.mjs 가 동일 함수로 대칭 replay).
 *
 * 해당 alias 가 미설정인데 placeholder/상대 import 가 등장하면 친절 에러로
 * 안내 — 사용자가 매 컴포넌트 추가 후 import 깨진 것을 발견하기 전에 잡는다.
 */
function substitutePlaceholders(content, config, srcRel) {
  let out = content;

  const PLACEHOLDER = "@SH_UI_UTILS@";
  if (out.includes(PLACEHOLDER)) {
    const alias = config.aliases?.utils;
    if (!alias) {
      throw new Error(
        `${srcRel} 가 cn 유틸을 import 합니다. sh-ui.config.json 에 aliases.utils 를 설정하세요.\n` +
          `  예: "aliases": { "utils": "@/src/lib/utils" }`,
      );
    }
    out = out.replaceAll(PLACEHOLDER, alias);
  }

  if (hasCrossComponentImport(out)) {
    const componentsAlias = config.aliases?.components;
    if (!componentsAlias) {
      throw new Error(
        `${srcRel} 가 다른 sh-ui 컴포넌트를 import 합니다. sh-ui.config.json 에 aliases.components 를 설정하세요.\n` +
          `  예: "aliases": { "components": "@/src/components" }`,
      );
    }
    out = rewriteCrossComponentImports(out, componentsAlias);
  }

  return out;
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
  if (!destRel) {
    // v0.65+ monorepo: ui-core 는 tokens-only 마커가 아니라 컴포넌트-only.
    // tokens 는 ui-apps/ui-<name>/ 의 역할. cwd 가 ui-core 면 안내를 명확히.
    const cwdLower = cwd.replace(/\\/g, '/').toLowerCase();
    if (cwdLower.endsWith('/packages/ui/ui-core')) {
      throw new Error(
        "paths.tokens 가 설정에 없습니다.\n" +
        "  ui-core 는 컴포넌트 단일 SoT 라 tokens 를 보관하지 않습니다 (v0.65+ layout).\n" +
        "  tokens 는 ui-app 의 역할 — cwd 를 packages/ui/ui-apps/ui-<name>/ 로 바꾸세요.",
      );
    }
    throw new Error("paths.tokens 가 설정에 없습니다.");
  }
  const dest = resolve(cwd, destRel);

  // theme.base === 'custom' 이면 토큰 빌더가 color.custom.X 스케일을 못 찾아 throw 한다 —
  // base64 테마는 사후 색상 재생성 자체가 불가능 (원본 base64 가 단일 진실, 재해석 X).
  // create 시점에 tokens.css 가 이미 정확히 주입돼 있으므로 보존하고 사용자에게 안내한다.
  if (config.theme?.base === 'custom') {
    if (!diffMode) {
      console.log(
        `↷ tokens → ${relative(cwd, dest)} (custom 테마 — tokens.css 보존, ` +
        `색 조정은 파일 직접 편집 또는 sh_ui_encode_theme 으로 새 base64 생성 후 재스캐폴드)`
      );
    }
    return;
  }

  // CLI 가 THEME_PRESETS 에서 알지만 primitives.json 의 THEME_BASES 에 없는 풍부한 preset
  // (rose/emerald/violet 등) 도 buildTokens 가 `{color.rose.50}` 등을 해석할 수 없어 throw.
  // create 시점에 injectCssTheme 이 resolved hex 를 박아둔 tokens.css 가 단일 진실 —
  // sh-ui add tokens 는 보존만. base 가 buildable 하지 않으면 같은 정책 적용.
  const base = config.theme?.base;
  if (base && !THEME_BASES.includes(base)) {
    if (!existsSync(dest)) {
      throw new Error(
        `'${base}' preset 의 tokens.css 가 아직 없습니다. 이 preset 은 ` +
        `sh-ui add tokens 로 빌드 불가 (primitives 미정의 — buildable: ${THEME_BASES.join('/')}). ` +
        `해결: sh-ui create --theme ${base} 로 새 프로젝트 스캐폴드, 또는 ` +
        `sh-ui.config.json 의 theme.base 를 ${THEME_BASES.join('/')} 중 하나로 변경 후 재실행.`,
      );
    }
    if (!diffMode) {
      console.log(
        `↷ tokens → ${relative(cwd, dest)} ('${base}' preset — tokens.css 보존, ` +
        `색 조정은 파일 직접 편집 또는 sh-ui create --theme <new> 로 재스캐폴드)`
      );
    }
    return;
  }

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
 * bundled 모드 — config.paths.cssBundle 에 컴포넌트 섹션 upsert.
 * 파일이 없으면 헤더 주석과 함께 새로 만든다.
 *
 * 마커 사이만 sh-ui 가 관리하므로 conflict resolver 를 거치지 않는다 — 사용자가
 * 손댄 다른 섹션 / 마커 밖 custom CSS 는 보존되고, 같은 이름 섹션만 교체.
 */
async function writeBundleSection({ name, css, config, cwd, diffMode, summary }) {
  const bundleRel = config.paths?.cssBundle;
  if (!bundleRel) {
    throw new Error(
      "cssStrategy='bundled' 인데 paths.cssBundle 이 sh-ui.config.json 에 없습니다.\n" +
        "  예: \"paths\": { ..., \"cssBundle\": \"src/shared/styles/sh-ui-components.css\" }",
    );
  }
  const bundlePath = resolve(cwd, bundleRel);
  const exists = existsSync(bundlePath);
  const existingText = exists
    ? await readFile(bundlePath, "utf8")
    : `/* sh-ui — 컴포넌트 CSS 번들 (cssStrategy: bundled). 마커 사이는 sh-ui 가 관리, 그 밖은 사용자 자유. */\n\n`;
  const nextText = upsertSection(existingText, name, css);

  if (existingText === nextText) {
    return; // 변경 없음
  }

  if (diffMode) {
    const rel = relative(cwd, bundlePath);
    const { text, addCount, delCount } = formatUnifiedDiff(existingText, nextText, {
      useColor: canUseColor(),
    });
    summary.push(
      exists
        ? { kind: "modified", rel, addCount, delCount, diff: text }
        : { kind: "new", rel },
    );
    return;
  }

  await ensureDir(bundlePath);
  await writeFile(bundlePath, nextText, "utf8");
  console.log(`✓ ${name} → bundle ${relative(cwd, bundlePath)}`);
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
 * 컴포넌트에 요청된 cssFramework 전용 변종 파일이 없으면 plain 으로 fallback.
 * plain CSS 컴포넌트는 :root 변수만 의존하므로 어떤 환경(Tailwind v4, CSS Modules,
 * vanilla CSS) 에서도 그대로 동작 — 깨지지 않음.
 *
 * 점진적 rollout 전략 — 모든 컴포넌트가 한 번에 새 변종을 갖출 필요 없이
 * 가능한 것부터 변종을 제공하고, 나머지는 plain 으로 자연 처리.
 */
function effectiveFramework(entry, cssFramework) {
  if (cssFramework === "plain") return cssFramework;
  const hasVariant = (entry.files ?? []).some(
    (f) => f.frameworks && f.frameworks.includes(cssFramework),
  );
  return hasVariant ? cssFramework : "plain";
}

/** 컴포넌트 not-found 에러 메시지. 가까운 후보가 있으면 "혹시 …?" 를 덧붙인다. */
export function buildNotFoundMessage(name, platform, candidates) {
  const hits = suggest(name, candidates);
  const hint = hits.length ? ` 혹시 ${hits.join(", ")}?` : "";
  return (
    `'${name}' 컴포넌트를 ${platform} 레지스트리에서 찾을 수 없습니다.${hint}` +
    ` 전체 목록: sh-ui list --all`
  );
}

async function addComponent(name, config, cwd, installed, pendingDeps, diffMode, summary, conflictResolver, validationCtx) {
  const registryRoot = getRegistryRoot(config.platform);
  const registry = JSON.parse(
    await readFile(resolve(registryRoot, "registry.json"), "utf8"),
  );
  const entry = registry.components?.[name];
  if (!entry) {
    throw new Error(
      buildNotFoundMessage(name, config.platform, Object.keys(registry.components ?? {})),
    );
  }

  const requestedFw = config.cssFramework ?? "plain";
  const cssFramework = effectiveFramework(entry, requestedFw);

  // 컴포넌트가 요구하는 CSS 변수가 사용자 tokens.css 에 정의돼 있는지 검증.
  // tokens.css 자체가 없거나, registry 에 메타가 없으면 검사 스킵 (정상 케이스).
  if (validationCtx?.definedVars && !diffMode) {
    const missing = await findMissingTokens({
      platform: config.platform,
      name,
      framework: cssFramework,
      defined: validationCtx.definedVars,
    });
    if (missing && missing.length > 0) {
      validationCtx.missingTokenReports.push({ name, framework: cssFramework, missing });
    }
  }

  // 사용자가 plain 외 변종을 골랐는데 이 컴포넌트는 plain 으로 fallback 된 경우 한 줄 알림.
  // 동작에 문제는 없지만 일관성에 대한 기대를 정확히 셋업하기 위함.
  if (requestedFw !== "plain" && cssFramework === "plain" && !diffMode) {
    console.log(
      `ℹ ${name} — ${requestedFw} 변종 미제공, plain 변종으로 설치 (어떤 환경에서도 그대로 동작)`,
    );
  }

  if (!frameworkMatches(entry, cssFramework)) {
    console.log(
      `↷ ${name} skipped — cssFramework=${cssFramework} 미지원 (지원: ${entry.frameworks.join(", ")})`,
    );
    return;
  }

  for (const dep of entry.registryDependencies ?? []) {
    await addOne(dep, config, cwd, installed, pendingDeps, diffMode, summary, conflictResolver, validationCtx);
  }

  // bundled 모드 여부. plain 변종에서만 의미 있음 (tailwind/css-modules/vanilla-extract
  // 는 자체 스코프가 있어 단일 파일 합산이 부적절).
  const bundled = config.cssStrategy === "bundled" && cssFramework === "plain";
  let bundleAccumulated = "";

  for (const file of entry.files) {
    if (!frameworkMatches(file, cssFramework)) continue;
    const src = resolve(registryRoot, file.src);
    const raw = await readFile(src, "utf8");
    let content = substitutePlaceholders(raw, config, file.src);

    if (bundled && isStyleFile(file)) {
      // 컴포넌트별 styles.css 파일은 쓰지 않고 누적만 — 마지막에 bundle 에 upsert.
      bundleAccumulated += (bundleAccumulated ? "\n\n" : "") + content.trim();
      continue;
    }
    if (bundled && isTsxFile(file)) {
      // .tsx 의 `import "./styles.css";` 제거 — bundled 모드는 사용자가 globals.css 에서
      // bundle 을 한 번 import 하는 책임을 진다.
      content = stripStylesImport(content);
    }

    const dest = resolve(cwd, resolveDest(file.dest, config));
    const result = await writeOrDiff({ dest, content, cwd, diffMode, summary, conflictResolver });
    if (!diffMode && result !== "unchanged") {
      const prefix = result === "kept" ? "↷" : "✓";
      const suffix = result === "kept" ? " (kept)" : "";
      console.log(`${prefix} ${name} → ${relative(cwd, dest)}${suffix}`);
    }
  }

  if (bundled && bundleAccumulated) {
    await writeBundleSection({ name, css: bundleAccumulated, config, cwd, diffMode, summary, conflictResolver });
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

/**
 * lockfile 존재로 패키지 매니저 감지. cwd 부터 root 방향으로 한 단씩 올라가며 탐색 —
 * monorepo 안의 sub-package(예: packages/ui/ui-apps/ui-web/) 에서 호출돼도 root 의
 * pnpm-lock.yaml 을 찾도록. 못 찾으면 npm.
 */
function detectPackageManager(cwd) {
  let dir = resolve(cwd);
  while (true) {
    if (existsSync(resolve(dir, "pnpm-lock.yaml"))) return "pnpm";
    if (existsSync(resolve(dir, "pnpm-workspace.yaml"))) return "pnpm";
    if (
      existsSync(resolve(dir, "bun.lockb")) ||
      existsSync(resolve(dir, "bun.lock"))
    ) {
      return "bun";
    }
    if (existsSync(resolve(dir, "yarn.lock"))) return "yarn";
    if (existsSync(resolve(dir, "package-lock.json"))) return "npm";
    const parent = dirname(dir);
    if (parent === dir) break; // 루트 도달
    dir = parent;
  }
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

  // role: "tokens-only" 패키지 (v0.65+ ui-app) 는 tokens 만 허용.
  // 컴포넌트는 sibling ui-core 패키지로 라우팅되도록 친절한 에러로 안내.
  if (config.role === "tokens-only") {
    const offending = names.filter((n) => n !== "tokens");
    if (offending.length > 0) {
      throw new Error(
        `이 패키지는 'tokens-only' role 입니다 — ${offending.map((n) => `'${n}'`).join(', ')} 컴포넌트를 추가할 수 없습니다.\n` +
          `컴포넌트는 sibling ui-core 패키지에 추가하세요 (예: cd ../ui-core && sh-ui add ${offending[0]}).\n` +
          `또는 monorepo 루트에서 \`sh-ui add ${offending[0]}\` 실행 시 자동으로 ui-core 로 라우팅됩니다.`,
      );
    }
  }

  // 비대화형(non-TTY)이면 prompt 를 못 띄우니 안전하게 keep 으로 강등.
  const effectiveStrategy =
    onConflict === "prompt" && !process.stdin.isTTY ? "keep" : onConflict;
  const conflictResolver = makeConflictResolver(effectiveStrategy);

  const installed = new Set();
  const pendingDeps = new Set();
  const summary = [];
  // tokens.css 정의 변수는 한 번만 읽어서 모든 컴포넌트 검증에 재사용.
  // tokens 가 같이 add 되는 경우엔 처리 후 컴포넌트가 add 되도록 names 가 보통
  // [tokens, …components…] 순이라 미리 읽어도 OK — 누락 경고는 사용자가 실제로
  // tokens.css 를 안 만들었을 때만 의미 있으므로.
  const definedVars = await loadDefinedVarsFromConfig(config, cwd);
  const missingTokenReports = [];
  for (const name of names) {
    await addOne(name, config, cwd, installed, pendingDeps, diffMode, summary, conflictResolver, {
      definedVars,
      missingTokenReports,
    });
  }

  if (!diffMode && missingTokenReports.length > 0) {
    renderMissingTokenReport(missingTokenReports, config);
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

async function addOne(name, config, cwd, installed, pendingDeps, diffMode, summary, conflictResolver, validationCtx) {
  if (installed.has(name)) return;
  installed.add(name);
  if (name === "tokens") {
    await addTokens(config, cwd, diffMode, summary, conflictResolver);
  } else {
    await addComponent(name, config, cwd, installed, pendingDeps, diffMode, summary, conflictResolver, validationCtx);
  }
}

/**
 * 컴포넌트가 요구하는 CSS 변수 중 사용자 tokens.css 에 없는 것들을 한 번에 안내.
 * fatal 이 아닌 경고 — 실제 silent breakage 는 시각적으로만 나타나므로 미리 짚어 준다.
 */
function renderMissingTokenReport(reports, config) {
  const tokensRel = config.paths?.tokens ?? "(paths.tokens 미설정)";
  console.log(`\n⚠ 일부 컴포넌트가 요구하는 CSS 변수가 ${tokensRel} 에 없습니다:`);
  for (const r of reports) {
    const preview = r.missing.slice(0, 6).join(", ");
    const more = r.missing.length > 6 ? ` (+${r.missing.length - 6} more)` : "";
    console.log(`  · ${r.name} [${r.framework}] — ${preview}${more}`);
  }
  console.log(
    `  → 해결: \`sh-ui add tokens\` 로 토큰을 다시 빌드하거나, ${tokensRel} 을 직접 수정.`,
  );
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
