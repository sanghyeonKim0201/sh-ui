# Multi-stage Dockerfile for monorepo Next.js app (output: 'standalone')
#
# 빌드 시 monorepo 루트를 컨텍스트로 사용하세요:
#   docker build -f apps/app-name/Dockerfile -t app-name .
#
# Next.js 의 `output: 'standalone'` 옵션이 .next/standalone 안에 server.js
# 와 최소 dependencies 만 추출합니다. 이 Dockerfile 은 그 산출물을 그대로
# 복사해 final stage 의 이미지 크기를 100MB 이하로 유지합니다.

# ── deps + build stage ────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /repo

RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

# pnpm-lock 과 manifest 들만 먼저 복사 → 의존성 캐시 hit 률 최대화
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY apps/app-name/package.json ./apps/app-name/package.json
COPY packages packages

RUN pnpm install --frozen-lockfile

# 소스 전체 복사 후 turbo build (workspace ^build 자동)
COPY . .
RUN pnpm turbo build --filter=app-name

# ── runtime stage ─────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Next standalone 산출물 (server.js + node_modules + traced deps)
COPY --from=builder /repo/apps/app-name/.next/standalone ./
COPY --from=builder /repo/apps/app-name/.next/static ./apps/app-name/.next/static
COPY --from=builder /repo/apps/app-name/public ./apps/app-name/public 2>/dev/null || true

EXPOSE 3000

CMD ["node", "apps/app-name/server.js"]
