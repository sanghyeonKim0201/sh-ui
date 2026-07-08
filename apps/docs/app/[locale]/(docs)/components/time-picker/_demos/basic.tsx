"use client";

import { useState } from "react";
import {
  TimePicker,
  TimePickerTrigger,
  TimePickerContent,
  TimePickerField,
  TimePickerFooter,
  useTimePicker,
} from "@/components/ui/time-picker";
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
  return (
    <div style={box}>
      <TimePicker showSeconds defaultValue={new Date(2020, 0, 1, 14, 5, 30)} />
    </div>
  );
}

export function Hour12Demo() {
  return (
    <div style={box}>
      <TimePicker hour12 defaultValue={new Date(2020, 0, 1, 15, 45, 0)} locale="en-US" />
    </div>
  );
}

export function StepDemo() {
  return (
    <div style={box}>
      <TimePicker minuteStep={5} placeholder="5분 단위" />
    </div>
  );
}

export function MinMaxDemo() {
  return (
    <div style={{ ...box, gap: "0.25rem" }}>
      <Label>업무 시간</Label>
      <TimePicker
        min={new Date(2020, 0, 1, 9, 0, 0)}
        max={new Date(2020, 0, 1, 18, 0, 0)}
        placeholder="09:00 ~ 18:00"
      />
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

function NowClearActions() {
  const { setValue, setOpen } = useTimePicker();
  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setValue(new Date());
          setOpen(false);
        }}
      >
        지금
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
  const [time, setTime] = useState<Date | undefined>();

  return (
    <div style={box}>
      <TimePicker value={time} onValueChange={setTime}>
        <TimePickerTrigger />
        <TimePickerContent>
          <TimePickerField />
          <TimePickerFooter>
            <NowClearActions />
          </TimePickerFooter>
        </TimePickerContent>
      </TimePicker>
      <p style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)" }}>
        선택: {time ? time.toLocaleTimeString("ko-KR") : "없음"}
      </p>
    </div>
  );
}
