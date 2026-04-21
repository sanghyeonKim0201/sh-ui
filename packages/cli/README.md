# @sh-ui/cli

sh-ui 디자인 시스템의 컴포넌트를 프로젝트로 복사하는 CLI. shadcn 방식 — 프로젝트가 소스를 소유한다.

## 설치

```bash
# 프로젝트 dev 의존성으로
npm i -D @sh-ui/cli

# 또는 ad-hoc 실행
npx @sh-ui/cli <command>
```

## 사용법

### init — 설정 파일 생성

```bash
npx sh-ui init
# 대화형 프롬프트:
#   platform: react | flutter
#   base:     neutral | zinc | slate
#   radius:   none | sm | md | lg | xl | full
#   mode:     light-dark | light | dark
```

비대화형 예:

```bash
npx sh-ui init --platform react --base neutral --radius md --mode light-dark --yes
```

### add — 컴포넌트 추가

```bash
npx sh-ui add button
npx sh-ui add card input
npx sh-ui add button --diff   # 파일 변경 미리보기(실제 쓰지 않음)
```

### list — 설치된 컴포넌트 목록

```bash
npx sh-ui list
```

### remove — 컴포넌트 제거

```bash
npx sh-ui remove button
```

## 지원 플랫폼

- **React (Next.js)** — `src/shared/ui/` 또는 `sh-ui.config.json` 에 지정된 경로로 복사
- **Flutter** — `lib/sh_ui/widgets/` 또는 지정 경로로 복사

## 설정 파일 (`sh-ui.config.json`)

```json
{
  "platform": "react",
  "style": "default",
  "theme": { "base": "neutral", "radius": "md", "mode": "light-dark" },
  "paths": {
    "tokens": "src/shared/styles/tokens.css",
    "components": "src/shared/ui",
    "utils": "src/shared/lib/utils.ts"
  }
}
```

## 더 알아보기

- sh-ui 디자인 시스템: https://github.com/sanghyeonKim0201/sh-ui
- `@sh-ui/create` (프로젝트 스캐폴드): https://www.npmjs.com/package/@sh-ui/create

## 라이선스

MIT
