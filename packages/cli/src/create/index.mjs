// sh-ui create — 프로젝트 스캐폴드 진입점. bin/sh-ui.mjs 의 `create` 서브커맨드에서 호출.

import { parseArgs } from './cli-args.js';
import { createProject, addApp, addComponent } from './generator.js';
import { allPlugins } from './plugins/index.js';
import { allArchitectures, getArchesForPlatform } from './architectures/index.js';
import { CREATE_PLATFORMS, CREATE_STRUCTURES, CSS_FRAMEWORKS_SUPPORTED } from '../constants.js';
import { THEME_PRESET_NAMES } from './theme/presets.js';

const PLUGIN_NAMES = allPlugins.map((p) => p.name);
const PLUGINS_LIST = PLUGIN_NAMES.join(', ');
const ARCH_NAMES = allArchitectures.map((a) => a.name);
const ARCHES_LIST = ARCH_NAMES.join('|');
const NEXT_ARCHES = getArchesForPlatform('next').map((a) => a.name).join(', ');
const THEME_PRESETS_LIST = THEME_PRESET_NAMES.join('|');

export const HELP_TEXT = `sh-ui create — sh-ui 프로젝트 스캐폴드 (Next.js / Flutter)

사용법:
  sh-ui create [name] [options]
  sh-ui create add-app [name] [--port <n>] [--platform <next|vite>] [--plugins ..] [--theme ..] [--css ..] [--i18n <react-i18next|none>] [--locales ko,en]
  sh-ui create add-component <name> [--app <name>]

옵션:
  --platform <${CREATE_PLATFORMS.join('|')}>          타겟 플랫폼
  --structure <${CREATE_STRUCTURES.join('|')}>  Next.js 프로젝트 구조 (next 일 때)
  --arch <${ARCHES_LIST}>                  프로젝트 아키텍처 — 폴더 구조/import alias 컨벤션. next 에서 사용 가능: ${NEXT_ARCHES}. 기본 fsd
  --plugins <a,b>                    플러그인 (${PLUGINS_LIST}). 미지정/"" → 없음
  --theme <preset|base64>            프리셋 이름(${THEME_PRESETS_LIST}) 또는 playground base64. 선택
  --css <${CSS_FRAMEWORKS_SUPPORTED.join('|')}>                        CSS 프레임워크. base 파일까지 분기 emit (tailwind/plain/css-modules)
  --i18n <react-i18next|none>        vite 전용 — react-i18next 셋업 emit (i18n config + I18nProvider). 기본 none (v0.92.0+)
  --locales <ko,en>                  i18n 활성화 시 생성할 locale 코드 (comma-separated). 기본 'ko,en'
  --yes                              디렉토리 덮어쓰기 + 모노레포 기본값 자동 채택
  --dry-run                          파일을 쓰지 않고 작성될 파일 목록만 출력
  -h, --help                         이 도움말

예 (대화형):
  sh-ui create

예 (비대화형 / 에이전트 / CI):
  sh-ui create my-app --platform next --structure standalone --yes
  sh-ui create my-app --platform next --structure monorepo --plugins ${PLUGIN_NAMES.slice(0, 3).join(',')} --yes
  sh-ui create my-app --platform next --structure standalone --arch flat --yes
  sh-ui create my-app --platform next --structure standalone --theme rose --yes
  sh-ui create my-app --platform flutter --yes

비대화형 환경(TTY 없음)에서는 누락된 필수 인자가 있으면 prompt 대신 에러로 종료한다.
`;

/**
 * @param {string[]} rest - sh-ui create 뒤에 오는 인자 배열 (예: ["my-app", "--platform", "next"])
 */
export async function runCreate(rest) {
  // parseArgs 가 process.argv 형태(앞 두 개는 스킵)를 기대하므로 더미 두 개를 prepend.
  let parsed;
  try {
    parsed = parseArgs(['node', 'sh-ui', ...rest]);
  } catch (e) {
    console.error(`❌ ${e.message}`);
    console.error(`\n도움말: sh-ui create --help`);
    process.exit(1);
  }

  const { command, flags, positional } = parsed;

  if (flags.help) {
    console.log(HELP_TEXT);
    return;
  }

  if (command === 'add-app') {
    await addApp({
      name: positional[0],
      port: flags.port,
      plugins: flags.plugins,
      theme: flags.theme,
      css: flags.css,
      platform: flags.platform,
      i18n: flags.i18n,
      locales: flags.locales,
    });
  } else if (command === 'add-component') {
    // 호환 별칭 — 신규 진입점은 `sh-ui add <name>` (bin/sh-ui.mjs 가 walk-up 으로 라우팅).
    await addComponent({
      names: positional.filter(Boolean),
      app: flags.app ?? null,
    });
  } else {
    await createProject({
      name: positional[0],
      platform: flags.platform,
      structure: flags.structure,
      plugins: flags.plugins,
      arch: flags.arch,
      theme: flags.theme,
      css: flags.css,
      i18n: flags.i18n,
      locales: flags.locales,
      // create 컨텍스트에서는 --app 이 첫 앱 이름 (monorepo). 같은 플래그가
      // add-component 컨텍스트에서는 대상 앱 선택 — 의미가 컨텍스트마다 다름.
      appName: flags.app,
      port: flags.port,
      yes: flags.yes,
      dryRun: flags.dryRun,
    });
  }
}
