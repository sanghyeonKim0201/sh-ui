/**
 * describeTemplate — "옵션 조합으로 프로젝트 만들면 어떤 파일이 생기는가" 를
 * 실제 생성 없이 계산. apps/docs 의 CreateProjectDialog 가 옵션 토글 시 트리
 * 미리보기를 그리는 데 사용. MCP 툴 `sh_ui_describe_template` 도 동일 함수.
 *
 * 입력: createProject() 가 받는 옵션의 부분집합 + appName(monorepo).
 * 출력: { files: string[], groups: Group[] }
 *   - files: 모든 파일 경로(POSIX) 정렬
 *   - groups: 출처별 분류 — 'base'/'arch'/'plugin-*'/'css'/'transform' 등
 *
 * 정확도 계약:
 * - 베이스 템플릿 + arch 오버레이 + plugin.files + cssFramework 분기 + plugin.transforms
 *   (move/delete) 까지 반영. plugin.transforms 의 replace 는 내용만 바꾸므로 트리 영향 X.
 * - generator.js 가 emit 하는 *파일 경로* 와 1:1 일치하는 것을 목표. content 차이는 무시.
 *
 * 순수성: fs 접근 없음. templateManifest.js (build-template-manifest.mjs 가 emit) 와
 * plugins/architectures 디스크립터만 사용. 브라우저 번들 가능.
 */

import { TEMPLATE_MANIFEST } from './templateManifest.js';
import {
  getArchByName,
  DEFAULT_ARCH,
  isKnownArch,
} from './architectures/index.js';
import { getPluginsByNames } from './plugins/index.js';
import { CSS_FRAMEWORK_DEFAULT } from '../constants.js';

/**
 * @typedef {Object} DescribeOptions
 * @property {'next'|'flutter'|'vite'} [platform]
 * @property {'standalone'|'monorepo'} [structure]   next/vite 일 때만 의미
 * @property {string} [arch]                          next 일 때 'fsd'|'flat'|'mes'
 * @property {string[]} [plugins]                     ['next-intl']
 * @property {'tailwind'|'plain'|'css-modules'} [cssFramework]
 * @property {string} [projectName]
 * @property {string} [appName]                       monorepo 첫 앱 이름. 기본 'web'
 * @property {'none'|'react-i18next'} [i18n]          vite 전용 — react-i18next 셋업
 * @property {string} [locales]                       i18n 활성화 시 생성할 locale 코드 (comma-separated, default 'ko,en')
 */

/**
 * @typedef {Object} Group
 * @property {string} id          'base' | 'arch' | `plugin-${name}` | 'css' | 'transform' | 'monorepo' | 'ui-app' | `app-${id}`
 * @property {string} label       사용자가 보는 한국어 라벨
 * @property {string[]} paths     이 그룹에 귀속된 파일 경로 (정렬)
 */

/**
 * @typedef {Object} DescribeResult
 * @property {string[]} files                전체 파일 경로 정렬
 * @property {Group[]} groups
 */

/**
 * @param {DescribeOptions} [opts]
 * @returns {DescribeResult}
 */
export function describeTemplate(opts = {}) {
  const {
    platform = 'next',
    structure = 'standalone',
    arch: archName = DEFAULT_ARCH,
    plugins: pluginNames = [],
    cssFramework = CSS_FRAMEWORK_DEFAULT,
    appName: rawAppName = 'web',
    i18n = 'none',
    locales = 'ko,en',
  } = opts;

  if (platform === 'flutter') {
    const base = TEMPLATE_MANIFEST['flutter-standalone'].base;
    return finalize([
      makeGroup('base', 'Flutter 베이스', base),
    ]);
  }

  if (platform === 'vite') {
    const safeArchName = isKnownArch(archName) ? archName : DEFAULT_ARCH;
    const archObj = getArchByName(safeArchName);
    if (!archObj.platforms.includes('vite')) {
      throw new Error(`Arch '${safeArchName}' is not compatible with vite.`);
    }

    if (structure === 'standalone') {
      const tpl = TEMPLATE_MANIFEST['vite-standalone'];
      if (!tpl) {
        throw new Error("Template manifest missing entry for 'vite-standalone'.");
      }
      const baseFiles = tpl.base.slice();
      const archFiles = (tpl.arches?.[safeArchName] ?? []).slice();
      const groups = [
        makeGroup('base', '베이스 (vite-standalone)', baseFiles),
        makeGroup('arch', `Arch (${safeArchName})`, archFiles),
      ];
      if (i18n === 'react-i18next') {
        const isFsd = safeArchName === 'fsd';
        const i18nBase = isFsd ? 'src/shared/i18n' : 'src/lib/i18n';
        const providersBase = isFsd ? 'src/app/providers' : 'src/components/providers';
        const localesArr = parseLocalesString(locales);
        const i18nFiles = [
          `${i18nBase}/config.ts`,
          `${i18nBase}/index.ts`,
          ...localesArr.map((lng) => `${i18nBase}/locales/${lng}/common.json`),
          `${providersBase}/I18nProvider.tsx`,
        ];
        groups.push(makeGroup('i18n', `i18n (${i18n})`, i18nFiles));
      }
      return finalize(groups);
    }

    // monorepo — vite app 변형. Next monorepo 브랜치와 동일 구조이지만 vite-app 템플릿
    // 사용 + 플러그인 없음 (vite 는 아직 plugin 시스템 없음).
    const appName = rawAppName || 'web';
    const viteAppTpl = TEMPLATE_MANIFEST['vite-app'];
    if (!viteAppTpl) {
      throw new Error("Template manifest missing entry for 'vite-app'.");
    }
    const groups = [];

    groups.push(makeGroup(
      'monorepo',
      '모노레포 루트',
      TEMPLATE_MANIFEST['monorepo'].base.slice(),
    ));

    const prefix = `apps/${appName}/`;
    groups.push(makeGroup(
      `app-base`,
      `apps/${appName} — vite-app 베이스`,
      viteAppTpl.base.map((p) => prefix + p),
    ));
    const appArchFiles = (viteAppTpl.arches?.[safeArchName] ?? []).map((p) => prefix + p);
    if (appArchFiles.length > 0) {
      groups.push(makeGroup(
        `app-arch`,
        `apps/${appName} — Arch (${safeArchName})`,
        appArchFiles,
      ));
    }

    groups.push(makeGroup(
      'ui-app',
      `packages/ui/ui-apps/ui-${appName}`,
      TEMPLATE_MANIFEST['ui-app-template'].base.map(
        (p) => `packages/ui/ui-apps/ui-${appName}/${p}`,
      ),
    ));

    if (i18n === 'react-i18next') {
      const isFsd = safeArchName === 'fsd';
      const i18nBase = isFsd ? 'src/shared/i18n' : 'src/lib/i18n';
      const providersBase = isFsd ? 'src/app/providers' : 'src/components/providers';
      const localesArr = parseLocalesString(locales);
      const i18nFiles = [
        `apps/${appName}/${i18nBase}/config.ts`,
        `apps/${appName}/${i18nBase}/index.ts`,
        ...localesArr.map((lng) => `apps/${appName}/${i18nBase}/locales/${lng}/common.json`),
        `apps/${appName}/${providersBase}/I18nProvider.tsx`,
      ];
      groups.push(makeGroup('i18n', `i18n (${i18n}, apps/${appName}/)`, i18nFiles));
    }

    return finalize(groups);
  }

  // platform === 'next'
  const safeArchName = isKnownArch(archName) ? archName : DEFAULT_ARCH;
  const archObj = getArchByName(safeArchName);
  const plugins = getPluginsByNames(pluginNames).sort(
    (a, b) => (a.priority ?? 0) - (b.priority ?? 0),
  );

  if (structure === 'standalone') {
    const groups = buildNextGroups({
      prefix: '',
      templateKey: 'nextjs-standalone',
      arch: archObj,
      plugins,
      cssFramework,
    });
    return finalize(groups);
  }

  // monorepo
  const appName = rawAppName || 'web';
  const groups = [];

  groups.push(makeGroup(
    'monorepo',
    '모노레포 루트',
    TEMPLATE_MANIFEST['monorepo'].base.slice(),
  ));

  const appGroups = buildNextGroups({
    prefix: `apps/${appName}/`,
    templateKey: 'nextjs-app',
    arch: archObj,
    plugins,
    cssFramework,
  });
  for (const g of appGroups) {
    g.id = `app-${g.id}`;
    g.label = `apps/${appName} — ${g.label}`;
    groups.push(g);
  }

  groups.push(makeGroup(
    'ui-app',
    `packages/ui/ui-apps/ui-${appName}`,
    TEMPLATE_MANIFEST['ui-app-template'].base.map(
      (p) => `packages/ui/ui-apps/ui-${appName}/${p}`,
    ),
  ));

  return finalize(groups);
}

/** next 베이스 + arch + plugin.files + css 분기 + plugin.transforms 적용. */
function buildNextGroups({ prefix, templateKey, arch, plugins, cssFramework }) {
  const tpl = TEMPLATE_MANIFEST[templateKey];
  if (!tpl) {
    throw new Error(`describeTemplate: 알 수 없는 템플릿 키 '${templateKey}'`);
  }

  const groups = [];

  groups.push(makeGroup(
    'base',
    `${templateKey} 베이스`,
    tpl.base.map((p) => prefix + p),
  ));

  const archFiles = tpl.arches?.[arch.name] ?? [];
  groups.push(makeGroup(
    'arch',
    `${arch.label} 오버레이`,
    archFiles.map((p) => prefix + p),
  ));

  // plugin.files — arch-aware. 정적이면 그대로, 함수면 호출.
  for (const plugin of plugins) {
    const filesField = resolveArchField(plugin.files, arch);
    if (!filesField) continue;
    const paths = Object.keys(filesField).map((p) => prefix + p);
    if (paths.length === 0) continue;
    groups.push(makeGroup(
      `plugin-${plugin.name}`,
      `+ ${plugin.label}`,
      paths,
    ));
  }

  // cssFramework: css-modules 면 page.module.css / error.module.css 추가.
  // generator.js applyCssFrameworkVariant 와 동일한 분기 — intl 활성 시 [locale]/, 아니면 app/.
  if (cssFramework === 'css-modules') {
    const intlActive = plugins.some((p) => p.name === 'next-intl');
    const cssPaths = [];
    const pageDir = intlActive ? 'app/[locale]' : 'app';
    cssPaths.push(`${prefix}${pageDir}/page.module.css`);
    groups.push(makeGroup(
      'css',
      'CSS: css-modules 변종',
      cssPaths,
    ));
  }

  // plugin.transforms — move/delete 만 트리에 영향. replace 는 content-only.
  const moves = [];
  const deletes = [];
  for (const plugin of plugins) {
    const tr = resolveArchField(plugin.transforms, arch);
    if (!tr) continue;
    for (const t of tr) {
      if (t.type === 'move') moves.push({ from: prefix + t.from, to: prefix + t.to });
      if (t.type === 'delete') deletes.push(prefix + t.path);
    }
  }

  if (moves.length || deletes.length) {
    const added = applyMovesAndDeletes(groups, moves, deletes);
    if (added.length) {
      groups.push(makeGroup(
        'transform',
        '플러그인 transform (이동/생성)',
        added,
      ));
    }
  }

  return groups;
}

/** arch-aware 필드 resolve. 함수면 (arch) => value, 정적이면 그대로. */
function resolveArchField(field, arch) {
  if (field == null) return null;
  return typeof field === 'function' ? field(arch) : field;
}

/**
 * 그룹 배열에서 moves/deletes 적용:
 *   - move from→to: 모든 그룹에서 from 제거, to 는 transform 그룹용으로 반환.
 *   - delete path: 모든 그룹에서 path 제거.
 *
 * @returns {string[]} transform 그룹에 추가될 새 경로
 */
function applyMovesAndDeletes(groups, moves, deletes) {
  const added = [];
  for (const { from, to } of moves) {
    const removed = removeFromAllGroups(groups, from);
    // 원본이 어디에도 없었다면 (move 소스가 현재 file-plan 에 없음) — 새로
    // 추가하지 않는다. generator.js 의 `if (await fs.pathExists(fromPath))` 시맨틱.
    if (removed) added.push(to);
  }
  for (const p of deletes) {
    removeFromAllGroups(groups, p);
  }
  return added;
}

function removeFromAllGroups(groups, path) {
  let removed = false;
  for (const g of groups) {
    const idx = g.paths.indexOf(path);
    if (idx !== -1) {
      g.paths.splice(idx, 1);
      removed = true;
    }
  }
  return removed;
}

function makeGroup(id, label, paths) {
  return { id, label, paths: paths.slice() };
}

/** locales (string or string[]) 를 정규화 — generator.js 의 parseLocales 와 동일 규칙. */
function parseLocalesString(s) {
  if (Array.isArray(s)) return s;
  if (typeof s !== 'string') return ['ko', 'en'];
  const arr = s.split(',').map((x) => x.trim().toLowerCase()).filter((x) => /^[a-z]{2}(-[a-z]{2})?$/i.test(x));
  return arr.length > 0 ? arr : ['ko', 'en'];
}

/**
 * 후처리: 그룹 간 dedupe (같은 path 가 여러 그룹에 있으면 마지막 그룹이 소유),
 * 그룹 안에서 path 정렬, 빈 그룹 제거, 전체 파일 목록 계산.
 */
function finalize(groups) {
  const seen = new Set();
  // 뒤에서 앞으로 — 후순위 그룹(plugins/css/transform) 이 dedup 우선권.
  for (let i = groups.length - 1; i >= 0; i--) {
    const kept = [];
    for (const p of groups[i].paths) {
      const finalPath = applyFinalizeRenames(p);
      if (!seen.has(finalPath)) {
        seen.add(finalPath);
        kept.push(finalPath);
      }
    }
    groups[i] = {
      id: groups[i].id,
      label: groups[i].label,
      paths: kept.sort(),
    };
  }
  const cleaned = groups.filter((g) => g.paths.length > 0);
  const files = [];
  for (const g of cleaned) files.push(...g.paths);
  files.sort();
  return { files, groups: cleaned };
}

/**
 * generator.js 의 `finalizeProject` 가 실제 fs 단계에서 적용하는 rename 을
 * file plan 텍스트 레벨에서 mock-apply (v0.96.0+ — 피드백 #3 buglet).
 *
 * 현재 규칙:
 *  - basename 이 정확히 'gitignore' 인 경로 → '.gitignore' 로 prefix dot 추가.
 *    (npm publish 가 .gitignore 를 strip 하므로 템플릿엔 점 없이 두고 emit 후 dot-prefix.)
 *  - 이미 '.gitignore' 인 경로는 그대로.
 *
 * 미래에 다른 fs-level rename 이 추가되면 여기에 같이 등록 (describeTemplate 의
 * file-plan ↔ create_project 의 실제 emit 1:1 정합성 유지).
 */
function applyFinalizeRenames(p) {
  const slash = p.lastIndexOf('/');
  const dir = slash === -1 ? '' : p.slice(0, slash + 1);
  const base = slash === -1 ? p : p.slice(slash + 1);
  if (base === 'gitignore') return dir + '.gitignore';
  return p;
}
