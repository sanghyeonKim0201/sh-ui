// `sh-ui upgrade-cli` — sh-ui-cli 자체 업그레이드 + 설치 후 자동 진단.
//
// 동작:
//   1) npm registry 에서 sh-ui-cli 의 latest 버전 조회.
//   2) 현재 실행 중인 CLI 의 package.json 에서 버전 읽음.
//   3) 동일하면 "이미 최신" 안내 + 설치된 sh-ui-cli 패키지 (사용자의 node_modules)
//      가 다른지 확인 — devDep 갱신 안내.
//   4) 다르면 install 명령 출력 (사용자의 패키지 매니저에 맞춰).
//   5) --apply 면 실제 install 실행.
//   6) install 후 next-step 안내 — sh-ui doctor / tokens diff.

import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

export const HELP_TEXT = `sh-ui upgrade-cli — sh-ui-cli 자체를 최신으로 업그레이드

사용법:
  sh-ui upgrade-cli              최신 버전 확인 + 변경 내역 미리보기

옵션:
  --apply   실제 설치 후 진단 (미지정 시 미리보기만)

예:
  sh-ui upgrade-cli
  sh-ui upgrade-cli --apply
`;

const CLI_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const REGISTRY_URL = "https://registry.npmjs.org/sh-ui-cli/latest";

async function readCliVersion() {
  const pkg = JSON.parse(
    await readFile(resolve(CLI_ROOT, "package.json"), "utf8"),
  );
  return pkg.version;
}

/** 사용자 프로젝트의 node_modules/sh-ui-cli/package.json 버전 (devDep 으로 설치된 것) */
async function readInstalledVersion(cwd) {
  let dir = resolve(cwd);
  while (true) {
    const candidate = resolve(dir, "node_modules/sh-ui-cli/package.json");
    if (existsSync(candidate)) {
      try {
        const pkg = JSON.parse(await readFile(candidate, "utf8"));
        return { version: pkg.version, path: candidate };
      } catch {
        return null;
      }
    }
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

async function fetchLatestVersion() {
  // node 18+ 는 fetch 기본. 의존성 없는 단순 GET.
  try {
    const res = await fetch(REGISTRY_URL, {
      headers: { accept: "application/json" },
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    return data.version;
  } catch (err) {
    throw new Error(
      `npm registry 에서 latest 버전을 가져오지 못했습니다 (${err.message}). ` +
        "오프라인이거나 registry 접근이 막혔을 수 있습니다.",
    );
  }
}

function detectPackageManager(cwd) {
  let dir = resolve(cwd);
  while (true) {
    if (existsSync(resolve(dir, "pnpm-lock.yaml"))) return "pnpm";
    if (existsSync(resolve(dir, "pnpm-workspace.yaml"))) return "pnpm";
    if (
      existsSync(resolve(dir, "bun.lockb")) ||
      existsSync(resolve(dir, "bun.lock"))
    )
      return "bun";
    if (existsSync(resolve(dir, "yarn.lock"))) return "yarn";
    if (existsSync(resolve(dir, "package-lock.json"))) return "npm";
    const parent = dirname(dir);
    if (parent === dir) return "npm";
    dir = parent;
  }
}

function installCommand(pm, version) {
  const addCmd = pm === "npm" ? "install -D" : "add -D";
  return `${pm} ${addCmd} sh-ui-cli@${version}`;
}

function runInstall(pm, version, cwd) {
  const args = pm === "npm" ? ["install", "-D"] : ["add", "-D"];
  args.push(`sh-ui-cli@${version}`);
  console.log(`\n실행: ${pm} ${args.join(" ")}\n`);
  const isWin = process.platform === "win32";
  return new Promise((ok, bad) => {
    const child = spawn(pm, args, { cwd, stdio: "inherit", shell: isWin });
    child.on("exit", (code) =>
      code === 0 ? ok() : bad(new Error(`${pm} exited with code ${code}`)),
    );
    child.on("error", bad);
  });
}

/**
 * versions.json 에서 from..to 사이의 highlights 를 추출.
 * from = 사용자 현재, to = latest. 없으면 최근 N개만.
 */
async function readChangelogRange(fromVersion, toVersion) {
  const candidates = [
    resolve(CLI_ROOT, "data/changelog/versions.json"), // bundled
    resolve(CLI_ROOT, "../changelog/versions.json"), // monorepo dev
  ];
  let path;
  for (const p of candidates) {
    if (existsSync(p)) {
      path = p;
      break;
    }
  }
  if (!path) return null;
  const data = JSON.parse(await readFile(path, "utf8"));
  const versions = data.versions ?? [];
  if (!fromVersion || !toVersion) return versions.slice(0, 5);
  // versions 는 최신 → 옛날 순. from 보다 새로운 것만 추출 (from 자기 자신은 제외).
  const out = [];
  for (const v of versions) {
    if (v.version === fromVersion) break;
    out.push(v);
  }
  return out;
}

export async function runUpgradeCli({ cwd, apply }) {
  const installed = await readInstalledVersion(cwd);
  console.log(`\nsh-ui-cli 업그레이드 점검\n`);

  const latest = await fetchLatestVersion();
  console.log(`  npm latest    : v${latest}`);
  if (installed) {
    console.log(`  현재 설치본    : v${installed.version}`);
  } else {
    console.log(`  현재 설치본    : (찾지 못함 — npx 로 실행 중일 수 있음)`);
  }

  const reference = installed?.version ?? (await readCliVersion());
  if (reference === latest) {
    console.log(`\n✓ 이미 최신.\n`);
    console.log(`다음 단계 권장:\n  sh-ui doctor — 프로젝트 정합성 점검`);
    return;
  }

  const changelog = await readChangelogRange(reference, latest);
  if (changelog && changelog.length > 0) {
    console.log(`\n변경 highlights (${changelog.length}개 릴리즈):`);
    for (const v of changelog) {
      const type = v.type ? ` [${v.type}]` : "";
      console.log(`  v${v.version}${type} — ${v.title}`);
    }
  }

  const pm = detectPackageManager(cwd);
  const cmd = installCommand(pm, latest);

  if (!apply) {
    console.log(`\n설치 명령:\n  ${cmd}\n`);
    console.log(
      `실제 실행하려면: \`sh-ui upgrade-cli --apply\` (자동 install + 설치 후 doctor)`,
    );
    return;
  }

  // --apply
  await runInstall(pm, latest, cwd);
  console.log(`\n✓ sh-ui-cli@${latest} 설치 완료.\n`);
  console.log(
    `다음 단계 (필요 시):\n` +
      `  sh-ui doctor                — 신규 토큰 누락 / config 이슈 진단\n` +
      `  sh-ui tokens diff           — buildTokens 와 비교 미리보기\n` +
      `  sh-ui tokens upgrade --apply — 추가만 incremental 적용 (사용자 편집 보존)`,
  );
}
