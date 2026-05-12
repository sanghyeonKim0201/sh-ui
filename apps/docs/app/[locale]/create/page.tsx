"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { FolderSearch, Plus, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateProjectDialog } from "@/components/create/CreateProjectDialog";
import { TemplatePreviewDialog } from "@/components/create/TemplatePreview";
import { TokenEditor } from "@/components/create/TokenEditor";
import { ShowcasePicker } from "@/components/create/ShowcasePicker";
import { ShowcaseCanvas } from "@/components/create/ShowcaseCanvas";
import {
  borderDefaults,
  controlDefaults,
  darkDefaults,
  DEFAULT_RADIUS,
  lightDefaults,
  motionDefaults,
  shadowDefaults,
  spacingDefaults,
  typographyDefaults,
  weightDefaults,
  type BorderTokens,
  type ControlTokens,
  type Mode,
  type MotionTokens,
  type ShadowTokens,
  type SpacingScale,
  type TokenKey,
  type TypographyScale,
  type WeightScale,
} from "@/components/create/tokens";
import {
  gradientDefaults,
  serializeGradient,
  type GradientTokens,
} from "@/components/create/gradients";
import type { BaseTone } from "@/components/create/baseTones";
import {
  derivePrimaryForeground,
  derivePrimaryHover,
} from "@/components/create/derivePrimary";

const STORAGE_KEY = "sh-ui-playground-tokens";
const SELECTION_KEY = "sh-ui-playground-selection";

export default function CreateProjectPage() {
  const [mode, setMode] = useState<Mode>("light");
  const [light, setLight] = useState(lightDefaults);
  const [dark, setDark] = useState(darkDefaults);
  const [radius, setRadius] = useState(DEFAULT_RADIUS);
  const [spacing, setSpacing] = useState<SpacingScale>(spacingDefaults);
  const [typography, setTypography] = useState<TypographyScale>(typographyDefaults);
  const [weights, setWeights] = useState<WeightScale>(weightDefaults);
  const [motion, setMotion] = useState<MotionTokens>(motionDefaults);
  const [borders, setBorders] = useState<BorderTokens>(borderDefaults);
  const [controls, setControls] = useState<ControlTokens>(controlDefaults);
  const [shadows, setShadows] = useState<ShadowTokens>(shadowDefaults);
  const [gradients, setGradients] = useState<GradientTokens>(gradientDefaults);
  const [hydrated, setHydrated] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editorDrawerOpen, setEditorDrawerOpen] = useState(false);
  const previewRef = useRef<HTMLElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        // 기존 v1 (light/dark/radius 만 저장된 경우) 도 동작 — 새 키는 누락 시 디폴트.
        if (p.light) setLight({ ...lightDefaults, ...p.light });
        if (p.dark) setDark({ ...darkDefaults, ...p.dark });
        if (typeof p.radius === "number") setRadius(p.radius);
        if (p.spacing) setSpacing({ ...spacingDefaults, ...p.spacing });
        if (p.typography) setTypography({ ...typographyDefaults, ...p.typography });
        if (p.weights) setWeights({ ...weightDefaults, ...p.weights });
        if (p.motion) setMotion({ ...motionDefaults, ...p.motion });
        if (p.borders) setBorders({ ...borderDefaults, ...p.borders });
        if (p.controls) setControls({ ...controlDefaults, ...p.controls });
        if (p.shadows) setShadows({ ...shadowDefaults, ...p.shadows });
        if (p.gradients) setGradients({ ...gradientDefaults, ...p.gradients });
      }
      const rawSel = localStorage.getItem(SELECTION_KEY);
      if (rawSel) {
        const arr = JSON.parse(rawSel);
        if (Array.isArray(arr)) setSelectedIds(arr.filter((x) => typeof x === "string"));
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        light, dark, radius,
        spacing, typography, weights, motion, borders, controls, shadows, gradients,
      }),
    );
  }, [light, dark, radius, spacing, typography, weights, motion, borders, controls, shadows, gradients, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(SELECTION_KEY, JSON.stringify(selectedIds));
  }, [selectedIds, hydrated]);

  const previewVars = useMemo(() => {
    const obj: Record<string, string> = { "--radius": `${radius}rem` };
    const colorSet = mode === "light" ? light : dark;
    for (const k of Object.keys(colorSet) as TokenKey[]) {
      obj[`--${k}`] = colorSet[k];
    }
    // spacing — px
    for (const [k, v] of Object.entries(spacing)) obj[`--space-${k}`] = `${v}px`;
    // typography — px
    for (const [k, v] of Object.entries(typography)) obj[`--text-${k}`] = `${v}px`;
    // weights — number
    for (const [k, v] of Object.entries(weights)) obj[`--weight-${k}`] = String(v);
    // motion
    obj["--duration-fast"] = `${motion.durationFast}ms`;
    obj["--duration-base"] = `${motion.durationBase}ms`;
    obj["--duration-slow"] = `${motion.durationSlow}ms`;
    obj["--ease-standard"] = motion.easeStandard;
    obj["--ease-emphasized"] = motion.easeEmphasized;
    // borders
    obj["--border-width"] = `${borders.width}px`;
    obj["--border-width-strong"] = `${borders.widthStrong}px`;
    // controls
    obj["--control-sm"] = `${controls.sm}px`;
    obj["--control-md"] = `${controls.md}px`;
    obj["--control-lg"] = `${controls.lg}px`;
    // shadows
    obj["--shadow-sm"] = shadows.sm;
    obj["--shadow-md"] = shadows.md;
    obj["--shadow-lg"] = shadows.lg;
    obj["--shadow-xl"] = shadows.xl;
    // gradients
    obj["--gradient-primary"] = serializeGradient(gradients.primary);
    obj["--gradient-surface"] = serializeGradient(gradients.surface);
    obj["--gradient-overlay"] = serializeGradient(gradients.overlay);
    return obj as React.CSSProperties;
  }, [
    mode, light, dark, radius,
    spacing, typography, weights, motion, borders, controls, shadows, gradients,
  ]);

  const setCurrent = (next: Record<TokenKey, string>) => {
    if (mode === "light") setLight(next);
    else setDark(next);
  };

  /** 모든 토큰 카테고리를 디폴트로 — light/dark 색뿐 아니라 공통 토큰(spacing 등) 까지. */
  const resetAll = () => {
    setLight(lightDefaults);
    setDark(darkDefaults);
    setRadius(DEFAULT_RADIUS);
    setSpacing(spacingDefaults);
    setTypography(typographyDefaults);
    setWeights(weightDefaults);
    setMotion(motionDefaults);
    setBorders(borderDefaults);
    setControls(controlDefaults);
    setShadows(shadowDefaults);
    setGradients(gradientDefaults);
  };

  /** Light 모드의 색만 디폴트로. 공통 토큰·dark 색은 그대로. */
  const resetLight = () => setLight(lightDefaults);
  /** Dark 모드의 색만 디폴트로. 공통 토큰·light 색은 그대로. */
  const resetDark = () => setDark(darkDefaults);

  const applyPreset = (p: { light: Record<TokenKey, string>; dark: Record<TokenKey, string>; radius: number }) => {
    setLight((prev) => ({ ...prev, ...p.light }));
    setDark((prev) => ({ ...prev, ...p.dark }));
    setRadius(p.radius);
  };

  const applyBaseTone = (tone: BaseTone) => {
    setLight((prev) => ({ ...prev, ...tone.light }));
    setDark((prev) => ({ ...prev, ...tone.dark }));
  };

  const applyPrimaryFromColor = (hex: string) => {
    const patch = {
      primary: hex,
      "primary-foreground": derivePrimaryForeground(hex),
      "primary-hover": derivePrimaryHover(hex, mode),
    };
    if (mode === "light") setLight((prev) => ({ ...prev, ...patch }));
    else setDark((prev) => ({ ...prev, ...patch }));
  };

  const toggleShowcase = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const removeShowcase = (id: string) => {
    setSelectedIds((prev) => prev.filter((x) => x !== id));
  };

  return (
    <div className="sh-create-shell">
      <header className="sh-create-header">
        <Link href="/" className="sh-create-header__back" aria-label="문서로 돌아가기">
          <span aria-hidden>←</span>
          <span>문서</span>
        </Link>
        <h1 className="sh-create-header__title">프로젝트 생성</h1>
        <div className="sh-create-header__spacer" />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="sh-create-drawer-toggle"
          onClick={() => setEditorDrawerOpen((v) => !v)}
          aria-expanded={editorDrawerOpen}
        >
          <Settings2 aria-hidden size={14} />
          토큰
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setPreviewOpen(true)}
          style={{ minWidth: "9.5rem" }}
        >
          <FolderSearch aria-hidden size={14} />
          파일 미리보기
        </Button>
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={() => setCreateOpen(true)}
          style={{ minWidth: "9.5rem" }}
        >
          <Plus aria-hidden size={14} />
          프로젝트 만들기
        </Button>
      </header>

      <div className="sh-create-grid">
        <ShowcasePicker selectedIds={selectedIds} onToggle={toggleShowcase} />
        <ShowcaseCanvas
          selectedIds={selectedIds}
          onRemove={removeShowcase}
          previewVars={previewVars}
          containerRef={previewRef}
        />
        <TokenEditor
          mode={mode}
          onModeChange={setMode}
          light={light}
          dark={dark}
          onChangeCurrent={setCurrent}
          radius={radius}
          onRadiusChange={setRadius}
          spacing={spacing}
          onSpacingChange={setSpacing}
          typography={typography}
          onTypographyChange={setTypography}
          weights={weights}
          onWeightsChange={setWeights}
          motion={motion}
          onMotionChange={setMotion}
          borders={borders}
          onBordersChange={setBorders}
          controls={controls}
          onControlsChange={setControls}
          shadows={shadows}
          onShadowsChange={setShadows}
          gradients={gradients}
          onGradientsChange={setGradients}
          onApplyPreset={applyPreset}
          onApplyBaseTone={applyBaseTone}
          onApplyPrimaryFromColor={applyPrimaryFromColor}
          onResetAll={resetAll}
          onResetLight={resetLight}
          onResetDark={resetDark}
          drawerOpen={editorDrawerOpen}
          onClose={() => setEditorDrawerOpen(false)}
        />
      </div>

      <div
        className="sh-create-drawer-backdrop"
        data-open={editorDrawerOpen}
        onClick={() => setEditorDrawerOpen(false)}
        aria-hidden
      />

      <TemplatePreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />

      <CreateProjectDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        light={light}
        dark={dark}
        radius={radius}
        mode={mode}
        spacing={spacing}
        typography={typography}
        weights={weights}
        motion={motion}
        borders={borders}
        controls={controls}
        shadows={shadows}
        gradients={gradients}
      />
    </div>
  );
}
