#!/usr/bin/env node
// dev 런처 — next dev 와 검색 인덱스 watcher 를 함께 띄운다.
// 의존성 없이(child_process) 두 프로세스를 묶어, 문서를 수정하면 검색 인덱스가
// 자동 재생성되도록 한다(predev 의 1회 빌드만으로는 dev 중 변경이 반영되지 않음).

import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DOCS_ROOT = join(__dirname, "..");

const children = [];
let shuttingDown = false;

function run(command, args, label) {
  const child = spawn(command, args, {
    cwd: DOCS_ROOT,
    stdio: "inherit",
    shell: process.platform === "win32", // Windows 에서 .cmd 해석
  });
  child.on("exit", (code, signal) => {
    if (shuttingDown) return;
    // 한쪽이 죽으면 전체 종료(특히 next dev).
    shutdown(code ?? (signal ? 1 : 0));
  });
  children.push(child);
  return child;
}

function shutdown(code) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const c of children) {
    if (!c.killed) c.kill("SIGTERM");
  }
  process.exit(code);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

// 검색 인덱스 watcher(초기 빌드 포함) + next dev.
run(process.execPath, [join(DOCS_ROOT, "scripts", "build-search-index.mjs"), "--watch"], "search-index");
run("next", ["dev"], "next");
