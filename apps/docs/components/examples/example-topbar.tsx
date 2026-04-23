"use client";

import Link from "next/link";
import type { ExampleEntry } from "@/examples/types";

export interface ExampleSource {
  path: string;
  code: string;
  language: string;
}

export interface ExampleTopBarProps {
  entry: ExampleEntry;
  sources: ExampleSource[];
}

export function ExampleTopBar({ entry }: ExampleTopBarProps) {
  return (
    <header className="sh-ui-showcase-topbar">
      <Link href="/examples" className="sh-ui-showcase-topbar__back">
        ← 갤러리로
      </Link>
      <div className="sh-ui-showcase-topbar__meta">
        <span className="sh-ui-showcase-topbar__cat">{entry.category}</span>
        <h1 className="sh-ui-showcase-topbar__title">{entry.title}</h1>
      </div>
      <div className="sh-ui-showcase-topbar__actions">
        {/* Task 4에서 코드 보기 버튼 추가 */}
      </div>
    </header>
  );
}
