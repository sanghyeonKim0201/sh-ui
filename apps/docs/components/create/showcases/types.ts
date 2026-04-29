import type { ComponentType, RefObject } from "react";

export type ShowcaseCategory =
  | "action"
  | "form"
  | "choice"
  | "display"
  | "overlay"
  | "navigation";

export const CATEGORY_LABELS: Record<ShowcaseCategory, string> = {
  action: "Action",
  form: "Form",
  choice: "Choice",
  display: "Display",
  overlay: "Overlay",
  navigation: "Navigation",
};

export const CATEGORY_ORDER: ShowcaseCategory[] = [
  "action",
  "form",
  "choice",
  "display",
  "overlay",
  "navigation",
];

export interface ShowcaseDemoProps {
  containerRef: RefObject<HTMLElement | null>;
}

export interface ShowcaseManifest {
  id: string;
  label: string;
  category: ShowcaseCategory;
  Demo: ComponentType<ShowcaseDemoProps>;
}
