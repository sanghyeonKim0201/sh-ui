#!/usr/bin/env node
import { init } from "../src/init.mjs";
import { add } from "../src/add.mjs";
import { list } from "../src/list.mjs";
import { remove } from "../src/remove.mjs";
import { findShUiContext } from "../src/resolve-context.mjs";

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
  sh-ui mcp                        MCP 서버(stdio) 시작 — IDE-내 AI용
  sh-ui mcp init --client <name>   IDE MCP 설정 파일에 sh-ui 엔트리 자동 추가
                                   (claude-code | cursor | claude-desktop)
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
      await init({ cwd: process.cwd(), args: rest });
      break;
    case "add": {
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
      const all = rest.includes("--all");
      await list({ cwd: process.cwd(), all });
      break;
    }
    case "doctor": {
      const { doctor } = await import("../src/doctor.mjs");
      await doctor({ cwd: process.cwd() });
      break;
    }
    case "theme": {
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
    case "migrate-v065": {
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
    default:
      console.error(`알 수 없는 명령: ${cmd}\n`);
      console.error(usage);
      process.exit(1);
  }
} catch (err) {
  console.error(`✗ ${err.message}`);
  process.exit(1);
}
