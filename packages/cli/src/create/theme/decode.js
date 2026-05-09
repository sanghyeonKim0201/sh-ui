import { getThemePreset, THEME_PRESET_NAMES } from './presets.js';

const TOKEN_KEYS = [
  'background', 'background-subtle', 'background-muted', 'background-inverse',
  'foreground', 'foreground-muted', 'foreground-subtle', 'foreground-inverse',
  'border', 'border-strong',
  'primary', 'primary-foreground', 'primary-hover',
  'danger', 'danger-foreground',
];

// 옵셔널 색 토큰 — 누락 OK. 입력에 들어 있으면 hex 검증 + inject 시 CSS 변수로 emit.
// 사용자가 success/warning/info 상태 컬러를 커스텀하고 싶을 때 사용.
// v0.68.1+ 부터 ring / danger-hover 도 옵셔널로 — 기존 base64 theme 은 누락된 상태로
// 디코드되고, 신규 preset 은 light/dark 모두 정의해 inject 가 emit (DART 도 OPTIONAL 키
// 가 light/dark 양쪽에 있으면 ShUiColorTokens 의 ring/dangerHover 필드에 자동 매핑).
const OPTIONAL_TOKEN_KEYS = [
  'success', 'success-foreground',
  'warning', 'warning-foreground',
  'info', 'info-foreground',
  'danger-hover',
  'ring',
];

/**
 * 옵셔널 카테고리 검증 — 모두 Record<string, number>.
 * 카테고리 누락은 OK (스캐폴드 시 해당 블록은 디폴트 유지). 형식만 위배되면 에러.
 *
 * 각 카테고리의 expectedKeys 가 정확히 일치해야 함 — 나머지/누락 키 모두 거부.
 */
const SCALAR_CATEGORIES = {
  spacing: ['0', '1', '2', '3', '4', '5', '6', '8', '10', '12', '16'],
  typography: ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl'],
  weights: ['regular', 'medium', 'semibold', 'bold'],
  controls: ['sm', 'md', 'lg'],
  borders: ['width', 'widthStrong'],
  durations: ['fast', 'base', 'slow'],
};

/** Phase 3 — 문자열 카테고리. 형식 자체 검증은 inject 빌더에서 (CSS 그대로 통과 + Dart 변환 시 throw). */
const STRING_CATEGORIES = {
  shadows: ['sm', 'md', 'lg', 'xl'],
  eases: ['standard', 'emphasized'],
  gradients: ['primary', 'surface', 'overlay'],
};

const validateStringCategory = (name, expectedKeys, value) => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`theme 디코드 실패: ${name} 가 객체가 아님`);
  }
  for (const key of expectedKeys) {
    if (!(key in value)) {
      throw new Error(`theme 디코드 실패: ${name}.${key} 누락`);
    }
    const v = value[key];
    if (typeof v !== 'string' || v.length === 0) {
      throw new Error(`theme 디코드 실패: ${name}.${key} 가 빈 문자열 또는 비-문자열 (받은 값: ${JSON.stringify(v)})`);
    }
    if (v.length > 512) {
      throw new Error(`theme 디코드 실패: ${name}.${key} 가 너무 김 (>512자)`);
    }
  }
  for (const key of Object.keys(value)) {
    if (!expectedKeys.includes(key)) {
      throw new Error(`theme 디코드 실패: ${name}.${key} 는 알 수 없는 키`);
    }
  }
};

const validateScalarCategory = (name, expectedKeys, value) => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`theme 디코드 실패: ${name} 가 객체가 아님`);
  }
  for (const key of expectedKeys) {
    if (!(key in value)) {
      throw new Error(`theme 디코드 실패: ${name}.${key} 누락`);
    }
    const v = value[key];
    if (typeof v !== 'number' || Number.isNaN(v) || !Number.isFinite(v)) {
      throw new Error(`theme 디코드 실패: ${name}.${key} 가 유한 숫자가 아님 (받은 값: ${JSON.stringify(v)})`);
    }
    if (v < 0) {
      throw new Error(`theme 디코드 실패: ${name}.${key} 가 음수 (받은 값: ${v})`);
    }
  }
  for (const key of Object.keys(value)) {
    if (!expectedKeys.includes(key)) {
      throw new Error(`theme 디코드 실패: ${name}.${key} 는 알 수 없는 키`);
    }
  }
};

const HEX_REGEX = /^#[0-9A-Fa-f]{6}$/;
const BASE64_REGEX = /^[A-Za-z0-9+/]*={0,2}$/;
const MAX_THEME_BYTES = 10 * 1024; // 정상 테마 ~860 바이트. 10KB 면 10× 여유.

const validateTokenMap = (name, map) => {
  if (!map || typeof map !== 'object') {
    throw new Error(`theme 디코드 실패: ${name} 가 객체가 아님`);
  }
  for (const key of TOKEN_KEYS) {
    if (!(key in map)) {
      throw new Error(`theme 디코드 실패: ${name}.${key} 누락`);
    }
    const value = map[key];
    if (typeof value !== 'string' || !HEX_REGEX.test(value)) {
      throw new Error(
        `theme 디코드 실패: ${name}.${key} 가 hex 포맷이 아님 (받은 값: ${JSON.stringify(value)})`,
      );
    }
  }
  // 옵셔널 키는 들어 있을 때만 hex 검증.
  for (const key of OPTIONAL_TOKEN_KEYS) {
    if (!(key in map)) continue;
    const value = map[key];
    if (typeof value !== 'string' || !HEX_REGEX.test(value)) {
      throw new Error(
        `theme 디코드 실패: ${name}.${key} 가 hex 포맷이 아님 (받은 값: ${JSON.stringify(value)})`,
      );
    }
  }
};

export const decodeTheme = (b64) => {
  if (typeof b64 !== 'string') {
    throw new Error(`theme 디코드 실패: 문자열이 아님`);
  }
  if (b64.length > MAX_THEME_BYTES) {
    throw new Error(
      `theme 크기가 허용 범위를 초과함 (${b64.length} > ${MAX_THEME_BYTES} 바이트). ` +
      `playground 에서 생성한 값만 사용하세요.`
    );
  }
  if (!BASE64_REGEX.test(b64)) {
    throw new Error(`theme 디코드 실패: base64 포맷이 아님`);
  }
  let json;
  try {
    json = Buffer.from(b64, 'base64').toString('utf-8');
  } catch (e) {
    throw new Error(`theme 디코드 실패: base64 디코드 실패 (${e.message})`);
  }
  let parsed;
  try {
    parsed = JSON.parse(json);
  } catch (e) {
    throw new Error(`theme 디코드 실패: JSON 파싱 실패 (${e.message})`);
  }
  validateTokenMap('light', parsed.light);
  validateTokenMap('dark', parsed.dark);
  if (typeof parsed.radius !== 'number' || Number.isNaN(parsed.radius)) {
    throw new Error(`theme 디코드 실패: radius 가 숫자가 아님`);
  }
  if (parsed.radius < 0 || parsed.radius > 1.5) {
    throw new Error(`theme 디코드 실패: radius 가 허용 범위(0~1.5)를 벗어남 (${parsed.radius})`);
  }
  // 옵셔널 카테고리 — 누락은 OK, 들어 있으면 형식 검증.
  for (const [category, expectedKeys] of Object.entries(SCALAR_CATEGORIES)) {
    if (category in parsed) {
      validateScalarCategory(category, expectedKeys, parsed[category]);
    }
  }
  for (const [category, expectedKeys] of Object.entries(STRING_CATEGORIES)) {
    if (category in parsed) {
      validateStringCategory(category, expectedKeys, parsed[category]);
    }
  }
  return parsed;
};

/**
 * --theme 입력 1개 슬롯에 프리셋 이름과 base64 둘 다 받기 위한 리졸버.
 * 프리셋 이름이면 미리 정의된 ThemeConfig 를, 그 외엔 base64 로 간주해 decodeTheme 위임.
 * THEME_PRESET_NAMES 와 base64 알파벳은 둘 다 [a-z]+ 와 충돌하지만 프리셋 사전 매칭이 우선이라
 * 'rose' 같이 우연히 base64 로도 파싱 가능한 짧은 토큰은 프리셋으로 해석된다 (의도).
 */
export const resolveTheme = (input) => {
  if (typeof input !== 'string') {
    throw new Error(`theme 입력 실패: 문자열이 아님`);
  }
  const preset = getThemePreset(input);
  if (preset) return preset;
  // 정상 base64 테마는 200자 이상. 그보다 짧으면 프리셋 오타로 보고 친절한 에러를.
  if (input.length < 50) {
    throw new Error(
      `알 수 없는 테마 프리셋: '${input}'. 지원: ${THEME_PRESET_NAMES.join(', ')} ` +
      `(또는 playground 에서 생성한 base64).`
    );
  }
  return decodeTheme(input);
};

export { TOKEN_KEYS, OPTIONAL_TOKEN_KEYS, THEME_PRESET_NAMES };
