"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "sh-ui-docs-theme";

export function DarkModeToggle() {
  const [dark, setDark] = useState(false);

  // 초기 마운트: localStorage 또는 현재 html.classList 상태로 동기화
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const initial = saved
      ? saved === "dark"
      : document.documentElement.classList.contains("dark");
    setDark(initial);
    document.documentElement.classList.toggle("dark", initial);
  }, []);

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
