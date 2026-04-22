const TOKEN_KEYS = [
  'background', 'background-subtle', 'background-muted',
  'foreground', 'foreground-muted',
  'border', 'border-strong',
  'primary', 'primary-foreground', 'primary-hover',
  'danger', 'danger-foreground',
];

const HEX_REGEX = /^#[0-9A-Fa-f]{6}$/;
const BASE64_REGEX = /^[A-Za-z0-9+/]*={0,2}$/;

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
};

export const decodeTheme = (b64) => {
  if (typeof b64 !== 'string' || !BASE64_REGEX.test(b64)) {
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
  return parsed;
};

export { TOKEN_KEYS };
