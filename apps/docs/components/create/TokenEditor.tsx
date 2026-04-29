"use client";

import { useMemo, useState } from "react";
import { ColorPicker } from "@/components/ui/color-picker";
import { Slider } from "@/components/ui/slider";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { ExportBlock } from "./ExportBlock";
import {
  TOKEN_GROUPS,
  RADIUS_PRESETS,
  buildDartColorTokens,
  type Mode,
  type TokenKey,
} from "./tokens";

type Props = {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  light: Record<TokenKey, string>;
  dark: Record<TokenKey, string>;
  onChangeCurrent: (next: Record<TokenKey, string>) => void;
  radius: number;
  onRadiusChange: (radius: number) => void;
  onReset: () => void;
  drawerOpen?: boolean;
  onClose?: () => void;
};

export function TokenEditor({
  mode,
  onModeChange,
  light,
  dark,
  onChangeCurrent,
  radius,
  onRadiusChange,
  onReset,
  drawerOpen,
  onClose,
}: Props) {
  const [openKey, setOpenKey] = useState<TokenKey | null>(null);
  const current = mode === "light" ? light : dark;

  const cssText = useMemo(() => {
    const lightVars = Object.entries(light)
      .map(([k, v]) => `  --${k}: ${v};`)
      .join("\n");
    const darkVars = Object.entries(dark)
      .map(([k, v]) => `  --${k}: ${v};`)
      .join("\n");
    return `:root {\n${lightVars}\n  --radius: ${radius}rem;\n}\n.dark {\n${darkVars}\n}`;
  }, [light, dark, radius]);

  const dartText = useMemo(() => {
    const radiusPx = (radius * 16).toFixed(1);
    return [
      "// sh-ui playground — 편집한 토큰을 Dart로 내보냄",
      "// lib/foundation/sh_ui_tokens.dart 의 해당 static const 블록을 교체.",
      "",
      buildDartColorTokens("light", light, dark),
      "",
      buildDartColorTokens("dark", dark, light),
      "",
      "static const tokens = ShUiRadiusTokens(",
      `  defaultRadius: ${radiusPx},`,
      ");",
    ].join("\n");
  }, [light, dark, radius]);

  return (
    <div
      className="sh-create-pane sh-create-pane--editor"
      data-open={drawerOpen ? "true" : "false"}
      style={{
        height: "100%",
        background: "var(--background-subtle)",
        padding: "1rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        overflowY: "auto",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
        <strong style={{ fontSize: "0.875rem" }}>토큰 편집</strong>
        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
          <button
            type="button"
            onClick={onReset}
            style={{
              fontSize: "0.75rem",
              padding: "0.25rem 0.5rem",
              background: "transparent",
              border: "1px solid var(--border)",
              borderRadius: "calc(var(--radius) - 2px)",
              cursor: "pointer",
              color: "var(--foreground-muted)",
            }}
          >
            {mode === "light" ? "Light" : "Dark"} 초기화
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="닫기"
              className="sh-create-drawer-toggle"
              style={{
                width: "1.5rem",
                height: "1.5rem",
                display: "grid",
                placeItems: "center",
                padding: 0,
                border: "1px solid var(--border)",
                borderRadius: "calc(var(--radius) - 2px)",
                background: "transparent",
                color: "var(--foreground-muted)",
                cursor: "pointer",
                fontSize: "0.875rem",
                lineHeight: 1,
              }}
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div
        role="tablist"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0.25rem",
          padding: "0.25rem",
          background: "var(--background-muted)",
          borderRadius: "calc(var(--radius) - 2px)",
        }}
      >
        {(["light", "dark"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => onModeChange(m)}
            style={{
              padding: "0.375rem",
              border: "none",
              borderRadius: "calc(var(--radius) - 4px)",
              fontSize: "0.75rem",
              fontWeight: 500,
              cursor: "pointer",
              background: mode === m ? "var(--background)" : "transparent",
              color: mode === m ? "var(--foreground)" : "var(--foreground-muted)",
              transition: "background 120ms, color 120ms",
            }}
          >
            {m === "light" ? "Light" : "Dark"}
          </button>
        ))}
      </div>

      {TOKEN_GROUPS.map((g) => (
        <div key={g.label} style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
          <div className="muted" style={{ fontSize: "0.75rem", fontWeight: 500 }}>
            {g.label}
          </div>
          {g.keys.map((k) => (
            <ColorRow
              key={k}
              name={k}
              value={current[k]}
              open={openKey === k}
              onToggle={() => setOpenKey(openKey === k ? null : k)}
              onChange={(v) => onChangeCurrent({ ...current, [k]: v })}
            />
          ))}
        </div>
      ))}

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <div className="muted" style={{ fontSize: "0.75rem", fontWeight: 500 }}>
          Radius (공통)
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ flex: 1 }}>
            <Slider
              value={radius}
              onValueChange={onRadiusChange}
              min={0}
              max={1.5}
              step={0.05}
              aria-label="Radius"
            />
          </div>
          <code style={{ fontSize: "0.75rem", minWidth: "3.5rem", textAlign: "right" }}>
            {radius.toFixed(2)}rem
          </code>
        </div>
        <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap" }}>
          {RADIUS_PRESETS.map((p) => {
            const active = Math.abs(radius - p.value) < 0.001;
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => onRadiusChange(p.value)}
                style={{
                  padding: "0.25rem 0.5rem",
                  fontSize: "0.75rem",
                  border: "1px solid var(--border)",
                  borderRadius: "calc(var(--radius) - 2px)",
                  background: active ? "var(--background-muted)" : "transparent",
                  color: active ? "var(--foreground)" : "var(--foreground-muted)",
                  cursor: "pointer",
                }}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      <details style={{ borderTop: "1px solid var(--border)", paddingTop: "0.875rem" }}>
        <summary
          style={{
            cursor: "pointer",
            fontSize: "0.8125rem",
            fontWeight: 500,
            color: "var(--foreground-muted)",
            listStyle: "none",
          }}
        >
          내보내기
        </summary>
        <div style={{ marginTop: "0.5rem" }}>
          <Tabs defaultValue="css">
            <TabsList>
              <TabsTrigger value="css">CSS</TabsTrigger>
              <TabsTrigger value="dart">Dart</TabsTrigger>
            </TabsList>
            <TabsContent value="css">
              <ExportBlock code={cssText} filename="tokens.css" />
            </TabsContent>
            <TabsContent value="dart">
              <ExportBlock code={dartText} filename="sh_ui_tokens.dart" />
            </TabsContent>
          </Tabs>
        </div>
      </details>
    </div>
  );
}

function ColorRow({
  name,
  value,
  open,
  onToggle,
  onChange,
}: {
  name: string;
  value: string;
  open: boolean;
  onToggle: () => void;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          alignItems: "center",
          gap: "0.5rem",
          fontSize: "0.8125rem",
        }}
      >
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-label={`--${name} 편집`}
          style={{
            width: "1.75rem",
            height: "1.75rem",
            padding: 0,
            border: open ? "2px solid var(--foreground)" : "1px solid var(--border)",
            borderRadius: "calc(var(--radius) - 2px)",
            background: value,
            cursor: "pointer",
          }}
        />
        <code
          style={{
            fontSize: "0.75rem",
            color: "var(--foreground-muted)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          --{name}
        </code>
      </div>
      {open && (
        <div
          style={{
            marginTop: "0.5rem",
            padding: "0.625rem",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            background: "var(--background)",
          }}
        >
          <ColorPicker value={value} onChange={onChange} />
        </div>
      )}
    </div>
  );
}
