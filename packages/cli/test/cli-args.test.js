import { describe, it, expect } from 'vitest';
import { parseArgs } from '../src/create/cli-args.js';

describe('parseArgs', () => {
  it('플래그 없음 → 빈 flags', () => {
    expect(parseArgs(['node', 'create.js'])).toEqual({
      command: 'create',
      flags: {},
      positional: [],
    });
  });

  it('positional name + --platform', () => {
    const r = parseArgs(['node', 'create.js', 'my-app', '--platform', 'next']);
    expect(r.positional).toEqual(['my-app']);
    expect(r.flags.platform).toBe('next');
  });

  it('--structure / --plugins (콤마 분리) / --theme / --yes', () => {
    const r = parseArgs([
      'node', 'create.js', 'x',
      '--platform', 'next',
      '--structure', 'standalone',
      '--plugins', 'sentry,next-intl',
      '--theme', 'eyJsaWdodCI6e30=',
      '--yes',
    ]);
    expect(r.flags).toEqual({
      platform: 'next',
      structure: 'standalone',
      plugins: ['sentry', 'next-intl'],
      theme: 'eyJsaWdodCI6e30=',
      yes: true,
    });
  });

  it('add-app / add-component 서브커맨드 인식', () => {
    expect(parseArgs(['node', 'create.js', 'add-app']).command).toBe('add-app');
    expect(parseArgs(['node', 'create.js', 'add-component', 'button']).command).toBe('add-component');
  });

  it('--plugins 빈 문자열 → 빈 배열', () => {
    const r = parseArgs(['node', 'create.js', '--plugins', '']);
    expect(r.flags.plugins).toEqual([]);
  });

  it('알 수 없는 플래그 → 에러', () => {
    expect(() => parseArgs(['node', 'create.js', '--unknown', 'x']))
      .toThrow(/알 수 없는 플래그/);
  });

  it('--platform 값 누락 → 에러', () => {
    expect(() => parseArgs(['node', 'create.js', '--platform']))
      .toThrow(/--platform 값 필요/);
  });

  it('--platform 값이 잘못된 enum → 에러', () => {
    expect(() => parseArgs(['node', 'create.js', '--platform', 'django']))
      .toThrow(/--platform/);
  });

  it('--help / -h → flags.help = true', () => {
    expect(parseArgs(['node', 'create.js', '--help']).flags.help).toBe(true);
    expect(parseArgs(['node', 'create.js', '-h']).flags.help).toBe(true);
  });
});
