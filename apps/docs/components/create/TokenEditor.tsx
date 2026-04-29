"use client";

import { useMemo, useState } from "react";
import { THEME_PRESETS } from "sh-ui-cli/api";
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
  SPACING_KEYS,
  TYPOGRAPHY_KEYS,
  WEIGHT_KEYS,
  SHADOW_KEYS,
  buildDartColorTokens,
  type BorderTokens,
  type ControlTokens,
  type Mode,
  type MotionTokens,
  type ShadowTokens,
  type SpacingScale,
  type TokenKey,
  type TypographyScale,
  type WeightScale,
} from "./tokens";
import { BASE_TONES, detectActiveBaseTone, type BaseTone, type BaseToneName } from "./baseTones";
import { GradientBuilder } from "./GradientBuilder";
import type { GradientTokens } from "./gradients";

export type ThemePresetPayload = {
  light: Record<TokenKey, string>;
  dark: Record<TokenKey, string>;
  radius: number;
};

type EditorMode = "simple" | "advanced";

type Props = {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  light: Record<TokenKey, string>;
  dark: Record<TokenKey, string>;
  onChangeCurrent: (next: Record<TokenKey, string>) => void;
  radius: number;
  onRadiusChange: (radius: number) => void;
  spacing: SpacingScale;
  onSpacingChange: (next: SpacingScale) => void;
  typography: TypographyScale;
  onTypographyChange: (next: TypographyScale) => void;
  weights: WeightScale;
  onWeightsChange: (next: WeightScale) => void;
  motion: MotionTokens;
  onMotionChange: (next: MotionTokens) => void;
  borders: BorderTokens;
  onBordersChange: (next: BorderTokens) => void;
  controls: ControlTokens;
  onControlsChange: (next: ControlTokens) => void;
  shadows: ShadowTokens;
  onShadowsChange: (next: ShadowTokens) => void;
  gradients: GradientTokens;
  onGradientsChange: (next: GradientTokens) => void;
  onApplyPreset: (preset: ThemePresetPayload) => void;
  onApplyBaseTone: (tone: BaseTone) => void;
  onApplyPrimaryFromColor: (hex: string) => void;
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
  spacing,
  onSpacingChange,
  typography,
  onTypographyChange,
  weights,
  onWeightsChange,
  motion,
  onMotionChange,
  borders,
  onBordersChange,
  controls,
  onControlsChange,
  shadows,
  onShadowsChange,
  gradients,
  onGradientsChange,
  onApplyPreset,
  onApplyBaseTone,
  onApplyPrimaryFromColor,
  onReset,
  drawerOpen,
  onClose,
}: Props) {
  const [openKey, setOpenKey] = useState<TokenKey | null>(null);
  const [editorMode, setEditorMode] = useState<EditorMode>("simple");
  const [primaryPickerOpen, setPrimaryPickerOpen] = useState(false);
  const current = mode === "light" ? light : dark;
  const activeBaseTone = useMemo(() => detectActiveBaseTone(light, dark), [light, dark]);

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

      <SegmentedTabs
        ariaLabel="모드"
        options={[
          { value: "light", label: "Light" },
          { value: "dark", label: "Dark" },
        ]}
        active={mode}
        onChange={(v) => onModeChange(v as Mode)}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
        <div className="muted" style={{ fontSize: "0.75rem", fontWeight: 500 }}>
          프리셋
        </div>
        <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap" }}>
          {Object.entries(THEME_PRESETS).map(([name, preset]) => {
            const swatch = mode === "light" ? preset.light.primary : preset.dark.primary;
            return (
              <button
                key={name}
                type="button"
                onClick={() =>
                  onApplyPreset({
                    light: preset.light as Record<TokenKey, string>,
                    dark: preset.dark as Record<TokenKey, string>,
                    radius: preset.radius,
                  })
                }
                title={preset.label}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  padding: "0.25rem 0.5rem",
                  fontSize: "0.75rem",
                  border: "1px solid var(--border)",
                  borderRadius: "calc(var(--radius) - 2px)",
                  background: "transparent",
                  color: "var(--foreground-muted)",
                  cursor: "pointer",
                }}
              >
                <span
                  aria-hidden
                  style={{
                    width: 10, height: 10, borderRadius: 2,
                    background: swatch,
                    border: "1px solid var(--border)",
                    flexShrink: 0,
                  }}
                />
                {name}
              </button>
            );
          })}
        </div>
      </div>

      <SegmentedTabs
        ariaLabel="편집 모드"
        options={[
          { value: "simple", label: "쉬운 모드" },
          { value: "advanced", label: "고급" },
        ]}
        active={editorMode}
        onChange={(v) => setEditorMode(v as EditorMode)}
      />

      {editorMode === "simple" ? (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
            <div className="muted" style={{ fontSize: "0.75rem", fontWeight: 500 }}>
              베이스 톤
            </div>
            <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap" }}>
              {(Object.entries(BASE_TONES) as [BaseToneName, BaseTone][]).map(([name, tone]) => {
                const active = activeBaseTone === name;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => onApplyBaseTone(tone)}
                    aria-pressed={active}
                    title={tone.label}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.375rem",
                      padding: "0.25rem 0.5rem",
                      fontSize: "0.75rem",
                      border: active ? "1px solid var(--foreground)" : "1px solid var(--border)",
                      borderRadius: "calc(var(--radius) - 2px)",
                      background: active ? "var(--background-muted)" : "transparent",
                      color: active ? "var(--foreground)" : "var(--foreground-muted)",
                      cursor: "pointer",
                    }}
                  >
                    <span
                      aria-hidden
                      style={{
                        width: 10, height: 10, borderRadius: 2,
                        background: tone.swatch,
                        border: "1px solid var(--border)",
                        flexShrink: 0,
                      }}
                    />
                    {tone.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
            <div className="muted" style={{ fontSize: "0.75rem", fontWeight: 500 }}>
              포인트 컬러 ({mode === "light" ? "Light" : "Dark"})
            </div>
            <ColorRow
              name="primary"
              value={current.primary}
              open={primaryPickerOpen}
              onToggle={() => setPrimaryPickerOpen((v) => !v)}
              onChange={onApplyPrimaryFromColor}
            />
            <div className="muted" style={{ fontSize: "0.6875rem", color: "var(--foreground-muted)" }}>
              primary-foreground / primary-hover 는 자동 계산됩니다. 직접 잡으려면 고급 모드.
            </div>
          </div>
        </>
      ) : (
        <>
          <Section label="색상" defaultOpen>
            {TOKEN_GROUPS.map((g) => (
              <div key={g.label} style={{ display: "flex", flexDirection: "column", gap: "0.375rem", marginBottom: "0.5rem" }}>
                <div className="muted" style={{ fontSize: "0.6875rem", fontWeight: 500, color: "var(--foreground-muted)" }}>
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
          </Section>

          <Section label="크기 (컨트롤 높이)">
            {(["sm", "md", "lg"] as const).map((k) => (
              <ScalarRow
                key={k}
                label={`control-${k}`}
                value={controls[k]}
                onChange={(v) => onControlsChange({ ...controls, [k]: v })}
                min={20}
                max={80}
                step={1}
                unit="px"
              />
            ))}
          </Section>

          <Section label="테두리 굵기">
            <ScalarRow
              label="border-width"
              value={borders.width}
              onChange={(v) => onBordersChange({ ...borders, width: v })}
              min={0}
              max={6}
              step={1}
              unit="px"
            />
            <ScalarRow
              label="border-width-strong"
              value={borders.widthStrong}
              onChange={(v) => onBordersChange({ ...borders, widthStrong: v })}
              min={0}
              max={8}
              step={1}
              unit="px"
            />
          </Section>

          <Section label="그림자">
            {SHADOW_KEYS.map((k) => (
              <ShadowRow
                key={k}
                label={`shadow-${k}`}
                value={shadows[k]}
                onChange={(v) => onShadowsChange({ ...shadows, [k]: v })}
              />
            ))}
          </Section>

          <Section label="타이포">
            {TYPOGRAPHY_KEYS.map((k) => (
              <ScalarRow
                key={k}
                label={`text-${k}`}
                value={typography[k]}
                onChange={(v) => onTypographyChange({ ...typography, [k]: v })}
                min={8}
                max={64}
                step={1}
                unit="px"
              />
            ))}
          </Section>

          <Section label="여백">
            {SPACING_KEYS.map((k) => (
              <ScalarRow
                key={k}
                label={`space-${k}`}
                value={spacing[k]}
                onChange={(v) => onSpacingChange({ ...spacing, [k]: v })}
                min={0}
                max={128}
                step={1}
                unit="px"
              />
            ))}
          </Section>

          <Section label="폰트 굵기">
            {WEIGHT_KEYS.map((k) => (
              <ScalarRow
                key={k}
                label={`weight-${k}`}
                value={weights[k]}
                onChange={(v) => onWeightsChange({ ...weights, [k]: v })}
                min={100}
                max={900}
                step={100}
              />
            ))}
          </Section>

          <Section label="모션">
            <ScalarRow
              label="duration-fast"
              value={motion.durationFast}
              onChange={(v) => onMotionChange({ ...motion, durationFast: v })}
              min={0}
              max={600}
              step={10}
              unit="ms"
            />
            <ScalarRow
              label="duration-base"
              value={motion.durationBase}
              onChange={(v) => onMotionChange({ ...motion, durationBase: v })}
              min={0}
              max={800}
              step={10}
              unit="ms"
            />
            <ScalarRow
              label="duration-slow"
              value={motion.durationSlow}
              onChange={(v) => onMotionChange({ ...motion, durationSlow: v })}
              min={0}
              max={1200}
              step={10}
              unit="ms"
            />
            <StringRow
              label="ease-standard"
              value={motion.easeStandard}
              onChange={(v) => onMotionChange({ ...motion, easeStandard: v })}
            />
            <StringRow
              label="ease-emphasized"
              value={motion.easeEmphasized}
              onChange={(v) => onMotionChange({ ...motion, easeEmphasized: v })}
            />
          </Section>

          <Section label="그라데이션">
            <GradientBuilder value={gradients} onChange={onGradientsChange} />
          </Section>
        </>
      )}

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

/* ────── Sub-components ────── */

function SegmentedTabs<T extends string>({
  ariaLabel,
  options,
  active,
  onChange,
}: {
  ariaLabel: string;
  options: { value: T; label: string }[];
  active: T;
  onChange: (v: T) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${options.length}, 1fr)`,
        gap: "0.25rem",
        padding: "0.25rem",
        background: "var(--background-muted)",
        borderRadius: "calc(var(--radius) - 2px)",
      }}
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={active === o.value}
          onClick={() => onChange(o.value)}
          style={{
            padding: "0.375rem",
            border: "none",
            borderRadius: "calc(var(--radius) - 4px)",
            fontSize: "0.75rem",
            fontWeight: 500,
            cursor: "pointer",
            background: active === o.value ? "var(--background)" : "transparent",
            color: active === o.value ? "var(--foreground)" : "var(--foreground-muted)",
            transition: "background 120ms, color 120ms",
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Section({
  label,
  defaultOpen = false,
  children,
}: {
  label: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details
      open={defaultOpen}
      style={{
        borderTop: "1px solid var(--border)",
        paddingTop: "0.625rem",
      }}
    >
      <summary
        style={{
          cursor: "pointer",
          fontSize: "0.75rem",
          fontWeight: 500,
          color: "var(--foreground)",
          listStyle: "none",
          marginBottom: "0.5rem",
        }}
      >
        {label}
      </summary>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
        {children}
      </div>
    </details>
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

function ScalarRow({
  label,
  value,
  onChange,
  min,
  max,
  step,
  unit = "",
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  unit?: string;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: "0.5rem" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        <code
          style={{
            fontSize: "0.6875rem",
            color: "var(--foreground-muted)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          --{label}
        </code>
        <Slider
          value={value}
          onValueChange={onChange}
          min={min}
          max={max}
          step={step}
          aria-label={label}
        />
      </div>
      <code
        style={{
          fontSize: "0.6875rem",
          minWidth: "3rem",
          textAlign: "right",
          color: "var(--foreground)",
        }}
      >
        {value}
        {unit}
      </code>
    </div>
  );
}

function StringRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
      <code
        style={{
          fontSize: "0.6875rem",
          color: "var(--foreground-muted)",
        }}
      >
        --{label}
      </code>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        style={{
          fontSize: "0.6875rem",
          padding: "0.375rem 0.5rem",
          border: "1px solid var(--border)",
          borderRadius: "calc(var(--radius) - 4px)",
          background: "var(--background)",
          color: "var(--foreground)",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
        }}
        aria-label={label}
      />
    </div>
  );
}

function ShadowRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", alignItems: "center", gap: "0.5rem" }}>
        <span
          aria-hidden
          style={{
            display: "inline-block",
            width: "1.75rem",
            height: "1.25rem",
            borderRadius: "calc(var(--radius) - 4px)",
            background: "var(--background)",
            boxShadow: value,
            border: "1px solid var(--border)",
            flexShrink: 0,
          }}
        />
        <code
          style={{
            fontSize: "0.6875rem",
            color: "var(--foreground-muted)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          --{label}
        </code>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        style={{
          fontSize: "0.6875rem",
          padding: "0.375rem 0.5rem",
          border: "1px solid var(--border)",
          borderRadius: "calc(var(--radius) - 4px)",
          background: "var(--background)",
          color: "var(--foreground)",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
        }}
        aria-label={label}
      />
    </div>
  );
}
