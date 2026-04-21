# `@sh-ui/create` — Flutter 스타터 템플릿 설계

- 날짜: 2026-04-21
- 대상 패키지: `packages/create` (`@sh-ui/create`)
- 목표: `sh-ui-create` 가 **Flutter 단독 프로젝트** 스캐폴드를 생성할 수 있게 한다. 생성 직후 `flutter run` 으로 테마가 적용된 초기 화면이 뜨고, 이어서 `sh-ui add <widget>` 로 sh-ui 위젯을 추가할 수 있는 완성된 시작점.

## 배경

현재 `@sh-ui/create` 의 모든 템플릿(`nextjs-app`, `nextjs-standalone`, `monorepo`, `ui-app-template`)은 Next.js/React 전용이다. 반면 sh-ui 본체는 이미 React + Flutter 듀얼 플랫폼을 지원한다:

- `@sh-ui/cli` (`sh-ui init`, `sh-ui add`) — `platform: "react" | "flutter"` 모두 지원
- `packages/registry/flutter/` — 토큰 + 모든 위젯 Dart 소스가 레지스트리에 준비됨
- `apps/showcase/` — 실제 동작하는 Flutter 참조 앱

즉 **스캐폴드만 없다**. 사용자가 Flutter 프로젝트로 sh-ui 를 시작하려면 수동으로 Flutter 프로젝트 생성 → 구조 정리 → `sh-ui init` → `sh-ui add` 를 거쳐야 한다. 이 갭을 Next.js 와 동일한 경험으로 메운다.

## 비범위 (out of scope)

- **Flutter 모노레포** 템플릿 — 선행 사례(레포 내 Flutter 모노레포) 없음. YAGNI.
- **Flutter 용 플러그인 시스템**(Sentry Flutter, Firebase 등) — 현재 플러그인 시스템은 `imports`/`wrapExport`/`providerImports` 등 React·Next.js 전제. 플랫폼별 플러그인 재설계는 별도 과제.
- **고급 라우팅 프리와이어링**(GoRouter/AutoRoute) — 사용자 선택에 맡김.
- **토큰 레지스트리 ↔ 템플릿 자동 동기화** — 일단 수동 복사. 차후 CI lint 로 확장 여지.
- **Flutter 테스트 스캐폴드**(`widget_test.dart` 샘플) — `flutter create` 가 만드는 기본 위젯 테스트에 해당하는 부분이지만, 스타터가 보여줄 "첫 단계"와 거리가 있어 이번 스코프에선 생략.

## 아키텍처 결정

### 스타터 내용물 — **토큰까지 포함**

세 가지 옵션(최소 뼈대 / 토큰 포함 / 스타터 위젯 포함) 중 **토큰까지 포함**. 이유:
- 토큰은 모든 sh-ui Flutter 프로젝트가 필연적으로 요구 → "어차피 복사해야 할 것" 선제 제공
- `main.dart` 가 토큰을 import·소비하는 모습을 보여주면 학습 가치가 큼
- 스타터 위젯까지 박으면 위젯 업데이트 때마다 템플릿·레지스트리 두 곳을 따라가야 해 유지비 급등 — `sh-ui add <widget>` 가 이미 있으므로 역할 분리.

### CLI 통합 — **상위에 `select(platform)` 추가**

세 가지 옵션(기존 구조 select 에 flutter 추가 / 상위에 platform 추가 / 별도 서브커맨드) 중 **상위 platform 선택**. 이유:
- 기존 `checkbox(plugins)` 는 Next.js 전용. Flutter 경로는 이 단계를 **스킵** 해야 하는데, 같은 prompt 안에서 분기하면 "flutter인데 next-intl?" 같은 모순 노출.
- 의미 분리: platform 먼저 결정 → 그 안에서 구조·플러그인 분기. 추후 Flutter 모노레포/플러그인 확장 시 깔끔.
- 총 프롬프트 수: Flutter 경로 = 2개(`projectName`, `platform`). Next.js 경로 = 기존 + `platform` 1개 추가.

## 파일 구조

```
packages/create/templates/
└── flutter-standalone/
    ├── pubspec.yaml               # Flutter SDK + flutter_lints, name에 {{project_name}} 플레이스홀더
    ├── README.md                  # 부팅 가이드 + sh-ui add 안내
    ├── sh-ui.config.json          # platform=flutter, paths 사전 설정 (아래 §2 참조)
    ├── analysis_options.yaml      # package:flutter_lints/flutter.yaml include
    ├── .gitignore                 # Flutter 표준 ignore
    └── lib/
        ├── main.dart              # MaterialApp + ShUiTheme.light/dark + theme toggle
        └── sh_ui/
            └── foundation/
                └── sh_ui_tokens.dart  # packages/registry/flutter/foundation/sh_ui_tokens.dart 의 복사본
```

**격리 원칙:** 모든 sh-ui 자산은 `lib/sh_ui/` 하위에 둔다. 사용자 코드(`lib/main.dart` 및 이후 추가할 사용자 위젯)는 `lib/` 바로 아래 둬서 충돌 방지.

## 파일 내용 상세

### `sh-ui.config.json`

```json
{
  "$schema": "https://your-ds.dev/sh-ui.schema.json",
  "platform": "flutter",
  "style": "default",
  "theme": { "base": "neutral", "radius": "md", "mode": "light-dark" },
  "paths": {
    "tokens": "lib/sh_ui/foundation/sh_ui_tokens.dart",
    "components": "lib/sh_ui/widgets",
    "foundation": "lib/sh_ui/foundation",
    "widgets": "lib/sh_ui/widgets"
  }
}
```

React 쪽 `sh-ui.config.json` 과 달리 `aliases` 는 없음(Dart 는 path 기반 import).

### `main.dart`

쇼케이스의 `main.dart` 를 간소화. 라우팅/홈페이지 부분을 제거하고 `Scaffold` + 안내 텍스트 + theme toggle 버튼만 남김. 토큰 import 및 `ThemeData.extensions` 세팅 패턴은 유지해 사용자가 "sh-ui 스타일을 Flutter 에 어떻게 붙이는지" 를 파일 하나로 학습 가능.

### `pubspec.yaml`

쇼케이스 pubspec 기준으로 `assets:` 제거하고 name 을 플레이스홀더화:

```yaml
name: {{project_name}}
description: sh-ui 기반 Flutter 앱
publish_to: 'none'
version: 0.0.1
environment:
  sdk: ^3.7.0
  flutter: ^3.29.0
dependencies:
  flutter:
    sdk: flutter
dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^5.0.0
flutter:
  uses-material-design: true
```

### `sh_ui_tokens.dart`

`packages/registry/flutter/foundation/sh_ui_tokens.dart` 내용을 **그대로 복사**. CLAUDE.md 의 "듀얼 카피본 유지" 관용(registry ↔ apps/docs)과 동일한 방식으로, template 내 복사본도 수동 동기화 대상으로 인정.

### `analysis_options.yaml`

```yaml
include: package:flutter_lints/flutter.yaml
```

### `.gitignore`

`flutter create` 가 만드는 표준 ignore 목록(`.dart_tool/`, `build/`, `.flutter-plugins`, `ios/Pods/`, `android/.gradle/`, etc.) 기반으로 최소 구성.

### `README.md`

- 프로젝트 부팅: `flutter pub get` → `flutter run`
- 위젯 추가: `npx sh-ui add <name>` 또는 `sh-ui add <name>` 안내
- sh-ui 전체 위젯 리스트 링크 — 구현 단계에서 기존 `apps/docs` 또는 루트 `README.md` 가 참조하는 docs URL 과 동일하게 맞춘다(템플릿이 고아 URL 을 쓰지 않도록)

## CLI / `generator.js` 통합

### 프롬프트 흐름 변경

```
input(projectName)
  ↓
select(platform: 'next' | 'flutter')           ← 신규 (기본: 'next')
  ↓
┌──────────────────────────┬─────────────────────┐
│ platform === 'next'      │ platform === 'flutter' │
├──────────────────────────┼─────────────────────┤
│ select(구조)             │ (즉시 generateFlutter) │
│ checkbox(plugins)        │                     │
│ (구조=monorepo 일 때)    │                     │
│ input(appName)           │                     │
│ input(port)              │                     │
└──────────────────────────┴─────────────────────┘
```

### `createProject()` 시그니처 변화

기존:
```js
// 1. projectName
// 2. projectType (structure)
// 3. selectedPlugins
// 4. generateStandalone / generateMonorepo
```

신규:
```js
// 1. projectName
// 2. platform                              ← 신규
// 3. platform === 'flutter' 분기:
//    → generateFlutter(targetDir, projectName)
//    → return
// 4. platform === 'next': 기존 경로 그대로
//    - projectType
//    - selectedPlugins
//    - generateStandalone / generateMonorepo
```

### `generateFlutter(targetDir, projectName)` 구현

```js
async function generateFlutter(targetDir, projectName) {
  await fs.copy(path.join(TEMPLATES_DIR, 'flutter-standalone'), targetDir);
  await replaceInAllFiles(targetDir, '{{project_name}}', projectName);
}
```

기존 `replaceInAllFiles` 헬퍼를 그대로 재사용. `pubspec.yaml` 외 다른 파일에도 `{{project_name}}` 이 필요하면 자연스럽게 반영됨.

### 완료 후 콘솔 메시지 분기

```
✅ {projectName} Flutter 프로젝트가 생성되었습니다!

  cd {projectName}
  flutter pub get
  flutter run
```

## 스모크 테스트 확장

`packages/create/test/smoke.test.js` 를 다음 방향으로 수정:

### 신규 시나리오 5 — flutter standalone

```js
it('scenario 5 — flutter standalone', async () => {
  prompts.input.mockResolvedValueOnce('my-flutter-app');
  prompts.select.mockResolvedValueOnce('flutter');
  await createProject();

  const projectDir = path.join(tmpDir, 'my-flutter-app');
  expect(await fs.pathExists(path.join(projectDir, 'pubspec.yaml'))).toBe(true);
  expect(await fs.pathExists(path.join(projectDir, 'lib/main.dart'))).toBe(true);
  expect(await fs.pathExists(path.join(projectDir, 'lib/sh_ui/foundation/sh_ui_tokens.dart'))).toBe(true);

  const cfg = await fs.readJson(path.join(projectDir, 'sh-ui.config.json'));
  expect(cfg.platform).toBe('flutter');

  const pub = await fs.readFile(path.join(projectDir, 'pubspec.yaml'), 'utf-8');
  expect(pub).toContain('name: my-flutter-app');
});
```

### 기존 시나리오 수정

시나리오 1, 2, 3 의 mock 큐에 `select('next')` 호출을 **프로젝트 이름 뒤** 에 추가. 예:

```diff
- prompts.input.mockResolvedValueOnce('my-app');
- prompts.select.mockResolvedValueOnce('standalone');
- prompts.checkbox.mockResolvedValueOnce([]);
+ prompts.input.mockResolvedValueOnce('my-app');
+ prompts.select
+   .mockResolvedValueOnce('next')         // platform
+   .mockResolvedValueOnce('standalone');   // structure
+ prompts.checkbox.mockResolvedValueOnce([]);
```

시나리오 2·3 도 동일 패턴. **시나리오 4 (`addApp`) 는 수정 없음** — `addApp` 은 monorepo 내부에서만 호출되고 platform 선택 단계를 거치지 않음.

## 릴리즈 통합

CLAUDE.md 버전 범프 규칙상 "새 공개 옵션(platform 선택, Flutter 스타터) 추가" = **MINOR**.

- `packages/create/package.json` version: `0.16.0` → **`0.17.0`**
- `packages/changelog/versions.json` 에 엔트리 prepend:

```json
{
  "version": "0.17.0",
  "date": "2026-04-21",
  "title": "@sh-ui/create — Flutter 스타터 지원",
  "type": "minor",
  "highlights": [
    "sh-ui-create — 프로젝트 생성 시 플랫폼 선택(Next.js / Flutter) 신규",
    "Flutter 선택 시 pubspec + main.dart + sh-ui.config.json + 토큰 복사본까지 완성된 스타터 제공",
    "생성 직후 `flutter run`으로 테마 적용된 초기 화면 확인 가능, 이어서 `sh-ui add <widget>` 로 위젯 추가"
  ],
  "url": "https://github.com/sanghyeonKim0201/sh-ui/releases/tag/v0.17.0"
}
```

- 커밋: 소스 변경 + `versions.json` + `package.json` 을 **한 커밋** 에 묶음
- 태그: `v0.17.0` 푸시
- `gh release create v0.17.0 --title "v0.17.0 — @sh-ui/create Flutter 스타터 지원"` 로 릴리즈 생성

## 성공 기준

- `pnpm --filter @sh-ui/create create` 실행 → Next.js / Flutter 선택 가능
- Flutter 선택 후 이름 입력만으로 프로젝트 생성 완료
- 생성된 디렉토리에서 `flutter pub get && flutter run` 이 동작(로컬 환경 기준)
- `pnpm --filter @sh-ui/create test` 에서 5/5 시나리오 통과
- `packages/changelog/versions.json` 에 0.17.0 엔트리, `@sh-ui/create` package.json version 동기화
- docs 앱 "변경 내역" 페이지에 0.17.0 엔트리 자동 반영(versions.json 공유)

## 후속 연결

이 스펙 완료 후:
1. **C (npm publish 흐름)** — Flutter 지원까지 완비된 상태로 첫 공개 릴리즈.
