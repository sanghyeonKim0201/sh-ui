import type { ComponentType } from "react";

export type ExampleCategory = "blocks" | "pages" | "flows" | "themes";

export interface ExampleMeta {
  slug: string;
  title: string;
  category: ExampleCategory;
  description: string;
}

export interface ExampleEntry extends ExampleMeta {
  Component: ComponentType;
  /** 쇼케이스 코드 패널에 노출할 파일들. `apps/docs/examples/`로부터의 상대 경로. */
  sourceFiles: string[];
}
