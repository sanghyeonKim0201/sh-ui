"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ColorPicker } from "@/components/ui/color-picker";
import { Slider } from "@/components/ui/slider";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const STORAGE_KEY = "sh-ui-playground-tokens";

type TokenKey =
  | "background"
  | "background-subtle"
  | "background-muted"
  | "foreground"
  | "foreground-muted"
  | "border"
  | "border-strong"
  | "primary"
  | "primary-foreground"
  | "primary-hover"
  | "danger"
  | "danger-foreground";

type Mode = "light" | "dark";

const lightDefaults: Record<TokenKey, string> = {
  background: "#FFFFFF",
  "background-subtle": "#FAFAFA",
  "background-muted": "#F5F5F5",
  foreground: "#0A0A0A",
  "foreground-muted": "#525252",
  border: "#E5E5E5",
  "border-strong": "#D4D4D4",
  primary: "#171717",
  "primary-foreground": "#FAFAFA",
  "primary-hover": "#262626",
  danger: "#DC2626",
  "danger-foreground": "#FFFFFF",
};

const darkDefaults: Record<TokenKey, string> = {
  background: "#0A0A0A",
  "background-subtle": "#171717",
  "background-muted": "#262626",
  foreground: "#FAFAFA",
  "foreground-muted": "#A3A3A3",
  border: "#262626",
  "border-strong": "#404040",
  primary: "#FAFAFA",
  "primary-foreground": "#171717",
  "primary-hover": "#E5E5E5",
  danger: "#DC2626",
  "danger-foreground": "#FFFFFF",
};

const groups: { label: string; keys: TokenKey[] }[] = [
  { label: "Background", keys: ["background", "background-subtle", "background-muted"] },
  { label: "Foreground", keys: ["foreground", "foreground-muted"] },
  { label: "Border", keys: ["border", "border-strong"] },
  { label: "Primary", keys: ["primary", "primary-foreground", "primary-hover"] },
  { label: "Danger", keys: ["danger", "danger-foreground"] },
];

const DEFAULT_RADIUS = 0.5;

const RADIUS_PRESETS: { label: string; value: number }[] = [
  { label: "none", value: 0 },
  { label: "sm", value: 0.25 },
  { label: "md", value: 0.5 },
  { label: "lg", value: 0.75 },
  { label: "xl", value: 1 },
];

export default function PlaygroundPage() {
  const [mode, setMode] = useState<Mode>("light");
  const [light, setLight] = useState(lightDefaults);
  const [dark, setDark] = useState(darkDefaults);
  const [radius, setRadius] = useState(DEFAULT_RADIUS);
  const [hydrated, setHydrated] = useState(false);
  const [openKey, setOpenKey] = useState<TokenKey | null>(null);
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
    } catch {}
    setHydrated(true);
  }, []);

  /* localStorage 저장 */
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ light, dark, radius }));
  }, [light, dark, radius, hydrated]);

  /* 미리보기 패널에만 적용할 인라인 토큰 (현재 모드 기준) */
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

  const current = mode === "light" ? light : dark;
  const setCurrent = (next: Record<TokenKey, string>) => {
    if (mode === "light") setLight(next);
    else setDark(next);
  };

  const reset = () => {
    if (mode === "light") setLight(lightDefaults);
    else setDark(darkDefaults);
  };

  return (
    <>
      <main style={{ padding: "2rem 1rem 6rem", maxWidth: 1280, margin: "0 auto" }}>
        <h1>Playground</h1>
        <p className="muted">
          토큰을 직접 수정하면서 컴포넌트가 어떻게 변하는지 본다. 변경은 우측 미리보기 패널에만 적용되며, 편집 값은 자동 저장된다.
        </p>

        <div className="playground-layout">
          {/* ───────────── 좌: 에디터 ───────────── */}
          <aside
            className="playground-editor"
            style={{
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              background: "var(--background-subtle)",
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <strong style={{ fontSize: "0.875rem" }}>토큰 편집</strong>
              <button
                type="button"
                onClick={reset}
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
            </div>

            {/* 라이트/다크 탭 */}
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
                  onClick={() => setMode(m)}
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

            {groups.map((g) => (
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
                    onChange={(v) => setCurrent({ ...current, [k]: v })}
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
                    onValueChange={setRadius}
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
                      onClick={() => setRadius(p.value)}
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
          </aside>

          {/* ───────────── 우: 프리뷰 (스코프 토큰 적용) ───────────── */}
          <section
            ref={previewRef}
            style={{
              ...previewVars,
              background: "var(--background)",
              color: "var(--foreground)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: "2rem",
              display: "flex",
              flexDirection: "column",
              gap: "2rem",
            }}
          >
            <ShowcaseSection title="Buttons">
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="link">Link</Button>
                <Button disabled>Disabled</Button>
              </div>
            </ShowcaseSection>

            <ShowcaseSection title="Sizes">
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
                <Button size="sm">sm</Button>
                <Button size="md">md</Button>
                <Button size="lg">lg</Button>
              </div>
            </ShowcaseSection>

            <ShowcaseSection title="Inputs">
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: 320 }}>
                <Input placeholder="기본 입력" />
                <Input defaultValue="값이 있는 상태" />
                <Input placeholder="에러 상태" aria-invalid />
                <Input placeholder="비활성" disabled />
              </div>
            </ShowcaseSection>

            <ShowcaseSection title="Select">
              <Select>
                <SelectTrigger style={{ width: "14rem" }}>
                  <SelectValue placeholder="과일 선택" />
                </SelectTrigger>
                <SelectContent container={previewRef}>
                  <SelectItem value="apple">Apple</SelectItem>
                  <SelectItem value="banana">Banana</SelectItem>
                  <SelectItem value="grapes">Grapes</SelectItem>
                </SelectContent>
              </Select>
            </ShowcaseSection>

            <ShowcaseSection title="Card">
              <div style={{ maxWidth: 480 }}>
                <Card>
                  <CardHeader>
                    <CardTitle>알림 설정</CardTitle>
                    <CardDescription>이메일과 푸시 알림을 받을지 선택하세요.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>현재 모든 알림이 꺼져 있습니다. 언제든 다시 켤 수 있습니다.</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="secondary">나중에</Button>
                    <Button>설정하기</Button>
                  </CardFooter>
                </Card>
              </div>
            </ShowcaseSection>

            <ShowcaseSection title="Toggles">
              <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center" }}>
                <Switch defaultChecked aria-label="알림" />
                <Switch aria-label="다크 모드" />
                <Checkbox defaultChecked aria-label="동의" />
                <Checkbox aria-label="필수 아님" />
              </div>
            </ShowcaseSection>

            <ShowcaseSection title="Badges">
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                <Badge>Primary</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="danger">Danger</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>
            </ShowcaseSection>

            <ShowcaseSection title="Avatars">
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
                <Avatar size="sm"><AvatarFallback>SM</AvatarFallback></Avatar>
                <Avatar size="md"><AvatarFallback>MD</AvatarFallback></Avatar>
                <Avatar size="lg"><AvatarFallback>LG</AvatarFallback></Avatar>
                <Avatar size="xl"><AvatarFallback>XL</AvatarFallback></Avatar>
              </div>
            </ShowcaseSection>

            <ShowcaseSection title="Progress / Spinner">
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxWidth: 360 }}>
                <Progress value={40} aria-label="determinate 40%" />
                <Progress aria-label="indeterminate" />
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                  <Spinner size="sm" />
                  <Spinner size="md" />
                  <Spinner size="lg" />
                </div>
              </div>
            </ShowcaseSection>

            <ShowcaseSection title="Tooltip · DropdownMenu">
              <TooltipProvider delay={150}>
                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                  <Tooltip>
                    <TooltipTrigger render={<Button variant="secondary">호버</Button>} />
                    <TooltipContent>토큰이 실시간으로 반영됩니다</TooltipContent>
                  </Tooltip>
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="secondary">메뉴</Button>} />
                    <DropdownMenuContent align="start" container={previewRef}>
                      <DropdownMenuItem>프로필</DropdownMenuItem>
                      <DropdownMenuItem>설정</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>로그아웃</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TooltipProvider>
            </ShowcaseSection>
          </section>
        </div>

        {/* ───────────── 내보내기 ───────────── */}
        <h2 style={{ marginTop: "2.5rem" }}>tokens.css 내보내기</h2>
        <p className="muted">
          현재 라이트 + 다크 + radius 설정을 그대로 담은 블록. 프로젝트 <code>tokens.css</code>에 붙여넣으면 동일한 룩을 재현한다.
        </p>
        <ExportBlock code={cssText} />
      </main>
    </>
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

function ExportBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };
  return (
    <div
      style={{
        position: "relative",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        background: "var(--background-subtle)",
        margin: "1rem 0",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.5rem 0.75rem 0.5rem 1rem",
          borderBottom: "1px solid var(--border)",
          background: "var(--background-muted)",
          fontSize: "0.75rem",
          color: "var(--foreground-muted)",
        }}
      >
        <code style={{ color: "var(--foreground)" }}>tokens.css</code>
        <button
          type="button"
          onClick={onCopy}
          style={{
            padding: "0.25rem 0.5rem",
            background: "var(--background)",
            color: "var(--foreground-muted)",
            border: "1px solid var(--border)",
            borderRadius: "calc(var(--radius) - 2px)",
            fontSize: "0.75rem",
            cursor: "pointer",
          }}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre
        style={{
          margin: 0,
          padding: "0.75rem 1rem",
          fontSize: "0.8125rem",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
          overflowX: "auto",
        }}
      >
        {code}
      </pre>
    </div>
  );
}

function ShowcaseSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 style={{ margin: "0 0 0.75rem", fontSize: "0.875rem", color: "var(--foreground-muted)" }}>
        {title}
      </h3>
      {children}
    </div>
  );
}
