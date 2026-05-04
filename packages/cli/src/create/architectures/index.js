import { fsdArch } from './fsd.js';
import { flatArch } from './flat.js';
import { validateArchitectures } from './archSchema.js';

export const allArchitectures = [fsdArch, flatArch];

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
