// `sh-ui tokens diff` / `sh-ui tokens upgrade` 명령 핸들러.
//
// 두 명령 다 사용자 tokens.css 와 buildTokens(config) 결과를 비교한다.
//   - diff   — 미리보기만 (added / removed / changed 표).
//   - upgrade --apply  — added 만 incremental 적용 (사용자 손댄 값 보존).
//   - upgrade --replace — buildTokens 결과로 통째 덮어쓰기 (`add tokens --force` 동일).
//
// custom theme (theme.base === 'custom' 또는 buildable 아닌 preset) 은
// buildTokens 가 throw 하므로 안내 메시지로 일찍 종료.

import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, relative } from "node:path";
import { pathToFileURL } from "node:url";
import { getTokensRoot } from "./paths.mjs";
import { THEME_BASES } from "./constants.js";
import { parseBlocks, diffBlocks, applyAdditions } from "./tokens-diff.mjs";
import { parseDartTokens, diffDartTokens } from "./tokens-diff-dart.mjs";

async function loadTokensBuilder() {
  const url = pathToFileURL(resolve(getTokensRoot(), "build.mjs")).href;
  return import(url);
}

async function loadConfig(cwd) {
  const configPath = resolve(cwd, "sh-ui.config.json");
  if (!existsSync(configPath)) {
    throw new Error(
      "sh-ui.config.json 을 찾을 수 없습니다. 먼저 `sh-ui init` 또는 `sh-ui create` 실행.",
    );
  }
  return JSON.parse(await readFile(configPath, "utf8"));
}

/**
 * config 로 expected tokens.css 를 생성. custom / non-buildable preset 은 throw.
 */
async function buildExpected(config) {
  if (config.theme?.base === "custom") {
    throw new Error(
      "custom theme 은 buildTokens 로 재생성 불가 (base64 가 단일 진실). " +
        "tokens diff/upgrade 는 buildable preset (neutral/zinc/slate) 에서만 동작합니다.",
    );
  }
  const base = config.theme?.base;
  if (base && !THEME_BASES.includes(base)) {
    throw new Error(
      `'${base}' preset 은 buildTokens 로 재생성 불가 (primitives 미정의 — buildable: ${THEME_BASES.join("/")}). ` +
        "diff/upgrade 는 base 가 neutral/zinc/slate 일 때만 사용 가능합니다.",
    );
  }
  const { buildTokens } = await loadTokensBuilder();
  return buildTokens(config);
}

async function loadCurrent(config, cwd) {
  const tokensRel = config.paths?.tokens;
  if (!tokensRel) throw new Error("paths.tokens 가 sh-ui.config.json 에 없습니다.");
  const tokensPath = resolve(cwd, tokensRel);
  if (!existsSync(tokensPath)) {
    throw new Error(
      `tokens.css 가 없습니다 (${tokensRel}). \`sh-ui add tokens\` 로 먼저 생성하세요.`,
    );
  }
  return { text: await readFile(tokensPath, "utf8"), path: tokensPath, rel: tokensRel };
}

function renderDiffReport({ added, removed, changed, unchangedCount }, rel) {
  console.log(`\nsh-ui tokens diff — ${rel}\n`);

  if (added.length === 0 && removed.length === 0 && changed.length === 0) {
    console.log(`✓ 변경 없음 — 사용자 토큰 파일이 buildTokens 결과와 동일 (${unchangedCount} 항목).`);
    return;
  }

  if (added.length > 0) {
    console.log(`+ 추가 (${added.length}) — buildTokens 가 새로 제공:`);
    for (const a of added) {
      console.log(`    [${a.selector}] ${a.name}: ${a.value};`);
    }
  }

  if (changed.length > 0) {
    console.log(`\n~ 변경 (${changed.length}) — 양쪽 정의값이 다름 (사용자가 손댔거나 sh-ui 가 갱신):`);
    for (const c of changed) {
      console.log(`    [${c.selector}] ${c.name}`);
      console.log(`      current  : ${c.current}`);
      console.log(`      expected : ${c.expected}`);
    }
  }

  if (removed.length > 0) {
    console.log(`\n- 제거 (${removed.length}) — 사용자 tokens.css 에만 존재 (custom 추가 또는 deprecated):`);
    for (const r of removed) {
      console.log(`    [${r.selector}] ${r.name}: ${r.value};`);
    }
  }

  console.log(
    `\n동일 ${unchangedCount} 변수.\n\n` +
      `적용 옵션:\n` +
      `  sh-ui tokens upgrade --apply     추가만 incremental 적용 (변경/제거 보존)\n` +
      `  sh-ui tokens upgrade --replace   buildTokens 결과로 통째 덮어쓰기 (모든 사용자 편집 손실)`,
  );
}

export async function runTokensDiff({ cwd }) {
  const config = await loadConfig(cwd);
  const expectedText = await buildExpected(config);
  const { text: currentText, rel } = await loadCurrent(config, cwd);
  const diff =
    config.platform === "flutter"
      ? diffDartTokens(parseDartTokens(currentText), parseDartTokens(expectedText))
      : diffBlocks(parseBlocks(currentText), parseBlocks(expectedText));
  renderDiffReport(diff, rel);
}

export async function runTokensUpgrade({ cwd, mode }) {
  const config = await loadConfig(cwd);
  const expectedText = await buildExpected(config);
  const current = await loadCurrent(config, cwd);
  const isFlutter = config.platform === "flutter";

  if (isFlutter && mode === "apply") {
    throw new Error(
      "Flutter 에선 `tokens upgrade --apply` 미지원 — Dart 클래스에 필드 추가는 " +
        "선언/생성자/static const 3 군데를 동시에 수정해야 해서 incremental 적용이 위험합니다.\n" +
        "  대신 `sh-ui tokens upgrade --replace` 로 통째 재생성하세요.",
    );
  }

  const diff = isFlutter
    ? diffDartTokens(parseDartTokens(current.text), parseDartTokens(expectedText))
    : diffBlocks(parseBlocks(current.text), parseBlocks(expectedText));

  console.log(`\nsh-ui tokens upgrade — ${current.rel} (${mode})\n`);

  if (mode === "replace") {
    if (current.text === expectedText) {
      console.log(`✓ 변경 없음 — buildTokens 결과와 이미 동일.`);
      return;
    }
    await writeFile(current.path, expectedText, "utf8");
    console.log(
      `✓ ${current.rel} 을 buildTokens 결과로 덮어썼습니다.\n` +
        `  추가 ${diff.added.length} / 변경 ${diff.changed.length} / 제거 ${diff.removed.length}.`,
    );
    return;
  }

  // mode === "apply" — added 만 incremental.
  if (diff.added.length === 0) {
    if (diff.changed.length > 0 || diff.removed.length > 0) {
      console.log(
        `✓ 추가할 변수 없음. 변경 ${diff.changed.length}, 제거 ${diff.removed.length} 는 사용자 의도로 보존.`,
      );
    } else {
      console.log(`✓ 변경 없음.`);
    }
    return;
  }
  const next = applyAdditions(current.text, diff.added);
  await writeFile(current.path, next, "utf8");
  console.log(
    `✓ ${diff.added.length} 개 변수 추가 적용:\n` +
      diff.added
        .slice(0, 12)
        .map((a) => `    + [${a.selector}] ${a.name}`)
        .join("\n") +
      (diff.added.length > 12 ? `\n    +${diff.added.length - 12} more` : ""),
  );
  if (diff.changed.length > 0) {
    console.log(
      `\nℹ 값 변경 ${diff.changed.length} 개는 보존됨. ` +
        `sh-ui 의 새 권장값을 보려면 \`sh-ui tokens diff\`. ` +
        `통째 덮어쓰기는 \`sh-ui tokens upgrade --replace\`.`,
    );
  }
  if (diff.removed.length > 0) {
    console.log(
      `ℹ 사용자 추가 변수 ${diff.removed.length} 개는 그대로 유지.`,
    );
  }
}
