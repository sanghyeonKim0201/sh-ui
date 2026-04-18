"use client";

import { useState } from "react";
import { ThemeProvider, useTheme } from "@/components/ui/theme";
import { Button } from "@/components/ui/button";

function ThemeDisplay() {
  const { theme, setTheme } = useTheme();

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
      <Button variant="secondary" onClick={() => setTheme("light")}>
        Light
      </Button>
      <Button variant="secondary" onClick={() => setTheme("dark")}>
        Dark
      </Button>
      <span className="muted">현재: {theme}</span>
    </div>
  );
}

export function ThemeControlledDemo() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  return (
    <ThemeProvider theme={theme} onThemeChange={setTheme}>
      <ThemeDisplay />
    </ThemeProvider>
  );
}
