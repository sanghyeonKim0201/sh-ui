"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ColorPicker } from "@/components/ui/color-picker";
import { Slider } from "@/components/ui/slider";
import { NumericInput } from "@/components/ui/numeric-input";
import {
  GRADIENT_SLOT_LABELS,
  GRADIENT_SLOT_NAMES,
  serializeGradient,
  type GradientSlot,
  type GradientSlotName,
  type GradientTokens,
} from "./gradients";

type Props = {
  value: GradientTokens;
  onChange: (next: GradientTokens) => void;
};

export function GradientBuilder({ value, onChange }: Props) {
  const [openSlot, setOpenSlot] = useState<GradientSlotName | null>(null);
  const [openStop, setOpenStop] = useState<{ slot: GradientSlotName; idx: 0 | 1 } | null>(null);

  const update = (slot: GradientSlotName, next: GradientSlot) => {
    onChange({ ...value, [slot]: next });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {GRADIENT_SLOT_NAMES.map((name) => {
        const slot = value[name];
        const isOpen = openSlot === name;
        const css = serializeGradient(slot);
        return (
          <div
            key={name}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.375rem",
              padding: "0.5rem",
              border: "1px solid var(--border)",
              borderRadius: "calc(var(--radius) - 2px)",
              background: "var(--background)",
            }}
          >
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setOpenSlot(isOpen ? null : name)}
              aria-expanded={isOpen}
              style={{
                height: "auto",
                display: "grid",
                gridTemplateColumns: "auto 1fr auto",
                gap: "0.5rem",
                padding: 0,
                fontWeight: 400,
                textAlign: "left",
              }}
            >
              <span
                aria-hidden
                style={{
                  width: "1.75rem",
                  height: "1.25rem",
                  borderRadius: "calc(var(--radius) - 4px)",
                  background: css,
                  border: "1px solid var(--border)",
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: "0.75rem", fontWeight: 500 }}>
                {GRADIENT_SLOT_LABELS[name]}
              </span>
              <span style={{ fontSize: "0.6875rem", color: "var(--foreground-muted)" }}>
                {slot.angle}°
              </span>
            </Button>
            {isOpen && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.25rem" }}>
                {/* angle */}
                <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center", gap: "0.5rem" }}>
                  <code style={{ fontSize: "0.6875rem", color: "var(--foreground-muted)", minWidth: "2.5rem" }}>
                    각도
                  </code>
                  <Slider
                    value={slot.angle}
                    onValueChange={(v) => update(name, { ...slot, angle: v })}
                    min={0}
                    max={360}
                    step={1}
                    aria-label="각도"
                  />
                  <NumericInput
                    value={slot.angle}
                    onValueChange={(v) => update(name, { ...slot, angle: v })}
                    min={0}
                    max={360}
                    step={1}
                    unit="°"
                    aria-label="각도"
                  />
                </div>
                {/* stops */}
                {[0, 1].map((idx) => {
                  const stop = slot.stops[idx as 0 | 1];
                  const stopOpen =
                    openStop?.slot === name && openStop?.idx === idx;
                  return (
                    <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "auto 1fr auto",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            setOpenStop(
                              stopOpen ? null : { slot: name, idx: idx as 0 | 1 },
                            )
                          }
                          aria-expanded={stopOpen}
                          aria-label={`Stop ${idx + 1} 색`}
                          style={{
                            width: "1.5rem",
                            height: "1.5rem",
                            padding: 0,
                            border: stopOpen ? "2px solid var(--foreground)" : "1px solid var(--border)",
                            background: stop.color,
                          }}
                        />
                        <code style={{ fontSize: "0.6875rem", color: "var(--foreground-muted)" }}>
                          {stop.color}
                        </code>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                          <div style={{ width: "5rem" }}>
                            <Slider
                              value={stop.position}
                              onValueChange={(v) => {
                                const stops = [...slot.stops] as [typeof slot.stops[0], typeof slot.stops[1]];
                                stops[idx as 0 | 1] = { ...stop, position: v };
                                update(name, { ...slot, stops });
                              }}
                              min={0}
                              max={100}
                              step={1}
                              aria-label={`Stop ${idx + 1} 위치`}
                            />
                          </div>
                          <NumericInput
                            value={stop.position}
                            onValueChange={(v) => {
                              const stops = [...slot.stops] as [typeof slot.stops[0], typeof slot.stops[1]];
                              stops[idx as 0 | 1] = { ...stop, position: v };
                              update(name, { ...slot, stops });
                            }}
                            min={0}
                            max={100}
                            step={1}
                            unit="%"
                            aria-label={`Stop ${idx + 1} 위치`}
                          />
                        </div>
                      </div>
                      {stopOpen && (
                        <div
                          style={{
                            padding: "0.5rem",
                            border: "1px solid var(--border)",
                            borderRadius: "calc(var(--radius) - 2px)",
                            background: "var(--background-subtle)",
                          }}
                        >
                          <ColorPicker
                            value={stop.color}
                            onChange={(v) => {
                              const stops = [...slot.stops] as [typeof slot.stops[0], typeof slot.stops[1]];
                              stops[idx as 0 | 1] = { ...stop, color: v };
                              update(name, { ...slot, stops });
                            }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
                <code
                  style={{
                    fontSize: "0.6875rem",
                    color: "var(--foreground-muted)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={css}
                >
                  --gradient-{name}: {css}
                </code>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
