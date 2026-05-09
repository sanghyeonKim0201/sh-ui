// sh-ui doctor — 프로젝트 정합성 점검.
//
// 점검 항목:
//   1) sh-ui.config.json 존재 + 필수 필드 (platform, theme, paths)
//   2) paths.tokens 파일 존재
//   3) paths.cssEntry (선택) 가 tokens.css 를 import 하는지
//   4) 설치된 컴포넌트가 요구하는 CSS 변수가 tokens.css 에 모두 정의돼 있는지
//
// 출력: 항목별 ✓ / ⚠ / ✗ + 해결 힌트. 모든 검사가 통과하면 exit 0,
//       하나라도 ✗ 면 exit 1 (CI 통합 가능).

import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, relative, dirname, posix } from "node:path";
import { getRegistryRoot } from "./paths.mjs";
import {
  extractDefinedVars,
  findMissingTokens,
} from "./tokens-validate.mjs";

const ICON = { ok: "✓", warn: "⚠", fail: "✗" };

class Report {
  constructor() {
    this.lines = [];
    this.failCount = 0;
    this.warnCount = 0;
  }
  ok(label, detail) {
    this.lines.push({ kind: "ok", label, detail });
  }
  warn(label, detail) {
    this.warnCount++;
    this.lines.push({ kind: "warn", label, detail });
  }
  fail(label, detail) {
    this.failCount++;
    this.lines.push({ kind: "fail", label, detail });
  }
  render() {
    for (const line of this.lines) {
      const icon = ICON[line.kind === "ok" ? "ok" : line.kind === "warn" ? "warn" : "fail"];
      const head = `${icon} ${line.label}`;
      if (line.detail) {
        console.log(head);
        for (const d of line.detail.split("\n")) console.log(`    ${d}`);
      } else {
        console.log(head);
      }
    }
    console.log("");
    if (this.failCount === 0 && this.warnCount === 0) {
      console.log(`✓ 모든 검사 통과`);
    } else {
      console.log(
        `검사 완료 — ${this.failCount} 실패, ${this.warnCount} 경고`,
      );
    }
  }
}

async function loadConfig(cwd, report) {
  const configPath = resolve(cwd, "sh-ui.config.json");
  if (!existsSync(configPath)) {
    report.fail(
      "sh-ui.config.json",
      `${relative(cwd, configPath)} 가 없습니다. \`sh-ui init\` 으로 생성하세요.`,
    );
    return null;
  }
  try {
    const config = JSON.parse(await readFile(configPath, "utf8"));
    const issues = [];
    if (!config.platform) issues.push("platform 미설정");
    if (!config.paths) issues.push("paths 미설정");
    // theme 은 컴포넌트-only 패키지 (monorepo ui-core, paths.tokens 없음) 에서는
    // 의도적으로 비어 있다 — 그땐 누락이라고 보지 않음.
    if (!config.theme && config.paths?.tokens) issues.push("theme 미설정");
    if (issues.length > 0) {
      report.fail("sh-ui.config.json", `필수 필드 누락: ${issues.join(", ")}`);
      return null;
    }
    const themeInfo = config.theme?.base ? `theme.base=${config.theme.base}` : "(컴포넌트 only)";
    report.ok(
      "sh-ui.config.json",
      `platform=${config.platform} ${themeInfo} cssFramework=${config.cssFramework ?? "(기본 plain)"}`,
    );
    return config;
  } catch (err) {
    report.fail("sh-ui.config.json", `JSON 파싱 실패: ${err.message}`);
    return null;
  }
}

function checkTokensFile(config, cwd, report) {
  const rel = config.paths?.tokens;
  if (!rel) {
    // 모노레포 ui-core 처럼 토큰을 가지지 않는 컴포넌트-only 패키지 — 이 케이스는
    // 정상이라 안내 한 줄만 ok 로 표시 (warn 으로 노이즈 만들지 않음).
    report.ok(
      "paths.tokens",
      "(컴포넌트 only — 토큰 없음, 검증 스킵)",
    );
    return null;
  }
  const tokensPath = resolve(cwd, rel);
  if (!existsSync(tokensPath)) {
    report.fail(
      `paths.tokens — ${rel}`,
      `파일이 없습니다. \`sh-ui add tokens\` 로 생성하세요.`,
    );
    return null;
  }
  report.ok(`paths.tokens — ${rel}`);
  return tokensPath;
}

/**
 * cssEntry 가 설정돼 있으면 그 파일이 tokens.css 를 import 하는지 검사.
 * @import './tokens.css' 또는 @import "../shared/styles/tokens.css" 형태 모두 인정.
 * 명시 import 없이 빌드 도구가 알아서 합치는 경우(Tailwind v4 의 @import "tailwindcss"
 * 만 있는 경우) 도 있어 fail 이 아니라 warn.
 */
async function checkCssEntry(config, cwd, tokensPath, report) {
  const entryRel = config.paths?.cssEntry;
  if (!entryRel) {
    report.ok(
      "paths.cssEntry",
      "(미설정 — 검사 스킵. 설정하면 tokens.css import 정합성을 검증합니다.)",
    );
    return;
  }
  const entryPath = resolve(cwd, entryRel);
  if (!existsSync(entryPath)) {
    report.fail(
      `paths.cssEntry — ${entryRel}`,
      `파일이 없습니다. config 의 paths.cssEntry 를 실제 globals.css 위치로 수정하세요.`,
    );
    return;
  }
  if (!tokensPath) {
    report.warn(
      `paths.cssEntry — ${entryRel}`,
      "tokens.css 가 없어 import 검증 불가.",
    );
    return;
  }
  const text = await readFile(entryPath, "utf8");
  const tokensFilename = posix.basename(entryRel.replaceAll("\\", "/"));
  // 단순 휴리스틱: tokens 파일 베이스네임을 포함하는 @import 가 있는지.
  const tokensBase = posix.basename(config.paths.tokens.replaceAll("\\", "/"));
  const importRe = new RegExp(
    `@import\\s+['"][^'"]*${tokensBase.replace(/\./g, "\\.")}['"]`,
  );
  if (importRe.test(text)) {
    report.ok(
      `paths.cssEntry — ${entryRel}`,
      `${tokensBase} 를 import 합니다.`,
    );
    return;
  }
  // import 가 없어도 빌드 도구가 합치는 경우가 있으므로 fail 이 아닌 warn.
  report.warn(
    `paths.cssEntry — ${entryRel}`,
    `${tokensBase} 를 import 하는 줄이 보이지 않습니다. ` +
      `CSS 변수가 unresolved 로 남을 수 있으니 \`@import './${tokensBase}';\` 같은 줄을 추가하거나, ` +
      `빌드 도구가 자동 합치는 게 맞다면 무시하세요. (현재 파일: ${entryRel})`,
  );
}

/**
 * 설치된 컴포넌트들의 토큰 의존성을 한 번에 검증.
 * registry.json 을 순회하며 destination 파일이 존재하는 컴포넌트를 "설치됨" 으로 간주.
 */
async function checkInstalledComponents(config, cwd, definedVars, report) {
  if (!definedVars) {
    // tokens 없는 컴포넌트-only 패키지 — 의존성 검증은 의미 없음. 조용히 ok.
    if (!config.paths?.tokens) {
      report.ok(
        "컴포넌트 토큰 의존성",
        "(컴포넌트 only — 검증 스킵)",
      );
      return;
    }
    report.warn(
      "컴포넌트 토큰 의존성",
      "tokens.css 가 없어 검증 스킵.",
    );
    return;
  }
  const registryRoot = getRegistryRoot(config.platform);
  const registryPath = resolve(registryRoot, "registry.json");
  if (!existsSync(registryPath)) {
    report.warn(
      "컴포넌트 토큰 의존성",
      `registry.json 을 찾을 수 없어 검증 스킵 (${registryPath}).`,
    );
    return;
  }
  const registry = JSON.parse(await readFile(registryPath, "utf8"));
  const requestedFw = config.cssFramework ?? "plain";

  let installedCount = 0;
  const issues = [];

  for (const [name, entry] of Object.entries(registry.components ?? {})) {
    if (entry.type && entry.type !== "component") continue;
    // 컴포넌트가 "설치됨" 으로 인정되려면 destination 파일 중 하나라도 존재해야 함.
    let installed = false;
    for (const file of entry.files ?? []) {
      try {
        const dest = resolveDest(file.dest, config);
        if (existsSync(resolve(cwd, dest))) {
          installed = true;
          break;
        }
      } catch {
        // paths placeholder 해석 실패 — 이 컴포넌트는 이 config 에서 install 불가
      }
    }
    if (!installed) continue;
    installedCount++;

    // file 변종 분포로 effective framework 추정.
    const cssFramework = effectiveFramework(entry, requestedFw);
    const missing = await findMissingTokens({
      platform: config.platform,
      name,
      framework: cssFramework,
      defined: definedVars,
    });
    if (missing && missing.length > 0) {
      issues.push({ name, framework: cssFramework, missing });
    }
  }

  if (installedCount === 0) {
    report.ok("설치된 컴포넌트 — 0개", "검증 대상 없음.");
    return;
  }

  if (issues.length === 0) {
    report.ok(
      `설치된 컴포넌트 — ${installedCount}개`,
      "모두 요구 토큰이 tokens.css 에 정의돼 있습니다.",
    );
    return;
  }

  const lines = issues.map((i) => {
    const preview = i.missing.slice(0, 4).join(", ");
    const more = i.missing.length > 4 ? ` (+${i.missing.length - 4} more)` : "";
    return `· ${i.name} [${i.framework}] — ${preview}${more}`;
  });
  report.fail(
    `설치된 컴포넌트 — ${installedCount}개 중 ${issues.length}개에 누락된 토큰`,
    lines.join("\n") +
      `\n해결: \`sh-ui add tokens\` 로 토큰을 다시 빌드하거나 ${config.paths.tokens} 를 직접 수정.`,
  );
}

function resolveDest(template, config) {
  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (m, key) => {
    const v = config.paths?.[key];
    if (!v) throw new Error(`paths.${key} 미설정`);
    return v;
  });
}

/**
 * cssStrategy='bundled' 인 경우 paths.cssBundle 파일 존재 + 마커 sanity 검사.
 * per-component 모드면 검사 자체를 스킵 (필드가 없어도 정상).
 */
function checkCssBundle(config, cwd, report) {
  if (config.cssStrategy !== "bundled") return;
  const rel = config.paths?.cssBundle;
  if (!rel) {
    report.fail(
      "paths.cssBundle",
      "cssStrategy='bundled' 인데 paths.cssBundle 이 미설정. " +
        "예: \"cssBundle\": \"src/shared/styles/sh-ui-components.css\"",
    );
    return;
  }
  const bundlePath = resolve(cwd, rel);
  if (!existsSync(bundlePath)) {
    report.warn(
      `paths.cssBundle — ${rel}`,
      "파일 없음 — 컴포넌트를 add 하면 자동 생성됩니다.",
    );
    return;
  }
  report.ok(`paths.cssBundle — ${rel}`, "(bundled 모드)");
}

function effectiveFramework(entry, cssFramework) {
  if (cssFramework === "plain") return cssFramework;
  const hasVariant = (entry.files ?? []).some(
    (f) => f.frameworks && f.frameworks.includes(cssFramework),
  );
  return hasVariant ? cssFramework : "plain";
}

/**
 * @returns {Promise<{ ok: boolean, failCount: number, warnCount: number }>}
 *          호출부가 exit code 결정. 한 cwd 에서 다른 cwd 로 이어 호출 가능 (monorepo 순회).
 */
export async function doctor({ cwd }) {
  console.log(`sh-ui doctor — ${relative(process.cwd(), cwd) || "."}\n`);
  const report = new Report();

  const config = await loadConfig(cwd, report);
  if (!config) {
    report.render();
    return { ok: false, failCount: report.failCount, warnCount: report.warnCount };
  }

  const tokensPath = checkTokensFile(config, cwd, report);
  await checkCssEntry(config, cwd, tokensPath, report);
  checkCssBundle(config, cwd, report);

  let definedVars = null;
  if (tokensPath) {
    const text = await readFile(tokensPath, "utf8");
    definedVars = extractDefinedVars(text);
  }
  await checkInstalledComponents(config, cwd, definedVars, report);

  report.render();
  return { ok: report.failCount === 0, failCount: report.failCount, warnCount: report.warnCount };
}
