"use client";

import { useEffect, useRef, useState } from "react";
import { Editor, type Monaco } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackPreview,
  useActiveCode,
  useSandpack,
  type SandpackFiles,
} from "@codesandbox/sandpack-react";
import "./sandbox-code.css";

export interface TypeDef {
  /** Monaco virtual filesystem 경로 (예: "file:///components/ui/button.tsx"). */
  path: string;
  /** .d.ts 또는 .tsx 풀 텍스트. */
  content: string;
}

export interface MonacoSandboxProps {
  files: SandpackFiles;
  dependencies?: Record<string, string>;
  template?: "react-ts" | "react";
  visibleFiles?: string[];
  activeFile?: string;
  /** Monaco IntelliSense 용 추가 타입 정의. button.tsx 자체나 .d.ts. */
  typeDefs?: TypeDef[];
  editorHeight?: number;
}

/**
 * Sandpack + Monaco — VSCode 급 자동완성 / hover docs / 타입체크 인 페이지.
 *
 * Sandpack 기본 CodeMirror 는 가벼운 대신 IntelliSense 가 없다. 본 컴포넌트는
 * SandpackProvider 안에 커스텀 Monaco 에디터를 박아 Monaco 의 TS 서비스를 활용한다.
 * useActiveCode + useSandpack 으로 Monaco ↔ Sandpack 의 file state 를 양방향 동기화.
 *
 * IntelliSense 를 위해 typeDefs 로 컴포넌트 소스 / .d.ts 를 넘기면 Monaco 의
 * virtual filesystem 에 등록돼 자동완성 / 시그니처 힌트 / hover docs 가 동작한다.
 */
export function MonacoSandbox({
  files,
  dependencies,
  template = "react-ts",
  visibleFiles,
  activeFile,
  typeDefs,
  editorHeight = 360,
}: MonacoSandboxProps) {
  return (
    <div className="sh-ui-sandbox-code sh-ui-sandbox-code--monaco">
      <SandpackProvider
        template={template}
        files={files}
        customSetup={dependencies ? { dependencies } : undefined}
        theme="dark"
        options={{
          visibleFiles,
          activeFile,
        }}
      >
        <SandpackLayout style={{ height: editorHeight }}>
          <MonacoEditorPane typeDefs={typeDefs} />
          <SandpackPreview
            style={{ flex: 1, minWidth: 0, height: "100%" }}
            showOpenInCodeSandbox={true}
            showRefreshButton={true}
          />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}

function MonacoEditorPane({ typeDefs }: { typeDefs?: TypeDef[] }) {
  const { code, updateCode } = useActiveCode();
  const { sandpack } = useSandpack();
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  // 현재 active 파일의 확장자로 Monaco language 결정.
  const language = inferLanguage(sandpack.activeFile);

  function handleMount(ed: editor.IStandaloneCodeEditor, monaco: Monaco) {
    editorRef.current = ed;

    const ts = monaco.languages.typescript;
    ts.typescriptDefaults.setCompilerOptions({
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.ESNext,
      jsx: ts.JsxEmit.ReactJSX,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      isolatedModules: true,
      strict: true,
      noEmit: true,
      skipLibCheck: true,
    });
    ts.typescriptDefaults.setEagerModelSync(true);
    ts.typescriptDefaults.setDiagnosticsOptions({
      // 시멘틱 진단은 끔 — React/Node 타입을 inject 하지 않은 가상 FS 환경에서 false positive 가
      // 너무 많다 (ButtonHTMLAttributes 못찾음, 모듈 못찾음 등). IntelliSense (자동완성, hover, 시그니처)
      // 는 별개 서비스라 진단을 꺼도 동작한다.
      noSemanticValidation: true,
      noSyntaxValidation: false,
      noSuggestionDiagnostics: false,
    });

    if (typeDefs) {
      for (const def of typeDefs) {
        ts.typescriptDefaults.addExtraLib(def.content, def.path);
      }
    }
  }

  return (
    <div style={{ flex: 1, minWidth: 0, height: "100%" }}>
      <Editor
        height="100%"
        language={language}
        theme="vs-dark"
        path={sandpack.activeFile}
        value={code}
        onChange={(value) => updateCode(value ?? "")}
        onMount={handleMount}
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: "on",
          padding: { top: 12, bottom: 12 },
        }}
      />
    </div>
  );
}

function inferLanguage(file: string): string {
  if (file.endsWith(".tsx")) return "typescript";
  if (file.endsWith(".ts")) return "typescript";
  if (file.endsWith(".jsx")) return "javascript";
  if (file.endsWith(".js")) return "javascript";
  if (file.endsWith(".css")) return "css";
  if (file.endsWith(".json")) return "json";
  if (file.endsWith(".html")) return "html";
  return "plaintext";
}
