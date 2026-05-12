"use client";

import { useMemo, useState } from "react";
import {
  describeTemplate,
  type DescribeTemplateResult,
  type DescribeTemplateGroup,
} from "sh-ui-cli/api";

type Props = {
  /** describeTemplate 호출용 옵션. dialog 가 그대로 넘긴다. */
  options: Parameters<typeof describeTemplate>[0];
};

type ViewMode = "summary" | "detail";

type TreeNode = {
  name: string;
  /** path 가 자기 자신이면 file. children 있으면 dir. */
  fullPath?: string;
  children?: Map<string, TreeNode>;
  /** 자기 자신 또는 하위 파일이 속한 그룹 id 들 — UI 에서 색상 hint. */
  groupIds: Set<string>;
};

/** path 배열을 디렉토리 트리로 변환. */
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

/** 라벨에서 그룹 id 만 추출해 컬러 hint 에 사용. 미리 정의된 팔레트에서 매핑. */
function groupColor(id: string): string {
  if (id === "base" || id.endsWith("-base")) return "var(--foreground-muted)";
  if (id === "arch" || id.endsWith("-arch")) return "var(--primary)";
  if (id === "monorepo") return "var(--foreground-muted)";
  if (id === "ui-app") return "var(--foreground-muted)";
  if (id === "css") return "var(--primary)";
  if (id === "transform") return "var(--primary)";
  if (id.startsWith("plugin-") || id.startsWith("app-plugin-")) return "var(--primary)";
  return "var(--foreground-muted)";
}

function TreeView({ node, depth }: { node: TreeNode; depth: number }) {
  if (!node.children || node.children.size === 0) {
    return null;
  }
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
        paddingLeft: depth === 0 ? 0 : "1rem",
        fontSize: "0.75rem",
        fontFamily:
          "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
        lineHeight: 1.65,
      }}
    >
      {entries.map((child) => {
        const isDir = !!child.children;
        const gid = child.groupIds.values().next().value as string | undefined;
        const color = gid ? groupColor(gid) : "var(--foreground)";
        if (!isDir) {
          return (
            <li key={child.name} style={{ color, whiteSpace: "nowrap" }}>
              <span aria-hidden style={{ opacity: 0.5, marginRight: 4 }}>·</span>
              {child.name}
            </li>
          );
        }
        return (
          <DirEntry key={child.name} node={child} depth={depth + 1} />
        );
      })}
    </ul>
  );
}

function DirEntry({ node, depth }: { node: TreeNode; depth: number }) {
  const [open, setOpen] = useState(depth <= 2);
  const childCount = node.children?.size ?? 0;
  const gid = node.groupIds.values().next().value as string | undefined;
  const color = gid ? groupColor(gid) : "var(--foreground)";

  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={{
          background: "none",
          border: "none",
          padding: 0,
          margin: 0,
          font: "inherit",
          color,
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        <span aria-hidden style={{ display: "inline-block", width: 12 }}>
          {open ? "▾" : "▸"}
        </span>
        {node.name}/
        <span style={{ marginLeft: 4, opacity: 0.6, fontSize: "0.6875rem" }}>
          {childCount}
        </span>
      </button>
      {open && <TreeView node={node} depth={depth} />}
    </li>
  );
}

function Summary({ groups }: { groups: DescribeTemplateGroup[] }) {
  return (
    <ul
      style={{
        listStyle: "none",
        margin: 0,
        padding: 0,
        display: "flex",
        flexDirection: "column",
        gap: "0.25rem",
        fontSize: "0.75rem",
      }}
    >
      {groups.map((g) => (
        <li
          key={g.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <span
            aria-hidden
            style={{
              display: "inline-block",
              width: 6,
              height: 6,
              borderRadius: 999,
              background: groupColor(g.id),
              flexShrink: 0,
            }}
          />
          <span style={{ color: "var(--foreground)", flex: 1 }}>{g.label}</span>
          <span style={{ color: "var(--foreground-muted)" }}>
            {g.paths.length}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function TemplatePreview({ options }: Props) {
  const [view, setView] = useState<ViewMode>("summary");
  const [open, setOpen] = useState(false);

  const result: DescribeTemplateResult = useMemo(() => {
    try {
      return describeTemplate(options);
    } catch {
      return { files: [], groups: [] };
    }
  }, [options]);

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
        border: "1px solid var(--border)",
        borderRadius: "calc(var(--radius) - 2px)",
        background: "var(--background-subtle)",
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.5rem 0.625rem",
          background: "transparent",
          border: "none",
          font: "inherit",
          fontSize: "0.75rem",
          color: "var(--foreground)",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span aria-hidden style={{ display: "inline-block", width: 12 }}>
          {open ? "▾" : "▸"}
        </span>
        <span style={{ flex: 1 }}>생성될 파일 미리보기</span>
        <span style={{ color: "var(--foreground-muted)" }}>
          {result.files.length}개
        </span>
      </button>
      {open && (
        <div
          style={{
            borderTop: "1px solid var(--border)",
            padding: "0.5rem 0.625rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          <div
            role="tablist"
            aria-label="미리보기 모드"
            style={{
              display: "inline-flex",
              gap: "0.25rem",
              padding: 2,
              border: "1px solid var(--border)",
              borderRadius: "calc(var(--radius) - 2px)",
              background: "var(--background)",
              alignSelf: "flex-start",
            }}
          >
            {(["summary", "detail"] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={view === m}
                onClick={() => setView(m)}
                style={{
                  padding: "0.1875rem 0.5rem",
                  fontSize: "0.6875rem",
                  fontWeight: view === m ? 600 : 400,
                  border: "none",
                  borderRadius: "calc(var(--radius) - 4px)",
                  background:
                    view === m ? "var(--primary)" : "transparent",
                  color:
                    view === m
                      ? "var(--primary-foreground)"
                      : "var(--foreground)",
                  cursor: "pointer",
                }}
              >
                {m === "summary" ? "요약" : "상세"}
              </button>
            ))}
          </div>

          <div
            style={{
              maxHeight: 280,
              overflowY: "auto",
              overflowX: "auto",
              padding: "0.25rem 0",
            }}
          >
            {view === "summary" ? (
              <Summary groups={result.groups} />
            ) : (
              <TreeView node={tree} depth={0} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
