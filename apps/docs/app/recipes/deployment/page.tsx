export const dynamic = "force-static";

import { CodePanel } from "@/components/ui/code-panel";

export default function DeploymentRecipe() {
  return (
    <main className="container">
      <h1>배포</h1>
      <p className="muted">
        환경 변수, standalone 빌드, Docker 이미지, 프로덕션 체크리스트.
      </p>

      <h2>환경 변수</h2>
      <CodePanel
        language="bash"
        filename=".env.example"
        code={`# 백엔드 API 베이스 URL (서버 사이드에서 BFF 가 호출)
API_URL=http://localhost:8080/api

# 프로덕션(HTTPS)에서는 true — secure 쿠키 발행
COOKIE_SECURE=false

# Sentry (선택, 레시피 참조)
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=

# Next 자체
PORT=3000
NODE_ENV=production`}
      />
      <p>
        <code>API_URL</code>은 <strong>서버 환경 전용</strong>. BFF 가 백엔드를
        호출할 때만 사용되고 클라이언트 번들에는 노출되지 않는다 (
        <code>NEXT_PUBLIC_</code> prefix 없음).
      </p>

      <h2>Standalone 빌드</h2>
      <p>
        Docker 이미지로 배포할 거면 standalone output 을 켠다. 빌드 결과물에{" "}
        Node 서버와 의존성이 통째로 들어가서 <code>node_modules</code> 없이도
        실행 가능.
      </p>
      <CodePanel
        language="ts"
        filename="next.config.ts"
        code={`import type { NextConfig } from 'next';

const config: NextConfig = {
  output: 'standalone',
  // ... 기존 설정
};

export default config;`}
      />
      <p>
        빌드 후 <code>.next/standalone/</code>에 실행 가능한 서버가 생성된다.{" "}
        <code>public/</code>과 <code>.next/static/</code>은 별도로 복사해야 함.
      </p>

      <h2>Dockerfile</h2>
      <CodePanel
        language="docker"
        filename="Dockerfile"
        code={`# 1. deps
FROM node:20-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# 2. builder
FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# 3. runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \\
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000 HOSTNAME=0.0.0.0

CMD ["node", "server.js"]`}
      />

      <h2>monorepo 인 경우</h2>
      <p>
        <code>nextjs-app</code>(monorepo) 템플릿에서는 워크스페이스 패키지(
        <code>@workspace/ui-app-name</code> 등)도 포함되어야 한다. Dockerfile
        의 deps 단계를 수정:
      </p>
      <CodePanel
        language="docker"
        code={`# monorepo deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/app-name/package.json ./apps/app-name/
COPY packages/ui-app-name/package.json ./packages/ui-app-name/
RUN pnpm install --frozen-lockfile

# build (앱 디렉터리에서)
RUN pnpm --filter app-name build`}
      />

      <h2>HTTPS 와 secure 쿠키</h2>
      <p>
        프로덕션에서는 <code>COOKIE_SECURE=true</code>로 설정해 토큰 쿠키가{" "}
        HTTPS 로만 전송되게 한다. 도메인 앞에 리버스 프록시(nginx · cloudfront)가
        있다면 그 단에서 HTTPS 종료 후 컨테이너에는 HTTP 로 들어와도{" "}
        <code>X-Forwarded-Proto</code>를 신뢰하도록 next 설정.
      </p>
      <CodePanel
        language="ts"
        filename="next.config.ts (프록시 뒤에 있는 경우)"
        code={`const config: NextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: { allowedOrigins: ['your-domain.com'] },
  },
};`}
      />

      <h2>BFF 와 백엔드의 네트워크 토폴로지</h2>
      <ul>
        <li>
          <strong>백엔드와 같은 클러스터</strong> — <code>API_URL</code>을
          내부 도메인(<code>http://backend.internal:8080/api</code>)으로 두면
          공용 인터넷을 거치지 않아 빠르고 안전.
        </li>
        <li>
          <strong>외부 백엔드</strong> — <code>https://api.example.com/api</code>{" "}
          같은 공개 도메인. BFF 의 timeout 을 충분히 (10초 이상) 설정.
        </li>
      </ul>
      <p className="muted">
        <code>http.ts</code>의 <code>HTTP_TIMEOUT</code> 상수와 라우트
        핸들러의 <code>fetch</code> 양쪽이 같은 timeout 을 따르도록 한다.
      </p>

      <h2>Sentry source map</h2>
      <p>
        Sentry 를 쓰면 source map 을 빌드 시 업로드하도록 wizard 가 next config
        를 수정한다. CI 에서 <code>SENTRY_AUTH_TOKEN</code>을 secret 으로 주입하고
        빌드 명령은 그대로 <code>pnpm build</code>.
      </p>

      <h2>프로덕션 체크리스트</h2>
      <ul>
        <li>
          ✅ <code>API_URL</code>이 프로덕션 백엔드를 가리키는가
        </li>
        <li>
          ✅ <code>COOKIE_SECURE=true</code> 설정됨
        </li>
        <li>
          ✅ Sentry DSN 환경변수 주입 (옵션)
        </li>
        <li>
          ✅ <code>output: 'standalone'</code>로 빌드되었는가
        </li>
        <li>
          ✅ 백엔드의 CORS 가 BFF 만 허용 (브라우저 직접 호출 차단) — 누구도 BFF
          를 우회하지 못하게
        </li>
        <li>
          ✅ HTTPS 종료 단에서 <code>Strict-Transport-Security</code> 헤더
          전송
        </li>
        <li>
          ✅ <code>console.log</code>로 토큰·인증 정보가 새지 않는지 검토 (
          <code>logApiError</code>의 Authorization 마스킹 확인)
        </li>
        <li>
          ✅ <code>NEXT_PUBLIC_*</code> 변수에 시크릿이 들어가지 않았는지 확인
        </li>
      </ul>

      <h2>헬스 체크</h2>
      <p>
        로드밸런서가 컨테이너 상태를 확인할 단순 엔드포인트:
      </p>
      <CodePanel
        language="ts"
        filename="app/api/health/route.ts"
        code={`import { NextResponse } from 'next/server';

export const GET = () => NextResponse.json({ status: 'ok' });`}
      />
      <p className="muted">
        백엔드 의존성까지 확인하고 싶다면 백엔드의 <code>/health</code>를{" "}
        <code>fetch</code>해서 그 결과를 함께 반영한다 — 단, 헬스 체크가 주기적으로
        호출되므로 무거운 검사는 피한다.
      </p>
    </main>
  );
}
