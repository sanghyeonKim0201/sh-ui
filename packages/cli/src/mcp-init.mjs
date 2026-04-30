// sh-ui mcp init — 타깃 IDE 의 MCP 설정 파일에 sh-ui 엔트리를 자동 추가.
//
// 지원 클라이언트:
//   claude-code     — project: <cwd>/.mcp.json,           user: ~/.claude.json
//   cursor          — project: <cwd>/.cursor/mcp.json,    user: ~/.cursor/mcp.json
//   claude-desktop  — user 만 (OS 별 경로 자동 분기)
//
// 주의: Claude Code 의 user-scope 설정은 `~/.claude/mcp.json` 같은 별도
// 파일이 아니라 사용자 settings 전체가 들어가는 단일 JSON `~/.claude.json`
// 이다. 이 파일에는 mcpServers 외에도 projects·history 등 다른 키가 같이
// 들어 있으므로, 머지 시 다른 키를 절대 건드리지 않아야 한다.
//
// 동작: 기존 JSON 의 mcpServers.sh-ui 를 머지(있으면 덮어쓰기), 디렉토리 자동 생성.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve, relative } from "node:path";
import { homedir, platform as osPlatform } from "node:os";

const CLIENTS = ["claude-code", "cursor", "claude-desktop"];

/**
 * `npx -y <cliName> mcp` 형태의 MCP 엔트리 빌더.
 * 패키지명을 package.json 에서 동적으로 읽어 cli rename 시에도 자동 따라감.
 */
async function buildShUiEntry() {
  const pkgUrl = new URL("../package.json", import.meta.url);
  const pkg = JSON.parse(await readFile(pkgUrl, "utf8"));
  return {
    command: "npx",
    args: ["-y", pkg.name, "mcp"],
  };
}

/** 클라이언트·스코프별 설정 파일 절대 경로. */
function resolveConfigPath(client, scope, cwd) {
  const home = homedir();
  if (client === "claude-code") {
    return scope === "user"
      ? resolve(home, ".claude.json")
      : resolve(cwd, ".mcp.json");
  }
  if (client === "cursor") {
    return scope === "user"
      ? resolve(home, ".cursor", "mcp.json")
      : resolve(cwd, ".cursor", "mcp.json");
  }
  if (client === "claude-desktop") {
    if (scope !== "user") {
      throw new Error(
        "claude-desktop 은 user 스코프만 지원합니다. --scope user 또는 --scope 생략.",
      );
    }
    const os = osPlatform();
    if (os === "darwin") {
      return resolve(
        home,
        "Library",
        "Application Support",
        "Claude",
        "claude_desktop_config.json",
      );
    }
    if (os === "win32") {
      const appData = process.env.APPDATA ?? resolve(home, "AppData", "Roaming");
      return resolve(appData, "Claude", "claude_desktop_config.json");
    }
    // linux + 기타
    return resolve(home, ".config", "Claude", "claude_desktop_config.json");
  }
  throw new Error(`알 수 없는 클라이언트: ${client}. 허용: ${CLIENTS.join(", ")}`);
}

/** 클라이언트별 기본 스코프. claude-desktop 은 user 강제. */
function defaultScope(client) {
  return client === "claude-desktop" ? "user" : "project";
}

/** JSON 읽기 (없으면 빈 객체). 깨진 JSON 은 명시적 에러. */
async function readJsonOrEmpty(path) {
  if (!existsSync(path)) return {};
  let raw;
  try {
    raw = await readFile(path, "utf8");
  } catch (err) {
    throw new Error(`설정 파일 읽기 실패: ${path}\n  ${err.message}`);
  }
  if (raw.trim() === "") return {};
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(
      `기존 ${path} 가 유효한 JSON 이 아닙니다. 수동으로 고치고 다시 시도하세요.\n  ${err.message}`,
    );
  }
}

export async function mcpInit({ cwd, args }) {
  const flags = parseFlags(args);
  const client = flags.client;
  if (!client) {
    throw new Error(
      `--client 가 필요합니다. 허용: ${CLIENTS.join(", ")}\n` +
        `예: sh-ui mcp init --client claude-code`,
    );
  }
  if (!CLIENTS.includes(client)) {
    throw new Error(
      `알 수 없는 클라이언트: '${client}'. 허용: ${CLIENTS.join(", ")}`,
    );
  }

  const scope = flags.scope ?? defaultScope(client);
  if (!["user", "project"].includes(scope)) {
    throw new Error(`--scope 는 'user' 또는 'project' 여야 합니다.`);
  }

  const configPath = resolveConfigPath(client, scope, cwd);
  const config = await readJsonOrEmpty(configPath);

  if (!config.mcpServers || typeof config.mcpServers !== "object") {
    config.mcpServers = {};
  }

  const before = config.mcpServers["sh-ui"];
  config.mcpServers["sh-ui"] = await buildShUiEntry();

  await mkdir(dirname(configPath), { recursive: true });
  await writeFile(configPath, JSON.stringify(config, null, 2) + "\n", "utf8");

  const rel = relative(cwd, configPath);
  const display = rel.startsWith("..") ? configPath : rel;
  const verb = before ? "갱신" : "추가";
  console.log(`✓ sh-ui MCP 엔트리 ${verb} → ${display}`);
  console.log(`  client: ${client} (scope: ${scope})`);
  if (client === "claude-code" || client === "cursor") {
    console.log(`\n다음 단계: ${client === "claude-code" ? "Claude Code" : "Cursor"} 를 재시작하면 sh-ui 툴이 활성화됩니다.`);
  } else {
    console.log(`\n다음 단계: Claude Desktop 을 종료 후 재시작하면 sh-ui 툴이 활성화됩니다.`);
  }
}

/** --key=value / --key value 파싱 */
function parseFlags(args) {
  const flags = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (!a.startsWith("--")) continue;
    const eq = a.indexOf("=");
    if (eq > -1) flags[a.slice(2, eq)] = a.slice(eq + 1);
    else flags[a.slice(2)] = args[++i];
  }
  return flags;
}
