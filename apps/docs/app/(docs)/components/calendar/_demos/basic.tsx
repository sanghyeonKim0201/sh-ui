"use client";

import { useState } from "react";
import {
  Calendar,
  CalendarHeader,
  CalendarPrevYearButton,
  CalendarPrevMonthButton,
  CalendarYearSelect,
  CalendarMonthSelect,
  CalendarNextMonthButton,
  CalendarNextYearButton,
  CalendarGrid,
} from "@/components/ui/calendar";
import type { DateRange } from "@/components/ui/calendar";

export function BasicDemo() {
  return <Calendar />;
}

export function SingleControlledDemo() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", alignItems: "flex-start" }}>
      <Calendar value={date} onValueChange={setDate} />
      <p style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)" }}>
        선택: {date ? date.toLocaleDateString("ko-KR") : "없음"}
      </p>
    </div>
  );
}

export function MultipleDemo() {
  const [dates, setDates] = useState<Date[]>([]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", alignItems: "flex-start" }}>
      <Calendar mode="multiple" value={dates} onValueChange={setDates} />
      <p style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)" }}>
        선택 {dates.length}일
      </p>
    </div>
  );
}

export function RangeDemo() {
  const [range, setRange] = useState<DateRange | undefined>();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", alignItems: "flex-start" }}>
      <Calendar mode="range" value={range} onValueChange={setRange} />
      <p style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)" }}>
        {range
          ? `${range.from.toLocaleDateString("ko-KR")} ~ ${range.to.toLocaleDateString("ko-KR")}`
          : "범위 미선택"}
      </p>
    </div>
  );
}

export function TwoMonthsDemo() {
  const [range, setRange] = useState<DateRange | undefined>();
  return (
    <Calendar
      mode="range"
      numberOfMonths={2}
      value={range}
      onValueChange={setRange}
    />
  );
}

export function MinMaxDemo() {
  const today = new Date();
  const min = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
  const max = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30);

  return <Calendar min={min} max={max} />;
}

export function DisabledDatesDemo() {
  const [date, setDate] = useState<Date | undefined>();
  return (
    <Calendar
      value={date}
      onValueChange={setDate}
      disabled={(d) => d.getDay() === 0 || d.getDay() === 6}
    />
  );
}

export function MondayStartDemo() {
  return <Calendar weekStartsOn={1} />;
}

export function NoOutsideDaysDemo() {
  return <Calendar showOutsideDays={false} />;
}

export function CompoundMonthOnlyDemo() {
  // 년 단위 화살표 없이 월 화살표 + 두 개 dropdown 만 노출.
  return (
    <Calendar>
      <CalendarHeader>
        <CalendarPrevMonthButton />
        <div style={{ display: "inline-flex", gap: "0.25rem", flex: "1 1 auto", justifyContent: "center" }}>
          <CalendarYearSelect />
          <CalendarMonthSelect />
        </div>
        <CalendarNextMonthButton />
      </CalendarHeader>
      <CalendarGrid />
    </Calendar>
  );
}

export function CompoundYearOnlyDemo() {
  // 월 단위 화살표 빼고 년 단위 화살표만.
  return (
    <Calendar>
      <CalendarHeader>
        <CalendarPrevYearButton />
        <div style={{ display: "inline-flex", gap: "0.25rem", flex: "1 1 auto", justifyContent: "center" }}>
          <CalendarYearSelect />
          <CalendarMonthSelect />
        </div>
        <CalendarNextYearButton />
      </CalendarHeader>
      <CalendarGrid />
    </Calendar>
  );
}

export function CompoundNoArrowsDemo() {
  // 화살표 다 빼고 dropdown 으로만 탐색.
  return (
    <Calendar>
      <CalendarHeader>
        <div style={{ display: "inline-flex", gap: "0.25rem", margin: "0 auto" }}>
          <CalendarYearSelect />
          <CalendarMonthSelect />
        </div>
      </CalendarHeader>
      <CalendarGrid />
    </Calendar>
  );
}
