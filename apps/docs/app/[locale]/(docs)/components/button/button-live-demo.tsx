"use client";

import { CodePanel } from "@/components/ui/code-panel";
import { SandboxCode } from "@/components/sandbox-code";
import {
  Tabs,
  TabsContent,
  TabsIndicator,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface Props {
  buttonSource: string;
  buttonStyles: string;
  tokensCss: string;
}

const APP_TSX = `import { Button } from "./components/ui/button";

export default function App() {
  return (
    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
      <Button>저장</Button>
      <Button variant="secondary">취소</Button>
      <Button variant="ghost">더보기</Button>
      <Button variant="danger">삭제</Button>
    </div>
  );
}
`;

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

// Sandpack iframe 안의 기본 body 여백 / 폰트 리셋. tokens.css 만으로는 부족.
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

/**
 * Button 페이지 상단 라이브 데모.
 *
 * Sandpack 으로 실제 import / 멀티파일을 보여준다. 사용자가 보는 건 App.tsx 한 파일이지만
 * Button 컴포넌트 소스 / 스타일 / 토큰 css 는 hidden file 로 함께 주입돼 진짜 import 가 동작한다.
 * 부모(server) 가 fs 로 읽어 prop 으로 넘기므로 sh-ui 단일 소스(apps/docs/components/ui/button) 와 자동 동기화.
 */
export function ButtonLiveDemo({ buttonSource, buttonStyles, tokensCss }: Props) {
  return (
    <Tabs defaultValue="react">
      <TabsList>
        <TabsIndicator />
        <TabsTrigger value="react">React</TabsTrigger>
        <TabsTrigger value="flutter">Flutter</TabsTrigger>
      </TabsList>
      <TabsContent value="react">
        <SandboxCode
          template="react-ts"
          activeFile="/App.tsx"
          visibleFiles={["/App.tsx"]}
          editorHeight={320}
          files={{
            "/App.tsx": APP_TSX,
            "/index.tsx": { code: INDEX_TSX, hidden: true },
            "/components/ui/button.tsx": { code: buttonSource, hidden: true },
            "/components/ui/styles.css": { code: buttonStyles, hidden: true },
            "/tokens.css": { code: tokensCss, hidden: true },
            "/reset.css": { code: RESET_CSS, hidden: true },
          }}
        />
      </TabsContent>
      <TabsContent value="flutter">
        <CodePanel
          language="dart"
          code={`ShUiButton(
  onPressed: () {},
  child: const Text('저장'),
)`}
        />
      </TabsContent>
    </Tabs>
  );
}
