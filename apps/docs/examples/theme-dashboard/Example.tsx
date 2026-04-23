"use client";

import { useState } from "react";
import { Example as SaasDashboard } from "../saas-dashboard/Example";
import "./example.css";

type ThemeKey = "cobalt" | "mint" | "amber";
const THEMES: { key: ThemeKey; label: string }[] = [
  { key: "cobalt", label: "Cobalt" },
  { key: "mint", label: "Mint" },
  { key: "amber", label: "Amber" },
];

export function Example() {
  const [theme, setTheme] = useState<ThemeKey>("cobalt");
  return (
    <div className="sh-ui-ex-theme-dash" data-example-theme={theme}>
      <div className="sh-ui-ex-theme-dash__toolbar" role="tablist" aria-label="브랜드 토큰">
        {THEMES.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={theme === t.key}
            className="sh-ui-ex-theme-dash__toggle"
            data-active={theme === t.key ? "" : undefined}
            onClick={() => setTheme(t.key)}
            type="button"
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="sh-ui-ex-theme-dash__canvas">
        <SaasDashboard />
      </div>
    </div>
  );
}
