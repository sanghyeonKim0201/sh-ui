// sh-ui 의 동작 컨텍스트 해석 — `sh-ui add` 등이 cwd 부터 부모 트리를 walk up 해
// **standalone (sh-ui.config.json 발견)** 또는 **monorepo (pnpm-workspace.yaml 발견)** 컨텍스트 결정.
//
// monorepo 에서 사용자가 어디서 명령을 실행했는지 (apps/web, packages/ui/ui-apps/ui-admin 등)
// 까지 추출해 hintApp 으로 넘김 — `sh-ui add tokens` 가 어느 ui-app 으로 라우팅될지의 기본값.

import { existsSync } from "node:fs";
import path from "node:path";

/**
 * @param {string} startDir - 검색 시작점 (보통 process.cwd())
 * @returns {{kind: 'config', root: string} | {kind: 'monorepo', root: string, hintApp: string|null} | null}
 */
export function findShUiContext(startDir) {
  let dir = path.resolve(startDir);
  while (true) {
    if (existsSync(path.join(dir, "sh-ui.config.json"))) {
      return { kind: "config", root: dir };
    }
    if (existsSync(path.join(dir, "pnpm-workspace.yaml"))) {
      const hintApp = extractHintApp(dir, startDir);
      return { kind: "monorepo", root: dir, hintApp };
    }
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

/**
 * monorepo 루트가 정해진 뒤 startDir 의 상대 경로에서 어느 앱 컨텍스트인지 추출.
 *
 * 매칭 패턴 (모노레포 루트 기준):
 *   - `apps/<name>/...`                            → <name>
 *   - `packages/ui/ui-apps/ui-<name>/...`          → <name>
 *
 * 그 외(루트 자체, packages/ui/ui-core 등)는 null — 호출자가 prompt 또는 fallback.
 */
function extractHintApp(monorepoRoot, startDir) {
  const rel = path.relative(monorepoRoot, path.resolve(startDir));
  if (!rel || rel.startsWith("..")) return null;
  const parts = rel.split(path.sep);
  if (parts[0] === "apps" && parts[1]) {
    return parts[1];
  }
  if (
    parts[0] === "packages" &&
    parts[1] === "ui" &&
    parts[2] === "ui-apps" &&
    parts[3] &&
    parts[3].startsWith("ui-")
  ) {
    return parts[3].slice(3);
  }
  return null;
}
