# Flutter 스타터 템플릿 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `@sh-ui/create` 에 Flutter 단독 프로젝트 스캐폴드를 추가한다. 생성 직후 `flutter run` 으로 테마 적용된 초기 화면이 뜨고, `sh-ui add <widget>` 으로 위젯 확장이 가능한 완성된 시작점.

**Architecture:** `packages/create/templates/flutter-standalone/` 에 템플릿 파일을 두고, `generator.js` 의 `createProject()` 에 상위 `select(platform)` 프롬프트를 추가해 `next` / `flutter` 로 분기. Flutter 경로는 `generateFlutter()` 가 템플릿 복사 + `{{project_name}}` 치환만 수행.

**Tech Stack:** Node ESM, `@inquirer/prompts`, `fs-extra`, Flutter 3.29+ (템플릿 생성물), vitest(스모크 테스트).

---

## File Structure

새로 추가/수정되는 파일:

- Create: `packages/create/templates/flutter-standalone/pubspec.yaml`
- Create: `packages/create/templates/flutter-standalone/sh-ui.config.json`
- Create: `packages/create/templates/flutter-standalone/analysis_options.yaml`
- Create: `packages/create/templates/flutter-standalone/.gitignore`
- Create: `packages/create/templates/flutter-standalone/README.md`
- Create: `packages/create/templates/flutter-standalone/lib/main.dart`
- Create: `packages/create/templates/flutter-standalone/lib/sh_ui/foundation/sh_ui_tokens.dart` (레지스트리 복사본)
- Modify: `packages/create/src/generator.js` — `createProject` 에 platform prompt + `generateFlutter()` 추가
- Modify: `packages/create/test/smoke.test.js` — 시나리오 1/2/3 mock 큐에 `'next'` 추가, 시나리오 5 신규 추가
- Modify: `packages/create/package.json` — version `0.16.0` → `0.17.0`
- Modify: `packages/changelog/versions.json` — 0.17.0 엔트리 prepend

---

## Task 1: Flutter 템플릿 파일 생성

이 태스크는 **파일 복사만** 한다 — generator.js 는 건드리지 않는다. 기존 스모크 테스트 4개가 그대로 통과해야 한다(기존 동작 불변).

**Files:**
- Create: 전체 `packages/create/templates/flutter-standalone/` 트리

- [ ] **Step 1: `pubspec.yaml` 작성**

파일: `packages/create/templates/flutter-standalone/pubspec.yaml`

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

- [ ] **Step 2: `sh-ui.config.json` 작성**

파일: `packages/create/templates/flutter-standalone/sh-ui.config.json`

```json
{
  "$schema": "https://your-ds.dev/sh-ui.schema.json",
  "platform": "flutter",
  "style": "default",
  "theme": {
    "base": "neutral",
    "radius": "md",
    "mode": "light-dark"
  },
  "paths": {
    "tokens": "lib/sh_ui/foundation/sh_ui_tokens.dart",
    "components": "lib/sh_ui/widgets",
    "foundation": "lib/sh_ui/foundation",
    "widgets": "lib/sh_ui/widgets"
  }
}
```

- [ ] **Step 3: `analysis_options.yaml` 작성**

파일: `packages/create/templates/flutter-standalone/analysis_options.yaml`

```yaml
include: package:flutter_lints/flutter.yaml
```

- [ ] **Step 4: `.gitignore` 작성 (Flutter 표준 + showcase 참고)**

파일: `packages/create/templates/flutter-standalone/.gitignore`

```gitignore
# Miscellaneous
*.class
*.log
*.pyc
*.swp
.DS_Store
.atom/
.build/
.buildlog/
.history
.svn/
.swiftpm/
migrate_working_dir/

# IntelliJ related
*.iml
*.ipr
*.iws
.idea/

# VS Code
#.vscode/

# Flutter/Dart/Pub related
**/doc/api/
**/ios/Flutter/.last_build_id
.dart_tool/
.flutter-plugins
.flutter-plugins-dependencies
.pub-cache/
.pub/
/build/
/coverage/

# Symbolication
app.*.symbols

# Obfuscation
app.*.map.json

# Android build artifacts
/android/app/debug
/android/app/profile
/android/app/release
```

- [ ] **Step 5: `lib/` 디렉토리 생성 후 토큰 복사**

다음 명령 실행 (레포 루트에서):

```bash
mkdir -p packages/create/templates/flutter-standalone/lib/sh_ui/foundation
cp packages/registry/flutter/foundation/sh_ui_tokens.dart \
   packages/create/templates/flutter-standalone/lib/sh_ui/foundation/sh_ui_tokens.dart
```

Expected: `packages/create/templates/flutter-standalone/lib/sh_ui/foundation/sh_ui_tokens.dart` 가 약 385 줄로 레지스트리 원본과 동일하게 복사됨.

검증:

```bash
diff -q packages/registry/flutter/foundation/sh_ui_tokens.dart \
        packages/create/templates/flutter-standalone/lib/sh_ui/foundation/sh_ui_tokens.dart
```

Expected: 출력 없음 (두 파일 동일).

- [ ] **Step 6: `lib/main.dart` 작성**

파일: `packages/create/templates/flutter-standalone/lib/main.dart`

```dart
import 'package:flutter/material.dart';
import 'sh_ui/foundation/sh_ui_tokens.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  ThemeMode _themeMode = ThemeMode.light;

  void _toggleTheme() {
    setState(() {
      _themeMode =
          _themeMode == ThemeMode.light ? ThemeMode.dark : ThemeMode.light;
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '{{project_name}}',
      debugShowCheckedModeBanner: false,
      themeMode: _themeMode,
      theme: ThemeData(
        brightness: Brightness.light,
        scaffoldBackgroundColor: ShUiColorTokens.light.background,
        extensions: const [ShUiTheme.light],
      ),
      darkTheme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: ShUiColorTokens.dark.background,
        extensions: const [ShUiTheme.dark],
      ),
      home: HomePage(
        themeMode: _themeMode,
        onToggleTheme: _toggleTheme,
      ),
    );
  }
}

class HomePage extends StatelessWidget {
  const HomePage({
    super.key,
    required this.themeMode,
    required this.onToggleTheme,
  });

  final ThemeMode themeMode;
  final VoidCallback onToggleTheme;

  @override
  Widget build(BuildContext context) {
    final shUi = Theme.of(context).extension<ShUiTheme>() ?? ShUiTheme.light;
    final colors = shUi.colors;

    return Scaffold(
      appBar: AppBar(
        title: const Text('{{project_name}}'),
        actions: [
          IconButton(
            icon: Icon(
              themeMode == ThemeMode.light
                  ? Icons.dark_mode_outlined
                  : Icons.light_mode_outlined,
            ),
            onPressed: onToggleTheme,
          ),
        ],
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              'sh-ui 기반 Flutter 앱',
              style: TextStyle(
                color: colors.foreground,
                fontSize: 20,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              'sh-ui add <widget> 로 위젯을 추가해 보세요',
              style: TextStyle(
                color: colors.foregroundMuted,
                fontSize: 14,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
```

- [ ] **Step 7: `README.md` 작성**

파일: `packages/create/templates/flutter-standalone/README.md`

```markdown
# {{project_name}}

sh-ui 기반 Flutter 앱.

## 시작하기

```bash
flutter pub get
flutter run
```

## sh-ui 위젯 추가

```bash
npx sh-ui add button
npx sh-ui add card input
```

위젯은 `lib/sh_ui/widgets/` 아래로 복사됩니다. 설정은 `sh-ui.config.json` 을 참조하세요.

## 구조

```
lib/
├── main.dart                        # 앱 진입점
└── sh_ui/                           # sh-ui 자산 (건드리지 말 것 — sh-ui CLI 가 관리)
    ├── foundation/
    │   └── sh_ui_tokens.dart        # 디자인 토큰
    └── widgets/                     # sh-ui add 로 추가되는 위젯들
```

## 더 알아보기

- sh-ui 컴포넌트 목록 및 가이드: https://github.com/sanghyeonKim0201/sh-ui
```

- [ ] **Step 8: 기존 테스트 재확인 — 파일 추가로 깨지지 않았는지**

```bash
pnpm --filter @sh-ui/create test
```

Expected: `Tests  4 passed (4)`. (아직 generator 변경 전이므로 기존 시나리오 4개 그대로 통과해야 함.)

- [ ] **Step 9: Commit**

```bash
git add packages/create/templates/flutter-standalone
git commit -m "$(cat <<'EOF'
feat(create): Flutter standalone 템플릿 파일 추가

pubspec / sh-ui.config.json / main.dart / 토큰 복사본 + analysis_options + .gitignore + README.
generator.js 통합은 별도 커밋.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: `generator.js` 에 platform 분기 + Flutter generator 추가

이 태스크는 generator.js 수정 + 기존 스모크 테스트 3개의 mock 큐 갱신 + 신규 시나리오 5 추가를 **한 커밋** 으로 묶는다. 중간 상태에서 테스트가 깨지기 때문.

**Files:**
- Modify: `packages/create/src/generator.js`
- Modify: `packages/create/test/smoke.test.js`

- [ ] **Step 1: `createProject()` 에 platform 프롬프트 + flutter 분기 추가**

`packages/create/src/generator.js` 의 `createProject()` 함수를 다음과 같이 수정. `input(projectName)` 직후에 `select(platform)` 을 추가하고, `flutter` 면 바로 `generateFlutter` 호출 후 return.

변경 전 (현재 상태, 13-60번째 줄):

```js
export async function createProject() {
  const projectName = await input({
    message: '프로젝트 이름:',
    default: 'my-app',
  });

  const projectType = await select({
    message: '프로젝트 구조:',
    choices: [
      { name: '단독 (Next.js standalone)', value: 'standalone' },
      { name: '모노레포 (Turborepo + pnpm)', value: 'monorepo' },
    ],
  });

  const selectedPlugins = await checkbox({
    /* ... */
  });

  /* ... 이하 기존 로직 ... */
}
```

변경 후:

```js
export async function createProject() {
  const projectName = await input({
    message: '프로젝트 이름:',
    default: 'my-app',
  });

  const platform = await select({
    message: '플랫폼:',
    choices: [
      { name: 'Next.js', value: 'next' },
      { name: 'Flutter', value: 'flutter' },
    ],
  });

  const targetDir = path.resolve(process.cwd(), projectName);

  if (await fs.pathExists(targetDir)) {
    const overwrite = await confirm({
      message: `${projectName} 디렉토리가 이미 존재합니다. 덮어쓸까요?`,
      default: false,
    });
    if (!overwrite) {
      console.log('취소되었습니다.');
      return;
    }
    await fs.remove(targetDir);
  }

  if (platform === 'flutter') {
    await generateFlutter(targetDir, projectName);
    console.log(`\n✅ ${projectName} Flutter 프로젝트가 생성되었습니다!`);
    console.log(`\n  cd ${projectName}`);
    console.log('  flutter pub get');
    console.log('  flutter run\n');
    return;
  }

  // platform === 'next' 경로 — 기존 구조/플러그인 분기
  const projectType = await select({
    message: '프로젝트 구조:',
    choices: [
      { name: '단독 (Next.js standalone)', value: 'standalone' },
      { name: '모노레포 (Turborepo + pnpm)', value: 'monorepo' },
    ],
  });

  const selectedPlugins = await checkbox({
    message: '추가 기능 선택 (Space로 선택):',
    choices: getPluginChoices(),
  });

  const plugins = getPluginsByNames(selectedPlugins);
  plugins.sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));

  if (projectType === 'standalone') {
    await generateStandalone(targetDir, projectName, plugins);
  } else {
    await generateMonorepo(targetDir, projectName, plugins);
  }

  console.log(`\n✅ ${projectName} 프로젝트가 생성되었습니다!`);
  console.log(`\n  cd ${projectName}`);
  console.log('  pnpm install');
  console.log('  pnpm dev\n');
}
```

**주의:** 기존 로직 중 `targetDir` 계산과 `overwrite confirm` 을 platform 분기 앞으로 올렸다. 이유: Flutter·Next 모두 동일한 overwrite 가드가 필요하고, Flutter 경로에서 `generateStandalone`/`generateMonorepo` 같은 기존 함수가 사용되지 않기 때문.

- [ ] **Step 2: `generateFlutter()` 함수 추가**

`generator.js` 파일 하단의 `// ─── Generators ───` 섹션 안에 `generateStandalone` 바로 위 또는 `generateMonorepo` 아래 아무 곳에 추가:

```js
async function generateFlutter(targetDir, projectName) {
  await fs.copy(path.join(TEMPLATES_DIR, 'flutter-standalone'), targetDir);
  await replaceInAllFiles(targetDir, '{{project_name}}', projectName);
}
```

`replaceInAllFiles` 는 이미 정의돼 있으므로 재사용.

- [ ] **Step 3: 기존 시나리오 1/2/3 에 platform mock 추가**

`packages/create/test/smoke.test.js` 의 시나리오 1 테스트에서 mock 큐를 다음과 같이 수정.

변경 전:
```js
    prompts.input.mockResolvedValueOnce('my-app');
    prompts.select.mockResolvedValueOnce('standalone');
    prompts.checkbox.mockResolvedValueOnce([]);
```

변경 후:
```js
    prompts.input.mockResolvedValueOnce('my-app');
    prompts.select
      .mockResolvedValueOnce('next')         // platform
      .mockResolvedValueOnce('standalone');   // structure
    prompts.checkbox.mockResolvedValueOnce([]);
```

시나리오 2 (monorepo):

변경 전:
```js
    prompts.input
      .mockResolvedValueOnce('my-mono')
      .mockResolvedValueOnce('web')
      .mockResolvedValueOnce('3000');
    prompts.select.mockResolvedValueOnce('monorepo');
    prompts.checkbox.mockResolvedValueOnce([]);
```

변경 후:
```js
    prompts.input
      .mockResolvedValueOnce('my-mono')
      .mockResolvedValueOnce('web')
      .mockResolvedValueOnce('3000');
    prompts.select
      .mockResolvedValueOnce('next')         // platform
      .mockResolvedValueOnce('monorepo');     // structure
    prompts.checkbox.mockResolvedValueOnce([]);
```

시나리오 3 (standalone + sentry + next-intl):

변경 전:
```js
    prompts.input.mockResolvedValueOnce('my-app');
    prompts.select.mockResolvedValueOnce('standalone');
    prompts.checkbox.mockResolvedValueOnce(['sentry', 'next-intl']);
```

변경 후:
```js
    prompts.input.mockResolvedValueOnce('my-app');
    prompts.select
      .mockResolvedValueOnce('next')         // platform
      .mockResolvedValueOnce('standalone');   // structure
    prompts.checkbox.mockResolvedValueOnce(['sentry', 'next-intl']);
```

**시나리오 4 (`addApp`) 는 변경하지 않는다** — `addApp` 은 platform 프롬프트를 거치지 않음.

- [ ] **Step 4: 시나리오 5 (Flutter standalone) 신규 추가**

`smoke.test.js` 의 `describe` 블록 마지막에 새 테스트 케이스 추가 (시나리오 4 바로 아래):

```js
  it('scenario 5 — flutter standalone', async () => {
    prompts.input.mockResolvedValueOnce('my-flutter-app');
    prompts.select.mockResolvedValueOnce('flutter');

    await createProject();

    const projectDir = path.join(tmpDir, 'my-flutter-app');
    expect(await fs.pathExists(path.join(projectDir, 'pubspec.yaml'))).toBe(true);
    expect(await fs.pathExists(path.join(projectDir, 'lib', 'main.dart'))).toBe(true);
    expect(
      await fs.pathExists(
        path.join(projectDir, 'lib', 'sh_ui', 'foundation', 'sh_ui_tokens.dart'),
      ),
    ).toBe(true);

    const cfg = await fs.readJson(path.join(projectDir, 'sh-ui.config.json'));
    expect(cfg.platform).toBe('flutter');

    const pub = await fs.readFile(path.join(projectDir, 'pubspec.yaml'), 'utf-8');
    expect(pub).toContain('name: my-flutter-app');

    const mainDart = await fs.readFile(
      path.join(projectDir, 'lib', 'main.dart'),
      'utf-8',
    );
    expect(mainDart).toContain("title: 'my-flutter-app'");
  });
```

- [ ] **Step 5: 테스트 실행 — 5/5 PASS 확인**

```bash
pnpm --filter @sh-ui/create test
```

Expected: `Tests  5 passed (5)`. 실행시간 1초 이내.

- [ ] **Step 6: 수동 스모크 — 실제 CLI 한 번 돌려보기**

tmp 디렉토리에서 실제로 Flutter 경로를 실행해 템플릿 복사가 눈으로 보이는지 확인:

```bash
cd $(mktemp -d) && node /Users/gimsanghyeon/development/PROJECT/sh-ui/packages/create/bin/create.js <<EOF
hello-flutter
flutter
EOF
ls hello-flutter && cat hello-flutter/pubspec.yaml | head -5
```

Expected: `pubspec.yaml`, `lib/`, `sh-ui.config.json`, `README.md`, `.gitignore`, `analysis_options.yaml` 가 보이고, `pubspec.yaml` 첫 줄이 `name: hello-flutter` 이어야 함.

작업 후 정리:
```bash
cd /Users/gimsanghyeon/development/PROJECT/sh-ui
```

**수동 스모크 실패 시 BLOCKED 보고**. 자동 테스트는 통과하는데 실제 실행이 실패하면 통합에 누락이 있다는 뜻.

- [ ] **Step 7: Commit**

```bash
git add packages/create/src/generator.js packages/create/test/smoke.test.js
git commit -m "$(cat <<'EOF'
feat(create): createProject에 platform 선택 + Flutter generator 추가

- createProject 상위에 select(platform: next|flutter) 추가
- platform=flutter 시 generateFlutter()로 templates/flutter-standalone 복사 + {{project_name}} 치환
- 기존 시나리오 1/2/3 mock 큐에 'next' platform 추가, 시나리오 5 신규

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: 릴리즈 메타데이터 — v0.17.0

**Files:**
- Modify: `packages/create/package.json`
- Modify: `packages/changelog/versions.json`

- [ ] **Step 1: `@sh-ui/create` package.json version bump**

`packages/create/package.json` 에서:

```diff
-  "version": "0.16.0",
+  "version": "0.17.0",
```

- [ ] **Step 2: `versions.json` 에 엔트리 prepend**

`packages/changelog/versions.json` 을 열고, `"versions"` 배열 맨 앞에 다음 엔트리를 prepend (기존 첫 엔트리 앞에 쉼표와 함께 삽입):

```json
    {
      "version": "0.17.0",
      "date": "2026-04-21",
      "title": "@sh-ui/create — Flutter 스타터 지원",
      "type": "minor",
      "highlights": [
        "sh-ui-create — 프로젝트 생성 시 플랫폼 선택(Next.js / Flutter) 신규",
        "Flutter 선택 시 pubspec + main.dart + sh-ui.config.json + 토큰 복사본까지 완성된 스타터 제공",
        "생성 직후 `flutter run`으로 테마 적용된 초기 화면 확인, 이어서 `sh-ui add <widget>` 로 위젯 추가"
      ],
      "url": "https://github.com/sanghyeonKim0201/sh-ui/releases/tag/v0.17.0"
    },
```

주의: JSON 포맷을 깨뜨리지 않도록 기존 첫 엔트리(`versions` 배열 첫 원소)와의 **쉼표 위치** 를 정확히 맞춘다.

- [ ] **Step 3: 포맷 검증 (JSON 유효성)**

```bash
node -e "JSON.parse(require('fs').readFileSync('packages/changelog/versions.json', 'utf-8'))" && echo "valid"
```

Expected: `valid` 출력.

- [ ] **Step 4: 테스트 재실행 — 아직 5/5 유지**

```bash
pnpm --filter @sh-ui/create test
```

Expected: `Tests  5 passed (5)`.

- [ ] **Step 5: Commit**

```bash
git add packages/create/package.json packages/changelog/versions.json
git commit -m "$(cat <<'EOF'
chore(release): @sh-ui/create v0.17.0 — Flutter 스타터 지원

versions.json에 0.17.0 엔트리 prepend.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: 태그 + GitHub Release 생성

**Files:** 없음 (git 작업만)

- [ ] **Step 1: 현재까지의 3개 커밋을 `dev` 에 push**

```bash
git push origin dev
```

Expected: `Task 1` + `Task 2` + `Task 3` 세 커밋이 `origin/dev` 에 업로드.

- [ ] **Step 2: v0.17.0 태그 생성 및 push**

```bash
git tag v0.17.0
git push origin v0.17.0
```

Expected: 태그가 `chore(release): @sh-ui/create v0.17.0 ...` 커밋을 가리키며 원격에 업로드.

- [ ] **Step 3: GitHub Release 생성**

```bash
gh release create v0.17.0 \
  --title "v0.17.0 — @sh-ui/create Flutter 스타터 지원" \
  --notes "$(cat <<'EOF'
## 새 기능

- **`@sh-ui/create` 에 플랫폼 선택 추가** — 프로젝트 생성 시 Next.js 또는 Flutter 선택 가능.
- **Flutter 스타터 템플릿** — `pubspec.yaml` / `sh-ui.config.json` / `main.dart` / `sh_ui_tokens.dart` 복사본까지 완성된 프로젝트 스캐폴드.
- **즉시 실행 가능** — 생성 직후 `flutter pub get && flutter run` 으로 테마 적용된 초기 화면 확인.

## 사용법

```bash
npx @sh-ui/create
# 프로젝트 이름: my-app
# 플랫폼: Flutter
# → my-app/ 생성 완료

cd my-app
flutter pub get
flutter run

# 위젯 추가
npx sh-ui add button
```

## 내부 변경

- `packages/create/src/generator.js` — `createProject` 에 상위 `select(platform)` 프롬프트 추가, `generateFlutter()` 추가.
- `packages/create/templates/flutter-standalone/` — 템플릿 디렉토리 신설.
- 스모크 테스트 — 시나리오 1~3 의 mock 큐 갱신, Flutter 시나리오(5) 추가.

## 주의사항

- Flutter 경로는 현재 **단독 프로젝트만** 지원 (모노레포 미지원).
- Flutter 용 플러그인(Sentry Flutter, Firebase 등)은 아직 없음.
EOF
)"
```

Expected: 릴리즈가 생성되고 URL 이 출력됨. 예: `https://github.com/sanghyeonKim0201/sh-ui/releases/tag/v0.17.0`.

- [ ] **Step 4: 최종 검증**

```bash
git log --oneline -6
pnpm --filter @sh-ui/create test
gh release view v0.17.0
```

Expected:
- 최근 3 커밋이 `feat(create): Flutter standalone 템플릿 파일 추가` / `feat(create): createProject에 platform 선택 + Flutter generator 추가` / `chore(release): @sh-ui/create v0.17.0 ...`
- 테스트 5/5 PASS
- Release 페이지 정보 정상 출력

---

## Self-Review 결과

**Spec coverage:**

| 스펙 요구사항 | 구현 위치 |
|---|---|
| 템플릿 파일 구조 (§파일 구조) | Task 1 Steps 1-7 |
| `sh-ui.config.json` 내용 (§파일 내용 상세) | Task 1 Step 2 |
| `main.dart` 내용 (§파일 내용 상세) | Task 1 Step 6 |
| 토큰 복사 (§파일 내용 상세) | Task 1 Step 5 |
| `pubspec.yaml` 플레이스홀더 (§파일 내용 상세) | Task 1 Step 1 |
| `.gitignore` (§파일 내용 상세) | Task 1 Step 4 |
| `analysis_options.yaml` (§파일 내용 상세) | Task 1 Step 3 |
| `README.md` (§파일 내용 상세) + docs URL 고아 방지 | Task 1 Step 7 (README 에 `github.com/sanghyeonKim0201/sh-ui` 사용 — 루트 README 부재 상태에서 안전한 anchor) |
| `generator.js` — platform 프롬프트 추가 (§CLI 통합) | Task 2 Step 1 |
| `generateFlutter()` 구현 (§CLI 통합) | Task 2 Step 2 |
| Flutter 경로 완료 메시지 | Task 2 Step 1 (console.log 분기) |
| 시나리오 1/2/3 mock 큐 갱신 (§스모크 테스트 확장) | Task 2 Step 3 |
| 시나리오 5 신규 (§스모크 테스트 확장) | Task 2 Step 4 |
| 시나리오 4 미수정 (§스모크 테스트 확장) | 명시적으로 건드리지 않음 |
| package.json 0.16.0 → 0.17.0 (§릴리즈 통합) | Task 3 Step 1 |
| versions.json 0.17.0 prepend (§릴리즈 통합) | Task 3 Step 2 |
| 소스 + versions.json + package.json 관계 (§릴리즈 통합) | Task 2(소스) + Task 3(메타) 같은 PR 내, 태그는 Task 4 에서 메타 커밋 가리킴 |
| 태그 + gh release (§릴리즈 통합) | Task 4 Steps 2-3 |

모든 요구사항이 태스크에 매핑됨.

**Placeholder scan:** 없음. 모든 step 에 실제 코드/명령/기대 출력 제공.

**Type consistency:**
- `generateFlutter(targetDir, projectName)` 시그니처 Task 2 Step 1/2 에서 일관됨
- mock 큐 `'next'` / `'flutter'` / `'standalone'` / `'monorepo'` 값이 generator.js 의 `choices.value` 와 정확히 일치 (`'next'`, `'flutter'`, `'standalone'`, `'monorepo'`)
- 템플릿 플레이스홀더 `{{project_name}}` 이 pubspec/main.dart/README 에서 동일 표기 + `replaceInAllFiles` 호출(Step 2-2)에서 동일 문자열 사용

갭 없음. 진행 가능.
