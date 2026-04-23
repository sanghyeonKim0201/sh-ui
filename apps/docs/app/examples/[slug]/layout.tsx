import type { ReactNode } from "react";
import "./showcase.css";

export default function ExampleShowcaseLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <div className="sh-ui-showcase-root">{children}</div>;
}
