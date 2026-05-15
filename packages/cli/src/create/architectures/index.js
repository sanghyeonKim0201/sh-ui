import { fsdArch } from './fsd.js';
import { flatArch } from './flat.js';
import { mesArch } from './mes.js';
import { validateArchitectures } from './archSchema.js';

export const allArchitectures = [fsdArch, flatArch, mesArch];

// 모듈 로드 시점에 모든 arch 디스크립터를 schema 로 검증.
// 누락된 키, 잘못된 형태가 있으면 즉시 에러.
validateArchitectures(allArchitectures);

export const DEFAULT_ARCH = 'fsd';

export function getArchChoices() {
  return allArchitectures.map((a) => ({
    name: `${a.label} — ${a.description}`,
    value: a.name,
  }));
}

export function getArchByName(name) {
  const arch = allArchitectures.find((a) => a.name === name);
  if (!arch) {
    const known = allArchitectures.map((a) => a.name).join(', ');
    throw new Error(`Unknown architecture "${name}". Available: ${known}`);
  }
  return arch;
}

export function isKnownArch(name) {
  return allArchitectures.some((a) => a.name === name);
}

/**
 * platform 에서 사용 가능한 arch 만 필터링.
 * 예: 'next' → fsd, flat / 'flutter' → (현재 없음, 향후 flutter-* 추가 시 노출).
 */
export function getArchesForPlatform(platform) {
  return allArchitectures.filter((a) => a.platforms.includes(platform));
}

/**
 * MCP tool description / CLI --help / docs 어디서나 재사용 가능한 arch 설명 블록.
 * "fsd (FSD) — ..., flat (Flat) — ..., mes (MES) — ..." 처럼 사람-읽기 좋은 한 줄로 직렬화.
 *
 * 외부 AI 에이전트 (Cursor / Codex / Copilot 등) 는 CLAUDE.md 를 읽지 않으므로
 * MCP schema description 에 각 arch 의 의미를 노출해야 mes 같은 도메인-특화 arch
 * 를 deprecated 잔재로 오해하지 않는다 (v0.94.0+).
 */
export function describeArchOptions(platformFilter) {
  const arches = platformFilter ? getArchesForPlatform(platformFilter) : allArchitectures;
  return arches
    .map((a) => `${a.name} (${a.label}) — ${a.description}`)
    .join(' | ');
}

/**
 * 주어진 arch 가 platform 과 호환되는지 검증. 호환 안 되면 친절한 에러.
 * generator/cli-args 양쪽에서 호출.
 */
export function assertArchPlatformCompat(archName, platform) {
  const arch = getArchByName(archName);
  if (!arch.platforms.includes(platform)) {
    const supported = getArchesForPlatform(platform).map((a) => a.name).join(', ') || '(없음)';
    throw new Error(
      `--arch=${archName} 는 platform=${platform} 와 호환되지 않습니다. ` +
      `${platform} 에서 사용 가능: ${supported}`,
    );
  }
  return arch;
}
