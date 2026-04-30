#!/usr/bin/env node
/**
 * sh-ui 릴리즈 준비 — packages/cli/package.json 과 packages/changelog/versions.json 을
 * 한 번에 갱신하고 다음 단계 (commit / PR / merge / tag) 를 안내한다.
 *
 * 사용법:
 *   node scripts/release.mjs <version|patch|minor|major> [--type minor|patch|major]
 *
 * 예:
 *   node scripts/release.mjs minor          # 0.45.0 → 0.46.0 (자동 type=minor)
 *   node scripts/release.mjs patch          # 0.45.0 → 0.45.1 (자동 type=patch)
 *   node scripts/release.mjs major          # 0.45.0 → 1.0.0  (자동 type=major)
 *   node scripts/release.mjs 1.2.3          # exact (type 미지정 시 minor 가정 — --type 으로 override)
 *   node scripts/release.mjs 0.46.0 --type patch
 *
 * 동작:
 *   1. packages/cli/package.json 의 version 을 새 값으로 갱신
 *   2. packages/changelog/versions.json 맨 앞에 placeholder 엔트리 prepend
 *   3. 다음 단계 (highlights 채우기 → git → PR → merge → tag) 안내 출력
 *
 * 안 하는 것 (의도적):
 *   - git commit / push / tag — 사용자가 highlights 채우고 직접 실행. 자동화하면
 *     실수가 한꺼번에 production 으로 직행함.
 *   - mcp.mjs 의 version — 이미 동적으로 package.json 에서 읽으므로 자동 동기화.
 */

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { existsSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");
const CLI_PKG_PATH = resolve(REPO_ROOT, "packages/cli/package.json");
const VERSIONS_PATH = resolve(REPO_ROOT, "packages/changelog/versions.json");

/* ─────────── 인자 파싱 ─────────── */

function parseArgs(argv) {
  const args = argv.slice(2);
  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    printHelp();
    process.exit(0);
  }
  const positional = args.filter((a) => !a.startsWith("--"));
  const target = positional[0];

  let type;
  const typeIdx = args.indexOf("--type");
  if (typeIdx > -1) type = args[typeIdx + 1];

  return { target, type };
}

function printHelp() {
  console.log(`sh-ui 릴리즈 준비 스크립트

사용법:
  pnpm release <version|patch|minor|major> [--type minor|patch|major]

예:
  pnpm release minor                      # 0.45.0 → 0.46.0 (자동 type=minor)
  pnpm release patch                      # 0.45.0 → 0.45.1 (자동 type=patch)
  pnpm release 1.2.3 --type minor         # exact + type 명시

처리 내용:
  ✓ packages/cli/package.json — version 갱신
  ✓ packages/changelog/versions.json — placeholder 엔트리 prepend
  → highlights / title 자리만 채우면 commit/PR/merge/tag 준비 완료

mcp.mjs 의 version 은 package.json 을 동적으로 읽어 자동 동기화됨 (수동 갱신 불필요).
`);
}

/* ─────────── 버전 계산 ─────────── */

const SEMVER_RE = /^(\d+)\.(\d+)\.(\d+)$/;

function parseSemver(v) {
  const m = SEMVER_RE.exec(v);
  if (!m) throw new Error(`semver 가 아님: ${v}`);
  return { major: +m[1], minor: +m[2], patch: +m[3] };
}

function bump(current, kind) {
  const v = parseSemver(current);
  if (kind === "patch") return `${v.major}.${v.minor}.${v.patch + 1}`;
  if (kind === "minor") return `${v.major}.${v.minor + 1}.0`;
  if (kind === "major") return `${v.major + 1}.0.0`;
  throw new Error(`알 수 없는 bump: ${kind}`);
}

function compareSemver(a, b) {
  const A = parseSemver(a);
  const B = parseSemver(b);
  if (A.major !== B.major) return A.major - B.major;
  if (A.minor !== B.minor) return A.minor - B.minor;
  return A.patch - B.patch;
}

function inferTypeFromBump(currentVer, nextVer) {
  const c = parseSemver(currentVer);
  const n = parseSemver(nextVer);
  if (n.major > c.major) return "major";
  if (n.minor > c.minor) return "minor";
  return "patch";
}

/* ─────────── 메인 ─────────── */

async function main() {
  const { target, type: explicitType } = parseArgs(process.argv);

  if (!target) {
    console.error("✗ <version|patch|minor|major> 인자가 필요합니다. --help 참고.");
    process.exit(1);
  }

  if (!existsSync(CLI_PKG_PATH)) {
    throw new Error(`packages/cli/package.json 을 찾을 수 없음: ${CLI_PKG_PATH}`);
  }
  if (!existsSync(VERSIONS_PATH)) {
    throw new Error(`versions.json 을 찾을 수 없음: ${VERSIONS_PATH}`);
  }

  const cliPkg = JSON.parse(await readFile(CLI_PKG_PATH, "utf8"));
  const currentVersion = cliPkg.version;

  // target = "patch" | "minor" | "major" | exact (X.Y.Z)
  let nextVersion;
  if (target === "patch" || target === "minor" || target === "major") {
    nextVersion = bump(currentVersion, target);
  } else if (SEMVER_RE.test(target)) {
    nextVersion = target;
  } else {
    console.error(`✗ 인자 형식: <X.Y.Z> 또는 patch/minor/major. 받은 값: ${target}`);
    process.exit(1);
  }

  if (compareSemver(nextVersion, currentVersion) <= 0) {
    console.error(`✗ 새 버전 ${nextVersion} 이 현재 ${currentVersion} 이하입니다. 거꾸로 가는 릴리즈는 거부.`);
    process.exit(1);
  }

  const inferredType = inferTypeFromBump(currentVersion, nextVersion);
  const releaseType = explicitType ?? (target === "patch" || target === "minor" || target === "major" ? target : inferredType);

  // versions.json 의 type 필드는 "major" | "minor" | "patch"
  if (!["major", "minor", "patch"].includes(releaseType)) {
    console.error(`✗ --type 은 major/minor/patch. 받은 값: ${releaseType}`);
    process.exit(1);
  }

  // 1) cli/package.json 갱신
  cliPkg.version = nextVersion;
  await writeFile(CLI_PKG_PATH, JSON.stringify(cliPkg, null, 2) + "\n", "utf8");

  // 2) versions.json 맨 앞에 placeholder 엔트리 prepend
  const versions = JSON.parse(await readFile(VERSIONS_PATH, "utf8"));
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD UTC
  const newEntry = {
    version: nextVersion,
    date: today,
    title: "TODO: GitHub Release 제목 (vX.Y.Z — 접두사 제외)",
    type: releaseType,
    highlights: [
      "TODO: 사용자 관점 한 줄 요약",
      "TODO: 두 번째 highlight (3-4 줄 권장)",
    ],
    url: `https://github.com/sanghyeonKim0201/sh-ui/releases/tag/v${nextVersion}`,
  };

  // 중복 검사
  if (versions.versions.some((v) => v.version === nextVersion)) {
    console.error(`✗ versions.json 에 이미 ${nextVersion} 엔트리가 있습니다. 수동 정리 후 재시도.`);
    process.exit(1);
  }

  versions.versions = [newEntry, ...versions.versions];
  await writeFile(VERSIONS_PATH, JSON.stringify(versions, null, 2) + "\n", "utf8");

  // 3) 다음 단계 안내
  console.log(`\n✓ packages/cli/package.json — ${currentVersion} → ${nextVersion}`);
  console.log(`✓ packages/changelog/versions.json — ${nextVersion} 엔트리 prepend (type=${releaseType})`);
  console.log(`\n다음 단계:`);
  console.log(`  1. packages/changelog/versions.json 의 TODO 자리 (title, highlights) 채우기`);
  console.log(`  2. git add packages/cli/package.json packages/changelog/versions.json [기타 변경 파일]`);
  console.log(`  3. git commit -m "release: v${nextVersion} — <한 줄 제목>"`);
  console.log(`  4. git push origin dev`);
  console.log(`  5. gh pr create --base live --head dev --title "release: v${nextVersion} — ..."`);
  console.log(`  6. CI 그린 확인 → gh pr merge --merge`);
  console.log(`  7. git checkout live && git pull && git tag v${nextVersion} && git push origin v${nextVersion}`);
  console.log(`     → publish.yml (npm) + release.yml (GH Release) 자동 발동\n`);
}

main().catch((err) => {
  console.error(`✗ ${err.message}`);
  process.exit(1);
});
