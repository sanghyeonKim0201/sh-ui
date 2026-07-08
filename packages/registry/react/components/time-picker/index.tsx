"use client";

/* ───────── 순수 시각 헬퍼 (테스트 대상) ───────── */

export interface TimeSegments {
  /** 0–23 (항상 24시간제 내부 표현) */
  hours: number;
  /** 0–59 */
  minutes: number;
  /** 0–59 */
  seconds: number;
}

export function getSegments(date: Date): TimeSegments {
  return { hours: date.getHours(), minutes: date.getMinutes(), seconds: date.getSeconds() };
}

/** base의 날짜를 보존한 채 시/분/초만 교체한 새 Date. base 없으면 오늘 기준. */
export function applySegments(base: Date | undefined, seg: TimeSegments): Date {
  const d = base ? new Date(base) : new Date();
  d.setHours(seg.hours, seg.minutes, seg.seconds, 0);
  return d;
}

export function secondsOfDay(seg: TimeSegments): number {
  return seg.hours * 3600 + seg.minutes * 60 + seg.seconds;
}

export function timeSecondsOf(date: Date): number {
  return date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
}

/** min/max를 하루 중 시각(초 offset)으로만 비교해 클램프. 날짜 부분 무시. */
export function clampSegments(seg: TimeSegments, min?: Date, max?: Date): TimeSegments {
  let s = secondsOfDay(seg);
  if (min !== undefined) s = Math.max(s, timeSecondsOf(min));
  if (max !== undefined) s = Math.min(s, timeSecondsOf(max));
  return { hours: Math.floor(s / 3600), minutes: Math.floor((s % 3600) / 60), seconds: s % 60 };
}

/** [min, max] 양끝 포함 랩어라운드. */
export function wrap(value: number, min: number, max: number): number {
  const range = max - min + 1;
  return (((value - min) % range) + range) % range + min;
}

export function inferHour12(locale: string): boolean {
  try {
    return new Intl.DateTimeFormat(locale, { hour: "numeric" }).resolvedOptions().hour12 ?? false;
  } catch {
    return false;
  }
}

export function to12h(hours24: number): { hour: number; meridiem: "am" | "pm" } {
  const meridiem: "am" | "pm" = hours24 < 12 ? "am" : "pm";
  const hour = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return { hour, meridiem };
}

export function from12h(hour12: number, meridiem: "am" | "pm"): number {
  const base = hour12 % 12; // 12 → 0
  return meridiem === "pm" ? base + 12 : base;
}

export function defaultFormatTime(
  date: Date,
  opts: { locale: string; showSeconds: boolean; hour12: boolean },
): string {
  return new Intl.DateTimeFormat(opts.locale, {
    hour: "2-digit",
    minute: "2-digit",
    second: opts.showSeconds ? "2-digit" : undefined,
    hour12: opts.hour12,
  }).format(date);
}
