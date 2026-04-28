"use client";

import { useState } from "react";
import { CodeTabs } from "@/components/ui/code-tabs";
import { Preview } from "@/components/preview";
import { SubComponents } from "@/components/sub-components";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
  getPaginationRange,
} from "@/components/ui/pagination";

export default function PaginationDocsPage() {
  const [page, setPage] = useState(1);
  const [pageLarge, setPageLarge] = useState(5);
  const totalLarge = 20;

  const largeTokens = getPaginationRange({
    page: pageLarge,
    totalPages: totalLarge,
    siblings: 1,
  });

  return (
    <main className="container">
      <h1>Pagination</h1>
      <p className="muted">
        긴 목록을 페이지 단위로 나눠 탐색하는 내비게이션.{" "}
        <code>&lt;nav aria-label=&quot;Pagination&quot;&gt;</code> +{" "}
        <code>&lt;ul&gt;</code> 시맨틱, 현재 페이지에는{" "}
        <code>aria-current=&quot;page&quot;</code>.
      </p>

      <Preview>
        <Preview.Demo>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setPage((p) => Math.max(1, p - 1));
                  }}
                />
              </PaginationItem>
              {[1, 2, 3, 4, 5].map((n) => (
                <PaginationItem key={n}>
                  <PaginationLink
                    href="#"
                    isActive={page === n}
                    onClick={(e) => {
                      e.preventDefault();
                      setPage(n);
                    }}
                  >
                    {n}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setPage((p) => Math.min(5, p + 1));
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious href="?page=1" />
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="?page=1" isActive>1</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="?page=2">2</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="?page=3">3</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationNext href="?page=2" />
    </PaginationItem>
  </PaginationContent>
</Pagination>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `ShUiPagination(
  page: page,
  pageCount: 5,
  onPageChanged: (p) => setState(() => page = p),
)`,
            },
          ]}
        />
      </Preview>

      <h2>Installation</h2>

      <h3>CLI</h3>
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "bash",
            showLineNumbers: false,
            code: `npx sh-ui-cli add pagination`,
          },
        ]}
      />

      <h2>Examples</h2>

      <h3>생략(…) 포함 — 긴 페이지 목록</h3>
      <p className="muted">
        <code>getPaginationRange</code>로 현재 페이지 주변과 양 끝만 펼치고
        가운데는 <code>PaginationEllipsis</code>로 접는다.
      </p>
      <Preview>
        <Preview.Demo>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  aria-disabled={pageLarge === 1}
                  data-disabled={pageLarge === 1 ? "" : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    setPageLarge((p) => Math.max(1, p - 1));
                  }}
                />
              </PaginationItem>
              {largeTokens.map((token, i) =>
                token === "dots" ? (
                  <PaginationItem key={`dots-${i}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={token}>
                    <PaginationLink
                      href="#"
                      isActive={pageLarge === token}
                      onClick={(e) => {
                        e.preventDefault();
                        setPageLarge(token);
                      }}
                    >
                      {token}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  aria-disabled={pageLarge === totalLarge}
                  data-disabled={pageLarge === totalLarge ? "" : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    setPageLarge((p) => Math.min(totalLarge, p + 1));
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `const tokens = getPaginationRange({ page, totalPages: 20, siblings: 1 });

<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious href="?page={page - 1}" />
    </PaginationItem>
    {tokens.map((token, i) =>
      token === "dots" ? (
        <PaginationItem key={\`dots-\${i}\`}>
          <PaginationEllipsis />
        </PaginationItem>
      ) : (
        <PaginationItem key={token}>
          <PaginationLink href={\`?page=\${token}\`} isActive={page === token}>
            {token}
          </PaginationLink>
        </PaginationItem>
      ),
    )}
    <PaginationItem>
      <PaginationNext href="?page={page + 1}" />
    </PaginationItem>
  </PaginationContent>
</Pagination>`,
            },
          ]}
        />
      </Preview>

      <h2>구성 요소</h2>
      <SubComponents
        rows={[
          { name: "Pagination", description: "nav 루트 — aria-label=\"Pagination\"." },
          { name: "PaginationContent", description: "ul 리스트 래퍼." },
          { name: "PaginationItem", description: "li 항목." },
          { name: "PaginationLink", description: "페이지 링크. isActive=true면 aria-current=\"page\"." },
          { name: "PaginationPrevious", description: "이전 페이지 (aria-label=\"이전 페이지\")." },
          { name: "PaginationNext", description: "다음 페이지 (aria-label=\"다음 페이지\")." },
          { name: "PaginationEllipsis", description: "중간 생략 표시. aria-hidden." },
          { name: "getPaginationRange", description: "유틸 — {page, totalPages, siblings}로 [번호 | \"dots\"] 토큰 배열 생성." },
        ]}
      />

      <h2>API Reference</h2>
      <p className="muted">
        하위 컴포넌트 대부분은 표준 HTML 속성을 그대로 받는다. 추가 prop:
      </p>
      <ul>
        <li><code>PaginationLink</code> — <code>isActive?: boolean</code> (true 면 <code>aria-current=&quot;page&quot;</code> 자동), <code>href?: string</code></li>
        <li><code>PaginationPrevious</code>, <code>PaginationNext</code> — <code>href?: string</code>, 경계 도달 시 <code>aria-disabled</code> + <code>data-disabled</code> 자동</li>
        <li><code>getPaginationRange({"{ page, totalPages, siblings }"})</code> — 유틸 함수, <code>(number | &quot;dots&quot;)[]</code> 반환</li>
      </ul>

      <h2>접근성</h2>
      <ul>
        <li>
          루트 <code>&lt;nav aria-label=&quot;Pagination&quot;&gt;</code>로 내비게이션
          영역임을 알린다
        </li>
        <li>
          현재 페이지에는 <code>isActive</code>가 자동으로{" "}
          <code>aria-current=&quot;page&quot;</code>를 붙인다
        </li>
        <li>
          이전/다음 버튼은 <code>aria-label=&quot;이전 페이지&quot;</code> /{" "}
          <code>&quot;다음 페이지&quot;</code>로 스크린리더 지원
        </li>
        <li>
          경계 도달 시 <code>aria-disabled</code> + <code>data-disabled</code>로
          비활성 처리 (pointer-events 차단)
        </li>
        <li>포커스 링은 <code>:focus-visible</code>로 토큰(<code>--foreground</code>) 표시</li>
      </ul>
    </main>
  );
}
