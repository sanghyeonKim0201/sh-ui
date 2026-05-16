/**
 * 템플릿 파일 내용 lazy 조회 — `/api/template-content?...`
 *
 * TemplatePreviewDialog 상세 트리에서 파일을 클릭하면 호출. 베이스/arch 의 디스크
 * 파일은 그대로 readFile, plugin.files (arch-aware 함수) 는 모듈 호출 결과에서
 * 추출. cssFramework 변종이나 generator.js 의 동적 emit 은 정확히 재현하지 않고
 * placeholder.
 *
 * 보안: path 인자에 `..` / 절대 경로 / NUL 등이 들어가면 거부. 항상 templates/
 * 루트 안쪽으로 normalize 후 prefix 검증.
 */

import { NextRequest, NextResponse } from "next/server";
import { existsSync } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { join, normalize, relative, resolve, sep } from "node:path";
import {
  getArchByName,
  DEFAULT_ARCH,
  allPlugins,
  isKnownArch,
} from "sh-ui-cli/api";

/**
 * sh-ui-cli 패키지의 templates/ 디렉토리 절대 경로 해석.
 *
 * Turbopack 이 `require.resolve` 결과에 `[project]/` 같은 가상 prefix 를 박아
 * fs 접근에 실패해서 (sh-ui-cli/api 의 paths.mjs 도 같은 이유로 client bundle 에
 * 새어들어가는 문제), 여기서는 cwd 기준 후보 두 곳을 순서대로 시도:
 *   1) `<cwd>/../../packages/cli/templates` — monorepo dev/prod (cwd = apps/docs)
 *   2) `<cwd>/node_modules/sh-ui-cli/templates` — 단독 배포 시 의존성으로 install
 */
const TEMPLATES_ROOT = (() => {
  const cwd = process.cwd();
  const candidates = [
    resolve(cwd, "..", "..", "packages", "cli", "templates"),
    resolve(cwd, "node_modules", "sh-ui-cli", "templates"),
  ];
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  return candidates[0];
})();

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function safeJoin(root: string, rel: string): string | null {
  // POSIX 경로로 normalize 후 root 와 결합. `..` 같은 path traversal 차단.
  const normalized = normalize(rel).split(/[\\/]+/).join(sep);
  if (normalized.startsWith("..") || normalized.startsWith(sep) || normalized.includes("\0")) {
    return null;
  }
  const full = join(root, normalized);
  const r = relative(root, full);
  if (r.startsWith("..") || r === "" || r.includes("\0")) return null;
  return full;
}

async function tryDiskFile(root: string, rel: string): Promise<string | null> {
  const full = safeJoin(root, rel);
  if (!full) return null;
  try {
    const s = await stat(full);
    if (!s.isFile()) return null;
    return full;
  } catch {
    return null;
  }
}

/** 디스크에서 파일을 찾는 후보 위치 — 우선순위 순. plugin.files 는 별도 처리. */
async function resolveDiskFile(opts: {
  platform: "next" | "flutter" | "vite";
  structure: "standalone" | "monorepo";
  arch: string;
  appName: string;
  path: string;
}): Promise<{ full: string; from: string } | null> {
  const TEMPLATES = TEMPLATES_ROOT;
  const { platform, structure, arch, appName, path: p } = opts;

  if (platform === "flutter") {
    const full = await tryDiskFile(join(TEMPLATES, "flutter-standalone"), p);
    if (full) return { full, from: "flutter-standalone" };
    return null;
  }

  if (platform === "vite") {
    if (structure === "standalone") {
      const base = await tryDiskFile(join(TEMPLATES, "vite-standalone"), p);
      if (base) return { full: base, from: "vite-standalone" };
      const overlay = await tryDiskFile(
        join(TEMPLATES, "vite-standalone", "_arch", arch),
        p,
      );
      if (overlay)
        return { full: overlay, from: `vite-standalone/_arch/${arch}` };
      return null;
    }
    // structure === "monorepo" (v0.87+)
    const appPrefix = `apps/${appName}/`;
    const uiPrefix = `packages/ui/ui-apps/ui-${appName}/`;
    if (p.startsWith(appPrefix)) {
      const inner = p.slice(appPrefix.length);
      const base = await tryDiskFile(join(TEMPLATES, "vite-app"), inner);
      if (base) return { full: base, from: "vite-app" };
      const overlay = await tryDiskFile(
        join(TEMPLATES, "vite-app", "_arch", arch),
        inner,
      );
      if (overlay) return { full: overlay, from: `vite-app/_arch/${arch}` };
      return null;
    }
    if (p.startsWith(uiPrefix)) {
      const inner = p.slice(uiPrefix.length);
      const full = await tryDiskFile(join(TEMPLATES, "ui-app-template"), inner);
      if (full) return { full, from: "ui-app-template" };
      return null;
    }
    const root = await tryDiskFile(join(TEMPLATES, "monorepo"), p);
    if (root) return { full: root, from: "monorepo" };
    return null;
  }

  // platform === "next"
  if (structure === "standalone") {
    const base = await tryDiskFile(join(TEMPLATES, "nextjs-standalone"), p);
    if (base) return { full: base, from: "nextjs-standalone" };
    const overlay = await tryDiskFile(
      join(TEMPLATES, "nextjs-standalone", "_arch", arch),
      p,
    );
    if (overlay)
      return { full: overlay, from: `nextjs-standalone/_arch/${arch}` };
    return null;
  }

  // structure === "monorepo"
  const appPrefix = `apps/${appName}/`;
  const uiPrefix = `packages/ui/ui-apps/ui-${appName}/`;

  if (p.startsWith(appPrefix)) {
    const inner = p.slice(appPrefix.length);
    const base = await tryDiskFile(join(TEMPLATES, "nextjs-app"), inner);
    if (base) return { full: base, from: `nextjs-app` };
    const overlay = await tryDiskFile(
      join(TEMPLATES, "nextjs-app", "_arch", arch),
      inner,
    );
    if (overlay) return { full: overlay, from: `nextjs-app/_arch/${arch}` };
    return null;
  }

  if (p.startsWith(uiPrefix)) {
    const inner = p.slice(uiPrefix.length);
    const full = await tryDiskFile(join(TEMPLATES, "ui-app-template"), inner);
    if (full) return { full, from: "ui-app-template" };
    return null;
  }

  // monorepo 루트 파일
  const root = await tryDiskFile(join(TEMPLATES, "monorepo"), p);
  if (root) return { full: root, from: "monorepo" };
  return null;
}

/** plugin.files 결과에서 path 키 매칭. 플러그인이 emit 한 가공 콘텐츠. */
function resolvePluginFile(opts: {
  arch: string;
  plugins: string[];
  appName: string;
  structure: "standalone" | "monorepo";
  path: string;
}): { content: string; from: string } | null {
  const safeArch = isKnownArch(opts.arch) ? opts.arch : DEFAULT_ARCH;
  const archObj = getArchByName(safeArch);

  // monorepo 면 plugin.files 의 path 는 'apps/{appName}/' prefix 가 붙어야 일치.
  const prefix =
    opts.structure === "monorepo" ? `apps/${opts.appName}/` : "";
  const needle = opts.path.startsWith(prefix)
    ? opts.path.slice(prefix.length)
    : opts.path;

  for (const plugin of allPlugins) {
    if (!opts.plugins.includes(plugin.name)) continue;
    const files = plugin.files;
    const resolved =
      typeof files === "function" ? (files as (a: typeof archObj) => Record<string, string>)(archObj) : files;
    if (!resolved) continue;
    const content = resolved[needle];
    if (typeof content === "string") {
      return { content, from: `plugin:${plugin.name}` };
    }
  }
  return null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const platform = (searchParams.get("platform") ?? "next") as
    | "next"
    | "flutter"
    | "vite";
  const structure = (searchParams.get("structure") ?? "standalone") as
    | "standalone"
    | "monorepo";
  const arch = searchParams.get("arch") ?? DEFAULT_ARCH;
  const appName = searchParams.get("appName") ?? "web";
  const pluginsParam = searchParams.get("plugins") ?? "";
  const plugins = pluginsParam ? pluginsParam.split(",").filter(Boolean) : [];
  const i18n = (searchParams.get("i18n") ?? "none") as "none" | "react-i18next";
  const locales = searchParams.get("locales") ?? "ko,en";
  void locales; // describeTemplate 일관성 — 라우트는 locales 별 content 직접 emit 안 함.
  const path = searchParams.get("path");

  if (!path) {
    return NextResponse.json(
      { error: "missing path" },
      { status: 400 },
    );
  }

  // i18n 파일은 emitI18n 이 런타임에 emit — 디스크에 소스 템플릿 없음.
  // 컨텐츠는 generated 표시만 (platform/arch/locales 조합에 따라 결정).
  if (
    i18n === 'react-i18next' &&
    (path.includes('/i18n/config.ts') ||
     path.includes('/i18n/index.ts') ||
     path.match(/\/i18n\/locales\/[^/]+\/common\.json$/) ||
     path.endsWith('/providers/I18nProvider.tsx'))
  ) {
    return NextResponse.json({
      content:
        "// 이 파일은 sh-ui-cli 가 scaffold 시점에 generated (emitI18n).\n" +
        "// 실제 내용은 platform/arch/locales 조합에 따라 결정.\n" +
        "// 패턴 미리보기: react-i18next + LanguageDetector + HttpBackend 셋업.\n",
      from: "generated:emitI18n",
      truncated: false,
    });
  }

  // 1) 플러그인 emit 파일 우선 (베이스/arch 파일을 덮어쓰는 경우가 있음 — 예: next-intl 의 proxy.ts)
  const pluginHit = resolvePluginFile({
    arch,
    plugins,
    appName,
    structure,
    path,
  });
  if (pluginHit) {
    return NextResponse.json({
      content: pluginHit.content,
      from: pluginHit.from,
      truncated: false,
    });
  }

  // 2) 디스크 파일
  const diskHit = await resolveDiskFile({
    platform,
    structure,
    arch,
    appName,
    path,
  });
  if (diskHit) {
    try {
      const buf = await readFile(diskHit.full);
      // 바이너리/거대 파일은 잘라 보낸다 (이미지 등 가능성).
      const MAX = 64 * 1024;
      const truncated = buf.byteLength > MAX;
      const text = (truncated ? buf.subarray(0, MAX) : buf).toString("utf-8");
      return NextResponse.json({
        content: text,
        from: diskHit.from,
        truncated,
      });
    } catch (e: any) {
      return NextResponse.json(
        { error: `읽기 실패: ${e.message}` },
        { status: 500 },
      );
    }
  }

  // 3) cssFramework 변종 / generator.js helper 가 emit 하는 동적 파일.
  return NextResponse.json({
    content:
      "// 이 파일은 sh-ui CLI 가 생성 시점에 옵션을 보고 동적으로 만드는 변종입니다.\n" +
      "// 예: cssFramework=css-modules 의 page.module.css, 비-Tailwind error.tsx 등.\n" +
      "// 정확한 내용은 실제 `sh-ui create` 실행 후 확인하세요.\n",
    from: "dynamic",
    truncated: false,
  });
}
