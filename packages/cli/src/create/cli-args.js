import { CREATE_PLATFORMS, CREATE_STRUCTURES } from '../constants.js';
import { allPlugins } from './plugins/index.js';

const VALID_PLATFORMS = CREATE_PLATFORMS;
const VALID_STRUCTURES = CREATE_STRUCTURES;
const VALID_PLUGINS = allPlugins.map((p) => p.name);

const VALUE_FLAGS = ['platform', 'structure', 'plugins', 'theme', 'app'];
const BOOL_FLAGS = ['yes', 'help', 'dry-run'];

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
    flags[name] = value;
  }

  return { command, flags, positional };
};
