import { describe, it, expect } from "vitest";
import {
  getSegments,
  applySegments,
  timeSecondsOf,
  secondsOfDay,
  clampSegments,
  wrap,
  to12h,
  from12h,
  defaultFormatTime,
} from "./index";

describe("time helpers", () => {
  it("getSegments extracts h/m/s", () => {
    expect(getSegments(new Date(2020, 0, 1, 13, 5, 9))).toEqual({ hours: 13, minutes: 5, seconds: 9 });
  });

  it("applySegments preserves the base date, replaces time", () => {
    const base = new Date(2020, 4, 20, 8, 0, 0);
    const out = applySegments(base, { hours: 23, minutes: 30, seconds: 15 });
    expect([out.getFullYear(), out.getMonth(), out.getDate()]).toEqual([2020, 4, 20]);
    expect([out.getHours(), out.getMinutes(), out.getSeconds()]).toEqual([23, 30, 15]);
  });

  it("applySegments with no base uses a fresh date but sets given time", () => {
    const out = applySegments(undefined, { hours: 1, minutes: 2, seconds: 3 });
    expect([out.getHours(), out.getMinutes(), out.getSeconds()]).toEqual([1, 2, 3]);
  });

  it("secondsOfDay / timeSecondsOf agree", () => {
    const d = new Date(2020, 0, 1, 2, 3, 4);
    expect(timeSecondsOf(d)).toBe(secondsOfDay({ hours: 2, minutes: 3, seconds: 4 }));
    expect(secondsOfDay({ hours: 1, minutes: 0, seconds: 0 })).toBe(3600);
  });

  it("clampSegments clamps by time-of-day, ignoring the date part of min/max", () => {
    const min = new Date(1999, 0, 1, 9, 0, 0);  // 09:00
    const max = new Date(2050, 11, 31, 17, 0, 0); // 17:00
    expect(clampSegments({ hours: 6, minutes: 0, seconds: 0 }, min, max)).toEqual({ hours: 9, minutes: 0, seconds: 0 });
    expect(clampSegments({ hours: 20, minutes: 0, seconds: 0 }, min, max)).toEqual({ hours: 17, minutes: 0, seconds: 0 });
    expect(clampSegments({ hours: 12, minutes: 30, seconds: 0 }, min, max)).toEqual({ hours: 12, minutes: 30, seconds: 0 });
  });

  it("wrap is inclusive and cyclic", () => {
    expect(wrap(24, 0, 23)).toBe(0);
    expect(wrap(-1, 0, 23)).toBe(23);
    expect(wrap(13, 1, 12)).toBe(1);
    expect(wrap(0, 1, 12)).toBe(12);
  });

  it("to12h / from12h round-trip", () => {
    expect(to12h(0)).toEqual({ hour: 12, meridiem: "am" });
    expect(to12h(12)).toEqual({ hour: 12, meridiem: "pm" });
    expect(to12h(13)).toEqual({ hour: 1, meridiem: "pm" });
    expect(from12h(12, "am")).toBe(0);
    expect(from12h(12, "pm")).toBe(12);
    expect(from12h(1, "pm")).toBe(13);
  });

  it("defaultFormatTime respects showSeconds and hour12", () => {
    const d = new Date(2020, 0, 1, 14, 5, 9);
    const hm24 = defaultFormatTime(d, { locale: "en-US", showSeconds: false, hour12: false });
    expect(hm24).toMatch(/14[:.]05/);
    const hms24 = defaultFormatTime(d, { locale: "en-US", showSeconds: true, hour12: false });
    expect(hms24).toMatch(/14[:.]05[:.]09/);
    const hm12 = defaultFormatTime(d, { locale: "en-US", showSeconds: false, hour12: true });
    expect(hm12.toLowerCase()).toContain("pm");
  });
});
