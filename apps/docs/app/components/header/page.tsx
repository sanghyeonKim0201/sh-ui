export const dynamic = "force-static";

import {
  Header,
  HeaderActions,
  HeaderBrand,
  HeaderItem,
  HeaderLogo,
  HeaderMenu,
  HeaderMenuContent,
  HeaderMenuTrigger,
  HeaderNav,
  HeaderNavGroup,
  HeaderTitle,
  HeaderTrigger,
} from "@/components/ui/header";
import { Button } from "@/components/ui/button";
import { CodePanel } from "@/components/ui/code-panel";
import { CodeTabs } from "@/components/code-tabs";
import { Preview } from "@/components/preview";

export default function HeaderPage() {
  return (
    <main className="container">
      <h1>Header</h1>
      <p className="muted">
        상단 네비게이션 바. 데스크탑에선 가로 네비, 모바일(<code>{"<"} 768px</code>)에선 햄버거 + drawer로 자동 전환. Compound 패턴으로 구성.
      </p>

      <Preview>
        <Preview.Demo>
          <div style={{ width: "100%", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
            <Header>
              <HeaderTrigger />
              <HeaderBrand>
                <HeaderLogo>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
                  </svg>
                </HeaderLogo>
                <HeaderTitle>sh-ui</HeaderTitle>
              </HeaderBrand>
              <HeaderNav>
                <HeaderItem href="#" active>홈</HeaderItem>
                <HeaderItem href="#">문서</HeaderItem>
                <HeaderItem href="#">컴포넌트</HeaderItem>
                <HeaderItem href="#">가격</HeaderItem>
              </HeaderNav>
              <HeaderActions>
                <Button variant="secondary" size="sm">로그인</Button>
              </HeaderActions>
            </Header>
          </div>
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<Header>
  <HeaderTrigger />
  <HeaderBrand>
    <HeaderLogo><LogoIcon /></HeaderLogo>
    <HeaderTitle>sh-ui</HeaderTitle>
  </HeaderBrand>
  <HeaderNav>
    <HeaderItem href="/" active>홈</HeaderItem>
    <HeaderItem href="/docs">문서</HeaderItem>
    <HeaderItem href="/pricing">가격</HeaderItem>
  </HeaderNav>
  <HeaderActions>
    <Button variant="secondary" size="sm">로그인</Button>
  </HeaderActions>
</Header>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `// Flutter는 prop-based API.
ShUiHeader(
  logo: Icon(Icons.hexagon_outlined),
  title: 'sh-ui',
  items: [
    ShUiHeaderItem(label: '홈', isActive: true, onTap: () {}),
    ShUiHeaderItem(label: '문서', onTap: () {}),
    ShUiHeaderItem(label: '가격', onTap: () {}),
  ],
  trailing: [
    ShUiButton(label: '로그인', size: ShUiButtonSize.sm),
  ],
)`,
            },
          ]}
        />
      </Preview>

      <h2>Installation</h2>
      <CodeTabs
        items={[
          { value: "react", label: "React", language: "bash", code: "npx sh-ui add header" },
          { value: "flutter", label: "Flutter", language: "bash", code: "npx sh-ui add header" },
        ]}
      />

      <h2>Compound 구조</h2>
      <p>
        React 쪽 Header는 compound components로 조립한다. 각 파트가 독립 요소라 자유롭게 배치·스타일링할 수 있다.
      </p>
      <ul>
        <li><code>Header</code> — 루트. drawer 열림 state 제공 (Context)</li>
        <li><code>HeaderTrigger</code> — 햄버거 버튼. 모바일에서만 표시</li>
        <li><code>HeaderBrand</code> — 로고 + 타이틀 그룹</li>
        <li><code>HeaderLogo</code>, <code>HeaderTitle</code> — 브랜드 슬롯</li>
        <li><code>HeaderNav</code> — 네비 컨테이너 (모바일에선 drawer로 이동)</li>
        <li><code>HeaderItem</code> — 네비 링크 (<code>active</code> prop)</li>
        <li><code>HeaderActions</code> — 우측 트레일링 (항상 헤더에 유지)</li>
      </ul>

      <h2>반응형 동작</h2>
      <p>
        <code>@media (max-width: 767px)</code> 기준으로 CSS가 자동 전환.
      </p>
      <ul>
        <li><strong>데스크탑</strong>: <code>HeaderNav</code> 가로 나열, <code>HeaderTrigger</code> 숨김</li>
        <li><strong>모바일</strong>: <code>HeaderNav</code> 숨김, <code>HeaderTrigger</code> 좌측 노출. 클릭하면 backdrop(blur 8px) + 좌측 slide drawer가 열리면서 같은 <code>HeaderNav</code> children이 세로 리스트로 재렌더</li>
        <li>아이템 클릭 / backdrop 클릭 시 drawer 자동 닫힘</li>
      </ul>

      <h2>접근성</h2>
      <p>drawer 가 열릴 때 다음이 자동으로 적용된다.</p>
      <ul>
        <li><strong>포커스 트랩</strong> — Tab/Shift+Tab 이 drawer 안에서만 순환</li>
        <li><strong>ESC</strong> 로 닫기</li>
        <li>닫힐 때 <strong>트리거 버튼으로 포커스 복원</strong></li>
        <li><code>role=&quot;dialog&quot;</code> + <code>aria-modal=&quot;true&quot;</code> 가 drawer 패널에 자동 부여</li>
      </ul>

      <h2>서브메뉴 (HeaderMenu)</h2>
      <p>
        <code>HeaderMenu</code> / <code>HeaderMenuTrigger</code> / <code>HeaderMenuContent</code> 로
        2-레벨 nav 를 만든다. 데스크탑에서는 절대 위치 dropdown, 모바일 drawer 안에서는 collapsible 로 자동 전환.
      </p>
      <Preview>
        <Preview.Demo>
          <div style={{ width: "100%", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
            <Header>
              <HeaderTrigger />
              <HeaderBrand>
                <HeaderTitle>Acme</HeaderTitle>
              </HeaderBrand>
              <HeaderNav>
                <HeaderItem href="#">홈</HeaderItem>
                <HeaderMenu>
                  <HeaderMenuTrigger>Products</HeaderMenuTrigger>
                  <HeaderMenuContent>
                    <HeaderItem href="#">Studio</HeaderItem>
                    <HeaderItem href="#">Cloud</HeaderItem>
                    <HeaderItem href="#">CLI</HeaderItem>
                  </HeaderMenuContent>
                </HeaderMenu>
                <HeaderMenu>
                  <HeaderMenuTrigger>Resources</HeaderMenuTrigger>
                  <HeaderMenuContent>
                    <HeaderItem href="#">Docs</HeaderItem>
                    <HeaderItem href="#">Blog</HeaderItem>
                    <HeaderItem href="#">Changelog</HeaderItem>
                  </HeaderMenuContent>
                </HeaderMenu>
                <HeaderItem href="#">Pricing</HeaderItem>
              </HeaderNav>
            </Header>
          </div>
        </Preview.Demo>
        <CodePanel
          language="tsx"
          code={`<HeaderMenu>
  <HeaderMenuTrigger>Products</HeaderMenuTrigger>
  <HeaderMenuContent>
    <HeaderItem href="/studio">Studio</HeaderItem>
    <HeaderItem href="/cloud">Cloud</HeaderItem>
  </HeaderMenuContent>
</HeaderMenu>`}
        />
      </Preview>
      <p className="muted">
        클릭 외부 또는 ESC 로 dropdown 이 닫힌다. 모바일에선 collapsible 이므로 trigger 한 번 더 눌러 접는다.
      </p>

      <h2>Drawer 그룹핑 (HeaderNavGroup)</h2>
      <p>
        많은 nav 항목을 모바일 drawer 안에서 섹션으로 묶고 싶을 때 사용. inline 모드(데스크탑)에서는
        <code>display: contents</code> 로 자식만 평면 렌더되어 영향 없음.
      </p>
      <CodePanel
        language="tsx"
        code={`<HeaderNav>
  <HeaderNavGroup label="Product">
    <HeaderItem href="/studio">Studio</HeaderItem>
    <HeaderItem href="/cloud">Cloud</HeaderItem>
  </HeaderNavGroup>
  <HeaderNavGroup label="Resources">
    <HeaderItem href="/docs">Docs</HeaderItem>
    <HeaderItem href="/blog">Blog</HeaderItem>
  </HeaderNavGroup>
</HeaderNav>`}
      />

      <h2>
        Variants <span style={{ marginLeft: "0.5rem", padding: "0.125rem 0.5rem", fontSize: "0.6875rem", fontWeight: 600, background: "var(--background-muted)", border: "1px solid var(--border)", borderRadius: "9999px", color: "var(--foreground-muted)", verticalAlign: "middle" }}>BETA</span>
      </h2>
      <p>
        <code>variant</code> 로 헤더 배경 표현을 바꾼다. <code>transparent</code> 는 hero 위에서, <code>blur</code> 는 sticky 헤더에서 뒤 콘텐츠를 흐리게 보여줄 때 유용.
      </p>
      <ul>
        <li><code>variant=&quot;solid&quot;</code> (기본) — 단색 배경</li>
        <li><code>variant=&quot;transparent&quot;</code> — 배경 + 하단 보더 모두 투명</li>
        <li><code>variant=&quot;blur&quot;</code> — 70% opacity + <code>backdrop-filter: blur(12px)</code></li>
      </ul>

      <h2>
        Sticky hide on scroll <span style={{ marginLeft: "0.5rem", padding: "0.125rem 0.5rem", fontSize: "0.6875rem", fontWeight: 600, background: "var(--background-muted)", border: "1px solid var(--border)", borderRadius: "9999px", color: "var(--foreground-muted)", verticalAlign: "middle" }}>BETA</span>
      </h2>
      <p>
        <code>stickyHide</code> 가 활성이면 스크롤 다운 시 헤더가 위로 사라지고, 위로 스크롤하면 다시 노출된다. <code>position: sticky</code> 컨텍스트는 사용자가 직접 (예: 부모 또는 헤더에 <code>style=&#123;&#123; position: &quot;sticky&quot;, top: 0 &#125;&#125;</code>) 적용한다.
      </p>
      <CodePanel
        language="tsx"
        code={`<Header
  variant="blur"
  stickyHide
  stickyHideThreshold={120}
  style={{ position: "sticky", top: 0, zIndex: 50 }}
>
  ...
</Header>`}
      />
      <p className="muted">
        ⚠️ <code>variant</code> · <code>stickyHide</code> · <code>stickyHideThreshold</code> 는 베타 — API 가 v1 전에 바뀔 수 있다.
      </p>

      <h2>제어 모드</h2>
      <p>drawer 열림 상태를 바깥에서 관리하고 싶으면 <code>open</code> + <code>onOpenChange</code>.</p>
      <CodePanel
        language="tsx"
        code={`const [open, setOpen] = React.useState(false);

<Header open={open} onOpenChange={setOpen}>
  ...
</Header>`}
      />

      <h2>언제 쓰나</h2>
      <ul>
        <li>마케팅 사이트 / 랜딩 페이지</li>
        <li>블로그 / 문서 사이트 — 좌측 사이드바 없이 상단 네비만</li>
        <li>AppShell이 과한 단순 화면</li>
      </ul>

      <h2>Props</h2>
      <h3>Header</h3>
      <ul>
        <li><code>open?: boolean</code> — 제어 모드 drawer 열림 상태</li>
        <li><code>defaultOpen?: boolean</code> — 비제어 모드 초기 열림</li>
        <li><code>onOpenChange?: (open: boolean) =&gt; void</code> — 열림 변경 콜백</li>
        <li><code>variant?: &quot;solid&quot; | &quot;transparent&quot; | &quot;blur&quot;</code> <em>(beta)</em> — 배경 표현, 기본 <code>&quot;solid&quot;</code></li>
        <li><code>stickyHide?: boolean</code> <em>(beta)</em> — 스크롤 다운 시 자동 숨김</li>
        <li><code>stickyHideThreshold?: number</code> <em>(beta)</em> — 숨김 시작 픽셀, 기본 <code>80</code></li>
      </ul>
      <h3>HeaderItem</h3>
      <ul>
        <li><code>href: string</code> — 링크 대상</li>
        <li><code>active?: boolean</code> — 활성 상태 강조</li>
      </ul>
      <h3>HeaderMenu</h3>
      <ul>
        <li><code>defaultOpen?: boolean</code> — drawer 모드 (collapsible) 초기 펼침. 데스크탑 dropdown 은 항상 닫힌 상태로 시작</li>
      </ul>
      <h3>HeaderNavGroup</h3>
      <ul>
        <li><code>label?: ReactNode</code> — drawer 모드에서만 보이는 섹션 라벨</li>
      </ul>
    </main>
  );
}
