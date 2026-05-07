# Multi-stage Dockerfile for standalone Next.js app
#
# 빌드:
#   docker build -t my-app .
#
# Next.js 가 `.next/standalone` 으로 server.js + 최소 dependencies 만 추출하도록
# next.config.ts 에 `output: 'standalone'` 을 추가하세요.

FROM node:22-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

COPY pnpm-lock.yaml package.json ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# `output: 'standalone'` 이 활성일 때 server.js + 추적된 deps 가 .next/standalone 에 생성됨.
# 옵션 비활성 시엔 .next/ 전체를 복사하고 `next start` 로 실행해야 합니다.
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public 2>/dev/null || true

EXPOSE 3000

CMD ["node", "server.js"]
