# Next.js App Template (모노레포용)

모노레포 `apps/` 하위에 배치되는 Next.js 앱 템플릿.
UI 컴포넌트는 `@workspace/ui` 패키지를 참조하며, shadcn/ui를 직접 포함하지 않음.

## 기술 스택

- **Next.js 16** (App Router, React Compiler, standalone 출력)
- **React 19**
- **TypeScript 5.9**
- **@workspace/ui** (shadcn/ui 컴포넌트 패키지)
- **TanStack React Query** + **Axios**
- **Zustand**
- **next-themes** + **Sonner**
- **Zod**
- **Vitest** + **Testing Library**
- **Docker** 지원

## 프로젝트 구조

```
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── layout.tsx        # 루트 레이아웃 (@workspace/ui/globals.css import)
│   │   ├── page.tsx
│   │   └── providers.tsx     # 글로벌 프로바이더
│   ├── views/                # FSD: 페이지 단위 뷰
│   ├── widgets/              # FSD: 조합형 UI 블록
│   ├── features/             # FSD: 기능 단위
│   ├── entities/             # FSD: 비즈니스 엔티티
│   └── shared/               # FSD: 공유 유틸, 설정, 타입
├── components.json           # shadcn CLI용 (컴포넌트는 packages/ui로 설치됨)
├── eslint.config.js          # @workspace/eslint-config 사용
├── tsconfig.json             # @workspace/typescript-config 확장
├── postcss.config.mjs        # @workspace/ui/postcss.config 재사용
├── next.config.ts
├── vitest.config.ts
├── Dockerfile
└── .env.example
```

## 워크스페이스 의존성

```
apps/{name}/
  └── @workspace/ui          → packages/ui
  └── @workspace/eslint-config → packages/eslint-config
  └── @workspace/typescript-config → packages/typescript-config
```

## shadcn/ui 컴포넌트 추가

모노레포 루트 또는 앱 디렉토리에서:

```bash
npx shadcn@latest add button
```

`components.json`의 aliases 설정에 의해 컴포넌트가 `packages/ui/src/components/`에 설치됨.
