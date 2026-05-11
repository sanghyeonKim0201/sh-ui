import { describe, it, expect } from "vitest";
import { upsertCodexMcpServer } from "../src/mcp-init.mjs";

const ENTRY = { command: "npx", args: ["-y", "sh-ui-cli", "mcp"] };

describe("upsertCodexMcpServer", () => {
  it("빈 파일에 새 섹션을 append 한다", () => {
    const { text, had } = upsertCodexMcpServer("", "sh-ui", ENTRY);
    expect(had).toBe(false);
    expect(text).toBe(
      `[mcp_servers.sh-ui]\ncommand = "npx"\nargs = ["-y", "sh-ui-cli", "mcp"]\n`,
    );
  });

  it("기존 섹션·주석을 보존하고 끝에 append 한다", () => {
    const raw = `# 사용자 메모\nmodel = "gpt-5"\n\n[history]\nenabled = true\n`;
    const { text, had } = upsertCodexMcpServer(raw, "sh-ui", ENTRY);
    expect(had).toBe(false);
    expect(text).toContain(`# 사용자 메모`);
    expect(text).toContain(`[history]`);
    expect(text).toContain(`enabled = true`);
    expect(text).toMatch(/\n\[mcp_servers\.sh-ui\]\ncommand = "npx"\n/);
    // history 섹션이 mcp_servers 보다 앞에 와야 함 (순서 보존)
    expect(text.indexOf("[history]")).toBeLessThan(text.indexOf("[mcp_servers.sh-ui]"));
  });

  it("기존 [mcp_servers.sh-ui] 를 통째로 교체하고 had=true", () => {
    const raw = `[mcp_servers.sh-ui]\ncommand = "old"\nargs = ["x"]\n\n[other]\nk = 1\n`;
    const { text, had } = upsertCodexMcpServer(raw, "sh-ui", ENTRY);
    expect(had).toBe(true);
    expect(text).not.toContain(`command = "old"`);
    expect(text).not.toContain(`args = ["x"]`);
    expect(text).toContain(`[other]\nk = 1`);
    expect(text).toMatch(/\[mcp_servers\.sh-ui\]\ncommand = "npx"\nargs = \["-y", "sh-ui-cli", "mcp"\]/);
  });

  it("[mcp_servers.sh-ui.env] 같은 하위 섹션도 함께 제거한다", () => {
    const raw = `[mcp_servers.sh-ui]\ncommand = "old"\n\n[mcp_servers.sh-ui.env]\nFOO = "bar"\n\n[keep]\nx = 1\n`;
    const { text } = upsertCodexMcpServer(raw, "sh-ui", ENTRY);
    expect(text).not.toContain("FOO = ");
    expect(text).not.toContain(`command = "old"`);
    expect(text).toContain(`[keep]\nx = 1`);
    // 새 블록은 env 없으니 한 섹션만
    expect(text.match(/\[mcp_servers\.sh-ui/g) ?? []).toHaveLength(1);
  });

  it("env 가 있으면 [mcp_servers.sh-ui.env] 서브섹션을 함께 출력", () => {
    const entry = { ...ENTRY, env: { TOKEN: "xyz" } };
    const { text } = upsertCodexMcpServer("", "sh-ui", entry);
    expect(text).toContain(`[mcp_servers.sh-ui.env]\nTOKEN = "xyz"`);
  });

  it("다른 mcp_servers.* 섹션은 건드리지 않는다", () => {
    const raw = `[mcp_servers.other]\ncommand = "node"\nargs = ["foo.js"]\n`;
    const { text, had } = upsertCodexMcpServer(raw, "sh-ui", ENTRY);
    expect(had).toBe(false);
    expect(text).toContain(`[mcp_servers.other]\ncommand = "node"\nargs = ["foo.js"]`);
    expect(text).toContain(`[mcp_servers.sh-ui]`);
  });

  it("따옴표로 감싼 헤더 [mcp_servers.\"sh-ui\"] 도 인식해 교체", () => {
    const raw = `[mcp_servers."sh-ui"]\ncommand = "old"\n`;
    const { text, had } = upsertCodexMcpServer(raw, "sh-ui", ENTRY);
    expect(had).toBe(true);
    expect(text).not.toContain(`command = "old"`);
    expect(text).toContain(`[mcp_servers.sh-ui]\ncommand = "npx"`);
  });

  it("inline-table 형태로 정의돼 있으면 명시적 에러", () => {
    const raw = `[mcp_servers]\nsh-ui = { command = "npx", args = ["mcp"] }\n`;
    expect(() => upsertCodexMcpServer(raw, "sh-ui", ENTRY)).toThrow(/inline-table/);
  });

  it("두 번 연속 호출해도 멱등 (다른 섹션 형태 유지)", () => {
    const raw = `[history]\nenabled = true\n`;
    const once = upsertCodexMcpServer(raw, "sh-ui", ENTRY).text;
    const twice = upsertCodexMcpServer(once, "sh-ui", ENTRY).text;
    expect(twice).toBe(once);
  });
});
