"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { CreateProjectDialog } from "@/components/create/CreateProjectDialog";
import { TokenEditor } from "@/components/create/TokenEditor";
import { ShowcasePicker } from "@/components/create/ShowcasePicker";
import { ShowcaseCanvas } from "@/components/create/ShowcaseCanvas";
import {
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
  const [editorDrawerOpen, setEditorDrawerOpen] = useState(false);
  const previewRef = useRef<HTMLElement>(null);

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

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ light, dark, radius }));
  }, [light, dark, radius, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(SELECTION_KEY, JSON.stringify(selectedIds));
  }, [selectedIds, hydrated]);

  const previewVars = useMemo(() => {
    const obj: Record<string, string> = { "--radius": `${radius}rem` };
    const set = mode === "light" ? light : dark;
    for (const k of Object.keys(set) as TokenKey[]) {
      obj[`--${k}`] = set[k];
    }
    return obj as React.CSSProperties;
  }, [mode, light, dark, radius]);

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
    <div className="sh-create-shell">
      <header className="sh-create-header">
        <Link href="/" className="sh-create-header__back" aria-label="문서로 돌아가기">
          <span aria-hidden>←</span>
          <span>문서</span>
        </Link>
        <h1 className="sh-create-header__title">프로젝트 생성</h1>
        <div className="sh-create-header__spacer" />
        <button
          type="button"
          className="sh-create-drawer-toggle"
          onClick={() => setEditorDrawerOpen((v) => !v)}
          aria-expanded={editorDrawerOpen}
          style={{
            alignItems: "center",
            gap: "0.375rem",
            padding: "0.375rem 0.625rem",
            fontSize: "0.8125rem",
            border: "1px solid var(--border)",
            borderRadius: "calc(var(--radius) - 2px)",
            background: "var(--background)",
            color: "var(--foreground)",
            cursor: "pointer",
          }}
        >
          <span aria-hidden>⚙</span>
          토큰
        </button>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.375rem",
            padding: "0.4375rem 0.875rem",
            fontSize: "0.8125rem",
            fontWeight: 500,
            border: "none",
            borderRadius: "calc(var(--radius) - 2px)",
            background: "var(--primary)",
            color: "var(--primary-foreground)",
            cursor: "pointer",
          }}
        >
          <span aria-hidden>＋</span>
          프로젝트 만들기
        </button>
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
          onReset={reset}
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

      <CreateProjectDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        light={light}
        dark={dark}
        radius={radius}
        mode={mode}
      />
    </div>
  );
}
