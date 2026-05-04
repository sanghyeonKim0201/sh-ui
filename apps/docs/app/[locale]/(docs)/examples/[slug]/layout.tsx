import type { ReactNode } from "react";
import "./showcase.css";

export default function ExampleShowcaseLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      className="sh-ui-showcase-root"
      role="dialog"
      aria-modal="true"
      aria-label="실전 예제 쇼케이스"
    >
      {children}
    </div>
  );
}
