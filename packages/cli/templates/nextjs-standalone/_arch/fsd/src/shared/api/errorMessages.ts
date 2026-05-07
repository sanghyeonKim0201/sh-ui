import { ApiError } from './error';

/**
 * 에러 코드 → 사용자 facing 메시지 mapping.
 *
 * 백엔드가 보내는 raw `error.message` 를 그대로 toast 로 띄우면 i18n 어긋나거나
 * 내부 노출이 될 수 있어, frontend 가 정의한 안전한 메시지로 변환하는 게 권장.
 * 코드별로 명시 안 된 경우 `error.data.message` (backend 메시지) → fallback.
 *
 * 사용자 프로젝트에서 자유롭게 추가/수정. next-intl 활성 시엔 `useTranslations`
 * 와 결합해 hook 형태로 변환 가능 (이 파일은 RSC/CSR 양쪽 호환을 위해 module).
 */
export const ERROR_MESSAGES: Record<string, string> = {
  UNAUTHORIZED: '로그인이 필요합니다.',
  FORBIDDEN: '접근 권한이 없습니다.',
  NOT_FOUND: '요청한 리소스를 찾을 수 없습니다.',
  NETWORK_ERROR: '서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.',
  // 사용자 정의 코드를 여기에 추가하세요.
};

const DEFAULT_FALLBACK = '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';

/**
 * 에러 → 사용자 facing 메시지 결정.
 *  1. ApiError + 코드가 ERROR_MESSAGES 에 있으면 그 메시지
 *  2. ApiError 의 backend `data.message` (있으면)
 *  3. 호출자의 fallback
 *  4. 글로벌 DEFAULT_FALLBACK
 */
export function resolveErrorMessage(error: unknown, fallback?: string): string {
  if (error instanceof ApiError) {
    const mapped = ERROR_MESSAGES[error.code];
    if (mapped) return mapped;
    if (error.data?.message) return error.data.message;
  }
  return fallback ?? DEFAULT_FALLBACK;
}
