"use client";

import type { ReactNode } from "react";
import { MonacoSandbox } from "./monaco-sandbox";
import {
  Tabs,
  TabsContent,
  TabsIndicator,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

/**
 * 컴포넌트 페이지 상단 라이브 데모용 wrapper.
 *
 * 모든 컴포넌트 페이지가 같은 패턴 (Monaco 에디터 + Sandpack preview + Flutter 정적 탭)
 * 을 반복하지 않도록 일반화. 페이지에서는 component source / styles / token / demo code
 * 만 prop 으로 넘기면 된다.
 *
 * 사용법 (server/page.tsx 측):
 *   import fs from 'node:fs';
 *   const dir = path.join(process.cwd(), 'components/ui/<name>');
 *   const source = fs.readFileSync(path.join(dir, 'index.tsx'), 'utf-8');
 *   const styles = fs.readFileSync(path.join(dir, 'styles.css'), 'utf-8');
 *   const tokens = fs.readFileSync(path.join(process.cwd(), 'app/styles/tokens.css'), 'utf-8');
 *   ...
 *   <ComponentSandbox
 *     componentName="badge"
 *     source={source}
 *     styles={styles}
 *     tokens={tokens}
 *     demoCode={DEMO_CODE}
 *     flutterPanel={<CodePanel language="dart" code={...} />}
 *   />
 */
export interface ComponentSandboxProps {
  /** import 경로 / virtual FS path 에 사용. "badge" → /components/ui/badge.tsx */
  componentName: string;
  /** 해당 컴포넌트의 index.tsx 풀 소스 */
  source: string;
  /** 해당 컴포넌트의 styles.css */
  styles: string;
  /** app/styles/tokens.css */
  tokens: string;
  /** 사용자에게 보이는 App.tsx 코드 (import + 사용 예) */
  demoCode: string;
  /** Flutter 탭 컨텐츠. 없으면 React 탭만 단독 렌더. */
  flutterPanel?: ReactNode;
  /** Sandpack 에디터 높이. 데모 코드 행 수에 맞춰 조정 가능. 기본 360. */
  editorHeight?: number;
}

const INDEX_TSX = `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./tokens.css";
import "./reset.css";
import App from "./App";

const root = createRoot(document.getElementById("root")!);
root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
`;

// Sandpack iframe 안의 body 여백 + 폰트 reset. tokens.css 의 변수를 활용.
const RESET_CSS = `*, *::before, *::after { box-sizing: border-box; }
html, body, #root { height: 100%; }
body {
  margin: 0;
  padding: 1.5rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  background-color: var(--background);
  color: var(--foreground);
}
`;

export function ComponentSandbox({
  componentName,
  source,
  styles,
  tokens,
  demoCode,
  flutterPanel,
  editorHeight = 360,
}: ComponentSandboxProps) {
  const sandbox = (
    <MonacoSandbox
      template="react-ts"
      activeFile="/App.tsx"
      visibleFiles={["/App.tsx"]}
      editorHeight={editorHeight}
      files={{
        "/App.tsx": demoCode,
        "/index.tsx": { code: INDEX_TSX, hidden: true },
        // sh-ui 실제 구조 (components/ui/<name>/index.tsx + styles.css) 그대로 옮긴다.
        // 평면화 시 index.tsx 안의 `import "./styles.css"` 가 외부 styles.css 와 충돌하므로
        // 디렉토리를 분리해야 한다.
        [`/components/ui/${componentName}/index.tsx`]: { code: source, hidden: true },
        [`/components/ui/${componentName}/styles.css`]: { code: styles, hidden: true },
        "/tokens.css": { code: tokens, hidden: true },
        "/reset.css": { code: RESET_CSS, hidden: true },
      }}
      // Monaco IntelliSense — 사용자가 App.tsx 에서 자동완성 받도록 컴포넌트 소스를
      // Monaco virtual FS 에 등록. import 경로와 path 가 매칭되어야 한다.
      typeDefs={[
        {
          path: `file:///components/ui/${componentName}/index.tsx`,
          content: source,
        },
      ]}
    />
  );

  // Flutter 탭이 없는 컴포넌트 (React 전용) 는 Tabs 없이 단독 렌더.
  if (!flutterPanel) return sandbox;

  return (
    <Tabs defaultValue="react">
      <TabsList>
        <TabsIndicator />
        <TabsTrigger value="react">React</TabsTrigger>
        <TabsTrigger value="flutter">Flutter</TabsTrigger>
      </TabsList>
      <TabsContent value="react">{sandbox}</TabsContent>
      <TabsContent value="flutter">{flutterPanel}</TabsContent>
    </Tabs>
  );
}
