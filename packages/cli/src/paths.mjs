// 데이터 파일(레지스트리·토큰·summaries·versions) 위치 해석.
//
// 두 가지 실행 모드를 자동 감지한다:
//   1) 모노레포 모드 — 이 레포 안에서 직접 실행 (`pnpm sh-ui ...`)
//      → 데이터는 `<repo>/packages/{registry,tokens,llms,changelog}` 에 있음
//   2) 출고 모드 — npm 으로 설치돼서 실행 (`npx sh-ui-cli ...`)
//      → 데이터는 `<cli>/data/{registry,tokens,summaries,changelog}` 에 있음
//        (prepublishOnly 가 모노레포에서 복사해 둔다)

import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const CLI_ROOT = resolve(__dirname, "..");
const BUNDLED_DATA = resolve(CLI_ROOT, "data");
const MONOREPO_PACKAGES = resolve(CLI_ROOT, "..");

const isBundled = existsSync(resolve(BUNDLED_DATA, "registry"));

/** 컴포넌트 레지스트리 루트 (registry.json + 소스 파일들) */
export function getRegistryRoot(platform) {
  return isBundled
    ? resolve(BUNDLED_DATA, "registry", platform)
    : resolve(MONOREPO_PACKAGES, "registry", platform);
}

/** @sh-ui/tokens 패키지 루트 (build.mjs + src/) */
export function getTokensRoot() {
  return isBundled
    ? resolve(BUNDLED_DATA, "tokens")
    : resolve(MONOREPO_PACKAGES, "tokens");
}

/** registry.json deps 에 등장하는 npm 패키지의 버전 범위 맵 */
export function getPeerVersionsPath(platform) {
  return isBundled
    ? resolve(BUNDLED_DATA, "registry", platform, "peer-versions.json")
    : resolve(MONOREPO_PACKAGES, "registry", platform, "peer-versions.json");
}

/** llms 요약 JSON (platform별) */
export function getSummariesPath(platform) {
  return isBundled
    ? resolve(BUNDLED_DATA, "summaries", `${platform}.json`)
    : resolve(MONOREPO_PACKAGES, "llms", "summaries", `${platform}.json`);
}

/** sh-ui create 용 프로젝트 템플릿 루트 — 이 패키지 안에 직접 들어있다 */
export function getTemplatesRoot() {
  return resolve(CLI_ROOT, "templates");
}

/** 변경 내역 JSON */
export function getVersionsPath() {
  return isBundled
    ? resolve(BUNDLED_DATA, "changelog", "versions.json")
    : resolve(MONOREPO_PACKAGES, "changelog", "versions.json");
}

export function getRunMode() {
  return isBundled ? "bundled" : "monorepo";
}
