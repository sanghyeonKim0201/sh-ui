"use client";

import { LiveProvider, LiveEditor, LivePreview, LiveError } from "react-live";
import { themes } from "prism-react-renderer";
import { useId } from "react";
import "./live-code.css";

export interface LiveCodeProps {
  code: string;
  /** 코드 안에서 참조할 컴포넌트 / 값. 예: { Button, Card }. JSX 만 평가되므로 import 문은 안 됨. */
  scope?: Record<string, unknown>;
  /** noInline=true 면 마지막 expression 만 평가. false (디폴트) 면 JSX expression 자체를 평가. */
  noInline?: boolean;
  language?: "tsx" | "jsx";
}

/**
 * 인라인 라이브 코드 에디터 — react-live.
 *
 * Preview + Editor + Error 세 영역. 사용자가 editor 안에서 코드 편집하면 preview 즉시 re-render.
 * sh-ui 컴포넌트는 props 의 scope 로 주입 (import 안 됨 — react-live 는 단일 expression).
 *
 * sh-ui scope 컨벤션: 컴포넌트 페이지 안에서 import 한 컴포넌트들을 객체로 묶어 전달.
 *   <LiveCode code="<Button>Save</Button>" scope={{ Button }} />
 *
 * 다중 컴포넌트 / 상태 필요한 데모는 noInline=true + render() 호출:
 *   <LiveCode noInline code={`
 *     const Demo = () => { const [c, set] = React.useState(0); return <Button onClick={() => set(c+1)}>{c}</Button> }
 *     render(<Demo />);
 *   `} scope={{ React, Button }} />
 */
export function LiveCode({ code, scope, noInline = false, language = "tsx" }: LiveCodeProps) {
  const id = useId();
  return (
    <LiveProvider code={code} scope={scope} noInline={noInline} language={language}>
      <div className="sh-ui-live-code">
        <div className="sh-ui-live-code__preview" aria-label="라이브 미리보기" id={`${id}-preview`}>
          <LivePreview />
        </div>
        <div className="sh-ui-live-code__editor" aria-label="코드 편집기" id={`${id}-editor`}>
          <LiveEditor theme={themes.vsDark as never} />
        </div>
        <LiveError className="sh-ui-live-code__error" />
      </div>
    </LiveProvider>
  );
}
