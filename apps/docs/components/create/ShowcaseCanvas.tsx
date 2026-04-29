"use client";

import type { CSSProperties, RefObject } from "react";
import { SHOWCASE_BY_ID } from "./showcases";

type Props = {
  selectedIds: string[];
  onRemove: (id: string) => void;
  previewVars: CSSProperties;
  containerRef: RefObject<HTMLElement | null>;
};

export function ShowcaseCanvas({ selectedIds, onRemove, previewVars, containerRef }: Props) {
  const items = selectedIds
    .map((id) => SHOWCASE_BY_ID[id])
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  return (
    <section
      ref={containerRef as RefObject<HTMLElement>}
      className="sh-create-pane sh-create-pane--canvas"
      style={{
        ...previewVars,
        background: "var(--background)",
        color: "var(--foreground)",
        height: "100%",
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
        overflowY: "auto",
      }}
    >
      {items.length === 0 ? (
        <div
          style={{
            display: "grid",
            placeItems: "center",
            flex: 1,
            minHeight: "16rem",
            border: "1px dashed var(--border)",
            borderRadius: "var(--radius)",
            color: "var(--foreground-muted)",
            fontSize: "0.875rem",
            textAlign: "center",
            padding: "2rem",
          }}
        >
          왼쪽 목록에서 컴포넌트를 클릭해 캔버스에 추가하세요
        </div>
      ) : (
        items.map((s) => {
          const Demo = s.Demo;
          return (
            <div
              key={s.id}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                padding: "1rem",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                background: "var(--background-subtle)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "0.5rem",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: "0.875rem",
                    color: "var(--foreground)",
                  }}
                >
                  {s.label}
                </h3>
                <button
                  type="button"
                  onClick={() => onRemove(s.id)}
                  aria-label={`${s.label} 제거`}
                  style={{
                    width: "1.5rem",
                    height: "1.5rem",
                    display: "grid",
                    placeItems: "center",
                    padding: 0,
                    border: "1px solid var(--border)",
                    borderRadius: "calc(var(--radius) - 2px)",
                    background: "transparent",
                    color: "var(--foreground-muted)",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </div>
              <div
                style={{
                  padding: "1rem",
                  background: "var(--background)",
                  borderRadius: "calc(var(--radius) - 2px)",
                  border: "1px solid var(--border)",
                }}
              >
                <Demo containerRef={containerRef} />
              </div>
            </div>
          );
        })
      )}
    </section>
  );
}
