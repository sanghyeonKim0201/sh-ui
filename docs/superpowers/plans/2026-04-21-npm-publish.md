# `@sh-ui/create` + `@sh-ui/cli` npm 첫 publish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `@sh-ui/create` 와 `@sh-ui/cli` 두 패키지를 npm 에 처음으로 공개 publish 한다. 이후 `npm create @sh-ui <name>` 으로 프로젝트 생성 → `npx sh-ui add <widget>` 으로 위젯 추가의 완결된 사용자 경험을 만든다.

**Architecture:** package.json 메타(license, repository, keywords, publishConfig, prepublishOnly) 정리 + 각 패키지에 LICENSE + npm 공개용 README + 템플릿의 placeholder `$schema` URL 제거 + PATCH 범프(0.17.0→0.17.1, 0.14.0→0.14.1) + 로컬 수동 publish + 태그/GH Release.

**Tech Stack:** pnpm workspaces, npm registry, MIT license, vitest (create 의 prepublishOnly 용), Node 20+.

---

## 선행 조건 (사용자 액션 — 구현 태스크 아님)

**다음 세 가지가 충족된 상태로 Task 1 을 시작한다.** 충족되지 않은 경우 Claude 는 BLOCKED 리포트, 사용자에게 다음 체크를 요청:

- [ ] npmjs.com 에서 Organization `sh-ui` 생성 완료 (Free plan)
- [ ] 로컬에서 `npm login` 완료 (`npm whoami` → `sanghyeonKim0201` 출력)
- [ ] `npm org ls sh-ui` 실행 시 본인이 owner 또는 publisher 로 표시

충족 확인 명령:

```bash
npm whoami
npm org ls sh-ui
```

두 명령 모두 에러 없이 실행되고 본인 계정이 확인되어야 함.

---

## File Structure

**신규 생성:**
- `LICENSE` — 루트 MIT 라이선스
- `packages/create/LICENSE` — 루트 LICENSE 동일 복사본
- `packages/cli/LICENSE` — 루트 LICENSE 동일 복사본
- `packages/cli/README.md` — npm 공개용 README (현재 없음)

**수정:**
- `packages/create/package.json` — private 제거, license/repository/keywords/publishConfig/prepublishOnly 추가, files 확장
- `packages/cli/package.json` — 동일 계열 메타 추가 (prepublishOnly 는 `node --check bin/sh-ui.mjs`)
- `packages/create/README.md` — npm 공개용으로 교체
- `packages/create/templates/flutter-standalone/sh-ui.config.json` — `$schema` 필드 제거
- `packages/create/templates/nextjs-standalone/sh-ui.config.json` — 동일
- `packages/create/templates/ui-app-template/sh-ui.config.json` — 동일 (스펙에 2곳 언급됐으나 실제 3곳 존재, 일관성 위해 함께 정리)
- `packages/changelog/versions.json` — 0.17.1 엔트리 prepend

**릴리즈 단계:**
- `packages/create/package.json` version: `0.17.0` → `0.17.1`
- `packages/cli/package.json` version: `0.14.0` → `0.14.1`

---

## Task 1: LICENSE 파일 3개 추가

**Files:**
- Create: `LICENSE`
- Create: `packages/create/LICENSE`
- Create: `packages/cli/LICENSE`

- [ ] **Step 1: 루트 `LICENSE` 작성**

파일: `/Users/gimsanghyeon/development/PROJECT/sh-ui/LICENSE`

```
MIT License

Copyright (c) 2026 SangHyeon Kim

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

- [ ] **Step 2: 루트 LICENSE 를 두 패키지에 복사**

레포 루트에서:

```bash
cp LICENSE packages/create/LICENSE
cp LICENSE packages/cli/LICENSE
```

- [ ] **Step 3: 세 파일 존재 확인**

```bash
ls -la LICENSE packages/create/LICENSE packages/cli/LICENSE
```

Expected: 세 파일 모두 존재하고 동일한 크기 표시.

- [ ] **Step 4: Commit**

```bash
git add LICENSE packages/create/LICENSE packages/cli/LICENSE
git commit -m "$(cat <<'EOF'
chore(license): MIT 라이선스 파일 추가 (루트 + create/cli)

- 루트 LICENSE 신규
- packages/create/LICENSE, packages/cli/LICENSE — publish tarball 에 포함되도록 각 패키지 루트에 실제 복사본 배치

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: `package.json` publish 메타 추가

**Files:**
- Modify: `packages/create/package.json`
- Modify: `packages/cli/package.json`

이 태스크는 버전은 **건드리지 않는다**. 버전 범프는 Task 5 에서 별도 수행.

- [ ] **Step 1: `packages/create/package.json` 교체**

파일 전체를 다음으로 교체:

```json
{
  "name": "@sh-ui/create",
  "version": "0.17.0",
  "description": "sh-ui create — 프로젝트 스캐폴드 CLI (Next.js / Turborepo 모노레포 / Flutter)",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/sanghyeonKim0201/sh-ui.git",
    "directory": "packages/create"
  },
  "homepage": "https://github.com/sanghyeonKim0201/sh-ui#readme",
  "bugs": {
    "url": "https://github.com/sanghyeonKim0201/sh-ui/issues"
  },
  "keywords": [
    "sh-ui",
    "scaffold",
    "cli",
    "nextjs",
    "flutter",
    "create"
  ],
  "publishConfig": {
    "access": "public"
  },
  "type": "module",
  "bin": {
    "sh-ui-create": "./bin/create.js"
  },
  "scripts": {
    "create": "node bin/create.js",
    "add-app": "node bin/create.js add-app",
    "test": "vitest run",
    "prepublishOnly": "pnpm test"
  },
  "files": [
    "bin",
    "src",
    "templates",
    "LICENSE",
    "README.md"
  ],
  "dependencies": {
    "@inquirer/prompts": "^7.0.0",
    "fs-extra": "^11.2.0"
  },
  "devDependencies": {
    "vitest": "^3.2.4"
  }
}
```

주요 변경:
- `private: true` 제거
- `license`, `repository`, `homepage`, `bugs`, `keywords`, `publishConfig` 추가
- `scripts.prepublishOnly: "pnpm test"` 추가
- `files` 에 `LICENSE`, `README.md` 추가
- `description` 에 Flutter 반영

- [ ] **Step 2: `packages/cli/package.json` 교체**

파일 전체를 다음으로 교체:

```json
{
  "name": "@sh-ui/cli",
  "version": "0.14.0",
  "description": "sh-ui CLI — 디자인 시스템 컴포넌트를 프로젝트로 복사하는 CLI (sh-ui init / add / list / remove)",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/sanghyeonKim0201/sh-ui.git",
    "directory": "packages/cli"
  },
  "homepage": "https://github.com/sanghyeonKim0201/sh-ui#readme",
  "bugs": {
    "url": "https://github.com/sanghyeonKim0201/sh-ui/issues"
  },
  "keywords": [
    "sh-ui",
    "cli",
    "design-system",
    "registry",
    "components"
  ],
  "publishConfig": {
    "access": "public"
  },
  "type": "module",
  "bin": {
    "sh-ui": "./bin/sh-ui.mjs"
  },
  "scripts": {
    "prepublishOnly": "node --check bin/sh-ui.mjs"
  },
  "files": [
    "bin",
    "src",
    "LICENSE",
    "README.md"
  ]
}
```

주요 변경:
- `private: true` 제거
- `description` 보강
- `license`, `repository`, `homepage`, `bugs`, `keywords`, `publishConfig` 추가
- `scripts.prepublishOnly: "node --check bin/sh-ui.mjs"` 추가
  - 스펙은 `pnpm typecheck` 였으나 `@sh-ui/cli` 는 JS(.mjs)+타입스크립트 부재 → 의미 있는 typecheck 불가. 대신 Node 구문 검증으로 현실적 최소 게이트 확보.
- `files` 에 `LICENSE`, `README.md` 추가

- [ ] **Step 3: 기존 create 테스트가 여전히 통과하는지 확인**

```bash
pnpm --filter @sh-ui/create test
```

Expected: `Tests  5 passed (5)` — 메타 변경은 런타임 동작에 영향 없어야 함.

- [ ] **Step 4: `prepublishOnly` hook 이 실제로 의도대로 동작하는지 수동 검증 (create)**

```bash
cd packages/create && pnpm run prepublishOnly
cd ../..
```

Expected: vitest 5 passed 출력.

- [ ] **Step 5: `prepublishOnly` hook (cli) 수동 검증**

```bash
cd packages/cli && pnpm run prepublishOnly
cd ../..
```

Expected: 출력 없이 성공 종료 (Node 구문 검증 통과, exit 0).

- [ ] **Step 6: Commit**

```bash
git add packages/create/package.json packages/cli/package.json
git commit -m "$(cat <<'EOF'
chore(create,cli): package.json publish 메타 추가

- private 제거, publishConfig.access=public
- license=MIT, repository, homepage, bugs, keywords 추가
- prepublishOnly — create: pnpm test, cli: node --check bin/sh-ui.mjs
- files 에 LICENSE, README.md 포함
- 버전 범프는 릴리즈 커밋에서 별도 수행

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: README.md 두 개 정비 (npm 공개용)

**Files:**
- Modify (replace): `packages/create/README.md`
- Create: `packages/cli/README.md`

- [ ] **Step 1: `packages/create/README.md` 전체 교체**

파일 전체를 다음으로 교체:

```markdown
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
```

- [ ] **Step 2: `packages/cli/README.md` 신규 생성**

파일: `packages/cli/README.md`

```markdown
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
```

- [ ] **Step 3: Commit**

```bash
git add packages/create/README.md packages/cli/README.md
git commit -m "$(cat <<'EOF'
docs(create,cli): npm 공개용 README 정비

- packages/create/README.md — 빠른 시작·프롬프트·생성물 구조·다음 단계 중심으로 교체
- packages/cli/README.md 신규 — init/add/list/remove 사용법, 지원 플랫폼, 설정 파일 예시

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: 템플릿 `$schema` placeholder 제거

**Files:**
- Modify: `packages/create/templates/flutter-standalone/sh-ui.config.json`
- Modify: `packages/create/templates/nextjs-standalone/sh-ui.config.json`
- Modify: `packages/create/templates/ui-app-template/sh-ui.config.json`

세 파일 모두 `"$schema": "https://your-ds.dev/sh-ui.schema.json"` 를 가지고 있다. 실제 스키마가 존재하지 않는 placeholder 이므로 제거한다.

- [ ] **Step 1: `flutter-standalone/sh-ui.config.json` 수정**

파일 첫 두 줄을 다음과 같이 수정:

변경 전:
```json
{
  "$schema": "https://your-ds.dev/sh-ui.schema.json",
  "platform": "flutter",
```

변경 후:
```json
{
  "platform": "flutter",
```

`$schema` 줄 전체 삭제 + 닫는 brace 들여쓰기 유지.

- [ ] **Step 2: `nextjs-standalone/sh-ui.config.json` 수정**

변경 전:
```json
{
  "$schema": "https://your-ds.dev/sh-ui.schema.json",
  "platform": "react",
```

변경 후:
```json
{
  "platform": "react",
```

- [ ] **Step 3: `ui-app-template/sh-ui.config.json` 수정**

변경 전:
```json
{
  "$schema": "https://your-ds.dev/sh-ui.schema.json",
```

변경 후: `$schema` 줄을 제거하고 다음 줄은 그대로 유지.

- [ ] **Step 4: 세 파일 JSON 유효성 확인**

```bash
for f in packages/create/templates/flutter-standalone/sh-ui.config.json \
         packages/create/templates/nextjs-standalone/sh-ui.config.json \
         packages/create/templates/ui-app-template/sh-ui.config.json; do
  node -e "JSON.parse(require('fs').readFileSync('$f','utf-8'))" && echo "$f OK"
done
```

Expected: 세 줄 모두 `... OK` 출력.

- [ ] **Step 5: 스모크 테스트 재실행 — 시나리오 5 가 여전히 cfg.platform='flutter' 검증 통과**

```bash
pnpm --filter @sh-ui/create test
```

Expected: `Tests  5 passed (5)`. (assertion 은 `cfg.platform` 필드만 보므로 `$schema` 제거는 영향 없음.)

- [ ] **Step 6: Commit**

```bash
git add packages/create/templates/flutter-standalone/sh-ui.config.json \
        packages/create/templates/nextjs-standalone/sh-ui.config.json \
        packages/create/templates/ui-app-template/sh-ui.config.json
git commit -m "$(cat <<'EOF'
chore(templates): sh-ui.config.json placeholder \$schema 필드 제거

3곳 (flutter-standalone / nextjs-standalone / ui-app-template) 모두 실제 스키마가 존재하지 않는 placeholder URL 이었음. 필드 제거.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: 릴리즈 메타 — v0.17.1

**Files:**
- Modify: `packages/create/package.json` (version)
- Modify: `packages/cli/package.json` (version)
- Modify: `packages/changelog/versions.json`

- [ ] **Step 1: `packages/create/package.json` version bump**

```diff
-  "version": "0.17.0",
+  "version": "0.17.1",
```

- [ ] **Step 2: `packages/cli/package.json` version bump**

```diff
-  "version": "0.14.0",
+  "version": "0.14.1",
```

- [ ] **Step 3: `packages/changelog/versions.json` 에 엔트리 prepend**

`packages/changelog/versions.json` 의 `versions` 배열 맨 앞에 다음 엔트리를 prepend:

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
    },
```

**쉼표 위치 주의:** 기존 첫 엔트리(0.17.0) 바로 앞에 새 엔트리가 삽입되고, 새 엔트리 닫는 중괄호 뒤에 쉼표가 붙는다.

- [ ] **Step 4: JSON 유효성 확인**

```bash
node -e "JSON.parse(require('fs').readFileSync('packages/changelog/versions.json', 'utf-8'))" && echo "valid"
```

Expected: `valid`.

- [ ] **Step 5: 테스트 재확인**

```bash
pnpm --filter @sh-ui/create test
```

Expected: `Tests  5 passed (5)`.

- [ ] **Step 6: Commit — 릴리즈 커밋**

```bash
git add packages/create/package.json packages/cli/package.json packages/changelog/versions.json
git commit -m "$(cat <<'EOF'
chore(release): sh-ui v0.17.1 — @sh-ui/create + @sh-ui/cli npm 첫 공개 publish

- @sh-ui/create: 0.17.0 → 0.17.1
- @sh-ui/cli:    0.14.0 → 0.14.1
- versions.json 에 0.17.1 엔트리 prepend

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Dry-run 검증

실제 `npm publish` 전 tarball 내용을 점검해 민감한 파일 누출 여부, 예상 파일 포함 여부를 확인한다.

**Files:** 없음 (검증만)

- [ ] **Step 1: create — `npm pack --dry-run`**

```bash
cd packages/create
npm pack --dry-run 2>&1 | tee /tmp/sh-ui-create-pack.log
cd ../..
```

Expected 로그에서 다음 확인:
- **포함 O**: `bin/create.js`, `src/generator.js`, `src/plugins/*.js`, `templates/**`, `LICENSE`, `README.md`, `package.json`
- **포함 X**: `test/smoke.test.js`, `node_modules/`, `.git`, `.DS_Store`

특히 `test/` 디렉토리가 tarball 에 들어가지 않아야 함 (`files` 배열에 없으므로 자동 제외).

- [ ] **Step 2: cli — `npm pack --dry-run`**

```bash
cd packages/cli
npm pack --dry-run 2>&1 | tee /tmp/sh-ui-cli-pack.log
cd ../..
```

Expected 로그:
- **포함 O**: `bin/sh-ui.mjs`, `src/*.mjs`, `LICENSE`, `README.md`, `package.json`
- **포함 X**: `node_modules/`, `.git`

- [ ] **Step 3: tarball 크기 sanity check**

로그에서 `package size` 또는 `Tarball Size` 값을 확인. 각각:
- `@sh-ui/create`: 수십 KB ~ 수백 KB 예상 (템플릿 포함)
- `@sh-ui/cli`: 수십 KB 예상

둘 다 수 MB 이상이면 의심 — node_modules 누출 가능성. 로그 재확인.

- [ ] **Step 4: 점검 결과 기록 (커밋 아님, 검증만)**

확인 결과를 짧게 컨트롤러(또는 수동 검증자)에게 보고. 이상 있으면 Task 7 중단 후 원인 파악.

---

## Task 7: 실제 publish 실행

**선행 확인:** "선행 조건" 섹션의 세 체크박스가 충족된 상태여야 함 (`npm whoami` → `sanghyeonKim0201`, `npm org ls sh-ui` → 본인 owner).

**Files:** 없음 (외부 레지스트리 변경)

- [ ] **Step 1: 현재 상태 sanity check**

```bash
git status
git log --oneline -6
```

Expected: working tree clean (untracked `sh-ui.iml` 제외), Task 5 까지의 5개 커밋이 HEAD 근처에 보여야 함.

- [ ] **Step 2: `@sh-ui/create` publish**

```bash
pnpm --filter @sh-ui/create publish --access public --no-git-checks
```

**`--no-git-checks`**: pnpm 은 기본적으로 tag 존재·clean working tree 를 강제하는데, 이번 플로우는 publish 후에 태그를 만든다. 이 플래그로 해당 체크를 끈다.

Expected 출력:
- `prepublishOnly` hook 실행 → `Tests 5 passed (5)`
- `+ @sh-ui/create@0.17.1` 류의 성공 로그

실패 시:
- `E403`: scope 권한 문제 — org membership 재확인
- `EPRIVATE`: `private: true` 가 여전히 남아있는지 확인 (Task 2 에서 제거됐어야 함)
- `ENEEDAUTH`: `npm login` 재실행

- [ ] **Step 3: 외부에서 publish 결과 확인**

```bash
sleep 5  # registry 반영 대기
npm view @sh-ui/create version
```

Expected: `0.17.1`.

- [ ] **Step 4: `@sh-ui/cli` publish**

```bash
pnpm --filter @sh-ui/cli publish --access public --no-git-checks
```

Expected 출력:
- `prepublishOnly` hook 실행 → `node --check bin/sh-ui.mjs` 무출력 성공
- `+ @sh-ui/cli@0.14.1`

- [ ] **Step 5: 외부에서 cli publish 확인**

```bash
sleep 5
npm view @sh-ui/cli version
```

Expected: `0.14.1`.

- [ ] **Step 6: 사용자 경험 end-to-end 스모크**

별도 tmp 디렉토리에서 실제 `npm create @sh-ui` 가 동작하는지 수동 확인:

```bash
TMP=$(mktemp -d)
cd $TMP
npm create @sh-ui@latest test-flutter-app -- --yes 2>&1 | head -20 || echo "대화형이 필요할 수 있음"
# 대화형이면 직접 입력:
#   프로젝트 이름: test-flutter-app
#   플랫폼: Flutter
ls test-flutter-app && cat test-flutter-app/pubspec.yaml | head -3
```

Expected:
- `test-flutter-app/` 디렉토리 생성
- `pubspec.yaml` 첫 줄 `name: test-flutter-app`
- `lib/main.dart` 존재

정리:
```bash
cd /Users/gimsanghyeon/development/PROJECT/sh-ui
rm -rf $TMP
```

**이 스모크가 실패하면 BLOCKED** — publish 자체는 성공했으나 실제 배포된 패키지가 깨진 상태. `npm unpublish @sh-ui/create@0.17.1` 로 24시간 내 회수 가능 여부 확인 후 조치.

- [ ] **Step 7: Task 7 완료 보고**

publish 성공 여부와 E2E 스모크 결과를 컨트롤러에 보고. 이상 없으면 Task 8 진행.

---

## Task 8: 태그 + GitHub Release + push

**Files:** 없음 (git 작업만)

- [ ] **Step 1: `dev` push**

```bash
git push origin dev
```

Expected: Task 1–5 의 5개 커밋이 `origin/dev` 에 업로드.

- [ ] **Step 2: `v0.17.1` 태그 생성 및 push**

```bash
git tag v0.17.1
git push origin v0.17.1
```

- [ ] **Step 3: GitHub Release 생성**

```bash
gh release create v0.17.1 \
  --title "v0.17.1 — sh-ui npm 첫 공개 publish" \
  --notes "$(cat <<'EOF'
## 새 기능

- **`@sh-ui/create` 와 `@sh-ui/cli` 를 npm 에 공개 publish** — 더 이상 레포 clone / pnpm link 가 필요 없음.
- **`npm create @sh-ui <name>`** 으로 즉시 프로젝트 스캐폴드 가능 (Next.js / Flutter).
- **`npx sh-ui add <widget>`** 으로 컴포넌트 추가 가능 (React / Flutter 양쪽).

## 사용법

```bash
# 프로젝트 생성
npm create @sh-ui my-app
# 플랫폼: Flutter
# → my-app/ 생성 완료

cd my-app
flutter pub get && flutter run

# 위젯 추가
npx sh-ui add button
```

## 내부 변경

- MIT 라이선스 추가 (루트 + 각 패키지)
- `package.json` 에 repository / homepage / bugs / keywords / publishConfig 메타 추가
- `prepublishOnly` hook — create: `pnpm test`, cli: `node --check bin/sh-ui.mjs`
- npm 공개용 README 정비 (create / cli 둘 다)
- 템플릿 `sh-ui.config.json` 의 placeholder `\$schema` URL 제거 (3곳)

## 주의사항

- 자동화 publish (Jenkins / GH Actions) 는 별건. 현재는 로컬 수동 publish 흐름.
- `@sh-ui/llms`, `@sh-ui/tokens` 는 사내 도구 성격으로 publish 대상 아님.
EOF
)"
```

Expected: 릴리즈 URL 출력. 예: `https://github.com/sanghyeonKim0201/sh-ui/releases/tag/v0.17.1`.

- [ ] **Step 4: 최종 검증**

```bash
gh release view v0.17.1 --json name,tagName,url
npm view @sh-ui/create version
npm view @sh-ui/cli version
```

Expected:
- release 정상 출력
- `@sh-ui/create` version = `0.17.1`
- `@sh-ui/cli` version = `0.14.1`

---

## Self-Review 결과

**Spec coverage:**

| 스펙 섹션 | 구현 위치 |
|---|---|
| 선행 조건 (§선행 조건) | 본 플랜 상단 "선행 조건" 블록 |
| 패키지 레벨 변경 — create (§패키지 레벨 변경) | Task 2 Step 1 |
| 패키지 레벨 변경 — cli (§패키지 레벨 변경) | Task 2 Step 2 |
| `prepublishOnly` 차등 (§prepublishOnly 차등) | Task 2 Step 1/2 (create=pnpm test, cli=node --check. cli 는 스펙의 `pnpm typecheck` 에서 **현실화**: cli 에 typecheck 스크립트 부재 + JS 특성) |
| LICENSE 파일 배치 (§LICENSE 파일 배치) | Task 1 전체 |
| README.md 두 개 (§README.md 패키지별) | Task 3 Step 1/2 |
| 템플릿 `$schema` 제거 (§템플릿 정리) | Task 4 전체. **스펙은 2곳 언급(flutter/nextjs)했으나 실제 3곳(+ui-app-template) 존재** — 일관성 위해 3곳 모두 정리 (명시적 범위 확장) |
| Dry-run 검증 (§Dry-run 검증 단계) | Task 6 전체 |
| publish 실행 순서 (§publish 실행 순서) | Task 7 Step 2/4 (create → cli 순) |
| 커밋 구조 (§커밋 구조) | Task 1(license), Task 2(pkg 메타), Task 3(README), Task 4(template), Task 5(release) = 5개 커밋 — 스펙의 "제안 커밋 분할" 과 1:1 매핑 |
| versions.json 엔트리 (§릴리즈 통합) | Task 5 Step 3 |
| Git 태그 + GH Release (§릴리즈 통합) | Task 8 전체 |
| 성공 기준 (§성공 기준) | Task 7 Step 6 (E2E 스모크) + Task 8 Step 4 (npm view 검증) |
| 비범위 (§비범위) 준수 | 자동화 publish / llms,tokens / provenance / changesets / main.dart fontSize — 모두 태스크에 포함되지 않음 |

모든 요구사항이 태스크에 매핑됨. 스펙 대비 **의식적 deviation 2건**:
1. cli 의 `prepublishOnly`: `pnpm typecheck` → `node --check bin/sh-ui.mjs` (cli 가 TS 아님)
2. `$schema` 제거 범위: 2곳 → 3곳 (ui-app-template 추가)

두 deviation 모두 스펙 의도(publish 전 최소 게이트 / placeholder 정리)를 더 완전하게 실현하는 방향.

**Placeholder scan:** 없음. 모든 step 에 실제 코드/명령/기대 출력.

**Type consistency:**
- `publishConfig.access: "public"` 두 패키지 동일
- `prepublishOnly` script 값이 task 설명과 package.json 예시에서 일치
- 버전 문자열 `0.17.1` / `0.14.1` 이 Task 5·7·8 전반에서 일관
- versions.json 엔트리 `url` 과 Task 8 의 `gh release create` 태그 버전 일치 (`v0.17.1`)

갭 없음. 진행 가능.
