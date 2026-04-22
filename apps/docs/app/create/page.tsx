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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox";
import { DatePicker } from "@/components/ui/date-picker";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadList,
} from "@/components/ui/file-upload";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Radio, RadioGroup } from "@/components/ui/radio";
import {
  Toggle,
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle";
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
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverTitle,
  PopoverDescription,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { Menubar } from "@/components/ui/menubar";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselIndicators,
} from "@/components/ui/carousel";
import { CreateProjectFab } from "@/components/create/CreateProjectFab";
import { CreateProjectDialog } from "@/components/create/CreateProjectDialog";

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

/* ───────── Dart 토큰 내보내기 ─────────
 * ShUiColorTokens 필드 매핑:
 * - self    — 현재 모드에서 playground가 편집하는 값
 * - inverse — 반대 모드의 편집값 (backgroundInverse / foregroundInverse)
 * - default — playground가 노출하지 않음. 기본값 유지 (foregroundSubtle)
 */

type DartFieldSource =
  | { kind: "self"; key: TokenKey }
  | { kind: "inverse"; key: TokenKey }
  | { kind: "default" };

const DART_FIELD_ORDER: { field: string; source: DartFieldSource }[] = [
  { field: "background", source: { kind: "self", key: "background" } },
  { field: "backgroundSubtle", source: { kind: "self", key: "background-subtle" } },
  { field: "backgroundMuted", source: { kind: "self", key: "background-muted" } },
  { field: "backgroundInverse", source: { kind: "inverse", key: "background" } },
  { field: "foreground", source: { kind: "self", key: "foreground" } },
  { field: "foregroundMuted", source: { kind: "self", key: "foreground-muted" } },
  { field: "foregroundSubtle", source: { kind: "default" } },
  { field: "foregroundInverse", source: { kind: "inverse", key: "foreground" } },
  { field: "border", source: { kind: "self", key: "border" } },
  { field: "borderStrong", source: { kind: "self", key: "border-strong" } },
  { field: "primary", source: { kind: "self", key: "primary" } },
  { field: "primaryForeground", source: { kind: "self", key: "primary-foreground" } },
  { field: "primaryHover", source: { kind: "self", key: "primary-hover" } },
  { field: "danger", source: { kind: "self", key: "danger" } },
  { field: "dangerForeground", source: { kind: "self", key: "danger-foreground" } },
];

const DART_DEFAULTS: Record<Mode, Record<string, string>> = {
  light: { foregroundSubtle: "0xFFA3A3A3" },
  dark: { foregroundSubtle: "0xFF737373" },
};

const toDartColor = (hex: string) =>
  `Color(0xFF${hex.replace("#", "").toUpperCase()})`;

function buildDartColorTokens(
  mode: Mode,
  self: Record<TokenKey, string>,
  opposite: Record<TokenKey, string>,
): string {
  const defaults = DART_DEFAULTS[mode];
  const lines = DART_FIELD_ORDER.map(({ field, source }) => {
    switch (source.kind) {
      case "self":
        return `  ${field}: ${toDartColor(self[source.key])},`;
      case "inverse":
        return `  ${field}: ${toDartColor(opposite[source.key])},`;
      case "default":
        return `  ${field}: Color(${defaults[field]}),`;
    }
  }).join("\n");
  return `static const ${mode} = ShUiColorTokens(\n${lines}\n);`;
}

const DEFAULT_RADIUS = 0.5;

const RADIUS_PRESETS: { label: string; value: number }[] = [
  { label: "none", value: 0 },
  { label: "sm", value: 0.25 },
  { label: "md", value: 0.5 },
  { label: "lg", value: 0.75 },
  { label: "xl", value: 1 },
];

export default function CreateProjectPage() {
  const [mode, setMode] = useState<Mode>("light");
  const [light, setLight] = useState(lightDefaults);
  const [dark, setDark] = useState(darkDefaults);
  const [radius, setRadius] = useState(DEFAULT_RADIUS);
  const [hydrated, setHydrated] = useState(false);
  const [openKey, setOpenKey] = useState<TokenKey | null>(null);
  const previewRef = useRef<HTMLElement>(null);
  const [createOpen, setCreateOpen] = useState(false);

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

  /* 내보내기용 — Flutter ShUiColorTokens / ShUiRadiusTokens */
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

  return (
    <>
      <main style={{ padding: "2rem 1rem 6rem", maxWidth: 1280, margin: "0 auto" }}>
        <h1>프로젝트 생성</h1>
        <p className="muted">
          색과 radius 를 직접 편집하면서 컴포넌트가 어떻게 변하는지 본 다음, 우하단 버튼으로 그 디자인이 그대로 적용된 새 프로젝트를 만든다.
          편집 값은 자동 저장되며, CLI 레퍼런스는 <a href="/cli">/cli</a> 페이지에서 볼 수 있다.
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
            <CategoryHeader title="Action" />

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

            <ShowcaseSection title="Button sizes">
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
                <Button size="sm">sm</Button>
                <Button size="md">md</Button>
                <Button size="lg">lg</Button>
              </div>
            </ShowcaseSection>

            <CategoryHeader title="Form" />

            <ShowcaseSection title="Input · Textarea">
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: 360 }}>
                <Input placeholder="기본 입력" />
                <Input defaultValue="값이 있는 상태" />
                <Input placeholder="에러 상태" aria-invalid />
                <Input placeholder="비활성" disabled />
                <Textarea placeholder="여러 줄 입력" rows={3} />
              </div>
            </ShowcaseSection>

            <ShowcaseSection title="Label">
              <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem", maxWidth: 360 }}>
                <Label htmlFor="pg-label-email" isRequired>
                  이메일
                </Label>
                <Input id="pg-label-email" type="email" placeholder="you@example.com" required />
              </div>
            </ShowcaseSection>

            <ShowcaseSection title="Select · Combobox">
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
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
                <Combobox items={["Apple", "Banana", "Grapes", "Mango", "Orange"]}>
                  <ComboboxInput placeholder="과일 검색" style={{ width: "14rem" }} />
                  <ComboboxContent container={previewRef}>
                    <ComboboxList>
                      {(item: string) => (
                        <ComboboxItem key={item} value={item}>
                          {item}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                    <ComboboxEmpty>일치하는 항목 없음</ComboboxEmpty>
                  </ComboboxContent>
                </Combobox>
              </div>
            </ShowcaseSection>

            <ShowcaseSection title="DatePicker · FileUpload">
              <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "flex-start" }}>
                <DatePicker />
                <div style={{ minWidth: 240, flex: "1 1 240px" }}>
                  <FileUpload multiple>
                    <FileUploadDropzone>
                      <strong>파일을 드래그</strong>하거나 클릭해서 선택
                    </FileUploadDropzone>
                    <FileUploadList />
                  </FileUpload>
                </div>
              </div>
            </ShowcaseSection>

            <CategoryHeader title="Choice" />

            <ShowcaseSection title="Checkbox · Switch">
              <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center" }}>
                <Switch defaultChecked aria-label="알림" />
                <Switch aria-label="다크 모드" />
                <Checkbox defaultChecked aria-label="동의" />
                <Checkbox aria-label="필수 아님" />
              </div>
            </ShowcaseSection>

            <ShowcaseSection title="Radio">
              <RadioGroup defaultValue="public" orientation="horizontal" style={{ display: "flex", gap: "1rem" }}>
                <label style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
                  <Radio value="public" /> 공개
                </label>
                <label style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
                  <Radio value="private" /> 비공개
                </label>
                <label style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
                  <Radio value="team" /> 팀
                </label>
              </RadioGroup>
            </ShowcaseSection>

            <ShowcaseSection title="Toggle · ToggleGroup">
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
                <Toggle variant="outline" aria-label="굵게">B</Toggle>
                <Toggle variant="ghost" aria-label="기울임">I</Toggle>
                <ToggleGroup variant="outline" defaultValue={["left"]}>
                  <ToggleGroupItem value="left">L</ToggleGroupItem>
                  <ToggleGroupItem value="center">C</ToggleGroupItem>
                  <ToggleGroupItem value="right">R</ToggleGroupItem>
                </ToggleGroup>
              </div>
            </ShowcaseSection>

            <ShowcaseSection title="Slider">
              <div style={{ maxWidth: 360 }}>
                <Slider defaultValue={60} min={0} max={100} step={1} aria-label="볼륨" />
              </div>
            </ShowcaseSection>

            <CategoryHeader title="Display" />

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

            <ShowcaseSection title="Progress · Spinner">
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

            <ShowcaseSection title="Skeleton">
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: 360 }}>
                <Skeleton style={{ height: "1rem", width: "60%" }} />
                <Skeleton style={{ height: "1rem", width: "85%" }} />
                <Skeleton style={{ height: "1rem", width: "40%" }} />
              </div>
            </ShowcaseSection>

            <ShowcaseSection title="Separator">
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.875rem" }}>
                <span>좌측</span>
                <Separator orientation="vertical" style={{ height: "1rem" }} />
                <span>중앙</span>
                <Separator orientation="vertical" style={{ height: "1rem" }} />
                <span>우측</span>
              </div>
              <Separator style={{ margin: "0.75rem 0" }} />
              <p className="muted" style={{ fontSize: "0.8125rem", margin: 0 }}>
                수평 구분선
              </p>
            </ShowcaseSection>

            <CategoryHeader title="Overlay" />

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

            <ShowcaseSection title="Popover · Dialog">
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <Popover>
                  <PopoverTrigger render={<Button variant="secondary">Popover</Button>} />
                  <PopoverContent container={previewRef}>
                    <PopoverTitle>토큰 미리보기</PopoverTitle>
                    <PopoverDescription>
                      편집한 색과 radius가 여기에도 그대로 적용됩니다.
                    </PopoverDescription>
                  </PopoverContent>
                </Popover>
                <Dialog>
                  <DialogTrigger render={<Button>Dialog</Button>} />
                  <DialogContent container={previewRef}>
                    <DialogTitle>확인</DialogTitle>
                    <DialogDescription>
                      이 작업은 취소할 수 없습니다. 계속 진행하시겠어요?
                    </DialogDescription>
                    <DialogFooter>
                      <DialogClose render={<Button variant="secondary">취소</Button>} />
                      <DialogClose render={<Button variant="danger">삭제</Button>} />
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </ShowcaseSection>

            <ShowcaseSection title="ContextMenu">
              <ContextMenu>
                <ContextMenuTrigger
                  style={{
                    display: "grid",
                    placeItems: "center",
                    height: "5rem",
                    border: "1px dashed var(--border)",
                    borderRadius: "var(--radius)",
                    color: "var(--foreground-muted)",
                    fontSize: "0.8125rem",
                    maxWidth: 360,
                  }}
                >
                  이 영역에서 우클릭
                </ContextMenuTrigger>
                <ContextMenuContent container={previewRef}>
                  <ContextMenuItem>복사</ContextMenuItem>
                  <ContextMenuItem>잘라내기</ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem>삭제</ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            </ShowcaseSection>

            <ShowcaseSection title="Menubar">
              <Menubar>
                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button variant="ghost" size="sm">파일</Button>} />
                  <DropdownMenuContent align="start" container={previewRef}>
                    <DropdownMenuItem>새로 만들기</DropdownMenuItem>
                    <DropdownMenuItem>열기</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>저장</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button variant="ghost" size="sm">편집</Button>} />
                  <DropdownMenuContent align="start" container={previewRef}>
                    <DropdownMenuItem>실행 취소</DropdownMenuItem>
                    <DropdownMenuItem>다시 실행</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button variant="ghost" size="sm">보기</Button>} />
                  <DropdownMenuContent align="start" container={previewRef}>
                    <DropdownMenuItem>확대</DropdownMenuItem>
                    <DropdownMenuItem>축소</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </Menubar>
            </ShowcaseSection>

            <CategoryHeader title="Navigation" />

            <ShowcaseSection title="Tabs">
              <Tabs defaultValue="overview" style={{ maxWidth: 480 }}>
                <TabsList>
                  <TabsTrigger value="overview">개요</TabsTrigger>
                  <TabsTrigger value="analytics">분석</TabsTrigger>
                  <TabsTrigger value="reports">보고서</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" style={{ paddingTop: "0.75rem" }}>
                  개요 탭의 내용입니다.
                </TabsContent>
                <TabsContent value="analytics" style={{ paddingTop: "0.75rem" }}>
                  분석 탭의 내용입니다.
                </TabsContent>
                <TabsContent value="reports" style={{ paddingTop: "0.75rem" }}>
                  보고서 탭의 내용입니다.
                </TabsContent>
              </Tabs>
            </ShowcaseSection>

            <ShowcaseSection title="Accordion">
              <Accordion style={{ maxWidth: 480 }}>
                <AccordionItem value="a">
                  <AccordionTrigger>무엇을 제공하나요?</AccordionTrigger>
                  <AccordionContent>
                    React/Flutter 공용 디자인 시스템 컴포넌트를 제공합니다.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="b">
                  <AccordionTrigger>토큰은 어떻게 바꾸나요?</AccordionTrigger>
                  <AccordionContent>
                    좌측 편집 패널에서 색과 radius를 조정하면 이 영역에 즉시 반영됩니다.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </ShowcaseSection>

            <ShowcaseSection title="Breadcrumb">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">홈</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">컴포넌트</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>프로젝트 생성</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </ShowcaseSection>

            <ShowcaseSection title="Pagination">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">1</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#" isActive>2</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">3</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext href="#" />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </ShowcaseSection>

            <ShowcaseSection title="Carousel">
              <Carousel loop style={{ maxWidth: 480 }}>
                <CarouselContent>
                  {["하나", "둘", "셋", "넷"].map((label) => (
                    <CarouselItem key={label}>
                      <div
                        style={{
                          display: "grid",
                          placeItems: "center",
                          height: "8rem",
                          background: "var(--background-muted)",
                          borderRadius: "var(--radius)",
                          fontSize: "1.25rem",
                          fontWeight: 600,
                        }}
                      >
                        {label}
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
                <CarouselIndicators />
              </Carousel>
            </ShowcaseSection>
          </section>
        </div>

        {/* ───────────── 내보내기 ───────────── */}
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

function ExportBlock({ code, filename = "tokens.css" }: { code: string; filename?: string }) {
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
        <code style={{ color: "var(--foreground)" }}>{filename}</code>
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

function CategoryHeader({ title }: { title: string }) {
  return (
    <div
      style={{
        fontSize: "0.6875rem",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        color: "var(--foreground-muted)",
        paddingBottom: "0.375rem",
        borderBottom: "1px solid var(--border)",
        marginTop: "0.5rem",
      }}
    >
      {title}
    </div>
  );
}
