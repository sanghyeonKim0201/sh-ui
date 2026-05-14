"use client";

import {
  allPlugins,
  getArchesForPlatform,
  CSS_FRAMEWORKS_SUPPORTED,
  CSS_FRAMEWORKS_PLANNED,
} from "sh-ui-cli/api";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle";
import type {
  Arch,
  CssFramework,
  Platform,
  Plugin,
  Structure,
} from "./useCommandComposer";

type Props = {
  platform: Platform;
  onPlatformChange: (v: Platform) => void;
  structure: Structure;
  onStructureChange: (v: Structure) => void;
  arch: Arch;
  onArchChange: (v: Arch) => void;
  cssFramework: CssFramework;
  onCssFrameworkChange: (v: CssFramework) => void;
  plugins: Set<Plugin>;
  onTogglePlugin: (p: Plugin) => void;
  tauri: boolean;
  onTauriChange: (v: boolean) => void;
  i18n: 'none' | 'react-i18next';
  onI18nChange: (v: 'none' | 'react-i18next') => void;
  locales: string;
  onLocalesChange: (v: string) => void;
};

/**
 * CreateProjectDialog 와 TemplatePreviewDialog 가 공유하는 옵션 컨트롤.
 * 프로젝트 이름·패키지매니저 등 dialog 별로 의미 다른 필드는 제외.
 */
export function ProjectOptionsForm(props: Props) {
  const {
    platform,
    onPlatformChange,
    structure,
    onStructureChange,
    arch,
    onArchChange,
    cssFramework,
    onCssFrameworkChange,
    plugins,
    onTogglePlugin,
    tauri,
    onTauriChange,
    i18n,
    onI18nChange,
    locales,
    onLocalesChange,
  } = props;

  return (
    <>
      <div>
        <Label>플랫폼</Label>
        <ToggleGroup
          value={[platform]}
          onValueChange={(v: any[]) => {
            const next = v[0] as Platform | undefined;
            if (next) onPlatformChange(next);
          }}
        >
          <ToggleGroupItem value="next">Next.js</ToggleGroupItem>
          <ToggleGroupItem value="vite">Vite (SPA)</ToggleGroupItem>
          <ToggleGroupItem value="flutter">Flutter</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {(platform === "next" || platform === "vite") && (
        <>
          <div>
            <Label>구조</Label>
            <ToggleGroup
              value={[structure]}
              onValueChange={(v: any[]) => {
                const next = v[0] as Structure | undefined;
                if (next) onStructureChange(next);
              }}
            >
              <ToggleGroupItem value="standalone">Standalone</ToggleGroupItem>
              <ToggleGroupItem value="monorepo">Monorepo</ToggleGroupItem>
            </ToggleGroup>
          </div>
          <div>
            <Label>아키텍처</Label>
            <ToggleGroup
              value={[arch]}
              onValueChange={(v: any[]) => {
                const next = v[0] as Arch | undefined;
                if (next) onArchChange(next);
              }}
            >
              {getArchesForPlatform(platform).map((a) => (
                <ToggleGroupItem
                  key={a.name}
                  value={a.name}
                  title={a.description}
                >
                  {a.name}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <div>
            <Label>CSS 프레임워크</Label>
            <ToggleGroup
              value={[cssFramework]}
              onValueChange={(v: any[]) => {
                const next = v[0] as CssFramework | undefined;
                if (next) onCssFrameworkChange(next);
              }}
            >
              {CSS_FRAMEWORKS_SUPPORTED.map((fw) => (
                <ToggleGroupItem key={fw} value={fw}>
                  {fw}
                </ToggleGroupItem>
              ))}
              {CSS_FRAMEWORKS_PLANNED.map((fw) => (
                <ToggleGroupItem
                  key={fw}
                  value={fw}
                  disabled
                  title="곧 지원 예정"
                >
                  {fw}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          {platform === "next" && (
            <div role="group" aria-labelledby="plugins-label">
              <Label id="plugins-label">플러그인</Label>
              <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
                {allPlugins.map((p) => (
                  <Button
                    key={p.name}
                    type="button"
                    variant={plugins.has(p.name) ? "primary" : "secondary"}
                    size="sm"
                    aria-pressed={plugins.has(p.name)}
                    onClick={() => onTogglePlugin(p.name)}
                  >
                    {plugins.has(p.name) ? "✓ " : ""}
                    {p.name}
                  </Button>
                ))}
              </div>
            </div>
          )}
          {platform === "vite" && (
            <>
              <div>
                <Label htmlFor="tauri-toggle">Tauri 데스크탑 셸</Label>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.25rem" }}>
                  <Button
                    id="tauri-toggle"
                    type="button"
                    variant={tauri ? "primary" : "secondary"}
                    size="sm"
                    aria-pressed={tauri}
                    title="Tauri 2.x 셸을 emit (standalone: src-tauri/, monorepo: apps/{name}/src-tauri/). Rust toolchain 필요."
                    onClick={() => onTauriChange(!tauri)}
                  >
                    {tauri ? "✓ " : ""}
                    --tauri
                  </Button>
                  <span style={{ fontSize: "0.75rem", color: "var(--foreground-muted)" }}>
                    {structure === "standalone"
                      ? "Vite SPA + 네이티브 윈도우 (Rust toolchain 필요)"
                      : "Vite SPA + 네이티브 윈도우 — Tauri 셸은 apps/{name}/src-tauri/ 안 (Rust toolchain 필요)"}
                  </span>
                </div>
              </div>
              <div>
                <Label>i18n (react-i18next)</Label>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.25rem" }}>
                  <Button
                    type="button"
                    variant={i18n === 'react-i18next' ? "primary" : "secondary"}
                    size="sm"
                    aria-pressed={i18n === 'react-i18next'}
                    title="i18next + react-i18next + browser-languagedetector + http-backend 셋업"
                    onClick={() => onI18nChange(i18n === 'react-i18next' ? 'none' : 'react-i18next')}
                  >
                    {i18n === 'react-i18next' ? "✓ " : ""}
                    --i18n react-i18next
                  </Button>
                  <span style={{ fontSize: "0.75rem", color: "var(--foreground-muted)" }}>
                    {i18n === 'react-i18next'
                      ? "i18n/config.ts + locales/{lng}/common.json + I18nProvider 자동 emit"
                      : "i18n 셋업 없이 (opt-in)"}
                  </span>
                </div>
              </div>
              {i18n === 'react-i18next' && (
                <div>
                  <Label htmlFor="locales-input">Locales</Label>
                  <input
                    id="locales-input"
                    type="text"
                    value={locales}
                    onChange={(e) => onLocalesChange(e.target.value)}
                    placeholder="ko,en"
                    style={{
                      width: "100%",
                      marginTop: "0.25rem",
                      padding: "0.375rem 0.5rem",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border)",
                      background: "var(--background)",
                      color: "var(--foreground)",
                      fontSize: "0.875rem",
                      fontFamily: "var(--font-mono, monospace)",
                    }}
                  />
                  <span style={{ fontSize: "0.75rem", color: "var(--foreground-muted)" }}>
                    Comma-separated 2글자 코드 (예: ko,en,ja). 첫 locale 이 fallbackLng.
                  </span>
                </div>
              )}
            </>
          )}
        </>
      )}
    </>
  );
}
