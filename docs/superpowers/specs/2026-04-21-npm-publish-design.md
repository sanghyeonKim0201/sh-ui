# `@sh-ui/create` + `@sh-ui/cli` — npm 로컬 수동 publish 설계

- 날짜: 2026-04-21
- 대상 패키지: `packages/create` (`@sh-ui/create`), `packages/cli` (`@sh-ui/cli`)
- 목표: 두 패키지를 npm 에 **처음으로 공개 publish** 한다. 이후 사용자가 `npm create @sh-ui my-app` 으로 프로젝트를 만들고 `npx sh-ui add button` 으로 위젯을 받는 완결된 경험을 만든다.

## 배경

sh-ui 본체는 이미 React·Flutter 듀얼 플랫폼을 모두 지원하고, `@sh-ui/create` 는 Next.js + Flutter 스타터를 생성할 수 있다(B 단계에서 완성). 하지만 두 패키지 모두 `private: true` 상태라 npm 에서 받을 수 없다. 결과적으로 외부 사용자는 레포를 clone 해 `pnpm link` 해야 하는 장벽을 겪는다.

또한 **`@sh-ui/create` 만 publish 하면 반쪽** 이다. 템플릿(특히 B 단계에서 추가된 Flutter standalone)이 `npx sh-ui add <widget>` 을 안내하는데, 그 시점에 `@sh-ui/cli` 가 npm 에 없으면 사용자는 첫 step 부터 막힌다. 따라서 **create 와 cli 를 함께 publish** 하는 것이 최소 단위다.

## 스코프 결정 — 범위 고정

**포함:**
- `@sh-ui/create` 공개 publish
- `@sh-ui/cli` 공개 publish
- 두 패키지의 `package.json` 메타(라이선스, repository, keywords, publishConfig, prepublishOnly) 정리
- 각 패키지 루트에 `LICENSE` 실제 파일 배치
- npm 공개 시 사용자가 처음 보는 README.md 두 개 정비 (create / cli)
- 템플릿의 placeholder `$schema` URL 제거 (nextjs-standalone / flutter-standalone 두 곳)
- `versions.json` 에 `0.17.1` 엔트리 추가 + GitHub Release

**비범위:**
- **자동화 publish** (Jenkins / GitHub Actions) — 첫 publish 는 관찰이 필요. 두세 번째 release 에서 패턴 안정되면 별건 과제.
- **`@sh-ui/llms`, `@sh-ui/tokens` publish** — 사내 빌드 도구 성격, 외부 소비자 부재 의심. YAGNI.
- **`provenance` 배지** — GH Actions 전용 기능. 자동화 이관 시 같이 켬.
- **semantic-release / changesets 도입** — solo dev 에 과함, 현재 `versions.json` 수동 흐름과 중복.
- **템플릿 `main.dart` 내 `fontSize` 하드코딩 교체** — B 단계 리뷰에서 flag 된 nice-to-have, 이번 스코프와 무관.
- **`npm deprecate` / `unpublish` 정책** — 첫 publish 후 실제 경험 쌓이면 정리.

## 아키텍처 결정

### 1. 트리거 — **로컬 수동 publish**

`npm login` → `pnpm --filter <pkg> publish --access public` 을 로컬에서 직접 실행. 이유:
- 첫 publish 는 관찰해야 할 변수가 많다 (org 생성, scope 선점, tarball 내용, 스코프별 access 설정). 자동화 뒤에 숨기면 문제가 조용히 넘어감.
- 레포에 Jenkins 미연결 상태 → 인프라 구축부터는 YAGNI.
- 산출물로 **재현 가능한 체크리스트·스크립트·가이드 문서** 를 만들면 나중에 Jenkins/GH Actions 이관도 수월.

### 2. 패키지 범위 — **create + cli 동시**

`@sh-ui/create` 만 publish 하면 생성된 프로젝트에서 `sh-ui add` 가 동작하지 않음. 두 패키지는 사용자 관점에서 한 묶음이며, publish 인프라(인증·버전·scripts)는 한 번 만들면 둘이 공유한다. `@sh-ui/llms`, `@sh-ui/tokens` 는 사내 도구라 YAGNI.

### 3. 라이선스 — **MIT**

sh-ui 의 "코드 소유권은 사용자에게" 철학과 부합하는 가장 permissive 라이선스. 파생 작업·재조합 자유도 최대.

### 4. `LICENSE` 파일 — **각 publish 패키지에 실제 복사본**

`license` 필드만 있고 물리 파일이 없으면 tarball 에 LICENSE 가 포함되지 않아 OSS 관습상 불완전. 심볼릭 링크는 Windows 호환성 문제. 복사본은 거의 안 변하므로 유지비 부담 없음.

### 5. 버전 정책 — **PATCH 범프**

"public 전환" 은 **공개 상태 변화** 이지 코드 기능 변화가 아님. 하지만 `$schema` 필드 제거 + `publishConfig`/`license`/`keywords`/`repository` 메타 추가가 동반되므로 PATCH 범프가 자연스럽다:
- `@sh-ui/create`: `0.17.0` → `0.17.1`
- `@sh-ui/cli`: `0.14.0` → `0.14.1`

Git 태그는 레포 기준으로 `v0.17.1` 하나만. 각 npm 패키지 버전은 `package.json` 이 권위 있음.

## 선행 조건 (사용자 액션, 구현 태스크 아님)

플랜이 구현을 시작하기 전에 사용자가 수행해야 할 것들. 스펙·플랜에 체크리스트로 명시:

1. **npm Organization 생성** — npmjs.com 에 로그인 → Create Organization → 이름 `sh-ui` → Free plan 선택
2. **로컬 npm 인증** — 터미널에서 `npm login` (사용자: `sanghyeonKim0201`)
3. **org 소유권 확인** — `npm org ls sh-ui` 가 사용자 본인을 owner/publisher 로 표시하는지 확인

세 가지 모두 외부 계정 조작이므로 Claude Code 는 대신 수행 불가. 플랜은 이 선행 조건이 충족된 상태를 전제로 실행한다.

## 패키지 레벨 변경

두 `package.json` 에 동일한 템플릿 적용.

### `packages/create/package.json` 변경

```diff
 {
   "name": "@sh-ui/create",
   "version": "0.17.0",
-  "private": true,
   "description": "sh-ui create — 프로젝트 스캐폴드 CLI (Next.js / Turborepo 모노레포)",
+  "license": "MIT",
+  "repository": {
+    "type": "git",
+    "url": "https://github.com/sanghyeonKim0201/sh-ui.git",
+    "directory": "packages/create"
+  },
+  "homepage": "https://github.com/sanghyeonKim0201/sh-ui#readme",
+  "bugs": {
+    "url": "https://github.com/sanghyeonKim0201/sh-ui/issues"
+  },
+  "keywords": ["sh-ui", "scaffold", "cli", "nextjs", "flutter", "create"],
+  "publishConfig": {
+    "access": "public"
+  },
   "type": "module",
   "bin": { "sh-ui-create": "./bin/create.js" },
   "scripts": {
     "create": "node bin/create.js",
     "add-app": "node bin/create.js add-app",
-    "test": "vitest run"
+    "test": "vitest run",
+    "prepublishOnly": "pnpm test"
   },
-  "files": ["bin", "src", "templates"],
+  "files": ["bin", "src", "templates", "LICENSE", "README.md"],
   ...
 }
```

버전은 **Task 로 별도 bump** — 최종 릴리즈 단계에서 `0.17.0` → `0.17.1`.

### `packages/cli/package.json` 변경

```diff
 {
   "name": "@sh-ui/cli",
   "version": "0.14.0",
-  "private": true,
   "description": "sh-ui CLI — sh-ui init / sh-ui add",
+  "license": "MIT",
+  "repository": {
+    "type": "git",
+    "url": "https://github.com/sanghyeonKim0201/sh-ui.git",
+    "directory": "packages/cli"
+  },
+  "homepage": "https://github.com/sanghyeonKim0201/sh-ui#readme",
+  "bugs": {
+    "url": "https://github.com/sanghyeonKim0201/sh-ui/issues"
+  },
+  "keywords": ["sh-ui", "cli", "design-system", "registry", "components"],
+  "publishConfig": {
+    "access": "public"
+  },
+  "scripts": {
+    "prepublishOnly": "pnpm typecheck"
+  },
   "type": "module",
   "bin": { "sh-ui": "./bin/sh-ui.mjs" },
-  "files": ["bin", "src"]
+  "files": ["bin", "src", "LICENSE", "README.md"]
 }
```

버전: 최종 릴리즈 단계에서 `0.14.0` → `0.14.1`.

### `prepublishOnly` 차등

| 패키지 | hook | 이유 |
|---|---|---|
| `@sh-ui/create` | `pnpm test` | vitest 스모크 5개 이미 존재 (A 단계 산출물) |
| `@sh-ui/cli` | `pnpm typecheck` | 테스트 없음. typecheck 만이라도 publish 전 통과 확인. `pnpm typecheck` 는 루트 turbo pipeline 에서 `@sh-ui/cli` 도 포함 |

각자 의미 있는 최소 검증.

## LICENSE 파일 배치

루트 `LICENSE` (신규) + 각 publish 패키지 루트에 실제 복사본.

루트 `LICENSE` (표준 MIT 텍스트):
```
MIT License

Copyright (c) 2026 SangHyeon Kim

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
... (플랜 단계에서 표준 MIT 본문 전문을 삽입)
```

`packages/create/LICENSE` = 루트 `LICENSE` 내용 그대로 복사.
`packages/cli/LICENSE` = 루트 `LICENSE` 내용 그대로 복사.

두 복사본 모두 `files` 배열에 포함되어 tarball 에 들어감.

## README.md 패키지별 (npm 페이지 노출용)

### `packages/create/README.md` (교체)

구조:
```markdown
# @sh-ui/create

sh-ui 기반 Next.js / Flutter 프로젝트 스캐폴드 CLI.

## 빠른 시작

\`\`\`bash
npm create @sh-ui my-app
# 또는
npx @sh-ui/create
\`\`\`

## 대화형 프롬프트

1. 프로젝트 이름
2. 플랫폼 — Next.js / Flutter
3. (Next.js) 구조 — 단독 / 모노레포
4. (Next.js) 플러그인 — Sentry, next-intl

## 생성되는 구조

### Next.js standalone
\`\`\`
my-app/
├── app/          # App Router
├── src/          # FSD 구조
├── sh-ui.config.json
└── package.json
\`\`\`

### Flutter standalone
\`\`\`
my-app/
├── lib/
│   ├── main.dart
│   └── sh_ui/foundation/sh_ui_tokens.dart
├── pubspec.yaml
└── sh-ui.config.json
\`\`\`

## 다음 단계

\`\`\`bash
cd my-app
# Next.js:
pnpm install && pnpm dev
# Flutter:
flutter pub get && flutter run

# 위젯 추가
npx sh-ui add button
\`\`\`

## 라이선스

MIT — [sh-ui 레포](https://github.com/sanghyeonKim0201/sh-ui)
```

### `packages/cli/README.md` (신규 또는 교체)

구조:
```markdown
# @sh-ui/cli

sh-ui 디자인 시스템 컴포넌트를 프로젝트로 복사하는 CLI. shadcn 방식 — 프로젝트가 소스를 소유한다.

## 설치

\`\`\`bash
npm i -D @sh-ui/cli
# 또는 ad-hoc:
npx @sh-ui/cli <command>
\`\`\`

## 주요 커맨드

### init — 설정 파일 생성
\`\`\`bash
npx sh-ui init
# platform: react | flutter
# base: neutral | zinc | slate
# radius: none | sm | md | lg | xl | full
# mode: light-dark | light | dark
\`\`\`

### add — 컴포넌트 추가
\`\`\`bash
npx sh-ui add button
npx sh-ui add card input
npx sh-ui add button --diff   # 파일 변경 미리보기
\`\`\`

### list — 설치된 컴포넌트 목록
\`\`\`bash
npx sh-ui list
\`\`\`

### remove — 컴포넌트 제거
\`\`\`bash
npx sh-ui remove button
\`\`\`

## 지원 플랫폼

- **React (Next.js)** — `src/shared/ui/` 또는 `sh-ui.config.json` 에 지정된 경로로 복사
- **Flutter** — `lib/sh_ui/widgets/` 또는 지정 경로로 복사

## 설정 파일 (`sh-ui.config.json`)

\`\`\`json
{
  "platform": "react",
  "theme": { "base": "neutral", "radius": "md", "mode": "light-dark" },
  "paths": {
    "tokens": "src/styles/tokens.css",
    "components": "src/components/ui",
    "utils": "src/lib/utils.ts"
  }
}
\`\`\`

## 라이선스

MIT — [sh-ui 레포](https://github.com/sanghyeonKim0201/sh-ui)
```

두 README 모두 짧고 실용적으로 (100~150줄 수준). 상세 문서는 docs 사이트·레포 README 위임.

## 템플릿 정리

B 단계 code quality reviewer 가 flag 한 nice-to-have 2건이 이번에 자연스럽게 해소됨:

| 이슈 | 해결 방안 |
|---|---|
| 템플릿의 `npx sh-ui add` 안내 | `@sh-ui/cli` 가 publish 되므로 **참조가 유효해짐** — 추가 수정 불필요 |
| `sh-ui.config.json` 의 `$schema: "https://your-ds.dev/sh-ui.schema.json"` placeholder | 실제 스키마가 존재하지 않으므로 **필드 제거**. `packages/create/templates/flutter-standalone/sh-ui.config.json` + `packages/create/templates/nextjs-standalone/sh-ui.config.json` 두 파일 적용 |

세 번째 nice-to-have (`main.dart` 의 `fontSize` 하드코딩)은 이번 스코프와 무관하므로 별건.

## Dry-run 검증 단계

실제 `npm publish` 전 반드시 수행:

```bash
# 1. 테스트 / 타입체크
pnpm --filter @sh-ui/create test
pnpm --filter @sh-ui/cli typecheck

# 2. tarball 시뮬레이션 (실제 publish 안 함)
cd packages/create && npm pack --dry-run 2>&1 | tee /tmp/create-pack.log
cd ../cli && npm pack --dry-run 2>&1 | tee /tmp/cli-pack.log

# 3. 내용 검증 — 예상 파일만 포함되는지 수동 확인
#    특히 .env, node_modules, .git, 테스트 파일 등 누출 여부
```

`npm pack --dry-run` 출력에서 확인 필수:
- **포함 O**: `bin/`, `src/`, `LICENSE`, `README.md`, `package.json`, (create 만) `templates/`
- **포함 X**: `test/`, `node_modules/`, `.DS_Store`, `.git*`, `*.log`

## publish 실행 순서

선행 조건 충족된 상태에서:

```bash
# 1. dry-run 완료 후 create 먼저 publish
pnpm --filter @sh-ui/create publish --access public --no-git-checks

# 2. 성공 시 cli publish
pnpm --filter @sh-ui/cli publish --access public --no-git-checks

# 3. 설치 검증 — 다른 tmp 디렉토리에서
cd $(mktemp -d)
npm create @sh-ui test-app
cd test-app
npx sh-ui list || echo "cli 접근 OK"
```

**순서가 중요**: `create` 먼저 — `cli` 는 create 템플릿이 필요하지 않지만, `create` 가 생성하는 프로젝트가 `cli` 를 찾으므로 두 패키지가 **동시점에 존재** 해야 함. 실제 publish 시점 차이는 수초~수분 수준이라 현실적 문제 없음. 두 번째 publish 실패 시 첫 publish 도 `npm deprecate` 로 회수 가능.

**`--no-git-checks`** — pnpm publish 기본은 clean working tree + 태그 존재 체크. 이번 흐름은 태그를 publish **후에** 만들 수 있으므로 끔. (flag 의미상 안전: dry-run 에서 내용 이미 확인).

## 릴리즈 통합

### 커밋 구조

CLAUDE.md 의 "소스 + versions.json + (CLI 변경이면) package.json 한 커밋" 규정을 적용하되, 이번은 두 패키지 + 템플릿 + README + LICENSE + 루트 LICENSE 등 **논리적으로 구분되는 변경 묶음이 여러 개**라 2~3 커밋으로 나눠도 무방. 최종 릴리즈 커밋에만 versions.json + 양 package.json version bump 가 함께 들어가면 됨.

제안 커밋 분할:
1. `chore(license): MIT 라이선스 추가` — 루트 + 각 패키지 LICENSE
2. `chore(create,cli): package.json publish 메타 추가` — repository, keywords, license, publishConfig, prepublishOnly, files 확장
3. `docs(create,cli): README npm 공개용 개정` — 두 README 교체
4. `chore(templates): sh-ui.config.json $schema placeholder 제거`
5. `chore(release): sh-ui v0.17.1 — 첫 npm publish` — version bump + versions.json prepend. 이 커밋 직후 `npm publish` 실행.

### versions.json 엔트리

```json
{
  "version": "0.17.1",
  "date": "2026-04-21",
  "title": "sh-ui — npm 첫 공개 publish",
  "type": "patch",
  "highlights": [
    "@sh-ui/create 와 @sh-ui/cli 를 npm 에 공개 publish — `npm create @sh-ui <name>` 으로 시작",
    "각 패키지 package.json 에 license / repository / keywords / publishConfig 메타 추가, MIT 라이선스 명시",
    "템플릿의 sh-ui.config.json 내 placeholder $schema URL 제거"
  ],
  "url": "https://github.com/sanghyeonKim0201/sh-ui/releases/tag/v0.17.1"
}
```

### Git 태그 + GitHub Release

```bash
git push origin dev
git tag v0.17.1
git push origin v0.17.1
gh release create v0.17.1 \
  --title "v0.17.1 — sh-ui npm 첫 공개 publish" \
  --notes "...highlights 기반..."
```

태그는 레포 버전 기준(`v0.17.1`). 각 npm 패키지 버전은 package.json 이 권위.

## 성공 기준

- `npm view @sh-ui/create` 과 `npm view @sh-ui/cli` 가 각각 `0.17.1` / `0.14.1` 반환
- 임의 디렉토리에서 `npm create @sh-ui test-app` 이 대화형 프롬프트 동작
- 생성된 프로젝트에서 `npx sh-ui list` 가 컴포넌트 목록 출력
- 생성된 Flutter 프로젝트에서 `npx sh-ui add button` 이 `lib/sh_ui/widgets/sh_ui_button.dart` 복사
- npm 각 패키지 페이지에 **README + LICENSE + keywords 뱃지** 정상 노출
- `git log --oneline` 에 v0.17.1 릴리즈 체인 존재
- `gh release view v0.17.1` 정상 응답
- `pnpm --filter @sh-ui/create test` 여전히 5/5 통과 (publish 메타 변경이 테스트에 영향 없음)

## 후속 과제 (별건)

- **자동화 publish** — Jenkins 세팅 완료 후, 또는 GH Actions 도입 시. `prepublishOnly` 를 CI 검증으로 확장, `provenance: true` 활성화.
- **`@sh-ui/llms`, `@sh-ui/tokens` publish 여부 재검토** — 사용 사례 있으면 검토.
- **템플릿 `main.dart` 의 `fontSize` 하드코딩 → 토큰 경유** — B 단계 잔여.
- **`sh-ui.config.json` 실제 스키마 작성** — placeholder 제거 대신 실제 스키마 publish 경로.
- **`npm deprecate` / `unpublish` 정책** — 첫 publish 후 경험 기반.
