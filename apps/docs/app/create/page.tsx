"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { CreateProjectFab } from "@/components/create/CreateProjectFab";
import { CreateProjectDialog } from "@/components/create/CreateProjectDialog";
import { TokenEditor } from "@/components/create/TokenEditor";
import { ShowcasePicker } from "@/components/create/ShowcasePicker";
import { ShowcaseCanvas } from "@/components/create/ShowcaseCanvas";
import { ExportBlock } from "@/components/create/ExportBlock";
import {
  buildDartColorTokens,
  darkDefaults,
  DEFAULT_RADIUS,
  lightDefaults,
  type Mode,
  type TokenKey,
} from "@/components/create/tokens";

const STORAGE_KEY = "sh-ui-playground-tokens";
const SELECTION_KEY = "sh-ui-playground-selection";

export default function CreateProjectPage() {
  const [mode, setMode] = useState<Mode>("light");
  const [light, setLight] = useState(lightDefaults);
  const [dark, setDark] = useState(darkDefaults);
  const [radius, setRadius] = useState(DEFAULT_RADIUS);
  const [hydrated, setHydrated] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [pickerDrawerOpen, setPickerDrawerOpen] = useState(false);
  const previewRef = useRef<HTMLElement>(null);

  /* localStorage 로드 */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        if (p.light) setLight({ ...lightDefaults, ...p.light });
        if (p.dark) setDark({ ...darkDefaults, ...p.dark });
        if (typeof p.radius === "number") setRadius(p.radius);
      }
      const rawSel = localStorage.getItem(SELECTION_KEY);
      if (rawSel) {
        const arr = JSON.parse(rawSel);
        if (Array.isArray(arr)) setSelectedIds(arr.filter((x) => typeof x === "string"));
      }
    } catch {}
    setHydrated(true);
  }, []);

  /* localStorage 저장 */
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ light, dark, radius }));
  }, [light, dark, radius, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(SELECTION_KEY, JSON.stringify(selectedIds));
  }, [selectedIds, hydrated]);

  /* 캔버스에 적용할 인라인 토큰 */
  const previewVars = useMemo(() => {
    const obj: Record<string, string> = { "--radius": `${radius}rem` };
    const set = mode === "light" ? light : dark;
    for (const k of Object.keys(set) as TokenKey[]) {
      obj[`--${k}`] = set[k];
    }
    return obj as React.CSSProperties;
  }, [mode, light, dark, radius]);

  /* 내보내기용 — 라이트 + 다크 양쪽 모두 포함 */
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
      "// lib/foundation/sh_ui_tokens.dart 내부의 해당 static const 블록을 아래로 교체하세요.",
      "",
      "// class ShUiColorTokens { ... }",
      buildDartColorTokens("light", light, dark),
      "",
      buildDartColorTokens("dark", dark, light),
      "",
      "// class ShUiRadiusTokens { ... }",
      "static const tokens = ShUiRadiusTokens(",
      `  defaultRadius: ${radiusPx},`,
      ");",
    ].join("\n");
  }, [light, dark, radius]);

  const current = mode === "light" ? light : dark;
  const setCurrent = (next: Record<TokenKey, string>) => {
    if (mode === "light") setLight(next);
    else setDark(next);
  };

  const reset = () => {
    if (mode === "light") setLight(lightDefaults);
    else setDark(darkDefaults);
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
    <>
      <main style={{ padding: "3rem 1.5rem 6rem", maxWidth: 1440, width: "100%", marginInline: "auto" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <h1>프로젝트 생성</h1>
            <p className="muted" style={{ maxWidth: "60ch" }}>
              색과 radius 를 직접 편집하면서 컴포넌트가 어떻게 변하는지 확인한 다음, 우하단 버튼으로 그 디자인이 그대로 적용된 새 프로젝트를 만든다.
              편집 값은 자동 저장되며, CLI 레퍼런스는 <a href="/cli">/cli</a> 페이지에서 볼 수 있다.
            </p>
          </div>
          <button
            type="button"
            className="sh-create-drawer-toggle"
            onClick={() => setPickerDrawerOpen((v) => !v)}
            aria-expanded={pickerDrawerOpen}
            style={{
              alignItems: "center",
              gap: "0.375rem",
              padding: "0.5rem 0.75rem",
              fontSize: "0.8125rem",
              border: "1px solid var(--border)",
              borderRadius: "calc(var(--radius) - 2px)",
              background: "var(--background)",
              color: "var(--foreground)",
              cursor: "pointer",
            }}
          >
            <span aria-hidden>≡</span>
            컴포넌트 ({selectedIds.length})
          </button>
        </div>

        <div className="sh-create-layout">
          <TokenEditor
            mode={mode}
            onModeChange={setMode}
            current={current}
            onChangeCurrent={setCurrent}
            radius={radius}
            onRadiusChange={setRadius}
            onReset={reset}
          />

          <div
            className="sh-create-drawer-backdrop"
            data-open={pickerDrawerOpen}
            onClick={() => setPickerDrawerOpen(false)}
            aria-hidden
          />
          <ShowcasePicker
            selectedIds={selectedIds}
            onToggle={toggleShowcase}
            drawerOpen={pickerDrawerOpen}
            onClose={() => setPickerDrawerOpen(false)}
          />

          <ShowcaseCanvas
            selectedIds={selectedIds}
            onRemove={removeShowcase}
            previewVars={previewVars}
            containerRef={previewRef}
          />
        </div>

        <h2 style={{ marginTop: "2.5rem" }}>토큰 내보내기</h2>
        <p className="muted">
          편집한 값을 그대로 담은 블록. React는 <code>tokens.css</code>, Flutter는 <code>lib/foundation/sh_ui_tokens.dart</code>의 해당 블록을 교체한다.
        </p>
        <Tabs defaultValue="css" style={{ marginTop: "0.75rem" }}>
          <TabsList>
            <TabsTrigger value="css">React · tokens.css</TabsTrigger>
            <TabsTrigger value="dart">Flutter · sh_ui_tokens.dart</TabsTrigger>
          </TabsList>
          <TabsContent value="css">
            <ExportBlock code={cssText} filename="tokens.css" />
          </TabsContent>
          <TabsContent value="dart">
            <ExportBlock code={dartText} filename="sh_ui_tokens.dart" />
          </TabsContent>
        </Tabs>
      </main>
      <CreateProjectFab onClick={() => setCreateOpen(true)} />
      <CreateProjectDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        light={light}
        dark={dark}
        radius={radius}
        mode={mode}
      />
    </>
  );
}
