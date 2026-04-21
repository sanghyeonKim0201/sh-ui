# Next.js Standalone Template

단독 실행 가능한 Next.js 프로젝트 템플릿.

## 기술 스택

- **Next.js 16** (App Router, React Compiler)
- **React 19**
- **TypeScript 5.9**
- **Tailwind CSS 4** + **shadcn/ui** (base-nova, neutral)
- **TanStack React Query** + **Axios** (데이터 페칭)
- **Zustand** (상태 관리)
- **next-themes** (다크 모드)
- **Sonner** (토스트)
- **Zod** (유효성 검증)
- **ESLint 9** (flat config, FSD 규칙 포함)
- **Prettier** (tailwind 플러그인)
- **Vitest** + **Testing Library**

## 프로젝트 구조

```
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── layout.tsx        # 루트 레이아웃
│   │   ├── page.tsx          # 홈 페이지
│   │   ├── providers.tsx     # 글로벌 프로바이더 (QueryClient, Theme, Toaster)
│   │   └── globals.css       # Tailwind + shadcn 테마 변수
│   ├── components/           # shadcn/ui 컴포넌트 (npx shadcn@latest add ...)
│   ├── lib/
│   │   └── utils.ts          # cn() 유틸리티
│   ├── views/                # FSD: 페이지 단위 뷰
│   ├── widgets/              # FSD: 조합형 UI 블록
│   ├── features/             # FSD: 기능 단위
│   ├── entities/             # FSD: 비즈니스 엔티티
│   └── shared/               # FSD: 공유 유틸, 설정, 타입
├── components.json           # shadcn/ui 설정
├── eslint.config.js          # ESLint flat config (FSD boundaries 포함)
├── next.config.ts
├── tsconfig.json
├── vitest.config.ts
├── .prettierrc
└── .env.example
```

## FSD (Feature-Sliced Design) 레이어 규칙

```
app → view → widget → feature → entity → shared
```

상위 레이어는 하위 레이어만 import 가능. ESLint `boundaries` 플러그인으로 강제됨.

## 시작하기

```bash
pnpm install
pnpm dev
```

## shadcn/ui 컴포넌트 추가

```bash
npx shadcn@latest add button
npx shadcn@latest add dialog
```
