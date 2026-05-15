"use client";

import { Sandpack, type SandpackFiles } from "@codesandbox/sandpack-react";
import "./sandbox-code.css";

export interface SandboxCodeProps {
  files: SandpackFiles;
  dependencies?: Record<string, string>;
  template?: "react-ts" | "react" | "vite-react-ts";
  editorHeight?: number;
  showTabs?: boolean;
  showLineNumbers?: boolean;
  /** 사용자에게 노출할 파일 경로. 비우면 hidden 이 아닌 모든 파일 노출. */
  visibleFiles?: string[];
  /** 처음 열릴 파일. 미지정이면 visibleFiles 의 첫 항목 또는 자동. */
  activeFile?: string;
}

/**
 * Sandpack 기반 인터랙티브 코드 샌드박스.
 *
 * react-live(단일 expression) 와 달리 실제 import / 멀티파일 / npm 의존성을 지원.
 * sh-ui 처럼 npm publish 되지 않는 copy-paste 형 컴포넌트는 컴포넌트 소스를
 * hidden file 로 함께 주입하면 진짜 import 가 동작한다.
 *
 *   <SandboxCode
 *     files={{
 *       "/App.tsx": appCode,
 *       "/components/ui/button.tsx": { code: buttonSrc, hidden: true },
 *       ...
 *     }}
 *   />
 */
export function SandboxCode({
  files,
  dependencies,
  template = "react-ts",
  editorHeight = 360,
  showTabs = false,
  showLineNumbers = true,
  visibleFiles,
  activeFile,
}: SandboxCodeProps) {
  return (
    <div className="sh-ui-sandbox-code">
      <Sandpack
        template={template}
        files={files}
        customSetup={dependencies ? { dependencies } : undefined}
        theme="dark"
        options={{
          showLineNumbers,
          showTabs,
          showInlineErrors: true,
          editorHeight,
          visibleFiles,
          activeFile,
        }}
      />
    </div>
  );
}
