import { CodePanel } from "@/components/ui/code-panel";

export default function GettingStarted() {
  return (
    <main className="container">
      <h1>시작하기</h1>
      <p className="muted">프로젝트에 sh-ui을 도입하는 3단계.</p>

      <h2>1. 설정 파일 생성</h2>
      <p>프로젝트 루트에서:</p>
      <CodePanel language="bash" showLineNumbers={false} code={`npx sh-ui init`} />
      <p>
        대화형 프롬프트로 <code>platform</code>(react/flutter), <code>base</code>(neutral/zinc/slate), <code>radius</code>, <code>mode</code>를 선택하면 <code>sh-ui.config.json</code>이 만들어진다.
      </p>

      <h2>2. 토큰 설치</h2>
      <CodePanel language="bash" showLineNumbers={false} code={`npx sh-ui add tokens`} />
      <p>
        설정 값으로 치환된 토큰 파일이 생성된다. React는 CSS 변수(<code>tokens.css</code>), Flutter는 Dart 상수(<code>sh_ui_tokens.dart</code>).
      </p>

      <h2>3. 컴포넌트 설치</h2>
      <CodePanel language="bash" showLineNumbers={false} code={`npx sh-ui add button`} />
      <p>
        컴포넌트 소스가 <code>paths.components</code>로 복사된다. 이 시점부터 <strong>그 코드는 당신의 것</strong>이다 — 자유롭게 수정 가능.
      </p>

      <h2>React 설정 예시</h2>
      <CodePanel
        language="json"
        filename="sh-ui.config.json"
        code={`{
  "platform": "react",
  "theme": { "base": "neutral", "radius": "md", "mode": "light-dark" },
  "paths": {
    "tokens": "app/styles/tokens.css",
    "components": "components/ui"
  }
}`}
      />
      <p>
        그다음 <code>app/layout.tsx</code> 또는 전역 CSS에서 <code>tokens.css</code>를 임포트하면 <code>--background</code>, <code>--primary</code> 등의 변수가 전역에 노출된다.
      </p>

      <h2>다크 모드</h2>
      <p>
        <code>mode: &quot;light-dark&quot;</code>로 설정하면 기본(light)은 <code>:root</code>에, 다크는 <code>.dark</code> 클래스에 정의된다. <code>&lt;html className=&quot;dark&quot;&gt;</code> 토글만으로 전환된다.
      </p>
    </main>
  );
}
