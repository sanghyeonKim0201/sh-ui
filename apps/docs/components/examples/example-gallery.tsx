"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { type KeyboardEvent, type ReactNode, useMemo } from "react";
import { Button } from "@/components/ui/button";
import type { ExampleCategory } from "@/examples/types";

const CATEGORIES: { value: ExampleCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "blocks", label: "Blocks" },
  { value: "pages", label: "Pages" },
  { value: "flows", label: "Flows" },
  { value: "themes", label: "Themes" },
];

export interface ExampleGalleryCard {
  slug: string;
  category: ExampleCategory;
  node: ReactNode;
}

export interface ExampleGalleryProps {
  cards: ExampleGalleryCard[];
}

export function ExampleGallery({ cards }: ExampleGalleryProps) {
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
        ? cards
        : cards.filter((c) => c.category === activeCat),
    [activeCat, cards],
  );

  const selectCategory = (next: ExampleCategory | "all") => {
    const q = new URLSearchParams(params);
    if (next === "all") q.delete("cat");
    else q.set("cat", next);
    const qs = q.toString();
    router.replace(qs ? `/examples?${qs}` : "/examples");
  };

  const reset = () => selectCategory("all");

  const handleTabKeyDown = (
    e: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    const lastIndex = CATEGORIES.length - 1;
    let nextIndex: number | null = null;
    if (e.key === "ArrowRight") {
      nextIndex = index === lastIndex ? 0 : index + 1;
    } else if (e.key === "ArrowLeft") {
      nextIndex = index === 0 ? lastIndex : index - 1;
    } else if (e.key === "Home") {
      nextIndex = 0;
    } else if (e.key === "End") {
      nextIndex = lastIndex;
    }
    if (nextIndex === null) return;
    e.preventDefault();
    selectCategory(CATEGORIES[nextIndex].value);
  };

  return (
    <div className="sh-ui-example-gallery">
      <div
        role="tablist"
        aria-label="예제 카테고리"
        className="sh-ui-example-gallery__tabs"
      >
        {CATEGORIES.map((c, index) => {
          const isActive = activeCat === c.value;
          return (
            <Button
              key={c.value}
              variant={isActive ? "primary" : "ghost"}
              size="sm"
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              className="sh-ui-example-gallery__tab"
              data-active={isActive ? "" : undefined}
              onClick={() => selectCategory(c.value)}
              onKeyDown={(e) => handleTabKeyDown(e, index)}
              type="button"
            >
              {c.label}
            </Button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="sh-ui-example-gallery__empty" role="status">
          <p>해당 카테고리의 예제가 아직 없습니다.</p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={reset}
            className="sh-ui-example-gallery__reset"
          >
            전체 예제 보기
          </Button>
        </div>
      ) : (
        <div className="sh-ui-example-gallery__grid">
          {filtered.map((card) => (
            <div key={card.slug}>{card.node}</div>
          ))}
        </div>
      )}
    </div>
  );
}
