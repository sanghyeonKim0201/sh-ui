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
          <ToggleGroupItem value="flutter">Flutter</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {platform === "next" && (
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
              {getArchesForPlatform("next").map((a) => (
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
        </>
      )}
    </>
  );
}
