export const dynamic = "force-static";

import Link from "next/link";

export default function Recipes() {
  return (
    <main className="container">
      <h1>레시피</h1>
      <p className="muted">
        플러그인이 없어도 베이스 템플릿에 적용 가능한 일반 패턴 모음. CLI 가
        깔아주는 다국어는 <Link href="/plugins">플러그인</Link> 섹션을 참고.
      </p>

      <h2>API 통신 / 데이터 페칭</h2>
      <ul>
        <li>
          <Link href="/recipes/api-layer">API 레이어</Link> — isomorphic{" "}
          <code>http()</code>, serverFetch / clientFetch transport 설계, envelope,
          에러 처리.
        </li>
        <li>
          <Link href="/recipes/data-fetching">
            데이터 페칭 (RSC prefetch + hydration)
          </Link>{" "}
          — TanStack Query 의 <code>queryOptions</code>, <code>prefetchQuery</code>,{" "}
          <code>HydrationBoundary</code> 패턴. 병렬 prefetch, mutation,
          AsyncBoundary 와 조합.
        </li>
        <li>
          <Link href="/recipes/tanstack-query">TanStack Query 셋업</Link> —
          Provider 위치, Devtools, Suspense 모드 세부.
        </li>
        <li>
          <Link href="/recipes/file-upload">파일 업로드</Link> — multipart
          업로드, 진행률, 클라이언트 검증, presigned URL.
        </li>
      </ul>

      <h2>UI 패턴</h2>
      <ul>
        <li>
          <Link href="/recipes/async-boundary">AsyncBoundary 패턴</Link> —
          Suspense + ErrorBoundary 묶기, Skeleton·Error 폴더 컨벤션, 재시도.
        </li>
      </ul>

      <h2>테스트 / 배포</h2>
      <ul>
        <li>
          <Link href="/recipes/testing">테스트 셋업</Link> — Vitest + Testing
          Library + MSW, queryFn · 컴포넌트 테스트, provider 래퍼.
        </li>
        <li>
          <Link href="/recipes/deployment">배포</Link> — 환경 변수, standalone
          빌드, Docker, 프로덕션 체크리스트.
        </li>
      </ul>

      <h2>플러그인 (CLI 가 깔아주는 코드 묶음)</h2>
      <ul>
        <li>
          <Link href="/plugins/next-intl">next-intl</Link> — 다국어
        </li>
      </ul>
    </main>
  );
}
