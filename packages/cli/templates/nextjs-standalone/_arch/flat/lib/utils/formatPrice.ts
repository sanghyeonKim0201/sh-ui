/**
 * 숫자 → 통화 포맷. default ko-KR + KRW 이지만 두 인자 모두 override 가능.
 * 예: formatPrice(12000)            → "₩12,000"
 *     formatPrice(99.5, 'en-US', 'USD') → "$99.50"
 *
 * next-intl 활성 시엔 같은 모듈의 hook (`useFormatPrice`) 을 사용하면 현재
 * locale 을 자동으로 따릅니다 (next-intl 플러그인이 emit).
 */
export const formatPrice = (
  amount: number,
  locale = 'ko-KR',
  currency = 'KRW',
): string =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'KRW' ? 0 : 2,
  }).format(amount);
