"use client";

import { useState } from "react";
import {
  DatePicker,
  DatePickerTrigger,
  DatePickerContent,
  DatePickerCalendar,
  DatePickerFooter,
  DateRangePicker,
  useDatePicker,
} from "@/components/ui/date-picker";
import type { DateRange } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function BasicDemo() {
  return (
    <div style={{ width: "100%", maxWidth: 280 }}>
      <DatePicker placeholder="날짜를 선택하세요" />
    </div>
  );
}

export function ControlledDemo() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div style={{ width: "100%", maxWidth: 280, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <DatePicker value={date} onValueChange={setDate} />
      <p style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)" }}>
        선택: {date ? date.toLocaleDateString("ko-KR") : "없음"}
      </p>
    </div>
  );
}

export function MinMaxDemo() {
  const today = new Date();
  const min = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
  const max = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30);

  return (
    <div style={{ width: "100%", maxWidth: 280, display: "flex", flexDirection: "column", gap: "0.25rem" }}>
      <Label>예약 날짜</Label>
      <DatePicker min={min} max={max} placeholder="오늘 기준 -7일 ~ +30일" />
    </div>
  );
}

export function StatesDemo() {
  return (
    <div style={{ width: "100%", maxWidth: 280, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <DatePicker defaultValue={new Date()} />
      <DatePicker placeholder="disabled" disabled />
      <DatePicker defaultValue={new Date()} readOnly />
      <DatePicker placeholder="invalid" aria-invalid />
    </div>
  );
}

export function WithLabelDemo() {
  return (
    <div style={{ width: "100%", maxWidth: 280, display: "flex", flexDirection: "column", gap: "0.25rem" }}>
      <Label htmlFor="birth" isRequired>생년월일</Label>
      <DatePicker id="birth" placeholder="YYYY-MM-DD" />
    </div>
  );
}

export function RangeBasicDemo() {
  return (
    <div style={{ width: "100%", maxWidth: 320 }}>
      <DateRangePicker placeholder="시작일 ~ 종료일" />
    </div>
  );
}

export function RangeControlledDemo() {
  const [range, setRange] = useState<DateRange | undefined>();

  return (
    <div style={{ width: "100%", maxWidth: 320, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <DateRangePicker value={range} onValueChange={setRange} />
      <p style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)" }}>
        {range
          ? `${range.from.toLocaleDateString("ko-KR")} ~ ${range.to.toLocaleDateString("ko-KR")}`
          : "미선택"}
      </p>
    </div>
  );
}

export function RangeWithLabelDemo() {
  return (
    <div style={{ width: "100%", maxWidth: 320, display: "flex", flexDirection: "column", gap: "0.25rem" }}>
      <Label htmlFor="stay" isRequired>투숙 기간</Label>
      <DateRangePicker
        id="stay"
        min={new Date()}
        placeholder="체크인 ~ 체크아웃"
      />
    </div>
  );
}

function TodayClearActions() {
  const { setValue, setFocusedDate, setOpen } = useDatePicker();
  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          const today = new Date();
          setValue(today);
          setFocusedDate(new Date(today.getFullYear(), today.getMonth(), 1));
          setOpen(false);
        }}
      >
        오늘
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setValue(undefined);
          setOpen(false);
        }}
      >
        지우기
      </Button>
    </>
  );
}

export function CompoundDemo() {
  const [date, setDate] = useState<Date | undefined>();

  return (
    <div style={{ width: "100%", maxWidth: 280, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <DatePicker value={date} onValueChange={setDate} closeOnSelect={false}>
        <DatePickerTrigger />
        <DatePickerContent>
          <DatePickerCalendar />
          <DatePickerFooter>
            <TodayClearActions />
          </DatePickerFooter>
        </DatePickerContent>
      </DatePicker>
      <p style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)" }}>
        선택: {date ? date.toLocaleDateString("ko-KR") : "없음"}
      </p>
    </div>
  );
}

export function LocaleEnDemo() {
  return (
    <div style={{ width: "100%", maxWidth: 280 }}>
      <DatePicker locale="en-US" />
    </div>
  );
}

export function RangeLocaleJaDemo() {
  return (
    <div style={{ width: "100%", maxWidth: 280 }}>
      <DateRangePicker locale="ja-JP" />
    </div>
  );
}

export function CustomTriggerDemo() {
  const [date, setDate] = useState<Date | undefined>();

  return (
    <div style={{ width: "100%", maxWidth: 280 }}>
      <DatePicker value={date} onValueChange={setDate}>
        <DatePickerTrigger>
          {({ formatted, placeholder }) => (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
              <span aria-hidden>🗓️</span>
              <span>{formatted ?? placeholder}</span>
            </span>
          )}
        </DatePickerTrigger>
        <DatePickerContent>
          <DatePickerCalendar />
        </DatePickerContent>
      </DatePicker>
    </div>
  );
}

/**
 * DatePicker + TimePicker 를 하나의 Date 상태로 묶어 날짜와 시간을 함께 선택한다.
 * - DatePicker 로 날짜를 바꾸면 기존 시각(시/분/초)을 보존한다.
 * - TimePicker 는 값의 날짜 부분을 보존하므로 시간만 갱신한다.
 */
export function DateTimeDemo() {
  const [dateTime, setDateTime] = useState<Date | undefined>();

  const handleDateChange = (date: Date | undefined) => {
    if (!date) {
      setDateTime(undefined);
      return;
    }
    setDateTime((prev) => {
      const next = new Date(date);
      if (prev) {
        next.setHours(prev.getHours(), prev.getMinutes(), prev.getSeconds(), 0);
      }
      return next;
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "100%", maxWidth: 360 }}>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", flex: "1 1 180px" }}>
          <Label htmlFor="dt-date">날짜</Label>
          <DatePicker id="dt-date" value={dateTime} onValueChange={handleDateChange} placeholder="날짜 선택" />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", flex: "1 1 140px" }}>
          <Label htmlFor="dt-time">시간</Label>
          <TimePicker id="dt-time" value={dateTime} onValueChange={setDateTime} placeholder="시간 선택" />
        </div>
      </div>
      <p style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)" }}>
        선택: {dateTime ? dateTime.toLocaleString("ko-KR") : "미선택"}
      </p>
    </div>
  );
}
