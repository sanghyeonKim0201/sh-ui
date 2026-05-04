/**
 * 숫자 → 한국 원화(KRW) 포맷. 소수점 없음.
 * 예: 12000 → "₩12,000"
 */
export const formatPrice = (amount: number, locale = 'ko-KR'): string =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(amount);
