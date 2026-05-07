export const dynamic = "force-static";

import { CodePanel } from "@/components/ui/code-panel";

export default function Foundations() {
  return (
    <main className="container">
      <h1>파운데이션</h1>
      <p className="muted">
        토큰과 컴포넌트 사이의 얇은 CSS 유틸리티 레이어. 컴포넌트가 공통으로 쓰는 변수·키프레임·리셋·z-index 스케일을
        한 번만 설치해두면 나머지 컴포넌트가 그 위에서 일관되게 동작한다. 모두 <code>sh-ui add &lt;name&gt;</code> 로 개별 설치 가능.
      </p>

      <h2>animations</h2>
      <p className="muted">
        Sidebar drawer · Dialog · Toast 같은 컴포넌트가 공유하는 공용 키프레임과 ease 변수. 컴포넌트별로 개별 keyframes 를
        만들지 않고 이 파일을 한 번만 import 하면 모두 같은 곡선·길이로 움직인다.
      </p>
      <CodePanel
        language="bash"
        filename="terminal"
        code={`npx sh-ui-cli add animations`}
      />
      <p>
        제공하는 변수: <code>--ease-duration</code> · <code>--ease-out</code> · <code>--ease-in-out</code>.
        제공하는 keyframes: <code>sh-ui-fade-in/out</code>, <code>sh-ui-slide-in-from-left/right/top/bottom</code>,
        <code> sh-ui-scale-in/out</code> 등.
      </p>
      <CodePanel
        language="css"
        filename="my-sheet.css"
        code={`.my-sheet[data-state="open"] {
  animation: sh-ui-slide-in-from-left var(--ease-duration) var(--ease-out);
}`}
      />

      <h2>base</h2>
      <p className="muted">
        모바일 안전 기본값 + 공통 리셋. <code>tokens.css</code> 바로 뒤에 import 한다.
      </p>
      <CodePanel
        language="bash"
        filename="terminal"
        code={`npx sh-ui-cli add base`}
      />
      <ul>
        <li><strong>box-sizing: border-box</strong> 전역 — padding 이 width 를 늘리지 않음</li>
        <li><strong>html / body 마진 0</strong></li>
        <li><strong>모바일 가로 오버플로 가드</strong> — <code>main / section / article</code> 에 <code>min-width: 0</code>. 자식 min-content 가 뷰포트를 밀어내 가로 스크롤이 생기는 사고를 차단</li>
        <li><strong>미디어 요소 최대폭 제한</strong> — <code>img · video · svg</code> 가 부모를 넘치지 않도록</li>
      </ul>
      <p className="muted">
        <code>body</code> 에 <code>overflow-x: hidden</code> 을 거는 흔한 처방은 <code>position: sticky</code> 자식을
        고장내기 때문에 base 는 그 함정을 피하는 방식으로 짜여 있다.
      </p>
      <CodePanel
        language="css"
        filename="globals.css"
        code={`@import "./styles/tokens.css";
@import "./styles/base.css";`}
      />

      <h2>breakpoints</h2>
      <p className="muted">
        반응형 경계값을 토큰 형태로 노출. CSS <code>@media</code> 는 <code>var()</code> 를 받지 못하기 때문에 미디어
        쿼리에는 <strong>값을 직접</strong> 적고, 변수는 문서·계산용으로만 쓴다.
      </p>
      <CodePanel
        language="bash"
        filename="terminal"
        code={`npx sh-ui-cli add breakpoints`}
      />
      <CodePanel
        language="css"
        filename="breakpoints.css"
        code={`:root {
  --bp-sm: 40rem;   /* 640px  — 모바일 경계 */
  --bp-md: 48rem;   /* 768px  — 태블릿 경계 */
  --bp-lg: 64rem;   /* 1024px — 데스크탑 경계 */
  --bp-xl: 80rem;   /* 1280px — 와이드 경계 */
}

/* 미디어 쿼리에는 값을 직접 적는다 */
@media (min-width: 48rem)  { /* md+ */ }
@media (min-width: 64rem)  { /* lg+ */ }`}
      />

      <h2>focus-ring</h2>
      <p className="muted">
        모든 인터랙티브 요소에 일관된 키보드 포커스 스타일. <code>:focus-visible</code> 만 트리거되어 마우스 클릭에는
        링이 뜨지 않는다 (WCAG 2.4.7).
      </p>
      <CodePanel
        language="bash"
        filename="terminal"
        code={`npx sh-ui-cli add focus-ring`}
      />
      <p>
        제공하는 변수: <code>--focus-ring-color</code> · <code>--focus-ring-width</code> · <code>--focus-ring-offset</code>.
        제공하는 클래스: <code>.sh-ui-focus</code> (또는 <code>[data-focus-ring]</code>) · <code>.sh-ui-focus--inset</code>.
      </p>
      <CodePanel
        language="tsx"
        filename="my-button.tsx"
        code={`<button className="sh-ui-focus">키보드 포커스 시 outline 이 자동으로 그려진다</button>`}
      />

      <h2>z-index</h2>
      <p className="muted">
        레이어 충돌을 방지하기 위한 의미적 z-index 토큰. 값 자체보다 <strong>의미</strong>로 참조한다 — 새 모달이 늘어도
        스케일 정책은 한 곳에서 관리.
      </p>
      <CodePanel
        language="bash"
        filename="terminal"
        code={`npx sh-ui-cli add z-index`}
      />
      <CodePanel
        language="css"
        filename="z-index.css"
        code={`:root {
  --z-base:     0;
  --z-sticky:   100;   /* sticky header, sidebar */
  --z-dropdown: 200;   /* select / menu 팝업 */
  --z-overlay:  300;   /* modal / sheet 배경 dimmer */
  --z-modal:    400;   /* modal / dialog / sheet 본체 */
  --z-popover:  500;   /* popover, tooltip 컨테이너 */
  --z-toast:    600;   /* 알림 */
  --z-tooltip:  700;
}`}
      />
      <p className="muted">
        스케일 시각화 표는 <a href="/tokens">토큰 페이지</a> 의 Z-index 섹션 참고.
      </p>
    </main>
  );
}
