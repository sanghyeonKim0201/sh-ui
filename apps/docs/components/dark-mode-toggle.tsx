"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "sh-ui-docs-theme";

const readInitialDark = () => {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("dark");
};

export function DarkModeToggle() {
  const [dark, setDark] = useState(readInitialDark);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
  };

  return (
    <Button variant="ghost" size="sm" onClick={toggle} aria-label="다크 모드 토글" aria-pressed={dark}>
      {dark ? "☀" : "🌙"}
    </Button>
  );
}
