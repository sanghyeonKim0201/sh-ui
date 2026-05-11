// sh-ui mcp init — 타깃 IDE 의 MCP 설정 파일에 sh-ui 엔트리를 자동 추가.
//
// 지원 클라이언트:
//   claude-code     — project: <cwd>/.mcp.json,           user: ~/.claude.json
//   cursor          — project: <cwd>/.cursor/mcp.json,    user: ~/.cursor/mcp.json
//   claude-desktop  — user 만 (OS 별 경로 자동 분기)
//   codex           — user 만 (~/.codex/config.toml — TOML 포맷)
//
// 주의: Claude Code 의 user-scope 설정은 `~/.claude/mcp.json` 같은 별도
// 파일이 아니라 사용자 settings 전체가 들어가는 단일 JSON `~/.claude.json`
// 이다. 이 파일에는 mcpServers 외에도 projects·history 등 다른 키가 같이
// 들어 있으므로, 머지 시 다른 키를 절대 건드리지 않아야 한다. codex 의
// config.toml 도 같은 원칙 — 다른 섹션은 건드리지 않고 `[mcp_servers.sh-ui]`
// 만 upsert 한다.
//
// 동작: JSON 클라이언트는 mcpServers.sh-ui 머지(있으면 덮어쓰기). codex 는
// `[mcp_servers.sh-ui]` 섹션 텍스트를 통째로 교체(존재하지 않으면 append).
// 디렉토리는 자동 생성.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve, relative } from "node:path";
import { homedir, platform as osPlatform } from "node:os";

const CLIENTS = ["claude-code", "cursor", "claude-desktop", "codex"];

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
  if (client === "codex") {
    if (scope !== "user") {
      throw new Error(
        "codex 는 user 스코프만 지원합니다. --scope user 또는 --scope 생략.",
      );
    }
    return resolve(home, ".codex", "config.toml");
  }
  throw new Error(`알 수 없는 클라이언트: ${client}. 허용: ${CLIENTS.join(", ")}`);
}

/** 클라이언트별 기본 스코프. claude-desktop·codex 는 user 강제. */
function defaultScope(client) {
  return client === "claude-desktop" || client === "codex" ? "user" : "project";
}

/**
 * codex `~/.codex/config.toml` 의 `[mcp_servers.<name>]` 섹션 upsert.
 *
 * 텍스트 기반 — 다른 섹션·주석·공백을 보존하기 위해 TOML 파서를 안 쓴다.
 * `[mcp_servers.<name>]` 와 그 하위 (`[mcp_servers.<name>.env]` 등) 모두
 * 제거 후, 새 블록을 파일 끝에 append.
 *
 * 한계: 사용자가 inline-table 형태(`[mcp_servers]` 부모 섹션 안에
 * `sh-ui = { command = ... }`)로 정의해두면 그건 감지·정리하지 못한다.
 * 그 경우 새 섹션과 충돌하므로 detect → 명시적 에러.
 */
export function upsertCodexMcpServer(raw, name, entry) {
  detectInlineMcpServer(raw, name);
  const had = hasCodexMcpServerSection(raw, name);

  const lines = raw.split("\n");
  const out = [];
  let i = 0;
  while (i < lines.length) {
    if (isOurSectionHeader(lines[i], name)) {
      // 섹션 본문 끝(다음 헤더 직전 또는 EOF)까지 skip
      i++;
      while (i < lines.length && !isAnySectionHeader(lines[i])) i++;
      // 새 블록을 끝에 붙일 거라, 우리가 지운 섹션 직전의 빈 줄은 정리
      while (out.length && out[out.length - 1].trim() === "") out.pop();
    } else {
      out.push(lines[i]);
      i++;
    }
  }

  let head = out.join("\n").replace(/\s+$/, "");
  const block = renderCodexBlock(name, entry);
  const next = head === "" ? block + "\n" : head + "\n\n" + block + "\n";
  return { text: next, had };
}

function isAnySectionHeader(line) {
  return /^\s*\[[^\]]+\]\s*$/.test(line);
}

function isOurSectionHeader(line, name) {
  const m = line.match(/^\s*\[([^\]]+)\]\s*$/);
  if (!m) return false;
  const path = m[1].trim();
  const bare = `mcp_servers.${name}`;
  const quoted = `mcp_servers."${name}"`;
  return (
    path === bare ||
    path === quoted ||
    path.startsWith(bare + ".") ||
    path.startsWith(quoted + ".")
  );
}

function hasCodexMcpServerSection(raw, name) {
  return raw.split("\n").some((line) => {
    const m = line.match(/^\s*\[([^\]]+)\]\s*$/);
    if (!m) return false;
    const path = m[1].trim();
    return path === `mcp_servers.${name}` || path === `mcp_servers."${name}"`;
  });
}

/** `[mcp_servers]` 부모 섹션 안에 `<name> =` 로 inline 정의돼 있으면 에러. */
function detectInlineMcpServer(raw, name) {
  const lines = raw.split("\n");
  let inMcpServers = false;
  for (const line of lines) {
    const headerMatch = line.match(/^\s*\[([^\]]+)\]\s*$/);
    if (headerMatch) {
      inMcpServers = headerMatch[1].trim() === "mcp_servers";
      continue;
    }
    if (!inMcpServers) continue;
    const keyRegex = new RegExp(`^\\s*(?:${escapeReg(name)}|"${escapeReg(name)}")\\s*=`);
    if (keyRegex.test(line)) {
      throw new Error(
        `기존 config.toml 의 [mcp_servers] 섹션 안에 '${name}' 가 inline-table 로 정의돼 있습니다.\n` +
          `자동 갱신을 지원하지 않으니, 해당 줄을 직접 제거한 뒤 다시 실행하세요.`,
      );
    }
  }
}

function escapeReg(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function renderCodexBlock(name, entry) {
  const header = `[mcp_servers.${tomlBareOrQuoted(name)}]`;
  const lines = [header];
  lines.push(`command = ${tomlBasicString(entry.command)}`);
  lines.push(`args = ${tomlInlineArray(entry.args)}`);
  if (entry.env && Object.keys(entry.env).length > 0) {
    lines.push("");
    lines.push(`[mcp_servers.${tomlBareOrQuoted(name)}.env]`);
    for (const [k, v] of Object.entries(entry.env)) {
      lines.push(`${tomlBareOrQuoted(k)} = ${tomlBasicString(v)}`);
    }
  }
  return lines.join("\n");
}

function tomlBareOrQuoted(key) {
  return /^[A-Za-z0-9_-]+$/.test(key) ? key : tomlBasicString(key);
}

function tomlBasicString(s) {
  // TOML basic string 은 JSON string 과 escape 규칙이 호환 (\" \\ \n \t \r \b \f \uXXXX).
  // ASCII 위주 값(npx, sh-ui-cli, mcp 등)에 한해 안전.
  return JSON.stringify(String(s));
}

function tomlInlineArray(arr) {
  return `[${arr.map(tomlBasicString).join(", ")}]`;
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
  const entry = await buildShUiEntry();

  let had;
  if (client === "codex") {
    const raw = existsSync(configPath) ? await readFile(configPath, "utf8") : "";
    const { text, had: existed } = upsertCodexMcpServer(raw, "sh-ui", entry);
    had = existed;
    await mkdir(dirname(configPath), { recursive: true });
    await writeFile(configPath, text, "utf8");
  } else {
    const config = await readJsonOrEmpty(configPath);
    if (!config.mcpServers || typeof config.mcpServers !== "object") {
      config.mcpServers = {};
    }
    had = Boolean(config.mcpServers["sh-ui"]);
    config.mcpServers["sh-ui"] = entry;
    await mkdir(dirname(configPath), { recursive: true });
    await writeFile(configPath, JSON.stringify(config, null, 2) + "\n", "utf8");
  }

  const rel = relative(cwd, configPath);
  const display = rel.startsWith("..") ? configPath : rel;
  const verb = had ? "갱신" : "추가";
  console.log(`✓ sh-ui MCP 엔트리 ${verb} → ${display}`);
  console.log(`  client: ${client} (scope: ${scope})`);
  const restartTarget = {
    "claude-code": "Claude Code",
    cursor: "Cursor",
    "claude-desktop": "Claude Desktop",
    codex: "codex CLI 세션",
  }[client];
  console.log(`\n다음 단계: ${restartTarget} 를 재시작하면 sh-ui 툴이 활성화됩니다.`);
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
