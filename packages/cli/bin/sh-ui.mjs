#!/usr/bin/env node
import { init } from "../src/init.mjs";
import { add } from "../src/add.mjs";
import { list } from "../src/list.mjs";
import { remove } from "../src/remove.mjs";

const [, , cmd, ...rest] = process.argv;

const usage = `사용법:
  sh-ui create [name] [options]    Next.js / Flutter 프로젝트 스캐폴드
                                   sh-ui create --help 로 옵션 전체 확인
  sh-ui init                       설정 파일(sh-ui.config.json) 생성
  sh-ui add <component...>         컴포넌트 소스를 프로젝트로 복사하고
                                   필요한 외부 패키지를 자동 설치
                                   특수값: tokens → 설정 기반 토큰 파일 생성
  sh-ui list                       현재 설치된 컴포넌트 목록 표시
  sh-ui remove <component...>      설치된 컴포넌트 파일 삭제
  sh-ui mcp                        MCP 서버(stdio) 시작 — IDE-내 AI용
  sh-ui mcp init --client <name>   IDE MCP 설정 파일에 sh-ui 엔트리 자동 추가
                                   (claude-code | cursor | claude-desktop)
  옵션:
    --skip-install                 (add) 외부 패키지 자동 설치 생략
    --diff                         (add) 파일을 쓰지 않고 변경 내역만 출력
    --force                        (add) 기존 파일을 모두 덮어쓰기 (prompt 없음)
                                   (remove) 사용자가 수정한 파일도 삭제
    --keep                         (add) 기존 파일을 모두 유지 (prompt 없음)
    --all                          (list) 설치되지 않은 컴포넌트까지 표시
    --dry-run                      (remove) 삭제 대상만 출력하고 실행 안 함
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
      const names = rest.filter((a) => !a.startsWith("--"));
      if (names.length === 0) {
        console.error("에러: 추가할 컴포넌트 이름이 필요합니다.\n");
        console.error(usage);
        process.exit(1);
      }
      await add({ cwd: process.cwd(), names, skipInstall, diffMode, onConflict });
      break;
    }
    case "list": {
      const all = rest.includes("--all");
      await list({ cwd: process.cwd(), all });
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
