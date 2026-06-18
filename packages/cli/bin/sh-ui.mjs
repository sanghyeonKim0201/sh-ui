#!/usr/bin/env node
import { init, HELP_TEXT as INIT_HELP } from "../src/init.mjs";
import { add } from "../src/add.mjs";
import { list } from "../src/list.mjs";
import { remove } from "../src/remove.mjs";
import { findShUiContext } from "../src/resolve-context.mjs";
import { suggest } from "../src/levenshtein.mjs";
import { KNOWN_COMMANDS } from "../src/commands.mjs";

const [, , cmd, ...rest] = process.argv;

const usage = `사용법:
  sh-ui create [name] [options]    Next.js / Flutter 프로젝트 스캐폴드
                                   sh-ui create --help 로 옵션 전체 확인
  sh-ui init                       설정 파일(sh-ui.config.json) 생성
  sh-ui add <component...>         컴포넌트 소스를 프로젝트로 복사하고
                                   필요한 외부 패키지를 자동 설치
                                   특수값: tokens → 설정 기반 토큰 파일 생성
  sh-ui list                       현재 설치된 컴포넌트 목록 표시
  sh-ui doctor                     프로젝트 정합성 점검 (config / tokens / 설치된 컴포넌트)
  sh-ui upgrade-cli [--apply]      sh-ui-cli 자체를 최신으로 업그레이드 + 설치 후 진단
  sh-ui tokens diff                tokens.css 와 buildTokens 결과 비교 (added/changed/removed)
  sh-ui tokens upgrade [--apply|--replace]
                                   --apply: 추가만 incremental (사용자 편집 보존)
                                   --replace: 통째 덮어쓰기 (add tokens --force 와 동일)
  sh-ui theme extract [--out <path>]
                                   현재 tokens.css 의 색·radius 를 base64 로 추출
                                   stdout 출력, --out 으로 파일 저장
  sh-ui remove <component...>      설치된 컴포넌트 파일 삭제
  sh-ui rename-app <old> <new>     monorepo 의 앱 이름 일괄 변경
                                   (apps/<old>/, packages/ui/ui-apps/ui-<old>/
                                   디렉토리 + 모든 import/path 패턴)
  sh-ui migrate-v065               v0.64.x → v0.65 자동 마이그레이션
                                   (--dry-run 기본, --apply 로 실제 적용)
  sh-ui migrate bundled            cssStrategy=bundled 로 전환 (per-component
                                   styles.css → 단일 sh-ui-components.css)
                                   (--apply 로 실제 적용)
  sh-ui mcp                        MCP 서버(stdio) 시작 — IDE-내 AI용
  sh-ui mcp init --client <name>   IDE MCP 설정 파일에 sh-ui 엔트리 자동 추가
                                   (claude-code | cursor | claude-desktop | codex)
  옵션:
    --skip-install                 (add, rename-app) 외부 패키지 자동 설치 생략
    --diff                         (add) 파일을 쓰지 않고 변경 내역만 출력
    --force                        (add) 기존 파일을 모두 덮어쓰기 (prompt 없음)
                                   (remove) 사용자가 수정한 파일도 삭제
    --keep                         (add) 기존 파일을 모두 유지 (prompt 없음)
    --app <name>                   (add) monorepo 라우팅 시 대상 ui-{name} 명시
                                   (apps/<name>/ 안에서 실행하면 자동 추론)
    --all                          (list) 설치되지 않은 컴포넌트까지 표시
    --dry-run                      (remove, rename-app) 변경 대상만 출력하고 실행 안 함
    --yes                          (rename-app) 대화형 확인 생략
`;

try {
  switch (cmd) {
    case "create": {
      const { runCreate } = await import("../src/create/index.mjs");
      await runCreate(rest);
      break;
    }
    case "init":
      if (rest.includes("--help") || rest.includes("-h")) {
        console.log(INIT_HELP);
        break;
      }
      await init({ cwd: process.cwd(), args: rest });
      break;
    case "add": {
      if (rest.includes("--help") || rest.includes("-h")) {
        const { HELP_TEXT } = await import("../src/add.mjs");
        console.log(HELP_TEXT);
        break;
      }
      const skipInstall = rest.includes("--skip-install");
      const diffMode = rest.includes("--diff");
      const force = rest.includes("--force");
      const keepFlag = rest.includes("--keep");
      if (force && keepFlag) {
        console.error("에러: --force 와 --keep 은 함께 쓸 수 없습니다.\n");
        process.exit(1);
      }
      const onConflict = force ? "overwrite" : keepFlag ? "keep" : "prompt";
      // --app 은 모노레포 라우팅 시 ui-{app} 명시 (tokens 또는 v0.64.x fallback).
      const appIdx = rest.indexOf("--app");
      const app = appIdx !== -1 ? rest[appIdx + 1] : null;
      const names = rest.filter((a, i) => !a.startsWith("--") && rest[i - 1] !== "--app");
      if (names.length === 0) {
        console.error("에러: 추가할 컴포넌트 이름이 필요합니다.\n");
        console.error(usage);
        process.exit(1);
      }

      // v0.67+: cwd 부터 walk-up 으로 sh-ui.config.json (standalone/ui-core/ui-app)
      // 또는 pnpm-workspace.yaml (monorepo 루트) 발견. monorepo 면 자동 라우팅 (tokens →
      // ui-app, 그 외 → ui-core), apps/<name>/ 안에서 실행하면 그 앱이 hintApp.
      const ctx = findShUiContext(process.cwd());
      if (!ctx) {
        console.error(
          "✗ sh-ui.config.json 또는 pnpm-workspace.yaml 을 cwd 부터 부모 트리에서 찾지 못했습니다.\n" +
            "  먼저 `sh-ui init` 또는 `sh-ui create` 로 프로젝트를 초기화하세요.",
        );
        process.exit(1);
      }
      if (ctx.kind === "config") {
        await add({ cwd: ctx.root, names, skipInstall, diffMode, onConflict });
      } else {
        const { addComponent } = await import("../src/create/generator.js");
        await addComponent({
          cwd: ctx.root,
          names,
          app,
          hintApp: ctx.hintApp,
          skipInstall,
          diffMode,
          onConflict,
        });
      }
      break;
    }
    case "list": {
      if (rest.includes("--help") || rest.includes("-h")) {
        const { HELP_TEXT } = await import("../src/list.mjs");
        console.log(HELP_TEXT);
        break;
      }
      const all = rest.includes("--all");
      await list({ cwd: process.cwd(), all });
      break;
    }
    case "doctor": {
      if (rest.includes("--help") || rest.includes("-h")) {
        const { HELP_TEXT } = await import("../src/doctor.mjs");
        console.log(HELP_TEXT);
        break;
      }
      const { doctor } = await import("../src/doctor.mjs");
      const { existsSync, readdirSync } = await import("node:fs");
      const { resolve } = await import("node:path");
      // add 와 같은 walk-up + monorepo 라우팅. standalone 이면 그 root 1개,
      // monorepo 면 packages/ui/ui-core + ui-apps/ui-* 모두 순회.
      const ctx = findShUiContext(process.cwd());
      if (!ctx) {
        console.error(
          "✗ sh-ui.config.json 또는 pnpm-workspace.yaml 을 cwd 부터 부모 트리에서 찾지 못했습니다.",
        );
        process.exit(1);
      }
      let anyFailed = false;
      const targets = [];
      if (ctx.kind === "config") {
        targets.push(ctx.root);
      } else {
        const uiCore = resolve(ctx.root, "packages/ui/ui-core");
        if (existsSync(resolve(uiCore, "sh-ui.config.json"))) targets.push(uiCore);
        const uiAppsRoot = resolve(ctx.root, "packages/ui/ui-apps");
        if (existsSync(uiAppsRoot)) {
          for (const name of readdirSync(uiAppsRoot)) {
            const dir = resolve(uiAppsRoot, name);
            if (existsSync(resolve(dir, "sh-ui.config.json"))) targets.push(dir);
          }
        }
        if (targets.length === 0) {
          console.error(
            "✗ monorepo 에서 sh-ui.config.json 가지는 패키지를 찾지 못했습니다.\n" +
              "  packages/ui/ui-core/ 또는 packages/ui/ui-apps/ui-*/ 에 있어야 합니다.",
          );
          process.exit(1);
        }
      }
      for (const target of targets) {
        if (targets.length > 1) {
          console.log(`\n────  ${target.replace(ctx.root + "/", "")}  ────`);
        }
        const result = await doctor({ cwd: target });
        if (!result.ok) anyFailed = true;
      }
      if (anyFailed) process.exit(1);
      break;
    }
    case "upgrade-cli": {
      if (rest.includes("--help") || rest.includes("-h")) {
        const { HELP_TEXT } = await import("../src/upgrade-cli.mjs");
        console.log(HELP_TEXT);
        break;
      }
      const apply = rest.includes("--apply");
      const { runUpgradeCli } = await import("../src/upgrade-cli.mjs");
      await runUpgradeCli({ cwd: process.cwd(), apply });
      break;
    }
    case "theme": {
      if (rest.includes("--help") || rest.includes("-h")) {
        const { HELP_TEXT } = await import("../src/theme-extract.mjs");
        console.log(HELP_TEXT);
        break;
      }
      const sub = rest[0];
      const flags = rest.slice(1);
      if (sub === "extract") {
        const outIdx = flags.indexOf("--out");
        const output = outIdx !== -1 ? flags[outIdx + 1] : null;
        const { runThemeExtract } = await import("../src/theme-extract.mjs");
        await runThemeExtract({ cwd: process.cwd(), output });
      } else {
        console.error(`에러: 알 수 없는 theme 서브명령 '${sub ?? ""}'. 'extract' 만 지원.\n`);
        process.exit(1);
      }
      break;
    }
    case "tokens": {
      if (rest.includes("--help") || rest.includes("-h")) {
        const { HELP_TEXT } = await import("../src/tokens-cmd.mjs");
        console.log(HELP_TEXT);
        break;
      }
      // sh-ui tokens diff
      // sh-ui tokens upgrade --apply | --replace
      const sub = rest[0];
      const flags = rest.slice(1);
      const { runTokensDiff, runTokensUpgrade } = await import("../src/tokens-cmd.mjs");
      if (sub === "diff") {
        await runTokensDiff({ cwd: process.cwd() });
      } else if (sub === "upgrade") {
        const apply = flags.includes("--apply");
        const replace = flags.includes("--replace");
        if (apply && replace) {
          console.error("에러: --apply 와 --replace 은 함께 쓸 수 없습니다.\n");
          process.exit(1);
        }
        if (!apply && !replace) {
          console.error(
            "에러: `sh-ui tokens upgrade` 는 --apply 또는 --replace 가 필요합니다.\n" +
              "  --apply   추가된 변수만 적용 (사용자 편집 보존)\n" +
              "  --replace buildTokens 결과로 통째 덮어쓰기\n" +
              "미리보기는 `sh-ui tokens diff`.",
          );
          process.exit(1);
        }
        await runTokensUpgrade({ cwd: process.cwd(), mode: apply ? "apply" : "replace" });
      } else {
        console.error(`에러: 알 수 없는 tokens 서브명령 '${sub ?? ""}'. 'diff' 또는 'upgrade'.\n`);
        process.exit(1);
      }
      break;
    }
    case "mcp": {
      // `sh-ui mcp init ...` → 설정 파일에 엔트리 추가
      // `sh-ui mcp`         → MCP 서버 시작
      // 단, `sh-ui mcp --help` 는 mcp HELP_TEXT 출력 (mcp init 의 인자 처리는 mcp-init.mjs 가 담당).
      if (rest[0] !== "init" && (rest.includes("--help") || rest.includes("-h"))) {
        const { HELP_TEXT } = await import("../src/mcp.mjs");
        console.log(HELP_TEXT);
        break;
      }
      if (rest[0] === "init") {
        const { mcpInit } = await import("../src/mcp-init.mjs");
        await mcpInit({ cwd: process.cwd(), args: rest.slice(1) });
      } else {
        const { startMcpServer } = await import("../src/mcp.mjs");
        await startMcpServer();
      }
      break;
    }
    case "rename-app": {
      if (rest.includes("--help") || rest.includes("-h")) {
        const { HELP_TEXT } = await import("../src/rename-app.mjs");
        console.log(HELP_TEXT);
        break;
      }
      const yes = rest.includes("--yes");
      const dryRun = rest.includes("--dry-run");
      const skipInstall = rest.includes("--skip-install");
      const positional = rest.filter((a) => !a.startsWith("--"));
      if (positional.length < 2) {
        console.error("에러: rename-app 은 <old> <new> 두 인자가 필요합니다.\n");
        console.error(usage);
        process.exit(1);
      }
      const [oldName, newName] = positional;
      const { renameApp } = await import("../src/rename-app.mjs");
      await renameApp({ cwd: process.cwd(), oldName, newName, yes, dryRun, skipInstall });
      break;
    }
    case "migrate": {
      if (rest.includes("--help") || rest.includes("-h")) {
        const { HELP_TEXT } = await import("../src/migrate-bundled.mjs");
        console.log(HELP_TEXT);
        break;
      }
      // sh-ui migrate bundled [--apply] [--bundle <path>]
      const sub = rest[0];
      const flags = rest.slice(1);
      if (sub === "bundled") {
        const apply = flags.includes("--apply");
        const bIdx = flags.indexOf("--bundle");
        const bundleArg = bIdx !== -1 ? flags[bIdx + 1] : null;
        const { runMigrateBundled } = await import("../src/migrate-bundled.mjs");
        await runMigrateBundled({ cwd: process.cwd(), apply, bundleArg });
      } else {
        console.error(`에러: 알 수 없는 migrate 서브명령 '${sub ?? ""}'. 'bundled' 만 지원.\n`);
        process.exit(1);
      }
      break;
    }
    case "migrate-v065": {
      if (rest.includes("--help") || rest.includes("-h")) {
        const { HELP_TEXT } = await import("../src/migrate-v065.mjs");
        console.log(HELP_TEXT);
        break;
      }
      const apply = rest.includes("--apply");
      const skipImportRewrite = rest.includes("--skip-import-rewrite");
      const { migrateToV065 } = await import("../src/migrate-v065.mjs");
      const { summary } = await migrateToV065({
        cwd: process.cwd(),
        dryRun: !apply,
        skipImportRewrite,
      });
      console.log(summary);
      break;
    }
    case "remove":
    case "rm": {
      if (rest.includes("--help") || rest.includes("-h")) {
        const { HELP_TEXT } = await import("../src/remove.mjs");
        console.log(HELP_TEXT);
        break;
      }
      const force = rest.includes("--force");
      const dryRun = rest.includes("--dry-run");
      const names = rest.filter((a) => !a.startsWith("--"));
      if (names.length === 0) {
        console.error("에러: 삭제할 컴포넌트 이름이 필요합니다.\n");
        console.error(usage);
        process.exit(1);
      }
      await remove({ cwd: process.cwd(), names, force, dryRun });
      break;
    }
    case undefined:
    case "-h":
    case "--help":
      console.log(usage);
      break;
    default: {
      const hits = suggest(cmd, KNOWN_COMMANDS);
      console.error(`알 수 없는 명령: ${cmd}` + (hits.length ? ` — 혹시 ${hits.join(", ")}?` : "") + "\n");
      console.error(usage);
      process.exit(1);
    }
  }
} catch (err) {
  console.error(`✗ ${err.message}`);
  process.exit(1);
}
