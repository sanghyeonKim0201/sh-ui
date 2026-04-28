export const dynamic = "force-static";

import { CodePanel } from "@/components/ui/code-panel";
import { PropsTable } from "@/components/props-table";

export default function PageTOCDocsPage() {
  return (
    <main className="container">
      <h1>PageTOC</h1>
      <p className="muted">
        페이지 안의 헤딩(<code>h2</code>·<code>h3</code> 등)을 자동으로 스캔해 우측 레일에 목차(On this page) 를
        렌더한다. 자동 slugify · id 부여, IntersectionObserver 로 현재 보이는 섹션을 active 표시,
        클릭 시 smooth scroll. 라우터 비종속 — Next.js / React Router / no-router 모두 지원.
      </p>

      <h2>Installation</h2>

      <h3>CLI</h3>
      <CodePanel language="bash" showLineNumbers={false} code={`npx sh-ui-cli add page-toc`} />

      <h3>Manual</h3>
      <p className="muted">
        registry 에서 <code>components/ui/page-toc/</code> 의 <code>index.tsx</code> · <code>styles.css</code> 두
        파일을 복사. 외부 의존성 없음.
      </p>

      <h2>Usage</h2>
      <p>
        보통 layout 에서 <code>&lt;main&gt;</code> 옆에 한 번만 두면 모든 페이지에서 자동으로 동작한다.
      </p>
      <CodePanel
        language="tsx"
        filename="app/layout.tsx (Next.js)"
        code={`"use client";

import { usePathname } from "next/navigation";
import { PageTOC } from "@/components/ui/page-toc";

export function TocSlot() {
  const pathname = usePathname();
  return (
    <PageTOC
      routeKey={pathname}
      excludeSelector=".sh-ui-preview"
    />
  );
}`}
      />
      <p className="muted">
        <code>routeKey</code> — 라우트가 바뀌면 TOC 가 자동 재스캔. Next.js 면 <code>usePathname()</code>,
        React Router 면 <code>useLocation().pathname</code>, 단일 페이지면 생략.
      </p>

      <h2>레이아웃 정렬</h2>
      <p>
        기본 스타일은 <code>position: fixed</code> 우측 14rem 레일(상단 5rem). 본문이 TOC 를
        침범하지 않도록 부모 컨테이너에 우측 padding 을 예약하는 게 편하다.
      </p>
      <CodePanel
        language="css"
        code={`/* 데스크탑(>=80rem)에서 본문 우측에 TOC 폭만큼 여백 예약 */
@media (min-width: 80rem) {
  .your-content-wrapper {
    padding-right: 16rem;
  }
}`}
      />
      <p className="muted">
        80rem 미만 뷰포트에서는 <code>.sh-ui-page-toc</code> 자체가 자동으로 숨겨진다 (좁은 화면 침범 방지).
      </p>

      <h2>다른 hN 레벨 / 컨테이너 사용</h2>
      <CodePanel
        language="tsx"
        code={`<PageTOC
  containerSelector="article"
  levels={["h2", "h3", "h4"]}
  label="목차"
  headerOffsetRem={4}
/>`}
      />

      <h2>API Reference</h2>
      <PropsTable
        rows={[
          { prop: "containerSelector", type: "string", default: `"main"`, description: "스캔할 컨테이너 selector." },
          {
            prop: "routeKey",
            type: "string",
            description: "외부 신호(보통 pathname)로 재스캔. 라우트 변경 자동 감지에 사용.",
          },
          {
            prop: "levels",
            type: `("h1"|"h2"|"h3"|"h4"|"h5"|"h6")[]`,
            default: `["h2","h3"]`,
            description: "수집할 헤딩 레벨.",
          },
          {
            prop: "headerOffsetRem",
            type: "number",
            default: "5",
            description: "sticky 헤더 아래로 헤딩이 가려지지 않도록 띄울 거리(rem).",
          },
          {
            prop: "label",
            type: "ReactNode",
            default: `"On this page"`,
            description: "TOC 상단 라벨.",
          },
          {
            prop: "excludeSelector",
            type: "string",
            description: "이 selector 의 자손인 헤딩은 무시. 데모 미리보기 등을 빼낼 때.",
          },
          { prop: "className", type: "string" },
        ]}
      />
    </main>
  );
}
