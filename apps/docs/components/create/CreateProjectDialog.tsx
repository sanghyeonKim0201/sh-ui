"use client";

import { useMemo, useState } from "react";
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
  type PackageManager,
  type Platform,
  type Plugin,
  type Structure,
} from "./useCommandComposer";
import { encodeTheme, type TokenKey, type Mode, type ThemeConfig } from "./encodeTheme";

type Props = {
  open: boolean;
  onClose: () => void;
  light: Record<TokenKey, string>;
  dark: Record<TokenKey, string>;
  radius: number;
  mode: Mode;
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

export function CreateProjectDialog({ open, onClose, light, dark, radius, mode }: Props) {
  const [projectName, setProjectName] = useState("my-app");
  const [platform, setPlatform] = useState<Platform>("next");
  const [structure, setStructure] = useState<Structure>("standalone");
  const [plugins, setPlugins] = useState<Set<Plugin>>(new Set());
  const [packageManager, setPackageManager] = useState<PackageManager>("pnpm");
  const [copied, setCopied] = useState(false);

  const nameError = useMemo(() => validateProjectName(projectName), [projectName]);
  const canCopy = nameError === null;

  const theme: ThemeConfig = useMemo(() => ({ light, dark, radius }), [light, dark, radius]);
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
      } satisfies ComposerOptions),
    [projectName, platform, structure, plugins, packageManager, themeBase64],
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
                <Label>플러그인</Label>
                <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
                  <Button
                    type="button"
                    variant={plugins.has("sentry") ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => togglePlugin("sentry")}
                  >
                    {plugins.has("sentry") ? "✓ " : ""}Sentry
                  </Button>
                  <Button
                    type="button"
                    variant={plugins.has("next-intl") ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => togglePlugin("next-intl")}
                  >
                    {plugins.has("next-intl") ? "✓ " : ""}next-intl
                  </Button>
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
