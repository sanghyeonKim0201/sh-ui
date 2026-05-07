// monorepo 의 앱 이름 (apps/<old>/ + packages/ui/ui-apps/ui-<old>/) 을 일괄 변경.
//
// 디렉토리 이동 + 정해진 패턴 치환을 자동화. 사용자가 손으로
// 6~10 군데 (package.json 이름, tsconfig paths, next.config transpilePackages,
// sh-ui.config aliases, README, 필요 시 사용자가 추가한 Dockerfile WORKDIR ...) 를
// 일일이 갈아엎지 않도록.
//
// false-positive 방지를 위해 bare 단어 (`web`) 는 절대 치환하지 않고,
// 컨텍스트(슬래시·따옴표·`--filter ` 공백) 로 묶인 패턴만 치환한다.
//
// 사용:
//   sh-ui rename-app web dashboard            대화형 확인 후 실행
//   sh-ui rename-app web dashboard --yes      비대화형
//   sh-ui rename-app web dashboard --dry-run  변경 매트릭스만 출력

import { existsSync, statSync } from "node:fs";
import { readdir, readFile, rename, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { join, relative, resolve } from "node:path";
import { createInterface } from "node:readline/promises";

/** 텍스트 파일로 처리할 확장자 (전체 파일을 읽어 치환). */
const TEXT_EXT = new Set([
  ".ts", ".tsx", ".js", ".mjs", ".cjs",
  ".json", ".jsonc",
  ".css", ".scss",
  ".md", ".mdx",
  ".yml", ".yaml",
  ".html", ".env", ".sh",
]);

/** 확장자 없는 텍스트 파일들 (Dockerfile 등) — 정확한 파일명으로 매칭. */
const TEXT_BASENAMES = new Set([
  "Dockerfile",
  "Dockerfile.dev",
  "Dockerfile.prod",
  ".env",
  ".env.example",
  ".env.local",
  ".gitignore",
  ".dockerignore",
]);

/** 스캔하지 않을 디렉토리 — 빌드 산출물·캐시·의존성. */
const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  ".turbo",
  ".git",
  "dist",
  "build",
  ".cache",
]);

/** 모노레포 루트에서 추가로 스캔할 파일/디렉토리 (디렉토리 이동 외). */
const ROOT_TARGETS = [
  "package.json",
  "README.md",
  "turbo.json",
  "docker-compose.yml",
  "docker-compose.yaml",
  "vercel.json",
  ".github", // 디렉토리 — 안의 yml/yaml 파일들 스캔
];

function buildPatterns(oldName, newName) {
  // false-positive 방지 위해 컨텍스트(/, ", ', 공백) 로 묶인 패턴만.
  // 순서는 더 긴 패턴부터 (안 그러면 prefix 매치되어 부정확).
  return [
    [`@workspace/ui-${oldName}`, `@workspace/ui-${newName}`],
    [`ui-apps/ui-${oldName}`, `ui-apps/ui-${newName}`],
    [`packages/ui/ui-apps/ui-${oldName}`, `packages/ui/ui-apps/ui-${newName}`],
    [`apps/${oldName}/`, `apps/${newName}/`],
    [`apps/${oldName}"`, `apps/${newName}"`],
    [`apps/${oldName}'`, `apps/${newName}'`],
    [`apps/${oldName}\n`, `apps/${newName}\n`],
    [`apps/${oldName} `, `apps/${newName} `],
    [`--filter ${oldName} `, `--filter ${newName} `],
    [`--filter ${oldName}\n`, `--filter ${newName}\n`],
    [`--filter ${oldName}"`, `--filter ${newName}"`],
    [`--filter ${oldName}'`, `--filter ${newName}'`],
    [`--filter ${oldName}\``, `--filter ${newName}\``],
    [`--app ${oldName} `, `--app ${newName} `],
    [`--app ${oldName}\n`, `--app ${newName}\n`],
    [`--app ${oldName}"`, `--app ${newName}"`],
    [`--app ${oldName}'`, `--app ${newName}'`],
    [`--app ${oldName}\``, `--app ${newName}\``],
  ];
}

/** package.json 내부의 정확한 name 필드만 따로 처리 (정규식 1개). */
function rewritePackageJsonName(content, oldName, newName) {
  // "name": "old" 또는 "name": "@workspace/ui-old" 두 케이스.
  // app 자체의 name 은 정확히 oldName 이어야 매칭.
  return content.replace(
    new RegExp(`"name"\\s*:\\s*"${escapeRegex(oldName)}"`),
    `"name": "${newName}"`,
  );
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** 한 파일의 텍스트 치환. 변경 횟수 + 새 내용 반환. */
function applyPatternsToContent(content, patterns, oldName, newName) {
  let next = content;
  let hits = 0;
  for (const [from, to] of patterns) {
    if (next.includes(from)) {
      const before = next;
      next = next.split(from).join(to);
      hits += (before.length - next.length) / (from.length - to.length) || 0;
    }
  }
  // package.json name 필드도 (별도 처리 — 패턴에 안 잡힘)
  const afterPkg = rewritePackageJsonName(next, oldName, newName);
  if (afterPkg !== next) {
    hits += 1;
    next = afterPkg;
  }
  return { content: next, hits };
}

function isTextFile(filePath) {
  const base = filePath.split("/").pop();
  if (!base) return false;
  if (TEXT_BASENAMES.has(base)) return true;
  const dot = base.lastIndexOf(".");
  if (dot < 0) return false;
  return TEXT_EXT.has(base.slice(dot));
}

/** 디렉토리 재귀 순회. SKIP_DIRS 는 건너뜀. 텍스트 파일 경로 yield. */
async function* walkTextFiles(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      yield* walkTextFiles(full);
    } else if (entry.isFile()) {
      if (isTextFile(full)) yield full;
    }
  }
}

/** Symlink 안 따라가는 단순 안전한 fs.rename. cross-device 시 fallback 없음 (모노레포 내부). */
async function moveDir(from, to) {
  await rename(from, to);
}

async function confirm(message) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const ans = await rl.question(`${message} [y/N] `);
    return /^y(es)?$/i.test(ans.trim());
  } finally {
    rl.close();
  }
}

function runPnpmInstall(cwd) {
  console.log("\npnpm install — workspace 링크 재생성");
  return new Promise((ok, bad) => {
    const child = spawn("pnpm", ["install"], { cwd, stdio: "inherit", shell: process.platform === "win32" });
    child.on("error", bad);
    child.on("exit", (code) =>
      code === 0 ? ok() : bad(new Error(`pnpm install exited with code ${code}`)),
    );
  });
}

/**
 * @param {object} opts
 * @param {string} opts.cwd
 * @param {string} opts.oldName
 * @param {string} opts.newName
 * @param {boolean} [opts.yes]      — 대화형 확인 생략
 * @param {boolean} [opts.dryRun]   — 변경 매트릭스만 출력, 실제 변경 X
 * @param {boolean} [opts.skipInstall] — 마지막 pnpm install 생략
 * @returns {Promise<{moves: Array<[string,string]>, edits: Array<{path:string, hits:number}>}>}
 */
export async function renameApp({ cwd, oldName, newName, yes = false, dryRun = false, skipInstall = false }) {
  const root = resolve(cwd);

  // ─── 환경 검증 ───
  if (!existsSync(join(root, "pnpm-workspace.yaml"))) {
    throw new Error(
      `${root} 가 pnpm 모노레포 루트가 아닙니다 (pnpm-workspace.yaml 없음). rename-app 은 모노레포 전용입니다.`,
    );
  }
  if (!oldName || !newName) {
    throw new Error("oldName / newName 둘 다 필요합니다.");
  }
  if (oldName === newName) {
    throw new Error(`oldName 과 newName 이 같습니다 (${oldName}).`);
  }
  if (!/^[a-z0-9][a-z0-9-]*$/i.test(newName)) {
    throw new Error(`newName 은 영숫자 + 하이픈만 허용 (받은 값: ${newName}).`);
  }

  const oldAppDir = join(root, "apps", oldName);
  const newAppDir = join(root, "apps", newName);
  const oldUiDir = join(root, "packages", "ui", "ui-apps", `ui-${oldName}`);
  const newUiDir = join(root, "packages", "ui", "ui-apps", `ui-${newName}`);

  if (!existsSync(oldAppDir)) throw new Error(`apps/${oldName} 가 존재하지 않습니다.`);
  if (existsSync(newAppDir)) throw new Error(`apps/${newName} 가 이미 존재합니다.`);

  const hasUiPkg = existsSync(oldUiDir);
  if (hasUiPkg && existsSync(newUiDir)) {
    throw new Error(`packages/ui/ui-apps/ui-${newName} 가 이미 존재합니다.`);
  }

  const patterns = buildPatterns(oldName, newName);

  // ─── 변경 매트릭스 계산 (디렉토리 이동 전 — 원본 경로 기준 스캔) ───
  const moves = [[oldAppDir, newAppDir]];
  if (hasUiPkg) moves.push([oldUiDir, newUiDir]);

  const edits = [];

  async function scanFile(absPath, displayPath) {
    const raw = await readFile(absPath, "utf-8");
    const { content, hits } = applyPatternsToContent(raw, patterns, oldName, newName);
    if (hits > 0 && content !== raw) {
      edits.push({ path: displayPath, abs: absPath, content, hits });
    }
  }

  // 두 패키지 디렉토리 (원본 경로) 안 텍스트 파일들
  for await (const file of walkTextFiles(oldAppDir)) {
    await scanFile(file, relative(root, file));
  }
  if (hasUiPkg) {
    for await (const file of walkTextFiles(oldUiDir)) {
      await scanFile(file, relative(root, file));
    }
  }

  // 루트 추가 타겟
  for (const target of ROOT_TARGETS) {
    const abs = join(root, target);
    if (!existsSync(abs)) continue;
    const stat = statSync(abs);
    if (stat.isDirectory()) {
      for await (const file of walkTextFiles(abs)) {
        await scanFile(file, relative(root, file));
      }
    } else if (stat.isFile() && isTextFile(abs)) {
      await scanFile(abs, relative(root, abs));
    }
  }

  // ─── 미리보기 출력 ───
  console.log(`\n📦 ${oldName} → ${newName}`);
  console.log("\n디렉토리 이동:");
  for (const [from, to] of moves) {
    console.log(`  ${relative(root, from)} → ${relative(root, to)}`);
  }
  console.log(`\n파일 내용 수정 (${edits.length}개):`);
  for (const e of edits) {
    console.log(`  ${e.path} (${e.hits}곳)`);
  }
  if (edits.length === 0) {
    console.log("  (없음)");
  }

  if (dryRun) {
    console.log("\n--dry-run 모드 — 실제 변경하지 않았습니다.");
    return { moves, edits: edits.map(({ path, hits }) => ({ path, hits })) };
  }

  // ─── 확인 ───
  if (!yes) {
    const ok = await confirm("\n계속 진행할까요?");
    if (!ok) {
      console.log("취소했습니다.");
      return { moves: [], edits: [] };
    }
  }

  // ─── 디렉토리 이동 먼저 ───
  for (const [from, to] of moves) {
    await moveDir(from, to);
  }

  // ─── 파일 내용 수정 (이동된 새 경로로 매핑) ───
  for (const edit of edits) {
    let newAbs = edit.abs;
    if (newAbs.startsWith(oldAppDir + "/")) {
      newAbs = newAppDir + newAbs.slice(oldAppDir.length);
    } else if (hasUiPkg && newAbs.startsWith(oldUiDir + "/")) {
      newAbs = newUiDir + newAbs.slice(oldUiDir.length);
    }
    await writeFile(newAbs, edit.content, "utf-8");
  }

  console.log(`\n✓ ${moves.length}개 디렉토리 이동, ${edits.length}개 파일 수정`);

  // ─── pnpm install 로 lockfile 재생성 ───
  if (!skipInstall) {
    try {
      await runPnpmInstall(root);
      console.log("✓ pnpm install 완료 — workspace 링크 갱신됨");
    } catch (e) {
      console.warn(`⚠ pnpm install 실패: ${e.message}`);
      console.warn("  수동으로 'pnpm install' 을 실행해 lockfile 을 재생성하세요.");
    }
  } else {
    console.log("\n⚠ --skip-install — lockfile 재생성을 위해 'pnpm install' 을 직접 실행하세요.");
  }

  return { moves, edits: edits.map(({ path, hits }) => ({ path, hits })) };
}
