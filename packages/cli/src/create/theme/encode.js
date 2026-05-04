import { decodeTheme } from './decode.js';

/**
 * 사용자/AI 가 손본 토큰 객체를 sh-ui base64 테마 문자열로 인코딩.
 * `sh_ui_create_project` 의 `theme` 인자에 그대로 넘겨 영구 보관 가능.
 *
 * 입력 형태: `{ light, dark, radius, ...옵셔널 카테고리 }`
 *   - light/dark: 15개 필수 토큰 (background, foreground, primary, danger 계열) + 옵셔널 6개 (success/warning/info)
 *   - radius: 0~1.5 (rem 단위)
 *   - 옵셔널: spacing/typography/weights/controls/borders/durations/shadows/eases/gradients
 *
 * 인코드 직후 round-trip 검증으로 디코더가 거부할 입력은 즉시 throw.
 */
export const encodeTheme = (theme) => {
  if (!theme || typeof theme !== 'object' || Array.isArray(theme)) {
    throw new Error('theme 인코드 실패: 객체가 아님');
  }
  const json = JSON.stringify(theme);
  const b64 = Buffer.from(json, 'utf-8').toString('base64');
  // 같은 검증 로직을 한 곳에 두기 위해 round-trip — 인코드 산출물을 즉시 디코드해 본다.
  // throw 면 입력이 스키마에 안 맞다는 뜻이라 그대로 호출자에게 전파.
  decodeTheme(b64);
  return b64;
};
