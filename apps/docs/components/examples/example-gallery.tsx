"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import type { ExampleCategory, ExampleEntry } from "@/examples/types";
import { ExampleCard } from "./example-card";

const CATEGORIES: { value: ExampleCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "blocks", label: "Blocks" },
  { value: "pages", label: "Pages" },
  { value: "flows", label: "Flows" },
  { value: "themes", label: "Themes" },
];

export interface ExampleGalleryProps {
  examples: ExampleEntry[];
}

export function ExampleGallery({ examples }: ExampleGalleryProps) {
  const router = useRouter();
  const params = useSearchParams();
  const rawCat = params.get("cat");
  const activeCat: ExampleCategory | "all" =
    rawCat === "blocks" ||
    rawCat === "pages" ||
    rawCat === "flows" ||
    rawCat === "themes"
      ? rawCat
      : "all";

  const filtered = useMemo(
    () =>
      activeCat === "all"
        ? examples
        : examples.filter((e) => e.category === activeCat),
    [activeCat, examples],
  );

  const selectCategory = (next: ExampleCategory | "all") => {
    const q = new URLSearchParams(params);
    if (next === "all") q.delete("cat");
    else q.set("cat", next);
    const qs = q.toString();
    router.replace(qs ? `/examples?${qs}` : "/examples");
  };

  const reset = () => selectCategory("all");

  return (
    <div className="sh-ui-example-gallery">
      <div
        role="tablist"
        aria-label="예제 카테고리"
        className="sh-ui-example-gallery__tabs"
      >
        {CATEGORIES.map((c) => {
          const isActive = activeCat === c.value;
          return (
            <button
              key={c.value}
              role="tab"
              aria-selected={isActive}
              className="sh-ui-example-gallery__tab"
              data-active={isActive ? "" : undefined}
              onClick={() => selectCategory(c.value)}
              type="button"
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="sh-ui-example-gallery__empty" role="status">
          <p>해당 카테고리의 예제가 아직 없습니다.</p>
          <button
            type="button"
            onClick={reset}
            className="sh-ui-example-gallery__reset"
          >
            전체 예제 보기
          </button>
        </div>
      ) : (
        <div className="sh-ui-example-gallery__grid">
          {filtered.map((entry) => (
            <ExampleCard key={entry.slug} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
