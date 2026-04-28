export const dynamic = "force-static";

import {
  Header,
  HeaderActions,
  HeaderBrand,
  HeaderDesktopOnly,
  HeaderItem,
  HeaderLogo,
  HeaderMenu,
  HeaderMenuContent,
  HeaderMenuTrigger,
  HeaderMobileOnly,
  HeaderNav,
  HeaderNavGroup,
  HeaderTitle,
  HeaderTrigger,
} from "@/components/ui/header";
import { Button } from "@/components/ui/button";
import { CodePanel } from "@/components/ui/code-panel";
import { CodeTabs } from "@/components/code-tabs";
import { Preview } from "@/components/preview";
import { StickyHideDemo } from "./_demos/sticky-hide";

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

      <h2>반응형 가시성 — HeaderDesktopOnly / HeaderMobileOnly</h2>
      <p>
        <code>HeaderNav</code> 는 모바일에서 자식을 drawer 로 옮긴다. 이게 싫고 <strong>그냥 안 보이게</strong>만
        하고 싶을 때(예: 데스크탑 검색 input · 로그인 버튼 · 마이페이지 메뉴 등을 모바일에선 자체 drawer 트리거로 대체) 두 유틸을 사용한다.
      </p>
      <ul>
        <li><code>HeaderDesktopOnly</code> — ≥768px 에서만 보임. 모바일에선 자식 통째로 사라짐 (drawer 로 이동하지 않음)</li>
        <li><code>HeaderMobileOnly</code> — &lt;768px 에서만 보임. 데스크탑에선 사라짐. 사용자 정의 drawer 트리거 등에 사용</li>
      </ul>
      <p className="muted">
        wrapper 는 <code>display: contents</code> 라 부모(HeaderActions 등)의 flex/grid 흐름에 영향을 주지 않는다 — 자식이 그대로 부모의 flex 아이템처럼 동작.
      </p>
      <CodePanel
        language="tsx"
        code={`<Header>
  {/* 기본 햄버거를 안 쓰고 자기 drawer 를 쓰는 경우라면 HeaderTrigger 도 생략 */}
  <HeaderBrand>...</HeaderBrand>
  <HeaderActions>
    <HeaderDesktopOnly>
      <SearchInput />
      <Button variant="secondary">로그인</Button>
      <MyPageMenu />
    </HeaderDesktopOnly>
    <HeaderMobileOnly>
      {/* 사용자 정의 drawer 트리거 */}
      <button onClick={openCustomDrawer} aria-label="메뉴">
        <MenuIcon />
      </button>
    </HeaderMobileOnly>
  </HeaderActions>
</Header>`}
      />

      <h2>Drawer 그룹핑 (HeaderNavGroup)</h2>
      <p>
        많은 nav 항목을 모바일 drawer 안에서 섹션으로 묶고 싶을 때 사용. inline 모드(데스크탑)에서는
        <code>display: contents</code> 로 자식만 평면 렌더되어 영향 없음 — 같은 자식 트리가 두 모드 모두에서 자연스럽게 보인다.
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
                <HeaderNavGroup label="Product">
                  <HeaderItem href="#">Studio</HeaderItem>
                  <HeaderItem href="#">Cloud</HeaderItem>
                  <HeaderItem href="#">CLI</HeaderItem>
                </HeaderNavGroup>
                <HeaderNavGroup label="Resources">
                  <HeaderItem href="#">Docs</HeaderItem>
                  <HeaderItem href="#">Blog</HeaderItem>
                </HeaderNavGroup>
              </HeaderNav>
            </Header>
          </div>
        </Preview.Demo>
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
      </Preview>
      <p className="muted">
        ↑ 데스크탑에서는 그룹 라벨이 숨고 모든 항목이 한 줄로 나열된다. 화면을 768px 이하로 줄이고 햄버거를 열면 같은 항목이 라벨과 함께 섹션으로 묶여 보인다.
      </p>

      <h2>Variants</h2>
      <p>
        <code>variant</code> 로 헤더 배경 표현을 바꾼다. <code>transparent</code> 는 hero 위에서, <code>blur</code> 는 sticky 헤더에서 뒤 콘텐츠를 흐리게 보여줄 때 유용.
      </p>

      <h3>solid (기본)</h3>
      <Preview>
        <Preview.Demo>
          <div style={{ width: "100%", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
            <Header variant="solid">
              <HeaderTrigger />
              <HeaderBrand>
                <HeaderTitle>Acme</HeaderTitle>
              </HeaderBrand>
              <HeaderNav>
                <HeaderItem href="#" active>홈</HeaderItem>
                <HeaderItem href="#">제품</HeaderItem>
                <HeaderItem href="#">가격</HeaderItem>
              </HeaderNav>
            </Header>
          </div>
        </Preview.Demo>
        <CodePanel language="tsx" code={`<Header variant="solid">...</Header>`} />
      </Preview>

      <h3>transparent — hero 위에 얹기</h3>
      <Preview>
        <Preview.Demo>
          <div
            style={{
              width: "100%",
              borderRadius: "var(--radius)",
              overflow: "hidden",
              background:
                "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)",
            }}
          >
            <Header variant="transparent">
              <HeaderTrigger />
              <HeaderBrand>
                <HeaderTitle style={{ color: "white" }}>Aurora</HeaderTitle>
              </HeaderBrand>
              <HeaderNav>
                <HeaderItem href="#" style={{ color: "rgba(255,255,255,0.9)" }} active>
                  홈
                </HeaderItem>
                <HeaderItem href="#" style={{ color: "rgba(255,255,255,0.75)" }}>
                  소개
                </HeaderItem>
                <HeaderItem href="#" style={{ color: "rgba(255,255,255,0.75)" }}>
                  연락
                </HeaderItem>
              </HeaderNav>
              <HeaderActions>
                <Button variant="secondary" size="sm">시작하기</Button>
              </HeaderActions>
            </Header>
            <div style={{ padding: "var(--space-6) var(--space-4)", color: "white", textAlign: "center" }}>
              <h3 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700 }}>Hero 섹션</h3>
              <p style={{ margin: "var(--space-1) 0 0", opacity: 0.85 }}>헤더의 배경·보더가 모두 투명이라 hero 그라디언트가 그대로 노출된다.</p>
            </div>
          </div>
        </Preview.Demo>
        <CodePanel language="tsx" code={`<Header variant="transparent">...</Header>`} />
      </Preview>

      <h3>blur — sticky 헤더 위로 콘텐츠가 흐려져 보임</h3>
      <Preview>
        <Preview.Demo>
          <div
            style={{
              position: "relative",
              width: "100%",
              height: 220,
              borderRadius: "var(--radius)",
              overflow: "hidden",
              backgroundImage:
                "radial-gradient(circle at 20% 20%, #f59e0b 0%, transparent 40%), radial-gradient(circle at 80% 30%, #ef4444 0%, transparent 40%), radial-gradient(circle at 50% 80%, #6366f1 0%, transparent 50%)",
              backgroundColor: "var(--background)",
            }}
          >
            <Header variant="blur" style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 2 }}>
              <HeaderTrigger />
              <HeaderBrand>
                <HeaderTitle>Glass</HeaderTitle>
              </HeaderBrand>
              <HeaderNav>
                <HeaderItem href="#" active>홈</HeaderItem>
                <HeaderItem href="#">갤러리</HeaderItem>
              </HeaderNav>
            </Header>
            <div style={{ padding: "calc(var(--control-md) + var(--space-4)) var(--space-4) var(--space-4)", color: "var(--foreground)" }}>
              <p style={{ margin: 0, fontSize: "0.875rem", opacity: 0.85 }}>
                헤더가 85% opacity + <code>backdrop-filter: saturate(180%) blur(16px)</code> 라 뒤 컬러가 부드럽게 비친다.
              </p>
            </div>
          </div>
        </Preview.Demo>
        <CodePanel language="tsx" code={`<Header variant="blur">...</Header>`} />
      </Preview>

      <h2>Sticky hide on scroll</h2>
      <p>
        <code>stickyHide</code> 가 활성이면 스크롤 다운 시 헤더가 위로 사라지고, 위로 스크롤하면 다시 노출된다.
        구현은 가장 가까운 스크롤 가능 조상을 자동 감지해 그쪽 scroll 이벤트를 듣는다 — 일반적인 페이지 스크롤은 물론, 아래 데모처럼 컨테이너 안 스크롤에서도 동작.
      </p>
      <Preview>
        <Preview.Demo>
          <StickyHideDemo />
        </Preview.Demo>
        <CodePanel
          language="tsx"
          code={`<Header
  variant="blur"
  stickyHide
  stickyHideThreshold={40}
  style={{ position: "sticky", top: 0, zIndex: 5 }}
>
  ...
</Header>`}
        />
      </Preview>
      <p className="muted">
        <code>prefers-reduced-motion: reduce</code> 환경에서는 슬라이드 트랜지션이 자동으로 비활성화돼 즉시 토글된다.
      </p>

      <h3>blur 튜닝</h3>
      <p>
        blur 변형은 두 CSS 변수로 instance 별 조정이 가능하다 — 컴포넌트 카피본을 수정하지 않아도 사이트마다 다른 글래스 표현을 만들 수 있다.
      </p>
      <ul>
        <li><code>--sh-ui-header-blur-opacity</code> — 배경 불투명도 (기본 <code>85%</code>)</li>
        <li><code>--sh-ui-header-blur-radius</code> — backdrop-filter blur 반경 (기본 <code>16px</code>)</li>
      </ul>
      <CodePanel
        language="tsx"
        code={`<Header
  variant="blur"
  style={{
    "--sh-ui-header-blur-opacity": "92%",
    "--sh-ui-header-blur-radius": "20px",
  } as React.CSSProperties}
>
  ...
</Header>`}
      />
      <p className="muted">
        브라우저 지원: <code>backdrop-filter</code> 는 Chrome 76+ · Safari 9+ · Firefox 103+ · Edge 17+. 미지원 브라우저에서는 <code>@supports</code> 폴백으로 불투명 배경이 자동 적용돼 가독성 보장. <code>color-mix(in srgb, ...)</code> 는 Chrome 111+ · Safari 16.4+ · Firefox 113+ — 미지원 환경에서는 hover 오버레이가 적용되지 않을 수 있으나 컴포넌트 동작 자체에는 지장 없음.
      </p>

      <h2>제어 모드</h2>
      <p>drawer 열림 상태를 바깥에서 관리하고 싶으면 <code>open</code> + <code>onOpenChange</code>. 외부 버튼/단축키로 drawer 열기, 라우터 변경 시 자동 닫기 등에 사용.</p>
      <CodePanel
        language="tsx"
        code={`"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export function AppHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // 라우트가 바뀌면 drawer 자동 닫기
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Header open={open} onOpenChange={setOpen}>
      ...
    </Header>
  );
}`}
      />

      <h2>실전: Next.js usePathname 으로 active 표시</h2>
      <p>
        <code>HeaderItem</code> 의 <code>active</code> prop 을 라우터의 현재 경로와 직접 연결한다.
      </p>
      <CodePanel
        language="tsx"
        code={`"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export function AppHeader() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <Header>
      <HeaderTrigger />
      <HeaderBrand><HeaderTitle>Acme</HeaderTitle></HeaderBrand>
      <HeaderNav>
        {[
          { href: "/", label: "홈" },
          { href: "/products", label: "제품" },
          { href: "/pricing", label: "가격" },
        ].map((it) => (
          <HeaderItem
            key={it.href}
            asChild
            active={isActive(it.href)}
          >
            {/* Next.js Link 와 합치고 싶을 때 — Link 를 자식으로 넘기는 패턴 (또는 HeaderItem 의 href 를 그냥 사용) */}
            <Link href={it.href}>{it.label}</Link>
          </HeaderItem>
        ))}
      </HeaderNav>
    </Header>
  );
}`}
      />
      <p className="muted">
        현재 <code>HeaderItem</code> 은 <code>asChild</code> prop 을 따로 두지 않으므로, Next.js <code>&lt;Link&gt;</code> 를 직접 쓰려면 <code>HeaderItem</code> 카피본의 <code>&lt;a&gt;</code> 를 <code>&lt;Link&gt;</code> 로 바꾸거나 <code>HeaderItem href=&quot;...&quot;</code> 로 평범하게 사용한다.
      </p>

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
        <li><code>variant?: &quot;solid&quot; | &quot;transparent&quot; | &quot;blur&quot;</code> — 배경 표현, 기본 <code>&quot;solid&quot;</code></li>
        <li><code>stickyHide?: boolean</code> — 스크롤 다운 시 자동 숨김. 가장 가까운 스크롤 가능 조상을 자동 감지</li>
        <li><code>stickyHideThreshold?: number</code> — 숨김 시작 픽셀, 기본 <code>80</code></li>
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
      <h3>HeaderDesktopOnly / HeaderMobileOnly</h3>
      <ul>
        <li>props: 표준 <code>div</code> 속성 그대로. 자식을 미디어 쿼리로 가시성만 토글 (drawer 이동 없음).</li>
      </ul>
    </main>
  );
}
