export const dynamic = "force-static";

import Link from "next/link";

export default function Recipes() {
  return (
    <main className="container">
      <h1>레시피</h1>
      <p className="muted">
        템플릿이 의도적으로 비워둔 영역(인증, 모니터링, i18n 등)을 채워 넣는 가이드.
      </p>

      <h2>API 통신 / 데이터 페칭</h2>
      <ul>
        <li>
          <Link href="/recipes/api-layer">API 레이어</Link> — 템플릿이 제공하는{" "}
          <code>http.ts</code> + <code>/api/proxy</code> 구조와 TanStack Query
          연동 방식.
        </li>
        <li>
          <Link href="/recipes/auth">인증 추가</Link> — 로그인 응답으로 쿠키
          set, 401 시 refresh-and-retry, 미들웨어 라우트 가드.
        </li>
        <li>
          <Link href="/recipes/file-upload">파일 업로드</Link> — multipart 직접
          업로드, 진행률 표시, 클라이언트 검증, presigned URL 대안.
        </li>
        <li>
          <Link href="/recipes/tanstack-query">TanStack Query 셋업</Link> —
          Provider 위치, Devtools, Suspense 모드, hydration, mutation 패턴.
        </li>
      </ul>

      <h2>UI 패턴</h2>
      <ul>
        <li>
          <Link href="/recipes/async-boundary">AsyncBoundary 패턴</Link> —
          Suspense + ErrorBoundary 묶기, Skeleton·Error 폴더 컨벤션, 재시도
          처리.
        </li>
      </ul>

      <h2>국제화</h2>
      <ul>
        <li>
          <Link href="/recipes/i18n">next-intl + 로케일 쿠키</Link> —{" "}
          <code>NEXT_LOCALE</code> 쿠키 흐름, 미들웨어 합치기,{" "}
          <code>Accept-Language</code> 자동 전달.
        </li>
      </ul>

      <h2>모니터링</h2>
      <ul>
        <li>
          <Link href="/recipes/sentry">Sentry 통합</Link> — 라우트 핸들러와{" "}
          <code>http.ts</code>에서 5xx 캡처, 4xx · 로그인 실패 제외, 헤더
          마스킹.
        </li>
      </ul>

      <h2>테스트 / 배포</h2>
      <ul>
        <li>
          <Link href="/recipes/testing">테스트 셋업</Link> — Vitest + Testing
          Library + MSW, queryFn · 컴포넌트 테스트 패턴, provider 래퍼.
        </li>
        <li>
          <Link href="/recipes/deployment">배포</Link> — 환경 변수, standalone
          빌드, Docker, 프로덕션 체크리스트.
        </li>
      </ul>
    </main>
  );
}
