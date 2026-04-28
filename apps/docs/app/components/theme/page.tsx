export const dynamic = "force-static";

import { CodePanel } from "@/components/ui/code-panel";
import { CodeTabs } from "@/components/code-tabs";
import { Preview } from "@/components/preview";
import { PropsTable } from "@/components/props-table";
import { ThemeBasicDemo } from "./_demos/basic";
import { ThemeControlledDemo } from "./_demos/controlled";

export default function ThemePage() {
  return (
    <main className="container">
      <h1>Theme</h1>
      <p className="muted">
        라이트/다크 테마를 관리하는 Provider. 쿠키로 영속화하여 SSR 시 FOUC 없이 테마를 적용한다.
      </p>

      <Preview>
        <Preview.Demo>
          <ThemeBasicDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "highlight",
              label: "강조",
              language: "tsx",
              code: `const { theme, toggleTheme } = useTheme();

<Button onClick={toggleTheme}>
  {theme === "dark" ? "☀ 라이트 모드로" : "🌙 다크 모드로"}
</Button>`,
            },
            {
              value: "full",
              label: "전체",
              language: "tsx",
              code: `"use client";

import { useTheme } from "@/components/ui/theme";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button onClick={toggleTheme}>
      {theme === "dark" ? "☀ 라이트 모드로" : "🌙 다크 모드로"}
    </Button>
  );
}`,
            },
          ]}
        />
      </Preview>

      <h2>Installation</h2>

      <h3>CLI</h3>
      <CodePanel language="bash" showLineNumbers={false} code={`npx sh-ui-cli add theme`} />

      <h3>Manual</h3>
      <p className="muted">
        registry에서 아래 파일을 <code>components/ui/theme/</code>로 복사한다.
      </p>
      <ul>
        <li><code>index.tsx</code></li>
      </ul>

      <h2>Usage</h2>
      <p className="muted">
        서버 컴포넌트(layout)에서 쿠키를 읽고 <code>ThemeProvider</code>에 초기 테마를 전달한다.
        이렇게 하면 SSR 시점에 올바른 테마가 적용되어 FOUC가 발생하지 않는다.
      </p>
      <CodePanel
        language="tsx"
        code={`// app/layout.tsx
import { cookies } from "next/headers";
import { ThemeProvider } from "@/components/ui/theme";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let isDark = false;
  try {
    const cookieStore = await cookies();
    isDark = cookieStore.get("sh-ui-theme")?.value === "dark";
  } catch {}

  return (
    <html lang="ko" className={isDark ? "dark" : ""}>
      <body>
        <ThemeProvider defaultTheme={isDark ? "dark" : "light"}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}`}
      />

      <CodePanel
        language="tsx"
        code={`// components/theme-toggle.tsx
"use client";

import { useTheme } from "@/components/ui/theme";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return <button onClick={toggleTheme}>{theme === "dark" ? "☀" : "🌙"}</button>;
}`}
      />

      <h2>Examples</h2>

      <h3>Controlled</h3>
      <p className="muted">
        외부에서 테마 상태를 직접 관리할 때 <code>theme</code> + <code>onThemeChange</code>를 사용한다.
      </p>
      <Preview>
        <Preview.Demo>
          <ThemeControlledDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "highlight",
              label: "강조",
              language: "tsx",
              code: `<ThemeProvider theme={theme} onThemeChange={setTheme}>
  <ThemeDisplay />
</ThemeProvider>`,
            },
            {
              value: "full",
              label: "전체",
              language: "tsx",
              code: `"use client";

import { useState } from "react";
import { ThemeProvider, useTheme } from "@/components/ui/theme";

function ThemeDisplay() {
  const { theme, setTheme } = useTheme();
  return (
    <>
      <button onClick={() => setTheme("light")}>Light</button>
      <button onClick={() => setTheme("dark")}>Dark</button>
      <span>현재: {theme}</span>
    </>
  );
}

export function App() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  return (
    <ThemeProvider theme={theme} onThemeChange={setTheme}>
      <ThemeDisplay />
    </ThemeProvider>
  );
}`,
            },
          ]}
        />
      </Preview>

      <h2>API Reference</h2>

      <h3>ThemeProvider</h3>
      <p className="muted">테마 상태를 관리한다. 앱 루트에 한 번만 둔다.</p>
      <PropsTable
        rows={[
          { prop: "defaultTheme", type: `"light" | "dark"`, default: `"light"`, description: "초기 테마. SSR 시 쿠키에서 읽은 값을 전달한다." },
          { prop: "theme", type: `"light" | "dark"`, description: "제어 모드. 외부에서 테마 상태를 직접 관리할 때." },
          { prop: "onThemeChange", type: "(theme: Theme) => void", description: "제어 모드용 테마 변경 콜백." },
          { prop: "children", type: "ReactNode", description: "자식 요소." },
        ]}
      />

      <h3>useTheme()</h3>
      <p className="muted">
        Provider 하위에서 테마 상태를 다룰 때 사용한다.
      </p>
      <PropsTable
        rows={[
          { prop: "theme", type: `"light" | "dark"`, description: "현재 테마." },
          { prop: "setTheme", type: "(theme: Theme) => void", description: "테마를 직접 설정한다." },
          { prop: "toggleTheme", type: "() => void", description: "라이트 ↔ 다크를 토글한다." },
        ]}
      />

      <h2>쿠키 기반 SSR</h2>
      <p className="muted">
        테마 전환 시 <code>sh-ui-theme</code> 쿠키에 값을 저장한다. 서버 컴포넌트에서 이 쿠키를 읽어
        <code> &lt;html className=&quot;dark&quot;&gt;</code>와 <code>defaultTheme</code>를 설정하면,
        클라이언트 스크립트 없이도 첫 렌더에서 올바른 테마가 적용된다.
      </p>
    </main>
  );
}
