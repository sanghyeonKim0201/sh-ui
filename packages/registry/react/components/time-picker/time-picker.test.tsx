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

import { render, screen, fireEvent, within } from "@testing-library/react";
import * as React from "react";
import { TimePicker } from "./index";

function openPopover() {
  fireEvent.click(screen.getByRole("button"));
}

describe("TimePicker component", () => {
  it("트리거에 placeholder를 표시하고, 값이 있으면 포맷된 시각을 표시", () => {
    const { rerender } = render(<TimePicker placeholder="시간 선택" locale="en-US" />);
    expect(screen.getByRole("button")).toHaveTextContent("시간 선택");
    rerender(<TimePicker value={new Date(2020, 0, 1, 14, 30, 0)} locale="en-US" />);
    expect(screen.getByRole("button").textContent).toMatch(/14[:.]30/);
  });

  it("↑ 키로 시 세그먼트를 증가시키고 onValueChange를 호출", () => {
    const onValueChange = vi.fn();
    render(<TimePicker value={new Date(2020, 0, 1, 10, 0, 0)} onValueChange={onValueChange} locale="en-US" />);
    openPopover();
    const hours = screen.getByRole("spinbutton", { name: /시|hour/i });
    fireEvent.keyDown(hours, { key: "ArrowUp" });
    const called = onValueChange.mock.calls.at(-1)![0] as Date;
    expect(called.getHours()).toBe(11);
  });

  it("시 세그먼트가 23에서 ↑ 누르면 0으로 랩", () => {
    const onValueChange = vi.fn();
    render(<TimePicker value={new Date(2020, 0, 1, 23, 0, 0)} onValueChange={onValueChange} locale="en-US" />);
    openPopover();
    fireEvent.keyDown(screen.getByRole("spinbutton", { name: /시|hour/i }), { key: "ArrowUp" });
    expect((onValueChange.mock.calls.at(-1)![0] as Date).getHours()).toBe(0);
  });

  it("숫자 타이핑으로 분 세그먼트를 설정", () => {
    const onValueChange = vi.fn();
    render(<TimePicker value={new Date(2020, 0, 1, 10, 0, 0)} onValueChange={onValueChange} locale="en-US" />);
    openPopover();
    const minutes = screen.getByRole("spinbutton", { name: /분|minute/i });
    fireEvent.keyDown(minutes, { key: "4" });
    fireEvent.keyDown(minutes, { key: "5" });
    expect((onValueChange.mock.calls.at(-1)![0] as Date).getMinutes()).toBe(45);
  });

  it("minuteStep이 ↑ 증감 단위를 결정", () => {
    const onValueChange = vi.fn();
    render(<TimePicker value={new Date(2020, 0, 1, 10, 0, 0)} minuteStep={5} onValueChange={onValueChange} locale="en-US" />);
    openPopover();
    fireEvent.keyDown(screen.getByRole("spinbutton", { name: /분|minute/i }), { key: "ArrowUp" });
    expect((onValueChange.mock.calls.at(-1)![0] as Date).getMinutes()).toBe(5);
  });

  it("showSeconds=true면 초 세그먼트 렌더", () => {
    render(<TimePicker value={new Date(2020, 0, 1, 10, 0, 0)} showSeconds locale="en-US" />);
    openPopover();
    expect(screen.getByRole("spinbutton", { name: /초|second/i })).toBeInTheDocument();
  });

  it("hour12=true면 meridiem 세그먼트 렌더, a/p 키로 토글", () => {
    const onValueChange = vi.fn();
    render(<TimePicker value={new Date(2020, 0, 1, 9, 0, 0)} hour12 onValueChange={onValueChange} locale="en-US" />);
    openPopover();
    const mer = screen.getByRole("spinbutton", { name: /오전.오후|AM.PM|meridiem/i });
    fireEvent.keyDown(mer, { key: "p" });
    expect((onValueChange.mock.calls.at(-1)![0] as Date).getHours()).toBe(21); // 9am → 9pm
  });

  it("max를 넘는 증가는 클램프", () => {
    const onValueChange = vi.fn();
    render(
      <TimePicker
        value={new Date(2020, 0, 1, 17, 0, 0)}
        max={new Date(2020, 0, 1, 17, 0, 0)}
        onValueChange={onValueChange}
        locale="en-US"
      />,
    );
    openPopover();
    fireEvent.keyDown(screen.getByRole("spinbutton", { name: /시|hour/i }), { key: "ArrowUp" });
    // 17시가 max이므로 클램프되어 값이 17을 넘지 않음
    const last = onValueChange.mock.calls.at(-1)?.[0] as Date | undefined;
    if (last) expect(last.getHours()).toBeLessThanOrEqual(17);
  });

  it("disabled면 팝오버가 열리지 않음", () => {
    render(<TimePicker placeholder="off" disabled locale="en-US" />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.queryByRole("spinbutton", { name: /시|hour/i })).not.toBeInTheDocument();
  });

  it("aria-invalid가 트리거에 반영", () => {
    render(<TimePicker placeholder="x" aria-invalid locale="en-US" />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-invalid", "true");
  });
});
