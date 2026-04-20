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
      </ol>

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