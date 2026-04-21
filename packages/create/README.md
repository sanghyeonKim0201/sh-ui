# @sh-ui/create

sh-ui 기반 Next.js / Flutter 프로젝트 스캐폴드 CLI.

## 빠른 시작

```bash
npm create @sh-ui my-app
# 또는
npx @sh-ui/create
```

## 대화형 프롬프트

1. **프로젝트 이름** — 생성할 디렉토리 이름
2. **플랫폼** — Next.js / Flutter
3. **(Next.js) 구조** — 단독 / 모노레포 (Turborepo + pnpm)
4. **(Next.js) 플러그인** — Sentry, next-intl 중 선택

## 생성되는 구조

### Next.js standalone

```
my-app/
├── app/                    # App Router
├── src/                    # FSD 구조 (shared/features/entities/...)
├── sh-ui.config.json
└── package.json
```

### Flutter standalone

```
my-app/
├── lib/
│   ├── main.dart
│   └── sh_ui/foundation/sh_ui_tokens.dart
├── pubspec.yaml
└── sh-ui.config.json
```

## 다음 단계

```bash
cd my-app

# Next.js
pnpm install && pnpm dev

# Flutter
flutter pub get && flutter run

# 컴포넌트 추가
npx sh-ui add button
npx sh-ui add card input
```

## 더 알아보기

- sh-ui 디자인 시스템: https://github.com/sanghyeonKim0201/sh-ui
- `@sh-ui/cli` (컴포넌트 추가 CLI): https://www.npmjs.com/package/@sh-ui/cli

## 라이선스

MIT
