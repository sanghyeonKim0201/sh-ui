"use client";

import { useEffect, useMemo, useState } from "react";
import {
  describeTemplate,
  DEFAULT_ARCH,
  CSS_FRAMEWORK_DEFAULT,
  type DescribeTemplateResult,
  type DescribeTemplateGroup,
} from "sh-ui-cli/api";
import {
  ArrowRightLeft,
  ChevronRight,
  File,
  FileCode,
  FileJson,
  FileText,
  Folder,
  FolderGit2,
  FolderOpen,
  KeyRound,
  Languages,
  Layers,
  LayoutGrid,
  Package,
  Palette,
  ShieldAlert,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ProjectOptionsForm } from "./ProjectOptionsForm";
import type {
  Arch,
  CssFramework,
  Platform,
  Plugin,
  Structure,
} from "./useCommandComposer";

type Props = {
  options: Parameters<typeof describeTemplate>[0];
};

type ViewMode = "summary" | "detail";

type TreeNode = {
  name: string;
  fullPath?: string;
  children?: Map<string, TreeNode>;
  /** 자기 자신 또는 하위 파일이 속한 그룹 id 들 — UI 컬러 hint. */
  groupIds: Set<string>;
};

function buildTree(paths: string[], pathToGroup: Map<string, string>): TreeNode {
  const root: TreeNode = { name: "", children: new Map(), groupIds: new Set() };
  for (const p of paths) {
    const parts = p.split("/");
    let cur = root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!part) continue;
      const isFile = i === parts.length - 1;
      if (!cur.children) cur.children = new Map();
      let next = cur.children.get(part);
      if (!next) {
        next = {
          name: part,
          groupIds: new Set(),
          ...(isFile ? { fullPath: p } : { children: new Map() }),
        };
        cur.children.set(part, next);
      }
      const gid = pathToGroup.get(p);
      if (gid) {
        cur.groupIds.add(gid);
        next.groupIds.add(gid);
      }
      cur = next;
    }
  }
  return root;
}

/**
 * 그룹 id → 아이콘 + 라벨톤 매핑. 토큰 팔레트가 단색 위주라
 * 색 대신 아이콘으로 출처 구분.
 */
function groupMeta(id: string): { Icon: LucideIcon; tone: "muted" | "primary" } {
  const base = id.replace(/^app-/, "");
  if (base === "base") return { Icon: Package, tone: "muted" };
  if (base === "arch") return { Icon: Layers, tone: "primary" };
  if (base === "monorepo") return { Icon: FolderGit2, tone: "muted" };
  if (base === "ui-app") return { Icon: LayoutGrid, tone: "muted" };
  if (base === "css") return { Icon: Palette, tone: "primary" };
  if (base === "transform") return { Icon: ArrowRightLeft, tone: "primary" };
  if (base === "plugin-sentry") return { Icon: ShieldAlert, tone: "primary" };
  if (base === "plugin-next-intl") return { Icon: Languages, tone: "primary" };
  if (base === "plugin-auth-jwt") return { Icon: KeyRound, tone: "primary" };
  if (base.startsWith("plugin-")) return { Icon: Package, tone: "primary" };
  return { Icon: Package, tone: "muted" };
}

function toneColor(tone: "muted" | "primary"): string {
  return tone === "primary" ? "var(--primary)" : "var(--foreground-muted)";
}

/** 파일 확장자별 아이콘. monorepo 라 ts/tsx 비중이 크지만 css/json 도 흔함. */
function fileIcon(name: string): LucideIcon {
  if (/\.(tsx?|jsx?|mjs|cjs|dart)$/.test(name)) return FileCode;
  if (/\.(json|yaml|yml|toml)$/.test(name)) return FileJson;
  if (/\.(md|mdx|txt)$/.test(name)) return FileText;
  return File;
}

/** SummaryRow li 등 Button 이 아닌 곳에서 hover 효과가 필요할 때 쓰는 헬퍼. */
function useHoverBg() {
  const [hover, setHover] = useState(false);
  return {
    hover,
    bind: {
      onMouseEnter: () => setHover(true),
      onMouseLeave: () => setHover(false),
    },
  };
}

/* ─── Detail (tree) ─── */

/**
 * 트리 행은 Button 컴포넌트 사용 + 컴팩트 sizing (height auto, custom padding)
 * inline-style override. Button 의 hover/focus/active/disabled 동작과 transition
 * 토큰을 그대로 받되, control-sm height(32px)는 풀어서 dense 한 트리에 맞춤.
 */
const TREE_ROW_STYLE = (extra: React.CSSProperties): React.CSSProperties => ({
  width: "100%",
  height: "auto",
  justifyContent: "flex-start",
  textAlign: "left",
  gap: "0.375rem",
  paddingTop: "0.125rem",
  paddingBottom: "0.125rem",
  paddingRight: "0.5rem",
  borderRadius: "calc(var(--radius) - 4px)",
  fontWeight: 400,
  whiteSpace: "nowrap",
  ...extra,
});

function FileRow({
  name,
  fullPath,
  depth,
  groupId,
  selected,
  onSelect,
}: {
  name: string;
  fullPath: string;
  depth: number;
  groupId: string | undefined;
  selected: boolean;
  onSelect: (path: string) => void;
}) {
  const Icon = fileIcon(name);
  const tone = groupId ? groupMeta(groupId).tone : "muted";
  const dotColor = toneColor(tone);
  return (
    <li>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onSelect(fullPath)}
        aria-pressed={selected}
        style={TREE_ROW_STYLE({
          paddingLeft: `${depth * 1.125 + 1.125}rem`,
          background: selected ? "var(--background-muted)" : undefined,
          outline: selected ? "1px solid var(--primary)" : undefined,
          outlineOffset: -1,
        })}
      >
        <Icon
          aria-hidden
          size={13}
          style={{ color: "var(--foreground-muted)", flexShrink: 0 }}
        />
        <span style={{ flex: 1 }}>{name}</span>
        {groupId && (
          <span
            aria-hidden
            title={groupId}
            style={{
              width: 6,
              height: 6,
              borderRadius: 999,
              background: dotColor,
              flexShrink: 0,
              opacity: 0.7,
            }}
          />
        )}
      </Button>
    </li>
  );
}

function DirRow({
  node,
  depth,
  selected,
  onSelect,
}: {
  node: TreeNode;
  depth: number;
  selected: string | null;
  onSelect: (path: string) => void;
}) {
  const [open, setOpen] = useState(depth <= 1);
  const childCount = node.children?.size ?? 0;
  const gid = node.groupIds.values().next().value as string | undefined;
  const tone = gid ? groupMeta(gid).tone : "muted";
  const dotColor = toneColor(tone);

  return (
    <li>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={TREE_ROW_STYLE({
          paddingLeft: `${depth * 1.125 + 0.25}rem`,
        })}
      >
        <ChevronRight
          aria-hidden
          size={12}
          style={{
            flexShrink: 0,
            color: "var(--foreground-muted)",
            transform: open ? "rotate(90deg)" : "rotate(0deg)",
            transition: "transform var(--duration-fast, 120ms) var(--ease-standard, ease)",
          }}
        />
        {open ? (
          <FolderOpen aria-hidden size={13} style={{ color: "var(--primary)", flexShrink: 0 }} />
        ) : (
          <Folder aria-hidden size={13} style={{ color: "var(--primary)", flexShrink: 0 }} />
        )}
        <span style={{ flex: 1, fontWeight: 500 }}>{node.name}</span>
        <span
          aria-hidden
          style={{
            fontSize: "0.6875rem",
            color: "var(--foreground-muted)",
            fontVariantNumeric: "tabular-nums",
            flexShrink: 0,
          }}
        >
          {childCount}
        </span>
        {gid && (
          <span
            aria-hidden
            style={{
              width: 6,
              height: 6,
              borderRadius: 999,
              background: dotColor,
              flexShrink: 0,
              opacity: 0.7,
            }}
          />
        )}
      </Button>
      {open && node.children && (
        <TreeChildren
          node={node}
          depth={depth + 1}
          selected={selected}
          onSelect={onSelect}
        />
      )}
    </li>
  );
}

function TreeChildren({
  node,
  depth,
  selected,
  onSelect,
}: {
  node: TreeNode;
  depth: number;
  selected: string | null;
  onSelect: (path: string) => void;
}) {
  if (!node.children || node.children.size === 0) return null;
  const entries = Array.from(node.children.values()).sort((a, b) => {
    const aDir = !!a.children;
    const bDir = !!b.children;
    if (aDir !== bDir) return aDir ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  return (
    <ul
      style={{
        listStyle: "none",
        margin: 0,
        padding: 0,
      }}
    >
      {entries.map((child) => {
        const isDir = !!child.children;
        if (isDir) {
          return (
            <DirRow
              key={child.name}
              node={child}
              depth={depth}
              selected={selected}
              onSelect={onSelect}
            />
          );
        }
        const gid = child.groupIds.values().next().value as string | undefined;
        const fullPath = child.fullPath ?? child.name;
        return (
          <FileRow
            key={child.name}
            name={child.name}
            fullPath={fullPath}
            depth={depth}
            groupId={gid}
            selected={selected === fullPath}
            onSelect={onSelect}
          />
        );
      })}
    </ul>
  );
}

function Tree({
  root,
  selected,
  onSelect,
}: {
  root: TreeNode;
  selected: string | null;
  onSelect: (path: string) => void;
}) {
  return (
    <div
      style={{
        fontSize: "0.8125rem",
        fontFamily:
          "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
        lineHeight: 1.7,
      }}
    >
      <TreeChildren node={root} depth={0} selected={selected} onSelect={onSelect} />
    </div>
  );
}

/* ─── Summary (group cards) ─── */

function SummaryRow({
  group,
  total,
}: {
  group: DescribeTemplateGroup;
  total: number;
}) {
  const { hover, bind } = useHoverBg();
  const { Icon, tone } = groupMeta(group.id);
  const accent = toneColor(tone);
  const ratio = total === 0 ? 0 : group.paths.length / total;

  return (
    <li
      {...bind}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.25rem",
        padding: "0.5rem 0.625rem",
        borderRadius: "calc(var(--radius) - 2px)",
        border: "1px solid var(--border)",
        background: hover ? "var(--background-muted)" : "var(--background)",
        transition: "background var(--duration-fast, 120ms) var(--ease-standard, ease)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <span
          aria-hidden
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 26,
            height: 26,
            borderRadius: "calc(var(--radius) - 4px)",
            background: "var(--background-subtle)",
            color: accent,
            flexShrink: 0,
          }}
        >
          <Icon size={14} />
        </span>
        <span
          style={{
            flex: 1,
            color: "var(--foreground)",
            fontSize: "0.8125rem",
            fontWeight: 500,
          }}
        >
          {group.label}
        </span>
        <span
          style={{
            color: "var(--foreground-muted)",
            fontSize: "0.75rem",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {group.paths.length}개
        </span>
      </div>
      {/* 전체 대비 비율 막대 — 시각적 비교에 도움. */}
      <div
        aria-hidden
        style={{
          position: "relative",
          height: 3,
          borderRadius: 999,
          background: "var(--background-muted)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            width: `${Math.max(ratio * 100, 1.5)}%`,
            background: accent,
            opacity: tone === "primary" ? 0.8 : 0.5,
          }}
        />
      </div>
    </li>
  );
}

function Summary({ groups }: { groups: DescribeTemplateGroup[] }) {
  const total = groups.reduce((n, g) => n + g.paths.length, 0);
  return (
    <ul
      style={{
        listStyle: "none",
        margin: 0,
        padding: 0,
        display: "flex",
        flexDirection: "column",
        gap: "0.375rem",
      }}
    >
      {groups.map((g) => (
        <SummaryRow key={g.id} group={g} total={total} />
      ))}
    </ul>
  );
}

/* ─── Content viewer (lazy fetch from /api/template-content) ─── */

type ContentState =
  | { kind: "loading" }
  | { kind: "ok"; content: string; from: string; truncated: boolean }
  | { kind: "error"; message: string };

function ContentViewer({
  path,
  options,
  onClose,
}: {
  path: string;
  options: Parameters<typeof describeTemplate>[0];
  onClose: () => void;
}) {
  const [state, setState] = useState<ContentState>({ kind: "loading" });

  useEffect(() => {
    const ctrl = new AbortController();
    setState({ kind: "loading" });

    const params = new URLSearchParams();
    params.set("path", path);
    params.set("platform", options?.platform ?? "next");
    params.set("structure", options?.structure ?? "standalone");
    params.set("arch", options?.arch ?? "fsd");
    params.set("appName", options?.appName ?? "web");
    if (options?.plugins && options.plugins.length) {
      params.set("plugins", options.plugins.join(","));
    }
    if (options?.i18n && options.i18n !== 'none') {
      params.set("i18n", options.i18n);
    }
    if (options?.locales && options.locales !== 'ko,en') {
      params.set("locales", options.locales);
    }
    if (options?.observability && options.observability !== 'none') {
      params.set("observability", options.observability);
    }

    fetch(`/api/template-content?${params.toString()}`, { signal: ctrl.signal })
      .then(async (r) => {
        const json = await r.json();
        if (!r.ok) {
          setState({ kind: "error", message: json.error ?? `HTTP ${r.status}` });
        } else {
          setState({
            kind: "ok",
            content: json.content,
            from: json.from,
            truncated: json.truncated,
          });
        }
      })
      .catch((e) => {
        if (e.name === "AbortError") return;
        setState({ kind: "error", message: String(e?.message ?? e) });
      });

    return () => ctrl.abort();
  }, [path, options]);

  return (
    <div
      style={{
        marginTop: "0.5rem",
        border: "1px solid var(--border)",
        borderRadius: "calc(var(--radius) - 2px)",
        background: "var(--background)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.375rem 0.5rem",
          borderBottom: "1px solid var(--border)",
          background: "var(--background-subtle)",
        }}
      >
        <FileCode aria-hidden size={13} style={{ color: "var(--foreground-muted)", flexShrink: 0 }} />
        <span
          style={{
            flex: 1,
            fontSize: "0.75rem",
            fontFamily:
              "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
            color: "var(--foreground)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {path}
        </span>
        {state.kind === "ok" && (
          <span
            style={{
              fontSize: "0.6875rem",
              color: "var(--foreground-muted)",
              flexShrink: 0,
            }}
            title={`source: ${state.from}`}
          >
            {state.from}
          </span>
        )}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClose}
          aria-label="파일 내용 닫기"
          style={{
            width: 24,
            height: 24,
            padding: 0,
            color: "var(--foreground-muted)",
            flexShrink: 0,
          }}
        >
          <X size={14} />
        </Button>
      </div>

      <div
        style={{
          maxHeight: 240,
          overflow: "auto",
          background: "var(--background-subtle)",
        }}
      >
        {state.kind === "loading" && (
          <p
            style={{
              margin: 0,
              padding: "0.75rem",
              fontSize: "0.75rem",
              color: "var(--foreground-muted)",
            }}
          >
            불러오는 중…
          </p>
        )}
        {state.kind === "error" && (
          <p
            style={{
              margin: 0,
              padding: "0.75rem",
              fontSize: "0.75rem",
              color: "var(--danger)",
            }}
          >
            불러오기 실패: {state.message}
          </p>
        )}
        {state.kind === "ok" && (
          <pre
            style={{
              margin: 0,
              padding: "0.625rem 0.75rem",
              fontSize: "0.6875rem",
              lineHeight: 1.55,
              fontFamily:
                "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
              color: "var(--foreground)",
              whiteSpace: "pre",
              background: "transparent",
              border: "none",
              borderRadius: 0,
            }}
          >
            {state.content}
            {state.truncated && (
              <span
                style={{
                  display: "block",
                  marginTop: "0.5rem",
                  color: "var(--foreground-muted)",
                }}
              >
                … (잘림 — 64KB 까지만 표시)
              </span>
            )}
          </pre>
        )}
      </div>
    </div>
  );
}

/* ─── Top-level body & dialog ─── */

export function TemplatePreviewBody({ options }: Props) {
  const [view, setView] = useState<ViewMode>("summary");
  const [selected, setSelected] = useState<string | null>(null);

  const result: DescribeTemplateResult = useMemo(() => {
    try {
      return describeTemplate(options);
    } catch {
      return { files: [], groups: [] };
    }
  }, [options]);

  // 옵션 바뀌면서 더 이상 존재하지 않는 path 가 선택돼 있으면 해제.
  useEffect(() => {
    if (selected && !result.files.includes(selected)) setSelected(null);
  }, [result.files, selected]);

  const pathToGroup = useMemo(() => {
    const m = new Map<string, string>();
    for (const g of result.groups) {
      for (const p of g.paths) m.set(p, g.id);
    }
    return m;
  }, [result]);

  const tree = useMemo(
    () => buildTree(result.files, pathToGroup),
    [result, pathToGroup],
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.625rem",
        marginTop: "0.5rem",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
        }}
      >
        <div
          role="tablist"
          aria-label="미리보기 모드"
          style={{
            display: "inline-flex",
            gap: 2,
            padding: 2,
            border: "1px solid var(--border)",
            borderRadius: "calc(var(--radius) - 2px)",
            background: "var(--background-subtle)",
          }}
        >
          {(["summary", "detail"] as const).map((m) => (
            <Button
              key={m}
              type="button"
              role="tab"
              variant={view === m ? "primary" : "ghost"}
              size="sm"
              aria-selected={view === m}
              onClick={() => setView(m)}
              style={{
                height: "auto",
                padding: "0.25rem 0.625rem",
                fontSize: "0.75rem",
                fontWeight: view === m ? 600 : 400,
              }}
            >
              {m === "summary" ? "요약" : "상세"}
            </Button>
          ))}
        </div>
        <span
          style={{
            marginLeft: "auto",
            fontSize: "0.75rem",
            color: "var(--foreground-muted)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          총 {result.files.length}개 파일
        </span>
      </div>

      <div
        style={{
          maxHeight: 460,
          overflowY: "auto",
          overflowX: "auto",
          padding: "0.625rem",
          border: "1px solid var(--border)",
          borderRadius: "calc(var(--radius) - 2px)",
          background: "var(--background-subtle)",
        }}
      >
        {result.files.length === 0 ? (
          <p
            style={{
              margin: 0,
              padding: "0.75rem",
              fontSize: "0.8125rem",
              color: "var(--foreground-muted)",
              textAlign: "center",
            }}
          >
            해당 옵션 조합으로 생성할 파일이 없어요.
          </p>
        ) : view === "summary" ? (
          <Summary groups={result.groups} />
        ) : (
          <Tree root={tree} selected={selected} onSelect={setSelected} />
        )}
      </div>

      {view === "detail" && selected && (
        <ContentViewer
          path={selected}
          options={options}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

export function TemplatePreviewDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [platform, setPlatform] = useState<Platform>("next");
  const [structure, setStructure] = useState<Structure>("standalone");
  const [arch, setArch] = useState<Arch>(DEFAULT_ARCH);
  const [cssFramework, setCssFramework] =
    useState<CssFramework>(CSS_FRAMEWORK_DEFAULT);
  const [plugins, setPlugins] = useState<Set<Plugin>>(new Set());
  const [i18n, setI18n] = useState<'none' | 'react-i18next'>('none');
  const [locales, setLocales] = useState<string>('ko,en');
  const [observability, setObservability] = useState<'none' | 'sentry'>('none');

  const togglePlugin = (p: Plugin) => {
    setPlugins((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent style={{ maxWidth: 720, width: "100%" }}>
        <DialogTitle>파일 미리보기</DialogTitle>
        <DialogDescription>
          옵션을 골라보면 프로젝트 생성 시 어떤 파일이 만들어지는지 트리로 보입니다. 실제 파일은 만들어지지 않아요.
        </DialogDescription>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.875rem",
            marginTop: "0.5rem",
          }}
        >
          <ProjectOptionsForm
            platform={platform}
            onPlatformChange={setPlatform}
            structure={structure}
            onStructureChange={setStructure}
            arch={arch}
            onArchChange={setArch}
            cssFramework={cssFramework}
            onCssFrameworkChange={setCssFramework}
            plugins={plugins}
            onTogglePlugin={togglePlugin}
            i18n={i18n}
            onI18nChange={setI18n}
            locales={locales}
            onLocalesChange={setLocales}
            observability={observability}
            onObservabilityChange={setObservability}
          />

          <TemplatePreviewBody
            options={{
              platform,
              structure,
              arch,
              plugins: Array.from(plugins),
              cssFramework,
              appName: "web",
              i18n,
              locales,
              observability,
            }}
          />
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="secondary">닫기</Button>} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
