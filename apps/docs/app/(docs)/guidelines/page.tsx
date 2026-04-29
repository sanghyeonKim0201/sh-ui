export const dynamic = "force-static";

import { CodePanel } from "@/components/ui/code-panel";

export default function Guidelines() {
  return (
    <main className="container">
      <h1>가이드라인</h1>
      <p className="muted">sh-ui을 만들고 확장할 때의 원칙.</p>

      <h2>토큰 사용 규칙</h2>
      <ol>
        <li><strong>Primitive 직접 참조 금지</strong> — 컴포넌트는 오직 semantic만 쓴다. <code>var(--neutral-900)</code> ❌ / <code>var(--foreground)</code> ✓</li>
        <li><strong>semantic 이름은 용도로</strong> — <code>--brand-dark</code> 같은 값-기반 네이밍 대신 <code>--primary</code>, <code>--danger</code> 같은 역할 기반.</li>
        <li><strong>새 semantic은 신중히</strong> — 기존 3~4개 조합으로 표현 가능한 것은 추가하지 않는다. 테마 설계 복잡도가 기하급수적으로 늘어남.</li>
      </ol>

      <h2>컴포넌트 작성 규칙</h2>
      <ol>
        <li><strong>플랫폼 관용구 따르기</strong> — React는 React답게, Flutter는 Flutter답게. 억지 추상화 금지.</li>
        <li><strong>외부 UI 라이브러리 의존 최소화</strong> — 사용자가 소스를 복사해 쓴다. 그 코드가 대량의 의존성을 끌어오면 안 된다.</li>
        <li><strong>컴포넌트는 semantic 토큰만 참조</strong> — hex 하드코딩, primitive 직접 접근 금지.</li>
        <li><strong>접근성은 기본값</strong> — <code>:focus-visible</code>, 적절한 ARIA, 키보드 네비게이션을 v0부터 포함.</li>
        <li><strong>스타일 오버라이드는 네이티브 CSS 경로로</strong> — 모든 컴포넌트 루트는 <code>style</code>·<code>className</code>·<code>data-*</code> 를 그대로 받는다. 컴포넌트 전용 CSS 변수는 정말 불가피할 때만(아래 참조).</li>
      </ol>

      <h2>스타일 오버라이드 노출 방식</h2>
      <p>
        sh-ui 컴포넌트는 사용자에게 스타일 커스터마이즈를 허용할 때 <strong>네이티브 CSS
        경로(<code>style</code> · <code>className</code> · <code>data-*</code>)</strong> 를
        기본으로 연다. 컴포넌트 이름이 붙은 CSS 변수(<code>--sh-ui-foo-bar</code>)는
        가능한 한 만들지 않는다. 변수가 늘어날수록 사용자가 외울 이름이 생기고, TS
        cast(<code>as React.CSSProperties</code>) 부담도 따라온다.
      </p>
      <p>
        디자인 토큰(<code>--space-*</code>, <code>--color-*</code>, <code>--text-*</code>
        등)은 이 원칙의 예외가 아니라 본질이다. 여기서 말하는 건 <em>개별 컴포넌트가
        자기 이름을 단 변수를 새로 만드는 경우</em> 다.
      </p>

      <h3>우선순위</h3>
      <ol>
        <li><code>style</code> / <code>className</code> / <code>data-*</code> / <code>aria-*</code> — 모든 컴포넌트 루트가 통과시킨다 (<code>HTMLAttributes</code> 확장).</li>
        <li>의미 있는 prop (<code>variant</code>, <code>size</code>, <code>tone</code> 등) — 이름 있는 선택지로 열어야 하는 축.</li>
        <li>컴포넌트 전용 CSS 변수 — 1·2 로 안 되는 아래 "불가피한 경우"에만.</li>
      </ol>

      <h3>CSS 변수가 정당한 경우 (예외)</h3>
      <ul>
        <li><strong>Pseudo-element 에 동적 값 전달</strong> — <code>::before</code> / <code>::after</code> 는 인라인 <code>style</code> 로 닿을 수 없다. 부모에 변수 세팅 후 <code>var(...)</code> 참조가 유일한 방법.</li>
        <li><strong>테마 / 모드 / <code>data-state</code> 전환</strong> — 같은 이름이 컨텍스트에 따라 다른 값을 가져야 할 때.</li>
        <li><strong>여러 CSS rule 에서 같은 값 재사용 (DRY)</strong> — <code>:hover</code>, <code>:focus-visible</code>, <code>::after</code>, 자식 선택자 등에 동일 값이 반복.</li>
        <li><strong>Cascade 로 다수 후손에 일괄 전파가 상시 요구</strong> — 부모 1회 지정으로 중첩 자식 다수가 읽어야 할 때 (<code>style</code> per-level 로 대체 가능하면 변수 불필요).</li>
        <li><strong>런타임 JS 값이 pseudo / 복수 rule 에 반영</strong> — 단일 요소 단일 속성이면 <code>{`style={{ width: x }}`}</code> 면 끝.</li>
      </ul>

      <p className="muted">
        자세한 원칙은 <code>.ai/rules/ui/component-api.md</code> 의 "스타일 오버라이드
        노출 방식" 섹션 참조.
      </p>

      <h2>스타일 커스터마이즈 (사용자 가이드)</h2>
      <p>아래 4가지 경로 중 가장 간단한 것을 선택한다.</p>

      <h3>1. <code>style</code> prop 으로 직접</h3>
      <CodePanel
        language="tsx"
        showLineNumbers={false}
        code={`// 컨테이너 간격
<Form style={{ gap: "2rem" }}>

// 필드 내부 (label/control/error) 간격
<Form.Field name="email" style={{ gap: "0.5rem" }}>

// 임의의 CSS 속성
<Card style={{ padding: "2rem", borderRadius: "1rem" }}>`}
      />

      <h3>2. <code>className</code> 으로 utility 클래스</h3>
      <CodePanel
        language="tsx"
        showLineNumbers={false}
        code={`// Tailwind 등
<Form className="gap-8">
<Card className="p-8 rounded-xl shadow-lg">`}
      />

      <h3>3. 외부 CSS 로 후손 일괄 적용</h3>
      <CodePanel
        language="css"
        showLineNumbers={false}
        code={`/* 한 Form 안의 모든 Field 의 내부 간격을 일괄 조정 */
.my-form .sh-ui-form-field { gap: 0.5rem; }

/* 특정 Card 만 다크 톤 */
.dark-card.sh-ui-card { background: var(--background-strong); }`}
      />
      <CodePanel
        language="tsx"
        showLineNumbers={false}
        code={`<Form className="my-form">
<Card className="dark-card">`}
      />

      <h3>4. 토큰 자체를 바꾸기 (전역)</h3>
      <p>
        프로젝트 전체에서 색·간격·폰트 등을 일괄 변경하려면 <code>tokens.css</code> 의
        semantic 토큰을 덮어쓴다. 자세한 내용은 <a href="/theming">테마</a> 페이지 참조.
      </p>

      <h2>클래스명 레퍼런스</h2>
      <p>
        외부 CSS 로 컴포넌트를 타게팅할 때 사용. <strong>이 이름들은 공개 API 가
        아니다</strong> — 메이저 버전에서 변경될 수 있으므로 가능하면 <code>className</code>
        prop 으로 자체 클래스를 부여하고 그걸 셀렉터로 쓰는 걸 권장한다.
      </p>
      <CodePanel
        language="text"
        showLineNumbers={false}
        code={`Form 계열
  .sh-ui-form              — Form 루트
  .sh-ui-form-section      — Form.Section
  .sh-ui-form-field        — Form.Field
  .sh-ui-form-error        — Form.Error

Card 계열
  .sh-ui-card              — Card 루트
  .sh-ui-card__header      — Card.Header (BEM 변형)
  .sh-ui-card__body        — Card.Body
  .sh-ui-card__footer      — Card.Footer

CodePanel 계열
  .sh-ui-code              — CodePanel 루트
  .sh-ui-code__header      — CodePanel.Header
  .sh-ui-code__body        — CodePanel.Body
  .sh-ui-code__filename    — CodePanel.Filename

ColorPicker 계열
  .sh-ui-color-picker      — ColorPicker 루트
  .sh-ui-color-picker__sv  — Saturation/Value 영역
  .sh-ui-color-picker__hue — Hue 슬라이더
  .sh-ui-color-picker__alpha — Alpha 슬라이더

FileUpload 계열
  .sh-ui-file-upload                — FileUpload 루트
  .sh-ui-file-upload__dropzone      — Dropzone
  .sh-ui-file-upload__input         — 숨김 input

Sidebar 계열
  .sh-ui-sidebar           — Sidebar 루트 (cascade 변수 --sidebar-* 보유)
  .sh-ui-sidebar__menu     — Menu 컨테이너

전체 클래스 이름은 각 컴포넌트의 styles.css 참조.`}
      />

      <h2>마이그레이션 — v0.19 → v0.20</h2>
      <p>
        v0.20 에서 Form 계열에 기본 세로 flex 레이아웃이 적용되었다. 기존 코드는
        그대로 동작하지만 다음 정리가 권장된다.
      </p>
      <ul>
        <li>
          <strong>수동 <code>marginTop</code> 제거</strong> — Form.Field 와 제출 버튼
          사이에 넣었던 <code>{`<div style={{ marginTop: "var(--space-3)" }}>`}</code>
          같은 래퍼는 이제 불필요. 기본 <code>gap</code> 이 정렬해준다.
        </li>
        <li>
          <strong>v0.19 prerelease 에서 잠시 노출됐던 <code>--sh-ui-form-gap</code>
          계열 CSS 변수는 정식 v0.20 에 포함되지 않음</strong> — 사용 중이었다면
          <code>style={`{{ gap: "..." }}`}</code> 로 전환.
        </li>
      </ul>
      <CodePanel
        language="tsx"
        showLineNumbers={false}
        code={`// Before (v0.19)
<Form>
  <Form.Field name="email">
    <Form.Label>이메일</Form.Label>
    <Form.Control><Input /></Form.Control>
    <Form.Error />
  </Form.Field>
  <div style={{ marginTop: "var(--space-3)" }}>
    <Button type="submit">제출</Button>
  </div>
</Form>

// After (v0.20) — 수동 마진 제거, 기본 gap 이 정렬
<Form>
  <Form.Field name="email">
    <Form.Label>이메일</Form.Label>
    <Form.Control><Input /></Form.Control>
    <Form.Error />
  </Form.Field>
  <Button type="submit">제출</Button>
</Form>`}
      />

      <h2>새 컴포넌트 추가 절차</h2>
      <ol>
        <li><code>packages/registry/&lt;platform&gt;/</code>에 소스 추가</li>
        <li>해당 플랫폼의 <code>registry.json</code>에 항목 등록 (files, registryDependencies)</li>
        <li>이 문서 사이트(<code>apps/docs/app/components/&lt;name&gt;/page.tsx</code>)에 데모 페이지 작성</li>
        <li>CLI로 dogfooding: <code>apps/docs</code>에서 <code>sh-ui add &lt;name&gt;</code> 실행 → 정상 설치 확인</li>
      </ol>

      <h2>접근성 · 대비</h2>
      <p>모든 색 토큰은 WCAG 2.1 AA 기준으로 감사된다.</p>
      <ul>
        <li><strong>본문 텍스트</strong>: <code>foreground</code> / <code>foreground-muted</code> × 모든 <code>background*</code> 조합에서 4.5:1 이상</li>
        <li><strong>버튼 텍스트</strong>: <code>primary-foreground × primary/primary-hover</code>, <code>danger-foreground × danger</code> 4.5:1 이상</li>
        <li>
          <strong>보더</strong>: <code>border</code>·<code>border-strong</code>은 의도적으로 subtle(&lt;3:1). 컴포넌트 식별은 shadow·여백·라벨로, 포커스 인디케이터는 <code>foreground</code> 색 outline으로 19:1+ 대비 확보 (WCAG 2.4.11 충족)
        </li>
      </ul>
      <p>
        감사 스크립트: <code>pnpm --filter @sh-ui/tokens audit:contrast</code>. 3개 base(neutral / zinc / slate) × 2 mode 조합에서 주요 쌍의 대비를 계산해 미달이면 exit 1.
      </p>

      <h2>브레이킹 체인지</h2>
      <ul>
        <li>토큰 이름 변경, 컴포넌트 props 제거 = 메이저 버전</li>
        <li>사용자는 복사한 코드를 이미 수정했을 수 있다. 자동 마이그레이션은 기대하지 말고, 릴리스 노트에서 변경점을 명시한다.</li>
      </ul>

      <h2>리포지토리 구조</h2>
      <CodePanel
        language="text"
        showLineNumbers={false}
        code={`sh-ui-design-system/
├── packages/
│   ├── tokens/     # primitive + semantic 정의, CSS/Dart 빌드
│   ├── registry/   # 플랫폼별 컴포넌트 소스 (복사 대상)
│   │   ├── react/
│   │   └── flutter/
│   └── cli/        # sh-ui init / sh-ui add
└── apps/
    └── docs/       # 이 문서 사이트 (CLI dogfooding 겸)`}
      />
    </main>
  );
}