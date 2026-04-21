# Monorepo Template

Turborepo + pnpm workspace 기반 모노레포 템플릿.

## 기술 스택

- **Turborepo** (빌드 오케스트레이션)
- **pnpm 10** (워크스페이스 패키지 매니저)
- **TypeScript 5.9**
- **ESLint 9** (flat config)
- **Prettier** (tailwind 플러그인)

## 프로젝트 구조

```
├── apps/                         # 애플리케이션
│   └── (nextjs-app 템플릿으로 추가)
│
├── packages/
│   ├── ui/                       # 공유 UI 컴포넌트 (shadcn/ui)
│   │   ├── src/
│   │   │   ├── components/       # shadcn 컴포넌트
│   │   │   ├── hooks/            # 공유 훅
│   │   │   ├── lib/
│   │   │   │   └── utils.ts      # cn() 유틸리티
│   │   │   └── styles/
│   │   │       └── globals.css   # Tailwind + shadcn 테마 변수
│   │   ├── components.json       # shadcn/ui 설정
│   │   ├── postcss.config.mjs
│   │   └── package.json          # exports: globals.css, components/*, lib/*, hooks/*
│   │
│   ├── eslint-config/            # 공유 ESLint 설정
│   │   ├── base.js               # 기본 (TS + Turbo + Prettier)
│   │   ├── next.js               # Next.js 앱용
│   │   ├── react-internal.js     # React 라이브러리용
│   │   └── fsd.js                # FSD 레이어 규칙 (boundaries, 파일 네이밍)
│   │
│   └── typescript-config/        # 공유 TypeScript 설정
│       ├── base.json             # 기본 (strict, ES2022)
│       ├── nextjs.json           # Next.js 앱용 (Bundler, JSX preserve)
│       └── react-library.json    # React 라이브러리용 (react-jsx)
│
├── turbo.json                    # Turbo 태스크 파이프라인
├── pnpm-workspace.yaml           # apps/* + packages/*
├── .prettierrc
├── .eslintrc.js
├── .gitignore
└── .dockerignore
```

## 앱 간 의존 관계

```
apps/{name}
  ├── @workspace/ui                 (UI 컴포넌트, 스타일)
  ├── @workspace/eslint-config      (ESLint 규칙)
  └── @workspace/typescript-config  (tsconfig)

packages/ui
  ├── @workspace/eslint-config
  └── @workspace/typescript-config
```

## 시작하기

```bash
pnpm install
pnpm dev          # 모든 앱 동시 실행
```

## 앱 추가

CLI 사용:
```bash
node /path/to/project-templates/bin/create.js add-app
```

## 개별 앱 실행

```bash
pnpm --filter web dev
pnpm --filter admin build
```

## shadcn/ui 컴포넌트 추가

```bash
cd packages/ui
npx shadcn@latest add button
```
