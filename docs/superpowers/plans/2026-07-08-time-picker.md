# TimePicker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** sh-ui에 시각 입력 전용 `time-picker` 컴포넌트를 React(3 스타일 변형)와 Flutter로 신설하고, docs/showcase/레지스트리/테스트/변경내역까지 레포 관례대로 통합한다.

**Architecture:** date-picker를 미러링한 Base UI Popover 기반 compound 컴포넌트. 트리거 버튼(시각+시계 아이콘) → 팝오버 안에 `[HH]:[MM](:[SS])[오전/오후]` 세그먼트 스피너(각 세그먼트 `role="spinbutton"`). 값은 `Date`, 시각(시·분·초)만 의미. 순수 시각 로직은 index.tsx에서 export하여 vitest로 단위 테스트한다.

**Tech Stack:** React 19 + TypeScript, `@base-ui/react` Popover, vanilla CSS / CSS Modules / Tailwind 3-변형, vitest + @testing-library/react, Flutter(Material + ShUiTheme), Next.js docs 앱, Playwright visual test.

## Global Constraints

- **value 타입은 `Date`** (date-picker와 동일). 시각(시/분/초)만 의미를 가짐. 값 갱신 시 기존 value가 있으면 그 날짜 보존, 없으면 오늘 날짜 기준 생성.
- **min/max는 하루 중 시각(자정 기준 초 offset)으로만 비교.** 날짜 부분 무시.
- **모든 CSS 치수는 토큰 변수(`var(--space-*)`, `var(--control-md)`, `var(--text-sm)`, `var(--radius)`, `var(--z-popover)` 등) 경유.** 매직 px/rem 금지. 예외는 date-picker styles.css에 이미 있는 관용(`height: 2.75rem` coarse-pointer 오버라이드)만 그대로 따른다.
- **듀얼 카피 필수 (실제 관례 — 구현 중 확정):** docs 카피는 **`index.tsx`(plain 변형) + `styles.css` 2개만** 복사한다. module/tailwind 변형은 docs로 복사하지 않는다. `index.tsx` 복사 시 변환: `import { cn } from "@SH_UI_UTILS@";` 라인 제거 + 인라인 `cx` 함수 정의 추가 + `cn(`→`cx(`. `styles.css`는 그대로. Flutter는 `packages/registry/flutter/widgets/sh_ui_time_picker.dart` ↔ `apps/showcase/lib/widgets/sh_ui_time_picker.dart` byte-동일(변환 없음, Task 6에서 실제 확인). `pnpm lint:dual-copy`가 강제(`scripts/lint-dual-copy.mjs` 참조).
- **레지스트리 등록:** `packages/registry/react/registry.json`의 `components["time-picker"]`, `packages/registry/flutter/registry.json`, `tokens-used.json`. `pnpm lint:drift`가 강제.
- **컴포넌트 utils import는 placeholder `@SH_UI_UTILS@`** 사용 (CLI가 사용자 alias로 치환; 레포 내 테스트는 vitest alias가 `lib/cn.ts`로 해석). `cn`을 이 경로에서 import.
- **컴포넌트 소스 클래스 접두사:** `sh-ui-time-picker__*`.
- **신규 컴포넌트 = MINOR 범프:** `packages/changelog/versions.json` 맨 앞에 `0.121.0` 엔트리 prepend. (현재 최신 0.120.0)
- **한국어 우선:** 사용자-facing 문자열/문서/커밋 메시지 한국어. 기본 locale `"ko-KR"`.
- **커밋 트레일러:** 각 커밋 끝에 `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
- **작업 브랜치:** 현재 워크트리 브랜치(`claude/time-picker-component-e76387`)에서 작업. dev 푸시·live PR·태그는 구현 완료 후 별도 릴리즈 단계.

---

## File Structure

**React 원본** — `packages/registry/react/components/time-picker/`
- `index.tsx` — 순수 시각 헬퍼(export) + TimePicker 루트/Trigger/Content/Field/Footer + useTimePicker + ClockIcon (plain 변형, `import "./styles.css"`)
- `index.module.tsx` — CSS Modules 변형 (`import styles from "./styles.module.css"`)
- `index.tailwind.tsx` — Tailwind 변형 (className 유틸리티, styles import 없음)
- `styles.css` — vanilla 스타일
- `styles.module.css` — CSS Modules 스타일
- `time-picker.test.tsx` — vitest 단위 테스트 (레지스트리에는 미포함, 레포 전용)

**docs 복사본** — `apps/docs/components/ui/time-picker/` (위 5개 소스 파일 미러; 테스트는 복사 안 함)

**docs 페이지** — `apps/docs/app/[locale]/(docs)/components/time-picker/`
- `page.tsx`, `time-picker-live-demo.tsx`, `_demos/basic.tsx`

**Flutter** — `packages/registry/flutter/widgets/sh_ui_time_picker.dart` ↔ `apps/showcase/lib/widgets/sh_ui_time_picker.dart` (+ showcase 페이지 등록)

**등록/통합 파일 (수정)**
- `packages/registry/react/registry.json`, `packages/registry/react/tokens-used.json`
- `packages/registry/flutter/registry.json`
- `apps/docs/components/app-sidebar.tsx`
- `apps/docs/app/[locale]/(docs)/components/page.tsx`
- `apps/docs/components/create/showcases/time-picker.tsx` + `apps/docs/components/create/showcases/index.ts`
- `apps/docs/tests/visual/components.spec.ts`
- `packages/changelog/versions.json`

---

## Task 1: React 순수 시각 헬퍼 + 단위 테스트

date-picker처럼 로직을 index.tsx 한 파일에 두되, **순수 함수는 export**하여 컴포넌트와 분리 테스트한다. 이 태스크는 헬퍼만 만든다(컴포넌트는 Task 2).

**Files:**
- Create: `packages/registry/react/components/time-picker/index.tsx` (헬퍼 부분만)
- Test: `packages/registry/react/components/time-picker/time-picker.test.tsx`

**Interfaces:**
- Produces (export from `./index`):
  - `interface TimeSegments { hours: number; minutes: number; seconds: number }` — 항상 24시간제 내부 표현
  - `getSegments(date: Date): TimeSegments`
  - `applySegments(base: Date | undefined, seg: TimeSegments): Date`
  - `timeSecondsOf(date: Date): number`
  - `secondsOfDay(seg: TimeSegments): number`
  - `clampSegments(seg: TimeSegments, min?: Date, max?: Date): TimeSegments`
  - `wrap(value: number, min: number, max: number): number` — inclusive 랩어라운드
  - `inferHour12(locale: string): boolean`
  - `to12h(hours24: number): { hour: number; meridiem: "am" | "pm" }`
  - `from12h(hour12: number, meridiem: "am" | "pm"): number`
  - `defaultFormatTime(date: Date, opts: { locale: string; showSeconds: boolean; hour12: boolean }): string`

- [ ] **Step 1: 실패하는 테스트 작성**

`packages/registry/react/components/time-picker/time-picker.test.tsx`:

```tsx
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
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `pnpm --filter @sh-ui/registry-react test -- time-picker` (또는 `cd packages/registry/react && pnpm test -- time-picker`)
Expected: FAIL — `Failed to resolve import "./index"` 또는 export 미정의.

- [ ] **Step 3: 헬퍼 구현**

`packages/registry/react/components/time-picker/index.tsx` 상단(아직 "use client"/React import는 Task 2에서 추가; 이 단계는 순수 헬퍼만이라도 파일이 존재해야 함 — 파일 맨 위에 `"use client";` 포함해도 무방):

```tsx
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
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd packages/registry/react && pnpm test -- time-picker`
Expected: PASS (9 assertions in "time helpers").

- [ ] **Step 5: 커밋**

```bash
git add packages/registry/react/components/time-picker/index.tsx packages/registry/react/components/time-picker/time-picker.test.tsx
git commit -m "feat(time-picker): 순수 시각 헬퍼 + 단위 테스트

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: React TimePicker 컴포넌트 (plain 변형) + styles.css

Task 1 헬퍼 위에 compound 컴포넌트를 얹는다. 세그먼트 스피너가 이 컴포넌트의 핵심.

**Files:**
- Modify: `packages/registry/react/components/time-picker/index.tsx` (헬퍼 아래에 컴포넌트 추가)
- Create: `packages/registry/react/components/time-picker/styles.css`
- Modify: `packages/registry/react/components/time-picker/time-picker.test.tsx` (컴포넌트 테스트 추가)

**Interfaces:**
- Consumes: Task 1의 모든 헬퍼.
- Produces (export from `./index`):
  - `interface TimePickerProps` (아래 코드 참조)
  - `function TimePicker(props: TimePickerProps): JSX.Element`
  - `const TimePickerTrigger` (forwardRef 버튼)
  - `const TimePickerContent` (forwardRef, popover 본문)
  - `function TimePickerField()` (세그먼트 스피너)
  - `const TimePickerFooter` (forwardRef div)
  - `function useTimePicker()` → `{ value, setValue, open, setOpen }`

- [ ] **Step 1: 실패하는 컴포넌트 테스트 작성**

`time-picker.test.tsx` 하단에 추가:

```tsx
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
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cd packages/registry/react && pnpm test -- time-picker`
Expected: FAIL — `TimePicker is not exported` / 렌더 불가.

- [ ] **Step 3: 컴포넌트 구현**

`index.tsx` 헬퍼 아래에 추가. (React import는 파일 맨 위 `"use client";` 다음에 배치)

```tsx
import * as React from "react";
import { Popover as BasePopover } from "@base-ui/react/popover";
import "./styles.css";
import { cn } from "@SH_UI_UTILS@";

const DEFAULT_LOCALE = "ko-KR";

/* ───────── 아이콘 ───────── */

function ClockIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 4.5V8l2.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ───────── locale 기반 기본 placeholder ───────── */

function defaultTimePlaceholder(locale: string): string {
  return locale.toLowerCase().split(/[-_]/)[0] === "ko" ? "시간 선택" : "Select time";
}

/* ───────── Context ───────── */

interface TimePickerContextValue {
  selected: Date | undefined;
  segments: TimeSegments;
  commit: (seg: TimeSegments) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  placeholder: string;
  locale: string;
  hour12: boolean;
  showSeconds: boolean;
  minuteStep: number;
  secondStep: number;
  min?: Date;
  max?: Date;
  disabled?: boolean;
  readOnly?: boolean;
  ariaInvalid?: boolean | "true";
  formatTime: (date: Date) => string;
  messages: TimePickerMessages;
}

const TimePickerContext = React.createContext<TimePickerContextValue | null>(null);

function useCtx(component: string) {
  const ctx = React.useContext(TimePickerContext);
  if (!ctx) throw new Error(`${component}는 <TimePicker> 내부에서 사용해야 합니다.`);
  return ctx;
}

/* ───────── aria 라벨 (i18n override 가능) ───────── */

export interface TimePickerMessages {
  hours?: string;
  minutes?: string;
  seconds?: string;
  meridiem?: string;
}

function resolveMessages(locale: string, m?: TimePickerMessages): Required<TimePickerMessages> {
  const ko = locale.toLowerCase().split(/[-_]/)[0] === "ko";
  return {
    hours: m?.hours ?? (ko ? "시" : "Hours"),
    minutes: m?.minutes ?? (ko ? "분" : "Minutes"),
    seconds: m?.seconds ?? (ko ? "초" : "Seconds"),
    meridiem: m?.meridiem ?? (ko ? "오전/오후" : "AM/PM"),
  };
}

/* ───────── Root ───────── */

export interface TimePickerProps {
  value?: Date;
  defaultValue?: Date;
  onValueChange?: (date: Date | undefined) => void;
  /** 미지정 시 locale에서 자동 추론. AM/PM 세그먼트 유무 결정. */
  hour12?: boolean;
  /** HH:MM:SS 표시 여부. @default false */
  showSeconds?: boolean;
  /** ↑/↓ 분 증감 단위. @default 1 */
  minuteStep?: number;
  /** ↑/↓ 초 증감 단위. @default 1 */
  secondStep?: number;
  /** 선택 가능 최소 시각(하루 중 시각으로 비교). */
  min?: Date;
  /** 선택 가능 최대 시각(하루 중 시각으로 비교). */
  max?: Date;
  /** 미선택 트리거 텍스트. 미지정 시 locale 기반. */
  placeholder?: string;
  /** @default "ko-KR" */
  locale?: string;
  /** 세그먼트 aria-label override. */
  messages?: TimePickerMessages;
  /** 트리거 표시 포맷터. 기본 Intl.DateTimeFormat. */
  formatTime?: (date: Date) => string;
  disabled?: boolean;
  readOnly?: boolean;
  "aria-invalid"?: boolean | "true";
  className?: string;
  container?: React.ComponentPropsWithoutRef<typeof BasePopover.Portal>["container"];
  children?: React.ReactNode;
}

/**
 * 시각(시·분·초) 선택. 트리거 클릭 시 팝오버 세그먼트 스피너가 열린다.
 * children 생략 시 Trigger + Content + Field가 자동 렌더된다.
 */
export function TimePicker({
  value,
  defaultValue,
  onValueChange,
  hour12,
  showSeconds = false,
  minuteStep = 1,
  secondStep = 1,
  min,
  max,
  placeholder,
  locale = DEFAULT_LOCALE,
  messages,
  formatTime,
  disabled,
  readOnly,
  "aria-invalid": ariaInvalid,
  className,
  container,
  children,
}: TimePickerProps) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = React.useState<Date | undefined>(defaultValue);
  const selected = isControlled ? value : internal;
  const [open, setOpen] = React.useState(false);

  const resolvedHour12 = hour12 ?? inferHour12(locale);
  const resolvedPlaceholder = placeholder ?? defaultTimePlaceholder(locale);
  const resolvedMessages = React.useMemo(() => resolveMessages(locale, messages), [locale, messages]);

  const segments = selected ? getSegments(selected) : { hours: 0, minutes: 0, seconds: 0 };

  const commit = React.useCallback(
    (seg: TimeSegments) => {
      const clamped = clampSegments(seg, min, max);
      const next = applySegments(selected, clamped);
      if (!isControlled) setInternal(next);
      onValueChange?.(next);
    },
    [selected, min, max, isControlled, onValueChange],
  );

  const resolvedFormat = React.useCallback(
    (d: Date) => (formatTime ? formatTime(d) : defaultFormatTime(d, { locale, showSeconds, hour12: resolvedHour12 })),
    [formatTime, locale, showSeconds, resolvedHour12],
  );

  const ctx = React.useMemo<TimePickerContextValue>(
    () => ({
      selected,
      segments,
      commit,
      open,
      setOpen,
      placeholder: resolvedPlaceholder,
      locale,
      hour12: resolvedHour12,
      showSeconds,
      minuteStep,
      secondStep,
      min,
      max,
      disabled,
      readOnly,
      ariaInvalid,
      formatTime: resolvedFormat,
      messages: resolvedMessages,
    }),
    [selected, segments, commit, open, resolvedPlaceholder, locale, resolvedHour12, showSeconds, minuteStep, secondStep, min, max, disabled, readOnly, ariaInvalid, resolvedFormat, resolvedMessages],
  );

  return (
    <TimePickerContext.Provider value={ctx}>
      <BasePopover.Root open={open} onOpenChange={setOpen}>
        {children ?? (
          <>
            <TimePickerTrigger className={className} />
            <TimePickerContent container={container}>
              <TimePickerField />
            </TimePickerContent>
          </>
        )}
      </BasePopover.Root>
    </TimePickerContext.Provider>
  );
}

/* ───────── Trigger ───────── */

export interface TimePickerTriggerProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  children?:
    | React.ReactNode
    | ((state: { value: Date | undefined; formatted: string | undefined; placeholder: string }) => React.ReactNode);
}

export const TimePickerTrigger = React.forwardRef<HTMLButtonElement, TimePickerTriggerProps>(
  function TimePickerTrigger({ className, children, onClick, ...props }, ref) {
    const ctx = useCtx("TimePickerTrigger");
    const displayText = ctx.selected ? ctx.formatTime(ctx.selected) : undefined;

    const renderContent = () => {
      if (typeof children === "function") {
        return children({ value: ctx.selected, formatted: displayText, placeholder: ctx.placeholder });
      }
      if (children !== undefined) return children;
      return (
        <>
          <span className={cn("sh-ui-time-picker__value", !displayText && "sh-ui-time-picker__placeholder")}>
            {displayText ?? ctx.placeholder}
          </span>
          <span className="sh-ui-time-picker__icon" aria-hidden>
            <ClockIcon />
          </span>
        </>
      );
    };

    return (
      <BasePopover.Trigger
        ref={ref}
        className={cn("sh-ui-time-picker__trigger", className)}
        disabled={ctx.disabled}
        aria-invalid={ctx.ariaInvalid}
        aria-haspopup="dialog"
        onClick={(e) => {
          if (ctx.readOnly) e.preventDefault();
          onClick?.(e);
        }}
        {...props}
      >
        {renderContent()}
      </BasePopover.Trigger>
    );
  },
);

/* ───────── Content ───────── */

export interface TimePickerContentProps
  extends Omit<React.ComponentPropsWithoutRef<typeof BasePopover.Popup>, "className"> {
  className?: string;
  sideOffset?: React.ComponentPropsWithoutRef<typeof BasePopover.Positioner>["sideOffset"];
  side?: React.ComponentPropsWithoutRef<typeof BasePopover.Positioner>["side"];
  align?: React.ComponentPropsWithoutRef<typeof BasePopover.Positioner>["align"];
  container?: React.ComponentPropsWithoutRef<typeof BasePopover.Portal>["container"];
}

export const TimePickerContent = React.forwardRef<HTMLDivElement, TimePickerContentProps>(
  function TimePickerContent(
    { className, children, sideOffset = 4, side = "bottom", align = "start", container, ...props },
    ref,
  ) {
    const ctx = useCtx("TimePickerContent");
    if (ctx.disabled || ctx.readOnly) return null;
    return (
      <BasePopover.Portal container={container}>
        <BasePopover.Positioner className="sh-ui-time-picker__positioner" sideOffset={sideOffset} side={side} align={align}>
          <BasePopover.Popup ref={ref} className={cn("sh-ui-time-picker__popup", className)} {...props}>
            {children}
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    );
  },
);

/* ───────── Segment (내부) ───────── */

type SegmentKind = "hours" | "minutes" | "seconds" | "meridiem";

interface SegmentProps {
  kind: SegmentKind;
  label: string;
  display: string;
  valueNow: number;
  valueMin: number;
  valueMax: number;
  onStep: (delta: number) => void;
  onDigit: (digit: number) => void;
  onMeridiem?: (m: "am" | "pm") => void;
}

function Segment({ kind, label, display, valueNow, valueMin, valueMax, onStep, onDigit, onMeridiem }: SegmentProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowUp") { e.preventDefault(); onStep(1); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); onStep(-1); return; }
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const dir = e.key === "ArrowRight" ? 1 : -1;
      const group = e.currentTarget.parentElement;
      const segs = group ? Array.from(group.querySelectorAll<HTMLElement>('[role="spinbutton"]')) : [];
      const idx = segs.indexOf(e.currentTarget);
      const next = segs[idx + dir];
      next?.focus();
      return;
    }
    if (kind === "meridiem") {
      if (e.key.toLowerCase() === "a") { e.preventDefault(); onMeridiem?.("am"); }
      if (e.key.toLowerCase() === "p") { e.preventDefault(); onMeridiem?.("pm"); }
      return;
    }
    if (/^[0-9]$/.test(e.key)) { e.preventDefault(); onDigit(Number(e.key)); }
  };

  return (
    <div
      role="spinbutton"
      tabIndex={0}
      aria-label={label}
      aria-valuenow={kind === "meridiem" ? undefined : valueNow}
      aria-valuemin={kind === "meridiem" ? undefined : valueMin}
      aria-valuemax={kind === "meridiem" ? undefined : valueMax}
      aria-valuetext={display}
      className="sh-ui-time-picker__segment"
      onKeyDown={handleKeyDown}
    >
      {display}
    </div>
  );
}

/* ───────── Field (세그먼트 스피너 그룹) ───────── */

const pad2 = (n: number) => String(n).padStart(2, "0");

export function TimePickerField() {
  const ctx = useCtx("TimePickerField");
  const { segments, commit, minuteStep, secondStep, hour12, showSeconds, messages, locale } = ctx;
  // 타이핑 누적 버퍼: 세그먼트별 마지막 입력 자릿수 관리
  const typedRef = React.useRef<{ kind: SegmentKind | null; buf: string }>({ kind: null, buf: "" });

  const stepHours = (delta: number) => {
    if (hour12) {
      const { hour, meridiem } = to12h(segments.hours);
      const nextHour12 = wrap(hour + delta, 1, 12);
      commit({ ...segments, hours: from12h(nextHour12, meridiem) });
    } else {
      commit({ ...segments, hours: wrap(segments.hours + delta, 0, 23) });
    }
  };
  const stepMinutes = (delta: number) => commit({ ...segments, minutes: wrap(segments.minutes + delta * minuteStep, 0, 59) });
  const stepSeconds = (delta: number) => commit({ ...segments, seconds: wrap(segments.seconds + delta * secondStep, 0, 59) });

  const typeInto = (kind: "hours" | "minutes" | "seconds", digit: number, max: number, min = 0) => {
    const t = typedRef.current;
    const buf = t.kind === kind ? t.buf + String(digit) : String(digit);
    let n = Number(buf);
    // 두 자리 초과 또는 다음 입력이 무의미하면 버퍼 리셋
    const finished = buf.length >= 2 || n * 10 > max;
    if (n > max) n = digit; // 새 자릿수로 재시작
    typedRef.current = finished ? { kind: null, buf: "" } : { kind, buf: String(n) };
    const clampedForKind = kind === "hours" && hour12 ? Math.max(min, Math.min(n, 12)) : Math.max(min, Math.min(n, max));
    if (kind === "hours") {
      const h = hour12 ? from12h(clampedForKind === 0 ? 12 : clampedForKind, to12h(segments.hours).meridiem) : clampedForKind;
      commit({ ...segments, hours: h });
    } else if (kind === "minutes") {
      commit({ ...segments, minutes: clampedForKind });
    } else {
      commit({ ...segments, seconds: clampedForKind });
    }
  };

  const setMeridiem = (m: "am" | "pm") => {
    const { hour } = to12h(segments.hours);
    commit({ ...segments, hours: from12h(hour, m) });
  };

  const hourDisplay = hour12 ? pad2(to12h(segments.hours).hour) : pad2(segments.hours);
  const meridiemLabel = to12h(segments.hours).meridiem === "am"
    ? (locale.toLowerCase().startsWith("ko") ? "오전" : "AM")
    : (locale.toLowerCase().startsWith("ko") ? "오후" : "PM");

  return (
    <div className="sh-ui-time-picker__field" role="group" aria-label={messages.hours + " " + messages.minutes}>
      <Segment
        kind="hours"
        label={messages.hours}
        display={hourDisplay}
        valueNow={segments.hours}
        valueMin={hour12 ? 1 : 0}
        valueMax={hour12 ? 12 : 23}
        onStep={stepHours}
        onDigit={(d) => typeInto("hours", d, hour12 ? 12 : 23, hour12 ? 1 : 0)}
      />
      <span className="sh-ui-time-picker__separator" aria-hidden>:</span>
      <Segment
        kind="minutes"
        label={messages.minutes}
        display={pad2(segments.minutes)}
        valueNow={segments.minutes}
        valueMin={0}
        valueMax={59}
        onStep={stepMinutes}
        onDigit={(d) => typeInto("minutes", d, 59)}
      />
      {showSeconds && (
        <>
          <span className="sh-ui-time-picker__separator" aria-hidden>:</span>
          <Segment
            kind="seconds"
            label={messages.seconds}
            display={pad2(segments.seconds)}
            valueNow={segments.seconds}
            valueMin={0}
            valueMax={59}
            onStep={stepSeconds}
            onDigit={(d) => typeInto("seconds", d, 59)}
          />
        </>
      )}
      {hour12 && (
        <Segment
          kind="meridiem"
          label={messages.meridiem}
          display={meridiemLabel}
          valueNow={0}
          valueMin={0}
          valueMax={0}
          onStep={(delta) => setMeridiem(to12h(segments.hours).meridiem === "am" ? "pm" : "am")}
          onDigit={() => {}}
          onMeridiem={setMeridiem}
        />
      )}
    </div>
  );
}

/* ───────── Footer ───────── */

export interface TimePickerFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const TimePickerFooter = React.forwardRef<HTMLDivElement, TimePickerFooterProps>(
  function TimePickerFooter({ className, ...props }, ref) {
    return <div ref={ref} className={cn("sh-ui-time-picker__footer", className)} {...props} />;
  },
);

/* ───────── useTimePicker ───────── */

export function useTimePicker() {
  const ctx = useCtx("useTimePicker");
  return {
    value: ctx.selected,
    setValue: (d: Date | undefined) => (d ? ctx.commit(getSegments(d)) : ctx.commit({ hours: 0, minutes: 0, seconds: 0 })),
    open: ctx.open,
    setOpen: ctx.setOpen,
  };
}
```

> 참고: `commit`은 항상 `applySegments(selected, ...)`를 쓰므로 `selected`가 `undefined`일 때 첫 편집은 "오늘 날짜 + 편집한 시각"이 된다(Global Constraints의 값 모델과 일치).

- [ ] **Step 4: styles.css 작성**

`packages/registry/react/components/time-picker/styles.css` — date-picker styles.css의 trigger/positioner/popup/footer를 `time-picker`로 리네임하고, field/segment/separator 추가:

```css
/* ── Trigger (input-like) ── */
.sh-ui-time-picker__trigger {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: var(--control-md);
  padding: 0 var(--space-3);
  background: var(--background);
  color: var(--foreground);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-family: inherit;
  font-size: var(--text-sm);
  line-height: 1;
  cursor: pointer;
  transition: border-color var(--duration-fast), box-shadow var(--duration-fast);
  -webkit-tap-highlight-color: transparent;
}
@media (hover: none) and (pointer: coarse) {
  .sh-ui-time-picker__trigger { height: 2.75rem; font-size: var(--text-base); }
}
.sh-ui-time-picker__trigger:hover:not(:disabled) { border-color: var(--border-strong); }
.sh-ui-time-picker__trigger:focus-visible {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 1px var(--primary);
}
.sh-ui-time-picker__trigger:disabled {
  opacity: var(--opacity-disabled);
  cursor: not-allowed;
  background: var(--background-subtle);
}
.sh-ui-time-picker__trigger[aria-invalid="true"] { border-color: var(--danger); }
.sh-ui-time-picker__trigger[aria-invalid="true"]:focus-visible { box-shadow: 0 0 0 1px var(--danger); }

.sh-ui-time-picker__value { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sh-ui-time-picker__placeholder { color: var(--foreground-subtle); }
.sh-ui-time-picker__icon {
  flex-shrink: 0;
  display: inline-flex;
  color: var(--foreground-muted);
  margin-inline-start: var(--space-2);
}

/* ── Positioner / Popup ── */
.sh-ui-time-picker__positioner { z-index: var(--z-popover); outline: none; }
.sh-ui-time-picker__popup {
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-lg);
  outline: none;
  padding: var(--space-3);
  transform-origin: var(--transform-origin);
  transition: opacity 140ms ease, transform 140ms ease;
}
.sh-ui-time-picker__popup[data-starting-style],
.sh-ui-time-picker__popup[data-ending-style] { opacity: 0; transform: scale(0.96); }

/* ── Field / Segment ── */
.sh-ui-time-picker__field {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-variant-numeric: tabular-nums;
  font-size: var(--text-lg);
}
.sh-ui-time-picker__segment {
  min-width: 2ch;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  text-align: center;
  cursor: default;
  user-select: none;
  color: var(--foreground);
}
.sh-ui-time-picker__segment:focus-visible,
.sh-ui-time-picker__segment:focus {
  outline: none;
  background: var(--primary);
  color: var(--primary-foreground);
}
.sh-ui-time-picker__separator { color: var(--foreground-muted); }

/* ── Footer ── */
.sh-ui-time-picker__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-2);
  margin-top: var(--space-2);
  padding-top: var(--space-2);
  border-top: 1px solid var(--border);
}
```

> `--radius-sm`, `--text-lg`가 토큰에 없으면 `tokens.css`에서 실제 존재하는 근접 토큰(`--radius`, `--text-base`)으로 대체한다. Step 6의 typecheck/토큰 확인 시 검증.

- [ ] **Step 5: 테스트 통과 확인**

Run: `cd packages/registry/react && pnpm test -- time-picker`
Expected: PASS (헬퍼 + "TimePicker component" 전체). 실패 시 세그먼트 keyDown 핸들러/aria-label 매칭을 조정.

- [ ] **Step 6: 커밋**

```bash
git add packages/registry/react/components/time-picker/index.tsx packages/registry/react/components/time-picker/styles.css packages/registry/react/components/time-picker/time-picker.test.tsx
git commit -m "feat(time-picker): 세그먼트 스피너 컴포넌트 + styles.css (plain 변형)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: React module + tailwind 변형 + styles.module.css

plain(index.tsx)을 두 변형으로 미러링한다. **로직/JSX 구조는 동일**, 스타일 적용 방식만 다르다.

**Files:**
- Create: `packages/registry/react/components/time-picker/index.module.tsx`
- Create: `packages/registry/react/components/time-picker/styles.module.css`
- Create: `packages/registry/react/components/time-picker/index.tailwind.tsx`

**Interfaces:** 세 변형 모두 index.tsx와 **동일한 export 시그니처**를 갖는다(CLI가 프레임워크별로 하나만 `index.tsx`로 복사).

- [ ] **Step 1: index.module.tsx 작성**

`index.tsx`를 복사한 뒤:
1. `import "./styles.css";` → `import styles from "./styles.module.css";` 로 교체.
2. 모든 `"sh-ui-time-picker__X"` 문자열 클래스를 `styles.X` 로 교체 (`cn("sh-ui-time-picker__trigger", className)` → `cn(styles.trigger, className)` 등). 키 매핑: trigger, value, placeholder, icon, positioner, popup, field, segment, separator, footer.
3. date-picker의 `index.module.tsx`가 쓰는 것과 동일한 CSS Modules 관용을 따른다(같은 파일을 참고).

- [ ] **Step 2: styles.module.css 작성**

Task 2의 styles.css 내용을 CSS Modules 형식으로 옮긴다: `.sh-ui-time-picker__trigger { … }` → `.trigger { … }`, `__value`→`.value`, `__placeholder`→`.placeholder`, `__icon`→`.icon`, `__positioner`→`.positioner`, `__popup`→`.popup`, `__field`→`.field`, `__segment`→`.segment`, `__separator`→`.separator`, `__footer`→`.footer`. 속성 값(토큰 변수)은 그대로. date-picker의 `styles.module.css`를 형식 레퍼런스로 사용.

- [ ] **Step 3: index.tailwind.tsx 작성**

date-picker의 `index.tailwind.tsx`를 레퍼런스로, 동일한 로직/JSX에 Tailwind 유틸리티 className을 적용. `styles` import 없음. 트리거는 date-picker tailwind 트리거의 클래스를 재사용(input-like), 세그먼트는 `data-[]`/focus 유틸로 표현. **핵심: date-picker tailwind 변형과 시각적으로 동일한 토큰 유틸리티 사용.**

- [ ] **Step 4: 타입 체크**

⚠️ `packages/registry/react`에는 tsconfig/typecheck 스크립트가 없다(타입 검증은 docs 복사본의 `apps/docs pnpm typecheck`로만 이뤄지며, 이는 Task 5에서 수행). 변형 파일은 docs가 직접 import하지 않으므로 자동 타입체크 대상이 아니다. 이 태스크에서는:
- Run: `cd packages/registry/react && pnpm test -- time-picker` — 여전히 green(plain 변형/헬퍼 정상, import 깨짐 없음).
- 세 변형 파일 자체를 즉시 검증하려면 scratch tsconfig로: `cd packages/registry/react && pnpm exec tsc --noEmit --jsx react-jsx --moduleResolution bundler --module esnext --target es2020 --skipLibCheck --strict components/time-picker/index.tsx components/time-picker/index.module.tsx components/time-picker/index.tailwind.tsx` (에러 없어야 함; `@SH_UI_UTILS@`/`@base-ui/react` 미해석 에러는 무시 — 런타임 alias/설치본이 해결).
Expected: 테스트 green + 변형 파일에 신규 타입 불일치 없음.

- [ ] **Step 5: 커밋**

```bash
git add packages/registry/react/components/time-picker/index.module.tsx packages/registry/react/components/time-picker/styles.module.css packages/registry/react/components/time-picker/index.tailwind.tsx
git commit -m "feat(time-picker): CSS Modules · Tailwind 변형 추가

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: 레지스트리 등록 + docs 듀얼 카피 + drift lint green

**Files:**
- Modify: `packages/registry/react/registry.json`
- Modify: `packages/registry/react/tokens-used.json` (또는 생성 스크립트로 재생성)
- Create: `apps/docs/components/ui/time-picker/` (index.tsx / index.module.tsx / index.tailwind.tsx / styles.css / styles.module.css 5개 — 레지스트리 원본과 **바이트 동일** 복사)

**Interfaces:**
- Produces: `sh-ui add time-picker`가 참조하는 레지스트리 엔트리. docs 앱이 import하는 `@/components/ui/time-picker`.

- [ ] **Step 1: registry.json에 time-picker 엔트리 추가**

`packages/registry/react/registry.json`의 `components` 객체에 `date-picker` 엔트리와 동일 구조로 추가(키 알파벳 순 위치 무관, 파일이 요구):

```json
"time-picker": {
  "name": "time-picker",
  "type": "component",
  "files": [
    { "src": "components/time-picker/index.tsx", "dest": "{components}/time-picker/index.tsx", "frameworks": ["plain"] },
    { "src": "components/time-picker/styles.css", "dest": "{components}/time-picker/styles.css", "frameworks": ["plain"] },
    { "src": "components/time-picker/index.tailwind.tsx", "dest": "{components}/time-picker/index.tsx", "frameworks": ["tailwind"] },
    { "src": "components/time-picker/index.module.tsx", "dest": "{components}/time-picker/index.tsx", "frameworks": ["css-modules"] },
    { "src": "components/time-picker/styles.module.css", "dest": "{components}/time-picker/styles.module.css", "frameworks": ["css-modules"] }
  ],
  "dependencies": ["@base-ui/react"],
  "registryDependencies": ["utils"]
}
```

- [ ] **Step 2: docs 듀얼 카피 생성**

레지스트리 원본 5개 파일을 docs로 복사:

```bash
mkdir -p "apps/docs/components/ui/time-picker"
cp packages/registry/react/components/time-picker/index.tsx "apps/docs/components/ui/time-picker/index.tsx"
cp packages/registry/react/components/time-picker/index.module.tsx "apps/docs/components/ui/time-picker/index.module.tsx"
cp packages/registry/react/components/time-picker/index.tailwind.tsx "apps/docs/components/ui/time-picker/index.tailwind.tsx"
cp packages/registry/react/components/time-picker/styles.css "apps/docs/components/ui/time-picker/styles.css"
cp packages/registry/react/components/time-picker/styles.module.css "apps/docs/components/ui/time-picker/styles.module.css"
```

> `test.tsx`는 복사하지 않는다(레지스트리 전용). date-picker docs 복사본에도 테스트는 없음.

- [ ] **Step 3: tokens-used 재생성**

Run: `pnpm build:tokens-used`
(time-picker가 사용하는 CSS 토큰이 `tokens-used.json`에 반영된다.)

- [ ] **Step 4: drift lint 통과 확인**

Run: `pnpm lint:drift`
Expected: PASS — `lint:registry`(엔트리 유효), `lint:dual-copy`(레지스트리↔docs 동일), `lint:tokens-used`(토큰 최신) 모두 green.
실패 시: dual-copy 불일치면 복사본 재동기화, tokens-used 불일치면 `pnpm build:tokens-used` 재실행 후 스테이징.

- [ ] **Step 5: 커밋**

```bash
git add packages/registry/react/registry.json packages/registry/react/tokens-used.json "apps/docs/components/ui/time-picker"
git commit -m "feat(time-picker): 레지스트리 등록 + docs 듀얼 카피

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: docs 페이지 + 데모 + nav/색인/showcase/visual 등록

**Files:**
- Create: `apps/docs/app/[locale]/(docs)/components/time-picker/page.tsx`
- Create: `apps/docs/app/[locale]/(docs)/components/time-picker/time-picker-live-demo.tsx`
- Create: `apps/docs/app/[locale]/(docs)/components/time-picker/_demos/basic.tsx`
- Create: `apps/docs/components/create/showcases/time-picker.tsx`
- Modify: `apps/docs/components/create/showcases/index.ts`
- Modify: `apps/docs/components/app-sidebar.tsx`
- Modify: `apps/docs/app/[locale]/(docs)/components/page.tsx`
- Modify: `apps/docs/tests/visual/components.spec.ts`

**Interfaces:**
- Consumes: `@/components/ui/time-picker` (Task 4), `loadComponentSources("time-picker")`, `ComponentSandbox`, `Preview`, `CodeTabs`, `PropsTable`, `SubComponents`, `VariantSource`.

- [ ] **Step 1: _demos/basic.tsx 작성**

```tsx
"use client";

import { useState } from "react";
import { TimePicker, useTimePicker } from "@/components/ui/time-picker";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const box = { width: "100%", maxWidth: 280, display: "flex", flexDirection: "column" as const, gap: "0.5rem" };

export function ControlledDemo() {
  const [time, setTime] = useState<Date | undefined>(new Date(2020, 0, 1, 9, 30, 0));
  return (
    <div style={box}>
      <TimePicker value={time} onValueChange={setTime} />
      <p style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)" }}>
        선택: {time ? time.toLocaleTimeString("ko-KR") : "없음"}
      </p>
    </div>
  );
}

export function SecondsDemo() {
  return <div style={box}><TimePicker showSeconds defaultValue={new Date(2020, 0, 1, 14, 5, 30)} /></div>;
}

export function Hour12Demo() {
  return <div style={box}><TimePicker hour12 defaultValue={new Date(2020, 0, 1, 15, 45, 0)} locale="en-US" /></div>;
}

export function StepDemo() {
  return <div style={box}><TimePicker minuteStep={5} placeholder="5분 단위" /></div>;
}

export function MinMaxDemo() {
  return (
    <div style={box}>
      <Label>업무 시간</Label>
      <TimePicker min={new Date(2020, 0, 1, 9, 0, 0)} max={new Date(2020, 0, 1, 18, 0, 0)} placeholder="09:00 ~ 18:00" />
    </div>
  );
}

export function StatesDemo() {
  return (
    <div style={{ ...box, gap: "0.75rem" }}>
      <TimePicker defaultValue={new Date(2020, 0, 1, 10, 0, 0)} />
      <TimePicker placeholder="disabled" disabled />
      <TimePicker defaultValue={new Date(2020, 0, 1, 10, 0, 0)} readOnly />
      <TimePicker placeholder="invalid" aria-invalid />
    </div>
  );
}

export function WithLabelDemo() {
  return (
    <div style={{ ...box, gap: "0.25rem" }}>
      <Label htmlFor="alarm" isRequired>알람 시각</Label>
      <TimePicker placeholder="HH:MM" />
    </div>
  );
}

export function CompoundDemo() {
  const [time, setTime] = useState<Date | undefined>(new Date(2020, 0, 1, 12, 0, 0));
  function NowClear() {
    const { setValue, setOpen } = useTimePicker();
    return (
      <>
        <Button variant="ghost" size="sm" onClick={() => { setValue(new Date()); setOpen(false); }}>지금</Button>
        <Button variant="ghost" size="sm" onClick={() => { setValue(undefined); setOpen(false); }}>지우기</Button>
      </>
    );
  }
  // Compound 조립: Trigger/Content/Field/Footer는 아래 page.tsx의 Usage 코드 참고
  return (
    <div style={box}>
      <TimePicker value={time} onValueChange={setTime} />
    </div>
  );
}
```

- [ ] **Step 2: time-picker-live-demo.tsx 작성**

```tsx
"use client";

import { ComponentSandbox } from "@/components/sandbox-code/component-sandbox";

const APP_TSX = `import { TimePicker } from "./components/ui/time-picker";

export default function App() {
  return (
    <div style={{ width: "100%", maxWidth: "16rem" }}>
      <TimePicker placeholder="시간을 선택하세요" />
    </div>
  );
}
`;

export function TimePickerLiveDemo(props: { source: string; styles: string; tokens: string }) {
  return (
    <ComponentSandbox
      componentName="time-picker"
      source={props.source}
      styles={props.styles}
      tokens={props.tokens}
      demoCode={APP_TSX}
      editorHeight={320}
    />
  );
}
```

- [ ] **Step 3: page.tsx 작성**

date-picker page.tsx 구조를 미러링. 최소 구성:

```tsx
export const dynamic = "force-static";

import { CodeTabs } from "@/components/ui/code-tabs";
import { Preview } from "@/components/preview";
import { PropsTable } from "@/components/props-table";
import { SubComponents } from "@/components/sub-components";
import { VariantSource } from "@/components/variant-source";
import { loadComponentSources } from "@/components/sandbox-code/load-component-sources";
import { TimePickerLiveDemo } from "./time-picker-live-demo";
import { ControlledDemo, SecondsDemo, Hour12Demo, StepDemo, MinMaxDemo, StatesDemo, WithLabelDemo } from "./_demos/basic";

const sources = loadComponentSources("time-picker");

export default function TimePickerPage() {
  return (
    <main className="container">
      <h1>TimePicker</h1>
      <p className="muted">팝오버 세그먼트 스피너로 시각(시·분·초)을 선택하는 컴포넌트. 24/12시간제·초·분 간격·min/max를 지원한다.</p>

      <TimePickerLiveDemo source={sources.source} styles={sources.styles} tokens={sources.tokens} />

      <h2>Installation</h2>
      <h3>CLI</h3>
      <CodeTabs items={[
        { value: "react", label: "React", language: "bash", showLineNumbers: false, code: `npx sh-ui-cli add time-picker` },
        { value: "flutter", label: "Flutter", language: "bash", showLineNumbers: false, code: `npx sh-ui-cli add time-picker` },
      ]} />
      <h3>Manual</h3>
      <VariantSource name="time-picker" />

      <h2>Usage</h2>
      <CodeTabs items={[
        { value: "react", label: "React", language: "tsx", code: `import {
  TimePicker,
  TimePickerTrigger,
  TimePickerContent,
  TimePickerField,
  TimePickerFooter,
  useTimePicker,
} from "@/components/ui/time-picker";

// 기본 (children 생략 시 Trigger + Content + Field 자동)
<TimePicker placeholder="시간 선택" />

// Controlled
const [time, setTime] = useState<Date | undefined>(new Date());
<TimePicker value={time} onValueChange={setTime} />

// 12시간제 + 초
<TimePicker hour12 showSeconds />

// Compound 조립 (Footer)
<TimePicker value={time} onValueChange={setTime}>
  <TimePickerTrigger />
  <TimePickerContent>
    <TimePickerField />
    <TimePickerFooter>{/* 지금 / 지우기 */}</TimePickerFooter>
  </TimePickerContent>
</TimePicker>` },
        { value: "flutter", label: "Flutter", language: "dart", code: `import 'widgets/sh_ui_time_picker.dart';

// 기본
const ShUiTimePicker(placeholder: '시간 선택'),

// Controlled (StatefulWidget 내부)
DateTime? _time;
ShUiTimePicker(
  value: _time,
  onValueChange: (t) => setState(() => _time = t),
),

// 12시간제 + 초
const ShUiTimePicker(hour12: true, showSeconds: true),` },
      ]} />

      <h2>Examples</h2>

      <h3>Controlled</h3>
      <Preview><Preview.Demo><ControlledDemo /></Preview.Demo>
        <CodeTabs items={[{ value: "react", label: "React", language: "tsx", code: `const [time, setTime] = useState<Date | undefined>(new Date());\n<TimePicker value={time} onValueChange={setTime} />` }]} />
      </Preview>

      <h3>12시간제 (AM/PM)</h3>
      <Preview><Preview.Demo><Hour12Demo /></Preview.Demo>
        <CodeTabs items={[{ value: "react", label: "React", language: "tsx", code: `<TimePicker hour12 locale="en-US" />` }]} />
      </Preview>

      <h3>초 표시</h3>
      <Preview><Preview.Demo><SecondsDemo /></Preview.Demo>
        <CodeTabs items={[{ value: "react", label: "React", language: "tsx", code: `<TimePicker showSeconds />` }]} />
      </Preview>

      <h3>분 간격 (minuteStep)</h3>
      <Preview><Preview.Demo><StepDemo /></Preview.Demo>
        <CodeTabs items={[{ value: "react", label: "React", language: "tsx", code: `<TimePicker minuteStep={5} />` }]} />
      </Preview>

      <h3>시간 범위 제한 (min / max)</h3>
      <Preview><Preview.Demo><MinMaxDemo /></Preview.Demo>
        <CodeTabs items={[{ value: "react", label: "React", language: "tsx", code: `<TimePicker min={new Date(2020,0,1,9,0)} max={new Date(2020,0,1,18,0)} />` }]} />
      </Preview>

      <h3>상태</h3>
      <Preview><Preview.Demo><StatesDemo /></Preview.Demo>
        <CodeTabs items={[{ value: "react", label: "React", language: "tsx", code: `<TimePicker defaultValue={new Date()} />\n<TimePicker placeholder="disabled" disabled />\n<TimePicker defaultValue={new Date()} readOnly />\n<TimePicker placeholder="invalid" aria-invalid />` }]} />
      </Preview>

      <h3>Label과 함께</h3>
      <Preview><Preview.Demo><WithLabelDemo /></Preview.Demo>
        <CodeTabs items={[{ value: "react", label: "React", language: "tsx", code: `<Label htmlFor="alarm" isRequired>알람 시각</Label>\n<TimePicker placeholder="HH:MM" />` }]} />
      </Preview>

      <h2>구성 요소</h2>
      <SubComponents rows={[
        { name: "TimePicker", description: "루트. value/open 상태를 Context로 제공. children 생략 시 Trigger + Content + Field 자동 렌더." },
        { name: "TimePickerTrigger", description: "팝오버를 여는 버튼. 기본은 포맷된 시각 + clock 아이콘, children에 render prop 전달 가능." },
        { name: "TimePickerContent", description: "Popover Portal/Positioner/Popup 래퍼." },
        { name: "TimePickerField", description: "세그먼트 스피너 그룹. HH:MM(:SS)(오전/오후). 화살표·숫자·a/p 키 지원." },
        { name: "TimePickerFooter", description: "하단 액션 영역. 지금/지우기 등 버튼 배치." },
        { name: "useTimePicker", description: "Footer 내부에서 value/open을 제어하는 훅." },
      ]} />

      <h2>API Reference</h2>
      <h3>TimePicker</h3>
      <PropsTable rows={[
        { prop: "value", type: "Date", description: "선택된 시각 (controlled). 시/분/초만 의미." },
        { prop: "defaultValue", type: "Date", description: "초기 시각 (uncontrolled)." },
        { prop: "onValueChange", type: "(date: Date | undefined) => void", description: "시각 변경 콜백." },
        { prop: "hour12", type: "boolean", default: "false (24시간제)", description: "12시간제 + AM/PM 세그먼트. 미지정 시 24시간제. inferHour12(locale)로 locale 추론값을 직접 구할 수 있음." },
        { prop: "showSeconds", type: "boolean", default: "false", description: "초(SS) 세그먼트 표시." },
        { prop: "minuteStep", type: "number", default: "1", description: "↑/↓ 분 증감 단위." },
        { prop: "secondStep", type: "number", default: "1", description: "↑/↓ 초 증감 단위." },
        { prop: "min", type: "Date", description: "선택 가능 최소 시각(하루 중 시각으로 비교)." },
        { prop: "max", type: "Date", description: "선택 가능 최대 시각(하루 중 시각으로 비교)." },
        { prop: "placeholder", type: "string", default: "locale 기반 자동", description: "미선택 시 플레이스홀더." },
        { prop: "locale", type: "string", default: `"ko-KR"`, description: "BCP47 로케일. 포맷·hour12 추론·세그먼트 라벨에 적용." },
        { prop: "messages", type: "TimePickerMessages", description: "세그먼트 aria-label override." },
        { prop: "formatTime", type: "(date: Date) => string", default: "Intl.DateTimeFormat", description: "트리거 표시 포맷터." },
        { prop: "disabled", type: "boolean" },
        { prop: "readOnly", type: "boolean" },
        { prop: "aria-invalid", type: `boolean | "true"`, description: "에러 상태. 보더가 --danger로 전환." },
        { prop: "container", type: "HTMLElement | RefObject<HTMLElement | null>", default: "document.body", description: "Portal 마운트 노드." },
        { prop: "children", type: "ReactNode", description: "조립 모드. 생략 시 Trigger + Content + Field 자동." },
      ]} />

      <h3>키보드 내비게이션</h3>
      <PropsTable rows={[
        { prop: "↑↓", type: "", description: "포커스된 세그먼트 증감 (랩어라운드, 분/초는 step)." },
        { prop: "←→", type: "", description: "세그먼트 간 이동." },
        { prop: "0–9", type: "", description: "숫자 직접 입력 (누적, 자동 다음 세그먼트)." },
        { prop: "a / p", type: "", description: "meridiem을 오전/오후로 설정 (hour12)." },
        { prop: "Escape", type: "", description: "팝오버 닫기." },
      ]} />
    </main>
  );
}
```

- [ ] **Step 4: showcase 등록**

`apps/docs/components/create/showcases/time-picker.tsx`:

```tsx
import { TimePicker } from "@/components/ui/time-picker";
import type { ShowcaseDemoProps, ShowcaseManifest } from "./types";

const Demo = ({ containerRef }: ShowcaseDemoProps) => (
  <TimePicker container={containerRef} placeholder="시간 선택" />
);

const showcase: ShowcaseManifest = {
  id: "time-picker",
  label: "TimePicker",
  category: "form",
  Demo,
};

export default showcase;
```

`apps/docs/components/create/showcases/index.ts` 수정: date-picker 패턴대로 import + 배열 등록.
- `import timePicker from "./time-picker";` (import 블록에 추가, `datePicker` 근처)
- 등록 배열에 `timePicker,` 추가.

- [ ] **Step 5: 사이드바 nav 등록**

`apps/docs/components/app-sidebar.tsx`에서 알파벳 순서상 `Textarea` 다음, `Toast` 앞 위치에 추가(실제 배열에서 T 항목들 사이):

```tsx
{ title: "TimePicker", href: "/components/time-picker" },
```

- [ ] **Step 6: 컴포넌트 색인 카드 등록**

`apps/docs/app/[locale]/(docs)/components/page.tsx`에서 date-picker 카드와 같은 형식으로 추가:

```tsx
{ name: "TimePicker", slug: "time-picker", description: "시각 선택 — 세그먼트 스피너 팝오버." },
```

- [ ] **Step 7: visual 테스트 슬러그 등록**

`apps/docs/tests/visual/components.spec.ts`의 `COMPONENTS` 배열에 `"time-picker"` 추가(알파벳 순). 기본 데모는 placeholder만 표시되어 캡처가 안정적(값 없음 → "오늘/현재 시각" 렌더 안 함).

- [ ] **Step 8: docs 타입체크 + 검색 인덱스 재생성**

Run: `cd apps/docs && pnpm typecheck`
Expected: PASS.
검색 인덱스는 `predev`/`prebuild`에서 자동 재생성되므로 별도 조치 불필요(수동 확인 원하면 `node scripts/build-search-index.mjs`).

- [ ] **Step 9: 커밋**

```bash
git add "apps/docs/app/[locale]/(docs)/components/time-picker" apps/docs/components/create/showcases/time-picker.tsx apps/docs/components/create/showcases/index.ts apps/docs/components/app-sidebar.tsx "apps/docs/app/[locale]/(docs)/components/page.tsx" apps/docs/tests/visual/components.spec.ts
git commit -m "feat(time-picker): docs 페이지·데모·nav·showcase·visual 등록

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 6: Flutter ShUiTimePicker 위젯 + 듀얼 카피 + showcase + 레지스트리

React와 API·인터랙션을 통일한 세그먼트 스테퍼 위젯. `sh_ui_date_picker.dart`의 LayerLink+OverlayEntry+ShUiTheme 패턴을 미러링.

**Files:**
- Create: `packages/registry/flutter/widgets/sh_ui_time_picker.dart`
- Create: `apps/showcase/lib/widgets/sh_ui_time_picker.dart` (원본과 동일 복사)
- Modify: `packages/registry/flutter/registry.json`
- Modify: showcase 앱의 위젯 목록/페이지 등록 파일 (아래 Step 4에서 위치 확정)

**Interfaces:**
- Produces: `class ShUiTimePicker extends StatefulWidget` — 필드: `DateTime? value`, `ValueChanged<DateTime?>? onValueChange`, `String placeholder`, `bool hour12`, `bool showSeconds`, `int minuteStep`, `int secondStep`, `DateTime? min`, `DateTime? max`, `bool enabled`.

- [ ] **Step 1: sh_ui_date_picker.dart 정독**

Run: `sed -n '1,648p' packages/registry/flutter/widgets/sh_ui_date_picker.dart` — 트리거 Container decoration, `ShUiTheme` 토큰 접근(`shUi.colors`, `shUi.spacing.s3`, `shUi.control.md`, `shUi.opacity.disabled`), Overlay/CompositedTransform 패턴, dispose 처리를 그대로 채용하기 위해.

- [ ] **Step 2: ShUiTimePicker 구현**

`packages/registry/flutter/widgets/sh_ui_time_picker.dart` — date-picker의 트리거/오버레이 골격을 재사용하되, 오버레이 본문을 **세그먼트 스테퍼**(시/분/(초)/(오전·오후) 각각 ▲/▼ 버튼 + 값 표시)로 구성. 값 갱신 로직은 React 헬퍼와 동일한 규칙:
- 24시간제 내부 표현. `hour12`면 표시만 12시간제 + 오전/오후.
- `min`/`max`는 하루 중 시각(시*3600+분*60+초)으로 클램프.
- `value`가 있으면 그 날짜 보존, 없으면 `DateTime.now()` 기준으로 시/분/초 세팅.
- 증감: 시 wrap(0–23 또는 12h이면 1–12), 분 `minuteStep`, 초 `secondStep`.
- 트리거 표시: `hour12`면 `오전/오후 h:mm(:ss)`, 아니면 `HH:MM(:SS)` — 간단한 문자열 포맷 함수로 구현(Intl 의존 없이).

핵심 스켈레톤:

```dart
import 'package:flutter/material.dart';
import '../foundation/sh_ui_tokens.dart';

/// sh-ui TimePicker — 시각 선택 (세그먼트 스테퍼).
class ShUiTimePicker extends StatefulWidget {
  final DateTime? value;
  final ValueChanged<DateTime?>? onValueChange;
  final String placeholder;
  final bool hour12;
  final bool showSeconds;
  final int minuteStep;
  final int secondStep;
  final DateTime? min;
  final DateTime? max;
  final bool enabled;

  const ShUiTimePicker({
    super.key,
    this.value,
    this.onValueChange,
    this.placeholder = '시간 선택',
    this.hour12 = false,
    this.showSeconds = false,
    this.minuteStep = 1,
    this.secondStep = 1,
    this.min,
    this.max,
    this.enabled = true,
  });

  @override
  State<ShUiTimePicker> createState() => _ShUiTimePickerState();
}

class _ShUiTimePickerState extends State<ShUiTimePicker> {
  final LayerLink _layerLink = LayerLink();
  OverlayEntry? _overlay;
  bool _isOpen = false;

  int _wrap(int v, int min, int max) {
    final range = max - min + 1;
    return ((v - min) % range + range) % range + min;
  }

  int _secondsOf(DateTime d) => d.hour * 3600 + d.minute * 60 + d.second;

  DateTime _apply(int h, int m, int s) {
    final base = widget.value ?? DateTime.now();
    var next = DateTime(base.year, base.month, base.day, h, m, s);
    // min/max를 하루 중 시각으로 클램프
    int secs = h * 3600 + m * 60 + s;
    if (widget.min != null) secs = secs < _secondsOf(widget.min!) ? _secondsOf(widget.min!) : secs;
    if (widget.max != null) secs = secs > _secondsOf(widget.max!) ? _secondsOf(widget.max!) : secs;
    next = DateTime(base.year, base.month, base.day, secs ~/ 3600, (secs % 3600) ~/ 60, secs % 60);
    return next;
  }

  void _emit(int h, int m, int s) {
    widget.onValueChange?.call(_apply(h, m, s));
    _overlay?.markNeedsBuild();
  }

  String _fmt(DateTime? d) {
    if (d == null) return widget.placeholder;
    String two(int n) => n.toString().padLeft(2, '0');
    final sec = widget.showSeconds ? ':${two(d.second)}' : '';
    if (widget.hour12) {
      final mer = d.hour < 12 ? '오전' : '오후';
      var h = d.hour % 12; if (h == 0) h = 12;
      return '$mer $h:${two(d.minute)}$sec';
    }
    return '${two(d.hour)}:${two(d.minute)}$sec';
  }

  // _open / _close / _buildOverlay / dispose 는 sh_ui_date_picker.dart 와 동일 패턴.
  // _buildOverlay 는 세그먼트 스테퍼 Row(시 ▲▼, ':', 분 ▲▼, (초), (오전/오후 토글))를 렌더.
  // 각 ▲ 는 해당 세그먼트를 +1(분은 minuteStep, 초는 secondStep), ▼ 는 -1, _wrap 으로 순환.
  // build() 트리거는 sh_ui_date_picker.dart 의 Container/decoration/Opacity/GestureDetector 를 재사용,
  // displayText = _fmt(widget.value), 아이콘은 시계 아이콘(Icons.access_time).

  @override
  Widget build(BuildContext context) {
    // date-picker build() 미러 — 생략된 부분은 sh_ui_date_picker.dart 참조.
    throw UnimplementedError('구현 시 sh_ui_date_picker.dart build/overlay 패턴을 채운다');
  }
}
```

> 구현자 주의: 위 스켈레톤의 `build()`/`_open()`/`_close()`/`_buildOverlay()`는 `sh_ui_date_picker.dart`의 동명 메서드를 그대로 옮겨 오버레이 본문만 세그먼트 스테퍼로 교체한다. `throw UnimplementedError`는 반드시 실제 구현으로 대체.

- [ ] **Step 3: 듀얼 카피**

```bash
cp packages/registry/flutter/widgets/sh_ui_time_picker.dart apps/showcase/lib/widgets/sh_ui_time_picker.dart
```

- [ ] **Step 4: showcase 페이지 등록**

showcase 앱에서 date-picker 위젯이 어떻게 등록되는지 확인 후 동일하게 추가:

Run: `grep -rn "sh_ui_date_picker\|ShUiDatePicker" apps/showcase/lib --include=*.dart | grep -v "widgets/sh_ui_date_picker.dart"`
찾은 등록 지점(위젯 목록/라우트/데모 페이지)에 `ShUiTimePicker` 데모를 date-picker와 같은 형식으로 추가한다.

- [ ] **Step 5: flutter registry.json 등록**

`packages/registry/flutter/registry.json`의 `components`에 추가:

```json
"time-picker": {
  "name": "time-picker",
  "type": "widget",
  "files": [
    { "src": "widgets/sh_ui_time_picker.dart", "dest": "{widgets}/sh_ui_time_picker.dart" }
  ],
  "dependencies": [],
  "registryDependencies": ["tokens"]
}
```

- [ ] **Step 6: Flutter 분석 + drift lint**

Run: `cd apps/showcase && flutter analyze lib/widgets/sh_ui_time_picker.dart`
Expected: No issues.
Run: `pnpm lint:drift`
Expected: PASS (flutter dual-copy 포함).

- [ ] **Step 7: 커밋**

```bash
git add packages/registry/flutter/widgets/sh_ui_time_picker.dart apps/showcase/lib/widgets/sh_ui_time_picker.dart packages/registry/flutter/registry.json apps/showcase/lib
git commit -m "feat(time-picker): Flutter ShUiTimePicker 위젯 + showcase + 레지스트리

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 7: versions.json 엔트리 + 전체 검증

**Files:**
- Modify: `packages/changelog/versions.json`

**Interfaces:** 없음 (릴리즈 메타데이터).

- [ ] **Step 1: versions.json 맨 앞에 엔트리 prepend**

`versions` 배열의 첫 요소로 추가:

```json
{
  "version": "0.121.0",
  "date": "2026-07-08",
  "title": "TimePicker — 세그먼트 스피너 시각 선택 (React + Flutter)",
  "type": "minor",
  "highlights": [
    "신규 TimePicker — 트리거+팝오버 안 HH:MM(:SS) 세그먼트 스피너. 화살표·숫자·a/p 키로 편집, value=Date",
    "24/12시간제(오전·오후) · 초 표시 · minuteStep/secondStep · min/max(하루 중 시각 기준) 지원",
    "React(3 스타일 변형) + Flutter ShUiTimePicker 동시 제공. 설치: sh-ui add time-picker"
  ],
  "url": "https://github.com/sanghyeonKim0201/sh-ui/releases/tag/v0.121.0"
}
```

- [ ] **Step 2: 전체 검증 스위트**

각각 실행하고 모두 통과 확인:

```bash
# 1) 레지스트리 단위 테스트 (vitest — registry/react에는 tsconfig가 없어 vitest가 유일한 TS 검증)
cd packages/registry/react && pnpm test -- time-picker && cd ../../..
# 2) docs 타입체크 (듀얼 카피본을 tsc --noEmit 로 검증 — 레지스트리 컴포넌트의 실질 타입 게이트)
cd apps/docs && pnpm typecheck && cd ../..
# 3) 전체 타입체크 (turbo → 현재 typecheck 스크립트가 있는 워크스페이스는 docs)
pnpm typecheck
# 4) drift lint (registry + dual-copy + tokens-used)
pnpm lint:drift
# 5) Flutter analyze
cd apps/showcase && flutter analyze lib/widgets/sh_ui_time_picker.dart && cd ../..
```

Expected: 전부 PASS. 실패 시 해당 태스크로 돌아가 수정.

- [ ] **Step 3: visual baseline 생성 (로컬 개발 서버 필요)**

Run: `cd apps/docs && pnpm visual:update -- time-picker` (또는 전체 `pnpm visual:update`)
새 `time-picker` 스냅샷 baseline이 생성된다. 생성된 baseline 이미지를 스테이징.

- [ ] **Step 4: 최종 커밋**

```bash
git add packages/changelog/versions.json apps/docs/tests/visual
git commit -m "release(time-picker): versions.json 0.121.0 엔트리 + visual baseline

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

- [ ] **Step 5: 릴리즈 안내 (구현자 → 사용자)**

구현 완료. 릴리즈는 레포 브랜치 정책(dev → live PR → live에서 태그)을 따른다:
`git push origin dev` → `gh pr create --base live --head dev` → CI green → merge → `git checkout live && git pull && git tag v0.121.0 && git push origin v0.121.0`.
태그 푸시가 publish.yml(npm) + release.yml(GH Release)을 발동. **dev에서 직접 태그 금지.**

---

## Self-Review

**1. Spec coverage:**
- 값 모델(Date, 날짜 보존, min/max 하루 중 시각) → Task 1(clampSegments/applySegments) + Task 2(commit). ✅
- hour12 locale 추론 → Task 1(inferHour12) + Task 2(resolvedHour12). ✅
- showSeconds / minuteStep / secondStep → Task 2(Field). ✅
- 세그먼트 스피너 키보드(↑↓/←→/숫자/a-p) → Task 2(Segment) + 테스트. ✅
- 트리거+시계 아이콘 → Task 2(ClockIcon/Trigger). ✅
- disabled/readOnly/aria-invalid → Task 2. ✅
- compound 구조 + useTimePicker → Task 2. ✅
- 3 스타일 변형 → Task 3. ✅
- React 원본 ↔ docs 듀얼 카피 → Task 4. ✅
- 레지스트리 등록(react+flutter) + tokens-used → Task 4, Task 6. ✅
- docs 페이지(CodeTabs 양 탭)·nav·색인·showcase·검색·visual → Task 5. ✅
- Flutter 위젯 + showcase 듀얼 카피 → Task 6. ✅
- versions.json MINOR → Task 7. ✅
- 단위/타입/visual 테스트 → Task 1,2 + Task 7. ✅

**2. Placeholder scan:** Task 6 Step 2에 의도적 `throw UnimplementedError`가 있으나, 같은 스텝에 "반드시 실제 구현으로 대체" 지시 + 미러링할 정확한 원본 파일/메서드를 명시함(플랜 실패의 "구현 미룸"이 아니라, 재사용 대상 파일이 존재하는 미러 작업). styles.css의 `--radius-sm`/`--text-lg`는 "없으면 근접 토큰으로 대체" 지시로 모호성 제거.

**3. Type consistency:** `TimeSegments`/`commit(seg)`/`applySegments(base, seg)`/`clampSegments(seg, min, max)`/`wrap(v,min,max)`/`to12h`/`from12h`/`getSegments`/`defaultFormatTime` 시그니처가 Task 1 정의와 Task 2 사용에서 일치. `useTimePicker()`가 `{ value, setValue, open, setOpen }` 반환(Task 2)과 docs CompoundDemo 사용(Task 5)이 일치. Flutter 필드명(value/onValueChange/hour12/showSeconds/minuteStep/secondStep/min/max/enabled)이 Task 6 정의와 Task 5 Flutter usage 예시에서 일치.
