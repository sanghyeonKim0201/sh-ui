# Next.js App Template (모노레포용)

모노레포 `apps/` 하위에 배치되는 Next.js 앱 템플릿.
UI 컴포넌트는 `@workspace/ui-{name}` 패키지를 참조하며, sh-ui 설정을 직접 갖지 않음.

## 기술 스택

- **Next.js 16** (App Router, React Compiler, standalone 출력)
- **React 19**
- **TypeScript 5.9**
- **@workspace/ui-{name}** (sh-ui 컴포넌트 패키지)
- **TanStack React Query** + **Axios**
- **Zustand**
- **next-themes** + **Sonner**
- **Zod**
- **Vitest** + **Testing Library**
- **Docker** 지원

## 프로젝트 구조

```
├── app/                      # Next.js App Router
│   ├── layout.tsx            # 루트 레이아웃 (@workspace/ui-{name}/globals.css import)
│   └── page.tsx
├── src/
│   ├── app/
│   │   └── providers/        # QueryClient, Theme, Toaster
│   ├── shared/               # FSD: 공유 유틸, 설정, 타입
│   ├── entities/
│   ├── features/
│   ├── views/
│   └── widgets/
├── eslint.config.js          # @workspace/eslint-config 사용
├── tsconfig.json             # @workspace/typescript-config 확장
├── postcss.config.mjs        # @workspace/ui-{name}/postcss.config 재사용
├── next.config.ts
├── vitest.config.ts
├── Dockerfile
└── .env.example
```

## 워크스페이스 의존성

```
apps/{name}/
  ├── @workspace/ui-{name}          → packages/ui/ui-apps/ui-{name}  (sh-ui 컴포넌트 + 테마)
  ├── @workspace/ui-core            → packages/ui/ui-core            (cn 등 유틸)
  ├── @workspace/eslint-config      → packages/eslint-config
  └── @workspace/typescript-config  → packages/typescript-config
```

## sh-ui 컴포넌트 추가

모노레포 루트에서:

```bash
# 모든 ui 패키지에 추가 (대화형)
npx sh-ui-create add-component button

# 이 앱의 ui 패키지에만 추가
npx sh-ui-create add-component button --app {name}
```

각 `ui-{app}/` 패키지의 `sh-ui.config.json` 경로 설정에 따라 `src/components/` 로 복사됨.
