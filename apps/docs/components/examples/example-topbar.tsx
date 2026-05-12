"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import type { ExampleCategory } from "@/examples/types";
import { ExampleSourcePanel } from "./example-source-panel";

export interface ExampleSource {
  path: string;
  node: ReactNode;
}

export interface ExampleTopBarProps {
  category: ExampleCategory;
  title: string;
  sources: ExampleSource[];
}

export function ExampleTopBar({ category, title, sources }: ExampleTopBarProps) {
  const [open, setOpen] = useState(false);
  return (
    <header className="sh-ui-showcase-topbar">
      <Link href="/examples" className="sh-ui-showcase-topbar__back">
        ← 갤러리로
      </Link>
      <div className="sh-ui-showcase-topbar__meta">
        <span className="sh-ui-showcase-topbar__cat">{category}</span>
        <h1 className="sh-ui-showcase-topbar__title">{title}</h1>
      </div>
      <div className="sh-ui-showcase-topbar__actions">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="sh-ui-showcase-topbar__code"
          onClick={() => setOpen(true)}
        >
          {"</>"} 코드 보기
        </Button>
      </div>
      <ExampleSourcePanel sources={sources} open={open} onOpenChange={setOpen} />
    </header>
  );
}
