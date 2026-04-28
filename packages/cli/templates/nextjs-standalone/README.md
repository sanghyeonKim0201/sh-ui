# Next.js Standalone Template

단독 실행 가능한 Next.js 프로젝트 템플릿 (sh-ui 기반).

## 기술 스택

- **Next.js 16** (App Router, React Compiler)
- **React 19**
- **TypeScript 5.9**
- **Tailwind CSS 4** + **sh-ui** (neutral, radius=md, light-dark)
- **@base-ui-components/react** (sh-ui가 의존하는 언스타일드 primitive)
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
├── app/                      # Next.js App Router
│   ├── layout.tsx            # 루트 레이아웃
│   ├── page.tsx              # 홈 페이지
│   └── globals.css           # Tailwind + sh-ui tokens import
├── src/
│   ├── app/
│   │   └── providers/        # QueryClient, Theme, Toaster
│   ├── shared/               # FSD: 공유 유틸/설정/UI
│   │   ├── ui/               # ← sh-ui 컴포넌트가 여기로 복사됨
│   │   ├── lib/
│   │   │   └── utils.ts      # cn() 유틸
│   │   ├── styles/
│   │   │   └── tokens.css    # sh-ui 디자인 토큰
│   │   ├── hooks/
│   │   ├── api/
│   │   ├── config/
│   │   └── model/
│   ├── views/                # FSD: 페이지 단위 뷰
│   ├── widgets/              # FSD: 조합형 UI 블록
│   ├── features/             # FSD: 기능 단위
│   └── entities/             # FSD: 비즈니스 엔티티
├── sh-ui.config.json         # sh-ui 설정 (platform, theme, paths)
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

## sh-ui 컴포넌트 추가

```bash
npx sh-ui-cli add button
npx sh-ui-cli add dialog
```

`sh-ui.config.json` 의 `paths.components` 설정에 따라 `src/shared/ui/` 에 복사됩니다.
토큰을 커스텀하려면 `sh-ui.config.json` 의 `theme` 값을 바꾸고 `npx sh-ui-cli add tokens` 로 재생성.
