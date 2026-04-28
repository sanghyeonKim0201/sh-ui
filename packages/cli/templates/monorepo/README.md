# Monorepo Template

Turborepo + pnpm workspace 기반 모노레포 템플릿 (sh-ui 기반).

## 기술 스택

- **Turborepo** (빌드 오케스트레이션)
- **pnpm 10** (워크스페이스 패키지 매니저)
- **TypeScript 5.9**
- **sh-ui** (앱별 독립 테마 — 각 `ui-{app}/` 패키지가 자체 `sh-ui.config.json` 보유)
- **ESLint 9** (flat config)
- **Prettier** (tailwind 플러그인)

## 프로젝트 구조

```
├── apps/                             # 애플리케이션
│   └── (nextjs-app 템플릿으로 추가)
│
├── packages/
│   ├── ui/
│   │   ├── ui-core/                  # 기능/로직 공유 (스타일 없음)
│   │   │   └── src/lib/utils.ts      # cn() 유틸
│   │   │
│   │   └── ui-apps/
│   │       └── ui-{app}/             # 앱별 sh-ui 패키지 (독립 테마)
│   │           ├── sh-ui.config.json # 앱별 theme/paths
│   │           ├── src/
│   │           │   ├── components/   # sh-ui 컴포넌트
│   │           │   ├── hooks/
│   │           │   └── styles/
│   │           │       ├── globals.css
│   │           │       └── tokens.css
│   │           └── postcss.config.mjs
│   │
│   ├── eslint-config/                # 공유 ESLint 설정
│   │   ├── base.js                   # 기본 (TS + Turbo + Prettier)
│   │   ├── next.js                   # Next.js 앱용
│   │   ├── react-internal.js         # React 라이브러리용
│   │   └── fsd.js                    # FSD 레이어 규칙 (boundaries, 파일 네이밍)
│   │
│   └── typescript-config/            # 공유 TypeScript 설정
│       ├── base.json                 # 기본 (strict, ES2022)
│       ├── nextjs.json               # Next.js 앱용 (Bundler, JSX preserve)
│       └── react-library.json        # React 라이브러리용 (react-jsx)
│
├── turbo.json                        # Turbo 태스크 파이프라인
├── pnpm-workspace.yaml               # apps/* + packages/*
├── .prettierrc
├── .eslintrc.js
├── .gitignore
└── .dockerignore
```

## 앱 간 의존 관계

```
apps/{name}
  ├── @workspace/ui-{name}            (앱 전용 UI: sh-ui 컴포넌트, 스타일)
  ├── @workspace/ui-core              (공통 유틸: cn 등)
  ├── @workspace/eslint-config        (ESLint 규칙)
  └── @workspace/typescript-config    (tsconfig)

packages/ui/ui-apps/ui-{name}
  ├── @workspace/ui-core
  ├── @workspace/eslint-config
  └── @workspace/typescript-config
```

## 시작하기

```bash
pnpm install
pnpm dev          # 모든 앱 동시 실행
```

## 앱 추가

```bash
npx sh-ui-cli create add-app
```

`apps/{name}/` 과 `packages/ui/ui-apps/ui-{name}/` 을 함께 생성합니다.

## 개별 앱 실행

```bash
pnpm --filter web dev
pnpm --filter admin build
```

## sh-ui 컴포넌트 추가

```bash
# 모든 ui 패키지에 추가 (대화형)
npx sh-ui-cli create add-component button

# 특정 앱에만 추가
npx sh-ui-cli create add-component button --app web
```

내부적으로 `packages/ui/ui-apps/ui-{app}/` 디렉토리에서 `npx sh-ui add button` 이 실행되며,
각 패키지의 `sh-ui.config.json` 에 선언된 경로로 컴포넌트가 복사됩니다.
