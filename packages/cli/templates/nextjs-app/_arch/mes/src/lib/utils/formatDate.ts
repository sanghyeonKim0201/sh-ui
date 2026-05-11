/**
 * Date → 로케일 기반 날짜 포맷 (시간 없음).
 *
 * 비-i18n 프로젝트면 default 'ko-KR' 사용. next-intl 활성 시엔 이 util 을 직접
 * 부르지 말고 같은 모듈의 hook (`useFormatDate`) 을 사용하세요 — 현재 locale 을
 * 자동으로 따릅니다 (next-intl 플러그인이 emit).
 */
export const formatDate = (date: Date, locale = 'ko-KR'): string =>
  new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);

/**
 * Date → 로케일 기반 날짜 + 시간 포맷 (24h).
 */
export const formatDateTime = (date: Date, locale = 'ko-KR'): string =>
  new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
