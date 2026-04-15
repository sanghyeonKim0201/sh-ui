import type { ReactNode } from "react";
import "./preview.css";

export interface PreviewProps {
  children: ReactNode;
  className?: string;
}

export function Preview({ children, className }: PreviewProps) {
  const classes = ["sh-ui-preview", className].filter(Boolean).join(" ");
  return <div className={classes}>{children}</div>;
}

export interface PreviewDemoProps {
  children: ReactNode;
  className?: string;
}

function PreviewDemo({ children, className }: PreviewDemoProps) {
  const classes = ["sh-ui-preview__demo", className].filter(Boolean).join(" ");
  return <div className={classes}>{children}</div>;
}

Preview.Demo = PreviewDemo;
