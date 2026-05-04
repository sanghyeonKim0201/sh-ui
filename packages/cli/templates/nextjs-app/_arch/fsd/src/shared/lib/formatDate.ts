/**
 * Date → 로케일 기반 날짜 포맷 (시간 없음).
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
