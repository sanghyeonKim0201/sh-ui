export const dynamic = "force-static";

import { CodeTabs } from "@/components/ui/code-tabs";
import { Preview } from "@/components/preview";
import { SubComponents } from "@/components/sub-components";
import { NoNav } from "@/components/no-nav";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "@/components/ui/breadcrumb";
import { VariantSource } from "@/components/variant-source";
import { loadComponentSources } from "@/components/sandbox-code/load-component-sources";
import { BreadcrumbLiveDemo } from "./breadcrumb-live-demo";

const sources = loadComponentSources("breadcrumb");

export default function BreadcrumbDocsPage() {
  return (
    <main className="container">
      <h1>Breadcrumb</h1>
      <p className="muted">
        현재 페이지의 계층 위치를 나타내는 내비게이션. <code>&lt;nav aria-label=&quot;Breadcrumb&quot;&gt;</code> +
        <code> &lt;ol&gt;</code> 시맨틱을 기본 제공.
      </p>

      <BreadcrumbLiveDemo
        source={sources.source}
        styles={sources.styles}
        tokens={sources.tokens}
      />

      {false && (
      <Preview>
        <Preview.Demo>
          <NoNav strict>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">홈</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/components">컴포넌트</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </NoNav>
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">홈</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbLink href="/components">컴포넌트</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `ShUiBreadcrumb(
  items: [
    ShUiBreadcrumbItem(label: '홈', onTap: () => ...),
    ShUiBreadcrumbItem(label: '컴포넌트', onTap: () => ...),
    const ShUiBreadcrumbItem(label: 'Breadcrumb', isCurrent: true),
  ],
)`,
            },
          ]}
        />
      </Preview>
      )}

      <h2>Installation</h2>

      <h3>CLI</h3>
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "bash",
            showLineNumbers: false,
            code: `npx sh-ui-cli add breadcrumb`,
          },
        ]}
      />
      <h3>Manual</h3>
      <VariantSource name="breadcrumb" />


      <h2>Examples</h2>

      <h3>중간 항목 축약</h3>
      <p className="muted">긴 경로를 <code>BreadcrumbEllipsis</code>로 생략.</p>
      <Preview>
        <Preview.Demo>
          <NoNav strict>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">홈</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbEllipsis />
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/components">컴포넌트</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </NoNav>
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<BreadcrumbItem>
  <BreadcrumbEllipsis />
</BreadcrumbItem>`,
            },
          ]}
        />
      </Preview>

      <h2>구성 요소</h2>
      <SubComponents
        rows={[
          { name: "Breadcrumb", description: "nav 루트 — aria-label=\"Breadcrumb\"." },
          { name: "BreadcrumbList", description: "ol 리스트 래퍼." },
          { name: "BreadcrumbItem", description: "li 항목." },
          { name: "BreadcrumbLink", description: "이전 경로 링크(a)." },
          { name: "BreadcrumbPage", description: "현재 위치 — aria-current=\"page\"." },
          { name: "BreadcrumbSeparator", description: "구분자 (기본 ▶). aria-hidden." },
          { name: "BreadcrumbEllipsis", description: "중간 항목 생략 표시." },
        ]}
      />

      <h2>API Reference</h2>
      <p className="muted">
        모든 하위 컴포넌트는 표준 HTML 속성을 그대로 받는다 (Breadcrumb=nav · List=ol ·
        Item=li · Link=a · Page=span · Separator=li · Ellipsis=span). 별도의 커스텀 prop 은
        없으며 className/style 로 직접 스타일링.
      </p>
    </main>
  );
}
