import {
  CREATE_PLATFORMS,
  CREATE_STRUCTURES,
  CSS_FRAMEWORKS_SUPPORTED,
  CSS_FRAMEWORKS_PLANNED,
  I18N_LIBRARIES,
  OBSERVABILITY_PROVIDERS,
} from '../constants.js';
import { allPlugins } from './plugins/index.js';
import { allArchitectures } from './architectures/index.js';

const VALID_PLATFORMS = CREATE_PLATFORMS;
const VALID_STRUCTURES = CREATE_STRUCTURES;
const VALID_PLUGINS = allPlugins.map((p) => p.name);
const VALID_ARCHES = allArchitectures.map((a) => a.name);

const VALUE_FLAGS = ['platform', 'structure', 'plugins', 'theme', 'app', 'css', 'arch', 'port', 'i18n', 'locales', 'observability'];
const BOOL_FLAGS = ['yes', 'help', 'dry-run', 'tauri'];

const SUBCOMMANDS = ['add-app', 'add-component'];

export const parseArgs = (argv) => {
  const rest = argv.slice(2);
  let command = 'create';
  if (rest.length > 0 && SUBCOMMANDS.includes(rest[0])) {
    command = rest.shift();
  }

  const flags = {};
  const positional = [];

  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i];
    if (arg === '-h') {
      flags.help = true;
      continue;
    }
    if (!arg.startsWith('--')) {
      positional.push(arg);
      continue;
    }
    const name = arg.slice(2);
    if (BOOL_FLAGS.includes(name)) {
      // dry-run 은 dryRun 으로 캐멀 케이스
      const key = name === 'dry-run' ? 'dryRun' : name;
      flags[key] = true;
      continue;
    }
    if (!VALUE_FLAGS.includes(name)) {
      throw new Error(`알 수 없는 플래그: --${name}`);
    }
    const value = rest[i + 1];
    if (value === undefined || value.startsWith('--')) {
      throw new Error(`--${name} 값 필요`);
    }
    i++;
    if (name === 'plugins') {
      const list = value === '' ? [] : value.split(',').map((s) => s.trim()).filter(Boolean);
      for (const p of list) {
        if (!VALID_PLUGINS.includes(p)) {
          throw new Error(
            `알 수 없는 플러그인: ${p} (지원: ${VALID_PLUGINS.join(', ')})`,
          );
        }
      }
      flags.plugins = list;
      continue;
    }
    if (name === 'platform' && !VALID_PLATFORMS.includes(value)) {
      throw new Error(`--platform 은 ${VALID_PLATFORMS.join('/')} 중 하나여야 함 (받은 값: ${value})`);
    }
    if (name === 'structure' && !VALID_STRUCTURES.includes(value)) {
      throw new Error(`--structure 는 ${VALID_STRUCTURES.join('/')} 중 하나여야 함 (받은 값: ${value})`);
    }
    if (name === 'arch' && !VALID_ARCHES.includes(value)) {
      throw new Error(
        `--arch 는 ${VALID_ARCHES.join('/')} 중 하나여야 함 (받은 값: ${value})`,
      );
    }
    if (name === 'i18n' && !I18N_LIBRARIES.includes(value)) {
      throw new Error(`--i18n 은 ${I18N_LIBRARIES.join('/')} 중 하나여야 함 (받은 값: ${value})`);
    }
    if (name === 'observability' && !OBSERVABILITY_PROVIDERS.includes(value)) {
      throw new Error(`--observability 는 ${OBSERVABILITY_PROVIDERS.join('/')} 중 하나여야 함 (받은 값: ${value})`);
    }
    if (name === 'css' && !CSS_FRAMEWORKS_SUPPORTED.includes(value)) {
      // planned 값은 '곧 옵니다' 신호로 분기 — 사용자 의도가 더 명확히 전달.
      if (CSS_FRAMEWORKS_PLANNED.includes(value)) {
        throw new Error(
          `--css='${value}' 는 곧 지원 예정. 현재는 ${CSS_FRAMEWORKS_SUPPORTED.join(', ')} 만 가능.`,
        );
      }
      throw new Error(
        `--css 는 ${CSS_FRAMEWORKS_SUPPORTED.join('/')} 중 하나여야 함 (받은 값: ${value})`,
      );
    }
    flags[name] = value;
  }

  return { command, flags, positional };
};
