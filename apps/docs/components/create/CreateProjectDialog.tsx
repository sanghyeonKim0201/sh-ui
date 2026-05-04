"use client";

import { useMemo, useState } from "react";
import {
  allPlugins,
  CSS_FRAMEWORKS_SUPPORTED,
  CSS_FRAMEWORKS_PLANNED,
  CSS_FRAMEWORK_DEFAULT,
} from "sh-ui-cli/api";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  composeCommand,
  type ComposerOptions,
  type CssFramework,
  type PackageManager,
  type Platform,
  type Plugin,
  type Structure,
} from "./useCommandComposer";
import { encodeTheme, type TokenKey, type Mode, type ThemeConfig } from "./encodeTheme";
import {
  borderDefaults,
  controlDefaults,
  motionDefaults,
  shadowDefaults,
  spacingDefaults,
  typographyDefaults,
  weightDefaults,
  type BorderTokens,
  type ControlTokens,
  type MotionTokens,
  type ShadowTokens,
  type SpacingScale,
  type TypographyScale,
  type WeightScale,
} from "./tokens";
import {
  gradientDefaults,
  serializeGradient,
  type GradientTokens,
} from "./gradients";

type Props = {
  open: boolean;
  onClose: () => void;
  light: Record<TokenKey, string>;
  dark: Record<TokenKey, string>;
  radius: number;
  mode: Mode;
  spacing: SpacingScale;
  typography: TypographyScale;
  weights: WeightScale;
  motion: MotionTokens;
  borders: BorderTokens;
  controls: ControlTokens;
  shadows: ShadowTokens;
  gradients: GradientTokens;
};

/** 사용자 값이 디폴트와 다른 키가 하나라도 있으면 current 를 그대로 (Record 형태) 반환. 모두 같으면 undefined. */
const diffFromDefaults = <T extends object>(current: T, defaults: T): Record<string, number> | undefined => {
  const c = current as unknown as Record<string, number>;
  const d = defaults as unknown as Record<string, number>;
  for (const k of Object.keys(d)) {
    if (c[k] !== d[k]) return c;
  }
  return undefined;
};

/** 문자열 카테고리 동일. */
const diffStringFromDefaults = <T extends object>(current: T, defaults: T): Record<string, string> | undefined => {
  const c = current as unknown as Record<string, string>;
  const d = defaults as unknown as Record<string, string>;
  for (const k of Object.keys(d)) {
    if (c[k] !== d[k]) return c;
  }
  return undefined;
};

const SWATCH_KEYS: TokenKey[] = ["background", "foreground", "primary", "danger"];

const PROJECT_NAME_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9-_]*$/;

const validateProjectName = (name: string): string | null => {
  if (name === "") return null; // 빈 문자열은 기본값 "my-app" 사용하므로 허용
  if (name.length > 214) return "이름은 214자 이하";
  if (!PROJECT_NAME_REGEX.test(name)) {
    return "영문·숫자·'-'·'_' 만, 첫 글자는 영문 또는 숫자";
  }
  return null;
};

export function CreateProjectDialog({
  open, onClose, light, dark, radius, mode,
  spacing, typography, weights, motion, borders, controls, shadows, gradients,
}: Props) {
  const [projectName, setProjectName] = useState("my-app");
  const [platform, setPlatform] = useState<Platform>("next");
  const [structure, setStructure] = useState<Structure>("standalone");
  const [plugins, setPlugins] = useState<Set<Plugin>>(new Set());
  const [packageManager, setPackageManager] = useState<PackageManager>("pnpm");
  const [cssFramework, setCssFramework] = useState<CssFramework>(CSS_FRAMEWORK_DEFAULT);
  const [copied, setCopied] = useState(false);

  const nameError = useMemo(() => validateProjectName(projectName), [projectName]);
  const canCopy = nameError === null;

  const theme: ThemeConfig = useMemo(() => {
    const cfg: ThemeConfig = { light, dark, radius };
    // 옵셔널 카테고리 — 디폴트와 다를 때만 포함 (base64 크기 절약 + CLI threading 명시성)
    const sp = diffFromDefaults(spacing, spacingDefaults);
    if (sp) cfg.spacing = sp;
    const ty = diffFromDefaults(typography, typographyDefaults);
    if (ty) cfg.typography = ty;
    const we = diffFromDefaults(weights, weightDefaults);
    if (we) cfg.weights = we;
    const ct = diffFromDefaults(controls, controlDefaults);
    if (ct) cfg.controls = ct;
    const bd = diffFromDefaults(borders, borderDefaults);
    if (bd) cfg.borders = bd;
    // motion 은 string ease 가 섞여 있어 numeric duration 만 추출 (ease 는 Phase 3)
    const durationsCurrent = {
      fast: motion.durationFast, base: motion.durationBase, slow: motion.durationSlow,
    };
    const durationsDefault = {
      fast: motionDefaults.durationFast, base: motionDefaults.durationBase, slow: motionDefaults.durationSlow,
    };
    const du = diffFromDefaults(durationsCurrent, durationsDefault);
    if (du) cfg.durations = du;
    // Phase 3 — string 카테고리
    const sh = diffStringFromDefaults(shadows, shadowDefaults);
    if (sh) cfg.shadows = sh;
    // ease — motion 에 두 string 키만 추출
    const easesCurrent = { standard: motion.easeStandard, emphasized: motion.easeEmphasized };
    const easesDefault = { standard: motionDefaults.easeStandard, emphasized: motionDefaults.easeEmphasized };
    const ea = diffStringFromDefaults(easesCurrent, easesDefault);
    if (ea) cfg.eases = ea;
    // gradient — slot 객체를 CSS 문자열로 직렬화한 후 비교
    const gradStrCurrent = {
      primary: serializeGradient(gradients.primary),
      surface: serializeGradient(gradients.surface),
      overlay: serializeGradient(gradients.overlay),
    };
    const gradStrDefault = {
      primary: serializeGradient(gradientDefaults.primary),
      surface: serializeGradient(gradientDefaults.surface),
      overlay: serializeGradient(gradientDefaults.overlay),
    };
    const gr = diffStringFromDefaults(gradStrCurrent, gradStrDefault);
    if (gr) cfg.gradients = gr;
    return cfg;
  }, [light, dark, radius, spacing, typography, weights, motion, borders, controls, shadows, gradients]);
  const themeBase64 = useMemo(() => encodeTheme(theme), [theme]);

  const command = useMemo(
    () =>
      composeCommand({
        projectName: projectName || "my-app",
        platform,
        structure,
        plugins,
        packageManager,
        themeBase64,
        cssFramework,
      } satisfies ComposerOptions),
    [projectName, platform, structure, plugins, packageManager, themeBase64, cssFramework],
  );

  const togglePlugin = (p: Plugin) => {
    setPlugins((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // fallback: 명령어는 이미 <pre>로 노출되므로 사용자가 수동 선택 가능
    }
  };

  const swatchSource = mode === "light" ? light : dark;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent style={{ maxWidth: 440, width: "100%" }}>
        <DialogTitle>프로젝트 만들기</DialogTitle>
        <DialogDescription>편집한 디자인이 그대로 적용됩니다.</DialogDescription>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem", marginTop: "0.5rem" }}>
          {/* theme summary */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 0.625rem",
              background: "var(--background-subtle)",
              border: "1px solid var(--border)",
              borderRadius: "calc(var(--radius) - 2px)",
              fontSize: "0.75rem",
            }}
          >
            <div style={{ display: "flex", gap: 2 }}>
              {SWATCH_KEYS.map((k) => (
                <div
                  key={k}
                  aria-hidden
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 2,
                    background: swatchSource[k],
                    border: "1px solid var(--border)",
                  }}
                />
              ))}
            </div>
            <span style={{ color: "var(--foreground-muted)" }}>
              현재 토큰 · radius {radius.toFixed(2)}rem
            </span>
          </div>

          {/* project name */}
          <div>
            <Label htmlFor="create-name">프로젝트 이름</Label>
            <Input
              id="create-name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="my-app"
              aria-invalid={nameError !== null}
              aria-describedby={nameError !== null ? "create-name-error" : undefined}
            />
            {nameError !== null && (
              <div
                id="create-name-error"
                role="alert"
                style={{
                  marginTop: "0.25rem",
                  fontSize: "0.75rem",
                  color: "var(--danger)",
                }}
              >
                {nameError}
              </div>
            )}
          </div>

          {/* platform */}
          <div>
            <Label>플랫폼</Label>
            <ToggleGroup
              value={[platform]}
              onValueChange={(v: any[]) => {
                const next = v[0] as Platform | undefined;
                if (next) setPlatform(next);
              }}
            >
              <ToggleGroupItem value="next">Next.js</ToggleGroupItem>
              <ToggleGroupItem value="flutter">Flutter</ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* next-only */}
          {platform === "next" && (
            <>
              <div>
                <Label>구조</Label>
                <ToggleGroup
                  value={[structure]}
                  onValueChange={(v: any[]) => {
                    const next = v[0] as Structure | undefined;
                    if (next) setStructure(next);
                  }}
                >
                  <ToggleGroupItem value="standalone">Standalone</ToggleGroupItem>
                  <ToggleGroupItem value="monorepo">Monorepo</ToggleGroupItem>
                </ToggleGroup>
              </div>
              <div>
                <Label>CSS 프레임워크</Label>
                <ToggleGroup
                  value={[cssFramework]}
                  onValueChange={(v: any[]) => {
                    const next = v[0] as CssFramework | undefined;
                    if (next) setCssFramework(next);
                  }}
                >
                  {CSS_FRAMEWORKS_SUPPORTED.map((fw) => (
                    <ToggleGroupItem key={fw} value={fw}>{fw}</ToggleGroupItem>
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
                <div
                  style={{
                    marginTop: "0.25rem",
                    fontSize: "0.6875rem",
                    color: "var(--foreground-muted)",
                  }}
                >
                  변종 미제공 컴포넌트는 add 시 plain 으로 자동 fallback. 모든 styled 컴포넌트는 plain · tailwind · css-modules 3 변종을 보유 (vanilla-extract 는 button/card/input 파일럿만).
                </div>
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
                      onClick={() => togglePlugin(p.name)}
                    >
                      {plugins.has(p.name) ? "✓ " : ""}{p.name}
                    </Button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* package manager + command preview */}
          <div>
            <Tabs
              value={packageManager}
              onValueChange={(v) => setPackageManager(v as PackageManager)}
            >
              <TabsList>
                <TabsTrigger value="pnpm">pnpm</TabsTrigger>
                <TabsTrigger value="npm">npm</TabsTrigger>
                <TabsTrigger value="yarn">yarn</TabsTrigger>
                <TabsTrigger value="bun">bun</TabsTrigger>
              </TabsList>
              <TabsContent value={packageManager}>
                <pre
                  style={{
                    margin: 0,
                    padding: "0.625rem 0.75rem",
                    background: "var(--background-subtle)",
                    border: "1px solid var(--border)",
                    borderRadius: "calc(var(--radius) - 2px)",
                    fontSize: "0.75rem",
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                    overflowX: "auto",
                    whiteSpace: "pre",
                    color: "var(--foreground)",
                  }}
                >
                  {command}
                </pre>
              </TabsContent>
            </Tabs>
          </div>

          {/* aria-live for copy feedback */}
          <div role="status" aria-live="polite" style={{ position: "absolute", left: -10000 }}>
            {copied ? "명령어가 복사되었습니다" : ""}
          </div>
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="secondary">닫기</Button>} />
          <Button onClick={handleCopy} disabled={!canCopy}>{copied ? "복사됨" : "명령어 복사"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
