// sh-ui MCP 서버 — IDE-내 AI(Claude Code, Cursor 등)가 sh-ui 컴포넌트를
// 검색/조회/설치/삭제할 수 있게 stdio MCP 툴 6개를 노출한다.
//
// 사용자 등록 (예시 — Claude Code MCP 설정):
//   "sh-ui": { "command": "npx", "args": ["-y", "sh-ui-cli", "mcp"] }
//
// 노출 툴:
//   sh_ui_describe_init    - init 4개 축(platform/base/radius/mode) enum + 한글 설명
//   sh_ui_init             - sh-ui.config.json 생성 (비대화형)
//   sh_ui_list_components  - 플랫폼 전체 컴포넌트 + 요약
//   sh_ui_get_component    - 단일 컴포넌트의 메타·소스·deps
//   sh_ui_add_component    - 컴포넌트 설치 (외부 패키지 자동 설치 포함)
//   sh_ui_remove_component - 컴포넌트 삭제

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
import { createProject } from "./create/generator.js";
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
import { THEME_PRESET_NAMES } from "./create/theme/presets.js";

const PLATFORMS = INIT_PLATFORMS;
const BASES = THEME_BASES;
const RADII = THEME_RADII;
const MODES = THEME_MODES;
const CSS_FRAMEWORKS = CSS_FRAMEWORKS_SUPPORTED;
const PLUGIN_NAMES = allPlugins.map((p) => p.name);
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
    tailwind: "Tailwind v4 utility class — class-variance-authority 기반. 변종 미제공 컴포넌트는 plain 으로 자동 fallback",
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

const SERVER_INSTRUCTIONS = `sh-ui — Base UI 위에 빌드된 React/Flutter 디자인 시스템.

## 새 프로젝트를 만드는 경우

빈 폴더에서 시작하거나 사용자가 "Next.js 앱 만들어줘", "Flutter 프로젝트 새로", "sh-ui 로 시작" 처럼 **스캐폴드부터** 요청하면:

**1차 — \`sh_ui_create_project\` MCP 툴** (선호):
  - 인자: name, platform (next|flutter), structure (next 일 때 standalone|monorepo), plugins (선택), force (덮어쓰기)
  - 인터랙티브 프롬프트 없이 한 번에 스캐폴드 + 토큰 + sh-ui.config.json 생성

**2차 — Bash** (사용자가 직접 셸에서 돌리고 싶다고 명시할 때만):
  npx sh-ui-cli create my-app --platform next --structure standalone --yes

\`create-next-app\` + \`sh_ui_init\` 조합은 **쓰지 말 것** — 위 두 경로가 더 짧고 sh-ui 관용에 맞다.

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
`;

export async function startMcpServer() {
  const server = new McpServer(
    { name: "sh-ui", version: "0.43.0" }, // sh-ui-cli 와 동기화
    {
      capabilities: { tools: {} },
      instructions: SERVER_INSTRUCTIONS,
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
        "빈 폴더에 sh-ui 프로젝트 스캐폴드 — Next.js (standalone/monorepo) 또는 Flutter. " +
        "FSD 폴더 구조 + 토큰 + sh-ui.config.json 일괄 생성. 사용자가 '새 프로젝트' / '빈 폴더' / '스캐폴드부터' 류 요청을 하면 이 툴 사용 (Bash 로 npx sh-ui-cli create 직접 호출보다 우선).",
      inputSchema: {
        name: z.string().min(1)
          .describe("프로젝트 디렉토리 이름. 예: my-app"),
        platform: z.enum(CREATE_PLATFORMS)
          .describe("타겟 플랫폼"),
        structure: z.enum(CREATE_STRUCTURES).optional()
          .describe("Next.js 구조 — platform=next 일 때 필수. standalone(단독) | monorepo(Turborepo)"),
        plugins: z.array(z.enum(PLUGIN_NAMES)).optional()
          .describe(`Next.js 플러그인 (${PLUGIN_NAMES.join(', ')}). 미지정시 빈 배열`),
        theme: z.string().optional()
          .describe(`프리셋 이름 (${THEME_PRESETS_LIST}) 또는 playground 에서 생성한 base64 (선택)`),
        cssFramework: z.enum(CSS_FRAMEWORKS).optional()
          .describe(`CSS 프레임워크. 기본 plain. 현재 ${CSS_FRAMEWORKS.join('/')} 지원 (향후 tailwind 등 추가 예정)`),
        cwd: z.string().optional()
          .describe("부모 디렉토리. 기본 process.cwd()"),
        force: z.boolean().optional()
          .describe("기존 디렉토리 덮어쓰기. 기본 false (안전)"),
      },
    },
    async (input) => {
      if (input.platform === "next" && !input.structure) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: "platform=next 일 때 structure ('standalone' | 'monorepo') 가 필요합니다.",
            },
          ],
        };
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
          .describe(`CSS 프레임워크. 기본 plain. 현재 ${CSS_FRAMEWORKS.join('/')} 지원 (향후 tailwind 등 추가 예정)`),
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
        "특수값 'tokens' 는 sh-ui.config.json 기반 토큰 파일 생성.",
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
