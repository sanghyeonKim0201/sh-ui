// sh-ui MCP 서버 — IDE-내 AI(Claude Code, Cursor 등)가 sh-ui 컴포넌트를
// 검색/조회/설치/삭제할 수 있게 stdio MCP 툴 6개를 노출한다.
//
// 사용자 등록 (예시 — Claude Code MCP 설정):
//   "sh-ui": { "command": "npx", "args": ["-y", "sh-ui-cli", "mcp"] }
//
// 노출 툴:
//   sh_ui_describe_init    - init 4개 축(platform/base/radius/mode) enum + 한글 설명
//   sh_ui_create_project   - 빈 폴더에 Next.js/Flutter 프로젝트 스캐폴드
//   sh_ui_add_app          - 기존 모노레포에 새 Next.js 앱 추가
//   sh_ui_init             - sh-ui.config.json 생성 (비대화형)
//   sh_ui_list_components  - 플랫폼 전체 컴포넌트 + 요약
//   sh_ui_get_component    - 단일 컴포넌트의 메타·소스·deps
//   sh_ui_add_component    - 컴포넌트 설치 (외부 패키지 자동 설치 포함)
//   sh_ui_remove_component - 컴포넌트 삭제
//   sh_ui_get_changelog    - 변경 내역(versions.json) 반환
//   sh_ui_encode_theme     - 토큰 객체 → base64 (사용자가 손본 톤을 영구 보관)
//   sh_ui_decode_theme     - base64 → 토큰 객체 (기존 테마 일부만 수정 후 재인코딩)
//   sh_ui_rename_app       - monorepo 의 앱 이름 일괄 변경 (디렉토리 + import/path)
//   sh_ui_migrate_to_v065  - v0.64.x → v0.65 자동 마이그레이션 (컴포넌트 ui-core 단일화)

import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { init } from "./init.mjs";
import { add } from "./add.mjs";
import { list } from "./list.mjs";
import { remove } from "./remove.mjs";
import { renameApp } from "./rename-app.mjs";
import { migrateToV065 } from "./migrate-v065.mjs";
import { createProject, addApp, validateProjectName } from "./create/generator.js";
import {
  getRegistryRoot,
  getSummariesPath,
  getVersionsPath,
} from "./paths.mjs";
import {
  CREATE_PLATFORMS,
  CREATE_STRUCTURES,
  INIT_PLATFORMS,
  THEME_BASES,
  THEME_RADII,
  THEME_MODES,
  CSS_FRAMEWORKS_SUPPORTED,
} from "./constants.js";
import { allPlugins } from "./create/plugins/index.js";
import { allArchitectures } from "./create/architectures/index.js";
import { describeTemplate } from "./create/describeTemplate.js";
import { THEME_PRESET_NAMES } from "./create/theme/presets.js";
import { decodeTheme } from "./create/theme/decode.js";
import { encodeTheme } from "./create/theme/encode.js";

const PLATFORMS = INIT_PLATFORMS;
const BASES = THEME_BASES;
const RADII = THEME_RADII;
const MODES = THEME_MODES;
const CSS_FRAMEWORKS = CSS_FRAMEWORKS_SUPPORTED;
const PLUGIN_NAMES = allPlugins.map((p) => p.name);
const ARCH_NAMES = allArchitectures.map((a) => a.name);
const THEME_PRESETS_LIST = THEME_PRESET_NAMES.join(", ");

const INIT_DESCRIPTIONS = {
  platform: {
    react: "웹 — React 19 + CSS 변수 토큰",
    flutter: "모바일 — Flutter Material 위젯",
  },
  base: {
    neutral: "중성 회색 — 어떤 브랜드와도 잘 맞음 (기본)",
    zinc: "차가운 회색 — 모던/테크 느낌",
    slate: "푸른빛 회색 — 차분/프로페셔널",
  },
  radius: {
    none: "각진 — 0px",
    sm: "살짝 둥근 — 작은 radius",
    md: "기본 — 중간 radius (권장)",
    lg: "더 둥근",
    xl: "많이 둥근",
    full: "캡슐형 — 9999px",
  },
  mode: {
    "light-dark": "라이트/다크 자동 전환 (prefers-color-scheme, 권장)",
    light: "라이트 전용",
    dark: "다크 전용",
  },
  cssFramework: {
    plain: "플레인 CSS — CSS custom properties + 일반 .css 파일 (모든 컴포넌트 지원)",
    tailwind: "Tailwind v4 utility class — class-variance-authority 기반",
    "css-modules": "CSS Modules — .module.css + styles.X 참조, 빌드 타임 hash 격리",
  },
};

/** stdout 으로 출력되는 console.* 호출을 버퍼에 캡처해 텍스트로 반환. */
async function captureConsole(fn) {
  const out = [];
  const origLog = console.log;
  const origErr = console.error;
  console.log = (...args) => out.push(args.map(String).join(" "));
  console.error = (...args) => out.push(args.map(String).join(" "));
  try {
    await fn();
  } finally {
    console.log = origLog;
    console.error = origErr;
  }
  return out.join("\n");
}

function textResult(text) {
  return { content: [{ type: "text", text }] };
}

function jsonResult(data) {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

async function loadRegistry(platform) {
  const path = resolve(getRegistryRoot(platform), "registry.json");
  return JSON.parse(await readFile(path, "utf8"));
}

async function loadSummaries(platform) {
  try {
    const data = JSON.parse(await readFile(getSummariesPath(platform), "utf8"));
    return data.summaries ?? {};
  } catch {
    return {};
  }
}

function resolveCwd(input) {
  return input?.cwd ? resolve(input.cwd) : process.cwd();
}

/**
 * 하드코딩 제거 — packages/cli/package.json 에서 version + name 을 시작 시점에 읽어 그대로 사용.
 * mcp.mjs 가 src/ 에 있고 package.json 은 그 상위 (../package.json) 라 상대 URL 로 해석.
 * 출고 모드 (data/ 번들) 에서도 동일 경로 (src/mcp.mjs ↔ package.json) 라 그대로 동작.
 *
 * version: McpServer 식별자 — 클라이언트가 캐시·진단용으로 표시
 * name: SERVER_INSTRUCTIONS 의 `npx <cli> ...` 예시에 보간 — cli rename 시 자동 따라감
 */
async function readPackageMeta() {
  const pkgUrl = new URL("../package.json", import.meta.url);
  const pkg = JSON.parse(await readFile(pkgUrl, "utf8"));
  return { version: pkg.version, name: pkg.name };
}

function buildServerInstructions(cliName) {
  return `sh-ui — Base UI 위에 빌드된 React/Flutter 디자인 시스템.

## 새 프로젝트를 만드는 경우

빈 폴더에서 시작하거나 사용자가 "Next.js 앱 만들어줘", "Flutter 프로젝트 새로", "sh-ui 로 시작" 처럼 **스캐폴드부터** 요청하면:

**1차 — \`sh_ui_create_project\` MCP 툴** (선호):
  - 인자: name, platform (next|flutter), structure (next 일 때 standalone|monorepo), plugins (선택), force (덮어쓰기)
  - 인터랙티브 프롬프트 없이 한 번에 스캐폴드 + 토큰 + sh-ui.config.json 생성

**2차 — Bash** (사용자가 직접 셸에서 돌리고 싶다고 명시할 때만):
  npx ${cliName} create my-app --platform next --structure standalone --yes

\`create-next-app\` + \`sh_ui_init\` 조합은 **쓰지 말 것** — 위 두 경로가 더 짧고 sh-ui 관용에 맞다.

## 기존 모노레포에 새 앱 추가하는 경우 (v0.66+)

이미 sh-ui monorepo 가 있고 사용자가 "admin 앱 추가", "dashboard 같은 앱 더 만들고 싶어" 류 요청을 하면 \`sh_ui_add_app\` MCP 툴 사용 (Bash 직접 호출보다 우선).

  - 인자: name (필수), port, plugins (선택), theme (앱별 다른 톤 가능), cssFramework, cwd
  - 산출물: \`apps/{name}/\` (Next.js + arch overlay) + \`packages/ui/ui-apps/ui-{name}/\` (tokens-only role, v0.65 layout). 새 ui-app 만 theme/css 적용 — 다른 앱 영향 X.
  - 앱별로 다른 톤을 원하면 각 앱 별도 호출 (예: 마케팅 사이트 = rose, admin = emerald). 컴포넌트는 ui-core 단일 SoT 라 두 앱이 자동 공유.

## v0.64.x → v0.65 마이그레이션 (v0.66+)

사용자가 "v0.64 모노레포에서 컴포넌트 중복 emit 정리하고 싶어" / "ui-app 들에 같은 컴포넌트가 N 번 있어" 류 요청 또는 사용자가 v0.64.x 시절 만든 모노레포라면 \`sh_ui_migrate_to_v065\` 사용:

  - **dryRun 기본** — 변경 plan 미리보기 후 사용자 확인. 컨텐츠 충돌 시 abort (자동 병합 안 함).
  - apply: 모든 ui-app 의 \`src/{components,hooks,lib}/\` → \`packages/ui/ui-core/\` 단일 SoT 로 dedup 이동, ui-app 에 \`role: "tokens-only"\` 마커, \`apps/*\` 의 \`@workspace/ui-{app}/components/...\` 임포트를 \`@workspace/ui-core/...\` 로 일괄 재작성.
  - 적용 후 사용자에게 \`pnpm install\` 안내.

## 이미 있는 프로젝트에 sh-ui 를 얹는 경우 (MCP 툴 사용)

기존 Next.js/Vite/Flutter 프로젝트에 sh-ui 컴포넌트만 추가하고 싶을 때:
1. \`sh_ui_describe_init\` — 자연어 의도("다크 모던")를 enum 으로 매핑
2. \`sh_ui_init\` — \`sh-ui.config.json\` 생성
3. \`sh_ui_add_component\` — \`tokens\` 먼저, 그다음 컴포넌트

## 컴포넌트 작업

- \`sh_ui_list_components\` — 어떤 게 있는지
- \`sh_ui_get_component\` — props/소스 확인 (코드 작성 전)
- \`sh_ui_add_component\` / \`sh_ui_remove_component\` — 설치/삭제
- \`sh_ui_get_changelog\` — 최근 변경 내역

## 진단 — sh-ui doctor (v0.68+)

UI 작업이 끝났는데 컴포넌트가 시각적으로 깨졌거나 ("focus outline 안 보임", "hover 색 변화 없음" 류) 사용자가 sh-ui 버전을 올린 직후 / 토큰을 손댄 직후라면 \`npx ${cliName} doctor\` 를 Bash 로 실행해 한 번에 점검:
- sh-ui.config.json / paths.tokens / paths.cssEntry import / 설치된 컴포넌트의 토큰 의존성 검증
- 누락 토큰 (silent breakage) 을 fail 로 표시 — 화면이 깨진 이유를 즉시 파악
- exit 1 이면 사용자에게 어떤 토큰이 누락됐는지 보고 + \`sh-ui tokens upgrade --apply\` 권장

## 토큰 마이그레이션 — tokens diff / upgrade (v0.69+)

사용자가 sh-ui 버전을 올린 뒤 "새 토큰이 들어왔어?" / "tokens.css 업그레이드해줘" 류 요청 또는 doctor 가 누락 토큰을 신호하면:

1. **\`npx ${cliName} tokens diff\`** — 현재 tokens.css vs buildTokens 결과의 added/changed/removed 미리보기. 사용자에게 결과를 보여주고 어떤 모드로 적용할지 확인.
2. **\`npx ${cliName} tokens upgrade --apply\`** — added 변수만 incremental 추가 (사용자가 손댄 색은 보존). 대부분의 경우 이쪽.
3. **\`npx ${cliName} tokens upgrade --replace\`** — 사용자가 "표준값으로 리셋" 명시할 때만. 모든 편집이 사라짐.

제약: theme.base 가 buildable preset (neutral/zinc/slate) 일 때만 동작. custom (base64) / rich preset (rose/emerald/violet) 은 친절 에러로 종료 — 그땐 \`sh_ui_decode_theme\` → 객체 수정 → \`sh_ui_encode_theme\` round-trip 으로 새 base64 만들어 재스캐폴드.

## 테마 추출 — theme extract (v0.70+)

사용자가 "지금 색 그대로 다른 앱에 박고 싶어" / "현재 토큰 base64 로 뽑아줘" / "디자인 시스템 문서에 색 스냅샷 저장" 같은 요청에는 \`npx ${cliName} theme extract\` (Bash):
- 현재 tokens.css 의 light/dark + radius 를 sh-ui base64 로 추출 (stdout, stderr 에 정보 분리)
- 추출된 base64 를 \`sh_ui_create_project\` 의 \`theme\` 인자에 그대로 넘기면 동일 톤의 새 앱 생성
- \`sh_ui_encode_theme\` 의 역방향 — 사용자가 tokens.css 를 직접 손댄 결과를 다시 base64 화

제약: tokens.css 모든 필수 색이 #RRGGBB 여야 함. color-mix() / var() / rgba() 가 섞이면 친절 에러 — 먼저 \`tokens upgrade --replace\` 로 표준값 hex 화 후 재시도 권장.

## CSS 번들 모드 — cssStrategy: bundled (v0.71+)

사용자가 "컴포넌트 폴더에 styles.css 너무 많이 떨어진다" / "한 파일로 합치고 싶어" 류 요청 또는 50개+ 컴포넌트 깐 모노레포에서 파일 폭증을 호소하면:

1. **\`sh-ui.config.json\` 에 \`cssStrategy: "bundled"\` + \`paths.cssBundle: "src/styles/sh-ui-components.css"\` 추가**.
2. 사용자가 \`paths.cssBundle\` 을 globals.css 에서 한 번 import (자동화 안 함 — 사용자에게 안내).
3. 이후 \`sh_ui_add_component\` 가 컴포넌트 styles.css 를 cssBundle 의 \`/* sh-ui:component:NAME-start ... -end */\` 마커 섹션으로 누적. 컴포넌트 .tsx 의 styles.css import 는 자동 제거.
4. \`sh_ui_remove_component\` 도 .tsx + 번들 섹션을 같이 정리.

제약: \`cssFramework: "plain"\` 에서만 동작. tailwind/css-modules/vanilla-extract 는 자체 스코프가 있어 bundled 무시. 기존 per-component 프로젝트에서 bundled 로 마이그레이션은 자동화 없음 — config 추가 후 모든 컴포넌트 \`sh_ui_add_component force=true\` 재실행 안내.

### 모노레포 라우팅 (v0.65+)

monorepo 에서 \`sh_ui_add_component\` 호출 시:
- **컴포넌트/훅/lib** → \`packages/ui/ui-core/\` 단일 SoT (ui-app 마다 복제 X). 모든 앱이 \`@workspace/ui-core/components/<name>\` 으로 import.
- **\`tokens\`** → 각 \`packages/ui/ui-apps/ui-{app}/\` (앱별 다른 톤 가능). \`--app <name>\` 으로 대상 명시 가능.

CLI \`sh-ui add <name>\` 은 monorepo 의 어느 디렉토리에서든 (apps/web/, root, ui-core, ui-apps/ui-{app}) 실행해도 자동 라우팅 (v0.67+ walk-up). \`apps/web/\` 안에서 \`sh-ui add tokens\` 실행하면 hintApp='web' 으로 ui-web 자동 선택.

## UI 짤 때 사고 순서 (raw HTML 기본값 회피)

새 위젯·페이지를 작성할 때 \`<aside>\` / \`<nav>\` / \`<header>\` / \`<table>\` / \`<button>\` 같은 시맨틱 태그를 raw 로 쓰기 전에:

1. **\`sh_ui_list_components\` 로 카탈로그 한 번 훑기** — Sidebar / Header / AppShell / Breadcrumb / Pagination / Tabs 등 **위젯 단위** 컴포넌트도 있다 (Button/Input 같은 primitive 만 있는 게 아님). "사이드바 직접 짜야지" 같은 자동 사고를 의식적으로 멈추고 카탈로그 확인.
2. 매칭되는 sh-ui 컴포넌트가 있으면 **그걸 우선 사용**. \`sh_ui_get_component\` 로 props/사용 패턴 확인.
3. 매칭 없을 때만 raw HTML + Tailwind 폴백.
4. \`sh_ui_add_component\` 로 설치한 컴포넌트는 페이지 작성 단계에서 다시 의식적으로 import — install 해놓고 안 쓰는 누락이 잦다 (Breadcrumb / DropdownMenu 류). add 시점에 사용처를 머릿속에 메모하고, 페이지 짤 때 그 목록을 한 번 훑기.

### raw HTML 폴백이 정당한 경우
- 카탈로그에 매칭 컴포넌트 없음 (예: \`<table>\` — sh-ui 에 table 없음)
- 의도적인 변형 (sh-ui 변종에 없는 dashed border 카드 등)
- 한 번 쓰는 ad-hoc 레이아웃

이런 경우라도 **"sh-ui 에 X 없어서 직접"** 같은 코멘트를 짧게 남기면 다음 작업자(사람·AI) 가 의도 인식 가능.

### 흔한 누락 패턴

이전 세션에서 반복된 실수:
- 사이드바를 \`<aside>\` + \`<Link>\` 로 직접 짬 → sh-ui 의 \`Sidebar\` / \`SidebarProvider\` / \`SidebarMenu\` 등 풍부한 API 가 있음
- breadcrumb 을 \`<nav><Link>···<ChevronRight />···</nav>\` 로 직접 짬 → \`Breadcrumb\` / \`BreadcrumbList\` / \`BreadcrumbItem\` / \`BreadcrumbSeparator\` 가 카탈로그에 있음
- 다이얼로그 cancel 버튼을 \`<Button onClick={() => setOpen(false)}>\` 로 우회 → 정석은 \`<DialogClose render={<Button>취소</Button>} />\` (Base UI render prop)
- table 외관의 카드 그리드를 raw \`<div>\` 로 → \`Card\` / \`CardHeader\` / \`CardContent\` / \`CardFooter\` 사용

## Base UI 합성 함정 (Next.js App Router)

Base UI 위에 빌드된 sh-ui 컴포넌트 (\`DropdownMenu\` / \`Select\` / \`Dialog\` / \`Popover\` / \`Tooltip\` / \`Combobox\`) 두 가지 알려진 패턴:

### 1. SSR hydration warning (auto-id)

Base UI 의 \`useId()\` 가 서버/클라이언트 ID 가 다를 수 있어 hydration mismatch 경고. 동작은 무해하지만 콘솔 노이즈.

**회피 패턴 — mounted gate** (sidebar header 등 항상 보이는 trigger 에 적용):

\`\`\`tsx
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);

if (!mounted) {
  // trigger 외형만 그대로, dropdown wrapping 없이 placeholder 렌더
  return <div className={TRIGGER_CLS}>…</div>;
}
return (
  <DropdownMenu>
    <DropdownMenuTrigger className={TRIGGER_CLS}>…</DropdownMenuTrigger>
    <DropdownMenuContent>…</DropdownMenuContent>
  </DropdownMenu>
);
\`\`\`

### 2. \`DropdownMenuItem\` 안에 \`DialogTrigger\` render 시 dialog 안 열림

두 Base UI primitive 의 render-prop 체인이 onClick / onSelect 충돌.

**잘못된 패턴**:
\`\`\`tsx
<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
  <DialogTrigger render={<Button>…</Button>} />   // 안 열림
</DropdownMenuItem>
\`\`\`

**정석 패턴 — controlled dialog 를 sibling 으로**:
\`\`\`tsx
const [open, setOpen] = useState(false);
return (
  <>
    <DropdownMenu>
      …
      <DropdownMenuItem onClick={() => setOpen(true)}>…</DropdownMenuItem>
    </DropdownMenu>
    <MyDialog open={open} onOpenChange={setOpen} />
  </>
);
\`\`\`

다이얼로그 컴포넌트는 controlled (\`open\`/\`onOpenChange\`) 모드를 지원하도록 작성해 둘 것.

## 앱 이름 변경 (monorepo)

사용자가 "apps/web 을 apps/dashboard 로 바꿔줘" 같이 모노레포 앱 이름 변경을 요청하면 \`sh_ui_rename_app\` 사용 — 손으로 6~10 군데 (디렉토리, package.json name, tsconfig paths, Dockerfile WORKDIR, next.config transpilePackages, sh-ui.config aliases, README, .github/workflows) 갈아엎지 않도록 자동화. \`dryRun: true\` 로 먼저 변경 매트릭스 보여주고 사용자 확인 후 실행 권장.

## 테마 — encode-first, edit-later 금지

\`sh_ui_create_project\` 는 **단일 진입점**이다. 톤은 create **호출 전에** 정하고 \`theme\` 인자로 넘긴다 — 스캐폴드 후 \`tokens.css\` 를 손으로 고치는 흐름은 사용하지 않는다 (변경분이 다음 재스캐폴드 때 유실됨).

### 정석 흐름

1. **톤 정한다** — 프리셋(\`neutral\`/\`slate\`/\`rose\`/\`emerald\`/\`violet\`) 또는 base64.
2. **커스텀이면 \`sh_ui_encode_theme\` 으로 base64 만든다** — \`{ light, dark, radius }\` (+ 옵셔널 \`success\`/\`warning\`/\`info\`). 기존 base64 일부 수정은 \`sh_ui_decode_theme\` → 객체 수정 → 재인코딩 round-trip.
3. **\`sh_ui_create_project\` 의 \`theme\` 인자에 그대로 넘긴다** — 길이로 프리셋/base64 자동 판별. 결과:
   - \`tokens.css\` 의 색 블록이 정확히 주입됨 (수동 수정 불필요).
   - \`sh-ui.config.json\` 의 \`theme.base\` 가 프리셋이면 그 이름, base64 면 \`'custom'\` 으로 기록.
   - \`paths.styles\` 도 자동 박힘 — \`sh_ui_add_component\` 가 \`base\` 같은 스타일 산출물을 깨짐 없이 처리.
4. **base64 는 메모리에 저장**해 둔다 (사용자별 프로젝트 메모리). 같은 프로젝트 재스캐폴드/이주 시 같은 톤 보존용.

### 기존 프로젝트 톤만 바꾸고 싶을 때

> v0.61.2 부터 \`theme.base: "custom"\` 인 프로젝트에서 \`sh_ui_add_component\` 의 \`tokens\` 는 no-op (보존). v0.67.1 부터 \`rose\`/\`emerald\`/\`violet\` 같은 풍부한 preset 도 동일 — tokens.css 단일 진실로 보존. 색을 바꾸려면 새 base64 를 만들고 새 디렉토리로 \`force: true\` 재스캐폴드하는 게 정석. 부분 편집을 원해도 \`tokens.css\` 직접 수정 후 \`sh_ui_encode_theme\` 로 새 base64 백업까지 같이 — 그 base64 를 메모리에 갱신해야 다음 재스캐폴드와 일관됨.
`;
}

export async function startMcpServer() {
  const { version, name: cliName } = await readPackageMeta();
  const server = new McpServer(
    { name: "sh-ui", version },
    {
      capabilities: { tools: {} },
      instructions: buildServerInstructions(cliName),
    },
  );

  server.registerTool(
    "sh_ui_describe_init",
    {
      description:
        "sh-ui init 의 4개 축(platform/base/radius/mode) 선택지와 한글 설명 반환. " +
        "사용자의 자연어 의도(\"다크 모던\", \"따뜻한 느낌\")를 enum 값으로 매핑할 때 먼저 호출.",
      inputSchema: {},
    },
    async () => jsonResult(INIT_DESCRIPTIONS),
  );

  server.registerTool(
    "sh_ui_create_project",
    {
      description:
        "빈 폴더에 sh-ui 프로젝트 스캐폴드 — Next.js (standalone/monorepo) | Vite (standalone/monorepo) | Flutter. " +
        `FSD 폴더 구조 + 토큰 + sh-ui.config.json 일괄 생성. 사용자가 '새 프로젝트' / '빈 폴더' / '스캐폴드부터' 류 요청을 하면 이 툴 사용 (Bash 로 npx ${cliName} create 직접 호출보다 우선). ` +
        "**단일 진입점** — theme/plugins/cssFramework/structure 모두 호출 시점에 정해서 한 번에 박는다. 호출 후 sh-ui.config.json/tokens.css 를 손으로 패치하지 말 것 (다음 재스캐폴드 시 유실). " +
        "산출물: theme 인자가 프리셋이면 sh-ui.config.json 의 theme.base 가 그 이름, base64 면 'custom'. paths.styles · paths.tokens 도 자동 박혀서 sh_ui_add_component 가 사후 패치 없이 동작.",
      inputSchema: {
        name: z.string().min(1)
          .describe("프로젝트 디렉토리 이름. 예: my-app"),
        platform: z.enum(CREATE_PLATFORMS)
          .describe("타겟 플랫폼"),
        structure: z.enum(CREATE_STRUCTURES).optional()
          .describe("Next.js 구조 — platform=next 일 때 필수. standalone(단독) | monorepo(Turborepo)"),
        plugins: z.array(z.enum(PLUGIN_NAMES)).optional()
          .describe(`Next.js 플러그인 (${PLUGIN_NAMES.join(', ')}). 미지정시 빈 배열`),
        arch: z.enum(ARCH_NAMES).optional()
          .describe(
            `프로젝트 아키텍처 — 플랫폼별로 사용 가능한 값이 다름. ` +
            `현재 next 에서 사용 가능: ${allArchitectures.filter((a) => a.platforms.includes('next')).map((a) => a.name).join(', ')} (기본 fsd). ` +
            `flutter 는 현재 arch 디스크립터 없음 (미지정 또는 host 자체 default). ` +
            `arch 와 플러그인은 별개 — arch 는 폴더 구조/import alias 컨벤션, 플러그인은 기능.`,
          ),
        theme: z.string().optional()
          .describe(`프리셋 이름 (${THEME_PRESETS_LIST}) 또는 base64 테마 코드. 사용자가 톤을 직접 손본 결과를 영구 보관하려면 sh_ui_encode_theme 으로 base64 를 만들어 여기에 넘긴다.`),
        cssFramework: z.enum(CSS_FRAMEWORKS).optional()
          .describe(`CSS 프레임워크. 기본 plain. base 파일까지 분기 emit (plain/tailwind/css-modules) + 컴포넌트 변종까지 결정. 변종 미보유 시 add 는 plain fallback`),
        cwd: z.string().optional()
          .describe("부모 디렉토리. 기본 process.cwd()"),
        force: z.boolean().optional()
          .describe("기존 디렉토리 덮어쓰기. 기본 false (안전)"),
      },
    },
    async (input) => {
      if ((input.platform === "next" || input.platform === "vite") && !input.structure) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `platform=${input.platform} 일 때 structure ('standalone' | 'monorepo') 가 필요합니다.`,
            },
          ],
        };
      }
      // path traversal 차단 — existsSync probe / fs.remove 흐름이 임의 경로로
      // 흘러가지 않도록 입력 검증을 가장 먼저.
      try {
        validateProjectName(input.name, "name");
      } catch (e) {
        return { isError: true, content: [{ type: "text", text: e.message }] };
      }
      const targetParent = resolveCwd(input);
      const targetDir = resolve(targetParent, input.name);
      if (existsSync(targetDir) && !input.force) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `'${targetDir}' 가 이미 존재합니다. 덮어쓰려면 force: true.`,
            },
          ],
        };
      }
      const origCwd = process.cwd();
      try {
        process.chdir(targetParent);
        const text = await captureConsole(() =>
          createProject({
            name: input.name,
            platform: input.platform,
            structure: input.structure,
            plugins: input.plugins,
            arch: input.arch,
            theme: input.theme,
            css: input.cssFramework,
            yes: true, // 사전 검사를 마쳤으니 generator 의 confirm 프롬프트 우회
          }),
        );
        return textResult(text || "✓ 프로젝트 생성 완료");
      } finally {
        process.chdir(origCwd);
      }
    },
  );

  server.registerTool(
    "sh_ui_add_app",
    {
      description:
        "기존 모노레포에 새 Next.js 앱 추가 — apps/{name}/ + packages/ui/ui-apps/ui-{name}/ 동시 생성. " +
        "사용자가 '앱 추가' / 'monorepo 에 새 앱' / 'add admin app' 류 요청을 하면 이 툴 사용 (Bash 로 npx " + cliName + " add-app 직접 호출보다 우선). " +
        "v0.65+ 레이아웃 준수 — ui-{name} 은 tokens-only role, 컴포넌트는 sibling ui-core 가 SoT. " +
        "theme/css 는 새 ui-app 에만 적용 (다른 앱 영향 없음). monorepo 가 아니면 (pnpm-workspace.yaml 없음) 에러.",
      inputSchema: {
        name: z.string().min(1)
          .describe("앱 이름 — apps/{name}/ + packages/ui/ui-apps/ui-{name}/ 디렉토리명. 영숫자 + 하이픈."),
        port: z.string().optional()
          .describe("개발 서버 포트. 기본 3000. 다른 앱과 겹치면 사용자가 직접 다르게 지정."),
        plugins: z.array(z.enum(PLUGIN_NAMES)).optional()
          .describe(`Next.js 플러그인 (${PLUGIN_NAMES.join(', ')}). 미지정시 빈 배열`),
        theme: z.string().optional()
          .describe(`프리셋 이름 (${THEME_PRESETS_LIST}) 또는 base64 테마 코드. 새 ui-app 의 tokens.css 에만 주입.`),
        cssFramework: z.enum(CSS_FRAMEWORKS).optional()
          .describe("CSS 프레임워크. 기본 plain. 새 앱의 컴포넌트 변종 결정 — 같은 모노레포 내 다른 앱과 다른 값 가능."),
        cwd: z.string().optional()
          .describe("모노레포 루트 (pnpm-workspace.yaml 있는 곳). 기본 process.cwd()"),
      },
    },
    async (input) => {
      try {
        validateProjectName(input.name, "name");
      } catch (e) {
        return { isError: true, content: [{ type: "text", text: e.message }] };
      }
      const text = await captureConsole(() =>
        addApp({
          name: input.name,
          port: input.port,
          plugins: input.plugins,
          theme: input.theme,
          css: input.cssFramework,
          cwd: resolveCwd(input),
        }),
      );
      return textResult(text || "✓ 앱 추가 완료");
    },
  );

  server.registerTool(
    "sh_ui_init",
    {
      description:
        "⚠️ 빈 폴더/새 프로젝트면 이 툴 대신 sh_ui_create_project 사용 — 스캐폴드 + 토큰 + config 일괄 처리. " +
        "이 툴은 **이미 있는** Next.js/Vite/Flutter 프로젝트에 sh-ui 만 얹을 때. " +
        "현재 디렉토리(또는 cwd)에 sh-ui.config.json 을 생성. 비대화형 — 누락된 값은 기본값 사용. " +
        "선택지 의미가 헷갈리면 먼저 sh_ui_describe_init 호출 권장.",
      inputSchema: {
        platform: z.enum(PLATFORMS).optional()
          .describe("타겟 플랫폼. 기본 react"),
        base: z.enum(BASES).optional()
          .describe("기본 색 스케일. 기본 neutral"),
        radius: z.enum(RADII).optional()
          .describe("기본 radius. 기본 md"),
        mode: z.enum(MODES).optional()
          .describe("색 모드. 기본 light-dark"),
        cssFramework: z.enum(CSS_FRAMEWORKS).optional()
          .describe(`CSS 프레임워크. 기본 plain. base 파일까지 분기 emit (plain/tailwind/css-modules) + 컴포넌트 변종까지 결정. 변종 미보유 시 add 는 plain fallback`),
        cwd: z.string().optional()
          .describe("작업 디렉토리. 기본 process.cwd()"),
        force: z.boolean().optional()
          .describe("기존 sh-ui.config.json 덮어쓰기. 기본 false"),
      },
    },
    async (input) => {
      const args = ["--yes"];
      for (const k of ["platform", "base", "radius", "mode", "cssFramework"]) {
        if (input[k]) args.push(`--${k}`, input[k]);
      }
      if (input.force) args.push("--force");
      const text = await captureConsole(() =>
        init({ cwd: resolveCwd(input), args }),
      );
      return textResult(text || "✓ init 완료");
    },
  );

  server.registerTool(
    "sh_ui_list_components",
    {
      description:
        "플랫폼별 전체 컴포넌트 목록 + 한 줄 요약 + 외부/내부 의존성. " +
        "사용자 요청에 맞는 컴포넌트를 고를 때 호출.",
      inputSchema: {
        platform: z.enum(PLATFORMS).optional()
          .describe("플랫폼. 미지정시 react"),
      },
    },
    async (input) => {
      const platform = input.platform ?? "react";
      const registry = await loadRegistry(platform);
      const summaries = await loadSummaries(platform);
      const components = Object.values(registry.components ?? {}).map((c) => ({
        name: c.name,
        type: c.type,
        summary: summaries[c.name] ?? "",
        dependencies: c.dependencies ?? [],
        registryDependencies: c.registryDependencies ?? [],
      }));
      return jsonResult({ platform, count: components.length, components });
    },
  );

  server.registerTool(
    "sh_ui_get_component",
    {
      description:
        "단일 컴포넌트의 메타·소스파일 내용·deps 반환. 코드 작성 전 props/사용법 확인용.",
      inputSchema: {
        name: z.string().describe("컴포넌트 이름 (예: button, dialog)"),
        platform: z.enum(PLATFORMS).optional()
          .describe("플랫폼. 미지정시 react"),
        includeSource: z.boolean().optional()
          .describe("소스파일 내용 포함 여부. 기본 true"),
      },
    },
    async (input) => {
      const platform = input.platform ?? "react";
      const includeSource = input.includeSource !== false;
      const registry = await loadRegistry(platform);
      const entry = registry.components?.[input.name];
      if (!entry) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `'${input.name}' 컴포넌트를 ${platform} 레지스트리에서 찾을 수 없습니다.`,
            },
          ],
        };
      }
      const summaries = await loadSummaries(platform);
      const root = getRegistryRoot(platform);
      const files = [];
      for (const f of entry.files) {
        const file = { src: f.src, dest: f.dest };
        if (includeSource) {
          file.content = await readFile(resolve(root, f.src), "utf8");
        }
        files.push(file);
      }
      return jsonResult({
        name: entry.name,
        type: entry.type,
        summary: summaries[entry.name] ?? "",
        dependencies: entry.dependencies ?? [],
        registryDependencies: entry.registryDependencies ?? [],
        files,
      });
    },
  );

  server.registerTool(
    "sh_ui_add_component",
    {
      description:
        "컴포넌트 한 개 이상을 프로젝트에 설치. 외부 npm 패키지 deps 도 자동 설치(pnpm/npm/yarn/bun 자동 감지). " +
        "특수값 'tokens' 는 sh-ui.config.json 기반 토큰 파일 생성 — 단, theme.base 가 'custom' (= base64 로 만든 프로젝트) 이면 tokens 는 no-op (create 시점에 정확히 주입됐으므로 보존). " +
        "특수값 'base' 는 sh-ui:reset 스타일 — paths.styles 가 sh-ui.config.json 에 있어야 동작 (v0.61.2+ 의 create 산출물은 자동 포함).",
      inputSchema: {
        names: z.array(z.string()).min(1)
          .describe("설치할 컴포넌트 이름들. 예: ['tokens', 'button', 'dialog']"),
        cwd: z.string().optional()
          .describe("작업 디렉토리. 기본 process.cwd()"),
        skipInstall: z.boolean().optional()
          .describe("외부 패키지 자동 설치 생략. 기본 false"),
        overwrite: z.boolean().optional()
          .describe("이미 존재하는 파일도 덮어쓸지. 기본 false (= 사용자 변경 보존)"),
      },
    },
    async (input) => {
      const text = await captureConsole(() =>
        add({
          cwd: resolveCwd(input),
          names: input.names,
          skipInstall: input.skipInstall === true,
          // MCP 컨텍스트는 비대화형 — 명시적으로 overwrite=true 일 때만 덮어쓰고, 아니면 기존 파일 보존.
          onConflict: input.overwrite === true ? "overwrite" : "keep",
        }),
      );
      return textResult(text || "✓ add 완료");
    },
  );

  server.registerTool(
    "sh_ui_remove_component",
    {
      description:
        "설치된 컴포넌트 파일 삭제. 사용자가 수정한 파일은 기본 보호(force 로 덮어쓰기 가능).",
      inputSchema: {
        names: z.array(z.string()).min(1)
          .describe("삭제할 컴포넌트 이름들"),
        cwd: z.string().optional(),
        force: z.boolean().optional()
          .describe("수정된 파일도 삭제. 기본 false"),
        dryRun: z.boolean().optional()
          .describe("삭제 대상만 출력. 기본 false"),
      },
    },
    async (input) => {
      const text = await captureConsole(() =>
        remove({
          cwd: resolveCwd(input),
          names: input.names,
          force: input.force === true,
          dryRun: input.dryRun === true,
        }),
      );
      return textResult(text || "✓ remove 완료");
    },
  );

  // 테마 round-trip — 사용자가 손본 토큰을 다음 스캐폴드까지 보존.
  // 입력 hex 토큰은 z.object 로 명시 — 누락/오타가 즉시 잡히고 클라이언트(IDE-내 AI)가 schema 만 봐도
  // 어떤 키가 필요한지 자동으로 알 수 있다. round-trip 검증은 encodeTheme 내부의 decodeTheme 호출에 위임.
  const HEX = z.string().regex(/^#[0-9A-Fa-f]{6}$/, "hex 컬러 (#RRGGBB)");
  const tokenMapSchema = z
    .object({
      background: HEX, "background-subtle": HEX, "background-muted": HEX, "background-inverse": HEX,
      foreground: HEX, "foreground-muted": HEX, "foreground-subtle": HEX, "foreground-inverse": HEX,
      border: HEX, "border-strong": HEX,
      primary: HEX, "primary-foreground": HEX, "primary-hover": HEX,
      danger: HEX, "danger-foreground": HEX,
      success: HEX.optional(), "success-foreground": HEX.optional(),
      warning: HEX.optional(), "warning-foreground": HEX.optional(),
      info: HEX.optional(), "info-foreground": HEX.optional(),
    })
    .describe("15개 필수 색 토큰 + 옵셔널 6개(success/warning/info × -foreground). 각 값은 #RRGGBB hex");

  server.registerTool(
    "sh_ui_encode_theme",
    {
      description:
        "색 토큰 객체({ light, dark, radius }) 를 sh-ui base64 테마 코드로 인코딩. " +
        "정석 흐름: 톤을 정해 (사용자와 합의 또는 프리셋 변형) 이 툴로 base64 만든 뒤 sh_ui_create_project 의 theme 인자에 그대로 넘긴다 — create 한 번에 끝, 스캐폴드 후 tokens.css 손편집 불필요. " +
        "이미 만든 프로젝트의 톤을 다음 재스캐폴드까지 영구 보관할 때도 사용 (메모리 등에 base64 저장).",
      inputSchema: {
        light: tokenMapSchema.describe("라이트 모드 토큰"),
        dark: tokenMapSchema.describe("다크 모드 토큰"),
        radius: z.number().min(0).max(1.5)
          .describe("기본 radius (rem 단위, 0~1.5). 일반 권장값 0.5~0.75"),
      },
    },
    async (input) => {
      try {
        const b64 = encodeTheme({
          light: input.light,
          dark: input.dark,
          radius: input.radius,
        });
        return jsonResult({
          theme: b64,
          length: b64.length,
          hint: "sh_ui_create_project 의 theme 인자에 위 문자열을 그대로 넣으면 됩니다.",
        });
      } catch (e) {
        return {
          isError: true,
          content: [{ type: "text", text: e.message }],
        };
      }
    },
  );

  server.registerTool(
    "sh_ui_decode_theme",
    {
      description:
        "sh-ui base64 테마 코드를 토큰 객체로 복원. " +
        "기존 base64 테마의 일부만 수정해 다시 인코딩하고 싶을 때 사용 (decode → 수정 → encode).",
      inputSchema: {
        theme: z.string().describe("sh-ui base64 테마 코드"),
      },
    },
    async (input) => {
      try {
        return jsonResult(decodeTheme(input.theme));
      } catch (e) {
        return {
          isError: true,
          content: [{ type: "text", text: e.message }],
        };
      }
    },
  );

  // 모노레포 앱 이름 일괄 변경 — 디렉토리 이동 + import/path 패턴 치환 + lockfile 재생성.
  // dryRun=true 면 변경 매트릭스만 반환해 AI 가 사용자에게 미리보기 가능.
  server.registerTool(
    "sh_ui_rename_app",
    {
      description:
        "monorepo 의 앱 이름 일괄 변경 — apps/<old>/, packages/ui/ui-apps/ui-<old>/ 두 디렉토리 이동 + " +
        "@workspace/ui-<old> / apps/<old> / --filter <old> / --app <old> / cd apps/<old> 패턴 치환 + " +
        "사용자 코드, package.json name, tsconfig paths, Dockerfile WORKDIR, sh-ui.config.json aliases, README, .github/workflows 모두 자동 갱신. " +
        "monorepo 전용 (pnpm-workspace.yaml 필수). dryRun 으로 변경 매트릭스 미리보기 가능. " +
        "false-positive 방지를 위해 bare 단어(예: 'web')는 절대 치환하지 않고 컨텍스트(슬래시·공백·따옴표) 로 묶인 패턴만 처리.",
      inputSchema: {
        oldName: z.string().min(1).describe("현재 앱 이름 (예: 'web'). apps/<old>/ 가 존재해야 함."),
        newName: z.string().min(1).describe("새 앱 이름 (예: 'dashboard'). 영숫자 + 하이픈만 허용."),
        cwd: z.string().optional().describe("monorepo 루트 디렉토리. 기본 process.cwd()"),
        dryRun: z.boolean().optional().describe("변경 매트릭스만 반환, 실제 파일 변경 X. 기본 false"),
        skipInstall: z.boolean().optional().describe("마지막 pnpm install 생략. 기본 false"),
      },
    },
    async (input) => {
      const result = await captureConsole(() =>
        renameApp({
          cwd: resolveCwd(input),
          oldName: input.oldName,
          newName: input.newName,
          yes: true, // MCP 컨텍스트는 비대화형 — 호출자(AI) 가 사용자 확인을 이미 받았다고 가정
          dryRun: input.dryRun === true,
          skipInstall: input.skipInstall === true,
        }),
      );
      return textResult(result || "✓ rename-app 완료");
    },
  );

  // v0.64.x → v0.65 monorepo 자동 마이그레이션.
  server.registerTool(
    "sh_ui_migrate_to_v065",
    {
      description:
        "v0.64.x → v0.65 monorepo 자동 마이그레이션 — 컴포넌트/훅/lib 를 ui-{app} 들에서 ui-core 단일 SoT 로 통합 + ui-app 을 tokens-only role 로 정리 + apps/* 의 import (`@workspace/ui-{app}/components/...` → `@workspace/ui-core/...`) 재작성. " +
        "**dryRun 기본 — 안전 우선**. 컨텐츠 충돌(같은 logical path 의 파일이 ui-app 마다 다른 내용) 검출 시 abort + 충돌 목록 반환 (자동 병합 안 함, 사용자가 손본 컴포넌트 보호). " +
        "monorepo 전용 (pnpm-workspace.yaml + packages/ui/ui-apps 필요). 적용 후 사용자에게 `pnpm install` 안내 필수.",
      inputSchema: {
        cwd: z.string().optional().describe("monorepo 루트. 기본 process.cwd()"),
        dryRun: z.boolean().optional().describe("plan 만 반환, 실제 변경 X. 기본 true (안전)"),
        skipImportRewrite: z.boolean().optional().describe("apps/* import 재작성 생략. 기본 false"),
      },
    },
    async (input) => {
      try {
        const { summary } = await migrateToV065({
          cwd: resolveCwd(input),
          dryRun: input.dryRun !== false,
          skipImportRewrite: input.skipImportRewrite === true,
        });
        return textResult(summary);
      } catch (e) {
        return {
          isError: true,
          content: [{ type: "text", text: e.message }],
        };
      }
    },
  );

  // 템플릿 트리 사전 미리보기 — 실제 생성 없이 옵션 조합으로 어떤 파일이 emit 되는지.
  // apps/docs 의 CreateProjectDialog 와 같은 출력 (sh-ui-cli/api 의 describeTemplate).
  server.registerTool(
    "sh_ui_describe_template",
    {
      description:
        "sh-ui create 호출 시 어떤 파일이 생기는지 사전 계산 — 실제 fs 변경 없음. " +
        "사용자가 '미리 보고 싶다' / '어떤 파일 생기는지' / '플러그인 켜면 뭐가 추가돼?' 류 질문을 하면 이 툴 사용 (sh_ui_create_project 의 dry-run 대용). " +
        "베이스 템플릿 + arch 오버레이 + plugin.files + cssFramework 분기 + plugin.transforms (이동/삭제) 까지 정확히 반영. " +
        "반환: { files: 정렬된 전체 경로, groups: 출처별 분류 (base/arch/plugin-*/css/transform) }.",
      inputSchema: {
        platform: z.enum(CREATE_PLATFORMS)
          .describe("타겟 플랫폼"),
        structure: z.enum(CREATE_STRUCTURES).optional()
          .describe("Next.js 구조. platform=next | vite 일 때 의미. 기본 standalone"),
        arch: z.enum(ARCH_NAMES).optional()
          .describe("아키텍처. platform=next 일 때 의미. 기본 fsd"),
        plugins: z.array(z.enum(PLUGIN_NAMES)).optional()
          .describe(`Next.js 플러그인 배열 (${PLUGIN_NAMES.join(', ')}). 미지정 빈 배열`),
        cssFramework: z.enum(CSS_FRAMEWORKS).optional()
          .describe("CSS 프레임워크. 기본 plain. css-modules 면 page.module.css 등 추가"),
        appName: z.string().optional()
          .describe("monorepo 첫 앱 이름. 기본 web"),
      },
    },
    async (input) => {
      try {
        const result = describeTemplate({
          platform: input.platform,
          structure: input.structure,
          arch: input.arch,
          plugins: input.plugins,
          cssFramework: input.cssFramework,
          appName: input.appName,
        });
        return jsonResult(result);
      } catch (e) {
        return {
          isError: true,
          content: [{ type: "text", text: e.message }],
        };
      }
    },
  );

  // 변경 내역 조회 — 보너스: 사용자가 "최근 변경 알려줘" 류 요청 시
  server.registerTool(
    "sh_ui_get_changelog",
    {
      description: "sh-ui 변경 내역(versions.json) 반환. 최신이 맨 앞.",
      inputSchema: {
        limit: z.number().int().positive().optional()
          .describe("최근 N개만. 기본 전체"),
      },
    },
    async (input) => {
      const data = JSON.parse(await readFile(getVersionsPath(), "utf8"));
      const versions = input.limit
        ? data.versions.slice(0, input.limit)
        : data.versions;
      return jsonResult({ count: versions.length, versions });
    },
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
  // stdio MCP 는 서버가 살아있어야 통신이 유지된다. 따라서 여기서 return 하지 않고
  // 프로세스가 자연 종료(stdin EOF) 까지 대기.
}
