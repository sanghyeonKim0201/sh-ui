# sh-ui

**짧은 이름, 단단한 기본기** — 담백하게 설계된 멀티 플랫폼 디자인 시스템.

블랙 & 화이트를 기본으로, 당신의 설정대로 벼려져 내려받는다.

## 빠른 시작

```bash
# 새 프로젝트 스캐폴드 (Next.js / Flutter)
npx sh-ui-cli create my-app

# 기존 프로젝트에 sh-ui 도입
npx sh-ui-cli init
npx sh-ui-cli add tokens button
```

플레이그라운드에서 테마를 편집하고 그대로 반영된 명령어를 얻으려면 [sh-ui.dev/create](https://github.com/sanghyeonKim0201/sh-ui) 참고.

## 철학

- **코드 소유권은 사용자에게** — shadcn처럼 컴포넌트 소스를 프로젝트로 복사하는 방식
- **하나의 토큰, 여러 플랫폼** — React(Next.js), Flutter, 그 이상
- **설정 파일 기반 변환** — `sh-ui.config.json`에 정의한 테마/radius/스타일로 복사 시점에 변환

## npm 패키지

| 패키지 | 역할 |
|---|---|
| [`sh-ui-cli`](https://www.npmjs.com/package/sh-ui-cli) | 통합 CLI — 프로젝트 스캐폴드(`create`) · 컴포넌트 복사·설정 관리(`init/add/list/remove`) · IDE-내 AI 용 MCP 서버(`mcp`) |

## 구조

```
sh-ui/
├── packages/
│   ├── tokens/       # 디자인 토큰 (primitive / semantic)
│   ├── registry/     # 플랫폼별 컴포넌트 소스 (복사 대상)
│   ├── cli/          # sh-ui-cli — 통합 CLI (create/init/add/list/remove/mcp)
│   ├── changelog/    # versions.json (단일 소스)
│   └── llms/         # llms.txt 생성 (AI 도구용 컴포넌트 인벤토리)
└── apps/
    └── docs/         # 문서 사이트 (Next.js)
```

## 토큰 계층

1. **Primitive** — 실제 값 (`color.neutral.500`, `spacing.4`)
2. **Semantic** — primitive 참조 (`background.default`, `text.primary`)
3. **Component** — (선택) semantic 참조 (`button.primary.background`)

컴포넌트는 오직 **semantic** 계층만 참조한다.

## 개발

```bash
pnpm install
pnpm dev        # docs 사이트 (localhost:3000)
pnpm -r test    # 패키지별 테스트
```

## 라이선스

MIT
